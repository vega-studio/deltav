# plan-steps — Running the skill by hand
Read from `/plan-steps` §0 by a person running the skill by hand, and by a session whose `plan next` found nothing to plan. Nothing here changes what the skill does: it is what a person needs to set the skill up, to file work for it and to read what the UI shows. An unattended session (the auto worker) never needs this file.

## The token and the environment

tk.ts reads everything from the environment:

| Variable | Where | Meaning |
|---|---|---|
| `TICKETING_PAT` | `.env` (gitignored; Bun loads it automatically) | `tk_pat_…` token minted under *Organization → Tokens*. Needs `tickets:read`, `tickets:write`, `estimates:write`, `comments:write`, `usage:write` (tk.ts posts the planning usage); the executor's token (`/plan-go`) additionally needs `tickets:claim` and `work:pull` for `tk.ts next`. Agent comments carry a verified commit: once the sprint has a repository, `plan note` and `plan release` send HEAD (the server checks it is on the remote), `comment`/`done` send the pushed HEAD. |
| `TICKETING_URL` | `.env` | Base URL, default `http://localhost:3100`. |
| `TICKETING_PROJECT_ID` / `TICKETING_SEAM_ID` | `.env`, optional | Only when the token reaches more than one project / seam. |
| `CLAUDE_CODE_SESSION_ID` / `TICKETING_SESSION_ID` / `--session <id>` | set by Claude Code itself — nothing to configure; the other two only for a harness without it (**never in `.env`**) | The id of this chat session (`claude --resume <id>`). Tickets require it: tk.ts resolves `--session` → `TICKETING_SESSION_ID` → `CLAUDE_CODE_SESSION_ID` and reports it on every claim, pull and transition (the ticket's **Session id**, `agentSessionId`); the server refuses an agent claim, pull or move to `done` without one (400 `validation_failed`, `session_required`), and `plan open` and `plan next` exit 2 without one. A `session_required` refusal or that exit 2 is an environment problem to report, never an id to invent. |

## No planning request is queued (`plan next` exit 5)

Exit 5 of `plan next` means nothing is queued: **stop and tell the user** there is no
planning request to work on, and how a person files one — press `p` (or
click **New plan** in the top bar) on **any** screen, which opens the New
plan request modal: pick the project (it defaults to the open one), pick
the **Plan mode** (required — it attaches one plan-mode label, see *The
mode label picks the strategy* in `SKILL.md` §1), describe what needs planning, then
either **File plan request** (filed
human-handled in review for a person; someone then opens the ticket and
presses **Approve for Planning** in its comments, and only then does the
queue serve it) or **File plan as ready** (it asks for confirmation, then
files the request agent-handled in `todo`, so the queue serves it at
once). By hand
it is New ticket → label `planning`, optionally one plan-mode label,
handler **Agent**, left `todo` and unassigned. A request that was filed but not yet approved is invisible to
`plan next` — if the user says they filed one, tell them to press
**Approve for Planning** on it. (An
org that never seeded its default labels has no `planning` label; seed them,
or create a label named `planning`.)

A pull the auto worker **pinned** to one request (`TICKETING_PLAN_REQUEST`)
is different: its exit 5 means that request is no longer ready, and `SKILL.md`
§1 *The effort line* says what to do — stop and report, never another request.

## What to plan when a person typed the prompt

`SKILL.md` §1 gives the order: the skill arguments; else a clear request in
the conversation; else `plan next`. Before any of them `plan revise` runs,
and a plan sent back for revision wins even when the arguments name another
subject — the skill says which plan it is revising, and stops if the person
meant something else.

## `--hold`

`plan release <master> --hold` is for a person who asked to plan without even
parking the plan for review: everything stays in `backlog` and the master is
left untouched (no `in_review`, still handler `agent`). The planning ticket
is still closed. The plan then needs a `plan release` without `--hold` before
a human has anything to confirm. `--hold` cannot be combined with `--run`.

## What the UI shows

- **Sections.** The UI renders a ticket's body sections under the
  description, each collapsible under a title taken from its type, with one
  **Collapse all / Expand all** control over the list.
- **The Sprints page** shows the planner as the owner of the story while the
  plan is being written; a human configures the sprint's git repository and
  integration branch there.
- **Confirm plan**, on the master's ticket page, posts "Plan approved" as
  that human, hands the master back to the agents and moves the plan's
  agent-handled backlog tickets to `todo`. **Revise plan** posts what the
  human wants changed and hands the master back, still in review.
- **Agent comments awaiting approval.** When the parked master carries
  comments an agent added, **Confirm plan** and **Revise plan** first ask the
  human to approve them all, delete the unapproved ones, or cancel (cancel
  changes nothing).
- That a confirmed plan with an open human question hands out nothing is
  verified in `test/integration/plan-review.test.ts`.
- A planning request is done when its human marks it `done`; that sign-off
  and **Confirm plan** on the master are two separate reviews, and the plan
  runs only once the master is confirmed.
