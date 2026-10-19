---
title: Toolchain
summary: How deltav's asset plugins, Storybook, library build, tests and scripts are wired without devops: shared loaders in build/plugins with Bun and Vite adapters.
covers:
  - build
  - vite.config.ts
  - bunfig.toml
  - .storybook
related:
  - overview/repository.md
  - overview/testing.md
  - react/react-surface.md
status: complete
verified-at: 4e02f8b7
---

## Purpose

The tooling that turns the repository's sources into something runnable: the loaders that make
shader, font, image and stylesheet imports work, the Storybook setup that serves the demos, and
(as plan DELTAV-62 lands) the Bun library build, the Bun test runner and the scripts. The asset
handling once supplied by the `devops` package lives in `build/plugins`, written once and adapted
to both Bun and Vite.

## Key files

- `build/plugins/loaders.ts` — pure module generators: `shaderModule`, `inlineAssetModule`, `cssInjectModule`, `isProjectFile`, `SHADER_EXTENSIONS`, `INLINE_ASSET_MIME`.
- `build/plugins/vite.ts` — `deltavVitePlugins()`: shader loader, inline-asset loader and `@vitejs/plugin-react`.
- `build/plugins/bun.ts` — `deltavBunPlugin(options)`: the same loaders as a `BunPlugin`, plus optional CSS injection.
- `build/plugins/index.ts` — re-exports the three modules.
- `vite.config.ts` — Vite config Storybook loads: `deltavVitePlugins()`, `define` of `import.meta.env.VITE_RELEASE_VERSION` from `package.json`, `build.cssCodeSplit: false`.
- `.storybook/main.mts` — Storybook config: stories, static dirs, addons, framework, all paths resolved from the config file's own directory.
- `.storybook/preview.tsx`, `.storybook/manager.mts`, `.storybook/theme.mts`, `.storybook/preview-head.html` — preview tags, manager theme, font-face declarations.
- `bunfig.toml` — Bun settings (today only `[install.lockfile] save = false`).
- `test/build/plugins.test.ts` — `bun:test` tests of the loaders and of a `Bun.build` with `deltavBunPlugin`.

## How it works

### Plugins

`build/plugins/loaders.ts` has no imports; each function returns the source of an ES module and
the adapters do the file reading:

| Function | Input | Module it returns |
|---|---|---|
| `shaderModule(source)` | `.vs`/`.fs` text | `export default "<JSON string>";` — the text unchanged (devops never compressed) |
| `inlineAssetModule(path, bytes)` | `.woff`, `.woff2`, `.ttf`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg` | `export default "data:<mime>;base64,…";`; a `?query` suffix such as `?inline` is stripped first; `undefined` for any other extension |
| `cssInjectModule(css, id)` | stylesheet text | when `document` exists, appends one `<style data-deltav="<id>">` to `document.head`, skipped if one with that id is already there; `export {};` |

`isProjectFile(path)` is false under `node_modules` and for `\0` virtual ids.

- Vite adapter (`deltavVitePlugins`): two `enforce: "pre"` plugins with a `load` hook — shaders
  (project files only, as devops did) and inline assets — then `@vitejs/plugin-react` with babel
  `parserOpts.plugins: ["decorators-legacy", "classProperties"]` so `@observable` and class fields
  parse. `.css` is left to Vite, which injects it natively.
- Bun adapter (`deltavBunPlugin({ css })`): `onLoad` handlers for `/\.(vs|fs)$/` and the asset
  extensions; with `css: "inject"` also `/\.css$/` through `cssInjectModule` (id = the path
  relative to the working directory). The default `css: "native"` leaves `.css` to Bun.

The library's only stylesheet is `ui/src/base-surfaces/react-surface/surface-jsx.css` (plain CSS,
imported by `surface-jsx.tsx`). `dts/asset.d.ts` declares the asset imports for TypeScript.

### Storybook

Storybook 8.6 with `@storybook/react-vite`, run straight from the repo:
`bunx storybook dev -p 6006 --config-dir .storybook --no-version-updates` (build:
`bunx storybook build --config-dir .storybook -o storybook-static`). No environment variable is
needed: `.storybook/main.mts` resolves the stories (`**/*.mdx`, `**/*.stories.*`, `**/*.bugs.*`
under `ui`) and static dirs (`ui/assets`, `ui/stories/assets`) from its own directory. Addons are
`@storybook/addon-links`, `@storybook/addon-essentials` and `@storybook/addon-a11y`. Storybook's
Vite builder picks up the root `vite.config.ts`, so stories get the plugins above and
`import.meta.env.VITE_RELEASE_VERSION` (read by `SurfaceJSX`). There is no `babel` hook: the
React plugin carries the decorator parser options, and `.babelrc.json` is no longer read by
Storybook.

### Library build

Still `devops package` until step-03 of DELTAV-62 lands.

### Tests

Still jest until step-02 of DELTAV-62 lands.

### Scripts and release

Scripts still call devops until step-04 of DELTAV-62 lands.

## Extension points

- New asset type: add its extension and MIME type to `INLINE_ASSET_MIME` and a `declare module`
  to `dts/asset.d.ts`; both adapters pick it up.
- New stylesheet: import a `.css` file from the module that uses it; Vite injects it in Storybook,
  and `deltavBunPlugin({ css: "inject" })` injects it from a Bun bundle.
- Storybook Vite tweaks: edit the root `vite.config.ts` (Storybook merges it).

## Gotchas

- Sass is not supported any more: stylesheets are plain `.css`.
- The shader loader in Vite skips files under `node_modules`; the inline-asset loader does not.
- `cssInjectModule` dedupes by the `data-deltav` id, so two bundles that inject the same stylesheet
  path add it once.
- `test/build/plugins.test.ts` imports `bun:test`: run it with `bun test`, not jest.
- `tsconfig.json` does not include `build` or `vite.config.ts`, so `bun run ts` does not
  typecheck them; only `test/build/plugins.test.ts` reaches the plugins through `tsc`.

## Related

- [Repository layout and tooling](repository.md) — folders, scripts, dist and release.
- [Testing](testing.md) — the browser test suite.
- [React surface](../react/react-surface.md) — `SurfaceJSX`, which owns the stylesheet.
