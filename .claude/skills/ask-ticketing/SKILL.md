---
name: ask-ticketing
description: Answer one ticketing ask from the ticketing data alone, read-only; used by the auto worker. Pulls the ask with `tk.ts respond next`, reads with `tk.ts get` / `tk.ts show`, answers once with `tk.ts respond post`. No repository. Takes no argument.
---

Base directory for this skill: `.claude/skills/ask-ticketing`

# Ask — ticketing

A person filed an **ask** in the **ticketing** mode: a question about the
ticketing data itself — tickets, plans, stories, sprints, comments, who did
what and when — not about code. The auto worker started this session for
that one ask. Your job is to answer it from the ticketing data and stop.

## 0. What this session is

- **There is no repository.** The working directory holds only
  `.claude/skills/`. Do not look for a checkout, do not clone, do not search
  the disk for source code: the answer comes from the ticketing API alone.
- **The token mirrors the asker.** `TICKETING_PAT` is a per-ask token that
  reads exactly what the person who filed the ask can read in that
  organization, recomputed on every request. So a `404 not_found` means the
  asker cannot see it either: say so in the answer, never guess what it
  might contain.
- **Read only.** The token's only writes are pulling this ask's respond
  request and posting its answer. Any other write is refused with 403
  `mirror_read_only` — never attempt one (no comment elsewhere, no
  transition, no ticket, no `tk.ts next`, `claim`, `plan …`, `report`,
  `ask`, `done`, `fail`).
- Every call goes through `bun .claude/skills/plan-steps/tk.ts`. Never
  print the PAT.

## 1. Take the question

```sh
bun .claude/skills/plan-steps/tk.ts respond next
```

The auto worker sets `TICKETING_RESPOND_REQUEST`, so this pull is pinned to
the ask's comment — pass nothing. It prints the ask (a `Kind: respond` and an
`Ask: yes` line) and the thread up to the question; the last comment is the
question. Exit 5 (`the pinned respond request … is not waiting any more`)
means it was answered or withdrawn meanwhile: stop and report that — never
pull another request. Exit 2 with `no agent session id`: report it and stop;
never invent a session id.

## 2. Read

```sh
bun .claude/skills/plan-steps/tk.ts get <api path> [--json]   # GET of one /api/… path, printed as JSON
bun .claude/skills/plan-steps/tk.ts show <KEY>                 # one ticket, its sections and comments, readable
```

`tk.ts get` is the read door: GET only, `/api/…` paths only. The useful
paths (`<orgId>` and the project ids come from `get /api/pats/me` — its
`orgId` and `projects`):

| Path | What it gives |
|---|---|
| `/api/pats/me` | the token's organization and the projects it reaches |
| `/api/orgs/<orgId>` | the organization |
| `/api/orgs/<orgId>/projects` | its projects |
| `/api/orgs/<orgId>/tickets?q=…` | search across the organization's projects |
| `/api/projects/<projectId>/tickets?…` | search one project: `q`, `key=TICK-12`, `status=done,cancelled`, `handler`, `sprintId`, `storyId`, `parentTicketId`, `labelIds`, `limit` (≤ 200), `cursor` (the page's `nextCursor`) |
| `/api/projects/<projectId>/sprints`, `/stories`, `/labels` | sprints, stories, labels |
| `/api/sprints/<sprintId>`, `/api/stories/<storyId>` | one sprint, one story |
| `/api/tickets/<ticketId>` | one ticket |
| `/api/tickets/<ticketId>/comments` | its comments |
| `/api/tickets/<ticketId>/history` | its history: transitions, assignments, edits |
| `/api/tickets/<ticketId>/blockers`, `/dependencies`, `/commits`, `/usage` | blockers, dependencies, commits, token usage |
| `/api/orgs/<orgId>/project-summaries` | the projects' public summaries (cards) |
| `/api/projects/<projectId>/summary` | one project's public summary |

Read as much as the answer needs, and no more. Prefer narrow queries
(`key=`, `status=`, `storyId=`) over paging through everything.

## 3. Answer once

```sh
bun .claude/skills/plan-steps/tk.ts respond post <KEY> --to <commentId> - <<'REPLY'
…the answer…
REPLY
```

`<KEY>` and `<commentId>` are the ones `respond next` printed. Write the
answer for the person who asked, in Markdown: concise and factual, with
ticket keys, dates and counts where they help. Say plainly what you could
not see (a 404 — the asker cannot see it either) or what the data does not
record; never fill a gap with a guess. When the question asks for an action
(change a ticket, run a plan), say that an answer cannot do it and who can.
Post exactly one answer: it clears the token's goal and ends the session's
work.

## 4. Report

In a few lines: the ask's key, that the answer is posted in its thread, and
anything you could not read.
