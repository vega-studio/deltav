import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Plugin, UserConfig } from "vite";

/**
 * Test-only Vite config. It serves the fixture pages in `test/fixtures` and
 * bundles deltav straight from `ui/src`. It deliberately does not use the
 * devops plugins: the only non-standard imports in the library are shader
 * sources (`.vs`/`.fs`/`.glsl`, loaded as raw strings) and one `.scss` file
 * (replaced by an empty module).
 */

const HARNESS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HARNESS_DIR, "../..");
export const FIXTURES_ROOT = path.resolve(REPO_ROOT, "test/fixtures");

const SHADER_EXT = /\.(vs|fs|glsl)$/;

/** Loads shader sources as `export default "<source>"`. */
function shaderText(): Plugin {
  return {
    name: "deltav-test-shader-text",
    enforce: "pre",
    load(id) {
      const file = id.split("?")[0];
      if (!SHADER_EXT.test(file)) return null;
      const source = fs.readFileSync(file, "utf8");
      return { code: `export default ${JSON.stringify(source)};`, map: null };
    },
  };
}

/** Resolves every `.scss` import to an empty module. */
function emptyScss(): Plugin {
  const EMPTY = "\0deltav-test-empty-scss";
  return {
    name: "deltav-test-empty-scss",
    enforce: "pre",
    resolveId(source) {
      if (source.split("?")[0].endsWith(".scss")) return EMPTY;
      return null;
    },
    load(id) {
      if (id === EMPTY) return { code: "export default {};", map: null };
      return null;
    },
  };
}

function createTestViteConfig(): UserConfig {
  return {
    root: FIXTURES_ROOT,
    logLevel: "warn",
    clearScreen: false,
    plugins: [shaderText(), emptyScss()],
    resolve: {
      // Mirrors the `paths` of tsconfig.json that the library and tests use.
      alias: [
        { find: /^ui\/(.*)$/, replacement: path.resolve(REPO_ROOT, "ui/$1") },
        { find: /^util$/, replacement: path.resolve(REPO_ROOT, "util") },
        { find: /^util\/(.*)$/, replacement: path.resolve(REPO_ROOT, "util/$1") },
        { find: /^test$/, replacement: path.resolve(REPO_ROOT, "test") },
        { find: /^test\/(.*)$/, replacement: path.resolve(REPO_ROOT, "test/$1") },
      ],
    },
    define: {
      "import.meta.env.DEV": "true",
    },
    optimizeDeps: {
      // Pre-bundle the only third party runtime deps up front so the first
      // page load does not trigger a dependency re-optimisation reload.
      include: ["react", "react-dom", "react-dom/client"],
      entries: [path.resolve(FIXTURES_ROOT, "index.html")],
    },
    server: {
      host: "127.0.0.1",
      port: 0,
      strictPort: false,
      hmr: false,
      watch: null,
      fs: { allow: [REPO_ROOT] },
    },
  };
}

export default createTestViteConfig();
