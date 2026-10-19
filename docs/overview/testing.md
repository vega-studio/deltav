---
title: Testing
summary: How the browser test suite runs (jest, Vite, headless Chromium on SwiftShader), the analytic pixel-probe methodology, fixtures and the defect policy.
covers:
  - test/harness
  - test/fixtures
  - jest.config.js
  - archive/unit-test
related:
  - overview/repository.md
  - 2d/view-and-camera.md
  - react/react-surface.md
status: complete
verified-at: 0d4c53b4
---

## Purpose

`bun run test` runs a suite that renders real deltav scenes and checks their pixels. Tests run in
jest under node, but deltav cannot load in node (its modules touch `window`, import `.vs`/`.fs`
shader files and a `.scss` file, and read `import.meta.env`). So each test drives a headless
Chromium page that mounts a React fixture through `SurfaceJSX`, renders with deterministic
software WebGL2, and reads the canvas back. The old node-only math tests are archived in
`archive/unit-test/` and are neither compiled nor run.

## Key files

- `jest.config.js` — ts-jest ESM preset, `testEnvironment: node`, `testRegex` `test/.*\.test\.ts$`, `globalSetup`/`globalTeardown`, `maxWorkers: 2`, `testTimeout: 60000`.
- `test/harness/global-setup.mjs` — starts the test-only Vite dev server on a free port; sets `DELTAV_TEST_URL` and writes it to the file named by `DELTAV_TEST_URL_FILE`.
- `test/harness/global-teardown.mjs` — closes that server and removes the URL file.
- `test/harness/vite.config.ts` — test-only Vite config: `root` `test/fixtures`, tsconfig `paths` aliases, shader sources as string modules, `.scss` as an empty module, `server.fs.allow` the repo root. No devops plugins.
- `test/harness/browser.ts` — `launchBrowser`, `resolveChromium`, `openFixturePage`, `useFixturePage`, `DETERMINISTIC_GL_ARGS`, `VIEWPORT`.
- `test/harness/host-api.ts` — types shared by node and page: `DeltavHostAPI` (`window.__deltav`), `RGBA255`, `PixelRect`, `PixelBlock`.
- `test/harness/probe.ts` — `probe`, `readPixels`, `expectColor`, `expectRegion`, `expectOutside`, `rgba01To255`, `premultiply`, `worldToPixel2D`, `worldRectToPixel2D`.
- `test/harness/probe.test.ts` — methodology controls (see below).
- `test/fixtures/index.html` — host page: fixed `#root` at the top-left, no margins; loads `host.tsx`.
- `test/fixtures/host.tsx` — eagerly imports every `**/*.fixture.tsx` and installs `window.__deltav`.
- `test/fixtures/fixture-registry.ts` — `registerFixture`, `getFixture`, `fixtureNames`, `HostContext` (`ready`/`fail`).
- `test/fixtures/test-surface.tsx` — `TestSurface`: the deterministic `SurfaceJSX` wrapper every deltav fixture uses.
- `test/fixtures/control/raw-webgl.fixture.tsx` — `control/raw-webgl`: scissor-cleared rect with plain WebGL2, no deltav.
- `test/fixtures/control/rect.fixture.tsx` — `control/rect`: one `RectangleLayer` instance in a `View2D`.
- `archive/unit-test/README.md` — why the old tests are kept and that they are not run.

## How it works

### Run sequence

1. jest loads `jest.config.js`; `global-setup.mjs` calls Vite `createServer` with
   `test/harness/vite.config.ts` and listens on `127.0.0.1`, port 0. The setup is plain `.mjs`
   because ts-jest compiles a TypeScript global setup to CommonJS, where Vite's ESM API and the
   config's `import.meta.url` are unavailable. Test files themselves are TypeScript compiled by
   ts-jest.
2. Each test file calls `useFixturePage()`, which registers `beforeAll`/`afterAll`: one
   `launchBrowser()` and one `openFixturePage()` per file, shared by its tests.
3. `openFixturePage` opens a context with viewport 800×600 and `deviceScaleFactor: 1`, loads
   `DELTAV_TEST_URL`, waits for `window.__deltav`, and pushes every `console.error` and
   `pageerror` into `page.errors`.
4. A test calls the host API through `page.evaluate`, e.g.
   `page.evaluate((p) => window.__deltav!.mount("control/rect", p), props)`, then probes.
5. Vite compiles `ui/src` and the fixtures on demand on the first page load; later files reuse
   the cache.

### Chromium resolution

`resolveChromium()` tries, in order: `DELTAV_TEST_CHROMIUM`; `chromium.executablePath()` of
`playwright-core` (pinned `1.57.0`), if that file exists; the newest
`~/.cache/ms-playwright/chromium_headless_shell-*/chrome-*/{headless_shell,chrome-headless-shell}`
(or under `PLAYWRIGHT_BROWSERS_PATH`). When none exists it throws with the hint to run
`bunx playwright-core install chromium-headless-shell`.

### Host API (`window.__deltav`)

| Method | Behaviour |
|---|---|
| `fixtures()` | Registered fixture names |
| `mount(name, props)` | `createRoot(#root).render(<Fixture {...props}/>)` inside `HostContext`; resolves after the fixture calls `ready()` and two more frames. Rejects if one is already mounted |
| `update(props)` | Re-renders with new props, waits two frames |
| `unmount()` | `root.unmount()`, waits two frames |
| `waitFrames(n)` | `n` `requestAnimationFrame` ticks |
| `readPixels(x, y, w, h)` | `drawImage` of the first `canvas` under `#root` into a 2D canvas, then `getImageData`; RGBA bytes, origin top-left, canvas pixels |
| `canvasSize()` | Width and height of that canvas |

Props must be JSON-serialisable (they cross `page.evaluate`).

### Determinism rules

- Chromium runs with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader
  --ignore-gpu-blocklist` (`DETERMINISTIC_GL_ARGS`): WebGL2 is rasterised on the CPU, so results
  do not depend on the machine's GPU.
- Viewport 800×600, `deviceScaleFactor: 1`.
- Every deltav fixture renders inside `TestSurface`: fixed `width`/`height` container at the
  page's top-left, `pixelRatio={1}`, `options={{ alpha: true, preserveDrawingBuffer: true,
  antialias: false }}`, `handlesWheelEvents={false}`. `preserveDrawingBuffer` keeps the last frame
  readable between frames.
- Fixtures set every size explicitly; nothing depends on page layout. The library's `.scss` is
  not loaded, so `TestSurface` sizes the `SurfaceJSX` container itself.

### Methodology checklist

Follow this for every assertion:

1. **Compute the expectation first** from the scene's geometry, camera and projection. For the
   default `View2D` with an identity `Camera2D`, a world point is a canvas pixel
   (`worldToPixel2D`, which also applies `offset`, `scale`, the view origin and the pixel ratio;
   see [2D view and camera](../2d/view-and-camera.md)). Colours come from the fixture's palette
   via `rgba01To255`.
2. **Use a distinct palette**: fixture colours differ from each other and from the clear colour
   by at least 64/255 on some channel. Prefer channel values that are multiples of 51/255 so the
   byte is exact.
3. **Probe inside, inset 2 px**: `expectRegion(page, rect, colour)` samples a 5×5 grid inside the
   rect shrunk by `inset` (default 2). Move a probe inward if rasterisation differs; never raise
   the tolerance.
4. **Tolerance 3**: `expectColor` allows ±3/255 per channel (`DEFAULT_TOLERANCE`) and its error
   names the pixel, the expected and actual colours and the per-channel delta.
5. **Add a negative probe**: `expectOutside(page, rect, clear)` expects the clear colour `margin`
   (default 2) pixels past each edge, at both ends and the middle of every edge; off-canvas
   points are skipped, and it fails if none is on the canvas.
6. **Never copy a value from a run.** A number that came from looking at the output proves
   nothing.
7. **See it fail once**: while writing a test, run it once against a deliberately wrong
   expectation and watch it fail, then restore the computed one.
8. After each test, unmount and assert `page.errors` is empty.

### Methodology controls

`test/harness/probe.test.ts` proves the probes themselves:

- **Orientation control** (`control/raw-webgl`): plain WebGL2 clears the canvas, then clears a
  scissor rect given top-left and converted to GL's bottom-left box. The probes must read exactly
  that rect (tolerance 0, inset 0, exact corner pixels) and the clear colour at its vertical
  mirror, which proves the readback is top-left origin and unflipped.
- **deltav control** (`control/rect`): one top-left-anchored `RectangleInstance`; the expected
  pixels come from `worldRectToPixel2D`.
- **Wrong-expectation control**: `expectColor` with a wrong colour, and with a colour off by 4 on
  one channel, must throw; `expectRegion`/`expectOutside` must reject.

### Adding a fixture

1. Create `test/fixtures/<area>/<name>.fixture.tsx` (wave-4 areas keep their fixtures and helpers
   in their own folder).
2. Write a component taking JSON props; wrap a deltav scene in
   `<TestSurface width height clear>` and import deltav from the entry point `ui/src/index.ts` (written `index.js` in imports; it
   registers the shader modules). A fixture without deltav must call
   `React.useContext(HostContext).ready()` itself after drawing.
3. Call `registerFixture("<area>/<name>", Component)` at module level; names must be unique.
4. In `test/<area>/<name>.test.ts`, use `useFixturePage()`, `mount`, the probes, `unmount`.

### Defect policy

A teardown gap the plan already lists is fixed. Any other deltav defect a test finds is written as
`test.failing(...)` with a `// DEFECT: <one line>` comment and filed with
`tk.ts report file --about <ticket>`. It is never skipped or deleted, and its expectation is never
weakened to match the buggy output.

## Leak detection

Not yet in the harness: step-03 adds the leak detector and `mountCycle`.

## Extension points

- New fixture: see "Adding a fixture".
- Another binary: set `DELTAV_TEST_CHROMIUM`.
- New probe helper shared by all areas: `test/harness/probe.ts`; an area-only helper goes in that
  area's folder.

## Gotchas

- Never import `ui/src` from a node-side test file; only fixtures (bundled by Vite) import it.
- `bun run test <file>` still runs `globalSetup`, so a single file needs the Vite server too.
- `TestSurface` resolves `ready` only after `SurfaceJSX` built its pipeline and drew one frame;
  `mount` then waits two frames so the probed frame contains the scene.
- `readPixels` returns straight (un-premultiplied) alpha. deltav creates its context with
  `premultipliedAlpha: false` by default; use opaque colours unless a test is about alpha.
- `playwright-core` 1.57.0 expects `chromium_headless_shell-1200`; a different cached revision is
  picked up by the cache fallback.
- `maxWorkers` is 2: each worker launches its own Chromium.
- The archived tests' imports point at the old `unit-test/` location and do not resolve.

## Related

- [Repository layout and tooling](repository.md) — scripts, configs and folders.
- [2D view and camera](../2d/view-and-camera.md) — the coordinate convention `worldToPixel2D` follows.
- [React surface](../react/react-surface.md) — `SurfaceJSX` and the tags fixtures use.
