---
name: report
description: File a report ticket — an agent's finding for a person to read, promotable to a plan. `tk.ts report file` files what the conversation found (a bug, debt, a follow-up idea, a risk) in this project's ticketing system (project DELTAV), story-less, parked for a person, never holding a plan's queue; nothing is executed. Use when the user says "/report" or "file a report". Argument: the finding (none: what the conversation has surfaced).
---

Base directory for this skill: `.claude/skills/report`

# Report

An agent often notices something it should not act on: a bug next to the one
it is fixing, a shortcut worth paying back, a feature the code is asking for,
a risk the user did not mention. A **report** is how that reaches a person
without pausing anything — a ticket the agent writes and a human reads.

A report is **not** a question. `tk.ts ask` files a human ticket inside a
plan's story, which holds the story's whole queue until a person answers. A
report is filed with **no story and no parent**, so no queue waits for it;
the agent files it and carries on. Use `/report` for "you should know this",
and `ask` only for "I cannot continue without your decision".

## 0. The bridge

Every write goes through `bun .claude/skills/plan-steps/tk.ts`; the token and
environment are the ones the plan-steps skill documents in its §0 table
(`TICKETING_PAT` in `.env`, `TICKETING_URL`, optional `TICKETING_PROJECT_ID`
/ `TICKETING_SEAM_ID`). Never print the PAT. Never invent a session id: a
report needs none (nothing is claimed), and if tk.ts ever exits 2 with `no
agent session id`, report that message instead of making one up.

Run `bun .claude/skills/plan-steps/tk.ts me` first. It proves the server is
up and the token is valid, and prints the project key (e.g. `TICK`) and the
`TICKETING_URL` base the ticket link is built from. If it fails, stop and
tell the user why — there is no file fallback.

```sh
bun .claude/skills/plan-steps/tk.ts me
bun .claude/skills/plan-steps/tk.ts report file [--about <key>] -   # stdin = the report document → prints `report KEY (id) in_review handler human labels report …`
bun .claude/skills/plan-steps/tk.ts report list [--open] [--json]  # the project's reports and their state; exit 5 when there is none
bun .claude/skills/plan-steps/tk.ts report --help                  # the full contract
```

`--about TICK-nn` names the ticket you were working when you noticed the
finding. It only becomes prose in the ticket's role line ("while working
TICK-nn"); the report is still story-less.

## 1. Compose the document

The document comes from the skill's arguments plus the conversation. Its
first line must be `# Report — <title>` (the dash may be `—`, `–`, `:` or
`-`; **no number** — `# Report 01 — …` is refused). The title is limited to
**256 characters**, like every ticket title (the server answers 400 beyond
it; tk.ts cuts a longer one and warns) — keep it a short sentence. It carries no
`**Estimated scope:**`, `**Depends on:**` or `**Wave:**` — a report is not
a plan step and is never estimated. `**Priority:**` is optional (critical,
high, medium, low, none; default medium).

Write it for a person who was not in this conversation:

```markdown
# Report — <one line: what was found, where>

**Priority:** medium

## Summary

Two sentences: what you found and what it affects.

## What I found

The specifics, with real file paths, symbol names, commands and their
output. Quote the offending code or message when it is short.

## Why it matters

The consequence — for the user, the data, the next agent, the release.

## Suggested next step

What a plan for this would do, in one or two sentences. This becomes the
planner's starting point if the person presses Promote to plan.
```

Each `## ` heading of the document is filed as one typed body section of the
ticket (the title and `**Priority:**` line stay the description), rendered
collapsible on the ticket page under a title taken from the heading. The four
above are the shape a reader expects; a report may add its own typed sections
under any heading (`## Repro`, `## Affected tickets`, …) when the finding
needs them.

Keep it factual: what you observed, not what you assume. If you are not
sure it is a problem, say so in the summary — the person decides.

## 2. File it

Pipe the document through a quoted heredoc so backticks and `$` survive, and
pick a delimiter the document does not contain:

```sh
bun .claude/skills/plan-steps/tk.ts report file [--about <key>] - <<'DOC'
# Report — <title>
…
DOC
```

tk.ts creates the ticket agent-handled with the org's `report` label and
then parks it for a person through `POST /api/tickets/:id/report-submit`
(handler `human`, status `in_review`, unassigned). A warning that the org has
no `report` label means the ticket was filed but the server will not treat
it as a report — tell the user to seed the organization's default labels
(or create a label named `report`) and file again.

File **one** report per finding. Two unrelated findings are two reports.

## 3. Tell the user

Report, in a few lines:

- the ticket key and its link: `<TICKETING_URL>/tickets/<id>` (the id is in
  the `report KEY (id) …` line tk.ts printed; `TICKETING_URL` is the base
  `tk.ts me` uses, `http://localhost:3100` by default);
- that it is parked for a person: it shows on `/attention` and in the
  **Reports** row of the organization board (`/orgs/<org>/board`), and holds
  no queue — nothing waits for it;
- what happens next: a person replies in a comment, then presses **Promote
  to plan** on the ticket (their note is posted with the promotion, the
  `report` label becomes `planning`, and `/plan-steps` picks the ticket up
  through `tk.ts plan next`, which prints that note after the description)
  — or resolves the ticket when no action is needed.

## Rules

- **Never execute the finding.** A report is a write-up, not a change; if
  the user wants it done, that is a plan (`/plan-steps`) or a ticket of its
  own.
- **Never pass a story or a parent.** tk.ts does not, and neither do you by
  other means: a report inside a story would hold that story's queue.
- **Never promote it yourself.** `POST /api/tickets/:id/report-promotion` is
  humans only (a PAT gets 403 `handler_locked`); tk.ts has no command for it.
- **Never record usage on it**, never estimate it, never invent a session id,
  never print the PAT.
- A comment you add to the report afterwards is a comment on a **human**
  ticket: accepted, but held for a person's approval and invisible to every
  agent until then. Put everything into the document instead.
