---
name: plan-verify
description: Files the manual checks a finished plan could not prove by itself — one review item per claim no test covers (`tk.ts review file`), parked for a person under the plan's master; an agent never gives a verdict, and an open item holds its story's queue. Use when the user says "/plan-verify" or "file the review items", right after /plan-go in the same context. Argument: a story name or master key (none: the plan this context just ran).
---

Base directory for this skill: `.claude/skills/plan-verify`

# Plan Verify

A plan is done when its tickets are done, not when the feature is known to
work. `/plan-go` closes a plan on green tests, a clean typecheck and the
master's verification — and every plan leaves behind claims that none of that
touched: how a thing looks at 1280px, whether a hotkey fires, whether the
migration survives the real data, whether the copy reads like the rest of the
product. This skill turns those leftovers into **review items**: one ticket per
check, written for a person, filed under the plan's master.

It runs **right after `/plan-go`, in the same context, without `/clear`** —
that context is the evidence: it knows which step hedged its `done` comment
and which verification was "typecheck only".

A person running this skill by hand — from a cold context, or wanting the
token's scopes, the history of the skill's name or the words for the
reviewer — finds them in `.claude/skills/plan-verify/MANUAL.md`. An
unattended run never reads it.

## 1. What this is, and what it is not

A **review item** is a ticket that says "a person must check this by hand,
because the agent that built it could not prove it with a test". Its resting
shape is **handler `human`, status `in_review`**, carrying the organization's
`question` and `review` labels, filed as a child of the plan's master inside
the plan's story, with `Role: REVIEW ITEM of TICK-nn` opening its description.
It carries **no estimate** — human verification costs the project no tokens.

Its life, and the only path through it:

1. `tk.ts review file` creates it and parks it → **awaiting** a reviewer.
2. A human presses **Performing review** (it is claimed by them and goes
   `in_progress`) → **reviewing**.
3. **Review passed** → `done`. **Review failed** → *a comment is required*, and
   the item returns to the agents as `todo` + handler `agent`, unassigned, with
   the reason in its comments → **failed**.
4. `/plan-verify-fix` fixes a failed item and `tk.ts review submit`s it, which
   puts it back at step 1. Same ticket, whole history, as many rounds as it
   takes.

**An agent never decides a verdict.** Passing and failing are
`POST /api/tickets/:ticketId/review-decision`, which is humans only (a PAT gets
403 `handler_locked`); `tk.ts` offers no command for it and none may be
invented. This skill's entire job is step 1.

**What it is not:**

* It is **not** the plan-approval gate — "plan review", **Confirm plan** on a
  master — which decides whether a plan *may run*. This skill runs *after* a
  plan has run.
* It is **not** part of `/plan-go`, which never files review items.
* It does **not** re-verify anything itself. If something can be checked with a
  command, it is not a review item — it is a test, and a `tk.ts fix` ticket if
  it is missing.

## 2. The ticketing bridge

Every call is `bun .claude/skills/plan-steps/tk.ts …`, run from the project
root: this skill needs no worktree, and nothing is written to or read from
the file system — the tickets are the only artefact. The bridge is
`.claude/skills/plan-steps/SKILL.md` §0; **never print the token**. Filing an
item needs the org's `question` and `review` labels (§6).

* **Session id.** tk.ts sends it by itself. A command that exits 2 with
  `no agent session id` is an environment problem to report — **never invent
  an id**.
* **Exit codes** used below: `0` ok, `1` error, `2` usage / no session id,
  `3` story taken by another agent, `5` nothing found (no plan, no review item),
  `7` the sprint has no repository.

Start with `bun .claude/skills/plan-steps/tk.ts me`. If `Session:` says
`none`, stop and report it.

## 3. Finding the story

1. **This session ran the plan (the normal case).** The `/plan-go` run that
   just finished already gave the story name and the master key. Use them;
   there is nothing to discover.
2. **An argument was given** (`/plan-verify <story name>`, a master key or a
   story id): `tk.ts story find "<story name>" --json` →
   `{ story: { id, name, sprintId, sprintName, assignee }, master: { key, id, status, title } }`.
   With a name it returns a finished story too, which is what is wanted here.
3. **Cold context, no argument.** `tk.ts plan list --all --json`, newest
   first: take the newest entry with `status === "done"` and name it (key and
   title) before filing anything.
4. **Read the plan** before deciding anything: `tk.ts plan status <master>`
   (the ticket table) and `tk.ts show <master>` (the plan's goal, its design
   decisions and its plan-wide verification).
5. **The master must be `done`.** That is what "the plan that just ran" means,
   and it is when `/plan-go` has released the story, synced the project root and
   removed the worktree — so the code under review is in the main checkout. If
   the master is anything else, **stop and report it**: `in_review` means the
   plan has not even been approved, `todo`/`in_progress` means it is still
   running and its review list would describe work that does not exist yet.
   Filing against an unfinished plan is allowed only when the user explicitly
   asks for it after you have said so.
6. **Existing items.** `tk.ts review list <master>` (exit 5 and
   `tk: no review item under <master>` when there are none). A second
   `/plan-verify` run on the same plan does **not** start numbering again:
   `review file` refuses a `review-NN` that already exists. Read the list, keep
   counting from the highest number, and do not re-file a check that is already
   there.

## 4. Deciding what to review

**One review item per claim the plan could not prove itself.** That is the
whole rule, and it cuts both ways: a claim a green test already covers is
**not** a review item, and a claim nothing covers **is** one, however small.

Work it out from the evidence, not from memory:

* `tk.ts show <step key>` for every step in the `plan status` table. A step's
  `done` comment says what changed and what was verified — and, more usefully,
  what was not: "typecheck only", "no browser available", "the migration was
  tested against an ephemeral cluster", "the layout was not looked at". Any
  hedge in a `done` comment is a candidate.
* The master's and the barriers' verification sections: what commands ran, and
  what they can and cannot see.
* The plan's goal and design decisions (`show <master>`): every user-visible
  promise in the goal that no command in the verification sections touches.

Good candidates, in rough order of how often they matter:

* **Visual and layout** — spacing, alignment, truncation, dark mode, a width
  the tests never render at.
* **Interaction** — drag, hover, focus order, hotkeys, Escape/Back, a modal's
  scroll behaviour.
* **Anything behind a real browser** — bundling, streaming, an animation, a
  route that only exists once the client hydrates.
* **Multi-user and timing** — two sessions, a lock, a queue hold, a webhook
  arriving late.
* **Third-party integrations** — a real provider key, a real repository, a real
  push.
* **Copy and tone** — button labels, empty states, error messages.
* **Migrations against real data** — a test cluster is empty; the production
  database is not.
* **Anything a step's `done` comment admits it left unverified.**

Not candidates: anything a test asserts, anything `bun run typecheck` proves,
internal refactors with no user-visible surface, and "check that the tests
pass".

**Cap the list.** Aim for **3–10 items** for a normal plan. A list nobody walks
is worse than no list: it converts into a story whose queue is held forever.
When a plan genuinely produced more than ten distinct human checks, merge the
neighbours (one item can hold three related things to look at on one screen) or
say in the report which ones you dropped and why.

Each item must be **executable by a person who was not here**: the exact URL or
command, the exact thing to do, the exact thing to look for, and what a failure
looks like. "Check the board looks right" is not a review item. "Open
`<TICKETING_URL>/projects/TICK/board` at 1280px, drag a ticket from Ready to In
progress, and confirm the drag ghost follows the cursor without the column
jumping" is.

## 5. The review item document

`tk.ts review file` takes the document on stdin. Its first heading must be
`# Review NN — <title>` (that is what tk.ts parses into the `review-NN` ref);
`**Priority:**` is optional and defaults to high. **Never** write an
`**Estimated scope:**` header — review items are not estimated. The `## `
headings of the document are filed as the item's body sections (the title
and `**Priority:**` line stay the description), so the reviewer sees each
one collapsible on the ticket; keep the four below and add your own typed
sections under any heading when a check needs more (`## Test data`, …).

```markdown
# Review NN — <what to check, in a few words>

**Priority:** <optional: critical | high | medium | low>

## Why this needs a person
What the plan built, and why no test proves it (name the step and what its
`done` comment did or did not verify).

## How to check
1. The URL or the command to run.
2. What to do there.
3. What should happen.

## Passes when
The observable result that means "passed" — one sentence, unambiguous.

## If it fails
Press **Review failed** and say what you saw — the ticket goes back to the
agents with your words, and `/plan-verify-fix` picks it up.
```

Write the URLs out in full (`<TICKETING_URL>/tickets/<id>`, resolved to the
real base URL from `tk.ts me`) so the reviewer can click them. Keep each item to
one screen: a reviewer reads it standing up.

## 6. Filing them

One `review file` call per item, in order, each with the document on stdin:

```sh
bun .claude/skills/plan-steps/tk.ts review file <master> - <<'DOC'
# Review 01 — The drag ghost follows the cursor on the board
…
DOC
```

Each call prints
`review-NN TICK-nn (<id>) in_review handler human labels question, review — it holds <master>'s story queue until a human settles it`.
Two things to expect:

* A warning that the org has no `question` or `review` label means the labels
  were never seeded; **stop** if `review` is the missing one — without it the
  server does not treat the ticket as a review item and its page shows no
  review composer.
* `review-NN already exists` means you re-used a number from an earlier run
  (§3 step 6). Use the next one.

Then show the result with `tk.ts review list <master>` →
`Ticket · Ref · Status · Handler · Assignee · Verdict · Title`, where the
verdict is derived: `draft` (a `review file` that died halfway — agent-handled
and still `backlog`; submit it with `tk.ts review submit <key>`), `awaiting`,
`reviewing`, `failed`, `passed`, `cancelled`. `--json` prints the same rows as
objects, `--failed` filters to the ones a human sent back, and the command exits
5 when the (filtered) list is empty.

Never transition a review item yourself, never comment a verdict on one, and
never move one to `done`: a comment by an agent on a human ticket is held for
approval and is invisible to every agent (including you) until a person
approves it, so it is not a channel — and the verdict is not yours to give.

## 7. The report

Print `tk.ts review list <master>` and report:

* the plan — master key, title, story name and sprint — and that its master is
  `done`;
* every item filed: `review-NN`, its ticket key, its one-line title and what it
  covers, each as a link (`<TICKETING_URL>/tickets/<id>`);
* anything you deliberately did **not** file, and why (covered by a test,
  merged into another item, over the cap);
* that the items wait on a person (`/attention`: **Performing review**, then
  **Review passed** or **Review failed** with a required comment), and that
  while any of them is open the story's work queue is held — by design;
  passing or cancelling an item releases it;
* that **`/plan-verify-fix`** runs after the failures are marked: it fixes the
  failed items and sends each one back for a second look.

If a plan genuinely produced nothing a person needs to check — a pure refactor
with full test coverage — file **nothing** and say so. An empty review list is a
legitimate, and much better, outcome than a list of make-work.
