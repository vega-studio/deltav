---
name: plan-verify-fix
description: Fixes the review items a human marked failed on a plan filed by /plan-verify — takes the story, claims each failed item by key (never `tk.ts next`), fixes it in a worktree of the sprint's branch and sends it back with `tk.ts review submit`; it never gives a verdict. Use when the user says "/plan-verify-fix" or "fix the failed reviews". Argument: a story name or master key (none: the plan this context just reviewed).
---

Base directory for this skill: `.claude/skills/plan-verify-fix`

# Plan Verify Fix

`/plan-verify` files the checks a plan could not prove, and a person presses
**Review passed** or **Review failed** on each. This skill takes the failed
items, fixes what the reviewer described, and sends each one back to
`in_review` so they can look again. The same ticket carries the whole
history, as many rounds as it takes.

**Read `.claude/skills/plan-go/SKILL.md` before running this.** This is a
different procedure, not an override, but four of its sections are reused
**unchanged**, by reference:

* **§2 The worktree** — with the two differences in §4 below.
* **§4 Agent protocol** — the dispatch prompt, and the protocol file
  `.claude/skills/plan-go/AGENT.md` it sends the agent to, with the three
  changes in §5 below.
* **§5 Retries and stop conditions.**
* **§6 Finish** — the shape of the final report, extended by §6 below.

Finding and taking the *plan* (§1), the `tk.ts next` queue (§3) and the
master (§3 step 4) do **not** apply: there is no plan to run here, and no
queue to pull from. Every ticketing call is
`bun .claude/skills/plan-steps/tk.ts …`.

## 1. What this is

A **review item** is a ticket a person must check by hand, carrying the
organization's `question` and `review` labels, filed under a plan's master by
`/plan-verify`. Its states, and the one this skill works:

| Verdict (`review list`) | Shape | Whose move |
|---|---|---|
| `awaiting` | human, `in_review` | the reviewer's — **Performing review** |
| `reviewing` | human, `in_progress` | the reviewer's — passed or failed |
| **`failed`** | **agent, `todo`, unassigned (held by this token once it takes the story, and claimed by key as before), reason in the comments** | **this skill's** |
| `passed` | `done` | settled |
| `draft` | agent, `backlog` | a `review file` that died halfway — `tk.ts review submit <key>` parks it |

**This skill never decides a verdict.** Passing and failing are
`POST /api/tickets/:ticketId/review-decision`, humans only — a PAT gets 403
`handler_locked`, `tk.ts` offers no command for it, and none may be invented.
An item this skill finishes goes back to **`in_review` for the human**, never to
`done`. If you find yourself about to run `tk.ts done` on a review item, stop:
that is the one thing the whole design forbids.

(The code and `tk.ts review --help` still call this skill `/plan-review-fix`,
the name it was planned under.)

## 2. Finding the work

1. `bun .claude/skills/plan-steps/tk.ts me` — `Session: none` → stop and
   report it; **never invent a session id**.
2. Find the plan's master:
   * **an argument** (a story name, a master key or a story id) —
     `tk.ts story find "<story name>" --json`, which returns a finished
     story too;
   * this session just ran `/plan-verify` — it already has the master;
   * cold, no argument — `tk.ts plan list --all --json`, newest first: take
     the newest `done` master that has failed review items and name it
     before touching anything.
3. List the failures:

   ```sh
   bun .claude/skills/plan-steps/tk.ts review list <master> --failed --json
   ```

   → `[{ key, id, ref, status, handler, assignee, verdict, title }]`, verdict
   `failed`. **Exit 5** (`tk: no failed review item under <master>`) or an empty
   list → report "nothing failed" and stop: either the human has not walked the
   list yet (`tk.ts review list <master>` without `--failed` shows what is
   `awaiting`), or everything passed. Take no story, create no worktree.
4. **Never use `tk.ts next`.** While any review item of the story is open, the
   story is held whole — an open `human` ticket freezes its entire queue, so
   `next` serves nothing from it. That is the design, and it is why this
   skill claims its tickets by key (§5): do not route around it and do not
   move tickets to `todo` by hand.

## 3. Taking the story

```sh
bun .claude/skills/plan-steps/tk.ts story take "<story name>"
```

The story is taken **before** any item is claimed, exactly as `/plan-go` does,
so no other agent touches the plan's tickets while you work. Exit 0 → it is
yours (idempotent if you already held it). **Exit 3** → stop and report: "story
is taken by `<name>`; another agent is working it" — never work around the lock
by claiming items one by one.

> **Exit 12 — the auto worker is halting.** A manager pressed *Halt after
> current ticket*: the server hands this token no further ticket. It is not a
> failure and not something to retry. Take nothing more; let every agent
> already dispatched finish its ticket normally (`done`, `fail`, comments and
> pushes all still work); then stop. **Do not** release the story, do not run
> `tk.ts sync`, do not file a fix or a question about it, and do not move any
> ticket you did not finish. Report "halted by the auto worker" with the
> tickets finished and the tickets left; the story stays with this token and
> is resumed with `/plan-resume` after a manager presses Resume.

Here it comes from `story take`: **stop before claiming any item** — no
worktree, no `claim`, nothing to leave behind; the failed items stay `todo`
for the next `/plan-verify-fix` after a manager presses Resume.

Release it at the end, whatever the outcome:

```sh
bun .claude/skills/plan-steps/tk.ts story release "<story name>"
```

Release it even when items remain failed or a question was filed — the story
does not belong to this run any longer than it takes to fix what it fixed. Do
not release a story you do not own.

## 4. The worktree

Per `plan-go/SKILL.md` §2, unchanged: `/tmp/wt-<master>`, detached at the
tip of the sprint's configured integration branch, which is read from
`tk.ts me` and **never a hardcoded name**. Two differences from `/plan-go`:

* `/plan-go` has already removed its worktree at the end of the run, so this one
  is created fresh (`git worktree prune` first if the path is listed but gone).
  If it is still there with commits or uncommitted changes in it, `/plan-go`
  kept it deliberately — say so and leave it alone.
* There is **no `tk.ts sync`** at the end: `sync` lands a finished *plan* in the
  project root, and the plan is already done. A fix pushed here reaches the
  main checkout the way any other commit on the sprint's branch does.

Before the teardown, after the last `tk.ts review submit` of the run, the
landing check of `plan-go/SKILL.md` §2 step 5 runs here too — it covers the
plan's `done` tickets and every review item an agent submitted with a
commit, so a fix whose push never reached the sprint's branch is found
before the reviewer is asked to look at it again:

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
naming the tickets and their missing commits, and stop as for any failed step:
the story is not released as done, `tk.ts sync` and the teardown are not run,
and the worktree stays. Exit 7 (the sprint has no repository) → there is no
branch to land on; say so in the report and continue. Only finished tickets
are pushed this way: unfinished work is never pushed, and nothing is reset,
cleaned or stashed to make the check pass.

An item that is still `in_progress` — it could not be fixed, or it waits on a
question — is unfinished work: the check does not list it and nothing of it is
pushed. When the run stops early (the story taken away, a halt) the check is
**report only**, as plan-go §5 says: run it once, put its `Landed:` line in
the report and push nothing.

Tear the worktree down at the end exactly as §2 step 5 says. Anything left —
unpushed commits, an item that could not be fixed, an open question —
**keeps** the worktree; report its path.

## 5. Per item

One agent per failed item, dispatched in a **single parallel batch** when there
is more than one (review items are independent by construction; if two of them
turn out to touch the same file, serialize those two and say so in the report).
Each agent's prompt is `plan-go/SKILL.md` §4's dispatch prompt — the agent
still reads `.claude/skills/plan-go/AGENT.md` and follows it — followed by
these three changes, which replace what the protocol says:

* the ticket is acquired with **`tk.ts claim <master> <key>`** followed by
  `tk.ts start <master> <key>`, not pulled from the queue — claiming a child of
  the master is legal for the story's owner, and the queue is held (§2 step 4);
* the brief is `tk.ts show <key> --plan <master>` — the item's description
  followed by its body sections reassembled under their `## ` headings (what
  to check, how, what passing looks like) **and the human's failure comment**,
  which is the actual specification of the fix;
* it finishes with **`tk.ts review submit`**, never `tk.ts done`.

The per-item procedure, where it differs from the protocol:

1. `tk.ts claim <master> <key>` — exit 3 → someone else has it, or the story
   was taken away (stop, `plan-go` §5); exit 1 with
   `cannot be claimed directly` → the story is not yours, go back to §3. Then
   `tk.ts start <master> <key>`.
2. `tk.ts show <key> --plan <master>` — read the check **and the reviewer's
   words**. Fix what they described, not what you would rather fix. If the
   comment is ambiguous, it is a question (step 6), not a guess.
3. Fix it in the worktree, then **run the checks the original step ran** — find
   them in the step's ticket (`tk.ts show <step key>`, its Verification section)
   or in the master's plan-wide verification: `bun run typecheck` plus the test
   files that cover the changed area, at minimum — never the full `bun test`.
   A fix that breaks the plan's own tests is not a fix.
   **A test that fails here is triaged before it is touched**, by plan-go
   §4b's step column, with the item as the ticket: a `technical` failure
   that is not fixed inside the item is
   `tk.ts fix <master> <key> --class technical --title "<what>" -` and then
   `tk.ts fail <key> "fix ticket filed: <key>"` (the fix's key); a
   `business-logic` failure — no decision for the rule in the plan or in the
   reviewer's comment — is
   `tk.ts ask <master> <key> --class business-logic --title "<the rule>" -`,
   then `tk.ts fail <key> "waiting on <question-key>"`.
4. Commit **only that item's files**, as the protocol says.
5. Send it back:

   ```sh
   bun .claude/skills/plan-steps/tk.ts review submit <key> --plan <master> \
     -m "<what was wrong, what changed, what you checked>" \
     --tokens-in <n> --tokens-out <n> --note estimated
   ```

   In one command it pushes to the sprint's branch, comments with that
   verified commit **while the item is still agent-handled** — after the flip
   to `human` a comment would be held for human approval and invisible to
   every agent — records the usage, and parks the item at `in_review` +
   handler `human`, unassigned.

   Exit 6 is a merge conflict: resolve it, re-run the checks, `tk.ts push <key>`
   again, then `review submit --no-push`. Exit 7 means the sprint has no
   repository — tk.ts works commit-free and says so. Exit 1 with "already with
   its human" means somebody re-submitted it already; leave it.
6. **Cannot fix it?** File the question and leave the item with the agents:
   `tk.ts ask <master> <key> --title "<question>" -` (heredoc body: the
   reviewer's comment, what you found, the options, your recommended
   default — its `## ` headings become the question's sections), then
   `tk.ts fail <key> "waiting on <question-key>"`.
   Do not submit a half-fix for re-review: the reviewer's time is the scarce
   resource this whole mechanism is spending.

**Never** mark a review item `done`, never comment a verdict on it, and never
re-file it as a new item — the failure loop reuses the same ticket so its
history stays in one thread.

## 6. Stop conditions and the finish report

`plan-go/SKILL.md` §5 applies as written; an item whose agent fails twice in
a row becomes a `tk.ts ask` question rather than a third attempt. Plus:

* An item that is **not** `failed` when you get to it (a human started
  reviewing it again, or passed it meanwhile) is skipped, not forced —
  `review submit` refuses an item already with its human, and that refusal is
  correct.
* Filing a question with `tk.ts ask` pauses the story the same way an open
  review item does; say so when you report it. A business-logic question
  (plan-go §4b) holds the story like any human ticket and is never counted
  as one of an item's two failures.
* **Answers come first on the next run.** Before claiming anything, read
  `tk.ts ready <master> --json`: every entry of `answersToApply` is a
  business-logic question a person answered (or closed) that no fix carries
  yet. Apply it by plan-go §4b's answer rule —
  `tk.ts fix <master> <item ref> --class story --answers <question ref> --title "Apply the answer to <question ref>: …" -`,
  quoting the answer (its `## Default if unanswered` when it was closed
  without a person's comment) — claim that fix by key like an item (§5
  step 1), finish it with `tk.ts done` (a fix is not a review item),
  and only then re-run the item's checks and `review submit` it.

Then print `tk.ts review list <master>` and report, in `plan-go` §6's shape:

* the plan (master key, title), the story and its sprint, and that the story was
  released;
* the worktree it ran in, the branch and commit it started from, and whether it
  was removed or kept (with the reason);
* **per item**: `review-NN`, its key, what the reviewer said was wrong, what was
  changed, which checks were re-run, and the pushed commit;
* the landing check: the `Landed:` line of `tk.ts plan landed <master>`, and
  any ticket it printed as `not landed` with what was done about it;
* items left failed, and why — with the question tickets filed (keys and
  titles, and which of them are business-logic questions) and the answers
  applied (question → fix);
* the token usage recorded per item (estimates, `--note estimated`);
* that **the re-submitted items are waiting on a person again**
  (`/attention`): until every review item of the story is passed or
  cancelled, the story's work queue stays held.
