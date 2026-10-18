# plan-steps — 2c. The split (SPLIT)
Read from `/plan-steps` §2c when the router (§1) picked SPLIT; §0–§1 of `SKILL.md` in this folder apply here as they do there, and every `§` named below is a section of that file.

When the router (§1) picked SPLIT, the answer is **not a plan**. The request
asks for more plans, so this session cuts it into plans and files one **plan
request** per plan — each a human-handled ticket parked in review, exactly
like one filed from the New plan modal with **File plan request** — and hands
the request it pulled (the **origin**) back to its human. No story, no
master, no planning ticket, no steps, no barrier; nothing here can run. Each
generated request waits for a person's **Approve for Planning** and is then
planned by a later `/plan-steps` run of its own.

1. **Nothing is opened.** A split never runs `plan open`, never runs
   `plan calibrate` and has no planning ticket. A split **writes no
   `**Effort:**` line** anywhere — there is no master to carry one, and a
   generated plan request never does (tk.ts ignores the header there with a
   warning); each generated request gets its own effort — a person sets it
   on the request, or the auto worker estimates it once the request is
   ready — and the master's when it is planned. Run `tk.ts me` (server up,
   token valid, session id present). The origin is the request `plan next`
   pulled: it stays `in_progress`, assigned to this token, for the whole
   split, and it is where the notes and the planning usage go. **An untitled
   origin is named here**: when `plan next` printed `Title: none — …` (§1
   *The title line*), run `tk.ts plan title <origin> "<title>"` with a title
   chosen from its description (≤ 256 characters) before the note of item 4
   — there is no `plan open` to do it for you. An origin whose line reads
   `Title: set by its author` is left alone.
2. **Research only as deep as cutting needs**: which areas the request spans,
   what already exists, where the natural seams between plans are. Run
   `tk.ts plan list` — **never generate a plan an open plan already covers**;
   say in the note and the report which plan covers it instead. The detailed
   research belongs to the planner of each generated request, not to you.
3. **Cut the request into plans.**
   - Each plan is **independently shippable** and **plannable from its own
     text alone** — its planner sees that request and nothing of this
     session. Normally 2–8 plans; one plan is not a split (item 9), and more
     than eight usually means the cuts are steps, not plans.
   - **Order them**: which must land before which.
   - **Choose each one's mode** with the router's tier test (§1 *Route the
     request*) applied to that plan alone: `plan-full`, `plan-quick` or
     `plan-single`. A run mode (`plan-run`, `plan-run-quick`) **only** when
     the origin's text asks for unattended runs. **Never `plan-split`** — a
     split never generates another split, and tk.ts refuses it (exit 2).
   - When the split came from the text override (§1: the origin carried
     another mode label), that carried label is the default mode of every
     generated request; depart from it only where a plan plainly fails that
     tier's test, and say so in the note.
4. **One note on the origin** — `tk.ts comment <origin> -` — before filing
   anything. It opens with `**Tier:** SPLIT — <reasons>` (the `plan-split`
   label on the request, or the words of the text that ask for plans; the
   override, when one applied) and holds the table of plans you are about to
   file (title, mode, depends on) and the decisions you took while cutting,
   including anything you left out because an open plan covers it.
5. **File each request, in dependency order**, one heredoc each:

   ```sh
   bun .claude/skills/plan-steps/tk.ts plan split request --from <origin> - <<'DOC'
   # <title of this plan — the goal itself, no prefix>

   **Plan mode:** plan-full
   **Priority:** medium

   **Depends on requests:** TICK-nn — <why this plan needs that one first>

   <the goal of this plan, in full sentences>

   ## Context

   <what exists today, with real paths; what the origin asked for, as far as it concerns this plan>

   ## Scope

   <what this plan delivers>

   ## Out of scope

   <what the sibling plans deliver instead, and anything the origin excluded>
   DOC
   ```

   - `# <title>` becomes the ticket title as written — at most 256
     characters; a longer one is refused (exit 2), never cut.
   - `**Plan mode:**` is **required** and is one of `plan-full`,
     `plan-quick`, `plan-single`, `plan-run`, `plan-run-quick`;
     `plan-split` is refused (exit 2). `**Priority:**` is optional. tk.ts
     strips the title and these two header lines and files the rest verbatim.
   - **The body is the complete prompt of that plan.** The planner who pulls
     this request quotes its description verbatim as the plan's
     `## Original prompt`, so write it as a request a person would file:
     the goal, the context with real paths, the scope, what is out of scope.
     No `Role:` line, no reference to "this session" or to a table only the
     origin holds.
   - `**Depends on requests:**` is optional and stays in the description: it
     names the keys **already printed** for earlier siblings (which is why
     the requests are filed in dependency order), one `TICK-nn — why` per
     key. The planner of this request turns it into `**Depends on plans:**`
     (§1 *Review existing plans*).
   - It prints `request <KEY> (<id>) in_review handler human labels planning,
     <mode> — from <ORIGIN|prompt>; awaiting Approve for Planning`. Note
     every key. The request is story-less, sits under the origin, and is
     parked through `POST /api/tickets/:ticketId/plan-request-submit` (handler
     `human`, `in_review`, unassigned) — from that moment it is read-only for
     you, like any released ticket.
   - When the parking fails after the ticket was created, the request is left
     as a `backlog` draft: park it with `tk.ts plan split submit <key>`
     rather than filing it again.
6. **Release the split:**

   ```sh
   bun .claude/skills/plan-steps/tk.ts plan split release <origin> --tokens-in <N> --tokens-out <M> --note estimated
   ```

   It records this session's planning usage on the origin, comments
   `Plan split — <n> plan requests filed` with the table of generated
   requests on it, moves the origin to `in_review` and asks the server to set
   its handler back to `human` (a refusal is the usual `still agent-handled …`
   warning — pass it on). It exits 1, with nothing written, when no request
   was generated or while one is still a draft. Then check the printed table
   (`Ticket · Mode · Status · Handler · State · Plan · Title`): every row's
   State is `awaiting`, its handler `human`, its mode the one you intended.
7. **A split driven by a prompt** (the skill arguments or the conversation —
   no pulled request) has no origin: file the requests with
   `plan split request -`, **without `--from`** (they are parentless and the
   printed line ends `from prompt`), write no note and run no
   `plan split release`. Say in the report that the planning usage was **not
   recorded**, and list the cut and the decisions there instead.
8. **An interrupted split is continued, never restarted.** The origin stays
   `in_progress` for this token and `plan next` never serves it again, and
   it has no planning ticket, so `tk.ts resume list` does not show it. Run
   `tk.ts plan split status` with no argument: it lists this token's
   unfinished pulls (exit 5 when there is none). Continue with
   `plan split status <origin>`, read the note on the origin
   (`tk.ts show <origin>`), file only the requests that are missing, park any
   `draft` row with `plan split submit <key>`, then release — **never file a
   request twice**.
9. **A request that does not need several plans** — research shows one plan
   covers it — is not force-split: plan it as the tier it really is, with
   `plan open --request <origin> -` and the ordinary procedure from §1 *Open
   the plan now* on, and give the reason in the first `plan note` (e.g.
   `**Tier:** FULL — plan-split label on TICK-nn, but one plan covers it:
   <why>`). Say so in the report.


## Release and report

**A split has no `plan release`.** It files no master, so there is nothing to
release, park or confirm: `plan split release <origin>` (item 6) hands the
origin back, and nothing of a split can run. Each generated request waits for
**Approve for Planning** on its own ticket, is then pulled by a later
`/plan-steps` run and goes through its own planning and its own **Confirm
plan**.

In the report (§5), **when this run was a split**, none of the plan bullets
apply; report instead:

- the origin's key and title and that it is now in review for its human
  (or, for a prompt-driven split, that there is no origin);
- every generated request: key, mode and title, in dependency order, with
  which request depends on which;
- the override, when the origin carried another mode label and its text
  asked for plans — which label, and that it became the default mode of
  the generated requests;
- anything left out because an open plan already covers it (that plan's
  key);
- **that nothing is planned yet**: each generated request needs
  **Approve for Planning** on its ticket page or on `/attention`, is then
  planned by a `/plan-steps` run of its own, and that plan needs its own
  **Confirm plan** before it runs;
- the usage recorded on the origin — or that it was **not recorded**, for
  a prompt-driven split;
- any warning tk.ts printed, verbatim (a handler warning on the origin, a
  request left as a draft).
