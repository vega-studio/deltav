---
title: Repository layout and tooling
summary: Folder layout, scripts, build, test, Storybook, type declarations, dist output and release flow of the deltav repository. Scripts and the release procedure are in the toolchain doc.
covers:
  - package.json
  - .npmignore
  - vite.config.ts
  - bunfig.toml
  - tsconfig.json
  - .storybook
  - ui/stories
  - test
  - archive/unit-test
  - dts
related:
  - overview/architecture.md
  - overview/testing.md
  - overview/toolchain.md
  - utilities/repo-util.md
  - utilities/library-util.md
status: complete
verified-at: 8f815f16
---

## Purpose

Where things live in the repository and how they are built, type-checked, tested, demoed and
released. Every tool is an explicit devDependency and every script calls a tool or a repo script
directly; the asset loaders, Storybook config, library build and scripts are described in
[Toolchain](toolchain.md).

## Key files

- `package.json` — package `deltav` (ESM, `"type": "module"`); `main` `./dist/ui/index.js`, `types` `./dist/types/ui/index.d.ts`; scripts `dev`, `storybook`, `storybook:build`, `build`, `test`, `ts`, `lint` (see [Toolchain](toolchain.md#scripts-and-release)); exact-pinned devDependencies; runtime deps are React 19 and its types.
- `tsconfig.json` — includes `ui`, `util`, `test`, `build`, `dts`; `lib` adds `dom.iterable`; strict TS, `experimentalDecorators` (needed by `@observable`) with `emitDecoratorMetadata` off (the Bun bundle fails with it on, see [Toolchain](toolchain.md)), `jsx: react`, `typeRoots` includes `./dts`.
- `vite.config.ts` — Vite config Storybook loads: `deltavVitePlugins()` from `build/plugins/vite.ts` and the `VITE_RELEASE_VERSION` define; see [Toolchain](toolchain.md).
- `bunfig.toml` — `[install.lockfile] save = false`; `[test]` `root = "test"` and `preload` `test/harness/preload.ts`; `[serve.static] plugins` for the test fixture server; see [Testing](testing.md).
- `eslint.config.mjs` — flat ESLint config (TS, prettier, simple-import-sort); run by `bun run lint`.
- `.storybook/main.mts` — Storybook (react-vite) config: stories, addons, static dirs, resolved from its own directory; see [Toolchain](toolchain.md).
- `.storybook/preview.tsx`, `.storybook/manager.mts`, `.storybook/theme.mts`, `.storybook/preview-head.html` — autodocs tag, theme, RedHatDisplay `@font-face` declarations.
- `dts/asset.d.ts` — module declarations for `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.svg`, `*.ttf`, `*.woff`, `*.woff2` and `*.vs`/`*.fs` (shader sources import as `string`), matching the loaders in `build/plugins/loaders.ts`.
- `.npmignore` — keeps sources, `build` and `bunfig.toml` out of the npm package; force-keeps `dist/ui` and `dist/types`.
- `build/build.ts` — the library build into `dist`; see [Toolchain](toolchain.md#library-build).
- `build/plugins` — the asset loaders (shaders, inline fonts/images, CSS injection) with Bun and Vite adapters; see [Toolchain](toolchain.md).
- `RELEASE_NOTES.md` — changelog, newest version first.

## How it works

### Folder layout

| Path | Contents |
|---|---|
| `ui/src` | The library. Entry `ui/src/index.ts`; area folders described in [Architecture](architecture.md) |
| `ui/index.ts` | Package entry: re-exports `ui/components/index.ts` (NOOP placeholder from the template) and `ui/src/index.ts` |
| `ui/stories` | Storybook demos (`components/`), story data (`data/`), static fonts (`assets/fonts`) |
| `ui/assets` | Storybook static dir (only a README) |
| `test` | Browser test suite: `test/harness` (runner-side harness, preload, fixture server, probes, leak detector and `mountCycle`), `test/fixtures` (React fixture pages) and one folder per test area (`test/teardown`, `test/stress`, …); see [Testing](testing.md) |
| `archive/unit-test` | The old node-only jest tests, kept for reference; not compiled, not run (outside `[test] root`) |
| `util` | Repo-level generic helpers, not part of the library API — see [Repository utilities](../utilities/repo-util.md) |
| `dts` | Ambient type declarations |
| `assets` | README splash image only; not used by code |
| `dist` | Committed build output (see below) |
| `docs` | These docs; `bun docs/check-docs.ts` validates them |

`ui/src/util` is the library's own utility folder, exported publicly (see
[Library utilities](../utilities/library-util.md)). The root `util` folder is separate, but the
library does import from it: every JSX component in `ui/src/base-surfaces/react-surface` uses
`util/hooks/use-life-cycle.ts`, `ui/src/base-surfaces/react-surface/scene/view-jsx.tsx` uses
`util/types.ts`, and `ui/src/util/mouse.ts` uses `util/normalize-wheel`. Those files are therefore
part of the build; the stories also use `util/hooks`.

### Scripts

The scripts table, the pinned devDependencies and the release procedure are in
[Toolchain](toolchain.md#scripts-and-release). Invoke scripts as `bun run <script>`;
`bun run test test/<area>/<file>.test.ts` runs one file.

### Shaders and assets at build time

Layer shaders live next to their layer as `.vs`/`.fs` files and are imported as strings
(`import CircleLayerVS from "./circle-layer.vs"`); fonts and images import as base64 data URLs and
the stylesheet as plain `.css`. The loaders live in `build/plugins` — see
[Toolchain](toolchain.md); `dts/asset.d.ts` gives these imports their types.

### Tests

`test/` is a browser suite run by `bun test`: on first use it starts a `Bun.serve` fixture server
over `test/fixtures/index.html`, and each test file drives headless Chromium (`playwright-core`, SwiftShader
WebGL2) that mounts React fixtures through `SurfaceJSX` and checks rendered pixels against
analytically computed expectations. Everything about it — run sequence, determinism, methodology,
fixtures — is in [Testing](testing.md). `playwright-core` (pinned) is a direct `devDependency`
for it.

The previous node-only tests (`vector`, `matrix`, `quaternion`, `transform`, `projection-3d`,
`absolute-bounds`, `gl/attribute`) and their `requestAnimationFrame` polyfill
`archive/unit-test/jest-setup.ts` are archived in `archive/unit-test`: not in `tsconfig.json`
`include`, outside `bunfig.toml` `[test] root`.

### Storybook

How Storybook is configured and run is in [Toolchain](toolchain.md). Stories are
`**/*.mdx`, `**/*.stories.*` and `**/*.bugs.*` under `ui`; static dirs are `ui/assets` and
`ui/stories/assets`. Story titles are grouped under `Deltav/`:

| File(s) in `ui/stories/components` | Title |
|---|---|
| `2d/*.stories.tsx` (arc, circle, edge, image, label, rectangle) | `Deltav/2D/<Layer>` |
| `base-controllers/*.stories.tsx` | `Deltav/EventHandling/BaseControllers` |
| `instances.stories.tsx`, `interactions.stories.tsx` | `Deltav/Instances`, `Deltav/Interactions` |
| `layer-stories/rebuild-layer.stories.tsx` | `Deltav/Layers/Uses` |
| `lighting.stories.tsx`, `multi-render-target.stories.tsx`, `float-textures.stories.tsx`, `noise.stories.tsx` | `Deltav/Lighting`, `Deltav/MultiRenderTarget`, `Deltav/FloatTexture`, `Deltav/Noise` |
| `one-liners.stories.tsx` | `Deltav/One Liners` |
| `draw-tool/draw-tool.stories.tsx`, `interactive-demo/interactive-demo.stories.tsx` | `Deltav/DrawTool`, `Deltav/InteractiveDemo` |

`ui/stories/components/layers` holds custom example layers used by stories (`cube`,
`cube-lighting`, `simple-mesh`, `surface-tile`, `vertex-packing-circle`) and
`ui/stories/components/signal-processing` holds helpers (FIR, gaussian blur, perlin noise). They
are worked examples of writing a layer outside the library.

### Build output and release

`dist` is committed and refreshed by release commits ("Release x.y.z"). It is built by
`bun build/build.ts` (see [Toolchain](toolchain.md#library-build)): `dist/ui/index.js` (+ map) is
the bundled library, `dist/types` the declarations (`dist/types/ui`, `dist/types/util`; the
committed tree still has a `dist/types/unit-test` from the last devops release), `dist/stories` a
copy of the stories, `dist/package.json` and `dist/components/package.json` minimal manifests.
`.npmignore` drops sources (`ui`, `dts`, `unit-test`, configs) from the npm package and force-keeps `dist/ui` and `dist/types`. A release bumps `package.json` `version` and adds a
section to `RELEASE_NOTES.md` (`## x.y.z` with `[ADDED]`/`[FIXED]` entries); the full manual
procedure is in [Toolchain](toolchain.md#scripts-and-release).

## Extension points

- New demo: add `ui/stories/components/<area>/<name>.stories.tsx` with a default export
  `{ title: "Deltav/<Group>/<Name>" }`; it is picked up by the `**/*.stories.*` glob.
- New test: add a fixture under `test/fixtures/<area>/` and a `test/<area>/<name>.test.ts`; see
  [Testing](testing.md).
- New asset import type: add a `declare module` to `dts/asset.d.ts`.

## Gotchas

- Lockfiles are never committed: `bunfig.toml` sets `[install.lockfile] save = false`, `.npmrc`
  sets `package-lock=false`, `.gitignore` ignores `yarn.lock`, and the README says so.
- `bun run ts` does not lint; run `bun run lint` separately when lint matters.
- Do not import `ui/src` from a test file: module load touches `window` and `document`
  (see [Architecture](architecture.md) gotchas) and tests run in Bun, not a browser; only the
  fixtures in `test/fixtures`, bundled by the fixture server, import it.
- The root `util` folder is pulled into the library build through the React surface imports;
  moving or renaming `util/hooks/use-life-cycle.ts` breaks `ui/src/base-surfaces`.
- `dist` is tracked: do not commit local build output outside a release.

## Related

- [Architecture](architecture.md) — what the folders under `ui/src` do.
- [Repository utilities](../utilities/repo-util.md) — the root `util` helpers.
- [Library utilities](../utilities/library-util.md) — `ui/src/util`.
- [Testing](testing.md) — the browser test suite and its methodology.
