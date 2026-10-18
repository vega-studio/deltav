---
name: plan-go-quick
description: Fast, less-safe variant of /plan-go — runs a plan with the same story lock, review gate, worktree and `tk.ts next` queue, but steps and barriers run `bun run typecheck` only and the test suites once, on the master; every `done` is recorded as quick-mode. A regression can reach the sprint's branch before the master catches it. Use when the user says "/plan-go-quick" or "run the plan quickly". Argument: as /plan-go — a story name or master key.
---

Base directory for this skill: `.claude/skills/plan-go-quick`

# Plan Go — quick

`/plan-go` with the brakes eased. **Read `.claude/skills/plan-go/SKILL.md`
first and follow it in full** — this file is a list of overrides, not a
standalone procedure. Everything plan-go says about finding and taking the
story and the review gate (§1), the worktree, `tk.ts sync` and the teardown
(§2), acquiring tickets through `tk.ts next` (§3 steps 1–3, 5), the triage
of failing tests (plan-go §4b — wherever a quick run runs tests: the master,
and a step's own changed test file), the
story-taken-away and other stop conditions (§5) and the finish report (§6)
applies **unchanged**. Only the sections below replace their plan-go
counterparts.

## What quick mode is, and is not

Quick mode cuts what is **ours to cut**: how much verification runs at each
gate, how often agents report, how many retries a failing ticket gets, and
how much the orchestrator narrates. It changes nothing the server or the
project enforces:

* The story lock and the plan-review gate stand. An `in_review` master is
  never taken, never transitioned; `tk.ts next` is still the only source of
  tickets; no `claim` around an empty queue, no moving tickets to `todo` (a
  run plan arrives in `todo` through `plan release --run`, called by
  /plan-run or /plan-run-quick; this skill still never moves a ticket to
  `todo`).
  The story-wide human hold stands too: an open question pauses a quick run
  exactly as it pauses any other, and plan-go's *Waiting on external* stop
  applies unchanged (an open external ticket holds only the steps it blocks).
* `tk.ts push` is still the only path to the sprint's branch, and the
  branch is still read from the sprint (`tk.ts me`), never assumed; agents
  still commit only their own ticket's files, never create branches, never
  touch the project root.
* `done` tickets are never reopened; regressions become `fix` tickets.
* The token is never printed.
* **Quick never means touching the live database.** Tests run against
  their own ephemeral PostgreSQL clusters; nobody in a quick run executes
  `bun run db:reset`, `src/db/migrate.ts --reset` or a seed script against
  the server the PAT talks to. A ticket asking for it is a plan defect:
  skip that line and `tk.ts comment <master>` the defect.

What quick mode costs: a step is marked `done` on a typecheck alone, so a
broken test or an API regression travels through every wave and is caught
only by the master's single full `bun test` at the very end — or not at
all, for what no test covers (the integration suite, when a `/plan-quick`
master left it out). Say this to the user in the opening summary and again
in the finish report; never present a quick run as a verified one.

## Overrides to plan-go §1 (find and take)

* **Step 7 summary** shrinks to one block: story and owner, master key and
  title, the `Mode:` footer line and the layout in words for that shape
  (`"<n> steps in <k> waves: … (barriers per wave)"`, `"<n> steps in 1
  wave, no barrier"`, or `"single ticket: the master is the work"`), counts
  by status, sprint, the `Points:`/`Tokens:` lines, and one sentence:
  "quick mode — steps and barriers typecheck only; the test suites run once
  on the master" (for a single-ticket plan: "quick mode — the master is
  dispatched to one agent, which runs typecheck plus its named test files;
  nothing runs the full `bun test`").
* Everything else in §1 — the gate order (check `master.status`, then
  `story take`), unreleased plans, `done`/`cancelled`/`in_review` handling,
  dependent plans, the human hold in step 8 — is unchanged. None of it is a
  check that costs anything; all of it is the server's rule.
* Exit 12 (the auto worker is halting) is handled exactly as in the original skill.

## Overrides to plan-go §3 (the loop)

Steps 1–3 and 5 of the loop are unchanged (report, orphans, acquire until
exit 5, wait for the whole batch). Step 4's dispatch rules change:

* **step / fix** → the prompt is **the Quick Agent protocol below, pasted
  verbatim, instead of plan-go §4's prompt**, and this sentence in place of
  plan-go's per-kind one: "Quick mode: run only the reduced verification
  the protocol names; the ticket's own Verification section is not run
  except as the protocol says."
* **barrier (`wave-N`)** → only when the plan has barriers (`Mode: … ·
  barriers: per wave`; a single-wave plan and a single-ticket plan have
  none, and `next` never hands one out). Do **not** run the barrier's
  checklist. Run, in the worktree, exactly:

  ```
  cd /tmp/wt-<master> && bun run typecheck
  ```

  Green → `tk.ts comment wave-N "quick mode: typecheck green at <HEAD>;
  checklist deferred to the master"` and
  `tk.ts done wave-N -m "quick: typecheck only" --tokens-in <n> --tokens-out <n> --note "estimated; quick"`.
  Red → one `tk.ts fix <master> wave-N --class story|technical --title "<what>" -`
  per distinct error (body: the compiler output and the files, nothing more;
  its `## ` headings become the fix ticket's sections), then
  `tk.ts fail wave-N "<n> fix tickets filed: <keys>"`. The fixes come out of
  `next` on the following pass. The class is the short half of plan-go §4b:
  a typecheck error is **never** `business-logic` — it is `story` when the
  file with the error is the plan's own (a file a step of the plan wrote or
  changed, or a story test: `tk.ts plan tests <master> <file>`) and
  `technical` otherwise. A quick barrier therefore never files a question.
* **master, `mode` `full` or `quick`** (the `master.mode` field of
  `next --json`, the same value as the `Mode:` footer line) → it becomes
  ready when the last barrier — or, with no barrier, every step — is
  `done`, and this is the **one place the full checks run**. Execute the
  plan-wide verification from the master's description **plus** every wave
  barrier's checklist that quick mode skipped (they are in the barrier
  descriptions; when the plan had no barrier, the wave's test files are the
  ones its steps named in their `verified:` clauses — run those), in the
  worktree. Dedupe: typecheck once, each test file
  once — the full `bun test` is the master's **final item, always**: that
  one run covers every `bun test <file>` a barrier listed, so run the sweep
  last and nothing under it. Run the named suites the plan wrote (an
  integration file, `gen-api-docs --check`), no more; a master whose
  description predates the rule and names only its own test files still
  gets the full sweep as its last item — say so in the comment.
* **master, `mode` `single`** → **the master is the work; the orchestrator
  never verifies it itself.** Dispatch **one** general-purpose Agent with
  the **Quick Agent protocol** below verbatim, substituting `<key>` = the
  master key and `<master>` = the master key too, plus this sentence: "This
  ticket is a single-ticket plan: its description is the implementation
  brief; implement it, run its Verification section (typecheck plus the
  named test files — never the full `bun test`), commit only your files
  and finish with `tk.ts done <key> -m "quick: …; verified: …" --tokens-in
  … --tokens-out … --note "estimated; quick"`." The agent's `done` pushes
  and closes the master. When it reports done, run **no** checks of your
  own: read `tk.ts plan status <master>` to confirm the master is `done`,
  then `tk.ts story release <story>`, `tk.ts sync <master>` from the
  project root and the teardown from plan-go §2 step 5. A single master
  that `fail`s is a step for retry purposes (§5 below); a regression found
  in it later is `tk.ts fix <master> master …` as today.
* **The landing check applies unchanged, at the same place** — plan-go §2
  step 5: after the master is `done`, from the worktree, before
  `tk.ts story release` and `tk.ts sync`, on both paths above (the single
  master and the verified one). Quick mode skips checks of the code, never
  this one: it is what proves the run's commits reached the sprint's
  branch.

  **Public summary review.** Before the master is closed (full/quick) or
  before the Landing check (single), read `.claude/skills/plan-go/SUMMARY.md`
  and do what it says.

  **Landing check.** Before the run finishes and hands its story back, prove
  that every finished ticket is on the sprint's integration branch: run `tk.ts
  plan landed <master>` from the worktree. It fetches that branch once and is
  otherwise read-only: one line per `done` ticket (`landed`, `not landed` with
  the missing commit, or `no commit`) and a last line `Landed: <n> of <m> done
  tickets on <remote>/<branch>`. Exit 0 → continue. Exit 9 → for each `not
  landed` ticket run `tk.ts push <key>` from the worktree (exit 6: resolve the
  conflict, re-run that ticket's verification, `tk.ts push <key>` again), then
  `tk.ts plan landed <master>` again. Still exit 9 after two rounds → file
  `tk.ts fix <master> master --class technical --title "Not landed: <keys>" -`
  naming the tickets and their missing commits, and stop as for any failed
  step: the story is not released as done, `tk.ts sync` and the teardown are
  not run, and the worktree stays. Exit 7 (the sprint has no repository) →
  there is no branch to land on; say so in the report and continue. Only
  finished tickets are pushed this way: unfinished work is never pushed, and
  nothing is reset, cleaned or stashed to make the check pass.

  When the run stops before the master is `done` the check is **report only**,
  as plan-go §5 says: run it once, put its `Landed:` line in the report and
  push nothing.
  * All green → `tk.ts comment <master>` with the per-check pass list and
    the HEAD, then
    `tk.ts done <master> -m "<summary>; quick mode: full checks ran only here" --tokens-in <n> --tokens-out <n> --note "estimated; quick"`,
    `tk.ts story release <story>`, `tk.ts sync <master>` from the project
    root and the teardown from plan-go §2 step 5 (its two emptiness checks
    stay — they are what keeps commits from being lost, and they cost
    nothing).
  * Anything red → this is where quick mode pays its bill. **Triage every
    failing test by plan-go §4b** — the master is the first place a quick
    run executes the tests the plan did not write, so this is where foreign
    failures show up. One
    `tk.ts fix <master> master --class story|technical --title "<what>" -`
    per distinct failure (body: the exact failing command and output, the
    files, the class and one line of why, what green looks like), one
    `tk.ts ask <master> master --class business-logic --title "<the rule in question>" -`
    per distinct rule (the five sections of §4b — never shortened, quick or
    not), then
    `tk.ts fail <master> "<n> fix tickets filed: <keys>; questions: <keys>"`
    using the master's **key** (`fail` resolves keys, not plan refs). The
    fixes block the master and come out of `next`; when they are `done` the
    master is ready again and the full run repeats. Keep the story taken
    meanwhile. A business-logic question **stops the run** as §4b says: the
    story is paused, fixes included, until a person answers; the next
    `/plan-go-quick` finds the answer under `answersToApply` in
    `tk.ts ready <master> --json` and files it as a
    `tk.ts fix <master> master --class story --answers <question ref> …`
    before the master's run repeats.
* **Batch digest** (step 6) stays one line per ticket: `<key> done|failed|
  asked — <ten words>`. No prose between batches.

## Overrides to plan-go §5 (retries)

* A step or fix that `fail`s is re-dispatched **once** with the failure
  visible via `show`, as in plan-go. The second failure files the
  `tk.ts ask <master> <key> --title "Step keeps failing: <key>" -` question
  as plan-go does — but with a short body: the two failure comments verbatim
  and one line of diagnosis. No option analysis.
* A barrier failing **twice** (not three times) → `ask`. A quick barrier is
  a typecheck; if two rounds of fixes cannot make it compile, a human should
  look.
* The master failing its full run **twice** (two rounds of fix tickets) →
  `tk.ts ask <master> master --title "Plan-wide checks keep failing" -` with
  the red output of both rounds, and stop. Do not lower the master's checks
  to get it through — the master is the only real verification a quick run
  has. A round that ended in a **business-logic question** (plan-go §4b) is
  not one of the two: the master did not fail, a person owes the story a
  decision — and the same holds for a step's or a single master's "fails
  twice".
* A **single-ticket master** (`mode` `single`) is a step for retry
  purposes: the agent's `fail` releases it to `todo`; re-dispatch it once
  with the failure visible via `show`; failing **twice** →
  `tk.ts ask <master> master --title "Step keeps failing: <master>" -`
  (the two failure comments verbatim, one line of diagnosis) and stop.
  Never implement or verify it yourself in the agent's place.
* Everything else in §5 — story taken away, `handler_locked` and friends,
  no sprint repository, dependent plans, never claiming human tickets,
  never reopening `done` — is unchanged.

## Quick Agent protocol (replaces plan-go §4)

It replaces `plan-go/AGENT.md`, which a quick agent never reads: paste
this block **verbatim** into every step/fix agent prompt (substitute
`<key>`, `<master>` and `<worktree>`):

```
You are working ticket <key> of plan <master> in QUICK MODE, in the Bun
project checked out at <worktree>. That worktree is your working directory:
run every command as `cd <worktree> && …` (a detached checkout of the
sprint's integration branch with its own .env and a node_modules symlink).
Never edit, commit in, or run anything from the main project root — the
user is working there. All commands are `bun .claude/skills/plan-steps/tk.ts …`;
never print the PAT.
- `tk.ts show <key> --plan <master>` is your whole brief: the description
  and the ticket's body sections (reassembled under their `## ` headings),
  earlier comments, blockers, and the text and answers of every question you
  were blocked by. Run it first. `tk.ts show <master> --brief` has the
  plan-wide design decisions — read it only if the brief refers to them,
  and skip it when `<key>` is the master itself.
- `tk.ts heartbeat <key> "started"` once when you begin. No other
  heartbeats, and no `tk.ts comment` before the end — the `done`/`fail`
  message is your report.
- Stay inside this ticket: its "Out of scope" section is binding. Do not
  touch other tickets' files.
- QUICK VERIFICATION. Do not run the ticket's Verification section. Run
  exactly: `bun run typecheck` — plus `bun test <file>` for any test file
  under `test/` you created or edited in this ticket (your deliverable
  includes that file, so it has to pass). Nothing else: no other test
  files, no full `bun test`, no `test/integration/` run, no client build,
  no dev server and no screenshots unless the ticket's whole point is the
  picture. NEVER run `bun run db:reset`, `src/db/migrate.ts --reset` or a
  seed script — tests bring their own ephemeral database, and the live one
  is not yours to touch in any mode.
- Commit only the files you changed, in the worktree, on its detached HEAD
  (`git add <files> && git commit -m "<key>: <summary>"`); never other
  agents' files, never the whole tree, never a new branch. `tk.ts done`
  pushes for you through `tk.ts push`, which reads the branch from the
  sprint — you never name it (merge-and-retry; exit 6 is a merge conflict:
  resolve, re-run `bun run typecheck`, `tk.ts push <key>` again).
- Need a human decision to continue? `tk.ts ask <master> <key> --title
  "<question>" -` (short heredoc: context, options, your default; its `## `
  headings become the question's sections), then
  `tk.ts fail <key> "waiting on <question-key>"` and stop. This pauses the
  whole plan — prefer your recommended default and note it in the done
  message unless the choice is genuinely irreversible.
- A test fails (your own test file, or one you ran)? Class it first:
  `tk.ts plan tests <master> <file>` → `story` or `foreign`. `story` → fix
  it here. `foreign` and mechanical → `technical`: fix it here when the fix
  is that test file or a file you own, else
  `tk.ts fix <master> <key> --class technical --title "<what>" -` and
  `tk.ts fail <key> "fix ticket filed: <key>"`. `foreign` and asserting a
  rule your change breaks, undecided in `tk.ts show <master> --brief` →
  `business-logic`: never edit that test, never take a default —
  `tk.ts ask <master> <key> --class business-logic --title "<the rule>" -`
  (sections `## Failing tests`, `## Rule the tests protect`,
  `## What the story changed`, `## Options`, `## Default if unanswered`),
  then `tk.ts fail <key> "waiting on question-NN"`. In doubt: `business-logic`.
  A typecheck error is never `business-logic`.
- Found something outside this ticket a person should know about and can
  still finish? `tk.ts report file --about <key> -` (short heredoc,
  `# Report — <title>`) and carry on — a report is story-less and pauses
  nothing; only `ask` does.
- Typecheck green (and your own test file, if any):
  `tk.ts done <key> -m "quick: <what changed, files>; verified: <exactly
  which commands ran>" --tokens-in <n> --tokens-out <n> --note "estimated; quick"`.
  The `verified:` clause is mandatory — it is how the master and the user
  see what was NOT run.
- Cannot finish, or typecheck stays red: `tk.ts fail <key> "<reason, exact
  error>"`. Never mark a ticket done with partial work or a red typecheck.
- A `package.json` change is installed with `bun install` from the main
  project root, not from the worktree.
- Report back in five lines or fewer: files changed, commands run and their
  result, deviations, the final tk.ts command.
```

## Overrides to plan-go §6 (finish)

Same report, two additions at the top:

* The first line is `quick mode`, the plan's `Mode:` line, and what that
  means for this run: which waves were passed on typecheck alone (or `no
  barrier, single wave`), and whether the master's full run happened
  (green / red with the fix keys / never reached). If the run stopped
  before the master, say plainly that **nothing in the sprint's branch from
  this run has been verified beyond compiling** and give the commands a
  human should run in the worktree or root (`bun run typecheck`, the plan's
  test files, `bun test`). For a single-ticket plan there is no full run at
  all: quote the master's `verified:` clause and tell the human to run
  `bun test` afterwards.
* The list of `done` tickets whose `verified:` clause names typecheck only,
  so the user can spot-check the risky ones — a single master's `verified:`
  clause is listed here like any step's.

Everything else — worktree kept or removed and why, the `Landed:` line of
the landing check, the `tk.ts sync` line,
story ownership, master status, dependent plans, `Points:` / `Tokens:`,
per-wave outcome, files touched, open questions, fix tickets, plan defects
— as plan-go §6 lists it. Keep it tight; the point of this mode is to be
done sooner, not to write less honestly.
