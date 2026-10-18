# Documentation conventions

Rules for writing and maintaining the docs in this folder. Each doc is read by an agent that has
only a few thousand tokens to spend on it, so every rule here aims to make that read cheap,
accurate and checkable. `bun docs/check-docs.ts` enforces the mechanical rules.

## Layout

- One topic per doc, at `docs/<area>/<topic>.md`. Areas: overview, surface, instances, shaders,
  buffers, gl, math, interaction, 2d, 3d, resources, react, utilities.
- Size: 80–250 lines is the target. More than 400 lines is a checker error, and it means the doc
  should be split into two topics.
- `docs/README.md` (the index) and this file are the only docs without frontmatter.
- Every topic doc has one line in `docs/README.md` (`- [Title](area/topic.md) — summary`) and one
  line in the `## Documentation` map of the root `CLAUDE.md`. The checker rejects a doc that is
  missing from either, and an entry that names a file that does not exist.

## Frontmatter

Every topic doc starts with frontmatter between `---` lines on the very first line. It uses a
restricted YAML subset: `key: value` scalars, and `key:` followed by `  - item` lines for lists.
No quoting, no nesting, no inline lists.

```
---
title: Surface
summary: One sentence, at most 200 characters.
covers:
  - ui/src/surface/surface.ts
related:
  - surface/layer.md
status: stub
verified-at: none
---
```

| Key | Meaning |
|---|---|
| `title` | The doc's name, as used in the index |
| `summary` | One sentence, at most 200 characters, saying what the doc answers |
| `covers` | Non-empty list of repo-relative files or folders the doc describes; each must exist. A folder covers everything under it |
| `related` | List of docs (paths relative to `docs/`, each must exist); may be empty |
| `status` | `stub` (not yet written) or `complete` |
| `verified-at` | Short commit sha the content was checked against, or `none` |

## Body

A topic doc's body has these sections, in this order:

1. `## Purpose` — what the part of the system is for, in a few sentences.
2. `## Key files` — one line per file: backticked path, an em dash, what it holds.
3. `## How it works` — the mechanics: data flow, lifecycle, the important symbols and how they
   call each other.
4. `## Extension points` — how to add to or customize it (subclass, option, hook, registry).
5. `## Gotchas` — non-obvious behavior, invariants, ordering constraints, common mistakes.
6. `## Related` — links to the related docs with a few words each.

Extra `##` sections are fine when the topic needs them; put them between `## How it works` and
`## Gotchas`.

## Writing for an agent

- Dense and factual. No marketing, no history, no motivation the reader cannot act on.
- Every claim is checked against the source before it is written. If unsure, read the code; never
  guess. The source is the only truth; the deleted pre-rewrite docs are stale hints at best.
- Cite code by symbol name (`Surface.render`, `InstanceProvider`) and files by backticked
  repo-relative path (`ui/src/surface/surface.ts`). Never cite line numbers: they go stale on the
  next edit. The checker verifies that every backticked path starting with `ui/`, `util/`,
  `unit-test/`, `dts/`, `docs/` or `.storybook/` exists.
- Link other docs with relative Markdown links (`[Layer](../surface/layer.md)`); the checker
  verifies every relative link resolves.
- Short code examples are welcome when they show the canonical usage; keep them minimal.
- Do not repeat another doc: link to it.

## Update protocol

When you change source code:

1. Before editing, run `bun docs/check-docs.ts --which <changed files>` to list the docs that
   cover those files.
2. Update those docs in the same commit as the source change, so the docs never lag behind.
3. Set each updated doc's `verified-at` to the commit you checked the content against
   (`git rev-parse --short HEAD` before committing).
4. Run `bun docs/check-docs.ts` and fix every error before committing.

When you add a doc: create it with the frontmatter and body above, then add its line to
`docs/README.md` and to the `## Documentation` map in `CLAUDE.md`. Specification never goes into
`CLAUDE.md` — only the one-line map entry.

`bun docs/check-docs.ts --stale` lists complete docs whose covered sources changed since their
`verified-at` commit; use it to find docs that need re-verification. `--strict` additionally
rejects `status: stub` and `verified-at: none`, and is the bar for a fully written tree.
