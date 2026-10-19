import type { BunPlugin } from "bun";
import fs from "fs";
import nodePath from "path";

import {
  cssInjectModule,
  INLINE_ASSET_MIME,
  inlineAssetModule,
  shaderModule,
} from "./loaders.js";

export interface DeltavBunPluginOptions {
  /**
   * "inject" turns `.css` imports into JS that appends a `<style>` to the
   * document; "native" (default) leaves `.css` to Bun.
   */
  css?: "inject" | "native";
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ASSET_FILTER = new RegExp(
  `(${Object.keys(INLINE_ASSET_MIME).map(escapeRegExp).join("|")})$`,
  "i"
);

/**
 * Bun bundler plugin: shaders as strings, fonts/images as base64 data URLs
 * and, optionally, CSS injected from JS.
 */
export function deltavBunPlugin(
  options: DeltavBunPluginOptions = {}
): BunPlugin {
  const css = options.css ?? "native";

  return {
    name: "deltav",
    setup(build) {
      build.onLoad({ filter: /\.(vs|fs)$/ }, ({ path }) => ({
        contents: shaderModule(fs.readFileSync(path, "utf8")),
        loader: "js",
      }));

      build.onLoad({ filter: ASSET_FILTER }, ({ path }) => ({
        contents: inlineAssetModule(path, fs.readFileSync(path)) ?? "",
        loader: "js",
      }));

      if (css === "inject") {
        build.onLoad({ filter: /\.css$/ }, ({ path }) => ({
          contents: cssInjectModule(
            fs.readFileSync(path, "utf8"),
            nodePath.relative(process.cwd(), path).split(nodePath.sep).join("/")
          ),
          loader: "js",
        }));
      }
    },
  };
}
