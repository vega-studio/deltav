/**
 * Library build: bundles `ui/index.ts` with Bun.build and writes the same
 * `dist` layout the devops release build produced.
 *
 *   bun build/build.ts [--outdir <dir>]   (default: dist)
 *
 * Outputs (relative to the out dir):
 * - ui/index.js + ui/index.js.map   the minified ESM bundle
 * - types/ui, types/util            declarations from tsc
 * - stories                         a copy of ui/stories
 * - package.json, components/package.json
 */
import fs from "fs";
import os from "os";
import path from "path";

import { deltavBunPlugin } from "./plugins/bun.js";

const ROOT = path.resolve(import.meta.dir, "..");

function fail(message: string): never {
  console.error(`build: ${message}`);
  process.exit(1);
}

/** Parses `--outdir <dir>` (or `--outdir=<dir>`); a bare `--` is ignored. */
function parseOutDir(args: string[]): string {
  let outDir = "dist";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") continue;

    if (arg === "--outdir") {
      const value = args[++i];
      if (!value) fail("--outdir needs a value");
      outDir = value;
    } else if (arg.startsWith("--outdir=")) {
      outDir = arg.slice("--outdir=".length);
    } else {
      fail(`unknown argument "${arg}"`);
    }
  }

  return path.resolve(process.cwd(), outDir);
}

/** The manifest devops wrote into the dist folder (and dist/components). */
function distManifest(name: string, prefix: string) {
  return {
    name,
    private: true,
    type: "module",
    main: `${prefix}/ui/index.js`,
    types: `${prefix}/types/ui/index.d.ts`,
    dependencies: {},
    repository: {},
    scripts: {},
    devDependencies: {},
  };
}

function writeJson(file: string, value: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function formatSize(bytes: number) {
  return bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
}

async function bundle(
  outDir: string,
  version: string,
  externalNames: string[],
) {
  const result = await Bun.build({
    entrypoints: [path.join(ROOT, "ui/index.ts")],
    outdir: path.join(outDir, "ui"),
    naming: "index.[ext]",
    format: "esm",
    target: "browser",
    minify: true,
    sourcemap: "linked",
    // A package and its subpaths (react, react/jsx-runtime) stay external.
    external: externalNames.flatMap((name) => [name, `${name}/*`]),
    define: {
      "import.meta.env.VITE_RELEASE_VERSION": JSON.stringify(version),
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    plugins: [deltavBunPlugin({ css: "inject" })],
    throw: false,
  });

  for (const log of result.logs) console.error(log);
  if (!result.success) fail("Bun.build failed");

  const outputs = result.outputs.map((output) =>
    path.relative(outDir, output.path).split(path.sep).join("/"),
  );
  const expected = ["ui/index.js", "ui/index.js.map"];

  if (
    outputs.length !== expected.length ||
    !expected.every((file) => outputs.includes(file))
  ) {
    fail(
      `expected the bundle to be exactly ${expected.join(
        ", ",
      )}; got ${outputs.join(", ")}`,
    );
  }
}

function declarations(outDir: string) {
  const typesDir = path.join(outDir, "types");
  const tsc = path.join(ROOT, "node_modules", ".bin", "tsc");
  // tsconfig.json with only the published sources (and their ambient
  // declarations) as input, so the type state of test/ or other tooling
  // folders never blocks a library build. Only types/ui and types/util are
  // published, as devops did.
  const tsconfigDir = fs.mkdtempSync(path.join(os.tmpdir(), "deltav-types-"));
  const tsconfig = path.join(tsconfigDir, "tsconfig.json");
  fs.writeFileSync(
    tsconfig,
    JSON.stringify({
      extends: path.join(ROOT, "tsconfig.json"),
      compilerOptions: { rootDir: ROOT },
      include: ["ui", "util", "dts"].map((dir) => path.join(ROOT, dir)),
    }),
  );
  const args = [
    tsc,
    "--emitDeclarationOnly",
    "--declaration",
    "--outDir",
    typesDir,
    "-p",
    tsconfig,
  ];

  // A worktree whose node_modules is a symlink to another checkout makes tsc
  // resolve packages through their real path and fail declaration emit with
  // TS2742; resolving through the symlink keeps the paths portable.
  if (fs.lstatSync(path.join(ROOT, "node_modules")).isSymbolicLink()) {
    args.push("--preserveSymlinks");
  }

  const proc = Bun.spawnSync(args, {
    cwd: ROOT,
    stdout: "inherit",
    stderr: "inherit",
  });
  fs.rmSync(tsconfigDir, { recursive: true, force: true });
  if (proc.exitCode !== 0) fail(`tsc exited with ${proc.exitCode}`);

  for (const entry of fs.readdirSync(typesDir, { withFileTypes: true })) {
    if (entry.name === "ui" || entry.name === "util") continue;
    fs.rmSync(path.join(typesDir, entry.name), {
      recursive: true,
      force: true,
    });
  }
}

function listFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

async function main() {
  const outDir = parseOutDir(process.argv.slice(2));
  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
  );
  const externalNames = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ];

  // Only the folders this build owns are reset; anything else is kept.
  for (const folder of ["ui", "types", "stories", "components"]) {
    const target = path.join(outDir, folder);
    fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(target, { recursive: true });
  }

  await bundle(outDir, pkg.version, externalNames);
  declarations(outDir);

  fs.cpSync(path.join(ROOT, "ui/stories"), path.join(outDir, "stories"), {
    recursive: true,
  });
  writeJson(path.join(outDir, "package.json"), distManifest(pkg.name, "."));
  writeJson(
    path.join(outDir, "components/package.json"),
    distManifest(pkg.name, ".."),
  );

  const bundleFiles = ["ui/index.js", "ui/index.js.map"].map((file) => {
    const size = fs.statSync(path.join(outDir, file)).size;
    return `  ${file}  ${formatSize(size)}`;
  });
  console.log(`build: ${pkg.name} ${pkg.version} -> ${outDir}`);
  console.log(bundleFiles.join("\n"));
  console.log(
    `  types  ${listFiles(path.join(outDir, "types")).length} files (ui, util)`,
  );
  console.log(
    `  stories  ${listFiles(path.join(outDir, "stories")).length} files`,
  );
  console.log("  package.json, components/package.json");
}

main().catch((error) => fail(error?.stack ?? String(error)));
