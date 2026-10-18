---
title: Glossary
summary: One-line definitions of the DeltaV vocabulary (instance, provider, layer, shader IO, buffering, view, scene, easing, picking, resources) and a map of the shared types in types.ts.
covers:
  - ui/src/types.ts
related:
  - overview/architecture.md
  - instances/instances.md
  - shaders/io-expansion.md
  - surface/layer.md
  - buffers/overview.md
status: complete
verified-at: 2e5bdfab
---

## Purpose

DeltaV reuses common graphics words (attribute, scene, view, instance) with specific meanings. This
doc pins each term to the symbol that implements it and the doc that explains it, and maps the
shared vocabulary types declared in `ui/src/types.ts`. Read it before any other doc if a word is
unclear.

## Key files

- `ui/src/types.ts` — shared enums, interfaces and type guards used across every area (listed under *Shared types* below); re-exported by `ui/src/index.ts`.
- `ui/src/constants.ts` — internal names: `activeAttributeName` (`_active`), `uniformBufferInstanceBufferName` (`instanceData`), `TO_RADIANS`, `TO_DEGREES`.

## How it works

The vocabulary follows the data path: an **instance** lives in a **provider**; a **layer** reads
the provider and declares **shader IO** (instance attributes, vertex attributes, uniforms); the
system **expands** that IO into GLSL and picks a **buffering strategy**; the layer belongs to a
**scene**, which is drawn through one or more **views** by the **surface**. See
[Architecture](architecture.md) for the flow.

## Terms

| Term | Meaning | Symbol(s) | Doc |
|---|---|---|---|
| Instance | One data element (a circle, a label); plain object whose `@observable` properties feed GPU attributes | `Instance`, `IInstanceOptions` | [Instances](../instances/instances.md) |
| Observable | Decorated instance property; its setter records the change in `Instance.changes` and notifies the provider. `makeObservable(this, Class)` must run in the subclass constructor | `observable`, `makeObservable`, `ObservableMonitoring` | [Instances](../instances/instances.md) |
| uid | Per-instance numeric id (wraps at `0xffffff`); also the color encoded for picking | `Instance.uid` | [Picking](../interaction/picking.md) |
| Active | System-managed flag: set true when a diff processor buffers the instance, false on removal; the injected `_active` attribute collapses inactive instances in the vertex shader | `Instance.active`, `ActiveIOExpansion` | [IO expansion](../shaders/io-expansion.md) |
| Instance provider | The change log a layer consumes: `add`/`remove`/property changes become `InstanceDiff` entries in `changeList`; `resolve` clears it; `sync` re-inserts everything | `InstanceProvider`, `InstanceProviderWithList`, `IInstanceProvider` | [Instance providers](../instances/instance-providers.md) |
| Instance diff | `[instance, InstanceDiffType, changedPropertyIds]`; types CHANGE, INSERT, REMOVE | `InstanceDiff`, `InstanceDiffType` | [Instance diffing](../buffers/instance-diffing.md) |
| Layer | Binds one provider to one shader program and buffer strategy; subclasses implement `initShader` | `Layer`, `ILayerProps`, `Layer2D` | [Layer](../surface/layer.md) |
| Layer initializer | `{ key, init: [LayerClass, props] }` value diffed by the scene; made by `createLayer` / `createChildLayer` | `LayerInitializer`, `createLayer` | [Layer](../surface/layer.md) |
| Child layers | Layers a layer injects right after itself (composite layers) | `Layer.childLayers` | [Layer](../surface/layer.md) |
| Shader IO | Everything a layer declares for its shaders: `instanceAttributes`, `vertexAttributes`, `uniforms`, `indexBuffer`, `vertexCount`, `vs`/`fs` | `IShaderInitialization`, `IShaderInputs`, `IShadersSource` | [Authoring a layer](../shaders/authoring-a-layer.md) |
| Instance attribute | Per-instance value; `update(instance)` returns a Vec1-4 (or Mat4x4 / atlas size); may carry `easing` or `resource` | `IInstanceAttribute`, `InstanceAttributeSize`, `createAttribute` | [IO expansion](../shaders/io-expansion.md) |
| Vertex attribute | Per-vertex model data, the same for every instance; `update(vertexIndex)` | `IVertexAttribute`, `VertexAttributeSize`, `createVertex` | [Authoring a layer](../shaders/authoring-a-layer.md) |
| Uniform | Per-layer value updated every frame before the draw; `update(uniform)` | `IUniform`, `UniformSize`, `createUniform` | [IO expansion](../shaders/io-expansion.md) |
| Block / block index | A 4-float slot (`vec4`) that attributes are packed into; `block`/`blockIndex` are normally assigned by the system | `InstanceBlockIndex`, `packAttributes` | [Instance attribute strategies](../buffers/instance-attribute-strategies.md) |
| IO expansion | Pluggable step that turns declared IO into extra attributes/uniforms and GLSL (basic declarations, `_active`, easing, textures) | `BaseIOExpansion`, `BasicIOExpansion`, `EasingIOExpansion` | [IO expansion](../shaders/io-expansion.md) |
| Shader transform | Raw-string pass over shader source (before and after processing), e.g. GLSL 1.0/3.0 compatibility | `BaseShaderTransform`, `Shaders30CompatibilityTransform` | [Shader processing](../shaders/shader-processing.md) |
| Shader module | Named GLSL snippet (+ optional uniforms) pulled in with `${import: id}`; registered globally | `ShaderModule.register`, `ShaderModuleUnit` | [Shader modules](../shaders/shader-modules.md) |
| Template variable | `${...}` placeholders the processor fills (`attributes`, `easingMethod`, `extend`, `extendHeader`, `T`) and `${out: name}` fragment outputs | `templateVars`, `shaderTemplate` | [Shader processing](../shaders/shader-processing.md) |
| Buffering strategy | How instance data reaches the GPU, chosen per layer from hardware limits | `LayerBufferType`, `Layer.getLayerBufferType` | [Buffer management overview](../buffers/overview.md) |
| Instancing | Hardware instancing: one copy of the model, per-instance attributes with a divisor (`INSTANCE_ATTRIBUTE`); `instancing: false` duplicates values per vertex instead (`VERTEX_ATTRIBUTE`) | `IShaderInputInstancing.instancing` | [Instance attribute strategies](../buffers/instance-attribute-strategies.md) |
| Packing | Fallback when attributes exceed `WebGLStat.MAX_VERTEX_ATTRIBUTES`: several attributes share vec4 blocks and are destructured in the shader (`*_PACKING` types) | `InstanceAttributePackingBufferManager` | [Vertex and uniform strategies](../buffers/vertex-and-uniform-strategies.md) |
| Uniform buffering | Last-resort strategy: instance data in a uniform `vec4` array (`instanceData`), many draw batches | `UniformBufferManager` | [Vertex and uniform strategies](../buffers/vertex-and-uniform-strategies.md) |
| Buffer manager / diff processor | Allocate buffer locations per instance / apply each diff to them | `BufferManagerBase`, `BaseDiffProcessor`, `InstanceDiffManager` | [Instance diffing](../buffers/instance-diffing.md) |
| Easing (auto easing) | GPU interpolation of an instance attribute from its current value to a new one; CPU twin in `cpu`, GLSL in `gpu` | `IAutoEasingMethod`, `AutoEasingMethod`, `AutoEasingLoopStyle` | [Easing and animation](../instances/easing-and-animation.md) |
| Easing control | Per-instance handle to override start/timing of one eased attribute | `Instance.getEasing`, `IEasingControl`, `IEasingProps` | [Easing and animation](../instances/easing-and-animation.md) |
| Stream changes | Layer prop that applies only N changes per frame | `ILayerProps.streamChanges`, `StreamChangeStrategy` | [Layer](../surface/layer.md) |
| Surface | Root object: GL context, renderer, resources, input, scenes; `draw` renders a frame | `Surface`, `ISurfaceOptions` | [Surface](../surface/surface.md) |
| Pipeline | Declarative `{ resources, scenes }` passed to `Surface.pipeline` and diffed | `IPipeline`, `ReactiveDiff` | [Surface](../surface/surface.md) |
| Scene (layer scene) | Keyed group of views and layers; its `container` is the GL `Scene` holding the layers' models | `LayerScene`, `ISceneOptions` | [Views and scenes](../surface/views-and-scenes.md) |
| GL scene / model / material | Low-level draw graph: `Scene` holds `Model`s = `Geometry` + `Material` | `Scene`, `Model`, `Geometry`, `Material` | [Scene, model and material](../gl/scene-model-material.md) |
| View | Renders a scene through a camera into a viewport and optional render targets; controls clearing and redraw policy | `View`, `IViewProps`, `ClearFlags`, `ViewDrawMode`, `createView` | [Views and scenes](../surface/views-and-scenes.md) |
| Camera | Projection + view matrices (perspective or orthographic); `Camera2D` adds 2D pan/scale | `Camera`, `CameraProjectionType`, `Camera2D` | [2D view and camera](../2d/view-and-camera.md), [3D view and projection](../3d/view-and-projection.md) |
| Projection | Coordinate conversions screen ↔ view ↔ world for a view (`View.projection`) | `BaseProjection`, `IProjection`, `Projection2D`, `Projection3D` | [Projection and geometry](../math/projection-and-geometry.md) |
| Viewport | View placement as an `AbsolutePosition` (left/right/top/bottom/width/height, number or `%` string) resolved to pixels | `getAbsolutePositionBounds`, `Bounds` | [Projection and geometry](../math/projection-and-geometry.md) |
| Output / render target | Fragment outputs are tagged with a `FragmentOutputType`; views map them to color-buffer or texture resources (MRT) | `FragmentOutputType`, `OutputFragmentShaderSource`, `RenderTarget` | [Color buffers](../resources/color-buffers.md) |
| Optimized output | Output type rendered only on frames that enable it (picking) | `ISurfaceOptions.optimizedOutputTargets`, `Surface.enableOptimizedOutput` | [Render loop](../surface/render-loop.md) |
| Picking | Finding the instance under the pointer by rendering uids as colors | `PickType`, `IPickInfo`, `LayerInteractionHandler` | [Picking](../interaction/picking.md) |
| Event manager | Receives normalized mouse/touch interactions; base of controllers | `EventManager`, `UserInputEventManager`, `SimpleEventHandler` | [Event management](../interaction/event-management.md) |
| Resource | Shared GPU asset requested by layers: atlas, font, texture, color buffer | `ResourceType`, `BaseResourceOptions`, `ResourceRouter` | [Resource management](../resources/resource-management.md) |
| Resource attribute | Instance attribute with `resource: { key, name }`; resolves to texture coords and injects a `sampler2D` | `IResourceInstanceAttribute`, `isResourceAttribute`, `Instance.resourceTrigger` | [Textures and atlases](../resources/textures-and-atlases.md) |
| Surface commands | Imperative GPU operations run inside the frame through a `CommandLayer` | `SurfaceCommands`, `CommandLayer` | [Surface commands](../surface/commands.md) |
| Transform / scene graph | Hierarchical 2D/3D transforms instances can attach to | `Transform`, `Transform2D`, `Instance3D`, `Instance2D` | [3D scene graph](../3d/scene-graph.md) |
| JSX surface | React components declaring surface, scenes, views, layers, resources | `SurfaceJSX`, `LayerJSX`, `ViewJSX`, `SceneJSX` | [React surface](../react/react-surface.md) |
| Frame metrics | Per-frame timing: `currentFrame`, `currentTime`, `frameDuration`, `previousTime` | `FrameMetrics`, `Surface.frameMetrics` | [Render loop](../surface/render-loop.md) |

## Shared types in types.ts

Grouped by concern; each is defined in `ui/src/types.ts`.

- **Value shapes:** `ShaderIOValue`, `InstanceIOValue`, `InstanceIOVectorValue`, `UniformIOValue`, `Color`/`ReadonlyColor` (Vec4), `EulerRotation`, `EulerOrder`, `Size`, `TypeVec`.
- **Sizes:** `InstanceAttributeSize` (1–4, `MAT4X4`, `ATLAS = 99`) with `instanceAttributeSizeFloatCount`; `UniformSize` (adds `MATRIX3`, `MATRIX4`, `FLOAT_ARRAY = 97`, `VEC4_ARRAY = 98`, `TEXTURE = 99`); `VertexAttributeSize`; `IndexBufferSize` (`UINT8`/`UINT16`/`UINT32`); `TextureSize` (powers of two `_2`…`_4096`, and negative `SCREEN*` values meaning a fraction of the canvas).
- **Shader IO:** `IInstanceAttribute` (+ `Internal`, `Vector`, `Resource`, `Easing`, `Value` variants and guards `isInstanceAttributeVector`, `isResourceAttribute`), `IVertexAttribute`, `IIndexBuffer`, `IUniform`, `IUniformInternal`, `IInstancingUniform`, `ShaderInjectionTarget` (`VERTEX`, `FRAGMENT`, `ALL`), `IShaderInputs`, `IShaderInputInstancing`, `IShaderInitialization`, `IShaderIOExtension`, `IShaderExtension`.
- **Shaders and outputs:** `IShadersSource`/`IShaders`, `OutputFragmentShaderSource`, `OutputFragmentShader` (per-view map), `OutputFragmentShaderTarget`, `FragmentOutputType` (`COLOR`, `DEPTH`, `NORMAL`, `PICKING`, `POSITION*`, `GLOW`, `BLUR`, ...), `ILayerMaterialOptions` + `createMaterialOptions`.
- **Instances and providers:** `InstanceDiff`, `InstanceDiffType`, `IInstanceProvider`, `StreamChangeStrategy`, `IEasingControl`, `IEasingProps`, `ILayerEasingManager`, `ILayerRef`, `UpdateProp`.
- **Buffering:** `LayerBufferType` (`UNIFORM = 1`, `INSTANCE_ATTRIBUTE`, `INSTANCE_ATTRIBUTE_PACKING`, `VERTEX_ATTRIBUTE`, `VERTEX_ATTRIBUTE_PACKING`), `InstanceBlockIndex`.
- **Picking:** `PickType` (`NONE`, `SINGLE`), `IPickInfo`, `IMousePickInfo`, `ITouchPickInfo`, `IPickingMetrics`, `ISinglePickingMetrics` (`uidToInstance`), `INonePickingMetrics`, `IColorPickingData`.
- **Surface and resources:** `IPipeline`, `SurfaceErrorType`/`SurfaceError`, `FrameMetrics`, `ResourceType`, `IResourceType`, `IResourceContext`, `IProjection`.
- **Identity and helpers:** `IdentifiableById`, `IdentifiableByKey`, `SimpleId`/`StringId`/`NumberId`, `Lookup`, `DeepPartial`, `Diff`, `Omit`, `MapValueType`, `NOOP`, `isString`/`isNumber`/`isFunction`/`isBoolean` (duck-typed, faster than `typeof`), whitespace/newline regexes (`isWhiteSpace`, `isNewline`).

## Extension points

- `FragmentOutputType` values are only matching keys between a layer's fragment outputs and a
  view's output targets; any number works, the enum is a convention. Add new semantics by using a
  new number on both sides.
- `ResourceType` covers the built-in managers; a custom resource manager registers with any other
  number through `ISurfaceOptions.resourceManagers`.
- When adding a shared type, put it in `ui/src/types.ts` only if more than one area uses it, and
  add the term here.

## Gotchas

- "Scene" means two things: `LayerScene` (views + layers, user-facing) and the GL `Scene` in
  `ui/src/gl/scene.ts` (models only, `LayerScene.container`).
- "Attribute" in `IInstanceAttribute` is a DeltaV declaration; the GL buffer object is
  `Attribute` in `ui/src/gl/attribute.ts`.
- `Instance.active` is not a user visibility toggle: the diff processors overwrite it on insert
  and removal. Remove the instance from its provider to hide it.
- Easing attribute names are mangled: `Instance.getEasing("center")` looks up `_center_end`.
- `LayerBufferType` starts at 1; `0` is not a valid strategy.
- `InstanceAttributeSize.ATLAS` and `UniformSize.TEXTURE` (99), `FLOAT_ARRAY` (97) and `VEC4_ARRAY` (98) are sentinel codes, not
  float counts; use `instanceAttributeSizeFloatCount` for real sizes.
- `TextureSize.SCREEN*` sizes are only honoured by managers that track the canvas size (the render
  texture manager).

## Related

- [Architecture](architecture.md) — how these pieces connect.
- [Instances](../instances/instances.md) — instance and observable details.
- [IO expansion](../shaders/io-expansion.md) — how shader IO turns into GLSL.
- [Layer](../surface/layer.md) and [Buffer management overview](../buffers/overview.md) — layer lifecycle and strategies.
