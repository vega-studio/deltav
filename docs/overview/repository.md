---
title: Repository layout and tooling
summary: Folder layout, scripts, build, test, Storybook, type declarations, dist output and release flow of the deltav repository, and which config files are template leftovers.
covers:
  - package.json
  - build.conf.ts
  - vite.config.ts
  - jest.config.js
  - tsconfig.json
  - .storybook
  - ui/stories
  - unit-test
  - dts
related:
  - overview/architecture.md
  - utilities/repo-util.md
  - utilities/library-util.md
status: complete
verified-at: 62044439
---

## Purpose

Where things live in the repository and how they are built, type-checked, tested, demoed and
released. Almost all tooling is delegated to the `devops` package (a Vega Studio CLI installed from
git) — except typecheck and tests, which call `tsc` and `jest` directly — so the configs in this repo are thin; several are generic template files that reference
folders this repo does not have.

## Key files

- `package.json` — package `deltav` (ESM, `"type": "module"`); `main` `./dist/ui/index.js`, `types` `./dist/types/ui/index.d.ts`; every script is `devops <cmd>` except `ts` (`tsc`) and `test` (`jest`); runtime deps are React 19 and its types; `shader.ext` lists `fs`/`vs`.
- `tsconfig.json` — strict TS, `experimentalDecorators` + `emitDecoratorMetadata` (needed by `@observable`), `jsx: react`, `typeRoots` includes `./dts`.
- `vite.config.ts` — Vite config made only of `useDevopsPlugins()` from `node_modules/devops/shim`.
- `jest.config.js` — ts-jest ESM preset, `testEnvironment: node`, `setupFiles` `unit-test/jest-setup.ts`, matches `*.test.ts` under `unit-test`, `ui` and others.
- `build.conf.ts` — `BUILD_TARGETS = ["prod"]` for the devops build.
- `.babelrc.json` — Babel config Storybook loads (preset-env Chrome 100, TS, React, legacy decorators).
- `eslint.config.mjs` — flat ESLint config (TS, prettier, simple-import-sort); no script runs it any more (`bun run ts` is `tsc` only).
- `.storybook/main.mts` — Storybook (react-vite) config: stories, addons, static dirs.
- `.storybook/preview.tsx`, `.storybook/manager.mts`, `.storybook/theme.mts`, `.storybook/preview-head.html` — autodocs tag, theme, RedHatDisplay `@font-face` declarations.
- `dts/asset.d.ts` — module declarations for `*.png`, `*.svg`, `*.ttf`, `*.woff2` and `*.vs`/`*.fs` (shader sources import as `string`).
- `RELEASE_NOTES.md` — changelog, newest version first.

## How it works

### Folder layout

| Path | Contents |
|---|---|
| `ui/src` | The library. Entry `ui/src/index.ts`; area folders described in [Architecture](architecture.md) |
| `ui/index.ts` | Package entry: re-exports `ui/components/index.ts` (NOOP placeholder from the template) and `ui/src/index.ts` |
| `ui/stories` | Storybook demos (`components/`), story data (`data/`), static fonts (`assets/fonts`) |
| `ui/assets` | Storybook static dir (only a README) |
| `unit-test` | Jest tests |
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

Scripts run `devops` from `node_modules`, except `ts` and `test`, which run `tsc` and `jest` from
`node_modules/.bin`; invoke them as `bun run <script>`.

| Script | What it does |
|---|---|
| `dev` | Development server for the demos; the README points to http://localhost:6006 |
| `storybook` | Sets `PROJECT_ROOT`, then `storybook dev -p ${PORT:-6006}` with `.storybook` as config dir (`storybook build` variant outputs `storybook-static`) |
| `ts` | `tsc --noEmit -p tsconfig.json`; exits with tsc's status, no lint |
| `test` | `jest --config jest.config.js`; exits with jest's status. Extra arguments go to jest, so `bun run test unit-test/<file>.test.ts` runs one file |
| `release`, `package` | devops release/packaging (produces `dist`) |
| `clean`, `component`, `init`, `template`, `url`, `pr` | Generic devops project commands |

`devops` is a git dependency (`git+ssh://github.com/vega-studio/node-devops-public.git`, with
`fallbackDependencies`); without access to it, `bun install` cannot provide the devops scripts.
`devops ts` and `devops test` are not used: without a subcommand they print help and exit 1, and
`devops ts run` fails with TS5042 yet exits 0.

### Shaders and assets at build time

Layer shaders live next to their layer as `.vs`/`.fs` files and are imported as strings
(`import CircleLayerVS from "./circle-layer.vs"`). The devops Vite plugins provide the loader
(`vite-devops-shader-compression-plugin` for `.vs`/`.fs` outside `node_modules`) and inline
fonts/images as base64 data URLs; `dts/asset.d.ts` gives these imports their types.

### Tests

`unit-test` holds Jest tests for pure modules only: `vector.test.ts`, `matrix.test.ts`,
`quaternion.test.ts` (math), `transform.test.ts` (3D `Transform`), `projection-3d.test.ts`
(`Projection3D`), `absolute-bounds.test.ts` (`getAbsolutePositionBounds`) and
`gl/attribute.test.ts` (`Attribute.repeatInstances`). They import the module files directly with
`@jest/globals` and `assert`. Nothing that needs a WebGL context (surface, layers, shaders,
buffers) is unit-tested; those are exercised visually through Storybook.
`unit-test/jest-setup.ts` (jest `setupFiles`) polyfills `requestAnimationFrame` and
`cancelAnimationFrame` with unref'd ~16 ms timers, because `ui/src/util/frame.ts` starts its
command loop when the module loads and any test importing it (through `Transform` or the camera)
would otherwise fail to load.

### Storybook

`.storybook/main.mts` loads `**/*.mdx`, `**/*.stories.*` and `**/*.bugs.*` under `ui` (resolved
from `PROJECT_ROOT`, set by devops), plus stories from packages named in `NODE_MODULES_STORIES`.
Static dirs are `ui/assets` and `ui/stories/assets`. Story titles are grouped under `Deltav/`:

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

`dist` is committed and refreshed by release commits ("Release x.y.z"): `dist/ui/index.js` (+ map)
is the bundled library, `dist/types` the declarations (`dist/types/ui`, `dist/types/util`,
`dist/types/unit-test`), `dist/stories` a copy of the stories, `dist/package.json` a minimal
manifest. `.npmignore` drops sources (`ui`, `dts`, `unit-test`, configs) from the npm package and
force-keeps `dist/ui` and `dist/types`. A release bumps `package.json` `version` and adds a
section to `RELEASE_NOTES.md` (`## x.y.z` with `[ADDED]`/`[FIXED]` entries).

## Extension points

- New demo: add `ui/stories/components/<area>/<name>.stories.tsx` with a default export
  `{ title: "Deltav/<Group>/<Name>" }`; it is picked up by the `**/*.stories.*` glob.
- New unit test: add `unit-test/<name>.test.ts`, import the module file directly (not
  `ui/src/index.ts`), use `describe`/`it` from `@jest/globals`.
- New asset import type: add a `declare module` to `dts/asset.d.ts`.

## Gotchas

- Lockfiles are never committed: `bunfig.toml` sets `[install.lockfile] save = false`, `.npmrc`
  sets `package-lock=false`, `.gitignore` ignores `yarn.lock`, and the README says so.
- Template leftovers: `tsconfig.json` paths/includes and `jest.config.js` `moduleNameMapper`
  mention `app`, `app/config`, `test`, `utils`, `bin`, `shim` — none exist here. `build.conf.ts`
  comments about `app/config/env.*.ts` do not apply. `dts/express.d.ts` and `dts/make-cert.d.ts`
  are server-template declarations unused by the library.
- `bun run ts` does not lint; run `node_modules/.bin/eslint` separately when lint matters.
- Do not import `ui/src/index.ts` from a Jest test: module load touches `window` and `document`
  (see [Architecture](architecture.md) gotchas) and the test environment is `node`.
- The root `util` folder is pulled into the library build through the React surface imports;
  moving or renaming `util/hooks/use-life-cycle.ts` breaks `ui/src/base-surfaces`.
- `dist` is tracked: do not commit local build output outside a release.

## Related

- [Architecture](architecture.md) — what the folders under `ui/src` do.
- [Repository utilities](../utilities/repo-util.md) — the root `util` helpers.
- [Library utilities](../utilities/library-util.md) — `ui/src/util`.
