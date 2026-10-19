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
verified-at: 8f815f16
---

## Purpose

The tooling that turns the repository's sources into something runnable: the loaders that make
shader, font, image and stylesheet imports work, the Storybook setup that serves the demos, the
Bun library build, the Bun test runner, the `package.json` scripts and the release procedure.
There is no `devops` dependency: the asset handling it once supplied lives in `build/plugins`,
written once and adapted to both Bun and Vite, and every tool is an explicit devDependency.

## Key files

- `build/plugins/loaders.ts` — pure module generators: `shaderModule`, `inlineAssetModule`, `cssInjectModule`, `isProjectFile`, `SHADER_EXTENSIONS`, `INLINE_ASSET_MIME`.
- `build/plugins/vite.ts` — `deltavVitePlugins()`: shader loader, inline-asset loader and `@vitejs/plugin-react`.
- `build/plugins/bun.ts` — `deltavBunPlugin(options)`: the same loaders as a `BunPlugin`, plus optional CSS injection.
- `build/plugins/index.ts` — re-exports the three modules.
- `vite.config.ts` — Vite config Storybook loads: `deltavVitePlugins()`, `define` of `import.meta.env.VITE_RELEASE_VERSION` from `package.json`, `build.cssCodeSplit: false`.
- `.storybook/main.mts` — Storybook config: stories, static dirs, addons, framework, all paths resolved from the config file's own directory.
- `.storybook/preview.tsx`, `.storybook/manager.mts`, `.storybook/theme.mts`, `.storybook/preview-head.html` — preview tags, manager theme, font-face declarations.
- `bunfig.toml` — Bun settings: `[install.lockfile] save = false`, `[test]` and `[serve.static] plugins`.
- `package.json` — the scripts and the exact-pinned devDependencies (see Scripts and release).
- `build/build.ts` — the library build: `Bun.build` bundle, declarations, stories copy and dist manifests.
- `test/build/build.test.ts` — `bun:test` test of the library build's output.
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

Storybook 8.6 with `@storybook/react-vite`, run straight from the repo: `bun run dev` (=
`storybook dev -p 6006 --config-dir .storybook --no-version-updates`) and `bun run
storybook:build` (= `storybook build --config-dir .storybook -o storybook-static`). No environment variable is
needed: `.storybook/main.mts` resolves the stories (`**/*.mdx`, `**/*.stories.*`, `**/*.bugs.*`
under `ui`) and static dirs (`ui/assets`, `ui/stories/assets`) from its own directory. Addons are
`@storybook/addon-links`, `@storybook/addon-essentials` and `@storybook/addon-a11y`. Storybook's
Vite builder picks up the root `vite.config.ts`, so stories get the plugins above and
`import.meta.env.VITE_RELEASE_VERSION` (read by `SurfaceJSX`). There is no `babel` hook: the
React plugin carries the decorator parser options, and there is no `.babelrc.json`.

### Library build

`bun build/build.ts [--outdir <dir>]` (default `dist`; a bare `--` is ignored) reproduces the
devops release build and exits non-zero on any failure, printing Bun's build logs:

1. Reads `package.json` (name, version, `dependencies`, `peerDependencies`).
2. Removes and recreates `<outdir>/ui`, `types`, `stories` and `components`; nothing else in
   `<outdir>` is touched.
3. `Bun.build` of `ui/index.ts` into `<outdir>/ui` with entry name `index.js`, `format: "esm"`,
   `target: "browser"`, `minify: true`, `sourcemap: "linked"`; external = every dependency and
   peerDependency name and its subpaths (`react`, `react/jsx-runtime`, …); `define`
   `import.meta.env.VITE_RELEASE_VERSION` = the package version and `process.env.NODE_ENV` =
   `"production"`; plugin `deltavBunPlugin({ css: "inject" })`, so shaders, fonts, images and
   `surface-jsx.css` end up inside `index.js`. Any output besides `index.js` and `index.js.map`
   fails the build.
4. Declarations: `node_modules/.bin/tsc --emitDeclarationOnly --declaration --outDir
   <outdir>/types` with a temporary tsconfig that extends `tsconfig.json` and includes only `ui`,
   `util` and `dts` (so type errors elsewhere, e.g. in `test/`, cannot block a build); every folder
   of `types` except `ui` and `util` is then deleted. When `node_modules` is a symlink (a worktree
   sharing another checkout's install) `--preserveSymlinks` is added, otherwise tsc fails with
   TS2742.
5. Copies `ui/stories` to `<outdir>/stories` and writes `<outdir>/package.json` and
   `<outdir>/components/package.json` (2-space JSON): `name`, `"private": true`,
   `"type": "module"`, `main` `./ui/index.js` (`../ui/index.js` in `components`), `types`
   `./types/ui/index.d.ts` (`../types/…`), and empty `dependencies`, `repository`, `scripts`,
   `devDependencies` — the shape devops wrote.
6. Prints the files and sizes.

`tsconfig.json` has `"emitDecoratorMetadata": false`: with it on, Bun emits runtime metadata
references to type-only imports (`Vec3`, `Quaternion`, `Mat4x4` in
`ui/src/3d/scene-graph/instance-3d.ts`) and the bundle fails with "No matching export". No code
reads decorator metadata and esbuild/Vite never emitted it; `experimentalDecorators` stays on.

Bun's minifier gives a smaller `index.js` than the Vite build (≈577 KB vs 954 KB); parity is the
layout and the public exports. `test/build/build.test.ts` builds into a temporary folder and checks
the layout, both manifests, that shaders and the stylesheet are inlined and `react` stays
external, that the exports equal the value exports of `ui/index.ts` (read with the TypeScript
compiler API) and that every export of the committed `dist/ui/index.js` is still there (except
`Surface`, type-only since DELTAV-49). The committed `dist` is refreshed only by release commits.

### Tests

`bun run test` is `bun test --timeout 60000` (bun 1.4 ignores a `timeout` key in `bunfig.toml`).
`bunfig.toml` `[test]` sets `root = "test"`, so `archive/unit-test` never runs, and `preload =
["./test/harness/preload.ts"]`, which syncs the generated fixture list and stops the fixture
server after the last file. Test files import from `bun:test`; `bun run test <file> …` runs the
named files. The browser fixture page is served by `Bun.serve` with an HTML import of
`test/fixtures/index.html`; `bunfig.toml` `[serve.static] plugins` loads
`test/harness/serve-plugin.ts`, which wraps `deltavBunPlugin()`. No Vite is involved in tests.
See [Testing](testing.md).

### Scripts and release

Every script calls a tool from `node_modules/.bin` or a repo script directly; run them as
`bun run <script>`. Nothing depends on `devops`.

| Script | Command |
|---|---|
| `dev`, `storybook` | `storybook dev -p 6006 --config-dir .storybook --no-version-updates` |
| `storybook:build` | `storybook build --config-dir .storybook -o storybook-static` |
| `build` | `bun build/build.ts` (accepts `--outdir <dir>`) |
| `test` | `bun test --timeout 60000` (extra arguments name test files) |
| `ts` | `tsc --noEmit -p tsconfig.json` |
| `lint` | `eslint ui util test build` with `eslint.config.mjs`; existing findings are not fixed, so it exits non-zero today |

devDependencies are pinned to exact versions: TypeScript, Vite and `@vitejs/plugin-react`,
Storybook 8.6 and its addons, `@types/bun`, the ESLint/Prettier set `eslint.config.mjs` imports,
`playwright-core` (tests), `class-variance-authority` (`util/cva.ts`) and `debug`. `bun install`
fetches no git dependency.

Release is a manual procedure:

1. Bump `version` in `package.json`.
2. Add a `## x.y.z` section to `RELEASE_NOTES.md` (`[ADDED]`/`[FIXED]` entries).
3. `bun run build` (refreshes `dist`).
4. Commit everything, `dist` included, as `Release x.y.z`, and tag it `x.y.z`.
5. Publish with `npm publish` (or `bun publish`).

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
- `tsconfig.json` includes `build`, so `bun run ts` typechecks the plugins and the build script;
  `vite.config.ts` is not included.
- `tsconfig.json` `lib` lists `dom.iterable` (e.g. `document.fonts.add` in
  `ui/src/resources/text/load-fonts.ts` needs it); devops used to supply it indirectly through
  `@types/jsdom`.

## Related

- [Repository layout and tooling](repository.md) — folders, scripts, dist and release.
- [Testing](testing.md) — the browser test suite.
- [React surface](../react/react-surface.md) — `SurfaceJSX`, which owns the stylesheet.
