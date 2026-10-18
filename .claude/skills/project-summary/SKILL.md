---
name: project-summary
description: Rewrites the project's public summary (abstract and ledger) from the codebase in one pass and files it as a proposal a person approves (tk.ts summary propose). Run by a person only, never by the auto worker. Use when the user says "/project-summary" or "refresh the public summary". Argument: none.
---

Base directory for this skill: `.claude/skills/project-summary`

# Project summary

Every project has a **public summary**: an **abstract** (one plain-text
paragraph) and a **ledger** (Markdown — what the project is for, its API
endpoints and CLI commands in one line each, its skills). It is what the
project says about itself to the rest of the organization, and agents of
other projects may read it, so it has to be true and it has to be public.

`/project-summary` writes both texts **from scratch**, from the codebase, in
one full pass, and files them as a **proposal**: a human question ticket
showing the proposed texts and their diff, which a person approves or
rejects. An agent never writes a summary directly — the proposal is the
only door, and nothing changes until a person approves it.

This is the full rewrite. The small edit a finished plan may owe is the
*public summary review* of `.claude/skills/plan-go/SUMMARY.md`, which the
executing skills run by themselves; that file's **What counts as a change**
and its ledger shape are the ones this skill writes to.

The skill is portable: `/update-ticketing-skills` installs it in every
repository set up with the ticketing skills.

## 0. Unattended? Stop.

This skill is **run by a person only, never by the auto worker**. It is not
an auto worker run kind, and a whole-summary rewrite needs a person to read
the diff before it is filed.

If your prompt says the session is unattended — the auto worker's sentence
is `You are running unattended, started by the ticketing auto worker` —
print one line and stop:

```
/project-summary is a person's skill: it is never run unattended. Nothing was read or filed.
```

Run no command, read nothing, file nothing. The same holds when another
skill or an agent, rather than a person, asked for it.

## 1. Where you are

Every call goes through `bun .claude/skills/plan-steps/tk.ts`; the token and
environment are the ones the plan-steps skill documents in its §0 table.
Never print the PAT.

```sh
bun .claude/skills/plan-steps/tk.ts me            # the server is up, the token valid, the project key
bun .claude/skills/plan-steps/tk.ts summary show  # the current abstract, ledger and version
bun .claude/skills/plan-steps/tk.ts summary --help  # the full contract
```

`summary show` prints the summary of the token's own project. Version 0 with
empty texts means nobody has summarised the project yet. Keep what it
printed: it is what the diff of §4 is taken against, and a sentence of it
that is still true is worth keeping word for word.

If `tk.ts summary` is unknown to the server or to tk.ts, the project's
skills or its server predate the public summary: say so and stop.

## 2. Read the project as a newcomer

Read what somebody outside the project would read to learn what it offers —
not how it is built:

* the `README`;
* the documents the project's `CLAUDE.md` map names;
* the route table or the API reference — every endpoint group;
* the CLI entry points and their usage texts (`--help`), the scripts a
  person or an agent is meant to run;
* the skills the project exports, each one's `description:`.

In a large repository fan out Explore agents, one per area (the API, the
CLI, the skills, the documentation), each asked for the public surface only
and to return one line per item. Check a claim against the code when the
documentation and the code disagree: the summary describes what exists.

## 3. Write the two texts

**The abstract** — one paragraph, plain text, **at most 600 characters**:
what the project is and what it does, for whom. No list, no Markdown, no
newline (whitespace runs are collapsed to single spaces on write). It is the
card another project's agent reads first to decide whether to open the
ledger.

**The ledger** — Markdown, **at most 20 000 characters**, with these
sections in this order:

* **Purpose** — a few sentences: what the project is for and who uses it.
* **API** — one line per endpoint group: the method, the path, what it
  answers. No parameters, no nuance.
* **CLI** — one line per command: the command and what it does.
* **Skills** — one line each: the name and when to use it.
* **Not covered** — what the project deliberately does not do, so a reader
  does not go looking for it.

A section with nothing in it says `None.` rather than disappearing. Write
the ledger's section headings as `### Purpose` and so on: in the document of
§4 only `## Abstract` and `## Ledger` cut the text.

**Public-facing only.** The summary is read outside the project:

* no internals — no architecture, no module or table names, no how it
  works inside;
* no file paths;
* no secrets, tokens, hosts, credentials or personal data;
* nothing planned or half-built: only what exists now.

Short beats complete. A reader who needs a parameter opens the project's own
reference; the ledger tells them the capability is there.

## 4. Show, then file

Run the dry run first. The document always carries both sections in full:

```sh
bun .claude/skills/plan-steps/tk.ts summary propose none --note "full run" --dry-run - <<'DOC'
## Abstract
<the abstract>

## Ledger
<the ledger>
DOC
```

`none` is the origin: this proposal comes from no plan. `--dry-run` prints
the line diff against the current texts and files nothing. Exit 2 means a
section is missing or over its limit — fix the document and run it again.
`no change` means the summary is already what you wrote: say so and stop,
there is nothing to file.

**Show the person the diff** — as printed, not paraphrased — and wait for
their go. Apply what they ask to change and show the dry run again.

On their go, run the same command without `--dry-run`. It prints
`proposal <id> · question <KEY> (<ticket id>) · based on version N`.

## 5. Report

Tell the person:

* the **question key** tk.ts printed;
* that nothing has changed yet: a person approves or rejects the proposal on
  that ticket's page (**Approve summary** / **Reject change**), and approval
  writes the new version;
* the sizes of the two texts against their limits, and anything you left
  out on purpose or could not verify.

File one proposal per run. Do not wait for the decision, and do not file a
second proposal to amend the first: a person rejects it and runs the skill
again.
