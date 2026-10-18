# plan-go — the agent protocol: what an agent dispatched on one ticket of a plan does, from its first command to its last.
`<key>`, `<master>` and `<worktree>` are the values given in your prompt.

You are working ticket <key> of plan <master> in the Bun project checked
out at <worktree>. That worktree is your working directory: run every
command as `cd <worktree> && …` (it is a detached checkout of the sprint's
integration branch with its own .env and a node_modules symlink). Never edit, commit
in, or run tests from the main project root — the user is working there.
All commands are `bun .claude/skills/plan-steps/tk.ts …`; never print the
PAT.
- `tk.ts show <key> --plan <master>` is your whole brief: the description
  and the ticket's body sections (reassembled under their `## ` headings),
  earlier comments (history from any previous attempt), blockers, and the
  text and answers of every question you were blocked by (a comment an
  agent left on a human ticket appears only once a human approved it). Run it first.
  `tk.ts show <master> --brief` holds the plan-wide design decisions; skip
  it when `<key>` is the master itself.
- Then `tk.ts start <master> <key>`: it reports your chat session id to the
  ticket (tk.ts reads `CLAUDE_CODE_SESSION_ID`; a ticket cannot be finished
  without one). If any tk.ts command exits 2 with `no agent session id`,
  stop and report that message — never invent an id.
- `tk.ts heartbeat <key> "<what you are doing>"` when you start and again
  right before verification.
- `tk.ts comment <key> "<text>"` at milestones only — started, a key
  decision, the verification result. Short and factual.
- Stay inside this ticket: its "Out of scope" section is binding. Do not
  touch other tickets' files.
- Commit **only the files you changed**, in the worktree, on its current
  detached HEAD (`git add <files> && git commit -m "<key>: <summary>"`);
  never commit other agents' files or the rest of the working tree, never
  create or switch branches. `tk.ts push` is the only thing that writes to
  the sprint's integration branch, and it reads that branch from the sprint —
  you never name it yourself. `tk.ts done` pushes for you
  (`tk.ts push <key>` merges the sprint's branch and pushes until the push
  is accepted; on a merge conflict it exits 6 — resolve, re-run your
  verification, `tk.ts push <key>` again). Every `tk.ts comment` sends
  your pushed HEAD as its verified commit; comment after pushing
  (`tk.ts comment <key> --push "…"`). `tk.ts fail` needs no commit.
  While the sprint has no repository tk.ts warns and works commit-free.
  A comment on a **human** ticket (a question, a master parked for review)
  is accepted but stays pending — hidden from every agent, you included,
  until a human approves it or switches the ticket to Agent — and needs no
  commit (tk.ts sends none unless `--commit`/`--push` is given). It is never
  a channel to other agents: use the step ticket's own comments or an `ask`
  for that.
- Need a human decision to continue (anything but a failing test — that
  is the next bullet)? File it and stop:
  `tk.ts ask <master> <key> --title "<question>" -` (heredoc body:
  context, the options, your recommended default; its `## ` headings become
  the question's sections), then
  `tk.ts fail <key> "waiting on <question-key>"` and end your work. This
  pauses the entire plan until a human answers, so ask only when you truly
  cannot proceed.
- A test fails in your verification? Class it before touching anything:
  `tk.ts plan tests <master> <file>` says `story` or `foreign`. `story` →
  fix it, it is your ticket's work. `foreign` and mechanical
  (compile/import/type error, renamed symbol, fixture shape, a pin test,
  timing, already red without this plan) → `technical`: fix it here when
  the fix is that test file or a file you own, else
  `tk.ts fix <master> <key> --class technical --title "<what>" -` and
  `tk.ts fail <key> "fix ticket filed: <key>"`. `foreign` and asserting a
  rule your change now breaks, with no decision for it in
  `tk.ts show <master> --brief` → `business-logic`: never edit that test —
  `tk.ts ask <master> <key> --class business-logic --title "<the rule>" -`
  (sections `## Failing tests`, `## Rule the tests protect`,
  `## What the story changed`, `## Options`, `## Default if unanswered`),
  then `tk.ts fail <key> "waiting on question-NN"`. In doubt between the
  last two: `business-logic`.
- Verification is `bun run typecheck` plus the test files your ticket's
  Verification section names by path (`bun test <file> …`) and any check
  specific to its deliverable. Never run the full `bun test`, the whole
  `test/integration/` folder or `bun run test:concurrency` in a step —
  if the section asks for the full suite, run the test files that cover
  the modules you changed and say so in the `done` message. The master
  runs the full suite once, at the end of the plan.
- Noticed something outside this ticket that a person should know about —
  a bug, debt, a follow-up idea — and can still finish your ticket? File a
  report and carry on: `tk.ts report file --about <key> -` (heredoc body
  starting `# Report — <title>`: what you found, where, why it matters, a
  suggested next step). A report is story-less and never pauses the plan;
  only `ask` does.
- Finished and the ticket's Verification section is green:
  `tk.ts done <key> -m "<what changed, files, verification run>" \
     --tokens-in <n> --tokens-out <n> --note estimated`
  (token counts are best-effort estimates; never fabricate precision).
- Cannot finish: `tk.ts fail <key> "<reason, exact error>"`. Never mark a
  ticket done with partial work or red verification.
- A dependency change (`package.json`) is installed with `bun install`
  from the main project root, not from the worktree.
- Report back: files changed, verification result, deviations from the
  ticket, the session id `tk.ts show <key>` prints, and the final tk.ts
  command you ran.
