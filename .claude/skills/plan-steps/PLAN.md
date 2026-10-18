# plan-steps — The multi-ticket plan (FULL and MEDIUM)
Read from `/plan-steps` §2 when the tier is FULL or MEDIUM; §0–§2 of `SKILL.md` in this folder apply, and a `§` named below is a section of that file unless it is one of the three here: §2 items 2–10, §3 and §3b. A single-ticket plan (§2b) reads only §3b, and only for an irreversible question.

## 2. Compose the master document — items 2–10

Items 1–1d (the title and the header lines) and the **Verification ladder**
are in `SKILL.md` §2; the master document continues:

2. **Original prompt** — verbatim, as a blockquote (the `original-prompt`
   section — required; tk.ts warns when a master lacks it), followed, when
   the request or a revision pass has any, by `## Prompt revisions` (§0).
3. **Goal** — what is true when the plan is complete.
4. **Key design decisions** — a table; binding for every step.
5. **Step index** — a table with ref (`step-NN`), title, wave, depends on.
6. **Dependency graph** — a Mermaid `graph TD` of step dependencies.
7. `## Execution waves` — **only when the plan has two or more waves.** One
   `### Wave N — <k> steps in parallel` section per wave, listing its steps
   with the files they own and ending with a `Barrier:` paragraph. tk.ts
   copies each wave section **verbatim** into that wave's barrier ticket, so
   the barrier text must be an executable checklist: commands plus expected
   results (e.g. `bun run typecheck` green, `bun test test/<a>.test.ts
   test/<b>.test.ts` 0 failures for the files the wave's steps created or
   changed, a specific endpoint answering 201). A barrier names test files;
   it **never** runs the full suite (the *Verification ladder* in `SKILL.md` §2). No
   other headings inside a wave section.
   A **single-wave plan omits the section entirely** — the step index already
   carries wave 1 — and `plan release` files **no barrier** for it: the
   master blocks on every step directly, and its plan-wide verification is
   the wave's gate.
8. `## Plan-wide verification` — the master ticket's own task: commands and
   expected results that prove the whole plan once every step (or, in a
   multi-wave plan, the last barrier) is done.
   Its **last item is always the full `bun test`** (0 failures) — the one
   regression sweep of the plan — preceded by `bun run typecheck` and, when
   the plan changed what they drive, the named `test/integration/` files,
   `bun run test:concurrency`, `bun run build:client` or
   `bun scripts/gen-api-docs.ts --check`. This is the **only** ticket of the
   plan that runs the full suite (a SMALL plan's single-ticket master is the
   exception — see the ladder).
9. `## Execution instructions` — the ticket protocol in three sentences
   (`next` → one agent per ticket → `comment`/`heartbeat` →
   `done`/`fail`; failures become `fix` tickets; questions for the user become
   `ask` human tickets), any safe-to-start-early notes, and the commit
   protocol **by reference, never by restating it**: every step commits only
   its own files and `tk.ts push`es before `done`, which merges and retries
   against the sprint's configured integration branch. Do **not** name a
   branch, a remote or a merge policy in the plan — that lives on the sprint
   and a human can change it, so a plan that spells it out goes stale and
   misleads the executor. `tk.ts me` is where an agent reads it.
   A plan that changes how the system works also updates the topic document
   under `docs/` that `CLAUDE.md`'s map names for that area
   (`## Documentation` in `CLAUDE.md`); it never writes specification into
   `CLAUDE.md`, whose only change is a one-line map entry when a new
   document is added.
10. **Risks & fallbacks** — ambiguities, what happens if a step fails
    mid-plan, and the decisions you took without asking.

Wave rules: a step in wave N depends only on steps in waves < N; same-wave
steps share no dependencies and no files; place each step in the earliest wave
its dependencies allow (waves are strict — wave N+1 waits for the `wave-N`
barrier). Maximize wave width, minimize wave count — a plan whose steps all
fit in wave 1 needs no barrier at all.

Then write it onto the master opened in §1:
`bun .claude/skills/plan-steps/tk.ts plan master <master> - <<'DOC' … DOC`.
It replaces the provisional description (and the title, if the `# <goal>`
line changed — the story keeps the name chosen at `plan open`; tk.ts warns
when they differ). Every ticket you file next joins that story.

## 3. Write the step documents

One document per step, numbered in dependency order (`step-01` first). A
**single-ticket plan writes no step documents** (§2b). Each step must be
**self-contained** — the ticket description is all an executor ever reads, so
assume it has read nothing else. Its `## ` headings are filed as the ticket's
body sections (§0 *Documents become sections*), and the `**Header:**` lines
must stay above the first `## ` — tk.ts parses them from the description.
Template:

```markdown
# Step NN — <title>

**Depends on:** step-… , step-… (or "none")
**Wave:** <wave number from the master document>
**Priority:** <critical | high | medium | low — optional, default medium>
**Estimated scope:** <S | M | L — rough description>

## Objective
What this step accomplishes and why the plan needs it.

## Context
Current state: relevant files (real paths), existing behavior, constraints,
decisions already made that this step must respect.

## Implementation details
Concrete, ordered instructions: files to create/modify, function/API shapes,
commands, data formats, edge cases — enough that the step never re-derives
the overall design.

## Out of scope
What this step must NOT touch (usually because another step owns it).

## Verification
How the executing agent proves the step is done: `bun run typecheck` green;
`bun test <test/a.test.ts> <test/b.test.ts>` 0 failures — the test files
this step created or changed plus the existing files that cover the modules
it edited, each named by path; any check specific to the deliverable. Never
the full `bun test` (the master runs it once, at the end). And the commit is
on the sprint's integration branch (`tk.ts done` pushes it; do not name the
branch here).
```

The header lines are parsed by tk.ts, so keep their exact `**Label:**` form:

- `**Depends on:**` (required) → one `blocks` edge per `step-NN` listed
  (`none` → no step blockers). Reference steps only by `step-NN` here.
- `**Wave:**` (required) → 1 + the highest wave among the dependencies (1 when
  `none`); tk.ts rejects a dependency in the same or a later wave.
- `**Estimated scope:**` must start with `S`, `M` or `L` → a points estimate
  of 1 / 3 / 5 recorded at release; token estimates are derived by the server
  from the project's tokens-per-point rate (the one `plan calibrate` printed),
  so size the step by its points and let the rate do the rest. A legacy
  per-step token header is ignored with a warning.
- `**Priority:**` (optional) → the ticket's priority; the queue is best-first
  by priority, then age, so use it to steer which ready step is taken first.

Step documents never mention session ids — the executor's tk.ts reports them.

A step's Verification section lists test files by path — the ones it writes
and the ones that already cover what it edits — and **never** the full
`bun test`, the whole `test/integration/` folder or `bun run
test:concurrency`: those are the master's final item (the *Verification
ladder* in §2). When you cannot tell which existing file covers a module,
find it while planning (`grep -l "<module>" test/*.test.ts`) rather than
handing the step the whole suite.

**Tests whose rule the plan changes on purpose.** The executors class every
failing test as the story's own or foreign before they touch it (`tk.ts plan
tests <master> <file>…`: a test file named by path in the master, a step or
a fix document, or changed by a commit of the plan, is a story test; plan-go
§4b), and a foreign test that fails on a rule the plan did not decide
**pauses the story on a human question**. So when the plan intentionally
changes a rule an existing test asserts — a status code, a permission, a
transition, a validation, an order, a number, copy a user reads — (a) record
the change as a row of the master's design-decisions table and (b) name that
test file in the Verification section of the step that changes the rule,
with what it must assert afterwards. That makes it a story test, the failure
is fixed inside the step, and no question is asked. Find those files while
planning, the same way as the covering ones; a rule changed silently is the
avoidable question.

Split work so steps are as independent as possible — smaller, decoupled steps
mean wider waves. If two pieces of work touch the same files, merge them or
make one depend on the other; never let two same-wave steps edit the same
file. Keep every document under 50 000 characters (the description limit).

File the steps in dependency order — one `plan step <master> -` call and one
heredoc per step; each prints the step's key. Re-filing an existing `step-NN`
is an error; to change a step after filing, use `plan update <master>
step-NN -` with the full replacement document — only while the plan is
unreleased: tickets are read-only for agents once released (`plan update`
refuses them; `plan cancel` and refile, or ask a human to edit). Once they are all filed,
`plan note <master> "steps filed: step-01 TICK-…, step-02 TICK-…, …"`.

### 3b. Human questions

Every item left on the question list from §1 becomes a `human` ticket that the
affected steps block on. Its `## ` headings become the ticket's sections, and
the `**Blocks:**` / `**Priority:**` lines must stay above the first `## `.
Template:

```markdown
# Question NN — <title>

**Blocks:** step-… , step-… (or "all" or "none")
**Priority:** <optional>

## Question
Background (what the plan needs to know and why), the options with their
consequences, and the default the plan assumes if unanswered.

Answer in a comment on this ticket, then mark it done (Start → Resolve on
/attention).
```

Rules: `**Blocks:**` lists the steps that cannot start until the answer
exists — `all` when the whole design hinges on it, `none` for informational
questions. Never bury a question inside a step document; a step must be
executable as written. Questions are human-owned — the PAT cannot **edit**
them afterwards, so the text must be complete. It *can* add a comment
(`tk.ts comment <key> …`), which stays pending and invisible to every agent
(the token that wrote it included) until a human approves it or switches the
ticket to Agent, so never rely on a comment to carry information another
agent needs. The PAT still cannot add a `blocks` edge to a filed question. If
tk.ts warns that the server refused a human ticket and fell back to a
`[HUMAN]` agent ticket, keep going and report the warning verbatim.

File them after the steps — one `plan question <master> -` call and one
heredoc per question — then `plan note <master> "questions filed: …"` (or
"no human questions").

### 3c. External tickets

A need only **another project** of the organization can meet — an endpoint
it owns, a format it must accept, a library it ships — is an **external
ticket**: a human-only request filed in this plan's story that a person
promotes into that project. It is never a question: a question asks this
project's people to decide, an external asks another project to deliver.
Template:

```markdown
# External NN — <title>

**Project:** <KEY>
**Category:** <one of integration, interface, connectivity, interoperability,
dependency, external-system, third-party, data-exchange, api, compatibility,
synchronization, external-service, partner-system, integration-dependency>
**Blocks:** step-… , step-… (or "all" or "none")
**Priority:** <optional, default high>

## Request
What the other project is asked for, written for a reader who knows nothing
of this plan.

## Why it is external
## What this plan needs back
## Default if unanswered
What the dependent steps do if the other project declines.
```

Rules: one external ticket per external need; `**Project:**` is the other
project's key, never this one's, and no `**Depends on:**` is accepted. File
them **after** the steps and before the questions, one `plan external
<master> -` per ticket: it creates the ticket with the `external` and
category labels and the project, then parks it for a person in the same call
(handler `human`, `in_review`) — it is never set to Agent. `**Blocks:**`
names the steps that need the other project's answer, `all` only when the
whole plan does; an open external holds only those steps, never the story.
The master's Risks section says what happens if the other project declines.
The planner never names a person of the other project and never tries to
reach that project itself: a person with write access in both projects
presses **Promote to <KEY>** on the ticket, and that project's people press
Approve for Planning. Then `plan note <master> "external tickets filed: …"`
(or "no external tickets").
