# plan-steps — The revision pass
Read from `/plan-steps` §1 branch 0 when `plan revise` exited 0; §0–§1 of `SKILL.md` in this folder apply, and every `§` named below is a section of that file.

**The revision pass** (only when `plan revise` exited 0). The plan already
exists — story, master, closed planning ticket, step tickets, usually the
barriers. **Do not run `plan open`**: that would file a second plan.
When the plan being revised is a `(quick)` plan (`Mode: quick` in `plan
status`), also read *Revising a quick plan* in
`.claude/skills/plan-quick/SKILL.md`.

1. **Open it:** `bun .claude/skills/plan-steps/tk.ts plan revise <master>`
   (add `--json` for the same data as a machine-readable object). It **takes
   the plan's story** for this PAT (exit 3 `story "…" is taken by <name>` →
   stop and report; never work around the lock; exit 12 → the auto worker
   is halting, stop and report as branch 0 says), prints the plan's ticket
   table and then, under `## Revision request — <n> comments on TICK-nn since
   the last plan release (<timestamp>)`, every comment posted on the master
   after the last release. **Those comments are the prompt for this pass.**
   Exit 5 means that master is still awaiting its human; exit 1 means it is
   not `in_review` at all.
   With no comment after the release, tk.ts prints `(no comment after the
   release — ask the human what should change before re-planning)`: ask the
   user and stop rather than guessing.
2. **Read the plan as it stands:** `tk.ts plan status <master>` and
   `tk.ts show <master>`, plus `tk.ts show <step key>` for each step the
   human's comment touches. Research the code again only where the revision
   needs it. There is no planning ticket to note into (it is `done`); record
   the reasoning in the comment you post in step 5, or on the master
   (`tk.ts comment <master> -`).
3. **Rewrite the tickets in place.** A plan that has never been confirmed
   still has all of its tickets in `backlog`, unassigned — or assigned to this
   PAT while it holds the story — reported by this PAT
   — the draft window in which agents may edit — so the ordinary authoring
   commands work (with a *different* token they would be refused: the drafts
   belong to the PAT that filed them):
   - `tk.ts plan update <master> step-NN -` replaces a step document;
   - `tk.ts plan step <master> -` adds a step (numbering continues; its
     `**Wave:**` and `**Depends on:**` headers are what the next release wires
     — the master's step index is documentation, not the source of the graph);
   - `tk.ts plan question <master> -` adds a human question.
   **Check the Status column first.** Only `backlog` rows are rewritable. A
   plan that was confirmed once and sent back afterwards has steps in `todo`,
   `in_progress` or `done`; `plan update` exits 1 on those (`… — released;
   tickets are read-only for agents once released`). Rewrite what is still
   `backlog`, express the rest as **new** steps, and tell the user which
   already-running tickets a human has to cancel or edit. An agent can never
   delete a ticket.
4. **Rewrite the master document too** — `tk.ts plan master <master> -` (or
   the identical `tk.ts plan update <master> master -`) with the full new
   document on stdin. The master is `in_review`, not a `backlog` draft, so
   tk.ts sends it through `POST /api/tickets/:id/plan-revision` instead of the
   ordinary PATCH: a door open **only** while the plan is in revision
   (`in_review` + handler `agent`), only to the PAT that filed the plan, and
   only for the title, the description and the plan's effort. **Keep or
   change the `**Effort:**` line deliberately** (§2 item 1d): the document is
   the source, so a rewritten master that drops the line **clears** the
   master's effort — carry it over unchanged when the revision does not
   change how hard the execution is, and change it when it does (or when the
   reviewer asked for another effort). `plan status` prints the effort the
   master carries now, which a person may have changed on the ticket page —
   that value wins over the old document's line. Refresh at least:
   - the **step index** and the `## Wave N` sections whenever the wave layout
     changed — `plan release` builds each wave barrier's verification
     checklist from the master's `## Wave N` section, so a stale section means
     stale barriers; a plan that collapses to one wave drops the
     `## Execution waves` section altogether (§2 item 7), and one that grows
     to two or more gains it;
   - the goal, the design decisions and the dependency graph the revision
     touched;
   - the `## Prompt revisions` section: append the `### Revision N` entry
     `plan revise <master>` printed (under `## Prompt revisions entry — …`;
     `promptRevisionsEntry` with `--json`) to the end of it, creating the
     section right after `## Original prompt` when absent (§0). tk.ts warns
     (`tk: warning — the master is in revision but the document has no
     "prompt-revisions" section …`) when a revising master document lacks it.
   Outside the revision window the master is read-only as ever: once you
   re-release it (step 5) it is parked for its human again and
   `plan master <master> -` exits 1 (`… is in review and awaiting its human`),
   as it does on a plan that was already confirmed and is running
   (`… — released; tickets are read-only for agents once released`). In that
   case post the replacement text as a comment on the master and say in the
   report that the master description needs a human edit.
5. **Re-release:** `tk.ts plan release <master> --tokens-in <n> --tokens-out
   <n> --note estimated`. It re-wires the edges, refreshes the barrier
   descriptions, estimates any ticket you added, re-posts the ticket table and
   **parks the master back in `in_review` + handler `human`** for the human's
   second look. Two things differ from a first release:
   - the planning ticket is already `done`, so no planning usage is recorded —
     release warns `planning TICK-nn is already done — --tokens-in/--tokens-out
     ignored`. Pass the flags anyway (harmless) and say in the report that this
     pass's tokens went unrecorded unless a human reopened the planning ticket;
   - the story is **not** handed back automatically (only the run that closes
     the planning ticket does that; the log says `story "…" stays with
     pat:<you>`). Finish with `tk.ts story release "<story name>"`.
6. **Report** as in §5, including the revision bullet there.

