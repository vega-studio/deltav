---
title: Surface
summary: The Surface: the top-level object that owns the renderer, resources, scenes, layers and event managers, and its lifecycle.
covers:
  - ui/src/surface/surface.ts
related:
  - surface/render-loop.md
  - surface/layer.md
  - surface/views-and-scenes.md
  - surface/commands.md
  - gl/renderer.md
  - resources/resource-management.md
  - shaders/io-expansion.md
  - interaction/event-management.md
  - react/react-surface.md
status: complete
verified-at: 6d7b2744
---

## Purpose

`Surface` is the root runtime object of deltav. It wraps one canvas and its WebGL context
(through a `WebGLRenderer`), and owns everything rendered into it: the resource managers, the
scenes (`LayerScene`) with their views and layers, the user-input event managers and the
surface-wide shader pipeline configuration (IO expanders, shader transforms, IO sorting). An
application declares *what* to render with `Surface.pipeline` and drives frames with
`Surface.draw`; the Surface diffs the declaration against what exists and renders it.

## Key files

- `ui/src/surface/surface.ts` — `Surface`, `ISurfaceOptions`, `DEFAULT_IO_EXPANSION`,
  `DEFAULT_RESOURCE_MANAGEMENT`, `DEFAULT_SHADER_TRANSFORM`.
- `ui/src/surface/layer-scene.ts` — `LayerScene`, `ISceneOptions` (built by `Surface.sceneDiffs`).
- `ui/src/surface/surface-commands.ts` — `SurfaceCommands` (exposed as `Surface.commands`).
- `ui/src/gl/webgl-renderer.ts` — `WebGLRenderer` (`Surface.renderer`).
- `ui/src/resources/resource-router.ts` — `ResourceRouter` (`Surface.resourceManager`).
- `ui/src/event-management/user-input-event-manager.ts` — `UserInputEventManager`
  (`Surface.userInputManager`).
- `ui/src/util/reactive-diff.ts` — `ReactiveDiff`, the keyed build/update/destroy differ used for
  resources, scenes, views and layers.
- `ui/src/types.ts` — `IPipeline`, `FrameMetrics`, `ResourceType`, `SurfaceErrorType`.

## How it works

### Construction and init

`new Surface(options?)` creates the `ready` promise; if `options` is given it calls
`Surface.init(options)` without awaiting it, so always `await surface.ready` (or `await
surface.init(...)`) before use. `init` is a no-op if a context already exists. It runs, in order:

1. `pixelRatio = options.pixelRatio || window.devicePixelRatio`, clamped to `>= 1`.
2. `initGL` — builds the `WebGLRenderer` on `options.context` (an `HTMLCanvasElement`) with
   `rendererOptions` (defaults: `alpha`, `antialias`, `preserveDrawingBuffer` false), sizes it
   from the canvas's current `width`/`height` and applies the pixel ratio. No canvas or no context
   → `ready` rejects with `{ error: SurfaceErrorType.NO_WEBGL_CONTEXT }`.
3. Registers `options.optimizedOutputTargets` (see *Optimized outputs*).
4. `initUserInputManager` — a `UserInputEventManager` on the canvas whose managers are
   `LayerMouseEvents` (always first; it drives layer picking events) followed by
   `options.eventManagers`. `handlesWheelEvents` is passed through.
5. `initResources` — a `ResourceRouter` with the renderer set and one manager per
   `{ type, manager }` entry of `options.resourceManagers`, else `DEFAULT_RESOURCE_MANAGEMENT()`
   (`COLOR_BUFFER` → `ColorBufferResourceManager`, `TEXTURE` → `RenderTextureResourceManager`,
   `ATLAS` → `AtlasResourceManager`, `FONT` → `FontResourceManager`).
6. `initIOExpanders` — `options.ioExpansion` as an array replaces the defaults; as a function it
   receives `DEFAULT_IO_EXPANSION()` (`BasicIOExpansion`, `ActiveIOExpansion`,
   `EasingIOExpansion`) and returns the list. The resource managers' own expanders
   (`ResourceRouter.getIOExpansion`) are always appended afterwards.
7. `initShaderTransforms` — same array/function rule over `DEFAULT_SHADER_TRANSFORM()`
   (`Shaders30CompatibilityTransform`).
8. Resolves `ready` with the surface.

Layers read this configuration through `Surface.getIOExpanders`, `getShaderTransforms` and
`getIOSorting` (`Surface.ioSorting`, a `BaseIOSorting`) when they build their shaders.

### The pipeline

`Surface.pipeline(pipeline: IPipeline)` takes `{ resources?: BaseResourceOptions[], scenes?:
ISceneOptions[] }`:

- It bumps `pipelineLoadContext` and awaits `onFrame()`; if another `pipeline` call arrived in
  the meantime, this one returns without doing anything (last call per frame wins).
- `resourceDiffs.diff(resources)` — a `ReactiveDiff` keyed by resource `key`; build/update/destroy
  delegate to `ResourceRouter.initResource` / `updateResource` / `destroyResource`.
- `sceneDiffs.diff(scenes)` — builds a `LayerScene(this, options)` per new key, calls
  `LayerScene.update` on existing ones, `LayerScene.destroy` on removed ones. Each scene then diffs
  its own views and layers (see [Views and scenes](views-and-scenes.md)).
- `updateViewDimensions` — for every render view: `willUseView`, compute viewport bounds against
  the canvas (or the view's render target size), `fitViewtoViewport`, `camera.update(true)`.

Resources are diffed before scenes, so a view's output target or a layer's resource request can
find its resource. `Surface.scenes` returns `sceneDiffs.items`.

### Drawing

`Surface.draw(time?)` renders one frame; `Surface.commit(onViewReady?)` is the update half of it.
Both are described step by step in [Render loop](render-loop.md). The Surface never schedules its
own frames: the caller drives `draw` (the React `SurfaceJSX` does it with `onAnimationLoop`).

### Sizing

- `Surface.resize(width, height, pixelRatio?)` — sets the renderer size (0 becomes 100) and pixel
  ratio, resizes the input manager and resource managers, pushes the new pixel ratio to every
  render view, forces `camera.update(true)`, then `updateViewDimensions`.
- `Surface.fitContainer()` — restyles the canvas to fill its parent element and calls `resize`
  with the measured sizes. Does nothing for an `OffscreenCanvas`.

### Queries

- `getViewSize(viewKey)` — the view's `screenBounds` (or `viewBounds` if it renders to a target).
- `getViewWorldBounds(viewKey)` — world-space bounds from the view's projection.
- `getProjections(viewKey)` — the view's `BaseProjection`.
- `getCurrentInteraction()` — the latest `IEventInteraction` from the input manager.

All three view queries search every scene's `viewDiffs.getByKey(key)` and return `null` if none
matches.

### Optimized outputs

`optimizedOutputTargets` lists output types (e.g. `FragmentOutputType.PICKING`) that are disabled
on every view render target by default. `Surface.enableOptimizedOutput(type)` enables one for the
next `draw` only; `draw` clears the enabled set at its end. `LayerMouseEvents` calls
`enableOptimizedOutput(FragmentOutputType.PICKING)` when an interaction needs a pick pass.
`getOptimizedOutputs()` returns the currently *enabled* set.

### Disposal

`Surface.destroy()` destroys the resource router, the input manager, every scene (via
`sceneDiffs.destroy()`, which destroys views and layers) and disposes the renderer, then drops the
context. Calls to `draw`/`commit` after that return immediately (`!this.gl`).

## Extension points

- **Resource managers** — pass `resourceManagers: [...DEFAULT_RESOURCE_MANAGEMENT(), { type,
  manager }]` with a `BaseResourceManager` subclass; see
  [Resource management](../resources/resource-management.md). Passing the option *replaces* the
  defaults.
- **IO expansion** — `ioExpansion: (defaults) => [...defaults, new MyExpansion()]` with a
  `BaseIOExpansion` subclass; see [IO expansion](../shaders/io-expansion.md).
- **Shader transforms** — `shaderTransforms` with `BaseShaderTransform` subclasses (raw string
  transforms applied to every layer shader).
- **Event managers** — `eventManagers: EventManager[]`; each gets `willRender`/`didRender` around
  every frame. See [Event management](../interaction/event-management.md).
- **IO sorting** — replace `Surface.ioSorting` with a `BaseIOSorting` subclass before layers are
  built.

## Gotchas

- `init` is async and the constructor does not await it: `pipeline` or `draw` before `ready`
  resolves sees no `gl` and silently does nothing (`draw`/`commit`), or no `resourceManager`.
- Passing `resourceManagers`, or an *array* for `ioExpansion`/`shaderTransforms`, replaces the
  defaults entirely. Without `EasingIOExpansion`, easing attributes do not work; without the
  default resource managers, textures, atlases, fonts and color buffers cannot be requested.
- Await `pipeline()` before calling `draw()` when updating the pipeline in a loop; the source
  warns that not doing so can leave elements unrendered.
- Several `pipeline()` calls in one frame collapse to the last one; the earlier promises resolve
  without having applied anything.
- `pixelRatio` defaults to `window.devicePixelRatio` at field-initialisation time, so constructing
  a `Surface` needs a `window`.
- A layer whose `draw()` throws is removed from its scene for that frame and logged by
  `printLayerErrors` (with extra diagnostics for attribute `update` results whose length differs
  from the attribute size). It comes back only when the pipeline is diffed again.
- `rendererOptions` defaults spell `premultiplyAlpha`, while the option read is
  `premultipliedAlpha`; leaving it unset passes `undefined` to the renderer.
- On a missing context `init` calls `destroy()` before `resourceManager` and `userInputManager`
  exist.

## Related

- [Render loop](render-loop.md) — what `draw` and `commit` do in one frame.
- [Views and scenes](views-and-scenes.md) — `LayerScene`, `View`, render targets.
- [Layer](layer.md) — what the scenes build.
- [Surface commands](commands.md) — `Surface.commands` and `CommandLayer`.
- [Renderer](../gl/renderer.md) — `WebGLRenderer`.
- [Resource management](../resources/resource-management.md) — `ResourceRouter` and managers.
- [React surface](../react/react-surface.md) — the JSX wrapper that drives `draw`.
