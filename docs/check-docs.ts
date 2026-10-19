/**
 * check-docs — validates the agent-oriented documentation tree in `docs/`.
 *
 * Usage (from anywhere; paths resolve from the repository root):
 *   bun docs/check-docs.ts                 validate every doc; exit 1 on any error
 *   bun docs/check-docs.ts --strict        also reject `status: stub` and `verified-at: none`
 *   bun docs/check-docs.ts --which <path>… list the docs whose `covers` include each path
 *   bun docs/check-docs.ts --stale         list complete docs whose covered sources changed
 *                                          since their `verified-at` commit (informational)
 *
 * Rules are described in docs/CONVENTIONS.md. Node builtins only.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const NON_TOPIC = new Set(["docs/README.md", "docs/CONVENTIONS.md"]);
const REQUIRED = ["title", "summary", "covers", "related", "status", "verified-at"];
const MAX_LINES = 400;
const MAX_SUMMARY = 200;
const PATH_TOKEN = /^(ui|util|test|archive|dts|docs|\.storybook)\/[A-Za-z0-9_./-]+$/;

type Frontmatter = Record<string, string | string[]>;
interface Doc {
  path: string; // repo-relative, forward slashes
  text: string;
  fm: Frontmatter | null;
}

const errors: string[] = [];
const err = (file: string, msg: string) => errors.push(`${file}: ${msg}`);
const toPosix = (p: string) => p.split(sep).join("/");
const repoRel = (abs: string) => toPosix(relative(ROOT, abs));
const exists = (repoPath: string) => existsSync(join(ROOT, repoPath));
const normalize = (p: string) =>
  toPosix(p).replace(/^\.\//, "").replace(/\/+$/, "");

/** Every Markdown file under docs/, repo-relative, sorted. */
function listDocs(dir = DOCS): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) out.push(...listDocs(abs));
    else if (name.endsWith(".md")) out.push(repoRel(abs));
  }
  return out.sort();
}

/**
 * Parses the restricted YAML frontmatter: `key: value` scalars and `key:`
 * followed by `  - item` lines. Returns null (and records errors) on failure.
 */
function parseFrontmatter(file: string, text: string): Frontmatter | null {
  const lines = text.split("\n");
  if (lines[0].trim() !== "---") {
    err(file, "missing frontmatter (file must start with a `---` line)");
    return null;
  }
  const end = lines.indexOf("---", 1);
  if (end < 0) {
    err(file, "frontmatter is not closed by a `---` line");
    return null;
  }
  const fm: Frontmatter = {};
  let listKey: string | null = null;
  let ok = true;
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const item = line.match(/^\s+-\s+(.+?)\s*$/);
    if (item) {
      if (!listKey) {
        err(file, `frontmatter line ${i + 1}: list item without a list key`);
        ok = false;
        continue;
      }
      (fm[listKey] as string[]).push(item[1]);
      continue;
    }
    const kv = line.match(/^([a-z][a-z-]*):\s*(.*?)\s*$/);
    if (!kv) {
      err(file, `frontmatter line ${i + 1}: cannot parse "${line}"`);
      ok = false;
      continue;
    }
    if (kv[1] in fm) err(file, `frontmatter key "${kv[1]}" is repeated`);
    if (kv[2] === "" || kv[2] === "[]") {
      fm[kv[1]] = [];
      listKey = kv[2] === "" ? kv[1] : null;
    } else {
      fm[kv[1]] = kv[2];
      listKey = null;
    }
  }
  return ok ? fm : null;
}

/** Text with fenced code blocks removed, so examples are not validated. */
const stripFences = (text: string) => text.replace(/^```[\s\S]*?^```/gm, "");
/** Body after the frontmatter. */
const bodyOf = (text: string) =>
  text.startsWith("---") ? text.replace(/^---\n[\s\S]*?\n---\n?/, "") : text;

/** Relative link targets (`](x.md#a)`) in a file, without anchors; code is skipped. */
function linkTargets(text: string): string[] {
  const out: string[] = [];
  const prose = stripFences(text).replace(/`[^`\n]*`/g, "");
  for (const m of prose.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) continue;
    out.push(target.replace(/#.*$/, ""));
  }
  return out;
}

function loadDocs(): Doc[] {
  return listDocs().map((path) => {
    const text = readFileSync(join(ROOT, path), "utf8");
    const fm = NON_TOPIC.has(path) ? null : parseFrontmatter(path, text);
    return { path, text, fm };
  });
}

function list(fm: Frontmatter, key: string): string[] {
  const v = fm[key];
  return Array.isArray(v) ? v : [];
}

function validate(strict: boolean) {
  const docs = loadDocs();
  const topics = docs.filter((d) => !NON_TOPIC.has(d.path));

  for (const doc of docs) {
    const { path, text, fm } = doc;
    const lineCount = text.replace(/\n$/, "").split("\n").length;
    if (!NON_TOPIC.has(path) && lineCount > MAX_LINES) {
      err(path, `${lineCount} lines, the limit is ${MAX_LINES}`);
    }

    if (fm) {
      for (const key of REQUIRED) {
        if (!(key in fm)) err(path, `frontmatter is missing "${key}"`);
      }
      for (const key of ["title", "summary", "status", "verified-at"]) {
        if (key in fm && typeof fm[key] !== "string") {
          err(path, `frontmatter "${key}" must be a single value`);
        }
      }
      for (const key of ["covers", "related"]) {
        if (key in fm && typeof fm[key] === "string") {
          err(path, `frontmatter "${key}" must be a list`);
        }
      }
      const summary = fm.summary;
      if (typeof summary === "string" && summary.length > MAX_SUMMARY) {
        err(path, `summary is ${summary.length} characters, the limit is ${MAX_SUMMARY}`);
      }
      const status = fm.status;
      if (typeof status === "string" && status !== "stub" && status !== "complete") {
        err(path, `status "${status}" must be "stub" or "complete"`);
      }
      const sha = fm["verified-at"];
      if (typeof sha === "string" && sha !== "none" && !/^[0-9a-f]{7,40}$/.test(sha)) {
        err(path, `verified-at "${sha}" must be "none" or a 7-40 character commit sha`);
      }
      if ("covers" in fm && list(fm, "covers").length === 0) {
        err(path, "covers must list at least one path");
      }
      for (const c of list(fm, "covers")) {
        if (!exists(normalize(c))) err(path, `covers path does not exist: ${c}`);
      }
      for (const r of list(fm, "related")) {
        if (!exists(join("docs", r))) err(path, `related doc does not exist: docs/${r}`);
      }
      if (strict && status === "stub") err(path, "status is stub (--strict)");
      if (strict && sha === "none") err(path, "verified-at is none (--strict)");
    }

    for (const target of linkTargets(text)) {
      if (!existsSync(resolve(dirname(join(ROOT, path)), target))) {
        err(path, `broken link: ${target}`);
      }
    }

    for (const m of stripFences(bodyOf(text)).matchAll(/`([^`\n]+)`/g)) {
      const token = m[1];
      if (PATH_TOKEN.test(token) && !exists(normalize(token))) {
        err(path, `referenced path does not exist: ${token}`);
      }
    }
  }

  // Index: every topic doc is linked from docs/README.md.
  const indexPath = "docs/README.md";
  const indexed = new Set<string>();
  if (exists(indexPath)) {
    const text = readFileSync(join(ROOT, indexPath), "utf8");
    for (const target of linkTargets(text)) {
      indexed.add(repoRel(resolve(DOCS, target)));
    }
  } else {
    err(indexPath, "the docs index is missing");
  }

  // Map: every topic doc is named in CLAUDE.md's `## Documentation` section.
  const mapped = new Set<string>();
  if (exists("CLAUDE.md")) {
    const text = readFileSync(join(ROOT, "CLAUDE.md"), "utf8");
    const section = text.match(/^## Documentation[ \t]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
    if (!section) err("CLAUDE.md", "no `## Documentation` section");
    else {
      for (const m of section[1].matchAll(/docs\/[A-Za-z0-9_./-]+\.md/g)) {
        mapped.add(m[0]);
        if (!exists(m[0])) err("CLAUDE.md", `names a doc that does not exist: ${m[0]}`);
      }
    }
  } else {
    err("CLAUDE.md", "the root CLAUDE.md is missing");
  }

  for (const doc of topics) {
    if (!indexed.has(doc.path)) err(doc.path, `not linked from ${indexPath}`);
    if (!mapped.has(doc.path)) err(doc.path, "not named in CLAUDE.md's ## Documentation map");
  }

  for (const e of errors) console.log(e);
  const mode = strict ? " (strict)" : "";
  if (errors.length) {
    console.log(`\ncheck-docs${mode}: ${errors.length} error(s) in ${docs.length} files`);
    process.exit(1);
  }
  console.log(`check-docs${mode}: ${docs.length} files OK (${topics.length} topic docs)`);
}

function which(paths: string[]) {
  const docs = loadDocs().filter((d) => d.fm);
  for (const raw of paths) {
    const p = normalize(raw);
    for (const doc of docs) {
      const hit = list(doc.fm!, "covers")
        .map(normalize)
        .some((c) => p === c || p.startsWith(c + "/"));
      if (hit) console.log(doc.path);
    }
  }
}

function stale() {
  const docs = loadDocs().filter((d) => d.fm);
  for (const doc of docs) {
    const fm = doc.fm!;
    const sha = fm["verified-at"];
    if (fm.status !== "complete" || typeof sha !== "string" || sha === "none") continue;
    const covers = list(fm, "covers").map(normalize);
    let out: string;
    try {
      out = execFileSync("git", ["diff", "--name-only", sha, "HEAD", "--", ...covers], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch {
      console.log(`${doc.path}: cannot diff against verified-at ${sha}`);
      continue;
    }
    const changed = out
      .split("\n")
      .filter((f) => f && !f.startsWith("docs/"));
    if (changed.length) console.log(`${doc.path}: ${changed.join(" ")}`);
  }
}

const args = process.argv.slice(2);
if (args[0] === "--which") {
  which(args.slice(1));
} else if (args[0] === "--stale") {
  stale();
} else if (args.length === 0 || (args.length === 1 && args[0] === "--strict")) {
  validate(args[0] === "--strict");
} else {
  console.log("usage: bun docs/check-docs.ts [--strict] | --which <path>… | --stale");
  process.exit(2);
}
