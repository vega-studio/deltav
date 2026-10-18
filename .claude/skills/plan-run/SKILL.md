---
name: plan-run
description: Plans and executes a small request in one go — files it as a single-ticket plan marked `(run)`, releases it with `tk.ts plan release --run` WITHOUT the Confirm plan gate, executes it as /plan-go would and files one review item for a person. Refuses what is not a one-sitting change; plans a queued request only when /plan-steps hands it one labelled `plan-run`. Use when the user says "/plan-run X" or "plan and run X". Argument: the prompt.
---

Base directory for this skill: `.claude/skills/plan-run`

# Plan Run

`/plan-steps` and `/plan-go` in one sitting, for a change small enough to be
one ticket. **This file is a list of overrides, not a standalone procedure**
over two files:

1. `.claude/skills/plan-steps/SKILL.md` — its **§0** (the ticketing bridge),
   **§1** (understand the request), **§2b** (the single-ticket plan) and
   **§4** (release), with the overrides in sections 2–4 below. Entered from
   `/plan-steps` (a pulled request labelled `plan-run` or `plan-run-quick`),
   that file is already in this session — do not read it again. Invoked
   directly, read it first and follow it in full.
2. `.claude/skills/plan-go/SKILL.md` — read it once, when section 5 starts,
   and follow it in full.

Section 6 (the review item) carries its own rules; nothing else is read.

The helper script is `.claude/skills/plan-steps/tk.ts`; this skill ships
none of its own.

## 1. What this is, and what it never changes

A **run plan** is a single-ticket plan that skips one thing: the wait for a
human's **Confirm plan**. The approval moves from before the work to after
it — a person reviews the result through one review item instead of the plan
through the master. That is the whole trade, and it is only acceptable
because the work is one agent's one sitting. Say so in the opening line to
the user ("this runs without Confirm plan; you review it afterwards") and
again in the report.

Everything else stands exactly as the two skills above write it:

* **`plan revise` still runs first** (plan-steps §1, branch 0). When it
  exits 0 a plan a human sent back is waiting, and it still wins: **stop
  and say so** — name the plan and tell the user to run `/plan-steps`,
  which revises it. A run skill does not revise plans and does not plan
  around one that is waiting.
* The **story lock**, the **session id** tk.ts reports by itself (never
  invented), **nothing on the file system** and **the token never printed**
  stand as plan-steps §0 and plan-go write them.
* **Exit 12 — the auto worker is halting.** A manager pressed *Halt after
  current ticket*: the server hands this token no further ticket. It is not a
  failure and not something to retry. Take nothing more; let every agent
  already dispatched finish its ticket normally (`done`, `fail`, comments and
  pushes all still work); then stop. **Do not** release the story, do not run
  `tk.ts sync`, do not file a fix or a question about it, and do not move any
  ticket you did not finish. Report "halted by the auto worker" with the
  tickets finished and the tickets left; the story stays with this token and
  is resumed with `/plan-resume` after a manager presses Resume.
  In a run it comes from `tk.ts next` after `plan release --run` — `plan
  open` is not stopped by a halt (its new story is empty, and the server
  lets a halting worker's token take an empty story), and neither is the
  release: stop — the plan **stays released**, owned by this token, the
  master stays `todo`, no review item is filed, and the run is picked up
  with `/plan-resume` after a manager presses Resume (plan-go §5). Should
  `plan open` exit 12 all the same (a server older than this rule), stop
  and report, with no second `plan open`.
* **`tk.ts next` is the only source of tickets.** No `claim` around an
  empty queue, and no ticket is ever moved to `todo` by hand — `plan
  release --run` is the one thing that starts a run plan.
* The **push protocol** is plan-go's; where the work integrates is read
  from the sprint (`tk.ts me`) — never named here, in the plan or in the
  review item.
* **A run skill never files a human question** (`plan question`, `ask`): a
  question holds the whole story's queue, which is the queue this run
  needs. A decision only a person can take means the request is not a run
  plan (section 2). This is a rule of the **planning** and of the
  orchestrator; the one question a run plan can still end on is filed
  during execution, by the dispatched agent, for a `business-logic` test
  failure (section 5).

## 2. Route

Run plan-steps' router (§1 *Route the request*) with one legal outcome:
**SMALL**. From the subject alone, before `me` and before `plan open`, the request must pass every line of the SMALL test:

* one agent finishes it in one sitting;
* at most ~3 source files in one area, plus their tests;
* no new route, schema, migration or API contract;
* no authorization, work-queue or concurrency topic (PAT scopes, tenancy,
  the story lock, the handler rule, the hand-out rules);
* no decision a human must make;
* the covering test file is obvious.

**Entered from `/plan-steps`** — the auto worker's path. The subject is a
planning request that `/plan-steps` pulled with `plan next`, that a person
labelled `plan-run` — their explicit request for an unattended run — and
that passed the test above there (plan-steps §1 *The mode label picks the
strategy*). The refusal below is already decided: `/plan-steps`
**downgrades instead of refusing** a labelled request that fails the test,
and that one never reaches this file. Start at section 3 with the request's
key; the description `plan next` printed is the prompt. A run skill itself
**never** calls `plan next`: an unlabelled request, or one with another
label, was filed for a planner and a human's confirmation.

**Invoked directly**, the subject is the skill arguments or, when they are
empty, a clear request in the conversation; with neither, stop and ask for
a prompt.

**Not SMALL → stop before `plan open`.** File nothing — no story, no
planning ticket, no master, no question — and tell the user, in two lines,
which line of the test failed and that the request belongs to
`/plan-steps <prompt>` (or `/plan-quick <prompt>`), where a human confirms
the plan before it runs. A tier the user names in the prompt does not
override this: "/plan-run" asked for a full plan is still refused.

## 3. Plan

plan-steps §1 and §2b, in their order, with these differences:

* **`me`**, then **open** with scope `S` and the `(run)` suffix — it is
  part of the story name, so every list shows how the plan started:

  ```sh
  bun .claude/skills/plan-steps/tk.ts plan open --scope S - <<'DOC'
  # <goal in a few words> (run)

  ## Original prompt

  > <the prompt, verbatim, as a blockquote>
  DOC
  ```

  For a request handed over by `/plan-steps` (section 2) the same command
  carries the request — `plan open --scope S --request <key> -` — with the
  same document, and the `## Original prompt` blockquote is the request's
  description, quoted verbatim (plan-steps §1 *Pulling the subject from
  ticketing*). The master document then keeps the
  `**Planning request:** TICK-nn` line (plan-steps §2 item 1b) directly
  under the title and **above** the `**Mode:**` line. `plan release --run`
  (section 4) hands the request back to its human for review exactly as an
  ordinary release does. A request filed **without a title** is named by
  this `plan open --request` after the plan, without the `(run)` suffix
  (plan-steps §1 *The title line*).

  The limit of 256 characters on a title (plan-steps §0) counts the suffix.

* **`plan list`** (dependencies), **`plan calibrate`** (record its output)
  and the **research** — unchanged. Read only the files the change touches
  and their tests; that is all a SMALL change needs.
* **The master document** is §2b's, section for section, written with
  `plan master <master> -`, with two changes:
  1. the header lines under the title are, in this order and exactly:

     ```
     **Mode:** single — the master is the work; no steps, no barrier
     **Run:** review — released without Confirm plan; one review item for a human after done
     **Effort:** small — <one clause on why this level>
     **Estimated scope:** S|M — <rough description>
     ```

     The `**Effort:**` line is plan-steps §2 item 1d (A planner chooses at most High by its own judgement; Very High (the only effort that runs on Fable) is a person's choice. The server applies a person's request effort to the master.), written after
     `**Run:**`, with one difference: a run plan defaults to `small` when
     nothing suggests otherwise. As there, an effort a person set on the
     request or named in its text wins, and one the auto worker estimated
     is the default.

     tk.ts parses the first word of `**Run:**` (`review` here) — it is
     what `plan release --run` requires, what `plan status` prints and
     what tells a later session that a review item is owed;
  2. the `## Execution instructions` sentence reads: `/plan-run` executes
     this plan itself right after release — the ticket is dispatched to
     one agent, which commits only its files and `tk.ts done` pushes; an
     interrupted run continues with `/plan-resume`.

  Everything else is §2b's, section for section; the title keeps `(run)`.
* **Two planning notes**, as §2b; the first opens with
  `**Tier:** SMALL (run) — <reasons>`.
* **No question, ever** (section 1). Decide what the codebase and the
  request let you decide and record it in the document.

**When research shows it is not a run plan after all** — a fourth area, a
schema or contract change, a decision only a person can take, or `plan
list` shows it needs a plan that is not yet `done` (it could not run now
anyway) — do **not** release with `--run`. Finish it as a normal plan per
plan-steps §2b's last paragraph: write the master **without** the
`**Run:**` line (single, quick or full as the work turned out; retitle
through `plan master` — the story keeps its `(run)` name, tk.ts warns, say
so), file whatever steps and questions that tier calls for, release
**without** `--run`, skip sections 5 and 6, and report that the plan is
parked and now needs **Confirm plan** like any other.

## 4. Release

```sh
bun .claude/skills/plan-steps/tk.ts plan release <master> --run --tokens-in <N> --tokens-out <M> --note estimated
```

`--run` is accepted only for a `**Mode:** single` plan whose master carries
a `**Run:**` header, with no open question ticket and without `--hold`. It
does everything a release does (points estimate, the planning usage, the
planning ticket closed, the ticket table commented on the master) and
then, **instead of parking the master in review**: comments
`Plan run — released without Confirm plan (…)` on the master — the bypass,
where a person can see it — moves the master to `todo` and **keeps the
story with this PAT**.

Check the printed table before going on:

* `planning` is `done`;
* `master` is **`todo`**, handler `agent`, with no blockers — unassigned, or
  held by this token while it keeps the story (a run plan keeps its story, so
  its assignee reads `<name> (story)`);
* the footer reads `Plan review: skipped — run plan (review item after done)`;
* the next footer line reads `Mode: single · barriers: none (single ticket)`;
* the log says the story stays with this PAT (no `story released — take it
  with …` line).

**Exit 1** → nothing was started. Report the printed problems verbatim
(not single mode, no `**Run:**` header, an open question, `--hold`) and
stop; fix the document with `plan master` and release again only when the
problem is the document's. Never move the master to `todo` yourself, and
never "confirm" a plan by transition — that is the approval the header
exists to make visible.

## 5. Execute

Now follow `.claude/skills/plan-go/SKILL.md` for `"<story name>"` (the
plan title, `(run)` suffix included), from its §1 through its §6,
**unchanged**. What that means for a run plan:

* §1: `story find "<story name>" --json` returns the master in `todo` with
  `mode` `single`; `story take` is idempotent — the story is already this
  PAT's. `plan status` shows the `Plan review: skipped — run plan …` line:
  that line, on a master with a `**Run:**` header, is what tells a
  legitimate run plan from tickets someone moved to `todo` by hand.
* §2: the worktree, created from the sprint's configuration as plan-go
  says.
* §3: `tk.ts next "<story name>"` hands out the master at once; it is
  dispatched to **one** agent with plan-go §4's prompt, sent as written —
  the agent reads `.claude/skills/plan-go/AGENT.md` in the worktree as its
  protocol. It runs only the Verification section's typecheck and named
  test files, commits its own files, and its `tk.ts done` pushes and closes
  the master. The orchestrator re-runs nothing.
* Then the landing check, `tk.ts story release`, `tk.ts sync <master>` from
  the project root and the worktree teardown — plan-go §2 step 5. **The
  landing check applies unchanged, at the same place**: after the master is
  `done`, from the worktree, before the story is released. A run plan
  skipped the approval up front, so this proof is not optional — and where
  it ends in a fix ticket the run stops there and section 6 files no review
  item, because the work is not on the sprint's branch yet.

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
* §5's retry and stop rules apply as written, with one exception that
  follows from section 1: where plan-go would file an `ask` (the master
  failed twice in a row), a run skill files **none** — stop, keep the
  story and the worktree, and report both failure comments.

**Failing tests are triaged, here too.** The dispatched agent classes every
failing test as its protocol says (plan-go §4b's step column, with `<key>`
= the master). A `story` failure, and a `technical` one — a mechanical
failure of a foreign test — is fixed inside the ticket; there is no second
ticket to hand it to. A `business-logic` failure is never fixed by editing
the assertion: the agent files
`tk.ts ask <master> master --class business-logic --title "<the rule>" -`
and fails the master with `waiting on <question-key>`. The run
**stops there, with the story kept**. This is the one question a run plan
can end on (section 1), and it is not a failure for the retry rule above.
After the person answers,
`/plan-resume "<story name>"` continues the plan: it files the fix that
carries the answer and runs the master to its end.

Planning happened in this context, but the tickets are still the only
state: the agent's brief is `tk.ts show <master>`, not this conversation.

**If the run stops** before the master is `done` — a failure after the
retry, the story taken away, a push that was refused, a question the
dispatched agent filed through its own protocol (it holds the queue like
any other) — stop here. **No review item is filed for a plan that is not
`done`**; go to section 7 and report where it stopped. (A `tk.ts sync` that
exits 9 is not such a stop: the master is `done`, the plan has landed, and
the review item is owed.)

## 6. Review item

Only when `tk.ts plan status <master>` shows the master `done`. File
**exactly one** review item — not one per unproven claim as `/plan-verify`
does; this one item is the approval the plan skipped:

```sh
bun .claude/skills/plan-steps/tk.ts review file <master> - <<'DOC'
# Review 01 — <plan goal>

## Why this needs a person
This plan ran without Confirm plan (`/plan-run`), so nobody approved it
before it was built. What was built, in two or three sentences; the files
changed; the commit that landed it (`<sha>`, from the `## Commits` section
of `tk.ts show <master>`); and what the agent verified — the `done`
message's own words: typecheck plus the named test files, nothing else.

## How to check
1. Read the change: `git show <sha>` in the project root.
2. Run the full `bun test` — a single-ticket plan never runs it itself.
3. The exact things to do by hand for what no test covers: the URL or the
   command, what to do there, what should happen.

## Passes when
The full `bun test` is green and <the observable result>, in one sentence.

## If it fails
Press **Review failed** and say what you saw — the ticket goes back to the
agents with your words, and `/plan-verify-fix` picks it up.
DOC
```

The document's rules:

* the first heading is `# Review 01 — <plan goal>` — tk.ts parses it into
  the `review-01` ref;
* no `**Estimated scope:**` header — review items are never estimated;
  `**Priority:**` is optional and defaults to high;
* the four `## ` sections of the template, each filed as a body section of
  the item;
* URLs written out in full (`<TICKETING_URL>/tickets/<id>`, on the base URL
  `tk.ts me` prints), so the reviewer can click them;
* one screen long, executable by a person who was not here.

Run it from the project root; it needs no worktree.

It prints `review-01 TICK-nn (…) in_review handler human labels question,
review — …`. A warning that the org has no `review` label means the item
is not a review item at all: report it and stop.

**The agent gives no verdict** — never transition the item, never comment
a pass or a fail on it, never move it to `done`. And note what the open
item does: it is a human ticket, so it **holds its story's queue** until a
person passes, fails or cancels it. That is harmless here — the plan's
only work ticket is already `done`.

## 7. Report

Tell the user:

* what plan-steps §5 lists for a single-ticket plan — the master (key,
  title, URL), the story and the sprint, the planning ticket and its usage,
  the calibration verdict, the planning request with its `plan-run` label
  and its status — and the session id (the `Session:` line of `tk.ts me`);
* the commit that landed the work and the files it touched, and the
  verification the agent actually ran — quote the master's `done` message;
* **that the plan ran without human confirmation** — plainly, in those
  words — and that the `Plan run — released without Confirm plan` comment
  on the master records it;
* the **review item**: its key and URL, that it is waiting on them on
  `/attention` (or on its ticket page): **Performing review** → **Review
  passed** / **Review failed** (a failure requires a comment), that it
  includes running the full `bun test`, and that `/plan-verify-fix` is
  what runs after a failure;
* everything plan-go §6 lists that applies to a single-ticket plan;
* when it stopped on a **business-logic question** (section 5): the
  question's key, title and URL, the failing tests and the rule it asks
  about, that the story is paused and still this PAT's, that no review
  item was filed, and that after they answer on `/attention`
  `/plan-resume "<story name>"` continues it;
* when it stopped short: where, why, and how it is resumed —
  * interrupted **before release** → `/plan-steps-resume` finishes the
    plan in place (the release it runs is again `plan release <master>
    --run`, because the master carries the `**Run:**` header);
  * interrupted **during execution** → `/plan-resume`;
  * master `done` but **the review item is missing** →
    `/plan-verify "<story name>"` files it;
  * refused at the router, or re-planned as a normal plan in section 3 →
    nothing ran; name the skill (`/plan-steps`) or the **Confirm plan**
    it now waits for.

Never list the token.
