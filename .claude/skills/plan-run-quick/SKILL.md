---
name: plan-run-quick
description: /plan-run without the review item — files the prompt as a single-ticket plan marked `(run-quick)`, releases it with `tk.ts plan release --run` WITHOUT the Confirm plan gate, executes it as /plan-go would and files NO review item: nobody is asked to look, before or after. Refuses what is not a one-sitting change. Use when the user says "/plan-run-quick X" or "plan and run X, no review". Argument: the prompt.
---

Base directory for this skill: `.claude/skills/plan-run-quick`

# Plan Run — quick

`/plan-run` with nobody asked to look afterwards. This file is a list of
overrides over plan-run, which is itself a list of overrides over
plan-steps and plan-go. Entered from `/plan-steps` (a pulled request
labelled `plan-run-quick`), plan-steps is already in this session — do not
read it again. Plan-run is read once — skip the next sentence when it is
in this session too. **Read
`.claude/skills/plan-run/SKILL.md` first and follow it in full**, with the
reads it names (plan-go once, when its section 5 starts). Its sections 1 to
5 apply **unchanged**. Only these differ.
Exit 12 (the auto worker is halting) is handled exactly as in the original skill.

## What "quick" means here, and what it does not

**It means: no review item.** `/plan-run` trades the up-front approval for
an after-the-fact review; this skill drops that review too. No human
confirmed the plan and no human is asked to check the result — the ticket
history and the report are the only record. Say that to the user before
starting and again in the report; never present the outcome as reviewed.

**It does not mean `/plan-go-quick`.** Execution is `/plan-go`, exactly as
in plan-run section 5: the master is dispatched to one agent with plan-go
§4's prompt and runs the typecheck and the named test files of its
Verification section. Nothing about the checks is reduced, and the ticket's
`done` is not recorded as quick-mode.

The router is no looser either: a request that is not SMALL is refused
before `plan open`, as in plan-run section 2. With no review afterwards
there is less reason, not more, to stretch it.

**Entered from `/plan-steps`.** As plan-run section 2 says for its own
label: this skill plans a pulled planning request only when `/plan-steps`
hands it one a person labelled `plan-run-quick` and that passed the SMALL
test there — opened with `plan open --scope S --request <key> -`.
It never calls `plan next` itself.

## Overrides to plan-run section 3 (plan)

* **Title:** `# <goal in a few words> (run-quick)` — in `plan open`
  and in the master document. The suffix is part of the story name and
  counts towards the 256 characters of a title; `plan open --request` names
  a request filed without a title after the plan, minus the suffix.
* **The run header**, directly under the `**Mode:**` line, is exactly:

  ```
  **Mode:** single — the master is the work; no steps, no barrier
  **Run:** quick — released without Confirm plan; no review item
  **Effort:** small — <one clause on why this level>
  **Estimated scope:** S|M — <rough description>
  ```

  tk.ts parses the first word (`quick`): it is what says no review item is
  owed. The `**Effort:**` line is plan-steps §2 item 1d (A planner chooses at most High by its own judgement; Very High (the only effort that runs on Fable) is a person's choice. The server applies a person's request effort to the master.), as in plan-run:
  `small` unless the work or the request says otherwise (a person's effort
  on the request wins, an estimated one is the default).
* **The `## Execution instructions` sentence** names `/plan-run-quick` as
  the skill that executes the plan right after release.
* **The first planning note** opens with `**Tier:** SMALL (run-quick) —
  <reasons>`.

The fallback is plan-run's: a request that turns out not to be a run plan
is finished as a normal plan, without the `**Run:**` line, released without
`--run`, and reported as waiting for **Confirm plan**.

## Overrides to plan-run section 4 (release)

The command is the same —
`bun .claude/skills/plan-steps/tk.ts plan release <master> --run --tokens-in <N> --tokens-out <M> --note estimated`
— and so is every check but one: the footer reads

```
Plan review: skipped — run plan (no review item)
```

`… (review item after done)` instead means the master's header says
`review` — so read the `**Run:**` line once more **before** releasing. A
released master is read-only for agents: if the wrong footer appears
anyway, carry on and say in the report that the ticket announces a review
item this skill does not file (`/plan-verify "<story name>"` files one).

## Plan-run section 6 does not apply

**Never call `tk.ts review file`.** No review item is filed — not one, not
a shorter one, not "just this once because the change looked risky". If
the change looks risky enough to want a person's eyes, say so in the report
and name `/plan-verify`; the choice is the user's. When the master is
`done`, go straight from the execution to the report.

## Overrides to plan-run section 7 (report)

Same report, with the review-item bullet replaced by these, at the top:

* **No human approved this plan and none was asked to review it.** In
  those words. The `Plan run — released without Confirm plan` comment on
  the master records the first half; nothing on the ticket asks for the
  second.
* **The commit** that landed the work (from the `## Commits` section of
  `tk.ts show <master>`), the files it touched, and the verification the
  agent actually ran — the master's `done` message, quoted: typecheck plus
  the named test files.
* **Run the full `bun test` yourself** — no part of a single-ticket plan
  runs it, and here nothing reminds anyone to.
* **`/plan-verify "<story name>"`** files review items later, if they want
  them after all.

A `business-logic` test failure still stops the run on a question, exactly
as plan-run section 5 says (plan-go §4b) — "quick" removes the review item,
not this — and the report names that question as plan-run's does;
`/plan-resume "<story name>"` continues the plan after the answer.

The resume paths are plan-run's, minus the last: before release →
`/plan-steps-resume` (then `plan release <master> --run` again); during
execution → `/plan-resume`; and once the master is `done` there is nothing
left to resume. Everything else as plan-run lists it. Never list the token.
