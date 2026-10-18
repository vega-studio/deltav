---
name: plan-go
description: Executes a story filed as tickets by /plan-steps — takes the story, runs it in a git worktree of the sprint's integration branch, pulls tickets with `tk.ts next`, dispatches one agent per ticket, triages failing tests (a business-logic failure becomes a human question) and syncs the finished plan. Use when the user says "/plan-go" or "execute the plan". Argument: a story name or master key (none: the first untaken story with an open plan).
---

Base directory for this skill: `.claude/skills/plan-go`

# Plan Go

Execute a **story** that `/plan-steps` filed into the ticketing system: every
plan is a story, and the executor takes the whole story before it touches a
single ticket, so no other agent can pick up (and re-plan) parts of it.
Assume you know nothing about the plan except what its tickets say — **the
tickets are the single source of truth**; never rely on conversation memory
of how the plan was made. Nothing is read from or written to `docs/`: an old
plan folder on disk is ignored.

A person running this skill by hand finds what only they need in
`.claude/skills/plan-go/MANUAL.md`; an unattended run never reads it.

All commands below are `bun .claude/skills/plan-steps/tk.ts …`, run from the
project root until the worktree exists (section 2) and from the **worktree**
after that — tk.ts derives the project root from its own path, so the copy
inside the worktree drives the worktree's git. `.env` supplies
`TICKETING_PAT`; never print the token. Exit codes: `0` ok, `1` error,
`3` already claimed (or the story is taken by another agent), `4` blocked,
`5` nothing ready (or no eligible story), `6` merge conflict, `7` the sprint
has no repository, `8` push failed, `9` the project root was not synced
(`tk.ts sync`) or a finished ticket is not on the sprint's branch
(`tk.ts plan landed <master>`, the landing check of section 2, step 5).
`<story>` is the story's exact name, its id or the master key; `<master>` is
the master ticket key; `<ref>` is a ref inside the plan (`step-03`, `wave-2`,
`fix-01`, `question-01`, `external-01`, `master`); `<key>` is any ticket key.

**Session id.** Every ticket records the chat session of the agent that last
worked it, and the server requires it from agents: a claim, a `tk.ts next`
pull or a `done` without one is refused (400 `session_required`). tk.ts
reports it by itself, resolving `--session <id>` → `TICKETING_SESSION_ID` →
`CLAUDE_CODE_SESSION_ID`; `next`, `claim`, `start`, `done` and `session`
exit 2 with `no agent session id …` when none resolves. Subagents spawned
with the Agent tool share the orchestrator's `CLAUDE_CODE_SESSION_ID`, so
one run carries one id. Before taking the story, read the
`Session:` line of `tk.ts me`: when it says `none`, stop and report it.
**Never type, guess or invent a session id.**

## 1. Find and take the story

1. **Find.** `tk.ts story find "<story name>" --json` →
   `{ story: { id, name, sprintId, sprintName, assignee }, master: { key, id, status, title, mode } }`.
   The argument is the story's name (a unique case-insensitive substring is
   enough; several matches are listed with exit 1), its id or a bare master
   key. `mode` is `full`, `quick` or `single`, read from the master
   document's `**Mode:**` line; `next --json` carries the same field on its
   `master` object. A story's plan master is the ticket of the story
   carrying the organization's `plan` label or opening
   with `Role: MASTER`. `master.key` is `<master>` in every later command.
   * A named story with no plan master is an error. If tk.ts warns that its
     planning ticket is still open, a `/plan-steps` session may still be
     planning it: report that and stop.
   * A named story whose plan is not confirmed **fails here** (exit 5),
     before anything is taken: `"<name>" is awaiting human review: confirm
     plan TICK-nn on the ticket page (or Revise plan to send it back to
     /plan-steps)`, or `"<name>" was sent back for revision: /plan-steps
     re-plans it …`. Report it verbatim and stop — no `story take`, no
     `claim`, no "helping" by moving tickets to `todo`.
   * A story this token already holds (`taken by you, resuming`) is an
     interrupted run: `/plan-resume` reviews what it left behind; this
     skill simply continues.
   * With no argument `story find --json` returns the first untaken story
     whose plan is confirmed and open; exit 5 means there is none
     (MANUAL.md has the detail).
2. **Check the review gate, then take the story — in that order.** The
   **review gate**, stated here once: a plan whose master is `in_review` is
   waiting on a person, and nothing of it runs before **Confirm plan**. The
   `master.status` of step 1 is read **before** any `story take`:
   * `in_review` → **do not take the story.** Report "plan <master> is
     awaiting human review — open <TICKETING_URL>/tickets/<master.id> and
     press **Confirm plan**; **Revise plan** sends it back to /plan-steps",
     and stop. The last footer line of `tk.ts plan status <master>` tells
     the two apart: `Awaiting human review: TICK-nn …` or `Revision
     requested: TICK-nn — run tk.ts plan revise TICK-nn`.
   * otherwise **take the story before anything else:**
     `tk.ts story take <story>`. Exit 0 → it is yours (idempotent when you
     already held it). Exit 3 → stop and report: "story is taken by <name>;
     another agent is executing it (or a /plan-steps run is still planning
     it)". Never work around the lock — do not claim its tickets one by one.
     **Exit 12** → the auto worker is halting (section 5, *Exit 12*): nothing
     was taken — stop and report "halted by the auto worker". No worktree, no
     `next`, no retry.

   Taking the story assigns every open, agent-handled, unstarted ticket of
   it to this token — the story's **hold**, not work in progress (`plan
   status` shows `<name> (story)`): the tickets are still pulled with
   `tk.ts next` as before, and releasing the story gives them back unassigned.

   Wherever the master turns out to be `in_review` after the take — step 5
   below, or mid-run (section 3, step 3) — execute nothing more, **release
   the story** (`tk.ts story release <story>`), report as above and stop.
   Never transition the master or its steps yourself: moving tickets to
   `todo` by hand is exactly the approval this gate exists to require. The
   only sanctioned way a plan reaches `todo` without Confirm plan is
   `plan release --run`, which the run skills call before handing over to
   this procedure.
3. `tk.ts plan status <master>` — the table `Ticket · Ref · Kind · Wave ·
   Status · Assignee · Blockers` (kinds `master | planning | barrier | step |
   question | fix`) and a footer. Three footer lines decide what this run
   does: `Depends on plans:` (step 6), `Plan review:` (steps 4 and 5) and
   the **`Mode:` line**, `Mode: full|quick|single · barriers: per wave|none
   (single wave)|none (single ticket)` — the plan's shape, which the loop
   in section 3 keys on: barriers per wave (two or more waves), a single
   wave with no barrier (the master blocks on the steps directly), or
   `single` (no steps and no barrier: the master *is* the work). Also
   `tk.ts show <master>` to read the plan's design decisions and its
   plan-wide verification.
4. **Unreleased plan:** the `Plan review:` footer line reads `not released
   yet` — the master was filed but never wired. That line is the **only**
   test: never infer an unreleased plan from the absence of barrier
   (`wave-N`) children, because a released single-wave plan and a released
   single-ticket plan have no barriers either and are perfectly runnable.
   → run `tk.ts plan release <master>` (idempotent: creates the barriers
   the layout calls for, wires the blockers, records the estimates; if its
   log says `story released`, the planning ticket was still open and this
   run closed it — run `tk.ts story take <story>` again). A release starts
   nothing: every step, barrier and the master stay in `backlog` and the
   master is parked in `in_review` for a person. So after it,
   `tk.ts story release <story>`, report that the plan is wired and now
   needs **Confirm plan** on <master>, and stop.
5. **The master's status decides whether this run does anything at all:**

   | Master is | What to do |
   |---|---|
   | `todo`, `in_progress` | Runnable: the plan was confirmed, **or it is a run plan** (`Plan review: skipped — run plan (…)`: filed by /plan-run or /plan-run-quick and released with `--run`, with a `Plan run — released without Confirm plan` comment on the master). Continue. |
   | `backlog` | Step 4. |
   | `in_review` | **The plan is not approved: execute nothing.** Step 2's last paragraph: release the story if you took it, report which of the two states `plan status` shows, stop. |
   | `done` | `tk.ts story release <story>`, then sync the project root and tear down a leftover `/tmp/wt-<master>` exactly as in section 2, step 5 (an earlier run may have stopped before that; `sync` is a no-op when the root already has the plan). Report that the plan is complete and stop; do not re-execute (agents never reopen `done` tickets). |
   | `cancelled` | Release the story, say so and stop. |
6. **Waiting on another plan:** the footer's `Depends on plans:` names a
   plan that is not `done`/`cancelled` — or, later, `ready` exits 5 and
   prints `waiting on plan TICK-nn — <title> (<status>)`, or lists it under
   `blockedByPlans`. This plan's master and wave-1 steps block on that
   plan's master, so nothing here can become ready until it finishes. Do
   not remove the edge and do not claim around it: release the story
   (`tk.ts story release <story>`), report the plan it waits on — key,
   title, status and its story name (`tk.ts plan list` shows it) — with the
   `/plan-go "<that story>"` to run first, and stop.
7. **Opening summary**, before dispatching anything: the story name and its
   owner (you), the plan title and master key, the **mode** and the layout
   in words for that shape — `"7 steps in 2 waves: 6 + 1 (barriers per
   wave)"`, `"5 steps in 1 wave, no barrier"`, or `"single ticket: the
   master is the work"` — counts by status (todo / in_progress / done /
   blocked / waiting on human), the sprint and the `Points:` / `Tokens:`
   lines from the status footer. Resuming is implicit — `done` tickets are
   simply never handed out again.
8. `tk.ts ready <master> --json` →
   `{ master, ready, inProgress, waitingOnHuman, waitingOnExternal, answersToApply, blockedByPlans }`.
   * A non-empty `waitingOnHuman` is the **human hold**, stated here once:
     while any human question of the story is open the server hands out
     none of its tickets, whatever the `blocks` graph says — `ready` is
     empty and `next` exits 5 until every question is `done` or
     `cancelled`. With nothing `inProgress` either → stop and list every
     question (key, title, what it blocks) with: "answer on /attention
     (Start → comment → Resolve), then run /plan-go again". Keep the story
     taken. Confirming the plan does not lift this hold (it and the review
     gate are independent), so report "waiting on the questions", not a bug.
   * **Waiting on external**: `ready` empty, nothing `inProgress`,
     `waitingOnExternal` non-empty → stop, keep the story taken, list each
     external ticket with its target project and whether it was promoted,
     and tell the user a person with write access in both projects must
     promote it there (**Promote to <KEY>**, then Approve for Planning in
     the other project). Never claim, comment on or cancel an external
     ticket. An open external holds only the steps it `blocks`, never the
     story; the plan-question hold above stays and wins when both are present.
   * A non-empty **`answersToApply`** (a business-logic question about a
     failing test that a person has closed and no fix ticket carries yet;
     the text output prints `answers to apply (n):`) is the
     **first thing the run does**, before any `next`: every entry becomes a
     fix ticket by the "When the answer is in" rule of section 4b.
   * A non-empty `blockedByPlans` (`[{ key, title, status }]`) with nothing
     ready is step 6.

## 2. The worktree

The plan runs in a **git worktree**, never in the main checkout, so the user
keeps working in the project root while agents edit, commit, merge and push.
Set it up **after** the story is taken and the plan is workable (a run that
stops in section 1 has none), before the first `next`, at `/tmp/wt-<master>`
— derived from the master key, so an interrupted run finds the same tree.

1. **Reuse or create**, from the project root. `git worktree list`: if
   `/tmp/wt-<master>` is listed and the directory is there, reuse it
   (uncommitted work in it belongs to a ticket about to be re-dispatched —
   leave it alone). Listed but gone →
   `git worktree prune` first. Otherwise create it at the tip of the sprint's
   integration branch.

   **Read the branch from the sprint — never assume one.** `tk.ts me` prints
   `Repo: <url> · branch <branch>`; that `<branch>` is the sprint's
   configuration and the exact ref `tk.ts push` pushes to. Take it from
   there every run — it may be `main`, a `sprint/<name>` branch or anything
   else a person set on `/projects/<key>/sprints` — and substitute it below:

   ```
   git fetch --quiet origin <branch>
   git worktree add --detach /tmp/wt-<master> origin/<branch>
   ```

   The HEAD is **detached** on purpose: agents never create branches, and
   `tk.ts push` pushes `HEAD:refs/heads/<branch>` regardless. If the fetch
   fails (offline, `repo_unreachable`) or the sprint has no repository,
   create it at the local HEAD instead
   (`git worktree add --detach /tmp/wt-<master> HEAD`) and say so.
2. **The two untracked essentials** — both gitignored, so a fresh worktree
   lacks them and every tk.ts call would die with "TICKETING_PAT is not set":

   ```
   install -m600 .env /tmp/wt-<master>/.env
   ln -s "$PWD/node_modules" /tmp/wt-<master>/node_modules
   ```

   `.env` is a **copy** (a test that rewrites it must not touch the real one)
   and is never printed; `node_modules` is a symlink to the main checkout's,
   so no install is needed. A ticket that changes `package.json` runs
   `bun install` from the **project root**.
3. **Verify once:**
   `cd /tmp/wt-<master> && bun .claude/skills/plan-steps/tk.ts me` — same
   project, same sprint, and a `HEAD:` line matching
   `git -C /tmp/wt-<master> rev-parse HEAD`. Report the worktree path
   and the branch and commit it starts from with section 1's step-7 summary.
4. **From here on every command runs there**, yours and the agents': prefix
   with `cd /tmp/wt-<master> && …`. Barrier and master verification run
   there too — their `done` pushes the worktree's HEAD.
   Never commit, check out or reset in the project root (the one thing that
   writes there is `tk.ts sync`, step 5), and never touch another run's
   worktree.
5. **Landing check, sync the project root, then tear down** — after
   `done master` (section 3, step 4). First, from the worktree and before
   `story release`:

   ```
   cd /tmp/wt-<master> && bun .claude/skills/plan-steps/tk.ts plan landed <master>
   ```

   **Landing check.** Before the run finishes and hands its story back, prove
   that every finished ticket is on the sprint's integration branch: run
   `tk.ts plan landed <master>` from the worktree. It fetches that branch once
   and is otherwise read-only: one line per `done` ticket (`landed`, `not
   landed` with the missing commit, or `no commit`) and a last line `Landed:
   <n> of <m> done tickets on <remote>/<branch>`. Exit 0 → continue. Exit 9 →
   for each `not landed` ticket run `tk.ts push <key>` from the worktree (exit
   6: resolve the conflict, re-run that ticket's verification, `tk.ts push
   <key>` again), then `tk.ts plan landed <master>` again. Still exit 9 after
   two rounds → file `tk.ts fix <master> master --class technical --title "Not
   landed: <keys>" -` naming the tickets and their missing commits, and stop
   as for any failed step: the story is not released as done, `tk.ts sync` and
   the teardown are not run, and the worktree stays. Exit 7 (the sprint has no
   repository) → there is no branch to land on; say so in the report and
   continue. Only finished tickets are pushed this way: unfinished work is
   never pushed, and nothing is reset, cleaned or stashed to make the check
   pass.

   Then `story release`, and sync — both from the project root, with the
   project root's own tk.ts (the copy inside a worktree refuses to sync):

   ```
   bun .claude/skills/plan-steps/tk.ts sync <master>
   ```

   It fetches the sprint's branch and brings the project root's local copy
   of that branch up to it — a fast-forward, or a merge commit when the
   root has commits of its own — and never overwrites uncommitted work.
   Exit 0 → the root's checked-out branch now contains the plan. Exit 9 →
   the root was left as it was, and stderr says why. That is not a plan
   failure — the plan is on the sprint's branch either way — so pass stderr
   on verbatim with the command to re-run, and never stash, reset, check
   out or resolve anything in the project root yourself. A sprint without a repository
   (the worktree was created at the local HEAD) has nowhere to fetch from:
   pass the worktree's commit instead,
   `tk.ts sync <master> --from "$(git -C /tmp/wt-<master> rev-parse HEAD)"`.

   Then tear the worktree down:

   ```
   git -C /tmp/wt-<master> status --porcelain --untracked-files=no   # empty
   git -C /tmp/wt-<master> log --oneline origin/<branch>..HEAD       # empty
   git worktree remove --force /tmp/wt-<master>
   ```

   Both checks empty means everything is committed and on the sprint's
   branch. Without a sprint repository the second check is
   `git merge-base --is-ancestor "$(git -C /tmp/wt-<master> rev-parse HEAD)" HEAD`
   (exit 0) instead: the worktree's commits live nowhere else, so it goes
   only once `sync` has landed them in the root. Anything left — tracked
   changes, unpushed commits, a repo-less sync that exited 9, or a run that
   stopped on a question or a failure — **keeps** the worktree: never remove
   it, and report the path so the next `/plan-go` (or the user) picks it up.

## 3. The loop

Repeat until `next` exits 5 with nothing in progress, or the master is
`done`:

1. **Report.** `tk.ts ready <master> --json` →
   `{ ready: [{ ref, kind, key, id, wave, title }], inProgress: [...], waitingOnHuman: [...], waitingOnExternal: [...], answersToApply: [...], blockedByPlans: [...] }`.
   This is reporting only: nothing is ever claimed from this list. One
   list is work for you, though: every `answersToApply` entry becomes a
   fix ticket (section 4b, "When the answer is in") before step 3's `next`.
2. **Orphans.** Every `inProgress` ticket (already assigned to this PAT —
   an earlier run was interrupted) is re-dispatched exactly like a freshly
   acquired one. Do **not** pull or claim it again; its comments carry the
   history and the agent's `show` will surface them. A resumed run is a new
   session: the re-dispatched agent's `tk.ts start <master> <key>` re-reports
   the new session id (for an orphaned barrier or master, run
   `tk.ts session <key>` yourself).
3. **Acquire** with `tk.ts next "<story name>" --json`, **repeatedly until
   it exits 5**. Each call has the server pick one unblocked agent ticket
   of the story that is unassigned or held by the story's owner, assign it
   to this PAT and start it; tk.ts prints
   `{ key, id, ref, kind, wave, title, status, storyId, master }`. Collect
   the keys. Exit 5 → nothing more is ready. Exit 3
   (`taken by <name>`) → the story was taken away from you: stop the loop
   immediately and report it (section 5). Exit 2 → this PAT may not pull
   (`work:pull` / `tickets:claim` missing): stop and report. **Exit 12** →
   the auto worker is halting (section 5, *Exit 12*): the loop ends as on
   exit 5 — wait for the agents already dispatched — but this session is
   over: never pull again, and skip the master, the story release and the
   sync.

   The server is the only source of tickets — never guess keys, and never
   `claim` around a `next` that returned nothing (`tk.ts claim <master>
   <ref>` is only for children of a ticket you already hold; a claim
   refused with "pull it with tk.ts next" is the rule, not an error to work
   around). Two things keep a ticket that looks ready from being handed
   out, neither a bug to route around (`ready` reads the `blocks` graph,
   not these):
   * **The `planning` label.** `next` excludes tickets carrying it: they
     are planning requests for `/plan-steps` (`tk.ts plan next`), not work
     to implement. A ready, unassigned (or story-held) ticket that is never
     handed out → check for that label.
   * **The review gate** (section 1, step 2). A story whose plan master is
     `in_review` is served nothing — not even steps an earlier approval
     already moved to `todo`. An immediate exit 5 while `ready` and
     `plan status` still list `todo` steps → check the master's status. If
     it is back in review, a person pressed **Revise plan** mid-run: stop
     the loop, let the in-flight agents finish and report the tickets they
     closed, `tk.ts story release <story>` and report that the plan is with
     `/plan-steps` again. The answer is always a human confirmation; never
     `claim` around it and never move a ticket to `todo` yourself.
4. **Dispatch** the acquired + orphaned tickets in a **single parallel batch**,
   one general-purpose Agent per ticket:
   * **step / fix** → the section 4 prompt, with this per-kind sentence:
     "tk.ts reports the session id by itself; pass `--session` only when
     `tk.ts me` prints `Session:  none`, and then only an id you were
     given, never one you made up. The ticket's *Out of scope* section is
     binding; its *Verification* section must pass before `done` — and a
     step never runs the full `bun test`, the whole `test/integration/`
     folder or `bun run test:concurrency`, even if an older ticket's
     Verification section asks for it: run typecheck and the named test
     files (or, given only the full suite, the test files that cover the
     modules you changed), and say which in the `done` message. The master
     runs the full suite once, at the end."
   * **barrier (`wave-N`)** → multi-wave plans only. It is acquired through
     `tk.ts next` like any ticket, so it carries your session id with no
     extra command. Run the checklist in the barrier's description in the
     worktree (yourself, or one agent given the path): `bun run typecheck`
     and the wave's named test files, never the full suite — if an older
     plan's barrier text asks for it, run the wave's steps' test files
     instead and note the substitution in the comment.
     `tk.ts comment wave-N` with each command and its pass/fail, then
     `tk.ts done wave-N -m "<summary>" --tokens-in <n> --tokens-out <n> --note estimated`
     — the token counts are **your own** orchestration context spent on this
     wave, a rough estimate (tk.ts tags it as the `plan-go` phase). The
     comment and the `done` carry the commit you verified (HEAD), which
     `tk.ts done` pushes to the sprint's branch; a barrier commits nothing
     of its own.
     On failure: triage every failing test by section 4b — one
     `tk.ts fix <master> wave-N --class story|technical --title "<what>" -`
     per distinct failure (heredoc body: exact error output, files involved,
     the class and why, what green looks like; its `## ` headings become the
     fix ticket's sections), one
     `tk.ts ask <master> wave-N --class business-logic --title "<the rule in question>" -`
     per distinct rule — then
     `tk.ts fail wave-N "<n> fix tickets filed: <keys>; questions: <keys>"`,
     naming every fix and every question.
     The loop hands out the fixes next; once they are `done` the barrier is
     ready again. A question pauses the story instead.
   * **master** → two cases, keyed on the `mode` the `next --json` output
     carries on its `master` object:
     * **`full` / `quick`** → it only becomes ready when the last barrier —
       or, in a single-wave plan with no barrier, every step — is `done`.
       Run the plan-wide verification in the master description —
       **this is the one place the full `bun test` runs, as its final
       item**, after typecheck and whatever named suites the plan lists; if
       the master's description omits the sweep, run it anyway and say so —
       comment the summary (per-wave outcome, files touched, deviations,
       open questions, the full-suite result).
       **Public summary review.** Before the master is closed (full/quick) or
       before the Landing check (single), read
       `.claude/skills/plan-go/SUMMARY.md` and do what it says.
       Then `tk.ts done master -m "<summary>" --tokens-in <n> --tokens-out <n> --note estimated`
       (the orchestration context of the whole run so far, minus what the
       barriers already recorded — estimated). **On failure: triage every
       failing test by section 4b**, exactly as a barrier does with
       `master` as the ref (`tk.ts fix <master> master --class
       story|technical …`, `tk.ts ask <master> master --class
       business-logic …`), then `tk.ts fail <master> "<n> fix tickets
       filed: <keys>; questions: <keys>"` with the master's **key**. The
       master's full `bun test` is where **foreign** failures usually
       surface — it is the first run of every test the plan did not write.
       On green, run the **Landing check**
       (`tk.ts plan landed <master>` from the worktree — section 2, step 5)
       and only when it exits 0 hand the story back:
       `tk.ts story release <story>`, sync the project root with
       `tk.ts sync <master>` and tear the worktree down (section 2, step 5).
     * **`single`** → **the master is the work.** Its description is the
       implementation brief (Context, Implementation details, Tests inside
       the step, Out of scope, Verification), its role line starts
       `Role: MASTER — single-ticket plan: this ticket IS the work`, and
       `next` hands it out at once — there is nothing else in the plan.
       Dispatch **one** general-purpose Agent with the section 4 prompt,
       `<key>` = the master key **and** `<master>` = the master key too,
       and this per-kind sentence: "This ticket is a
       single-ticket plan: its description is the implementation brief;
       implement it, run its Verification section (typecheck plus the named
       test files — never the full `bun test`), commit only your files and
       finish with `tk.ts done <key> -m … --tokens-in … --tokens-out …
       --note estimated`." A test failing in that agent's verification is
       triaged by the **step column** of section 4b's table with `<key>` =
       the master (`tk.ts fix <master> <master> --class technical …`,
       `tk.ts ask <master> <master> --class business-logic …`). The agent's
       `done` pushes and closes the master. When the agent reports done,
       the orchestrator does **not** re-run any verification — the agent's
       `done` message is the verification record.
       **Public summary review.** Before the master is closed (full/quick) or
       before the Landing check (single), read
       `.claude/skills/plan-go/SUMMARY.md` and do what it says.
       Read `tk.ts plan status
       <master>` to confirm the master is `done`, then the **Landing check**
       (`tk.ts plan landed <master>` from the worktree), `tk.ts story release
       <story>`, `tk.ts sync <master>` and the teardown (section 2, step 5)
       exactly as for any finished plan. A single master that `fail`s
       follows section 5; a regression found in it later is a
       `tk.ts fix <master> master …` ticket.
5. **Barrier discipline** (when the plan has barriers). Wait for the whole
   batch to finish, then loop.
   Wave N+1 cannot start early: its steps block on `wave-N`, so `next`
   will not hand them out (and `ready` will not list them) until the
   barrier is `done`. Same-wave tickets never share files (plan-steps
   guarantees it); if two in-flight tickets touch the same file anyway, serialize them and `tk.ts comment <master>` the plan
   defect.
6. After each batch, print a one-line-per-ticket digest of what the agents
   reported (done / failed / asked) before the next `ready`.

## 4. Agent protocol

The protocol an agent follows on a ticket is the file
`.claude/skills/plan-go/AGENT.md`. The agent reads it from the worktree; it
is not pasted into a prompt. The prompt of every dispatched agent is this
block, sent as written with `<key>`, `<master>` and `<worktree>`
(`/tmp/wt-<master>`) filled in:

```
You are working ticket <key> of plan <master> in the Bun project checked out at <worktree>.
First read <worktree>/.claude/skills/plan-go/AGENT.md and follow it in full: it is your protocol.
<the per-kind sentence of section 3, step 4>
```

What the protocol makes the agent do:

* `tk.ts show <key> --plan <master>` (its whole brief) and
  `tk.ts show <master> --brief` (the plan's design decisions);
* `tk.ts start <master> <key>`, which reports the session id to the ticket;
* `tk.ts heartbeat` when it starts and before verification;
* `tk.ts comment` at milestones, and its own triage of a failing test;
* `tk.ts done` with its token estimate, which pushes — or `tk.ts fail`.

The agent's report names the files changed, the verification result, its
deviations, the session id and the final `tk.ts` command it ran.

## 4b. Failing tests — triage

A failing test is **classed before anything is done about it**, as exactly
one of three classes: **`story`** (a test the plan wrote or changed —
fixing it is the plan's own work), **`technical`** (a foreign test that
fails mechanically — fixed, and the run carries on) or
**`business-logic`** (a foreign test asserting a rule the story now breaks
and no plan document decided — a question for a person, which pauses the
story). In doubt between the last two, it is `business-logic`.

When a test fails in a barrier's or the master's verification, when an
agent reports a failing test it could not class, or when `ready` lists an
`answersToApply` entry: **Read `.claude/skills/plan-go/TRIAGE.md` now**,
before filing or editing anything. It holds the order of the rules, the
three checks, what each class becomes for a step and for the orchestrator,
the question document, the pause, and "When the answer is in".

## 5. Retries and stop conditions

* **A step or fix `fail`s** → it is released to `todo` and comes back
  through `ready`; re-dispatch it once with the failure comment visible via
  `show`. **Fails twice in a row** → `tk.ts ask <master> <key> --title "Step
  keeps failing: <key>" -` (both failure comments, your diagnosis, the
  options) and stop dispatching it. The question pauses the whole plan (the
  human hold of section 1, step 8): finish the agents already in flight,
  then stop and report it.
* **A barrier fails three times** → same treatment
  (`ask <master> wave-N …`).
* **A single master `fail`s** → it is a step for retry purposes; the
  second failure in a row is
  `tk.ts ask <master> master --title "Step keeps failing: <master>" -` and
  stop. Never verify or finish it yourself in the agent's place.
* **A business-logic question is not a failure.** A ticket that `fail`ed
  because a failing test was classed `business-logic` and asked about
  (section 4b) does **not** count towards "fails twice in a row", towards a
  barrier's three failures or towards any other retry limit here. Neither
  does the re-run after the answer's fix ticket is `done`: the count starts
  where it was.
* **An agent `ask`ed and `fail`ed with "waiting on question-NN"** → not a
  failure: the plan waits on a person (the human hold); for a failing test
  TRIAGE.md says how the answer becomes work.
* **`handler_locked`** (any write to a human ticket other than adding a
  comment), `unauthorized`/`forbidden`, `dependency_cycle` or network
  errors from tk.ts → stop the loop and report the exact command and error;
  do not retry blindly.
* **Exit 12 — the auto worker is halting.** A manager pressed *Halt after
  current ticket*: the server hands this token no further ticket. It is not a
  failure and not something to retry. Take nothing more; let every agent
  already dispatched finish its ticket normally (`done`, `fail`, comments and
  pushes all still work); then stop. **Do not** release the story, do not run
  `tk.ts sync`, do not file a fix or a question about it, and do not move any
  ticket you did not finish. Report "halted by the auto worker" with the
  tickets finished and the tickets left; the story stays with this token and
  is resumed with `/plan-resume` after a manager presses Resume.
  It comes from `tk.ts next` in the acquire loop (section 3 step 3) and from
  `tk.ts story take` at the start (section 1); tk.ts prints `tk: the
  auto worker is halting — …`. Leave the worktree in place — the commits in
  it are the story's — and report its path. The master, the story release,
  `tk.ts sync` and the teardown are **not** run.
* **Landing check on a stop — report only.** Whenever the run stops before
  the master is done — a halt (exit 12), a story held by an open question, a
  failed ticket, a story taken away — run `tk.ts plan landed <master>` from
  the worktree once and put its last line (`Landed: <n> of <m> done tickets
  on <remote>/<branch>`) in the report, with every `not landed` ticket and
  its missing commit. Here it is a report and nothing else: push nothing —
  the worktree may hold unfinished tickets' commits, and unfinished work is
  never pushed — file no fix for it, and leave the worktree in place. The
  run that finishes the plan (`/plan-go` again, or `/plan-resume`) runs the
  full landing check of section 2, step 5.
* **Story taken away.** `story take` or `next` exit 3, or a `claim` that
  exits 3 with `belongs to a story taken by <name>` → someone else owns the
  story. Stop dispatching, let the in-flight agents finish (the lock only
  blocks new claims) and report who holds it; never release a story you do
  not own or retry the claim. Leave the worktree in place and report its
  path.
* **`session_required` / `no agent session id`** (tk.ts exit 2) is an
  environment problem, not a step failure: do not file a `fix` ticket and do
  not re-dispatch; stop the loop and report the exact message.
* Never reopen a `done` or `cancelled` ticket; a later regression becomes
  a `tk.ts fix <master> <ref-or-key> …` ticket.
* Never `claim` a human question ticket; the PAT cannot claim, edit or
  transition it; it may only add a comment, which stays hidden from every
  agent until a human approves it.
* **No sprint repository.** `tk.ts push` (or a `done`/`comment --push`)
  exits 7 with `sprint has no repository` → a human must configure it on
  `/projects/<key>/sprints`: `tk.ts ask <master> none --title "Configure
  the sprint repository" -` once, then continue — until it exists tk.ts
  closes tickets commit-free and the server decides whether that is allowed
  (409 `sprint_repo_missing` once it enforces agent commits).
* **An unresolved merge conflict** a step's agent reports is a normal
  failure (its `fail` comment names the files): re-dispatch it once with
  the conflict visible via `show`, then the "fails twice" rule above.
* **Waiting on another plan** → section 1, step 6. **The master back in
  review mid-run** → section 3, step 3.

## 6. Finish

Print `tk.ts plan status <master>` and report. An unattended run writes one
paragraph; either way the report names each that applies, in a line:

* the story (name, id, sprint) and its ownership — released after
  `done master`, still taken while the plan waits on answers or failed
  tickets, or taken away; the plan (master key, title, mode) and whether
  the master is `done`; the session id (the `Session:` line of `tk.ts me`);
* tickets done and tickets failed, per wave, with each barrier's result (or
  `no barrier, single wave`), and the files touched;
* verification: the barriers and the master's plan-wide check. A
  single-ticket plan has neither — quote the test files the agent's `done`
  message names and say that a person still has to run the full `bun test`;
* questions filed and still open — keys and titles — with "answer on
  /attention, then run /plan-go again";
* the test triage (section 4b): the `Test failures:` line of `plan status`;
  every business-logic question with its key, its title and the rule in
  question, with "answer on /attention, then run /plan-go again — the run applies the
  answer and continues"; and the answers applied in this run, each as
  question → fix key;
* fix tickets filed (keys), each with its class (`story`, `technical`, or
  unclassified for a failure that was not a test) and its state;
* the landing check: the `Landed:` line of `tk.ts plan landed <master>`
  (section 2, step 5 — or the report-only call of section 5), every
  `not landed` ticket with its missing commit, what was pushed to land it,
  and the fix ticket filed when two rounds did not;
* the commit the plan ends on, and whether the project root was synced: the
  `tk.ts sync` line — or, on exit 9, its reason verbatim and the exact
  `tk.ts sync <master>` to re-run;
* the worktree (its path, the branch and commit it started from): removed,
  or kept and why;
* a run that stopped early: at the review gate (the master's key and URL,
  which of its two states, the story left untaken), on another plan (the
  `/plan-go "<that story>"` to run first), or on a halt;
* the `Points:` and `Tokens:` lines of the status footer, the deviations
  from the plan and the plan defects you commented on the master;
* next: `/plan-verify` (same context, no `/clear`) files the manual checks.
