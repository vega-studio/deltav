import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { UserConfig } from "vite";

import { deltavVitePlugins } from "./build/plugins/vite.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(
  fs.readFileSync(path.resolve(ROOT, "package.json"), "utf8")
);

/**
 * Vite config used only by Storybook (its Vite builder loads this file):
 * deltav's asset loaders, React, and the release version define.
 */
const config: UserConfig = {
  plugins: deltavVitePlugins(),
  define: {
    "import.meta.env.VITE_RELEASE_VERSION": JSON.stringify(version),
  },
  build: {
    cssCodeSplit: false,
  },
};

export default config;
