---
name: respond
description: Answer one comment a human marked "Request agent response" — or one simplify request, where a person pressed Simplify on an agent's comment — and nothing else: `tk.ts respond next` pulls the oldest request and goal-locks the token to it, `tk.ts respond post` answers it (`--to` a reply, `--summary` a simplified text) and clears the lock. Use when the user says "/respond" or "answer the pending comment". Takes no argument.
---

Base directory for this skill: `.claude/skills/respond`

# Respond

A person reading a ticket sometimes wants an agent's answer in the thread —
"why did you pick this approach?", "what does this error mean?", "is this
still true after TICK-412?" — without handing the agent the ticket. They
tick **Request agent response** when posting a comment or a reply; the
comment then waits in the **respond queue** until an agent takes it.

The same queue holds a second kind of request. A person reading an
**agent's** comment that is too long or too dense presses **Simplify** on
it: a *simplify request*. Its answer is not a reply but a **summary** — a
shorter, plainer version stored on that comment, which the person then sees
by default (with the original one tab away).

`/respond` is that agent. It takes one request, reads the thread the server
hands it, writes one reply — or, for a simplify request, one summary —
posts it, and stops. It is **not** work: no
ticket is claimed, no status moves, no story is taken, no code is pushed.
The server enforces that — from `respond next` until the reply lands, the
token is **goal-locked**: every write except the reply (and heartbeats,
reads and plain comments on that ticket) is refused with 403 `goal_locked`.
Under a simplify request the summary is the **only** write — a comment on
the ticket is refused too.

## 0. The bridge

Every call goes through `bun .claude/skills/plan-steps/tk.ts`; the token and
environment are the ones the plan-steps skill documents in its §0 table
(`TICKETING_PAT` in `.env`, `TICKETING_URL`, optional `TICKETING_PROJECT_ID`
/ `TICKETING_SEAM_ID`). Never print the PAT.

Run `bun .claude/skills/plan-steps/tk.ts me` first. It proves the server is
up and the token is valid, prints the project key, the `Session:` line and a
`Goal:` line — `none`, or the request this token already holds (a previous
run died before posting: go straight to §2 with `respond next`, which
returns the same request again).

A session id is **required**: `respond next` sends it with the pull. tk.ts
reads `CLAUDE_CODE_SESSION_ID` by itself; if it exits 2 with `no agent
session id`, that is an environment problem — report the message to the
user and stop. Never invent one.

```sh
bun .claude/skills/plan-steps/tk.ts me
bun .claude/skills/plan-steps/tk.ts respond next [--json] [--request <commentId>]  # the request + the comments up to it; locks the token
bun .claude/skills/plan-steps/tk.ts respond post <key> --to <commentId> -       # stdin = the reply; clears the lock
bun .claude/skills/plan-steps/tk.ts respond post <key> --summary <commentId> -  # Kind: simplify — stdin = the simplified comment; clears the lock
bun .claude/skills/plan-steps/tk.ts respond status [--json]                     # the goal this token holds, or `no goal`
bun .claude/skills/plan-steps/tk.ts respond --help                              # the full contract
```

**The pin.** `respond next --request <commentId>` pulls exactly that awaiting
comment instead of the queue's oldest. Without the flag tk.ts reads the pin
from the environment variable `TICKETING_RESPOND_REQUEST`, which the auto
worker sets for a session it started for one request — so in such a session
the plain `respond next` of §1 is already pinned, and you pass nothing. A
pinned pull that exits 5 (`the pinned respond request <id> is not waiting any
more — nothing pulled`) means that request was answered, withdrawn or taken
meanwhile: stop and report that it is no longer waiting — **never pull
another request in its place** (not with another `--request`, not by clearing
the variable).

## 1. Pull the request

```sh
bun .claude/skills/plan-steps/tk.ts respond next
```

The server picks the **oldest** waiting request in the token's scope — a
comment awaiting an agent response, or a simplify request — stamps it as
taken by this token, locks the token to it and prints which kind it is on
the **`Kind:` line**, directly under the status line. `Kind: respond`:

```
# TICK-nn — <title>
- status: … · handler: … · assignee: … · session: <id>
Kind: respond
- request: <commentId> by user <name> · <date> · thread root <rootId>

## Comments up to the request (n)
<the thread, oldest first — the request is the last comment>

## Respond to <commentId>
Post exactly one reply to that thread:
    bun .claude/skills/plan-steps/tk.ts respond post TICK-nn --to <commentId> -
```

`Kind: simplify`:

```
# TICK-nn — <title>
- status: … · handler: … · assignee: … · session: <id>
Kind: simplify
- comment: <commentId> by pat <name> · <date>

## Comments up to the comment (n)
<the thread, oldest first — context only; the comment to simplify is the last one>

## Comment to simplify — <commentId> by pat <name>
<the agent's comment, verbatim>

## Latest simpler version
<the newest summary so far — printed only when an earlier round produced one>

## Instructions
<the server's instructions on how to simplify, verbatim>

## Simplify <commentId>
Post exactly one summary of that comment — the simplified text only, never a comment or a reply:
    bun .claude/skills/plan-steps/tk.ts respond post TICK-nn --summary <commentId> - <<'DOC'
    …the simplified comment…
    DOC
```

The `Kind:` line decides everything that follows: §2 and §3 each have one
branch per kind, and the two are never mixed — a respond request is never
answered with `--summary`, a simplify request never with `--to`.

**Ask tickets.** When an `Ask: yes — this ticket has no body; the thread
below is the whole question` line is printed directly under `Kind:`, the
ticket is an **ask**: it exists only to hold this conversation. There is no
description, no plan and nothing to execute — do not look for one. Answer the
person's question from the thread, reading the repository as far as the
answer needs (read-only, as for every respond request: nothing is edited,
committed or pushed), and say plainly in the reply when the answer would need
a plan — the person files one with **New plan**.

- **Exit 5** — nothing awaits. Tell the user so, and how a request is made:
  on any ticket, a person ticks **Request agent response** when posting a
  comment or a reply (on the ticket page or in the ticket modal), or presses
  **Simplify** on a comment an agent wrote. Stop.
- **Exit 2** — the token may not pull (`work:pull` + `comments:write` are
  needed; an org admin grants them under Organization → Tokens), no session
  id resolved, or the server predates respond requests. Report the message
  verbatim and stop.
- **Exit 0** — you hold the request. Everything you need is on screen.

## 2. Read, then write

**The printed comments are the whole context.** They are the ticket's
comments up to and including the request — deliberately not the ones after
it, and not other tickets. Do not `tk.ts show` other tickets, do not browse
the board, do not pull anything else. If the question is about code, you may
read the repository — **read-only**: no edits, no commands that change the
working tree, no commits.

**`Kind: respond`** — write the reply as an answer to the **request comment**, for the person who
asked, in Markdown: concise, factual, with file paths and ticket keys where
they help. If the request cannot be answered — the question is unclear, the
information is not in the thread or the code, it asks for an action an agent
must not take — **say so in the reply itself** (what is missing, what you
would need, or who should decide). Never leave the goal open waiting for
more context: an unanswered request keeps the token locked.

**`Kind: simplify`** — nobody asked a question; a person wants the agent's
comment in a shorter, plainer form. Read the **comment to simplify** and the
comments before it (they are context: what the comment was answering, which
ticket keys and names it refers to). Then:

- **Follow the printed `## Instructions` exactly.** They are the server's
  text, written for this task, and they **win over this skill's general
  writing advice** above and over your own habits — length, order, what to
  keep, what to drop. If they and this skill ever disagree, the printed
  instructions are right.
- When `## Latest simpler version` is printed, an earlier round was not
  simple enough: simplify the **original** comment again, clearly simpler
  and shorter than that version, never longer.
- Write **only the simplified text** — it replaces the comment on the
  person's screen, so no preamble, no "here is", no sign-off, no remark
  about what you did.
- **Add no new fact.** Everything in the summary is in the original
  comment; do not correct it, extend it or update it from the repository —
  a simplification is not a review. (You need not read the code at all.)
- **Never answer the thread and never post a comment.** Not a reply, not a
  note that it was simplified — under a simplify request a comment is
  refused with `goal_locked` anyway. The summary is the whole answer.
- If the comment cannot sensibly be made simpler (it is already one short
  sentence), post that sentence, tightened, as the summary: the goal must
  still be answered, and only a summary answers it.

## 3. Post the reply

**`Kind: simplify`** — the summary goes through `--summary`, with the
comment's id exactly as `respond next` printed it:

```sh
bun .claude/skills/plan-steps/tk.ts respond post TICK-nn --summary <commentId> - <<'DOC'
…the simplified comment…
DOC
```

tk.ts sends `POST /api/comments/:commentId/summaries { body }` — never a
comment, never a commit. The server stores the text as that comment's newest
summary and clears the goal in one transaction, and tk.ts prints `simplified
on TICK-nn — summary <id> on comment <commentId> · goal cleared`. A blank
summary or one over 20000 characters is refused by tk.ts before anything is
sent (exit 2); 409 `simplify_not_taken` means the request was withdrawn or
taken back by a person — `respond status` shows whether a goal is still
held, and there is nothing more to post for it. Give exactly one of `--to`
and `--summary`. The rest of this section is the reply of a
`Kind: respond` request; the exit-12 and `goal_locked` rules at its end
hold for both kinds.

**`Kind: respond`** — pipe the reply through a quoted heredoc so backticks and `$` survive, with a
delimiter the reply does not contain:

```sh
bun .claude/skills/plan-steps/tk.ts respond post TICK-nn --to <commentId> - <<'REPLY'
…the reply…
REPLY
```

tk.ts sends `POST /api/tickets/:id/comments { body, respondsTo }` — never a
commit, never `--push`. The server places the reply in the request's thread,
marks the request **Answered** and clears the goal in one transaction, and
tk.ts prints `responded on TICK-nn — comment <id> answers <commentId> · goal
cleared`. The answer is never held for approval — on a human-handled ticket
either, it is visible at once.

- 409 `respond_not_taken` means this token does not hold the goal for that
  comment — the request was withdrawn, unlocked by a human, or never pulled
  in this run. Run `respond next` again; if it hands you a different request,
  answer that one instead.
- `respond next` may also exit 12:

  > **Exit 12 — the auto worker is halting.** A manager pressed *Halt after
  > current ticket*: the server hands this token no further ticket. It is not a
  > failure and not something to retry. Take nothing more; let every agent
  > already dispatched finish its ticket normally (`done`, `fail`, comments and
  > pushes all still work); then stop. **Do not** release the story, do not run
  > `tk.ts sync`, do not file a fix or a question about it, and do not move any
  > ticket you did not finish. Report "halted by the auto worker" with the
  > tickets finished and the tickets left; the story stays with this token and
  > is resumed with `/plan-resume` after a manager presses Resume.

  For this skill: **nothing was taken and no goal is held** — write no
  reply, stop and say "halted by the auto worker"; the comment keeps
  waiting and is answered by the next `/respond` after a manager presses
  Resume (there is no story to leave or resume here).
- If **any other** tk.ts command answers `goal_locked` (exit 11), stop and
  show the user the message: it names the exact `respond post` command that
  clears the lock (`--to` for a respond goal, `--summary` for a simplify
  goal). Do not try to work around it, and do not ask the server
  to unlock — only a person can, from the Workers page.

## 4. Tell the user

Report, in a few lines:

- the ticket key and its link: `<TICKETING_URL>/tickets/<id>` (`TICKETING_URL`
  is the base `tk.ts me` prints, `http://localhost:3100` by default; the id
  is in the `--json` output or on `tk.ts show`);
- that the reply is in the request's thread and the request now reads
  **Answered** — or, for a simplify request, that the comment now shows the
  new simpler version (the original stays one tab away);
- that the token is unlocked again (`respond status` prints `no goal`).

## Rules

- **One request per run.** Answer it and stop; do not pull a second one in
  the same `/respond` invocation — whichever kind it was.
- **A simplify request is answered with a summary, nothing else.** Follow
  the printed `## Instructions`, add no fact, post no comment.
- **Never acquire work.** No `tk.ts next`, `claim`, `start`, `done`, `fail`,
  `plan …`, `story take` — responding is not execution, and while the goal
  is held the server refuses them anyway. Never run `/plan-go`.
- **Never edit the ticket** — no description, title, estimate, labels,
  assignee or status changes; no new tickets.
- **Never ask the server to unlock the token.** Only a person can, on the
  Workers page. An agent clears its goal only by posting the reply (or the
  summary).
- **Never invent a session id, never print the PAT, never push a commit.**
- The reply is the answer: everything the person needs goes into the one
  comment posted with `respond post` (or the one summary posted with
  `respond post … --summary`), not into extra comments elsewhere.
