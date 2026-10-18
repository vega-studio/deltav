# plan-verify — notes for a person running the skill by hand

Nothing in this file is needed by an unattended run: the auto worker sends
`/plan-verify` as a follow-up in the session that just ran the plan, which
knows the master. It holds what `SKILL.md` left out because only a person
needs it.

## The token

`.env` supplies `TICKETING_PAT` and `TICKETING_URL`. The PAT needs
`tickets:read`, `tickets:write` and `comments:write`; filing an item also needs
the org's `question` and `review` labels to exist (tk.ts warns loudly if they do
not — without `review` the server does not treat the ticket as a review item at
all). `tk.ts me` prints the PAT's name, the project, the current sprint, the
sprint's repository and branch, and the resolved session id (tk.ts resolves it
from `--session` → `TICKETING_SESSION_ID` → `CLAUDE_CODE_SESSION_ID`). The full
bridge — the environment variables, the session id, the heredoc rule — is
documented once, in `.claude/skills/plan-steps/SKILL.md` §0.

## Running it from a cold context

A cold context still works; it has to reconstruct from the tickets what the
session that ran the plan already knew.

`story find` with no name and `resume list` both refuse a finished story —
they look for work to *do*. With a name, a unique case-insensitive substring
is enough; a master key or a story id works too, and it returns a finished
story. With no argument the fallback is:

```
bun .claude/skills/plan-steps/tk.ts plan list --all --json
```

→ every plan of the project, newest first:
`[{ key, id, status, title, storyId, storyName, dependsOn }]`. Take the newest
entry with `status === "done"`; that is the plan that just ran. Show the user
which one you picked (key and title) before filing anything — if two plans
finished close together, the wrong guess files a list against the wrong
feature.

`plan status <master>` prints the ticket table (`Ticket · Ref · Kind · Wave ·
Status · Assignee · Blockers`) plus the story/sprint footer and the points and
token totals.

## Not the plan-approval gate, and the names in the code

This repository already uses the words "plan review" for something else —
`POST /api/tickets/:ticketId/plan-review`, the state a released plan waits in
until a human presses **Confirm plan** on its master (`tk.ts plan release`,
`plan revise`, the **Back to review** button,
`test/integration/plan-review.test.ts`). That gate decides whether a plan *may
run*. This skill runs *after* a plan has already run and decides what a person
should look at. They share a word and nothing else. When you grep for
"plan-review" you will find that feature, not this one.

`/plan-go` never files review items; this skill is invoked explicitly,
afterwards, by a person who wants the list — or by the auto worker, as the
follow-up of a finished run.

The code and `tk.ts review --help` still refer to these two skills by the names
they were planned under, `/plan-review` and `/plan-review-fix`. Those are this
skill and `/plan-verify-fix`; the skills were renamed, the vocabulary in the
code (`review-submit`, `review-decision`, `Role: REVIEW ITEM`, `tk.ts review
…`) was not.

## How an item is filed, under the hood

The item is created agent-handled and labelled (the only shape a PAT may
create), then parked for its human with
`POST /api/tickets/:ticketId/review-submit` — the one elevated `agent → human`
write.

## Section 7 — the two sentences that matter to the reviewer

1. *These are waiting on you.* They are on `/attention` and on the board
   under **Needs human** in the **In review** column; open one, press
   **Performing review**, walk the steps, then **Review passed** or **Review
   failed** — and a failure **requires** a comment saying what you saw.
2. *While any review item is open, this story's work queue is held* — the
   server hands out none of the story's tickets until every one of them is
   passed or cancelled. That is intended: an unverified claim pauses the
   plan. Cancelling an item releases the hold just as passing it does.
