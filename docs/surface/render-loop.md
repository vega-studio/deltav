---
title: Render loop
summary: The per-frame pipeline: frame timing, change processing, buffer updates and draw order, and the constants that tune it.
covers:
  - ui/src/surface/surface.ts
  - ui/src/util/frame.ts
  - ui/src/constants.ts
related:
  - surface/surface.md
  - surface/layer.md
  - surface/views-and-scenes.md
  - buffers/instance-diffing.md
  - gl/renderer.md
  - instances/easing-and-animation.md
  - react/post-processing.md
status: complete
verified-at: d80bb72a
---

## Purpose

This doc describes what happens between "the application calls `Surface.draw`" and "pixels are
on the canvas": frame timing, camera broadcasts, per-layer change processing, per-view drawing,
resource dequeueing and end-of-frame resets. It also covers `ui/src/util/frame.ts`, the shared
`requestAnimationFrame` scheduler (`onFrame`, `nextFrame`, `onAnimationLoop`) that drives the
loop and much of the library's deferred work.

## Key files

- `ui/src/surface/surface.ts` — `Surface.draw`, `Surface.commit`, `Surface.drawSceneView`.
- `ui/src/util/frame.ts` — `onFrame`, `nextFrame`, `onAnimationLoop`, `stopAnimationLoop`,
  `stopAllFrameCommands`.
- `ui/src/constants.ts` — `uniformBufferInstanceBufferName` (`"instanceData"`),
  `activeAttributeName` (`"_active"`), `TO_RADIANS`, `TO_DEGREES`.
- `ui/src/surface/layer.ts` — `Layer.draw`, the per-layer update called by `commit`.
- `ui/src/surface/view.ts` — `View.shouldDrawView`, `ViewDrawMode`, `ClearFlags`.
- `ui/src/gl/webgl-renderer.ts` — `WebGLRenderer.render`, which draws a scene's models.
- `ui/src/base-surfaces/react-surface/surface-jsx.tsx` — the standard driver of `draw`.

## How it works

### Who calls draw

`Surface` has no loop of its own. `SurfaceJSX`, the only builder of a surface, starts one with
`onAnimationLoop(draw, frameRate ? 1000 / frameRate : undefined)` and calls
`surface.draw(time)` each tick (stopping after `renderFrameCount` frames if set, and skipping
frames while its `stop` prop is set).

### One frame: `Surface.draw(time?)`

1. **Timing** — `frameMetrics.currentTime` = `time`, or `Date.now() | 0` when omitted. On the first
   manual time, `previousTime` is synced to it. `currentFrame++`, `frameDuration = currentTime -
   previousTime`, `previousTime = currentTime`. `frameMetrics` (`FrameMetrics`) is what shaders
   and easing see as "now".
2. **`willRender`** broadcast to every event manager.
3. **Camera broadcast** — for each scene, `LayerScene.clearCaches()` (recomputes `renderViews`,
   which picks the current view of each view chain) and `view.props.camera.broadcast(view.id)`
   for each render view.
4. **`commit(onViewReady)`** — scenes sorted by `order`; for each scene, views and layers sorted
   by `order`; for each view:
   1. `view.shouldDrawView(frameMetrics)` — false skips the view entirely (no layer updates).
   2. `view.willUseView()` (only if the scene has layers): applies `screenScale`, rebuilds the
      render target if a buffer was destroyed.
   3. Viewport: `getAbsolutePositionBounds(view.props.viewport, targetBounds, pixelRatio)` where
      `targetBounds` is the canvas render size, or the size of the view's render target; then
      `view.fitViewtoViewport(targetBounds, viewportBounds)`.
   4. For each layer: `layer.view = view`, `layer.draw()` (stream lock, pull the provider's change
      list, run the diff processor into the buffer manager, update easing manager and uniforms —
      see [Layer](layer.md) and [Instance diffing](../buffers/instance-diffing.md)), then
      `view.animationEndTime = max(view, layer, camera animationEndTime)` and `layer.lastFrameTime
      = currentTime`. A throwing layer is recorded and removed from the scene
      (`scene.layerDiffs.diff(keep...)`).
   5. `onViewReady(true, scene, view)` → `drawSceneView(scene.container, view)`.
   6. `view.previousProps = view.props`.
   After all scenes, `printLayerErrors` logs removed layers.
5. **`drawSceneView`** for a view:
   - If the view has a render target: add every `optimizedOutputs` type to each target's
     `disabledTargets`, then remove the ones enabled this frame (`enableOptimizedOutput`).
   - `renderer.setRenderTarget(view.renderTarget || null)` (null = canvas).
   - `renderer.setScissor(viewBounds)`; if `clearFlags` has `ClearFlags.COLOR`, set the clear
     color to `props.background` (default `[0, 0, 0, 0]`).
   - `renderer.setViewport(viewBounds)`; `renderer.clear(color, depth, stencil)` from
     `clearFlags` (no flags → nothing cleared).
   - `renderer.render(scene, target, view, view.props.glState)` — draws every `Model` in the
     GL `Scene` in insertion order, applies `view.props.materialSettings`, calls the `glState`
     hook with the model id before each model, and blits to `output.blit` targets afterwards.
   - `view.lastFrameTime = currentTime`.
6. **Input ready** — clears `userInputManager.waitingForRender`.
7. **Resource dequeue** — unless a dequeue is already in flight, `await
   resourceManager.dequeueRequests()`; if any manager buffered something (e.g. glyphs or images
   packed into an atlas), schedules another `draw(await onFrame())` so the new data is shown.
8. **Reset** — for each render view: `needsDraw = false`, `camera.resolve()`; for each layer:
   `needsViewDrawn = false`.
9. **`didRender`** broadcast; `enabledOptimizedOutputs.clear()`.

Because each layer has one material shared by all views, view-dependent uniforms are only correct
right after the layer's `draw()` for that view; that is why `commit` renders each view
immediately after updating its layers instead of updating everything first.

### What causes something to be drawn

- **Views** decide by `props.drawMode` (`ViewDrawMode`, default `ALWAYS`): `FRAME_COUNT`,
  `FRAME_SKIP`, `UP_TO_TIMESTAMP_INCLUSIVE`, `UP_TO_TIMESTAMP_EXCLUSIVE`, `ON_PROPS_CHANGE`,
  `ON_TRIGGER` (`drawMode.trigger(frameMetrics)`), `NEVER`. See
  [Views and scenes](views-and-scenes.md).
- **Instance changes** reach the GPU only during a `draw` whose view passes `shouldDrawView`.
- **Pipeline changes** (`Surface.pipeline`) are applied on the next animation frame and show on
  the following `draw`.
- `Surface.redraw()`, `View.needsDraw`, `Layer.needsViewDrawn`, `Layer.alwaysDraw` and
  `animationEndTime` are set and reset by the loop but are **not read** by
  `View.shouldDrawView`; with the default `ALWAYS` mode every view redraws every frame anyway.

### Post-processing hook-in

Post-processing is built from the same pieces: a view with `output` targets renders into
textures/color buffers (MRT render target), and a later scene's layer samples them. The React
`PostProcessLayer` sets `alwaysDraw = true`. Scene and view `order` decide which pass runs first.
See [Post-processing](../react/post-processing.md).

### frame.ts scheduler

One module-level `requestAnimationFrame` loop (started on import, stopped when every queue is
empty, restarted by any new command). Each tick, in order:

1. `onAnimationLoop(cmd, interval?, duration?, zeroTime?)` commands — every tick, or once per
   `interval` ms; with `duration`, they stop after it and get one final call with the intended end
   time. `zeroTime` makes `t` start at 0. Returns a promise used as the id for
   `stopAnimationLoop(id)`; it resolves on first run (no duration) or at the end (duration).
2. `onFrame(cmd?, interval?)` commands — run on the next tick (or once `interval` ms have passed
   since queuing); returns a promise resolving with the frame time.
3. `nextFrame(cmd?)` commands — run one tick later than `onFrame`.

`stopAllFrameCommands()` calls every loop command one last time and clears all queues.

## Extension points

- Drive `draw` yourself with any timer; pass `time` to control animation time (e.g. for
  deterministic captures). `SurfaceJSX` exposes `frameRate`, `renderFrameCount` and `stop`.
- Per-view frame control: `drawMode` on the view props.
- Code that must run between view renders: a `CommandLayer` in its own scene ordered between
  others — see [Surface commands](commands.md).
- Per-model GL state tweaks: the view's `glState(glState, modelId)` hook.

## Gotchas

- `order` sorting uses `a.order || Number.MAX_SAFE_INTEGER`, so `order: 0` and "no order" both
  sort last; use `order >= 1` to force something first.
- Layer `order` only sorts the `layer.draw()` updates. GPU draw order is the insertion order of
  models in the scene's `Scene.models` set. Buffer managers remove and re-add their model when
  they resize a buffer (e.g. `InstanceAttributeBufferManager.resizeBuffer`), which moves that
  layer's draw to the end.
- A view that fails `shouldDrawView` also skips its layers' `draw()`, so their providers' changes
  are not consumed for that frame. A layer in several views is updated once per drawn view.
- `draw` is `async` and awaits resource dequeueing; calls are not serialised, only the dequeue
  is guarded (`isBufferingResources`).
- `frame.ts` starts `requestAnimationFrame` at import time; it needs a browser-like global.
- `constants.ts` names (`_active`, `instanceData`) are baked into generated shaders; renaming them
  breaks shader modules that reference them.

## Related

- [Surface](surface.md) — construction, pipeline, resize.
- [Layer](layer.md) — `Layer.draw` in detail.
- [Views and scenes](views-and-scenes.md) — draw modes, viewports, render targets.
- [Instance diffing](../buffers/instance-diffing.md) — what the change processing does.
- [Renderer](../gl/renderer.md) — `WebGLRenderer.render`.
- [Easing and animation](../instances/easing-and-animation.md) — how `frameMetrics` drives easing.
- [Post-processing](../react/post-processing.md) — multi-pass setups.
