---
title: Architecture
summary: How DeltaV fits together end to end: Instance → InstanceProvider → Layer → LayerScene/View → Surface render loop → WebGLRenderer, plus resources, interaction and the public exports.
covers:
  - ui/src/index.ts
  - ui/index.ts
related:
  - overview/repository.md
  - overview/glossary.md
  - surface/surface.md
  - surface/render-loop.md
  - surface/layer.md
  - instances/instance-providers.md
  - shaders/shader-processing.md
  - buffers/overview.md
  - gl/renderer.md
status: complete
verified-at: d80bb72a
---

## Purpose

DeltaV (`deltav` on npm) is a WebGL large-data visualization framework. Application code describes
data as plain `Instance` objects with `@observable` properties; DeltaV turns property changes into
incremental GPU buffer writes, generates the GLSL each layer needs, and renders scenes through
views with their own cameras, viewports and render targets. This doc is the hub: it shows the
pipeline once and points to the doc that owns each part.

## Key files

- `ui/index.ts` — package entry (`main`/`types` in `package.json` point at its build output); re-exports `ui/components/index.ts` (a NOOP placeholder) and `ui/src/index.ts`.
- `ui/src/index.ts` — the whole public API: imports `ui/src/util/webgl2-type-shim.ts` for its side effect, then `export *` from every area folder listed in the module map below plus `ui/src/types.ts`.
- `ui/src/surface/surface.ts` — `Surface`, the root object (built only by `SurfaceJSX`, exported as a type only); `DEFAULT_IO_EXPANSION`, `DEFAULT_RESOURCE_MANAGEMENT`, `DEFAULT_SHADER_TRANSFORM`, `ISurfaceOptions`.
- `ui/src/surface/layer-scene.ts` — `LayerScene`, `ISceneOptions`: a keyed group of views and layers.
- `ui/src/surface/layer.ts` — `Layer` base class, `ILayerProps`, `LayerInitializer`.
- `ui/src/surface/view.ts` — `View` base class, `createView`, `ClearFlags`, `ViewDrawMode`.
- `ui/src/instance-provider/instance-provider.ts` — `InstanceProvider`, the change list a layer consumes.
- `ui/src/gl/webgl-renderer.ts` — `WebGLRenderer`, the only object that issues draw calls.
- `ui/src/constants.ts` — internal names (`activeAttributeName`, `uniformBufferInstanceBufferName`) and `TO_RADIANS`/`TO_DEGREES`; not re-exported by `ui/src/index.ts`.

## How it works

```mermaid
flowchart LR
  I[Instance<br/>@observable props] -->|setter → instanceUpdated| P[InstanceProvider<br/>changeList]
  P -->|Layer.draw reads changeList| L[Layer]
  L -->|initShader → ShaderProcessor| SH[GLSL vs/fs<br/>+ shaderIOInfo]
  L -->|getLayerBufferType| BM[BufferManager<br/>+ DiffProcessor]
  BM -->|writes Attribute / uniforms| M[gl Model in<br/>LayerScene.container]
  S[Surface.draw] -->|commit: per scene, per view| L
  S -->|drawSceneView| R[WebGLRenderer.render]
  R --> M
  V[View + Camera] -->|viewport, projection, render target| R
  RR[ResourceRouter] -->|textures, fonts, color buffers| L
  U[UserInputEventManager] -->|EventManagers, picking| S
```

1. **Setup.** `SurfaceJSX` mounts a `<canvas>`, resolves its child tags and constructs the
   `Surface` on it (the only place one is built; the package exports `Surface` as a type only).
   That runs `Surface.init`: `initGL` creates the
   `WebGLRenderer` (which gets a WebGL context through `GLProxy.getContext`), then the
   `UserInputEventManager` (always with a `LayerMouseEvents` manager first), the `ResourceRouter`
   with the resource managers (default `DEFAULT_RESOURCE_MANAGEMENT`), the IO expanders
   (`BasicIOExpansion`, `ActiveIOExpansion`, `EasingIOExpansion` plus any the resource managers
   contribute) and the shader transforms (`Shaders30CompatibilityTransform`). `Surface.ready`
   resolves when this is done. See [Surface](../surface/surface.md).
2. **Pipeline.** `SurfaceJSX` passes the resources and scenes its child tags declare to
   `Surface.pipeline({ resources, scenes })`, which is declarative and reactive: it diffs
   the given resource and scene initializers against the current ones with `ReactiveDiff`
   (`resourceDiffs`, `sceneDiffs`), keyed by `key`. Each `LayerScene` in turn diffs its views
   (`createView(View2D, {...})`) and layers (`createLayer(CircleLayer, {...})`). Calling
   `pipeline` again with a changed list adds, updates or destroys items; only the last call in a
   frame wins. See [Views and scenes](../surface/views-and-scenes.md).
3. **Layer init.** When a layer is built, `LayerScene` constructs it with
   `Object.assign({}, layerClass.defaultProps, props)` and calls `Layer.init`: `Layer.initShader`
   returns the layer's `IShaderInitialization` (vs/fs source, `instanceAttributes`,
   `vertexAttributes`, `uniforms`, `vertexCount`); shader transforms run on the raw source;
   `ShaderProcessor.process` resolves `${import: ...}` shader modules, expands the IO through the
   expanders and emits final GLSL per view output; `getLayerBufferType` picks a
   `LayerBufferType`; `makeLayerBufferManager` creates the matching buffer manager; the diff
   handlers are set. See [Layer](../surface/layer.md),
   [Shader processing](../shaders/shader-processing.md), [IO expansion](../shaders/io-expansion.md).
4. **Data flow.** Setting an `@observable` property records the property id in
   `Instance.changes` and calls `InstanceProvider.instanceUpdated`; `add`/`remove` record
   INSERT/REMOVE diffs. Nothing touches the GPU until the next frame. See
   [Instances](../instances/instances.md), [Instance providers](../instances/instance-providers.md).
5. **Frame.** `Surface.draw(time?)` (called by `SurfaceJSX` through `onAnimationLoop`) updates `frameMetrics`, calls `EventManager.willRender`, broadcasts camera
   changes, then `Surface.commit`: for each scene (sorted by `order`), each render view whose
   `View.shouldDrawView` is true, each layer: `Layer.draw` consumes the provider's change list
   through the `InstanceDiffManager`'s processor into the buffer manager, then updates uniforms;
   then `drawSceneView` sets render target, scissor, clear and viewport and calls
   `WebGLRenderer.render(scene.container, target, view)`. Afterwards resource requests are
   dequeued (`ResourceRouter.dequeueRequests`; a successful buffer triggers another draw), draw
   flags are reset and `EventManager.didRender` runs. See [Render loop](../surface/render-loop.md),
   [Buffer management overview](../buffers/overview.md), [WebGL renderer](../gl/renderer.md).
6. **Interaction.** `UserInputEventManager` turns DOM mouse/touch events into
   `IMouseInteraction`/`ITouchInteraction` and routes them to `EventManager`s. Layers with
   `picking: PickType.SINGLE` are hit-tested by color picking: `LayerMouseEvents` calls
   `Surface.enableOptimizedOutput(FragmentOutputType.PICKING)` so the next frame renders the
   picking output, which is decoded back to instance uids. See
   [Event management](../interaction/event-management.md), [Picking](../interaction/picking.md).

### Module map

| Folder | Responsibility | Docs |
|---|---|---|
| `ui/src/surface` | `Surface`, `Layer`, `LayerScene`, `View`, `SurfaceCommands`, `CommandLayer`, layer interaction | [Surface](../surface/surface.md), [Layer](../surface/layer.md), [Views and scenes](../surface/views-and-scenes.md), [Surface commands](../surface/commands.md), [Render loop](../surface/render-loop.md) |
| `ui/src/instance-provider` | `Instance`, `@observable`, `makeObservable`, `InstanceProvider`, `InstanceProviderWithList` | [Instances](../instances/instances.md), [Instance providers](../instances/instance-providers.md) |
| `ui/src/math/auto-easing-method.ts`, `ui/src/util/easing-util.ts` | GPU easing of attributes | [Easing and animation](../instances/easing-and-animation.md) |
| `ui/src/shaders` | `ShaderProcessor`, `ShaderModule` registry, built-in modules (`instancing`, `picking`, `frame`, ...) | [Shader processing](../shaders/shader-processing.md), [Shader modules](../shaders/shader-modules.md) |
| `ui/src/surface/layer-processing` | IO expanders, shader transforms, layer geometry/material/model generation | [IO expansion](../shaders/io-expansion.md), [Authoring a layer](../shaders/authoring-a-layer.md) |
| `ui/src/surface/buffer-management` | Buffer managers and diff processors per `LayerBufferType` | [Overview](../buffers/overview.md), [Instance attribute strategies](../buffers/instance-attribute-strategies.md), [Vertex and uniform strategies](../buffers/vertex-and-uniform-strategies.md), [Instance diffing](../buffers/instance-diffing.md) |
| `ui/src/gl` | `WebGLRenderer`, `GLState`, `GLProxy`, `WebGLStat`, GL wrappers (`Attribute`, `Texture`, `RenderTarget`, `Material`, `Model`, `Geometry`, `Scene`) | [WebGL renderer](../gl/renderer.md), [GL state and proxy](../gl/state-and-proxy.md), [GPU resources](../gl/gpu-resources.md), [Scene, model and material](../gl/scene-model-material.md) |
| `ui/src/math` | Functional vector/matrix/quaternion math, `BaseProjection`, `Bounds`, rays, planes, frustum | [Vectors, matrices and quaternions](../math/vectors-matrices-quaternions.md), [Projection and geometry](../math/projection-and-geometry.md) |
| `ui/src/event-management` | `EventManager`, `UserInputEventManager`, `SimpleEventHandler`, `QueuedEventHandler`, interaction types | [Event management](../interaction/event-management.md), [Picking](../interaction/picking.md), [Camera controllers](../interaction/camera-controllers.md) |
| `ui/src/2d` | `View2D`, `Camera2D`, `Layer2D`, `BasicCamera2DController`, 2D layers (circles, rectangles, edges, labels, ...) | [2D view and camera](../2d/view-and-camera.md), [2D layers](../2d/layers.md), [Labels](../2d/labels.md) |
| `ui/src/3d` | Scene graph (`Transform`, `WorldNode`, `Instance3D`), `View3D`, 3D controllers, cube/triangle layers | [3D scene graph](../3d/scene-graph.md), [3D view and projection](../3d/view-and-projection.md), [3D layers](../3d/layers.md) |
| `ui/src/resources` | `ResourceRouter`, `BaseResourceManager`, fonts, atlases, render textures, color buffers; `RESOURCE`/`REQUEST` helpers | [Resource management](../resources/resource-management.md), [Text and fonts](../resources/text-and-fonts.md), [Textures and atlases](../resources/textures-and-atlases.md), [Color buffers](../resources/color-buffers.md) |
| `ui/src/base-surfaces` | React/JSX API: `SurfaceJSX`, `LayerJSX`, `ViewJSX`, `SceneJSX`, resources, post processing | [React surface](../react/react-surface.md), [Post processing](../react/post-processing.md) |
| `ui/src/util-layers` | `LogChangesLayer` debugging layer | [Utility layers](../react/util-layers.md) |
| `ui/src/util` | `createLayer`, `createAttribute`, `createUniform`, `createVertex`, `onFrame`/`onAnimationLoop`, `Camera`, `ReactiveDiff`, `QuadTree`, ... | [Library utilities](../utilities/library-util.md) |
| `ui/src/types.ts` | Shared enums and interfaces (`LayerBufferType`, `PickType`, `FragmentOutputType`, `IShaderInitialization`, ...) | [Glossary](glossary.md) |
| `util` (repo root) | Generic helpers outside the library (React hooks, DOM helpers) | [Repository utilities](../utilities/repo-util.md), [Repository layout and tooling](repository.md) |

## Extension points

Every customization plugs into one of these seams; the linked doc gives the exact contract.

- **New layer:** subclass `Layer` (or `Layer2D` for 2D world space), implement `initShader()`
  returning `IShaderInitialization`, set `static defaultProps`, optionally `getMaterialOptions`,
  `baseShaderModules`, `childLayers`; pair with an `Instance` subclass. Mount with `LayerJSX`
  (which builds the `createLayer` initializer).
  See [Authoring a layer](../shaders/authoring-a-layer.md).
- **New view/camera:** subclass `View` (implement `fitViewtoViewport` and the projection methods)
  and mount with `ViewJSX` (which builds the `createView` initializer). See [Views and scenes](../surface/views-and-scenes.md).
- **Shader IO:** pass the `ioExpansion` (array, or function receiving the defaults) and
  `shaderTransforms` props of `SurfaceJSX` (typed from `ISurfaceOptions`); subclass `BaseIOExpansion` / `BaseShaderTransform`.
  Register GLSL modules with `ShaderModule.register`. See [IO expansion](../shaders/io-expansion.md),
  [Shader modules](../shaders/shader-modules.md).
- **Resources:** pass the `resourceManagers` prop of `SurfaceJSX` (`{ type, manager }[]`, a
  `BaseResourceManager` subclass). See [Resource management](../resources/resource-management.md).
- **Input:** add an event manager tag (`SimpleEventHandlerJSX`, `QueuedEventHandlerJSX`,
  `BasicCamera2DControllerJSX`, …) inside `SurfaceJSX`; each builds an `EventManager`.
  See [Event management](../interaction/event-management.md).
- **Imperative GPU work inside the frame:** `CommandLayer` with `Surface.commands`. See
  [Surface commands](../surface/commands.md).

## Gotchas

- Importing the library touches browser globals at module load: `ui/src/util/webgl2-type-shim.ts`
  assigns `window.WebGL2RenderingContext`, and `ui/src/gl/webgl-stat.ts` runs `initStats()`,
  which creates a throwaway canvas to fill `WebGLStat` (prefers `webgl2`, falls back to `webgl`
  and `experimental-webgl`) and sets `window.WebGLStat`. Unit tests therefore import individual
  module files (e.g. `ui/src/math/vector.ts`, `ui/src/gl/attribute.ts`), never `ui/src/index.ts`.
- `Surface.draw` is not self-scheduling: `SurfaceJSX` runs the frame loop
  (`onAnimationLoop`) and re-fits the canvas on window resize, so app code never calls `draw`.
- GPU state lags data by one frame: instance changes, `pipeline` calls (awaits `onFrame`) and
  resource loads all land on a later `draw`.
- An `InstanceProvider` may feed only one layer: `InstanceProvider.resolve` throws if a second
  layer resolves it with a different context.
- A layer that throws during `Layer.draw` is removed from its scene for that frame
  (`Surface.printLayerErrors` logs why); the most common cause is an attribute `update` returning
  a value longer than its `size`.
- The buffering strategy depends on hardware: `getLayerBufferType` reads `WebGLStat`
  (`HARDWARE_INSTANCING`, `MAX_VERTEX_ATTRIBUTES`) once per layer, so the same layer can run as
  instance attributes on one GPU and uniform buffering on another.
- `ui/src/surface/buffer-management/index.ts` exports only the base and the instance-attribute,
  packed and uniform managers; the vertex-attribute managers are internal.
- `ui/src/constants.ts` and `ui/src/release.json` are not part of the public API; `release.json`
  holds a stale `3.0.0` version, the real version is in `package.json`.

## Related

- [Repository layout and tooling](repository.md) — folders, scripts, build and test setup.
- [Glossary](glossary.md) — one-line definitions of every term used above.
- [Surface](../surface/surface.md) and [Render loop](../surface/render-loop.md) — the frame in detail.
- [Layer](../surface/layer.md) — layer lifecycle and props.
- [Shader processing](../shaders/shader-processing.md) and [Buffer management overview](../buffers/overview.md) — how a layer becomes GLSL and buffers.
- [WebGL renderer](../gl/renderer.md) — the draw-call side.
