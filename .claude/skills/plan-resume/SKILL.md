---
name: plan-resume
description: Resumes an interrupted /plan-go run — finds the story this token left taken with `tk.ts resume list`, never `tk.ts next`, takes it back with `tk.ts resume`, re-aligns the remaining work with the plan master, re-dispatches the orphaned tickets and runs the rest as /plan-go does. Use when the user says "/plan-resume" or "resume the plan". Arguments: a story name or master key (none: this token's most recent interrupted story) and `--force`.
---

Base directory for this skill: `.claude/skills/plan-resume`

# Plan Resume

`/plan-go` for a plan that was running and stopped: the orchestrating session
was interrupted, leaving the story taken by this token and some of its
tickets `in_progress`. **Read `.claude/skills/plan-go/SKILL.md` first
and follow it in full** — this file replaces only how the story is found and
taken (plan-go §1 steps 1–2) and adds a re-alignment review before the loop;
the worktree (§2), the loop (§3), the dispatch prompt and agent protocol
(§4), the stop conditions (§5) and the finish report (§6) apply
**unchanged**.

The tickets are the only state: nothing is read from or written to files,
and conversation memory of the earlier run counts for nothing.

## What resuming is, and is not

* **Same token.** A story is resumable only for the token engaged with it —
  owning the story or holding an `in_progress` ticket in it; the server
  enforces that (`POST /api/work/resume` answers 409 `not_engaged`).
  Another agent's plan stays locked until it returns, a human releases the
  story or the token is revoked. Never work around
  that — do not `story take` around a `not_engaged`, do not `claim` its
  tickets.
* **Nobody else is working it.** The server's one signal that the earlier
  session may still be alive is this token's own heartbeat: while it is
  younger than the sprint's offline threshold (`offlineAfterSeconds`,
  default 300 s) `tk.ts resume` exits 10 and does nothing. **`--force` in
  the arguments is the caller's statement that the earlier session is gone —
  pass it on to `tk.ts resume`.** Without it, exit 10 means stop and report
  the heartbeat's age. Never add `--force` yourself.
* **Exit 12 — the auto worker is halting.** A manager pressed *Halt after
  current ticket*: the server hands this token no further ticket. It is not a
  failure and not something to retry. Take nothing more; let every agent
  already dispatched finish its ticket normally (`done`, `fail`, comments and
  pushes all still work); then stop. **Do not** release the story, do not run
  `tk.ts sync`, do not file a fix or a question about it, and do not move any
  ticket you did not finish. Report "halted by the auto worker" with the
  tickets finished and the tickets left; the story stays with this token and
  is resumed with `/plan-resume` after a manager presses Resume.
  Here it comes from `tk.ts resume` (section 2: nothing was taken back —
  stop before the worktree, re-dispatch nothing) and from `tk.ts next` in
  the shared loop (section 3: it ends as on exit 5, but the master, the
  story release and the sync are skipped — plan-go §5).
* **Nothing is rewound.** `resume` transitions no ticket: `done` stays done,
  the orphans stay `in_progress` and assigned to this token, `todo` steps stay
  queued. Work already on the sprint's branch is kept; uncommitted work only
  survives if the worktree still exists. Resuming re-dispatches and continues;
  it never re-executes a finished ticket and never reopens one.
* **A paused story is resumed here too** — one that stopped on a question
  (plan-go §4b), once answered; there may be no orphan at all: the answer
  is the work to pick up (section 1b, verdict **Answered**).

Commands and exit codes are plan-go's, plus `10` — this token's heartbeat is
still fresh. The work is found with `tk.ts resume list`, never `tk.ts next`,
which serves only fresh tickets.

## 1. Find and take the story (replaces plan-go §1 steps 1–2)

1. **What did this token leave behind?**
   `tk.ts resume list --json` → one object per resumable story:
   `{ story: { id, name, assignee, lastActivityAt, … }, mode, master: { key, id, status, title } | null, inProgress: [{ ref, kind, key, id, status, title }], lastSeenAt, stale, offlineAfterSeconds }`.
   * **Argument given** (`/plan-resume <story name>`, a master key or a story
     id) → that story; it must be in the list with `mode === "execution"`.
     If it is not in the list: it is either not this token's (say who holds
     it — `tk.ts story list` shows owners — and stop) or not interrupted at
     all (a story with no orphan and no owner is started with `/plan-go`).
   * `mode: "planning"` → an interrupted **planning** session, which is
     `/plan-steps-resume`'s work: name it and leave it alone.
     `master === null` → the story is not a plan: report it and stop.
   * **No argument** → the execution story with the most recent
     `story.lastActivityAt`; name the others that are waiting. None (exit
     5) → stop and report "nothing to resume for this token".
2. **Take it back:** `tk.ts resume "<story name>" --json` (with `--force`
   only when the arguments carry it). It prints the same object as the list
   entry — `inProgress` are the **orphans** this run will re-dispatch. Exit
   codes:
   * `3` — taken by someone else meanwhile: stop and report who.
   * `12` — the auto worker is halting (the rule above): nothing was taken
     back; stop and report "halted by the auto worker".
   * `10` — this token's heartbeat is still fresh: stop and report the age
     printed and when it goes stale.
   * `1` with `not_engaged` — nothing of the story is this token's: stop and
     point to `/plan-go`.

   `master.key` is `<master>` from here on. Then continue with **plan-go §1
   from step 3** — every gate there still applies to a resumed plan. Two of
   them, as they meet a resumed run:
   * `in_review` — a human pressed **Revise plan** while the run was down.
     Release the story, report that the plan is with `/plan-steps` again and
     stop; the orphans stay assigned (a human or the revision decides them).
   * `done` — the earlier run finished the master and died before releasing
     the story or syncing: do plan-go §1 step 5's `done` branch (release,
     `sync`, tear down the worktree) and stop.
3. **Paused, not interrupted?** Read `tk.ts ready <master> --json`. When
   `waitingOnHuman` is non-empty and `inProgress` is empty, **do nothing**:
   the story is waiting on a person, the server hands out none of its
   tickets, and there is no orphan to finish. Report the open questions
   (key, title, what each blocks) and stop, **keeping the story** — no
   worktree, no dispatch, no master comment. An unattended run ends there:
   it never answers its own question, nor comments on or closes it. (With orphans
   `inProgress` the run goes on to section 1b and finishes them; the queue
   stays held behind the question.) `waitingOnExternal` non-empty with
   nothing ready is plan-go's *Waiting on external* stop: report it the
   same way, never touching the external ticket.

## 1b. Re-align before dispatching (new)

Confirm that what is left to do still matches the plan, and that what was
done is really done. This is a read-only review of tickets and git; it files
tickets, it never edits the plan (released tickets are read-only for agents).

1. **The master is still the contract.** From `tk.ts show <master>` reread
   the goal, the design decisions, the step index and the wave sections.
   Then read the master's **comments**: anything posted after the earlier
   run's last activity — a human's note, a deviation an agent commented — is
   an instruction for this run.
2. **What is done.** `tk.ts plan status <master>` gives the tally. For every
   `done` step and fix of the **latest wave** (all of them when the plan is
   small) run `tk.ts show <key>` and read its `done` comment: files changed,
   verification run, deviations. A `done` ticket always has a verified commit
   on the sprint's branch (`tk.ts done` enforces it) — the `## Commits`
   section of `show` lists it; nothing more needs proving there.
3. **What was in flight.** For every orphan in `inProgress`: `tk.ts show <key>
   --plan <master>` — its comments and heartbeats say how far it got. Once the worktree
   exists (section 2), `git -C /tmp/wt-<master> status --porcelain` and
   `git -C /tmp/wt-<master> log --oneline -20` show what that work left on
   disk: uncommitted files belong to the orphans; commits on HEAD that are not
   on `origin/<branch>` were never pushed (their ticket is not done).
4. **The verdict** — **Aligned**, **Gaps** or **Drift**, and, on top of the
   first two, **Answered**:
   * **Aligned** — the done tickets did what their documents say, the orphans
     are ordinary partial work, no comment asks for a change → post one
     comment on the master (`tk.ts comment <master> -`): "Resumed after
     interruption: <n> done, <m> in progress re-dispatched (<keys>), <k> todo;
     worktree <kept|recreated>; no drift found." and go on.
   * **Gaps** — a done ticket's comment reports something the plan needs and
     did not get (a skipped verification, a file it could not touch, a
     deviation the master does not allow) → one `tk.ts fix <master> <ref>
     --title "<what>" -` per gap (the fix blocks the ticket that depends on
     it; the loop hands it out next; the body's `## ` headings become its
     sections), then the master comment above with the fix keys.
   * **Drift** — the remaining steps no longer make sense as written (the done
     work took a different shape, a human's comment changes the design, the
     code moved under the plan) → `tk.ts ask <master> none --title "Plan
     drift after interruption" -` (what was found, what no longer fits, the
     options — under `## ` headings, which become the question's sections),
     post the master comment naming the question, and stop: the
     question pauses the story until a human answers, and a human may then
     send the plan back to `/plan-steps`. Do not rewrite step tickets and do
     not "adapt" them in the agents' prompts — the ticket text is the brief.
   * **Answered** — `tk.ts ready <master> --json` lists a non-empty
     `answersToApply`: business-logic questions a person answered (or
     closed) that no fix ticket carries yet. For each entry apply plan-go
     §4b's answer rule — `tk.ts show <question key>`, read the person's
     answer (a question closed without a person's comment is applied as its
     `## Default if unanswered`), then file it as work on the ticket the
     question blocked (the entry's `blocks`):
     `tk.ts fix <master> <blocked ref> --class story --answers <question ref> --title "Apply the answer to <question ref>: …" -`,
     the body quoting the answer — **before** that ticket's verification is
     run again. Then post the master comment as "Resumed after <question
     keys> were answered: fixes <keys> filed; <n> done, <m> in progress
     re-dispatched (<keys>), <k> todo; worktree <kept|recreated>." It
     combines with **Aligned** and **Gaps** (one comment, both parts);
     **Drift** still wins and stops — file no `--answers` fix for a plan
     that no longer fits, the drift question says the answers are waiting.
5. **Report** the tally and the verdict to the user with plan-go §1's step-7
   summary, before dispatching anything.

## 2. The worktree (plan-go §2, one addition)

Reuse `/tmp/wt-<master>` when `git worktree list` shows it — it holds the
orphans' uncommitted work, so **never** reset, clean or recreate it while it
exists. When it is gone, create it as plan-go §2 says and report that
uncommitted work of the orphans, if there was any, is lost: their tickets'
comments are what the re-dispatched agents start from.

## 3. The loop (plan-go §3, one addition)

Unchanged — orphans re-dispatched without pulling them again, `next` until
exit 5 (or exit 12, the auto worker halting: the loop ends without master,
release or sync — plan-go §5). The only change is the **prompt of a
re-dispatched orphan**: plan-go §4's dispatch prompt — the agent still reads
`.claude/skills/plan-go/AGENT.md` and follows it in full — **and** this
block right after it:

```
This ticket was interrupted mid-work by an earlier run and is being resumed,
not restarted. Before changing anything:
- `tk.ts show <key> --plan <master>`: your own earlier comments and
  heartbeats say how far the previous attempt got. Trust them over guesses.
- `cd <worktree> && git status --porcelain && git log --oneline -10`:
  uncommitted files in the worktree that belong to this ticket are the
  previous attempt's partial work — inspect them, keep what is correct,
  finish from there. Commits of `<key>:` already on HEAD are yours too;
  `tk.ts push` will carry them. Files belonging to other tickets are not
  yours: leave them exactly as they are.
- Do not redo work that is already done and verified; do re-run the
  ticket's Verification section in full before `done`.
- Say in your first `tk.ts comment` what you found (resumed from: nothing /
  uncommitted changes in <files> / commit <sha>) so the ticket's history
  explains the gap.
```

**The landing check applies unchanged, at the same place** — plan-go §2
step 5: after the master is `done`, from the worktree, before
`tk.ts story release` and `tk.ts sync`. A resumed run needs it most: the
tickets an earlier, interrupted session finished are checked with this
run's, so a commit that session never pushed is found here.

**Public summary review.** Before the master is closed (full/quick) or before
the Landing check (single), read `.claude/skills/plan-go/SUMMARY.md` and do
what it says.

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

When the run stops before the master is `done` the check is **report only**,
as plan-go §5 says: run it once, put its `Landed:` line in the report and push
nothing.

Fresh tickets pulled with `next` get plan-go's prompt unchanged. After an
**Answered** verdict the fixes filed for the answers come out of `next`
first: they block the tickets the questions blocked. A failing test met
later in the loop is triaged by plan-go §4b like in any run — and a new
business-logic question stops this run too, with the story kept.

## 4. Finish (plan-go §6, one addition)

Report everything plan-go §6 lists, and additionally:

* that this was a resumed run: the story, who held it (this token), the
  heartbeat age at resume and whether `--force` was used and why;
* the re-alignment verdict (aligned / gaps with fix keys / drift with the
  question key / answered) and the tally found at resume (done · re-dispatched orphans ·
  todo);
* whether the worktree was reused or recreated, and, if recreated, that
  uncommitted work of the orphans did not survive;
* for each re-dispatched orphan, what its agent reported it resumed from;
* the landing check's `Landed:` line, and which of the tickets it had to
  push were finished by the interrupted run rather than this one;
* the answers applied, one line each: question key and title → the fix
  ticket that carries it (and "default applied" where the question was
  closed without a person's comment) — or, when the run stopped in section
  1 because the story is still paused, the open questions it waits on.
