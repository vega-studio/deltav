import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import fs from "fs";
import os from "os";
import path from "path";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dir, "../..");
const PKG = JSON.parse(
  fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
);

let outDir = "";
let bundle = "";

/**
 * The public names of an ES bundle: the identifiers after `as` (or the bare
 * names) in its final `export { … }` clause. Local minified names are ignored.
 */
function exportedNames(code: string): string[] {
  const start = code.lastIndexOf("export");
  const match = /^export\s*\{([^}]*)\}/.exec(code.slice(start));
  if (!match) throw new Error("no export clause found in bundle");

  return match[1]
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) =>
      entry
        .split(/\s+as\s+/)
        .pop()!
        .trim(),
    )
    .sort();
}

/**
 * Names the committed dist (release 5.3.1) exports that the source no longer
 * exports as values on purpose: DELTAV-49 made `Surface` a type-only export.
 */
const REMOVED_SINCE_RELEASE = ["Surface"];

/** Whether an alias declaration is `import type` / `export type`. */
function isTypeOnlyAlias(declaration: ts.Declaration): boolean {
  if (ts.isExportSpecifier(declaration) || ts.isImportSpecifier(declaration)) {
    return declaration.isTypeOnly || declaration.parent.parent.isTypeOnly;
  }
  if (ts.isImportClause(declaration)) return declaration.isTypeOnly;
  if (ts.isNamespaceImport(declaration)) return declaration.parent.isTypeOnly;
  return false;
}

/**
 * The value (runtime) exports of ui/index.ts, from the TypeScript compiler
 * API: every export whose alias chain is not type-only and ends in a value.
 */
function sourceValueExports(): string[] {
  const config = ts.getParsedCommandLineOfConfigFile(
    path.join(ROOT, "tsconfig.json"),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
  );
  if (!config) throw new Error("cannot read tsconfig.json");

  const entry = path.join(ROOT, "ui/index.ts");
  const program = ts.createProgram([entry], {
    ...config.options,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const module = checker.getSymbolAtLocation(program.getSourceFile(entry)!);
  if (!module) throw new Error("ui/index.ts has no module symbol");

  const names: string[] = [];

  for (const exported of checker.getExportsOfModule(module)) {
    let symbol: ts.Symbol | undefined = exported;
    let typeOnly = false;

    while (symbol && symbol.flags & ts.SymbolFlags.Alias) {
      if ((symbol.declarations ?? []).some(isTypeOnlyAlias)) typeOnly = true;
      symbol = checker.getImmediateAliasedSymbol(symbol);
    }

    if (!typeOnly && symbol && symbol.flags & ts.SymbolFlags.Value) {
      names.push(exported.name);
    }
  }

  return names.sort();
}

// bun:test takes a timeout as the second argument; the bun-types installed
// today (1.0.x) do not declare it.
(beforeAll as (fn: () => void, timeout: number) => void)(() => {
  outDir = fs.mkdtempSync(path.join(os.tmpdir(), "deltav-build-"));
  const proc = Bun.spawnSync(
    [process.execPath, path.join(ROOT, "build/build.ts"), "--outdir", outDir],
    { cwd: ROOT, stdout: "pipe", stderr: "pipe" },
  );
  if (proc.exitCode !== 0) {
    throw new Error(
      `build failed (${proc.exitCode}):\n${proc.stdout}\n${proc.stderr}`,
    );
  }
  bundle = fs.readFileSync(path.join(outDir, "ui/index.js"), "utf8");
}, 180_000);

afterAll(() => {
  if (outDir) fs.rmSync(outDir, { recursive: true, force: true });
});

describe("build/build.ts", () => {
  test("writes the devops dist layout", () => {
    for (const file of [
      "ui/index.js",
      "ui/index.js.map",
      "types/ui/index.d.ts",
      "types/util",
      "stories",
      "package.json",
      "components/package.json",
    ]) {
      expect(fs.existsSync(path.join(outDir, file))).toBe(true);
    }

    expect(fs.readdirSync(path.join(outDir, "ui")).sort()).toEqual([
      "index.js",
      "index.js.map",
    ]);
    expect(fs.readdirSync(path.join(outDir, "types")).sort()).toEqual([
      "ui",
      "util",
    ]);
  });

  test("writes the dist manifests", () => {
    const common = {
      name: PKG.name,
      private: true,
      type: "module",
      dependencies: {},
      repository: {},
      scripts: {},
      devDependencies: {},
    };
    const read = (file: string) =>
      JSON.parse(fs.readFileSync(path.join(outDir, file), "utf8"));

    expect(read("package.json")).toEqual({
      ...common,
      main: "./ui/index.js",
      types: "./types/ui/index.d.ts",
    });
    expect(read("components/package.json")).toEqual({
      ...common,
      main: "../ui/index.js",
      types: "../types/ui/index.d.ts",
    });
  });

  test("inlines shaders, assets and the stylesheet; keeps react external", () => {
    expect(bundle).not.toMatch(
      /(import|from)\s*\(?\s*["'][^"']*\.(vs|fs|css|svg)["']/,
    );
    expect(bundle).toMatch(/from\s*["']react["']/);
    expect(bundle).toContain("data-deltav");
    // A line of ui/src/2d/layers/circles/circle-layer.vs.
    expect(bundle).toContain(
      "edgeSharpnessBase = mix(0.1, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0));",
    );
    expect(bundle).toContain(JSON.stringify(PKG.version));
    expect(bundle).toContain("//# sourceMappingURL=index.js.map");
  });

  test("exports exactly the runtime exports of ui/index.ts", () => {
    expect(exportedNames(bundle)).toEqual(sourceValueExports());
  });

  test("exports every public name of the committed dist bundle", () => {
    const committed = exportedNames(
      fs.readFileSync(path.join(ROOT, "dist/ui/index.js"), "utf8"),
    );
    const built = new Set(exportedNames(bundle));

    expect(committed.length).toBeGreaterThan(100);
    expect(
      committed.filter(
        (name) => !built.has(name) && !REMOVED_SINCE_RELEASE.includes(name),
      ),
    ).toEqual([]);
  });
});
