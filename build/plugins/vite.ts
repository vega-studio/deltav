import react from "@vitejs/plugin-react";
import fs from "fs";
import type { Plugin, PluginOption } from "vite";

import {
  inlineAssetModule,
  isInlineAsset,
  isProjectFile,
  isShaderFile,
  shaderModule,
  stripQuery,
} from "./loaders.js";

/** Loads project `.vs` / `.fs` files as `export default "<source>"`. */
function shaderLoader(): Plugin {
  return {
    name: "deltav-shader-loader",
    enforce: "pre",
    load(id) {
      if (!isProjectFile(id) || !isShaderFile(id)) return null;
      const file = stripQuery(id);
      if (!fs.existsSync(file)) return null;
      return { code: shaderModule(fs.readFileSync(file, "utf8")), map: null };
    },
  };
}

/** Loads fonts and images as base64 data URLs. */
function inlineAssetLoader(): Plugin {
  return {
    name: "deltav-inline-asset-loader",
    enforce: "pre",
    load(id) {
      if (id.startsWith("\0") || !isInlineAsset(id)) return null;
      const file = stripQuery(id);
      if (!fs.existsSync(file)) return null;
      const code = inlineAssetModule(id, fs.readFileSync(file));
      return code ? { code, map: null } : null;
    },
  };
}

/**
 * The Vite plugins deltav needs (used by Storybook through the root
 * `vite.config.ts`): shader and inline-asset loaders, plus React with the
 * legacy decorators babel parser options.
 */
export function deltavVitePlugins(): PluginOption[] {
  return [
    shaderLoader(),
    inlineAssetLoader(),
    react({
      babel: {
        parserOpts: { plugins: ["decorators-legacy", "classProperties"] },
      },
    }),
  ];
}
