// Bundler plugin of the fixture server: bunfig.toml `[serve.static] plugins`
// loads it for every HTML import Bun.serve bundles (test/harness/fixture-server.ts).
import type { BunPlugin } from "bun";
import fs from "fs";

import { deltavBunPlugin } from "../../build/plugins/bun.js";

/**
 * What the test page sees as `import.meta.env` (read by SurfaceJSX for
 * `VITE_RELEASE_VERSION`). Bun leaves `import.meta.env` untouched in a
 * browser bundle, where it is undefined; Vite, which served the fixtures
 * before, supplied `{ DEV: true }` and no release version.
 */
const TEST_ENV = JSON.stringify({ DEV: true, MODE: "test" });

/**
 * deltavBunPlugin() (shaders as strings, fonts/images inline, `.css` left to
 * Bun) plus a loader that replaces `import.meta.env` in the library sources
 * with TEST_ENV.
 */
const testServePlugin: BunPlugin = {
  name: "deltav-test-serve",
  setup(build) {
    deltavBunPlugin().setup(build);

    build.onLoad({ filter: /[\\/]ui[\\/]src[\\/].*\.tsx?$/ }, ({ path }) => ({
      contents: fs
        .readFileSync(path, "utf8")
        .replaceAll("import.meta.env", `(${TEST_ENV})`),
      loader: path.endsWith("x") ? "tsx" : "ts",
    }));
  },
};

export default testServePlugin;
