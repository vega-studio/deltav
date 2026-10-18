---
name: plan-steps-resume
description: Finishes an interrupted /plan-steps planning session — finds the story whose planning ticket this token left open (`tk.ts resume list`), takes it back with `tk.ts resume`, works out where the session stopped and completes the plan through `plan release`, never a second `plan open`. Plans only, never executes. Use when the user says "/plan-steps-resume" or "finish the interrupted plan". Arguments: a story name or master key, and `--force`.
---

Base directory for this skill: `.claude/skills/plan-steps-resume`

# Plan Steps — resume

`/plan-steps` for a plan whose planning session stopped halfway: the story
exists, the planning ticket is `in_progress` for this token, the master is
provisional or half-written, some steps may be filed — and nobody is finishing
it. **Read `.claude/skills/plan-steps/SKILL.md` first and follow it in full**
— this file replaces only how the plan is obtained (plan-steps §0's `plan
open` and §1's first branches) and adds the reconstruction of where the
session got to; the master document (§2), the step and question documents
(§3), the release (§4) and the report (§5) apply **unchanged**. A full or
quick plan also reads `.claude/skills/plan-steps/PLAN.md` when it reaches
the master body, the steps or the questions, and a `(quick)` plan also reads
`.claude/skills/plan-quick/SKILL.md`.

Run this from a fresh context. The tickets are the only state: the planning
ticket's comments are the procedure log.

## What resuming is, and is not

* **Same token.** A story is resumable only for the token engaged with it —
  here, the token that owns the story and holds its planning ticket. The
  server enforces that (`not_engaged`). Another agent's half-written
  plan is not yours: it stays with that agent until a human releases the
  story or the token is revoked. Never work around it.
* **Nobody else is planning it.** The resumer assumes the earlier session is
  dead. The one signal that it might not be is this token's own heartbeat
  (`plan note` heartbeats): while it is younger than the offline threshold
  (`offlineAfterSeconds`, default 300 s) `tk.ts resume` exits 10 and does
  nothing. **`--force` in the arguments is the caller's statement that the
  earlier session is gone — pass it on to `tk.ts resume`.** Without it,
  exit 10 means stop and report the heartbeat's age. Never add `--force`
  yourself.
* **Exit 12 — the auto worker is halting.** A manager pressed *Halt after
  current ticket*: the server hands this token no further ticket. It is not a
  failure and not something to retry. Take nothing more; let every agent
  already dispatched finish its ticket normally (`done`, `fail`, comments and
  pushes all still work); then stop. **Do not** release the story, do not run
  `tk.ts sync`, do not file a fix or a question about it, and do not move any
  ticket you did not finish. Report "halted by the auto worker" with the
  tickets finished and the tickets left; the story stays with this token and
  is resumed with `/plan-resume` after a manager presses Resume.
  Here it comes from `tk.ts resume`: nothing was taken back — stop and
  report, and run no `plan open`. The planning story stays this token's and
  `/plan-steps-resume` finishes it after a manager presses Resume (read
  `/plan-steps-resume` for `/plan-resume` in the rule: this is planning
  work).
* **Never `plan open` again.** That would file a second story, a second
  master and a second planning ticket for the same request. The existing
  tickets are extended in place: every step filed so far is a `backlog`
  draft of this token and rewritable with `plan update`; the provisional
  master is replaced by `plan master`; the planning ticket takes `plan note`
  and is closed by `plan release`.
* **An interrupted split is not found here.** A **split** (plan-steps tier
  SPLIT, a `plan-split` request) files no story and no planning ticket, so it
  never appears in `tk.ts resume list` and `tk.ts resume` has nothing to
  take. Find it with `tk.ts plan split status` (no argument: this token's
  unfinished pulls; exit 5: none) and finish it as plan-steps §2c item 8
  says.

## 1. Find and take the plan (replaces plan-steps §0 `plan open` and §1 branches 0–3)

Do **not** run `plan revise` and do **not** consult the skill arguments or the
conversation for a subject: the subject is the interrupted plan's own
`## Original prompt` — the master's `original-prompt` section, which
`tk.ts show` prints under that heading.

1. **What did this token leave behind?**
   `tk.ts resume list --json` → one object per resumable story:
   `{ story: { id, name, lastActivityAt, … }, mode, master: { key, … } | null, planning: { key, … } | null, inProgress, lastSeenAt, stale, offlineAfterSeconds, planningProgress? }`.
   * Keep only `mode === "planning"` — the story's planning ticket is still
     open and this token's. A `mode: "execution"` story is an interrupted
     **run** (planning finished, `/plan-go` died): that is `/plan-resume`'s
     job; name it and leave it alone.
   * **Argument given** (a story name, a master key or a story id) → that
     story; it must be in the list with `mode: "planning"`. If it is not: it
     is either another agent's (say who holds it — `tk.ts story list` — and
     stop) or already released (`plan status` shows the planning ticket
     `done`; a human reviews it or `/plan-go` runs it).
   * **No argument** → the planning story with the most recent
     `story.lastActivityAt`; list the others. None (exit 5): stop and report
     "nothing to resume for this token".
   * `planning === null` with `mode: "planning"` cannot happen; `master ===
     null` means the story is not a plan — report it and stop.
2. **Take it back:** `tk.ts resume "<story name>" --json` (with `--force`
   only when the arguments carry it). It confirms the story is this token's,
   records the token as `working` and prints the entry above, now with
   `planningProgress` (`masterDocument: provisional | written`, `notes`,
   `calibrated`, `stepsFiled`, `questionsFiled`, `barriers`, `lastNote`).
   Exit codes: `3` taken by someone else (stop, report who), `12` the auto
   worker is halting (stop, report "halted by the auto worker" — the rule
   above), `10` heartbeat still fresh (stop, report the printed age and
   when it goes stale), `1` with `not_engaged` (stop; nothing of the story
   is this token's).
   `master.key` is `<master>` and `planning.key` is the planning ticket from
   here on. Run `tk.ts me` as plan-steps §1 says.

## 1b. Reconstruct where the session got to (new)

The planning procedure has seven steps (they are printed in the planning
ticket's description): understand, research, decisions and questions, master
document, step documents, human questions, release. Find the last one the
earlier session completed — from the tickets, not from memory:

1. `tk.ts show <planning>` — the description holds the original prompt and
   the procedure; the **comments are the log**: the calibration brief, the
   research summary, the decision table, "steps filed: …", "questions filed:
   …" arrive there as `plan note`s, in order. The last note is the last thing
   that finished. `planningProgress` from `resume` is the same reading as
   counts — hints to check the log against, not a substitute for reading it.
2. `tk.ts show <master>` — provisional (it still ends with `_Planning in
   progress — tk.ts plan master replaces this description._`) or the final
   document; `tk.ts plan list` to see whether a `Depends on plans:`
   conclusion was reached; `tk.ts plan status <master>` for every ticket
   filed so far with its status.
3. `tk.ts show <step key>` for each filed step, and each question. They are
   `backlog` drafts of this token (the Status column says so) — the window
   in which `plan update <master> step-NN -` rewrites them. Anything that is
   **not** `backlog` (a `todo` step, a `done` planning ticket, barriers
   present) means the plan was already released once: then this is a
   revision, not a resume — stop and tell the user to run `/plan-steps` (its
   `plan revise` branch) instead.
4. **Decide the resume point** and log it first:
   `tk.ts plan note <master> "Resumed planning after interruption at step N
   (<what exists: notes, master, steps, questions>; <what is missing>)."`.
   Then continue the ordinary procedure from that point:
   * the master carries a `**Planning request:** TICK-nn` line → make sure
     that request has its title. A request filed **without a title** is
     named by `plan open --request` (plan-steps §1 *The title line*), and the
     session may have died before that write landed: run
     `tk.ts plan title <request key> "<the plan's title, without its tier
     suffix>"`. It is safe to run blind — a request that already has a title
     (the earlier session's, or its author's) answers `<KEY> already has a
     title — left as it is` and exits 0;
   * no `plan list` review or no calibration brief in the log → do plan-steps
     §1's "Review existing plans" and "Calibrate" now (and note them);
   * no research note → research as §1 says and note the summary; a research note that exists is
     reused — re-read only what the design still needs, do not redo it;
   * no decision table / question list → settle them and note them;
   * master provisional → compose §2 and `plan master <master> -`; master
     written → re-read it and check it still matches the decisions and any
     steps already filed — fix it with `plan master <master> -` if not;
   * steps: compare every filed step against the master's step index and
     wave sections — `plan update <master> step-NN -` the ones that disagree
     or are incomplete (a document cut off mid-heredoc is a real possibility:
     check each one ends with its `## Verification` section), `plan step
     <master> -` the missing ones in dependency order, then note "steps
     filed: …" with the full list;
   * questions: file the missing ones (§3b), note "questions filed: …" or
     "no human questions".

## 2–3. Master, steps, questions (plan-steps §2 and §3, unchanged)

Exactly as plan-steps says. The only difference is that some of it is already
there: extend and correct, do not duplicate — re-filing an existing `step-NN`
is an error, and a second master or planning ticket is a defect a human has
to cancel.

**The effort line.** A planner chooses at most High by its own judgement; Very High (the only effort that runs on Fable) is a person's choice. The server applies a person's request effort to the master. Before `plan release`, make sure the master document
carries its `**Effort:** very high|high|medium|small — <why>` line
(plan-steps §2 item 1d) directly under `**Mode:**` (after `**Run:**` in a
run plan): `tk.ts plan status <master>` prints `Effort: none` when the
interrupted session never wrote it — a provisional master has none. Choose
it as that item says and file it with `plan master <master> -`; an effort a
person set on the plan's request wins and one the auto worker estimated is
the default (plan-steps §1 *The effort line*).

## 4. Release (plan-steps §4, one difference)

`tk.ts plan release <master> --tokens-in <N> --tokens-out <M> --note "estimated — resumed session"`
with **this session's** context as the estimate. The interrupted session's
usage was never recorded (release is what records it, and it never ran) — do
not guess at it. Everything else is the ordinary
release, checked against plan-steps §4's checklist.

If `plan status` showed barriers already present before this session's
release (the earlier session died *inside* `plan release`, after the barriers
and before closing the planning ticket), release is idempotent: run it once
and read the log — it skips what exists and finishes the rest.

## 5. Report (plan-steps §5, additions)

Everything plan-steps §5 lists, and:

* that this was a resumed planning session: the story, the planning ticket
  key, the heartbeat age at resume and whether `--force` was used and why;
* the resume point (which of the seven steps the earlier session had
  reached, from the log) and what this session added or corrected — steps
  rewritten (`plan update`), steps added, master rewritten;
* that the interrupted session's token usage is not in the planning ticket's
  usage row — only this session's estimate is.
