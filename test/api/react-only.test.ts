/**
 * Static API checks that keep SurfaceJSX the only surface abstraction of deltav.
 *
 * This is a node test that reads the sources as text: it never imports deltav,
 * which cannot load outside a browser.
 */
import { describe, expect, it } from "bun:test";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const REACT_SURFACE = path.join(ROOT, "ui/src/base-surfaces/react-surface");
const SURFACE_JSX = path.join(REACT_SURFACE, "surface-jsx.tsx");
const SOURCE_EXT = /\.(ts|tsx|js|jsx|mts|cts)$/;
// Built in two parts so this file does not match its own search.
const CONSTRUCTION = "new " + "Surface(";

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SOURCE_EXT.test(entry.name)) out.push(full);
  }

  return out;
}

function stripExt(file: string) {
  return file.replace(SOURCE_EXT, "");
}

describe("SurfaceJSX is the only surface abstraction", () => {
  it("constructs Surface only inside surface-jsx.tsx", () => {
    const offenders = ["ui/src", "ui/stories", "test"]
      .flatMap((dir) => walk(path.join(ROOT, dir)))
      .filter((file) => file !== SURFACE_JSX)
      .filter((file) => fs.readFileSync(file, "utf8").includes(CONSTRUCTION))
      .map((file) => path.relative(ROOT, file));

    expect(offenders).toEqual([]);
    expect(fs.readFileSync(SURFACE_JSX, "utf8")).toContain(CONSTRUCTION);
  });

  it("exports Surface from ui/src/surface/index.ts as a type only", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "ui/src/surface/index.ts"),
      "utf8"
    );

    // No wildcard re-export of the surface module.
    expect(source).not.toMatch(
      /export\s*\*\s*(as\s+\w+\s*)?from\s*["']\.\/surface(\.js)?["']/
    );

    // Every named export statement from "./surface.js" that names Surface is
    // an `export type`, and at least one such statement exists.
    const statements = Array.from(
      source.matchAll(
        /export\s+(type\s+)?\{([^}]*)\}\s*from\s*["']\.\/surface(\.js)?["']/g
      )
    );
    const namesSurface = (list: string) =>
      list
        .split(",")
        .map((s) => s.trim())
        .some((s) => /^(type\s+)?Surface(\s+as\s+\w+)?$/.test(s));
    const valueExports = statements.filter(
      (m) => !m[1] && namesSurface(m[2]) && !/\btype\s+Surface\b/.test(m[2])
    );
    const typeExports = statements.filter(
      (m) =>
        namesSurface(m[2]) && (m[1] || /\btype\s+Surface\b/.test(m[2]))
    );

    expect(valueExports.map((m) => m[0])).toEqual([]);
    expect(typeExports.length).toBeGreaterThan(0);
  });

  it("re-exports every JSX tag from react-surface/index.ts", () => {
    const index = fs.readFileSync(path.join(REACT_SURFACE, "index.ts"), "utf8");
    const exported = new Set(
      Array.from(
        index.matchAll(/export\s*\*\s*from\s*["'](\.\/[^"']+)["']/g)
      ).map((m) => stripExt(path.join(REACT_SURFACE, m[1])))
    );
    const missing = walk(REACT_SURFACE)
      .filter((file) => /-jsx\.tsx?$/.test(file))
      .filter((file) => !exported.has(stripExt(file)))
      .map((file) => path.relative(ROOT, file));

    expect(missing).toEqual([]);
  });

  it("holds no surface type other than react-surface", () => {
    const entries = fs
      .readdirSync(path.join(ROOT, "ui/src/base-surfaces"))
      .sort();

    expect(entries).toEqual(["index.ts", "react-surface"]);
  });
});
