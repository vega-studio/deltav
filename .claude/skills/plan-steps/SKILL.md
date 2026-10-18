---
name: plan-steps
description: Turns a prompt into an execution plan filed as tickets in this project's ticketing system — a master, step tickets, wave barriers and human questions, parked for a human's Confirm plan; tier SPLIT files plan requests awaiting Approve for Planning instead. Plans only, never executes. Use when the user says "/plan-steps X", "plan steps for X" or "file a plan as tickets". Argument: the prompt (none: the conversation, then `tk.ts plan next`).
---

Base directory for this skill: `.claude/skills/plan-steps`

# Plan Steps

Convert the prompt (the skill arguments, plus any surrounding conversation
context) into an execution plan that lives **only** in the ticketing system
this repo implements: a master ticket, one `agent` ticket per step, a barrier
ticket per wave (only when there are two or more waves), human question
tickets, and `blocks` edges reproducing the waves so the executor (`/plan-go`)
only ever picks up tickets whose dependencies are done. §1 **routes** each
request to a tier first — FULL (this file and `PLAN.md`), MEDIUM
(`/plan-quick`'s overrides), SMALL (§2b: one ticket, the master, is the plan
and the work) or **SPLIT** (§2c: the request asks for more plans, so the
output is plan requests for a person, not a plan).

**This skill only composes the plan and files the tickets. Do not execute any
of the planned work unless the user separately asks for it afterward.**

## 0. The ticketing bridge

All ticketing traffic goes through the helper script
`.claude/skills/plan-steps/tk.ts`, run with `bun` from the project root. It
uses the personal access token in `TICKETING_PAT` — never paste the token into
plan documents, chat output, or commits — and reports this chat session's id
(`CLAUDE_CODE_SESSION_ID`) on every claim, pull and transition: the server refuses an agent claim, pull or move to `done` without
one (`session_required`), and `plan open` and `plan next` exit 2 without one.
That refusal or exit 2 is an environment problem to report, never an id to
invent. **A person running the skill by hand, or a session whose `plan next`
found nothing: Read `.claude/skills/plan-steps/MANUAL.md` now** — the token's
scopes and environment, how a planning request is filed, `--hold`.

Every plan is a story: `plan open` creates one named after the plan, in the
project's current sprint (agents never pick or manage sprints; the sprint
carries the repository and integration branch executors push to), and every
ticket the plan files belongs to it. Stories are owned: `plan open` takes
the story while you plan and the tickets it files are assigned to the
planner; `plan release` hands story and tickets back, unassigned, for
`/plan-go`. Only the release run that **closes the planning ticket**
releases the story; a re-release during a revision pass (§1, planning ticket
already `done`) leaves it with you — `tk.ts story release "<story name>"`.

**An interrupted session is resumed, never reopened.** If this session dies
between `plan open` and `plan release` (planning ticket `in_progress`, story
taken), the next run is `/plan-steps-resume`: it finds the story with
`tk.ts resume list`, takes it back with `tk.ts resume` and completes the plan
in place. A second `plan open` files a duplicate story, master and planning
ticket a human has to cancel.

**A released plan does not run until a human confirms it** — **Confirm
plan** or **Revise plan** on the master's ticket page; §4 says what each does.

Commands this skill uses:

```sh
bun .claude/skills/plan-steps/tk.ts me                              # project/seam the token writes into, the current sprint and the session id tk.ts will report
bun .claude/skills/plan-steps/tk.ts session <key> [--session <id>]  # re-report this session's id on a ticket (tk.ts normally sends it by itself)
bun .claude/skills/plan-steps/tk.ts plan next [--json] [--request <key|id>]
                                                                    # pull a planning request (§1) — prints its `Plan mode:`, `Title:`, `Effort:` (`effort`, `effortEstimated` with --json) and `Split from: <KEY> <title>` (`splitFrom`) lines; `--request`, or `TICKETING_PLAN_REQUEST`, **pins** the pull; exit 5 when nothing is ready
bun .claude/skills/plan-steps/tk.ts plan title <request key|id> <title | ->
                                                                    # name a request filed without a title (stdin when `-`; a leading `# ` and a tier suffix are stripped) — `plan open --request` does it by itself, so this is for a split (§2c)
bun .claude/skills/plan-steps/tk.ts plan open [--scope S|M|L] [--request <key|id>] -
                                                                    # stdin = `# <title>` + `## Original prompt` → story, provisional master, claimed planning ticket; `--request` links the plan to the request it answers
bun .claude/skills/plan-steps/tk.ts plan calibrate [--json] [--examples N] [--bucket sprint|week|month]
                                                                    # the sizing brief (§1 *Calibrate*) — run right after `plan open` and `plan list`
bun .claude/skills/plan-steps/tk.ts plan note <master> <text | ->   # comment on the planning ticket (+ heartbeat) — the planning procedure log
bun .claude/skills/plan-steps/tk.ts plan master <master> -
                                                                    # stdin = the final master document; its `**Effort:** very high|high|medium|small` header (§2 item 1d, optional; a planner chooses at most High — `very high` is filed as High unless a person set it) is filed as the master's `effort` — a document without the line clears it — and the confirmation ends `· effort <Label>` / `· effort none`
bun .claude/skills/plan-steps/tk.ts plan step <master> -            # stdin = one step document → prints its key
bun .claude/skills/plan-steps/tk.ts plan question <master> -        # stdin = one question document → a human ticket
bun .claude/skills/plan-steps/tk.ts plan external <master> -        # stdin = one external document (§3c) → a human-only request to another project, parked at once
bun .claude/skills/plan-steps/tk.ts plan update <master> <ref> -    # replace a step (step-NN) while it is a `backlog` draft of this PAT, or the master (also while the plan is in revision); otherwise exit 1
bun .claude/skills/plan-steps/tk.ts plan release <master> [--hold | --run] --tokens-in N --tokens-out M --note estimated
                                                                    # §4 — wires the plan and parks the master for **Confirm plan**; `--run` is for /plan-run and /plan-run-quick only, `--hold` is in MANUAL.md
bun .claude/skills/plan-steps/tk.ts plan revise [<master>] [--json] # THE FIRST COMMAND OF EVERY RUN (§1): the plans a human sent back with **Revise plan**; with a master it opens the revision (REVISION.md)
bun .claude/skills/plan-steps/tk.ts plan status <master>            # live ticket table, story/sprint footer, `Depends on plans:`, `Mode:`, an `Effort: Very High|High|Medium|Small|none` line (§2 item 1d), points/tokens per phase
bun .claude/skills/plan-steps/tk.ts plan cancel <master>            # cancel every open agent ticket of a plan (and release its story)
bun .claude/skills/plan-steps/tk.ts plan list [--all] [--json]      # the open plans — master not `done` or `cancelled` — newest first: key, status, the plans it depends on, title; `--all` adds the done and cancelled ones
bun .claude/skills/plan-steps/tk.ts plan depends <master> <other-master|story> [--remove]
                                                                    # this plan waits for another: its master and every wave-1 step block on the other plan's master
bun .claude/skills/plan-steps/tk.ts story list                      # every story with owner and master (is the name free?)
# Splits (tier SPLIT, §2c) — plan requests for a person, no story, no master:
bun .claude/skills/plan-steps/tk.ts plan split request [--from <origin>] -
bun .claude/skills/plan-steps/tk.ts plan split submit <key>
bun .claude/skills/plan-steps/tk.ts plan split status [<origin>] [--json]
bun .claude/skills/plan-steps/tk.ts plan split release <origin> --tokens-in N --tokens-out M --note estimated
# Reports — an agent's finding for a person, story-less, never estimated:
bun .claude/skills/plan-steps/tk.ts report file [--about <key>] -   # stdin = `# Report — title` + body → filed with the `report` label and parked for a person
bun .claude/skills/plan-steps/tk.ts report list [--open] [--json]   # the project's reports and their state
```

**Every ticket title is limited to 256 characters, enforced by the server
(400).** That holds for every title this skill writes. tk.ts
cuts a longer title it composes to 256 and prints `tk: warning: title cut to
256 characters: "…"`; `plan split request` and `plan title` refuse one
instead. Keep a plan title **well under** the limit: the `Planning — ` and
`Step NN — ` prefixes share the same budget.

**The plan is a ticket from the first minute.** Run `plan open` **before**
any research: pick the title from the prompt (`# <goal in a few words>` —
the goal itself, **without** a "Plan —" prefix; tk.ts strips one if written;
it names the story and cannot be renamed by the PAT afterwards) and
set `--scope` to the planning effort you expect (`S` a focused change, `M`
the default, `L` a cross-cutting plan). It creates the story, a provisional
master filed with the organization's **`plan` label** (the system label that
marks a plan master; tk.ts warns, and does not stop, when the org has none —
seed the default labels) and a **planning ticket** (`Planning — <title>`) that is already
claimed by your PAT **with this session's id**, carries the org's **`planning` label** and a points
estimate for the planning phase. tk.ts warns when the org has no `planning` label. From
then on the planning procedure lives in that ticket's comments:
call `plan note <master> …` after the research summary, after the
design-decision table, after filing the steps (list their keys) and after
filing the questions. `plan release` closes the planning ticket with the
session's token usage.

The execution commands (`story find`, `story take`, `story release`, `ready`,
`claim`, `start`, `show`, `comment`, `heartbeat`, `done`, `fail`, `ask`,
`plan landed`, `fix`, `plan tests`) belong to the plan-go skill; this skill never calls them. `report file`
belongs to no skill in particular: any agent — a planner that notices something
outside the plan it is writing, an executor, the `/report` skill — may file a
report with it, and it never pauses anything. Do not hand-roll `curl` calls for what the script
already does; if the API needs something the script cannot do, extend the
script (it lives inside this skill folder) rather than scripting around it.

**Nothing about a plan is written to the file system. No `docs/` folder, no
temp files: every document is piped to tk.ts through a heredoc on stdin.**
Always use a quoted delimiter (`<<'DOC'`) so backticks and `$` inside the
Markdown pass through untouched, and pick a delimiter absent from the document:

```sh
bun .claude/skills/plan-steps/tk.ts plan step TICK-13 - <<'DOC'
# Step 01 — <title>
...
DOC
```

### Documents become sections

tk.ts splits every document it files at its `## ` headings (outside fenced
code). The **preamble** — the `# title` line and the `**Header:**` lines
before the first `## ` — stays the ticket's `description` (with the `Role:`
line tk.ts prepends), and each `## Heading` becomes one body section
`{ type: "<heading text>", content }` in `Ticket.sections`, in document
order. `tk.ts show` prints the body reassembled under the
same headings, so a document reads to an executor exactly as it was written.
The global `--flat` flag files the whole document as a single description
with no sections — for debugging only, never for a plan.

**Every plan document — the `plan open` document, the master, a single-ticket
master — starts its sections with `## Original prompt` holding the request
verbatim as a blockquote. tk.ts files it as the `original-prompt` section
and prints `tk: warning — the master document has no "original-prompt"
section …` on `plan open`, `plan master` and `plan update <master> master`
when it is missing — a warning, never a refusal, so a master with no
original-prompt section still files; never drop, rename or move it.**

The common `## Prompt revisions` section (type `prompt-revisions`) records
every revision a human asked for with **Revise plan**: one
`### Revision N — <date> · <author>` entry per round, the request quoted as a
blockquote, oldest first — append-only, never rewritten. It sits directly
after `## Original prompt` (after `## Direction from the reviewer` when that is
present), and only once there is a revision. **Regenerate story** files it
with the new plan request, so revisions survive any number of regenerations.
Where the revisions and the original prompt conflict, the revisions win.

Any heading text is a valid type; for a free-form document the recommended types
are `original-prompt`, `prompt-revisions`, `goal`, `context`, `decisions`, `verification`,
`out-of-scope` and `notes` — suggestions, not a registry.

## 1. Understand the request

**0. A plan sent back for revision wins over everything else.** Before
anything else — before `me`, before reading the arguments, before any
research — run:

```sh
bun .claude/skills/plan-steps/tk.ts plan revise
```

- **Exit 0** → the printed `Key · Story · Title` table lists the plans whose
  master a human sent back with **Revise plan** (`in_review` + handler
  `agent`). Revise **that** plan (the newest, i.e. the first row) instead of
  planning anything new, even when the skill arguments name a different
  subject: tell the user which plan you are revising and stop if they meant
  something else. Then follow *The revision pass* below.
- **Exit 5** (`no plan awaiting revision …`) → nothing is waiting; continue
  with the branches below.
- **Exit 12** (`tk: the auto worker is halting — …`) from `plan revise
  <master>` (it takes the plan's story), from `plan next` or from `resume`
  → stop and report; **no** `plan open` follows:

  > **Exit 12 — the auto worker is halting.** A manager pressed *Halt after
  > current ticket*: the server hands this token no further ticket. It is not a
  > failure and not something to retry. Take nothing more; let every agent
  > already dispatched finish its ticket normally (`done`, `fail`, comments and
  > pushes all still work); then stop. **Do not** release the story, do not run
  > `tk.ts sync`, do not file a fix or a question about it, and do not move any
  > ticket you did not finish. Report "halted by the auto worker" with the
  > tickets finished and the tickets left; the story stays with this token and
  > is resumed with `/plan-resume` after a manager presses Resume.

  For a planning session that means: pull no request and open no plan. A
  session that **already opened its plan** before the halt is not stopped
  by it — it finishes the plan and releases it as usual (notes, steps,
  questions and `plan release` are never refused this way). `plan open`
  is not stopped by a halt either: its new story is empty, and the server
  lets a halting worker's token take an empty story — so a session that
  pulled its request before the halt opens its plan, finishes and releases
  it as usual. Should `plan open` exit 12 all the same (a server older
  than this rule), stop there, run no second `plan open`, and report the
  request's key with the halt.
- Lines on stderr such as `tk: TICK-nn is in review and still awaiting its
  human — not revisable until they press "Revise plan"` are **not** work for
  you: that plan is parked for a human's decision. Mention it to the user if
  they expected it to be revisable, and carry on.

**The revision pass** (only when `plan revise` exited 0). The plan already
exists — story, master, closed planning ticket, steps, usually the barriers.
**Do not run `plan open`.** **Read `.claude/skills/plan-steps/REVISION.md`
now** and follow its six steps (open with `plan revise <master>`, read the
plan, rewrite the backlog drafts in place, rewrite the master with its
`## Prompt revisions` entry and a deliberate `**Effort:**` line, re-release,
report), then skip the rest of §1, §2 and §3.

Everything below applies to a **new** plan (`plan revise` exited 5).

- **What to plan**, in this order:
  1. the skill arguments, whenever there are any — they are the thing to plan;
  2. arguments empty, but the conversation holds a clear request → plan that;
  3. arguments empty **and** the conversation gives nothing → **pull the subject
     from ticketing** with `bun .claude/skills/plan-steps/tk.ts plan next`
     (exit 12 → the auto worker is halting: nothing was pulled, stop and
     report as branch 0 says — no `plan open`).
- **Pulling the subject from ticketing** (branch 3 only). `plan next` asks the
  work queue for one *planning request* — a ready ticket flagged for an agent
  that carries the org's `planning` label — claims it for this PAT
  (`in_progress`, assigned to the token) and prints its key, title and full
  description.
  - The printed description **is** the prompt: quote it verbatim into the
    master's `## Original prompt` blockquote, and take the plan title from it.
  - **The title line.** Under `Plan mode:` `plan next` prints one `Title:`
    line (`titlePending: true|false` with `--json`).
    `Title: none — "<provisional title>" is provisional; name it: tk.ts plan
    title <KEY> "<title>" (plan open --request does it for you)` means the
    person filed the request **without a title**: the one printed in the
    header is provisional, derived by the server from the description, and
    **the planner names the request**. Choose the plan title from the
    description exactly as you would for any prompt (≤ 256 characters);
    `plan open --request <key>` then applies it to the request by itself
    (tier suffix stripped) and prints `request <KEY> titled "<title>"` — a
    failure there is a warning, never a failed `plan open`. A
    split names its origin as §2c says.
    `Title: set by its author — keep it` means a person wrote the title:
    **never rename it** — the server refuses anyway, and `plan title` then
    leaves the request as it is.
  - **The effort line.** Directly under `Title:` `plan next` prints one
    `Effort:` line (`effort` — the value or null — and `effortEstimated`
    with `--json`): the effort the **request** carries, a field a person
    or the auto worker sets and never a document header.
    `Effort: <Label> — set by a person; the master carries it` means a
    person chose it in the New plan modal or on the ticket: the master's
    `**Effort:**` line is that level (§2 item 1d).
    `Effort: <Label> — estimated by the auto worker; a default for the
    master` means nobody chose one and the auto worker estimated it (High,
    Medium or Small — never Very High) from
    the request's text before this session started: it is the default for
    the master's line, kept unless the research shows the execution needs
    another level (an estimate is never Very High — the estimate chooses at
    most High). `Effort: none` means the request carries none — choose
    the master's as §2 item 1d says. When the auto worker started this
    session it ran it **on the model of that effort** (Very High → Fable,
    Opus when Fable usage is exhausted; High → Opus; Medium and Small →
    Sonnet; none → the worker's configured model) and pinned the pull to
    that one request (`TICKETING_PLAN_REQUEST`); **exit 5 on a pinned
    pull** — `the pinned plan request <key|id> is not ready any more —
    nothing pulled` — means: stop and report that the request is no longer
    ready. Never pull another one in its place, and no `plan open`.
  - `plan next` also prints the request's **comments** after the description
    (`## Comments (n)`, oldest first; `comments: [{ author, createdAt, body }]`
    with `--json`). When the request was a **promoted report** — its
    description starts with `Role: REPORT` and a comment reads `Promoted to
    plan` — quote the report document (everything after the `Role: REPORT`
    line, without that line) as the `## Original prompt`, and quote the
    `Promoted to plan` comment(s), with the human's note under them, as a
    `## Direction from the reviewer` blockquote directly under it: that note
    is the person's instruction and takes precedence over the report's own
    "Suggested next step".
  - When the pulled request prints a `## Prompt revisions` section (a plan a
    human regenerated with **Regenerate story**), quote only the description
    as the `## Original prompt` and copy the `## Prompt revisions` section
    verbatim into the master right after it (§0); plan to the original prompt
    as revised — the revisions win where they conflict.
  - `## Rebuild of`: `tk.ts show` what it names before research; copy it
    verbatim after the prompt sections; its answers win.
  - **Exit 5** means nothing is queued: stop and report what tk.ts printed —
    **do not invent a plan** (`MANUAL.md` says how a person files a request).
  - **Exit 2** means this PAT lacks `work:pull` / `tickets:claim`: stop and
    report that.
  - Otherwise continue with the pulled key: `plan open --scope <S|M|L>
    --request <key> -`, the pulled description as its `## Original prompt`
    (§2 item 1b). A request routed to tier SPLIT opens no plan — §2c.
  - **The mode label picks the strategy.** A planning request carries at most
    one **plan-mode label** beside `planning` — an organization system label
    a person picked in the New plan modal's required **Plan mode** field.
    `plan next` prints it directly under its `KEY title · session …` header
    line as `Plan mode: <label> → /<skill> (<TIER>[, run review|quick])`, or
    as `Plan mode: none — route with the plan-steps router`; with `--json` it
    is `planMode: { label, skill, tier, run } | null`. (A request carrying
    several mode labels: tk.ts already picked the most conservative one and
    warned — plan with the one it printed.) Read that line and plan with the
    strategy it names:

    | Label | Strategy |
    |---|---|
    | `plan-split` | `/plan-steps` §2c, tier SPLIT — files plan requests for a person; no story, no master |
    | `plan-full` | `/plan-steps`, tier FULL — the rest of this file |
    | `plan-quick` | `/plan-quick` (tier MEDIUM; its own router may still pick SMALL) |
    | `plan-single` | `/plan-steps` §2b, tier SMALL — one ticket, parked for Confirm plan |
    | `plan-run` | `/plan-run` — single ticket, released with `--run`, executed in the same session, one review item afterwards |
    | `plan-run-quick` | `/plan-run-quick` — the same without the review item |

    - `plan-split` → tier SPLIT: §2c *The split* (`plan next` prints
      `Plan mode: plan-split → /plan-steps (SPLIT)`): plan requests for a
      person — **no `plan open`**, no story, no master, no steps.
    - `plan-full` → tier FULL: this file, as written.
    - `plan-quick` → read `.claude/skills/plan-quick/SKILL.md` and follow its
      overrides from here on.
    - `plan-single` → tier SMALL: §2b *The single-ticket plan*. A request
      that grows is finished as MEDIUM or FULL exactly as §2b's last
      paragraph says.
    - `plan-run` / `plan-run-quick` → the label is a person's explicit
      request for an unattended run, so the run skill is entered **from
      here**. First apply that skill's SMALL test
      (`.claude/skills/plan-run/SKILL.md` section 2) to the pulled
      description.
      - **It passes** → read `.claude/skills/plan-run/SKILL.md` (and, for
        `plan-run-quick`, `.claude/skills/plan-run-quick/SKILL.md` on top of
        it) and follow it from its *Plan* section on, opening with
        `plan open --scope S --request <key> -`. Its section 1 (what never
        changes) applies in full; its route is the test just applied.
      - **It fails** → the request is **not refused** — it is already
        claimed. Route it with the ordinary router below, plan it as that
        tier with its usual title suffix (no `(run)`), **keep the Confirm
        plan gate** (release without `--run`), and say so on the request:
        `tk.ts comment <request key> -` naming which line of the SMALL test
        failed and that the plan will wait for **Confirm plan**. Repeat it
        in the report (§5).
    - `none`, or **no `Plan mode:` line at all** (an older tk.ts) → no mode:
      a request filed by hand, a promoted report, anything older. Go to
      *Route the request* as written — the router decides, exactly as for a
      prompt.

    In every case but `plan-split` (a split opens no plan) `plan open`
    carries `--request <key>`, and the
    original-prompt rules of this section (the description verbatim; a
    promoted report's `## Direction from the reviewer`) still apply.
  - **A request generated by a split.** When `plan next` prints
    `Split from: <KEY> <title>` under the `Plan mode:` line
    (`splitFrom: { key, id, title } | null` with `--json`), the pulled
    request is one of the plan requests an earlier split filed under
    `<KEY>` (its **origin**) and a person approved. It is an **ordinary
    request**: plan it with the strategy its own mode label names, with
    `plan open --request <key>` as always — it is never a split itself. Its
    description may carry a `**Depends on requests:** TICK-nn — why` line
    naming sibling requests of the same split: resolve it under *Review
    existing plans* below.
  - Ordering exception: `plan next` runs **before** `plan open`, because the
    plan's title comes from the pulled request; `plan open` still precedes
    `plan list`, `plan calibrate` and any file reading.
- **Route the request.** As soon as the subject is known — and before `me`,
  before `plan open`, before reading a single file — decide the planning
  **tier**. The router is a judgement made from the prompt and the
  conversation alone, not from research:
  - **SMALL** — one agent finishes it in one sitting; at most ~3 source files
    in one area plus their tests; no new route, schema, migration or API
    contract; no decision a human must make; the covering test file is
    obvious.
  - **MEDIUM** — 2–6 steps, at most 3 waves, at most two areas, every
    decision defaultable.
  - **FULL** — everything else: cross-cutting work, API/schema/migration
    changes, irreversible decisions, correctness / authorization / queue /
    concurrency topics, more than 3 waves.
  - **SPLIT** — the request's deliverable is **several plans**, not one: it
    says so ("create plans for…", "break this into separate plans", "a
    roadmap of plans"), or it is a pulled request carrying the `plan-split`
    label. Decide this one **first**, before the three size tiers. **Size
    alone never selects SPLIT**: a big request is a FULL plan, however many
    steps and waves it takes.

  Precedence: a tier the user names in the prompt ("full plan", "quick",
  "single ticket") wins; `/plan-quick` caps the tier at MEDIUM (SMALL is
  still allowed); `/plan-steps` with no tier named lets the router decide.
  A **plan-mode label on a pulled request** counts as a tier the user named
  and wins over the router (*The mode label picks the strategy* above); a
  tier named in the skill arguments does not arise there — branch 3 has no
  arguments. A pulled request with no mode label is routed by the router.
  The `plan-split` label wins like any named tier. One override goes the
  other way: a pulled request carrying **another** mode label whose text
  explicitly asks for plans as its output is planned as **SPLIT** too — the
  carried label becomes the default `**Plan mode:**` of the generated
  requests, and you say so in a comment on the request
  (`tk.ts comment <request> -`: which label it carried, which words asked
  for plans, that it is being split) and in the report (§5). A prompt or an
  unlabelled request whose text asks for plans is SPLIT by the router, with
  nothing to override.
  When in doubt between two tiers, pick the lighter one **only if a wrong
  pick is cheap** — a SMALL plan that turns out bigger is re-planned with
  **Revise plan**, which costs one round trip; a FULL plan that was really
  SMALL costs a whole plan's worth of tickets, but nothing breaks.
  What the tier changes:
  - **SPLIT changes everything below**: **no `plan open`** — the procedure
    is §2c *The split*, and §2, §2b, §3 and the release of §4 do not apply.
    The bullets that follow are for the three plan tiers;
  - **the title**: `# <goal>` (FULL), `# <goal> (quick)`
    (MEDIUM), `# <goal> (single)` (SMALL) — the suffix is part of the
    story name;
  - **`plan open --scope`**: `S` for SMALL; MEDIUM and FULL as their
    procedures say (§0 "The plan is a ticket from the first minute");
  - **the procedure that follows**: FULL = the rest of this file; MEDIUM =
    the overrides in `.claude/skills/plan-quick/SKILL.md` (read it and
    follow it from here on); SMALL = §2b *The single-ticket plan* below;
  - **the first `plan note`** (the research note) opens with
    `**Tier:** SMALL|MEDIUM|FULL — <reasons>`, one line, so the planning
    ticket records the decision and why. When a pulled request's mode label
    decided it, the line names the label and the request (e.g. `**Tier:**
    MEDIUM — plan-quick label on TICK-nn`); a downgraded run request says
    that too (e.g. `**Tier:** MEDIUM — plan-run label on TICK-nn, not SMALL:
    <the failed line>; planned with Confirm plan`).
  - **the effort is not decided by the tier.** The same research note
    carries, directly under the tier line, `**Effort:** high|medium|small — <why>`
    (at most High; `very high` only carried from a person) (or `**Effort:** none — <why it cannot
    be told>`): the effort chosen for the plan's execution and the reason,
    by the table in §2 item 1d. A split writes none (§2c).
- Run `bun .claude/skills/plan-steps/tk.ts me` early. It proves the server is
  up and the token valid, and prints the project key (e.g. `TICK`) the
  ticket keys carry. If it fails, stop and report why (server down,
  `TICKETING_PAT` unset, token revoked, several projects in scope needing
  `TICKETING_PROJECT_ID`, `Session:  none`, …): there is no file-system
  fallback, so no plan until the ticketing system is reachable. With
  `Session:  none` no plan can be opened — a harness without
  `CLAUDE_CODE_SESSION_ID` passes `--session <id>`; never invent one.
- **Open the plan now**, before reading a single source file (tier SPLIT
  opens nothing — go to §2c):

  ```sh
  bun .claude/skills/plan-steps/tk.ts plan open --scope M - <<'DOC'
  # <goal in a few words>

  ## Original prompt

  > <the prompt, verbatim, as a blockquote>
  DOC
  ```

  Title suffix and `--scope` as *Route the request* says; `## Original
  prompt` as §0 *Documents become sections* says. It prints `master <KEY> (<id>) planning <KEY> (<id>) story <id> "<name>"`.
  The master key is `<master>` in every later command; the planning ticket is
  yours (in_progress, assigned to the PAT) until release.
- **Review existing plans** right after `plan open`: run
  `bun .claude/skills/plan-steps/tk.ts plan list`. It prints the open plans
  — master not `done` and not `cancelled`; `--all` adds those. For each
  plan listed, decide whether the new plan needs functionality it delivers
  (read its master with `tk.ts show <key>` when in doubt).
  If it does, the new plan **depends on** it: the master document carries
  `**Depends on plans:** <key> — <why>` (§2 item 1a) and/or you run
  `tk.ts plan depends <master> <key>` (either is enough — `plan release`
  wires the header, `plan depends` wires immediately and `--remove` deletes
  those edges). Never depend on a
  `done` plan (its work is already there; tk.ts adds no edge) or a
  `cancelled` one (tk.ts refuses). State the conclusion in the research
  `plan note` — "depends on no other plan" is a valid conclusion.
  **Sibling requests of a split.** When the pulled request carries a
  `**Depends on requests:**` line, run
  `bun .claude/skills/plan-steps/tk.ts plan split status <origin>` with the
  key from the `Split from:` line. It prints one row per request the split
  generated (`Ticket · Mode · Status · Handler · State · Plan · Title`).
  For every sibling the line names: a `Plan` column showing a master that is
  not `done` goes on this plan's `**Depends on plans:**` (a `done` one
  needs no edge); a sibling with **no plan yet** (`—`) cannot be depended
  on — record it under the master's Risks & fallbacks and name it in the
  report, so the person plans and runs the two in order. Quote the
  `**Depends on requests:**` line with the rest of the description in
  `## Original prompt`; it is part of the prompt.
- **Calibrate** next: run `bun .claude/skills/plan-steps/tk.ts plan calibrate`.
  It prints the tokens-per-point rate the server will use for this plan's
  token estimates, the overall verdict, the ratio per size (S/M/L), the
  sprint history, the trend, and — when estimates have been off — example
  tickets plus `Guidance:` lines. Record it verbatim (it is short):
  `tk.ts plan note <master> - <<'DOC'` … the calibrate output … `DOC`.
  Then **apply** it:
  - verdict `good` everywhere → keep the default sizes;
  - the overall verdict or any size line is `watch` or `bad` → run
    `tk.ts show <key>` on 2–3 of the listed example tickets to understand
    what was mis-sized (a step that hid an investigation, a "small" change
    that touched every page, …), then size the steps of this plan one notch
    up or down per the `Guidance:` lines (`M tickets run ×1.6 — size one
    notch up or split` means: what you would call M becomes L, or is split
    into two steps) and record the adjustment as a row of the master's
    design-decisions table (e.g. "M steps run ×1.6 → ambiguous steps sized
    L");
  - `insufficient` → keep the defaults and say so in the note.
- Research the codebase first (read the relevant files, configs, existing
  docs) so step documents contain real file paths, real commands, and accurate
  current-state descriptions — not guesses. Fan out Explore agents if the
  scope spans many areas. When the research is summarised, log it:
  `bun .claude/skills/plan-steps/tk.ts plan note <master> - <<'DOC' … DOC`
  (a short Markdown note: what was read, what the current state is, what
  constrains the design).
- Collect every decision you genuinely cannot make into a question list (it
  becomes human question tickets in §3b). Do **not** invent questions the
  codebase or the request already answers: decide those yourself and record
  the decision in the master document's design-decisions table. When the
  decision table and the question list are settled, `plan note` them too.

## 2. Compose the master document

The master ticket is the plan's closing task: it becomes ready when every
step — or the last wave barrier — is done, and whoever claims it runs the
plan-wide verification. (A SMALL plan has no steps: its master *is* the work —
§2b.) Its description is the master document, composed in this order:

1. First line `# <goal in a few words>` (becomes the title, ≤ 256 chars; a
   leading "Plan —" is stripped).
   1a. Optional, directly under the title: `**Depends on plans:** TICK-nn —
   why, TICK-mm — why` (or `none`) — the unfinished plans this plan needs
   (§1 "Review existing plans"). tk.ts reads every ticket key on the line;
   at release the master **and every wave-1 step** block on each listed
   plan's master, so `/plan-go` waits for those plans before starting.
   1b. Optional, directly under the title (and under `**Depends on plans:**`
   when present): `**Planning request:** TICK-nn` — the human-filed ticket this
   plan answers, when the subject came from `plan next` (§1). `plan open
   --request <key|id>` seeds the line into the provisional master; carry it into
   the final master document yourself, exactly like `**Depends on plans:**`.
   The request ticket is never adopted into the plan — this line is the whole
   link (tk.ts also files the master **under** the request, as its parent), and
   `plan release` hands the request back to its human for review (§4).
   1c. **Required**, directly under the title and the optional 1a/1b lines:
   `**Mode:** full|quick|single — <one clause>`. tk.ts parses the **first
   word** into the plan's mode (`full` when the line is absent or
   unrecognised — every plan filed before this line existed is full) and
   prints it in `plan status` and the release footer; executors read it to
   pick their protocol. A FULL plan writes `**Mode:** full — every step
   verifies as written; the master ends with the full bun test`; MEDIUM and
   SMALL write the lines their sections prescribe (`/plan-quick` §2, §2b).
   1d. **Optional**, directly under the `**Mode:**` line:
   `**Effort:** very high|high|medium|small — <one clause>` — how much
   reasoning the plan's **execution** needs (for a plan request, the
   request's own effort also decides the model of the **planning**
   session — see below). tk.ts reads the leading words
   (case-insensitive; `very high`, `very-high` and `very_high` are the same)
   from the document's preamble and files them as the master ticket's
   `effort` field with `plan master` / `plan update <master> master`; a value
   that is not one of the four is a warning and records no effort. The
   **auto worker reads it, and nothing else does**, to choose the model of
   the session that runs the plan:

   | Effort | Model of the executing session |
   |---|---|
   | Very High | Fable — falling back to Opus when Fable usage is exhausted |
   | High | Opus |
   | Medium | Sonnet |
   | Small | Sonnet |
   | none (no line) | the worker's configured model |

   The same table gives the model of the **planning** session the auto
   worker starts for a plan request, read from the effort the *request*
   carries (the `Effort:` line of `plan next`, §1 *The effort line*): a
   request a person gave no effort is first estimated by the auto worker,
   and one that still has none is planned on the worker's configured model.
   A revision and a resumed planning session follow the master's effort,
   else the request's.

   **Only a master carries the header** — never a step, a barrier, a
   question, a fix, a review item, a report or a generated plan request
   (tk.ts ignores the header there with a warning). A plan request carries
   its effort as a **field** a person or the auto worker sets, never through
   a document header, and the server refuses the field on any ticket that is
   neither a plan's master nor a plan request. `/plan-go` and the other
   executing skills never read it; a person can change it on the master's
   ticket page.
   How to choose:

   | Effort | When |
   |---|---|
   | Very High | **never chosen by a planner** — a person sets it on the master's ticket page (or on the plan request); it is the only effort that runs on Fable |
   | High | a normal multi-area plan, and deep design or correctness work: authorization, concurrency, queues, data migrations, cross-cutting refactors |
   | Medium | straightforward work in one or two areas |
   | Small | mechanical, one-sitting changes |

   **The planner and the auto worker's estimate choose at most High.**
   Write `**Effort:** very high` only when `plan next` printed `Effort: Very
   High — set by a person` or `plan status` shows the master already at Very
   High (a revision pass carries it over); tk.ts and the server record High
   otherwise, so Very High — and with it Fable — is a person's choice on the
   master ticket (or on the plan request). An effort a person set on the
   request is applied to the master by the server whatever the document says.

   Choose it **from the work, not from the tier** — a FULL plan can be
   Medium, and a single-ticket plan that touches a lock can be High. An
   effort a person set on the request (`set by a person` on the `Effort:`
   line of `plan next`) or named in the request's text **wins**: the
   master's `**Effort:**` line is that level. An **estimated** one
   (`estimated by the auto worker`, never Very High) is the **default**: keep it unless the
   research shows the execution needs another level, and give the reason in
   the research note's `**Effort:**` line. With `Effort: none` choose from
   the work by the table above. When unsure between two levels, take the
   **lower** of the two. A planner that cannot tell writes **no line**: the
   effort is optional, and a plan without one runs on the worker's
   configured model exactly as before.
Items 2–10 of the master document, the wave rules, the step documents (§3)
and the question documents (§3b) live in a side file. **Tier FULL or MEDIUM:
Read `.claude/skills/plan-steps/PLAN.md` now** and compose the master from
its item 2 on, then file it with `plan master <master> -` as it says. A
single-ticket plan (§2b) does not read it.

**Verification ladder** — binding for every document this skill writes; who
proves what, per ticket kind:

| Ticket | Proves | Runs | Never runs |
|---|---|---|---|
| step / fix | its own change | `bun run typecheck`; `bun test <file> …` for the test files the step created or changed **and** the existing test files that cover the modules it edited (named by path — the plan says which); any check specific to the step's deliverable (a route answering, a script's `--check`) | the full `bun test`, the whole `test/integration/` folder, `bun run test:concurrency` |
| wave barrier *(multi-wave plans only)* | the wave integrates | `bun run typecheck`; `bun test <files>` over the union of the wave's steps' test files — the `Barrier:` paragraph of its wave section, verbatim | the full `bun test`, the whole `test/integration/` folder |
| master (FULL / MEDIUM) | the whole plan | `## Plan-wide verification`: typecheck, the named suites the plan warrants, then the **full `bun test`** as its final item | — |
| single-ticket master (SMALL) | the change it made itself | `bun run typecheck` + the test files it wrote + the existing files covering the modules it touched, **named by path** (§2b) | the full `bun test` — the human runs it after the ticket lands |

A step's tests are the ones *relevant* to its change, chosen while planning
and listed by path in its Verification section; the full sweep exists to
catch what those choices missed, and it runs once, at the end, on the
master — not per task and not per wave. Every row's test files are also what
the executors' test-failure triage reads: a file named here is the story's
own, any other is foreign — see §3, *Tests whose rule the plan changes on
purpose*.

### 2b. The single-ticket plan (SMALL)

When the router (§1) picked SMALL, the plan is **one ticket**: the master is
the work, and `/plan-go` dispatches it to one agent exactly like a step. The
procedure up to here is unchanged — `plan open --scope S` with the title
`# <goal> (single)`, then `plan list` (dependencies) and `plan
calibrate` (record its output), then the research — and from here it shrinks
to one document:

1. **The master document is the whole plan.** Write it with `plan master
   <master> -`, in this order:
   - `# <goal> (single)`;
   - optional `**Depends on plans:**` / `**Planning request:**` (items 1a, 1b);
   - `**Mode:** single — the master is the work; no steps, no barrier`
     (required; tk.ts parses the first word);
   - optional `**Effort:** high|medium|small — <one clause>` (§2
     item 1d; at most High unless a person already set Very High), after `**Mode:**` — and after the `**Run:**` line in a run
     plan (§4 *Run plans*). The single-ticket master carries it like any
     other master; most SMALL plans are `small`, but choose from the work;
   - `**Estimated scope:** S|M — <rough description>` (default `M`): the
     master's points come from this header, as a step's do (1 / 3);
   - `## Original prompt` — verbatim blockquote (the `original-prompt`
     section — required);
   - `## Prompt revisions` — only when the request or a revision pass has any
     (§0), verbatim, right after Original prompt;
   - `## Goal` — what is true when the ticket is done;
   - `## Context` — the files to touch (real paths), one line each on what is
     there now, and the constraints;
   - `## Implementation details` — the concrete, ordered change;
   - `## Tests inside the step` — the test file to create or extend and the
     2–5 cases it must cover;
   - `## Out of scope` — binding, as for a step;
   - `## Verification` — the single-ticket row of the ladder above, every
     file **named by path**, and never a client build or a screenshot
     either (unless the picture is the deliverable);
   - `## Execution instructions` — one sentence: `/plan-go` dispatches this
     ticket to one agent, which commits only its files and `tk.ts done`
     pushes; run with `/plan-go "<story name>"`.
   No step index, no dependency graph, no `## Execution waves`, no separate
   `## Plan-wide verification`.
2. **No step documents, no barrier.** §3 does not apply. A human question is
   filed **only** for an irreversible decision (the §3b template of
   `.claude/skills/plan-steps/PLAN.md`, with
   `**Blocks:** all` — it blocks the master); everything else is decided and
   recorded in a short decisions list inside `## Context` or
   `## Implementation details`. A question is a sign the request may not be
   SMALL — say so in the report.
3. **Two planning notes** instead of four: one after research and decisions
   (opening with the `**Tier:** SMALL — <reasons>` line, then the calibrate
   output, what was read, the decisions), and one reading `filed as a single
   ticket` (plus `questions filed: …` when there is one).
4. **`plan release` is unchanged** (§4). It accepts zero steps **only** in
   single mode (and refuses a single plan that has steps: `a single-ticket
   plan has no steps — use quick`), estimates the master from its scope
   header, and prints `single ticket` in the "Planning complete" summary and
   `Mode: single · barriers: none (single ticket)` in the footer.

A SMALL plan that grows during research (a fourth area, a schema change, a
decision only a person can take) is not force-fitted: finish it as MEDIUM or
FULL instead — retitle through `plan master` (tk.ts warns that the story name
differs; say so in the report) and file the steps — or, if it was already
released, tell the user to press **Revise plan**.

### 2c. The split (SPLIT)

When the router (§1) picked SPLIT, the answer is **not a plan** but one
**plan request per plan** cut, each parked for **Approve for Planning**: no
`plan open`, no story, no master, no planning ticket, no `**Effort:**` line.
**Read `.claude/skills/plan-steps/SPLIT.md` now** and follow its nine items:
`tk.ts me`, the untitled origin named with `plan title`, the cut, the note on
the origin, `plan split request --from <origin> -` in dependency order, `plan
split release`, the prompt-driven split, the interrupted split continued with
`plan split status`, a request that needs only one plan planned as its tier.

## 3. Write the step documents

The step template, the header lines tk.ts parses and *Tests whose rule the
plan changes on purpose* are in `.claude/skills/plan-steps/PLAN.md` §3, read
at §2 by a FULL or MEDIUM plan. A **single-ticket plan writes no step
documents** (§2b).

### 3b. Human questions

The question template and its rules are in
`.claude/skills/plan-steps/PLAN.md` §3b. A single-ticket plan that must ask
an irreversible question reads that section, and only that one, for the
template.

### 3c. External tickets

A need only another project can meet is an external ticket (`plan external`,
after the steps): template and rules in `.claude/skills/plan-steps/PLAN.md` §3c.

## 4. Release

```sh
bun .claude/skills/plan-steps/tk.ts plan release <master> --tokens-in <N> --tokens-out <M> --note estimated
```

`--tokens-in` / `--tokens-out` estimate **this planning session's** context
(input ≈ what you read, output ≈ what you wrote). Round freely and always
pass `--note estimated`; a missing pair only warns, but then the planning
phase has no usage row.

Release, in this order:

- makes sure the plan has its story (created and attached when the master
  was filed without one);
- creates the barrier tickets — **one per wave, only for a plan with two or
  more waves**; a single-wave plan gets none and its master blocks on every
  step directly; a single-ticket plan (`**Mode:** single`) releases with
  **zero steps** and no barrier, and release refuses zero steps in any other
  mode;
- wires every `blocks` edge: step → the previous wave's barrier, barrier →
  its steps, the master → the last barrier when one exists, else the master →
  every step, **plus the master and every wave-1 step onto each unfinished
  plan listed under `Depends on plans:`** — a `done` plan gets no edge, a
  `cancelled` one is an error;
- records one **points** estimate on every ticket that lacks one (steps from
  their scope; barriers, master, planning ticket and fixes by default; the
  server derives the tokens);
- records the planning usage on the planning ticket, moves it to `done` with
  a "Planning complete — …" summary (`<n> steps in <m> waves`, or `single
  ticket` for a SMALL plan) and posts the ticket table as a comment on the
  master;
- **releases the story** (`story released — take it with …`): the plan is now
  "not taken" and any `/plan-go` can take it;
- **parks the master for human review** (below) and prints the status table
  (`Ticket · Ref · Kind · Wave · Status · Assignee · Blockers`) followed by a
  `Story: … · Sprint: …` footer, a `Depends on plans: TICK-nn (<status>), …`
  line (or `Depends on plans: none`), a `Mode: full|quick|single · barriers:
  per wave|none (single wave)|none (single ticket)` line after `Plan review:`,
  an `Effort: Very High|High|Medium|Small` line directly under it (`Effort:
  none` when the master carries no effort — check that it reads what the
  master document's `**Effort:**` line says, §2 item 1d (a `very high` the
  planner wrote is recorded as High unless a person set it or it is the request's); a mismatch means the
  line was misspelt or sits below the first `## ` heading — fix it with `plan
  master` and release again),
  and two totals lines, `Points: …` and `Tokens: …`, broken down by phase
  (planning · management · execution; a single-ticket master counts under
  execution).

It is idempotent — re-run it after any `plan update` or added step: the
planning ticket is closed only once, an existing barrier is kept and
refreshed, and tickets that are already released are skipped with a warning,
because their descriptions, estimates and edges are locked for agents
(transitions, the master comment and the story release still run). It exits 1
on a `done` or `cancelled` master and on a bad graph.

**Release does not start anything: it hands the plan to a human.** The steps,
the barriers and the master all stay in `backlog`, and the last write of the
release parks the master in `in_review` with `handler = human`. The work queue only ever serves `todo` tickets, so **no agent can pull
a single ticket of this plan — and `/plan-go` refuses the story outright —
until a human opens the master's ticket page and decides**:

- **Confirm plan** hands the master back to the agents (`handler = agent`),
  walks it to `todo` and promotes every **agent-handled** `backlog` child of
  the plan to `todo` — that is the moment the plan becomes runnable. The
  plan's **question tickets are human-handled, so they stay in `backlog`**
  and are answered on `/attention`.
- **Revise plan** posts what the human wants changed, hands the master back to
  the agents and leaves it `in_review` — the state `plan revise` looks for, so
  the next `/plan-steps` run re-plans this plan (§1, branch 0).
- A comment an agent adds to the parked master (it is `human`-handled while
  in review) is held for approval and hidden from every agent, so `plan
  revise` only ever shows human comments and approved agent comments.

Confirming a plan does **not** start a plan that still has unanswered human
questions: the story-wide human hold is an independent gate, so a story with
an open human ticket keeps handing out nothing even after approval. That is
by design — report it as "waiting on the questions", never as a bug.

Pass `--hold` only when the user asked to plan without even parking the plan
for review (`MANUAL.md` says what it leaves behind).

**Run plans are the one exception.** `/plan-run` and `/plan-run-quick` file a
single-ticket plan (`**Mode:** single`, story name suffixed `(run)` /
`(run-quick)`) whose master carries `**Run:** review — …` or `**Run:** quick
— …` directly under the `**Mode:**` line, and release it with `tk.ts plan
release <master> --run`. That release does not park the master: it comments
`Plan run — released without Confirm plan (…)` on it, moves it to `todo` and
keeps the story with the planning PAT, whose session then executes the plan
as `/plan-go` does.
`--run` is refused — exit 1, nothing written —
for a plan that is not single mode, has no `**Run:**` header, has an open
human question, or is released with `--hold`. `/plan-steps` passes `--run`
**only** when a pulled request's plan-mode label (`plan-run` or
`plan-run-quick`, §1 *The mode label picks the strategy*) sent it into
`/plan-run` or `/plan-run-quick` and the request passed the SMALL test — never
for a prompt, an unlabelled request or any other label. Invoked directly, the
run skills refuse a request that is not SMALL before `plan open` and send it
here. The hand-back of the planning request (below) happens in a `--run`
release as in any other.

**A split has no `plan release`.** Tier SPLIT (§2c) files no master, so there
is nothing to release, park or confirm here; `SPLIT.md` hands the origin back.

When the plan came from a planning request — the master carries a
`**Planning request:** TICK-nn` line (§2 item 1b), or was filed under the
request as its parent by `plan open --request` — release hands that request
back to its human: it comments on it naming the master, the step/wave counts
and the story, moves it to `in_review`, and asks the server to set its handler
back to `human`. The agent never closes it: a human marks it `done` — independently of
**Confirm plan** on the master, which alone makes the plan runnable — or
comments the changes wanted and sets the handler back to **Agent** while
leaving it in review, which is the signal for another `/plan-steps` pass that
re-plans from the comment with this master as the previous plan. None of this
can fail a release: every refusal is only a warning — in particular this
server lets only a human change a handler, so expect `still agent-handled …
flip it to Human on the ticket page` and pass it on to the user. A request
that is already terminal (`done`/`cancelled`) is left alone.

Check the printed table before reporting:

- `planning` is `done`; `master` is **`in_review`** with handler `human`
  (`backlog`, handler `agent`, with `--hold`); every `step-NN`, `wave-N` and
  question is **`backlog`**, the questions with handler `human`.
- Blockers. The master: the last barrier (multi-wave plan) — or every step
  (single-wave plan) — or none of those (single-ticket plan), plus each plan
  under `Depends on plans:` that is not `done`/`cancelled`, plus any question
  blocking `all`. Each `wave-N`: as many as wave N has steps. A wave-1 step:
  the questions blocking it plus the unfinished plan dependencies. A wave
  N ≥ 2 step: its direct `Depends on` count + 1 (the `wave-(N-1)` barrier) +
  the questions blocking it.
- The `Mode:` footer line names the mode you wrote and the barrier layout you
  expect; `full` on a plan you wrote as quick or single means the `**Mode:**`
  line was missing or malformed — fix it with `plan master` and release again.
- The last footer line reads `Awaiting human review: TICK-nn — Confirm plan on
  the ticket page (or Revise plan to send it back to /plan-steps)`. Anything
  else means the parking did not happen: `Plan review: not released yet …`
  (the master is still `backlog` — `--hold`, or the park was refused with a
  `master … not parked for review` warning), `Revision requested: TICK-nn`
  (still in the previous revision round) or `Plan review: approved (…)`.
- The footer names the plans you intended under `Depends on plans:` (or
  `none`), the planning request with its status (`Planning request: TICK-nn
  (in_review)` — waiting on its human, not closed) and the story and sprint
  (`Sprint: none` only means the project has no current sprint).
- `Tokens:` shows, under planning, the usage you just passed (e.g. `planning
  1.3k of 120k`).
- The story is released; if the log says it stays with someone else, a person
  or another agent took it during planning — report it. Any `[HUMAN]`
  fallback warning printed earlier goes into the report too.

If release reports a dependency cycle or a wave inconsistency, the plan's
graph is wrong: fix the offending step with `plan update <master> step-NN -`
and release again. If tk.ts cannot reach the server at any point, stop and
report it (§1). Use `plan status <master>` to re-check later, and
`plan cancel <master>` if the user abandons the plan.

## 5. Report

Finish by telling the user (a split reports what `SPLIT.md` lists instead):

- the master key and title, and the project/seam it was filed under;
- the tier and why, in one line; for SMALL, that the master is the **only**
  ticket and the work itself, that the executor runs only the test files
  named in it, and that the human runs the full `bun test` after it lands;
- the **effort** recorded on the master (the `Effort:` line of the release
  footer) and the model it selects when the auto worker runs the plan — Very
  High → Fable (Opus when Fable usage is exhausted), High → Opus, Medium and
  Small → Sonnet — or, with `Effort: none`, that the plan runs on the
  worker's configured model; one clause on why that level; and, when the
  subject came from `plan next`, which effort the **request** carried and
  whether it was set by a person or estimated by the auto worker (its
  `Effort:` line), saying so when the master's differs from an estimate; and
  that Very High is never the planner's choice, and that the server applies a
  person's request effort to the master;
- the story (name and id) and the sprint it landed in;
- the planning ticket: key, points, the usage recorded, that it is `done`,
  and the session id on it (from `tk.ts me`);
- for a pulled request: its key and title and that it is in review for its
  human (or the status the footer printed), any handler warning; the title
  applied to a request filed without one (`request <KEY> titled "<title>"`) —
  or the `not titled` warning, verbatim, with the `tk.ts plan title` command
  to run; its **plan-mode label** and the strategy it selected, or that it
  carried none and the router chose; a **downgraded** `plan-run` /
  `plan-run-quick` request: which line of the SMALL test failed, that the
  plan waits for Confirm plan instead of running, and that the request says
  so in a comment;
- the step key range and the wave layout with the barrier keys — or "1 wave,
  no barrier (single wave)"; a SMALL plan has neither;
- the calibration verdict and the sizing adjustment applied — or
  "insufficient history, defaults kept";
- the footer totals: points per phase and the server-derived token estimate;
- how many tickets the plan holds, all `backlog` until the plan is confirmed;
- the plans this plan depends on (keys and status), and that `/plan-go` waits
  for them to be `done` — or "depends on no other plan";
- the human question keys, with "answer them on /attention" — needed **as
  well**: confirming the plan does not release a story with an open human
  ticket — and any `[HUMAN]` fallback warning;
- the external ticket keys with their target project, and that a person
  with write access in both projects must press **Promote to <KEY>** on
  each;
- any `original-prompt` warning tk.ts printed, verbatim;
- **that execution cannot start until a human confirms the plan**, in this
  order: (1) the master is in review and waiting on them — its key and URL
  (`<TICKETING_URL>/tickets/<master id>`, from the id `plan open` printed);
  (2) on that page they press **Confirm plan**, or **Revise plan** with a
  comment saying what to change; (3) *after* they confirm, the command that
  runs it, with the story's exact name in quotes: `/plan-go "<story name>"`.
  With `--hold`: a `plan release` without `--hold` has to run first;
- **when this run was a revision pass** (§1 branch 0): which plan you revised
  (master key and story name), what the human's comment asked for, what you
  changed (step keys rewritten, steps added, anything you could not change —
  in particular a master document that needs their edit, or released tickets a
  human must cancel), that the master is **back in review** for a second look,
  and that the planning usage of this pass was not recorded.

Never list the token.
