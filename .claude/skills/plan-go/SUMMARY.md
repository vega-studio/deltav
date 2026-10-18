# plan-go — the public summary review

Read when a plan finishes — by the orchestrator of `/plan-go`,
`/plan-go-quick`, `/plan-resume` or `/plan-run`, at the one moment their
**Public summary review.** sentence names. `<master>` is as in SKILL.md.

Every project has a **public summary**: an **abstract** (one plain-text
paragraph) and a **ledger** (Markdown — what the project is for, its API
endpoints and CLI commands in one line each, its skills; never how it works
inside). Other projects' agents may read it, so it must stay true. An agent
never writes it: a change is a **proposal**, which files a human question a
person approves or rejects. This review decides whether the plan that just
finished owes one. The default answer is **unchanged**.

## When

* **`full` / `quick` master** — after the plan-wide verification is green
  and before `tk.ts done master`.
* **`single` master** — after `tk.ts plan status <master>` shows the master
  `done`, before the Landing check. The orchestrator runs it, not the agent
  that did the work.
* **Once per plan**, by the orchestrator only. Never by a step or fix
  agent, never on a barrier, and never on a `fail` path: a plan that is not
  finishing — a red verification, a halt, a question — reviews nothing.

## What counts as a change

The plan changed what the ledger describes — it **added, removed or
renamed** one of:

* an API endpoint;
* a `tk.ts` command or another CLI command;
* a skill;
* a user-facing capability.

Nothing else counts: never internals, refactors, tests, fixes, performance,
documentation, styling, or an existing capability that now works better. In
doubt, it is unchanged.

## Procedure

1. `tk.ts summary show` — the current abstract, ledger and version of this
   token's project.
2. Read the master's **Goal** and its design-decision table
   (`tk.ts show <master> --brief`), not the diff: the review is about what
   the plan set out to change for a reader outside the project.
3. Decide, by the list above.
   * **Unchanged** → propose nothing. The `done` message — the master's on
     a `full` / `quick` plan, the run's final report on a `single` one,
     whose master is already closed — carries the line
     `Public summary: unchanged — <one clause>` (the clause says why:
     "internal refactor", "tests only"). The review is over.
   * **Changed** → steps 4 to 7.
4. Write the **smallest** edit to the current texts: start from what
   `summary show` printed, keep every sentence that still holds, and change
   only the lines the plan made untrue or incomplete. Never rewrite,
   reorder or restyle the rest. The limits:
   * the abstract is **one paragraph, at most 600 characters**; leave it as
     it is unless the plan changed what the project is at its most basic;
   * the ledger is Markdown, **at most 20 000 characters**, with the
     sections **Purpose · API · CLI · Skills · Not covered** — an endpoint,
     a command or a skill is one line in its section.
5. Read the diff before filing anything:

   ```
   bun .claude/skills/plan-steps/tk.ts summary propose <master> --note "<plan title>" --dry-run - <<'DOC'
   ## Abstract
   <the whole abstract, edited or not>

   ## Ledger
   <the whole ledger, edited>
   DOC
   ```

   The document always carries both sections in full. `--dry-run` prints
   the unified diff against the current texts and files nothing. Exit 2 →
   a section is missing or over its limit: fix the document.
6. If the diff shows more than the change needs — a reworded sentence that
   was true, a moved section — shrink the edit and run step 5 again.
7. Run the same command without `--dry-run`. It prints
   `proposal <id> · question <KEY> (<ticket id>)`; put
   `Public summary: proposal <KEY>` in the `done` message (or the final
   report, as in step 3).

A `tk.ts summary` command that fails for another reason (the server does not
know it, a 4xx, a 5xx) does not fail the plan: write
`Public summary: not reviewed — <the error>` in the same place and carry on.

## What it never does

* **It never pauses the plan.** The proposal is a human question, but it
  never pauses this plan: the master still closes, the Landing check still
  runs, the story is still released and synced, and the question waits for
  a person on `/attention`. As an open human ticket in the story it does
  hold that story's queue for later work (a fix, a failed review item's
  rework) until a person approves, rejects or cancels it
  (`docs/TICKETS.md`). Do not `tk.ts fail`, do not wait for an answer, and
  do not treat the open question as a reason to stop.
* **It never runs `/project-summary`.** That skill rewrites the whole
  summary from the codebase; it is a person's skill and is never started by
  an unattended session.
* **It never edits the summary directly.** An agent has no such write; the
  only door is `tk.ts summary propose`, and a person's approval writes the
  new version.
* **It never proposes more than once per plan.** One finished plan, at most
  one proposal. A resumed run that finds `Public summary:` already in a
  master comment or the done message does not review again.
