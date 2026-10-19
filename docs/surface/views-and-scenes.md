---
title: Views and scenes
summary: LayerScene and View: how scenes group layers and views, and how views define viewports, cameras, clear flags, draw modes, chains and render targets.
covers:
  - ui/src/surface/view.ts
  - ui/src/surface/layer-scene.ts
related:
  - surface/surface.md
  - surface/layer.md
  - surface/render-loop.md
  - 2d/view-and-camera.md
  - 3d/view-and-projection.md
  - resources/textures-and-atlases.md
  - resources/color-buffers.md
  - react/post-processing.md
status: complete
verified-at: d80bb72a
---

## Purpose

A `LayerScene` is a named group of layers rendered together; a `View` is one way of rendering a
scene: a viewport on the canvas (or on an offscreen target), a camera, clear behaviour and redraw
policy. A scene with two views draws the same layers twice (split screen, minimap, a picking or
glow pass into a texture). Both are declared as keyed initializers in `Surface.pipeline` and kept
in sync by `ReactiveDiff`.

## Key files

- `ui/src/surface/layer-scene.ts` — `LayerScene`, `ISceneOptions`.
- `ui/src/surface/view.ts` — abstract `View`, `IViewProps`, `createView`, `ViewInitializer`,
  `ClearFlags`, `ViewDrawMode`, `ViewOutputTarget`, `ViewOutputBuffers`, `BlitOutputBuffers`,
  `ViewDepthBuffer`, `NoView`.
- `ui/src/2d/view/view-2d.ts` — `View2D` (with `Projection2D`).
- `ui/src/3d/view/view-3d.ts` — `View3D`.
- `ui/src/surface/layer-processing/generate-default-scene.ts` — `generateDefaultScene`, the
  fallback camera for views without one.
- `ui/src/gl/render-target.ts` — `RenderTarget`, built by `View.createRenderTarget`.

## How it works

### Declaring

Scenes, views and layers are declared as `SurfaceJSX` children:

```tsx
<SurfaceJSX>
  <TextureJSX name="tex" /* … */ />
  <SceneJSX name="main">
    <ViewJSX name="v" type={View2D} config={{ camera, clearFlags: [ClearFlags.COLOR] }} />
    <LayerJSX name="dots" type={CircleLayer} providerRef={provider} config={{}} />
  </SceneJSX>
</SurfaceJSX>
```

`SurfaceJSX` turns them into the `IPipeline` it passes to the internal `Surface.pipeline`:
`{ resources, scenes: [{ key: "main", views: [createView(View2D, …)], layers:
[createLayer(CircleLayer, …)] }] }`.

`createView(ViewClass, props)` returns `{ key, init: [ViewClass, props] }` and defaults
`viewport` to `{ left: 0, right: 0, top: 0, bottom: 0 }` (the full target). `ISceneOptions` is
`{ key, views, layers, order? }`.

### LayerScene

`new LayerScene(surface, options)` (built by `Surface.sceneDiffs`) creates a GL `Scene`
(`scene.container`, which holds the layers' `Model`s), then two diffs:

- `viewDiffs` — build: `new ViewClass(scene, props)`, `props.camera ||= defaultElements.camera`,
  `pixelRatio = surface.pixelRatio`, `resource = surface.resourceManager`, and
  `userInputManager.waitingForRender = true`; chain entries are inlined as extra views (below).
  Update: `willUpdateProps`, `props = { ...props, ...new }`, `didUpdateProps`. Destroy:
  `view.destroy()` (disposes render targets).
- `layerDiffs` — build/update/destroy layers as described in [Layer](layer.md); a layer's
  `childLayers()` are inlined right after it; `willRebuildLayer` triggers
  `layerDiffs.rebuild()`.

`LayerScene.update(options)` sets `order`, diffs views, **then** layers, **then** calls
`createRenderTarget()` on every view — render targets depend on which output types the built
layers can produce for that view. Accessors: `layers`, `views`, `renderViews`. `removeLayer`,
`clearCaches`, `destroy`.

### View props (`IViewProps`)

- `camera: Camera` — required by type; projection type decides 2D vs 3D behaviour.
- `viewport: AbsolutePosition` — region of the target, resolved with
  `getAbsolutePositionBounds` against the canvas or the render target size.
- `background?: Color` — clear color (used only when `clearFlags` contains `COLOR`).
- `clearFlags?: ClearFlags[]` — `COLOR`, `DEPTH`, `STENCIL`; none → nothing is cleared.
- `order?` — draw order within the scene.
- `drawMode?: { mode: ViewDrawMode, value?, trigger? }` — redraw policy (below).
- `output?: { buffers, depth, blit? }` — render offscreen (below).
- `materialSettings?` — GL material settings forced for every model drawn in this view.
- `glState?(glState, modelId)` — hook called just before each model's draw call.
- `screenScale?`, `pixelRatio?` — for views rendering into scaled targets.
- `chain?: Partial<IViewProps>[]` — alternate configurations rendered one per frame.

### Projection and bounds

Each `View` subclass owns `projection: BaseProjection` (`screenBounds`, `viewBounds`,
`screenToWorld`, `worldToScreen`, `viewToWorld`, `worldToView`). The Surface calls
`fitViewtoViewport(targetBounds, viewportBounds)` before each draw and on pipeline/resize; the
subclass updates the projection and camera there. `View.screenBounds` / `viewBounds` proxy the
projection.

### Draw modes (`View.shouldDrawView`)

`ViewDrawMode` (default `ALWAYS`): `FRAME_COUNT` (draw the next `value` frames), `FRAME_SKIP`
(draw every `value`-th frame), `UP_TO_TIMESTAMP_INCLUSIVE` / `UP_TO_TIMESTAMP_EXCLUSIVE` (until
time `value`), `ON_PROPS_CHANGE` (shallow prop diff vs `previousProps`), `ON_TRIGGER`
(`trigger(frameMetrics)`), `NEVER`. The counters in `drawModeInfo` reset when `mode`, `value` or
`trigger` change.

### View chains

`chain` entries become extra views keyed `${key}-chain-${i}` with `parent` set to the main view.
`LayerScene.renderViews` groups a parent with its chain and renders only element
`currentFrame % chain.length` each frame — one view of the chain per `draw`.

### Render targets (`View.createRenderTarget`)

No `output` → the view renders to the canvas. Otherwise:

1. Collect the output types the scene's layers produce for this view
   (`layer.shaderIOInfo.fs.get(view).outputTypes`).
2. `getOutputTargets()` turns `output.buffers` (`{ [FragmentOutputType]: resource }`, or a single
   resource meaning `COLOR`) into `ViewOutputTarget`s. Only types some layer supports are kept.
3. Each resource is fetched through the resource router (`textureRequest` / `colorBufferRequest`
   with a throw-away `Layer` and `Instance`) — the resource must already exist in the pipeline.
4. All buffers must have equal non-zero size. `output.depth`: `true` → a
   `DEPTH_COMPONENT16` renderbuffer, a texture/color-buffer resource → that, `false` → none.
5. `output.blit` color/depth targets are resolved the same way.
6. With `WebGLStat.MRT` a single `RenderTarget` with all color outputs, depth and blit targets
   (`retainTextureTargets: true`) is created; without MRT it throws.

`willUseView()` recreates the target when any of its buffers was destroyed (e.g. a resized
texture). `getRenderTargets()` returns `[renderTarget]` or `[]`.

## Extension points

- New view type: subclass `View<TProps>`, set `static defaultProps`, a `projection`, and
  implement `fitViewtoViewport`; see [2D view and camera](../2d/view-and-camera.md) and
  [3D view and projection](../3d/view-and-projection.md).
- Override `shouldDrawView(frameMetrics)`, `willUpdateProps`, `didUpdateProps`, `willUseView`.
- Custom output types: any number works as a key of `output.buffers` if a layer's fragment
  outputs (or `mapOutput`) use the same number.
- Per-pass GL tweaks: `materialSettings` and `glState` on the view.

## Gotchas

- Scenes are diffed views-first, layers-second; render targets are built only after both. A view
  output type that no layer of the scene produces is silently left out of the target.
- Every buffer of one view's output must have identical dimensions; zero size throws.
- `output` without MRT support (`WebGLStat.MRT` false) throws "MRT for non-MRT systems not
  supported yet".
- `View.order` returns `props.order || 0`, and the surface sorts with `order || MAX_SAFE_INTEGER`:
  `0` and unset sort last.
- A view's props are replaced shallowly on update (`Object.assign({}, old, new)`); a key removed
  from the new props keeps its old value.
- Layers build their per-view fragment shaders from `scene.views` at layer init; adding a view
  with a new `output` later needs the layers rebuilt to produce matching outputs.
- `NoView` is a placeholder (all projections return `[0, 0]`); it is not meant to be rendered.

## Related

- [Surface](surface.md) — `pipeline` and scene diffing.
- [Layer](layer.md) — what `layerDiffs` builds; per-view fragment shaders.
- [Render loop](render-loop.md) — how views are drawn each frame.
- [2D view and camera](../2d/view-and-camera.md), [3D view and projection](../3d/view-and-projection.md).
- [Textures and atlases](../resources/textures-and-atlases.md), [Color buffers](../resources/color-buffers.md) — output resources.
- [Post-processing](../react/post-processing.md) — multi-view pipelines.
