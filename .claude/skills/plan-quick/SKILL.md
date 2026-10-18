---
name: plan-quick
description: Fast, less-safe variant of /plan-steps — files the same kind of plan (tier MEDIUM or SMALL) with fewer, fatter steps, as few waves as possible, and steps and barriers that run only the plan's own test files; the full `bun test` runs once, on the master. Plans only, never executes. Use when the user says "/plan-quick X" or "plan this quickly". Argument: as /plan-steps — the prompt (none: the conversation, then `tk.ts plan next`).
---

Base directory for this skill: `.claude/skills/plan-quick`

# Plan Quick

`/plan-steps` optimised for getting the work done sooner. This file is a
list of overrides over `.claude/skills/plan-steps/SKILL.md`, not a
standalone procedure. Entered from `/plan-steps` (a pulled request labelled
`plan-quick`), that file is already in this session — do not read it again.
Invoked directly, read it first and follow it in full. Either way, read
`.claude/skills/plan-steps/PLAN.md` when plan-steps §2 points at it (the
master's items 2–10, §3 and §3b live there under the same numbers).
Everything plan-steps says applies **unchanged** except where a section
below replaces its counterpart. The helper script is
`.claude/skills/plan-steps/tk.ts`; this skill ships none of its own.
Exit 12 (the auto worker is halting) is handled exactly as in the original skill.

## What quick mode is, and is not

Quick mode cuts what is **ours to cut**: how much verification a step, a
barrier and the master ask for, how many steps and waves the work is split
into, how many decisions are turned into human questions, and how long the
documents and the planning log are. It changes nothing the server or the
project enforces:

* The tickets, the order of §1, `plan release` and the human **Confirm
  plan** gate are plan-steps', with step and barrier tickets **as the tier
  and the wave count require** (a quick plan with one wave has no barrier —
  its master blocks on the steps; a SMALL plan has no steps at all). A quick
  plan is not runnable sooner — it is runnable with less in it.
* Tests are still **written**: every step that adds or changes behavior
  owns a test file (a new `test/<area>.test.ts`, or new cases in the
  existing file for that module — `test/client-*.test.ts` for the UI)
  covering the new behavior. What quick mode drops is **running everything
  else**.
* The check vocabulary is this project's own, and quick mode picks the
  smallest useful subset of it: `bun run typecheck`, `bun test <file>` for
  named files, and — on the master only, and only when warranted — named
  files under `test/integration/`. The whole `test/integration/` folder,
  `bun run test:concurrency`, `bun run build:client` and screenshots of
  the running app never appear in a quick plan's tickets. The full
  `bun test` sweep stays where the plan-steps *Verification ladder* puts
  it — the last item of the master's plan-wide verification, in no step and
  no barrier; quick mode does not cut it.
* **Quick never means touching the live database.** Tests run against
  their own ephemeral PostgreSQL clusters; no ticket of any plan runs
  `bun run db:reset`, `src/db/migrate.ts --reset` or a seed script against
  the server the PAT talks to.

What quick mode costs: a step verified on its own test file alone can
break a neighbour's, and nothing catches it until the master's final full
`bun test` — after every wave has already pushed to the sprint's branch.
The integration suite, when left out, is caught by nobody. Say this to
the user in the report; never present a quick plan as a safe one. If the
user's request is itself about correctness, safety, concurrency, data loss,
migrations, authorization (PAT scopes, tenancy, the story lock, the handler
rule) or the work queue's hand-out rules, say in one sentence that
`/plan-steps` fits better — then, if they still want quick, plan quick.

## Tier

`/plan-quick` runs plan-steps §1's router with a cap: it may pick **MEDIUM**
(this file's overrides — the default meaning of "quick") or **SMALL**, never
FULL. A request that routes to FULL is planned as MEDIUM anyway, with the
one-sentence warning above in the report. When the router picks SMALL,
follow plan-steps **§2b** instead of the §2/§3 overrides below:
title `# <goal> (single)`, `plan open --scope S`, `**Mode:** single`, no
steps and no barrier. The tier and its reasons open the first `plan note` as
`**Tier:** MEDIUM|SMALL — <reasons>`.

**With no arguments** — the subject pulled with `plan next` — the request's
plan-mode label is followed exactly as plan-steps §1 *The mode label picks
the strategy* says (`plan-quick` → this file; `plan-single` → §2b;
`plan-run` / `plan-run-quick` → the run skill, or the downgrade when the
SMALL test fails; no label → the capped router above), with one exception:
**`plan-full`**, which the cap plans as MEDIUM, with the same one-sentence
warning in the report and `**Tier:** MEDIUM — plan-full label on TICK-nn,
capped by /plan-quick` in the first `plan note`.

**`plan-split`** — and a request whose text asks for plans as its output,
which plan-steps §1's router sends to tier SPLIT — is handed to plan-steps
**§2c** *The split* unchanged: read it and follow it as written. The MEDIUM
cap does not apply, because a split files no plan — no `plan open`, no
story, no master, only plan requests for a person (`tk.ts plan split
request`), each planned later under its own mode label. None of the
overrides below touch it.

## Overrides to plan-steps §1 (understand the request)

* **Title:** `# <goal in a few words> (quick)`. The suffix is part of
  the story name, so the executor's summary and `story list` show the mode.
  Keep it through `plan master` (tk.ts warns when the title and story name
  differ — they must not). The limit of 256 characters (plan-steps §0)
  counts the suffix. `plan open --request <key>` names a request filed
  without a title after the plan, without the `(quick)` suffix (plan-steps
  §1 *The title line*).
* **Sections:** unchanged (plan-steps §0 *Documents become sections*);
  `## Original prompt` — the `original-prompt` section — stays first in the
  `plan open` document and in the master.
* **Scope:** default `--scope S`; `M` only when the change crosses more
  than two areas; never `L` (a plan that needs `L` planning effort is not a
  quick plan — say so).
* **Research:** read only the files the change will touch and the one file
  each of them imports its contract from (`src/shared/api.ts`,
  `src/api/schemas.ts`, …). No Explore fan-out unless you cannot locate the
  touch points yourself. Skip reading other plans' masters beyond what
  `plan list` needs to settle dependencies.
* **Calibrate:** unchanged — it costs one command and the estimates rest
  on it.
* **Decisions:** make every decision the codebase or the request lets you
  make, and also every decision that is cheap to reverse — pick the
  simplest option and record it in the design-decisions table with the
  default you took. A human question is filed only for a decision that is
  **irreversible or expensive to reverse** (a public API contract, a
  database schema or migration, a deletion, a rename users or agents type).
  Aim for zero questions — a question holds the whole story.
* **Planning notes:** two instead of four —
  `plan note <master>` once after research **and** the decision table
  (one short note: files read, current state in three lines, the table),
  and once after filing (`steps filed: … ; questions filed: … | none`).
  The calibrate output goes into the first note.

## Overrides to plan-steps §2 (the master document — items 2–10 are in `PLAN.md`)

Same order and the same parsed lines (`# … (quick)`, `**Depends on
plans:**`, `**Planning request:**`, `**Mode:**`, `### Wave N …` sections).
The `**Mode:**` line (plan-steps §2 item 1c) is **required** — tk.ts parses
its first word, and a master without it is a full plan — and reads, directly
under the title and any of those two headers, exactly:

```
**Mode:** quick — reduced verification; only this plan's own test files run
**Effort:** medium — <one clause on why this level>
```

Executors and humans read the clause; tk.ts reads the word.

**The `**Effort:**` line** is plan-steps §2 item 1d, unchanged, with one
difference: a quick plan defaults to `medium` when nothing suggests
otherwise. As there, an effort a person set on the request or named in its
text wins, and one the auto worker estimated is the default. A planner chooses at most High by its own judgement; Very High (the only effort that runs on Fable) is a person's choice. The server applies a person's request effort to the master. State it under the tier line of the first
note, and a SMALL plan picked by this skill's router carries it as
plan-steps §2b says. Then:

* **Original prompt**, then `## Prompt revisions` when there are any — as
  plan-steps §0 and §2 say.
* **Goal** — two sentences.
* **Key design decisions** — the table, including every default you took
  instead of asking, and the row `Mode: quick — steps run typecheck + their
  own test file; barriers run typecheck + the wave's test files; the master
  runs typecheck (+ a named integration file only if the plan touches what
  it drives) and then the full bun test as its final item`.
* **Step index** — required (table with ref, title, wave, depends on).
* **Dependency graph** — omit unless a step depends on two or more other
  steps; a one-line `step-01 → step-02 → step-03` is enough otherwise.
* **Execution waves** — **as few waves as possible.** Rules, in order:
  1. Two steps that must run in sequence but touch few files are **one
     step**, not two waves.
  2. A wave exists only to let genuinely independent work run in parallel.
     A later wave holding a single step is a barrier for nothing: fold that
     step into one of the previous wave's steps unless it truly needs
     **all** of them finished first (a one-step, one-wave plan is fine).
  3. Target one or two waves; three is the ceiling. If the work truly
     needs more, it is not a quick plan — say so and split the request
     into two quick plans, the second under `**Depends on plans:**`.

  The `## Execution waves` section and its `Barrier:` paragraphs exist
  **only when there are two or more waves.** A one-wave plan omits the
  section entirely (the step index carries wave 1), `plan release` files no
  barrier — the master blocks on every step and its plan-wide verification
  is the wave's gate — and the report says so ("1 wave, no barrier").
  With two or more waves, each `### Wave N — <k> steps in parallel` section
  still ends with a `Barrier:` paragraph (tk.ts copies it verbatim into the
  barrier ticket), and that paragraph is exactly:

  ```
  Barrier: `bun run typecheck` green; `bun test <files>` 0 failures for
  the test files this wave created or changed: <list>. Nothing else.
  ```

* **Plan-wide verification** — in this order: `bun run typecheck`; a named
  `test/integration/<file>.test.ts` **only** when a step changes the
  behavior that file drives end to end (routes and their authorization,
  the work queue, plan review, the story lock, webhooks, realtime,
  rollback) — otherwise leave it out and say `integration suite: not run
  (plan does not touch it)`; `bun scripts/gen-api-docs.ts --check` only
  when a step changed a route, `src/api/openapi.ts` or
  `src/api/schemas.ts` (that step regenerates `docs/API.md` as one of its
  files); and **last, always, the full `bun test`, 0 failures** — the
  plan's one regression sweep, which also covers every test file the steps
  and barriers ran (do not list those again). No client build, no
  screenshots unless a step's deliverable is the picture.
* **Execution instructions** — unchanged, plus: `Run with /plan-go-quick "<story name>"; /plan-go
  also works and runs exactly the reduced checks written here.`
* **Risks & fallbacks** — at most three bullets, the first always: what
  this plan does **not** verify before the master (a regression a step's
  own test file cannot see reaches the sprint's branch and is caught only
  by the master's final `bun test`) and which command a human runs
  afterwards for what the plan left out (`bun test test/integration` when
  the API changed and no integration file was named).

## Overrides to plan-steps §3 (step documents) — the text is in `PLAN.md`

Same template, parsed headers and limits. The rule that two same-wave
steps never edit the same file covers test files: two same-wave steps never
extend the same `test/*.test.ts`. What changes:

* **Fewer, fatter steps.** A step is the largest unit one agent can finish
  in one sitting without another agent's output — merge steps that share a
  file, a type, or a call site (a route, its schema, its client call and
  its page are one step, not four). Size honestly by points (`M` and `L`
  are normal in quick plans); do not shave the estimate to make the plan
  look small.
* **Context** — the touched files with one line each on what is there now.
  No history, no alternatives considered.
* **Implementation details** — the concrete change: shapes, names, the
  order of edits. Put the decision, not the reasoning. Reasoning lives in
  the master's table.
* **Tests inside the step** — every step that adds or changes behavior
  names the test file it must create or extend and the two to five cases
  it must cover (the new behavior and its one obvious failure mode). Cases
  for unchanged neighbours are out of scope. A step that only moves,
  renames or restyles writes no test.
* **Out of scope** — unchanged, still binding.
* **Verification** — exactly this shape, nothing more:

  ```
  ## Verification
  - `bun run typecheck` green.
  - `bun test <path/to/the.test.ts>` 0 failures (the file this step
    created/extended) — omit this line when the step writes no test.
  - Commit only this step's files; `tk.ts done` pushes it.
  ```

  Never list other test files, the full `bun test`, the integration suite
  or a run of the app in a step (the master owns whatever of those the
  plan needs). The one exception is plan-steps §3's *Tests whose rule the
  plan changes on purpose*: name the existing test files whose assertions
  this step changes on purpose, each on its own `bun test <path>` line
  with what it must assert afterwards, and record the change in the
  master's decisions table — an unnamed one is a foreign test, and its
  failure pauses the story on a human question.

## Overrides to plan-steps §3b (human questions) — the text is in `PLAN.md`

Unchanged template and rules; a MEDIUM plan files external tickets exactly as
plan-steps §3c says (`PLAN.md` §3c). Only the bar for filing one is higher (see
§1 above): irreversible or expensive-to-reverse decisions only; everything
else is a defaulted row in the design table. A question that blocks `all`
is a sign the request is not ready for a quick plan — say so in the report.

## Overrides to plan-steps §4 (release)

None — quick mode has no effect on the server.

## Overrides to plan-steps §5 (report)

Same report, shorter, with four additions at the top:

* The first line is `quick plan` and what that means: which checks each
  step and barrier run (typecheck plus their own test files), that the
  full `bun test` runs once as the master's final item, and — plainly —
  what is **not** verified by this plan (a regression is caught only at
  the end; the integration suite, if left out) with the commands a human
  runs to cover it.
* The tier the router picked and why, in one line (`MEDIUM` or `SMALL`;
  for SMALL, that the master is the only ticket and the work itself, and
  that the run command is `/plan-go "<story name>"` with the `(single)`
  suffix).
* The defaults you took instead of asking (the design-table rows), so the
  user can veto one with **Revise plan**.
* The wave count and why it is that small (what was merged) — "1 wave, no
  barrier" when everything fits in wave 1.

The run command in the report is `/plan-go-quick "<story name>"` (the story
name includes the `(quick)` suffix); mention that `/plan-go "<story name>"`
also works. Everything else as plan-steps §5 lists it.

## Revising a quick plan

`plan revise` runs first in this skill too, and it may hand you a plan that
was filed by `/plan-steps` (no `**Mode:** quick` line, no `(quick)` in the
title). Revise it **as a plan-steps plan** — the mode is the plan's, not
the skill's; do not strip its verification to make it quick unless the
human's comment on the master asks for exactly that. A quick plan sent back
for revision keeps its mode the same way.
