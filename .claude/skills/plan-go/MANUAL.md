# plan-go — notes for a person running the skill by hand

Nothing in this file is needed by an unattended run (the auto worker always
names the story). It holds what `SKILL.md` left out because only a person
needs it: finding a story with no argument, what to tell the user, the full
finish report, and the background of a few rules. The section and step
numbers are those of `.claude/skills/plan-go/SKILL.md`.

## Running it from a cold context

Run `/plan-go` from a **fresh context** (e.g. right after `/clear`): the
skill needs no path and no memory of how the plan was made, because the
tickets are the single source of truth. If an old plan folder, `MASTER.md`
or `STATUS.md` exists on disk, ignore it entirely; nothing is written to
`docs/` by this skill, and old plan folders and `STATUS.md` files on disk
are ignored, not updated.

## Section 1, step 1 — finding a story with no argument

`tk.ts story find --json` with no name returns the first story (oldest
first) whose plan master is not `done`/`cancelled`, **not `in_review`**,
that nobody has taken — or that this PAT already holds (an interrupted
run; the text output says `taken by you, resuming` — `/plan-resume` is
the skill for that case: it reviews what the earlier run left behind
before re-dispatching, where `/plan-go` simply continues) — and whose
planning ticket is closed. Stories whose plan has not been confirmed are
skipped with a line on stderr: `tk: skipped "<name>": plan TICK-nn is
awaiting human review (Confirm plan on the ticket page)` or `… was sent back
for revision (tk.ts plan revise TICK-nn)`. **Pass those lines on to the
user** — they name the exact thing a person has to do. Exit 5 → say "no
untaken story with an open plan; run /plan-steps or pass a story name",
listing any skipped-for-review story (`tk.ts story list` shows every story
with its owner and master so the user can choose).

With a name: if tk.ts warns that the story's planning ticket is still open,
a `/plan-steps` session may still be planning it — tell the user and stop
unless they insist.

The `in_review` check of step 2 is belt and braces: `story find` refuses
such a story by itself, so you only reach that case when a human pressed
**Revise plan** between the find and the take.

## Background

* **The `plan` label.** A story's plan master is the ticket carrying the
  organization's `plan` label or opening with `Role: MASTER`; masters filed
  before the label existed were backfilled with it, and older stories still
  read "Plan — …".
* **Release no longer starts anything:** every step, barrier and the master
  stay in `backlog` and the release ends by parking the master in
  `in_review` for a human. A plan held with `--hold` reads `not released
  yet` like one that was never wired.
* **The session id** is the conversation a person can resume with
  `claude --resume <id>`; Claude Code exports `CLAUDE_CODE_SESSION_ID` to
  every shell.
* **Why the worktree's HEAD is detached.** Agents never create branches, and
  the branch may already be checked out elsewhere: git refuses to check the
  same branch out twice — including when the sprint's branch is `main` and
  the project root is on it. Hardcoding a branch name in the skill would
  silently push the plan to the wrong branch the next time a human
  reconfigures the sprint.
* **`node_modules` is a symlink**, so a ticket that changes `package.json`
  installs through it from the project root, which keeps both trees
  consistent; removing the worktree with `--force` (needed only because of
  the untracked `.env` and the symlink) does not touch the real
  `node_modules`.
* **What `tk.ts sync` does.** It is what makes a finished plan show up where
  the user works, without pulling anything by hand. It never merges into any
  other branch and never overwrites uncommitted work. Its exit 9 names one
  of: uncommitted changes in files the plan touched, a conflict with the
  root's own commits (the merge was aborted), another branch checked out
  (only the local copy of the sprint's branch was fast-forwarded), or a
  failed fetch.
* **`tk.ts next` and the planning queue.** `next` pulls with the queue's
  default mode, which excludes tickets carrying the `planning` label; those
  are served to `/plan-steps` by `tk.ts plan next`
  (`POST /api/work/next {"seeking":"planning"}`).
* **Where the triage's work comes from.** The master's full `bun test` is
  the first run of every test the plan did not write, so this is where most
  `technical` fixes and business-logic questions come from.
* **`plan status` footer.** After the table: a `Story: … · Sprint: …` line,
  `Depends on plans:` (`none`, or `TICK-nn (<status>), …`), `Plan review:`
  (the review-gate state, `not released yet — …`, or `skipped — run plan
  (…)`), the `Mode:` line and the `Points:` / `Tokens:` phase totals.
* **The commit protocol.** Every agent commits only its own ticket's files
  and `tk.ts push`es them to the sprint's integration branch before `done`
  (the merge loop retries until the push is accepted); barrier and master
  `done`s push the verified HEAD the same way. Which branch that is, and
  whether a human merges it later, is the sprint's configuration — never
  this skill's assumption, and never written into a plan.

## Section 6 — the finish report, in full

For a person reading the report in a conversation, print
`tk.ts plan status <master>` and report to the user:

* the worktree it ran in (`/tmp/wt-<master>`, and the branch and commit it
  started from), and whether it was removed at the end or kept — with the
  reason it was kept (unpushed commits, uncommitted changes, an open
  question, a failed ticket) and the path the user can inspect;
* the landing check: the `Landed:` line of `tk.ts plan landed <master>`
  (section 2, step 5 — or the report-only call of section 5 when the run
  stopped early), every ticket it printed as `not landed` with its missing
  commit, what was pushed to land it, and the fix ticket filed when two
  rounds did not;
* whether the project root was synced: the `tk.ts sync` line (fast-forwarded,
  merged, or already contained the plan) — or, on exit 9, its reason verbatim
  and the exact `tk.ts sync <master>` to re-run once the user has cleared it;
* the story (name and id) and its sprint, and its ownership: released after
  `done master` (`story release`), still taken by you while the plan waits
  on human answers or failed tickets, or taken away by someone else;
* the plan (master key and title), its mode (`full` / `quick` / `single`,
  the `Mode:` footer line) and whether the master is `done`;
* the session id of the run (one value, the `Session:` line of `tk.ts me`);
* when the run stopped at the **review gate** (nothing was executed): the
  master's key and URL, whether it is awaiting the human's decision or already
  sent back for revision, that **Confirm plan** is what makes the plan
  runnable, and that the story was left untaken;
* the plans it depends on (the `Depends on plans:` footer line — keys and
  status), and, when the run stopped because one of them is unfinished, the
  exact `/plan-go "<that story>"` command to run first;
* the `Points:` and `Tokens:` lines from the status footer — estimated vs
  done points and estimated vs used tokens per phase (planning · management
  · execution);
* per-wave outcome (steps done / failed / cancelled, barrier result — or
  `no barrier, single wave`);
* files touched (from the agents' reports and `done` comments);
* verification results (barriers and the plan-wide check on the master);
  for a single-ticket plan there is neither: the agent's `done` message on
  the master is the verification record (typecheck plus the test files it
  named — quote them), and the report tells the human to run the full
  `bun test` afterwards, since no part of a single-ticket plan runs it;
* open human questions — keys and titles — with "answer on /attention, then
  run /plan-go again";
* the test triage (section 4b): the `Test failures:` line of `plan status`
  (printed once the plan has a classed fix or question); every
  business-logic question with its key, its title and the rule in question,
  with "answer on /attention, then run /plan-go again — the run applies the
  answer and continues"; and the answers applied in this run, each as
  question → fix key;
* fix tickets filed (keys), each with its class (`story`, `technical`, or
  unclassified for a failure that was not a test) and its state;
* deviations from the plan and the plan defects you commented on the master.
* next: `/plan-verify` (same context, no `/clear`) files the manual checks.
