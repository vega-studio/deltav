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
verified-at: 38857046
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
- `test/harness/host-api.ts` — types shared by node and page: `DeltavHostAPI` (`window.__deltav`), `RGBA255`, `PixelRect`, `PixelBlock`; leak types `RESOURCE_KINDS`, `ResourceCounts`, `ResourceSnapshot`, `LeakEntry`, `LeakDetails`, `DeltavLeaksAPI` (`window.__deltavLeaks`).
- `test/harness/probe.ts` — `probe`, `readPixels`, `expectColor`, `expectRegion`, `expectOutside`, `rgba01To255`, `premultiply`, `worldToPixel2D`, `worldRectToPixel2D`.
- `test/harness/probe.test.ts` — methodology controls (see below).
- `test/harness/leaks-page.ts` — page-side leak instrument; installs `window.__deltavLeaks`.
- `test/harness/leaks.ts` — `snapshotResources`, `expectNoLeaks`, `diffResources`, `formatLeakReport`, `LEAK_SETTLE_FRAMES`.
- `test/harness/mount-cycle.ts` — `mountCycle`, the breakdown-and-rebuild cycle of every feature test.
- `test/harness/leaks.test.ts` — leak detector controls.
- `test/fixtures/index.html` — host page: fixed `#root` at the top-left, no margins; loads `leaks-entry.ts`, then `host.tsx`.
- `test/fixtures/leaks-entry.ts` — imports `leaks-page.ts` in its own module script, before any fixture loads deltav.
- `test/fixtures/host.tsx` — eagerly imports every `**/*.fixture.tsx` and installs `window.__deltav`.
- `test/fixtures/fixture-registry.ts` — `registerFixture`, `getFixture`, `fixtureNames`, `HostContext` (`ready`/`fail`).
- `test/fixtures/test-surface.tsx` — `TestSurface`: the deterministic `SurfaceJSX` wrapper every deltav fixture uses.
- `test/fixtures/control/raw-webgl.fixture.tsx` — `control/raw-webgl`: scissor-cleared rect with plain WebGL2, no deltav.
- `test/fixtures/control/rect.fixture.tsx` — `control/rect`: one `RectangleLayer` instance in a `View2D`.
- `test/fixtures/leak-control/*.fixture.tsx` — `leak-control/leaky-raw`, `clean-raw` (both from `raw-gl.tsx`), `leaky-listener`, `deltav-minimal`.
- `test/fixtures/teardown/*.fixture.tsx` — `teardown/view-layer`, `render-target`, `resources`, `early-unmount`, `resize-unmount`; shared `rect-scene.tsx` (`useRectProvider`, `useViewConfig`).
- `test/teardown/surface-teardown.test.ts` — the `SurfaceJSX` teardown suite (see Leak detection).
- `test/fixtures/interaction/*` — `interaction/rects`, `picking`, `resize`, `camera`, `events`; `handles.ts` types the in-page handles they register on `window` (`__dvInteractionRects`, …); `wheel-surface.tsx` is `TestSurface` with `handlesWheelEvents` on.
- `test/interaction/*.test.ts` — the interaction and instance lifecycle suite (see Interaction suite); `helpers.ts` (palette, `eventually`, rect probes), `rects-handle.ts` (`callRects`).
- `test/fixtures/resources/*` — `resources/texture-filter`, `atlas-images`, `fonts`, `circle-target`, `float-texture`, `mrt`, `line-blur`, `bloom`, `trail`, `noise`, `chain`; `common.tsx` (`rectsShader`, `rgbaTextureSettings`, in-page quadrant/solid canvases).
- `test/resources/*.test.ts` — the resources, render targets and post-processing suite (see Resources suite); `helpers.ts` (palette, `useResourcesPage`, `eventually`, `probeRect`).
- `test/fixtures/3d/*` — `3d/scene` (a `View3D` with one `CubeLayer`, `TriangleLayer` or flat-colour subclass; camera, scene-graph parents and instances as props), `3d/layer-2d-in-3d`; `scene-props.ts` (prop types), `camera.ts` (`useCamera`), `flat-layers.ts` (`FlatCubeLayer`, `FlatTriangleLayer`).
- `test/3d/*.test.ts` — the 3D suite (see 3D suite); `expect-math.ts` is its independent projection oracle, checked by the node-only `expect-math.test.ts`; `helpers.ts` (palette, `expectShape`, `expectTriangle`, `eventually`).
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
8. After each test, unmount and assert `page.errors` is empty — `mountCycle` does this and the
   leak check (see Leak detection).

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

### What is counted, and how

`test/harness/leaks-page.ts` runs in the page before deltav. `index.html` loads it through
`leaks-entry.ts` in a module script of its own, because Vite hoists `host.tsx`'s
`import.meta.glob` fixture imports above every import written in that file. It counts
(`RESOURCE_KINDS`):

| Kind | How |
|---|---|
| `buffers`, `textures`, `framebuffers`, `renderbuffers`, `programs`, `shaders`, `vertexArrays`, `queries`, `samplers`, `transformFeedbacks` | `HTMLCanvasElement.prototype.getContext` (and `OffscreenCanvas`'s) is wrapped; each new `webgl2`/`webgl` context is instrumented once (WeakSet). Its `create*`/`delete*` methods are replaced by own-property wrappers on the **real** context — never a Proxy (deltav checks `instanceof WebGL2RenderingContext`; native methods reject a Proxy `this`). Live objects sit in a `Set`-like map per kind per context, so deleting `null` or twice never goes negative |
| `contexts` | Contexts seen, minus those released by `WEBGL_lose_context.loseContext()` (`getExtension` is wrapped to see it) or a `webglcontextlost` event |
| `canvases` | `<canvas>` elements in the document (a canvas marked `data-deltav-host` is not counted; the host's readback canvas is never attached) |
| `listeners` | `addEventListener`/`removeEventListener` on `window` and `document`, keyed by target, type, listener and capture; `once` and `signal` removals are followed |
| `frameAnimationLoops`, `frameNextFrame`, `frameQueued` | `frameCommandStats()` of `ui/src/util/frame.ts` |

Losing a context does **not** clear its objects: every object must be deleted explicitly.

Each tracked object keeps a label (`buffer (context #3)`, `window:resize`) and a trimmed creation
stack. `window.__deltavLeaks.snapshot()` returns the counts plus `seq`, a creation cursor;
`details(since)` returns live entries created after it.

### Baseline rule

The baseline is a snapshot taken after the page loaded and before the fixture mounts. Load-time
resources are therefore in it: the probe context `ui/src/gl/webgl-stat.ts` opens at import,
Playwright's injected window listeners, the `frame.ts` loop deltav starts on import. React adds a
`document` `selectionchange` listener on the first `createRoot` and never removes it, so
`leaks-page.ts` creates and drops a throwaway root at load to put it in every baseline.

### Node side

- `snapshotResources(page)` — the current `ResourceSnapshot`.
- `expectNoLeaks(page, baseline, { allow?, frames? })` — re-snapshots for up to `frames` (default
  10, `LEAK_SETTLE_FRAMES`) frames until no kind exceeds the baseline, since deltav destroys some
  things asynchronously; then throws the report.
- `mountCycle(page, fixture, props, check, { cycles = 2, allow? })` — baseline, then per cycle:
  mount → `await check(page, cycle)` → unmount (also when `check` throws) → `expectNoLeaks`; finally
  throws if `page.errors` is not empty. Every feature test uses it (D6).

### Reading a leak report

```
Resources leaked since the baseline:
  buffers: +12
    - buffer (context #6)
      | at GLProxy.compileAttribute (…/ui/src/gl/gl-proxy.ts:136:23)
      | …
    … 9 more
  contexts: +1
    - webgl2 context #6
      | at GLProxy.getContext (…)
```

One block per leaked kind: the count over the baseline, then the label and creation stack of the
first three objects created since the baseline. Canvases and frame commands have counts only.

### Defect policy and `allow`

`allow: { kind: n }` tolerates `n` extra objects of a kind. It exists only for a documented,
reported defect (D7), and the call carries a `// DEFECT:` comment. A test whose whole cycle is
known to leak is written as `test.failing` with a `// DEFECT:` line instead, and the step that
fixes the defect turns it back into `test`.

### Controls

`test/harness/leaks.test.ts`: `leaky-raw` (a raw WebGL2 context, buffer and texture, never
released) must fail with `buffers`, `textures` and `contexts` and nothing else; `clean-raw` (the
same, deleted and context lost on unmount) must pass, also through `mountCycle`; `leaky-listener`
(a window listener never removed) must fail naming `window:deltav-leak-control`; `allow` must
tolerate exactly the kind it names. `deltav-minimal` (a `SurfaceJSX`, one `View2D`, one
`RectangleLayer`) must pass `mountCycle` strictly.
Disabling the `deleteBuffer` wrapper, the `createTexture` tracking, the window listener wrappers
or the context-release tracking each turns at least one control red.

### Teardown suite

`test/teardown/surface-teardown.test.ts` runs each `teardown/*` fixture through `mountCycle` with
`cycles: 3`, probing the drawn shape and the clear colour around it every cycle: (a) one `View2D`
and one `RectangleLayer`; (b) a `CircleLayer` circle drawn into a `ColorBufferJSX` colour and a
`DepthBufferJSX` depth renderbuffer, blitted to a `TextureJSX` and drawn to the screen with
`DrawJSX`; (c) a `TextureJSX`, an `AtlasJSX` image (a data URL, polled for up to 60 frames since
atlas loads are async) in an `ImageLayer`, and a `FontJSX` used by a `LabelLayer`; (d) a surface
replaced while it is still building, before its `ready` resolves; (e) a window `resize` dispatched
from a parent effect cleanup, so the unmount lands inside the resize debounce. Two `test.failing`
cases pin defects found on the way: `RectangleLayer` into a render target, and an
`HTMLCanvasElement` atlas source.

### Interaction suite

`test/interaction/` tests what changes after the first frame, each case through `mountCycle`. A
fixture that the test drives registers a handle on `window` on mount and deletes it on unmount;
the test calls it through `page.evaluate`, and drives the mouse with `page.mouse` (the container
sits at the page's top-left, so page coordinates are canvas pixels).

- `instances` — add, move, recolour and remove `RectangleInstance`s, 1,000 added then removed
  (every canvas pixel clear after), and the `buffers`/`textures`/`vertexArrays` counts of
  `snapshotResources` equal across repeated add/remove rounds of the same count.
- `easing` — `AutoEasingMethod.linear(duration, delay)` on `location`: the old position through
  the delay, the new one after it, and mid-way the edge at the linear interpolation of the frame
  read back (`easingWithRow` returns `frameMetrics.currentTime`, the easing state and a pixel row
  in one task).
- `rebuild` — toggling the layer's `picking` prop rebuilds it (`Layer.willUpdateProps`): pixels
  stay right and the program, shader, buffer, VAO, texture and framebuffer counts return to the
  same configuration's values; the leak instrument's `seq` proves new objects were made.
- `resize` — size props plus a window `resize`: canvas size, an identity-camera rect at fixed
  pixels, a rect in a camera fitted to the size at `worldRectToPixel2D(rect, { scale })`.
- `picking` — `PickType.SINGLE` (the only picking mode) on a `CircleLayer`, with a picking texture,
  a pick view and a `decodePicking` command as in `interactions.stories.tsx`: over/out/click/down/up
  carry the instance under the mouse, a clear point picks nothing, the top-most of two overlapping
  instances is picked.
- `camera-controller` — `BasicCamera2DControllerJSX`: a drag of Δ px moves the rect Δ px; a wheel
  scales by `1 − deltaY / 1000` (deltav's `normalizeWheel` negates `deltaY`) about the cursor, the
  world point under it fixed within 1 px.
- `event-handler` — `SimpleEventHandlerJSX` down/move/drag/up: `screen`, `target.position`
  (screen minus the viewport origin) and `screenToWorld` match the analytic values.

Two `test.failing` cases pin defects: `RectangleLayer` picking (its fragment shader fails to
compile in the picking-only pass) and a `ScaleMode.ALWAYS` rectangle under unequal x/y camera
scale.

### Resources suite

`test/resources/` covers resource tags, render targets and every post-process effect, each case
through `mountCycle`. Most fixtures produce their content with a `PostProcessJSX` pass running
`rectsShader` (solid rects tested against `gl_FragCoord` in top-left pixels), so the pixels an
effect reads are known exactly; image data is drawn on in-page canvases, never binary assets.

- `textures` — a 2×2 `TextureJSX` stretched by `DrawJSX`: nearest gives exactly one quadrant colour
  each side of a boundary, linear the bilinear mix at u = (x + 0.5) / width; `AtlasJSX` +
  `ImageLayer` images at 1:1 (data URLs), quadrants, several images, and one swapped while mounted.
- `fonts` — a `FontJSX` label inside the box `LabelInstance.onReady` reports (published on
  `window.__resourceFontBoxes`), its width checked against the page's own `measureText`.
- `render-targets` — circles into a `ColorBufferJSX` with an offset camera, blitted and drawn; a
  `DepthBufferJSX` resolving an overlap to the nearer circle (View2D depth: larger is nearer,
  `DEPTH_COMPONENT16` needs depths hundreds of units apart, near/far are -100/1e7) with a control
  without it; a `FloatTextureJSX` keeping values outside 0–1; one pass writing COLOR and GLOW.
- `post-processing` — box up/down-sample kernels and energy across a 1 px line, gaussian blur,
  bloom glow beyond a bright rect and none on a far dark one, trail decay along a moving circle,
  simplex noise equal across mounts, and a four-pass chain with its [1, 4, 6, 4, 1] / 16 edge.

Defects pinned as `test.failing`: both gaussian blur shaders (DELTAV-78), `SimplexNoiseJSX` with a
fixed `zOffset` (DELTAV-79), and the second of two fonts on a fresh page (DELTAV-80; that case
opens its own page because a page that rendered a font hides it).

### 3D suite

`test/3d/` tests `View3D`, projection, depth, culling, the scene graph and the 3D layers on a
200×200 canvas, each case through `mountCycle`. Expected pixels come from `expect-math.ts`, a
hand-written perspective (horizontal fov) and orthographic projection with a viewport transform
and a textbook look-at basis; it never imports `ui/src/math` or `Projection3D`. A cube is probed
inside its projected front face and the clear colour outside the bounding box of its 8 projected
corners; a triangle at its centroid, near each vertex and 3 px beyond each edge and vertex.
Cameras are aimed with `Camera.lookAt`.

- `projection` — a cube under perspective and orthographic cameras, the camera moved, the fov
  changed (offsets from the centre scale by tan ratio).
- `depth` — two overlapping cubes at different depths: the nearer colour in the overlap, in both
  instance orders.
- `layers` — built-in `CubeLayer`/`TriangleLayer`, the cube's half-extent `size`, the triangle's
  vertices; culling: none by default (both sides drawn), and a `CullSide` names the winding it
  culls (`CW` culls the clockwise, camera-facing triangle).
- `scene-graph` — parent translation and scale, a grandparent, moving the parent, re-parenting,
  detaching, removing the instance.
- `clipping` — shapes in front of near, beyond far and behind a perspective camera; orthographic
  near/far.
- `layer-2d-in-3d` — `createLayer2Din3D` rectangles on the XY and XZ planes.

The built-in 3D layers draw nothing (DELTAV-85), so every other case draws with
`flat-layers.ts`: subclasses that keep the layers' geometry and material, read the transform
through `o.matrix` and paint the instance colour. Defects pinned as `test.failing`: the built-in
layers (DELTAV-85), a layer's first instance parented before it is drawn (DELTAV-86),
orthographic near/far (DELTAV-87) and `Axis2D.XY` (DELTAV-88). Scene-graph cases otherwise
mount the child unparented and parent it once drawn.

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
