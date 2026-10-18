# plan-go — failing tests: the triage (section 4b of SKILL.md)

Read when a test fails in a barrier's or the master's verification, when an
agent reports a failing test it could not class, or when `tk.ts ready` lists
an `answersToApply` entry. `<master>`, `<ref>` and `<key>` are as in SKILL.md.

A failing test is **classed before anything is done about it** — by whoever
ran it: a step or fix agent in its own verification, the orchestrator on a
barrier or on the master. Every failing test gets exactly one of three
classes, spelled exactly `story`, `technical` or `business-logic`, and the
class decides what happens next: the first two are fixed and the run
carries on, the third stops the story on a question for a person. Nobody
edits a test's assertion, reverts a change or re-runs "to see" before the
failure has a class.

**Whose test is it?**
`tk.ts plan tests <master> <failing file>…` prints one line per file:
`story` or `foreign` (always exit 0; without files it lists the story's
test files, `--json` for both). A **story test** is a test file the plan's
documents name by path — the master, a step, a fix — or one a commit of the
plan changed (a commit whose subject starts with the key of one of the
plan's tickets). Every other test file is **foreign**: it was there before
the plan and the plan never said it would touch it.

**The order.** For each failing test, the first rule that applies:

1. Its file is a story test → **`story`**. The plan wrote or changed that
   test; making it pass is the plan's own work.
2. It is foreign and it fails **mechanically** → **`technical`**.
   Mechanical means one of:
   * a compile, import or type error;
   * a renamed or moved symbol;
   * a fixture, factory or helper whose shape changed;
   * a pin test — file lists, hashes, bundle output, generated docs;
   * ordering, timing, port or environment trouble;
   * a test that is already red on the sprint's branch without the story's
     commits.

   It is also `technical` when the plan's master **explicitly decided** the
   behavior the test asserts differently: a person approved that decision
   with Confirm plan, so the test is simply out of date. Quote the decision
   in the fix.
3. Everything else is **`business-logic`**: the test asserts an observable
   rule — a status code, a permission, a state transition, a validation,
   queue order, a number, copy a user reads — and the story now gives a
   different result that no plan document decided.

**In doubt between `technical` and `business-logic`, it is
`business-logic`.** A wrong `technical` silently rewrites a rule somebody
relied on; a wrong question costs one round trip.

**How to tell** — three checks, each a few minutes:

* **Read the failing assertion, not just the error line.** `expected 403,
  received 200` is a rule; `Cannot find module` and `x is not a function`
  are not. A pin test says in its own header what it pins.
* **Is it red without the story?** Run the one test file at the commit the
  run's worktree started from (the parent of the plan's oldest commit), in a
  throwaway worktree — never reset, stash or check out in the run's own:

  ```
  git worktree add --detach /tmp/wt-<master>-base <start commit>
  install -m600 .env /tmp/wt-<master>-base/.env
  ln -s "$(readlink -f node_modules)" /tmp/wt-<master>-base/node_modules
  (cd /tmp/wt-<master>-base && bun test <file>)
  git worktree remove --force /tmp/wt-<master>-base
  ```

  Red there too → `technical` (the story did not break it); green there →
  the story changed something the test sees, go on to the third check.
* **Search the master for the rule.** `tk.ts show <master>` — its design
  decisions, and the step that made the change. A decision that states the
  new behavior makes the failure `technical`; silence makes it
  `business-logic`.

**What each class becomes:**

| Class | A step or fix agent, in its own verification | The orchestrator, on a barrier or the master |
|---|---|---|
| `story` | corrected inside the ticket — no fix ticket; it is the ticket's own work | `tk.ts fix <master> <ref> --class story --title "<what>" -` |
| `technical` | corrected inside the ticket when the correction is the foreign test file itself or a file the ticket already owns; else `tk.ts fix <master> <key> --class technical --title "<what>" -` then `tk.ts fail <key> "fix ticket filed: <key>"` | `tk.ts fix <master> <ref> --class technical --title "<what>" -` |
| `business-logic` | `tk.ts ask <master> <key> --class business-logic --title "<the rule in question>" -` then `tk.ts fail <key> "waiting on question-NN"` | `tk.ts ask <master> <ref> --class business-logic --title "<the rule in question>" -` |

One fix per distinct **failure**, one question per distinct **rule** —
several tests protecting one rule are one question, listing all of them. A
barrier or the master then `fail`s **once**, naming every fix key and every
question key it filed. A fix body carries the exact command and its output,
the files involved, the class with one line of why it is that class, and
what green looks like; `--class` writes a `**Failure class:**` header on
the ticket, so a person reading the story sees every call that was made. In
a single-ticket plan the one agent follows the step column with `<key>` =
the master. A failure that is not a test — a typecheck error, a build that
does not start — is never `business-logic`: it is `story` when the file is
the plan's own and `technical` otherwise.

**The question document.** The person has to be able to decide from the
ticket alone, so the body has these five sections — and tk.ts refuses
`ask --class business-logic` (exit 2, nothing filed) when `## Failing
tests` or `## Options` is missing:

```
## Failing tests
<file> › <test name>, one per test, each with the assertion output verbatim
(expected / received) and the command that ran it.

## Rule the tests protect
The rule in one or two plain sentences, as a user or an API client sees it.

## What the story changed
The ticket (<key>) and commit (<sha>) that changed the result, and what the
result is now.

## Options
1. Keep the old rule — the story's code changes (say what would change).
2. The new rule is intended — the tests change (say which assertions).
(3. … any real third option.)

## Default if unanswered
The option applied when this ticket is closed without an answer, and why.

Answer in a comment, then resolve this ticket on /attention — the story is
paused until you do.
```

**The story is now paused.** The question is a human ticket, so the server
hands out nothing from the story — the fix tickets filed in the same pass
included — until it is `done` or `cancelled`. Finish the agents already in
flight, **keep the story**, keep the worktree, then stop and report
(SKILL.md section 1, step 8). Never edit the test, never revert the story's change
and never lower a check to get past a business-logic failure: the person's
answer is the only way through.

**When the answer is in.** `tk.ts ready <master> --json` lists it under
`answersToApply` — a business-logic question that is `done` or `cancelled`
and that no fix ticket names yet. For each entry, **before** re-running the
verification of the ticket it blocked:

1. Read the answer: `tk.ts show <question key>`.
2. File the work it asks for, on the ticket the question blocked (the
   entry's `blocks`):

   ```
   tk.ts fix <master> <blocked ref> --class story --answers <question ref> \
     --title "Apply the answer to <question ref>: <what>" -
   ```

   The body quotes the answer and names the concrete change — the story's
   code changes (the old rule stays), or the tests change (the new rule is
   intended). A question closed with **no comment from a person** is applied
   as its `## Default if unanswered`. `--answers` writes an `**Answers:**
   question-NN` header, which is what takes the entry off `answersToApply`
   — a resumed run never files it twice.
3. The fix comes out of `tk.ts next` like any other. Once it is `done` the
   blocked ticket is ready again and its verification is run again — and a
   test that still fails is triaged again, from the top.

