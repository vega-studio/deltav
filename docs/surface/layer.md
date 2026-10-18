---
title: Layer
summary: The Layer base class and createLayer: how a layer binds an instance provider to a shader and a buffer strategy, its props, lifecycle and rebuilds.
covers:
  - ui/src/surface/layer.ts
  - ui/src/util/create-layer.ts
related:
  - surface/surface.md
  - surface/render-loop.md
  - surface/views-and-scenes.md
  - instances/instance-providers.md
  - shaders/authoring-a-layer.md
  - shaders/shader-processing.md
  - buffers/overview.md
  - buffers/instance-diffing.md
  - interaction/picking.md
status: complete
verified-at: 6d7b2744
---

## Purpose

A `Layer` turns a stream of `Instance` changes into GPU draws. It declares its shader IO
(`initShader`), the system compiles that into per-view shaders, picks a buffer strategy that
fits the hardware, and every frame `Layer.draw` pushes the instance provider's changes into GPU
buffers and refreshes uniforms. All concrete layers (`CircleLayer`, `EdgeLayer`, `GlyphLayer`,
`CommandLayer`, …) subclass it; applications never construct one directly — they declare it with
`createLayer` inside a scene, and the scene builds it.

## Key files

- `ui/src/surface/layer.ts` — `Layer`, `ILayerProps`, `ILayerPropsInternal`,
  `ILayerShaderIOInfo`, `LayerInitializer`, `ILayerConstructable`, `ILayerConstructionClass`.
- `ui/src/util/create-layer.ts` — `createLayer`, `createChildLayer`.
- `ui/src/surface/layer-scene.ts` — `LayerScene.layerDiffs`, which constructs, updates, rebuilds
  and destroys layers.
- `ui/src/types.ts` — `IShaderInitialization`, `LayerBufferType`, `PickType`,
  `StreamChangeStrategy`, `ILayerMaterialOptions`, `ILayerRef`.
- `ui/src/surface/buffer-management/` — the five buffer managers a layer can pick.
- `ui/src/surface/layer-interaction-handler.ts` — `LayerInteractionHandler` (`layer.interactions`).
- `ui/src/2d/layers/circles/circle-layer.ts` — a compact real layer to copy from.

## How it works

### Declaring a layer

```ts
createLayer(CircleLayer, { key: "dots", data: provider, picking: PickType.SINGLE })
```

`createLayer(LayerClass, props)` returns a `LayerInitializer` `{ key, init: [LayerClass, props] }`;
missing `key`/`data` are filled from `LayerClass.defaultProps`. `createChildLayer` does the same
but types the result as a base `LayerInitializer<Instance, ILayerProps<Instance>>` for
`childLayers()`. Initializers go into `ISceneOptions.layers`; the scene's `ReactiveDiff` keys them
by `key`.

### Props (`ILayerProps`)

- `key`, `data` (an `IInstanceProvider`) — required.
- `picking?: PickType` — `SINGLE` enables color picking and the `onMouse*` / `onTouch*` / `onTap`
  callbacks; `NONE` (default) disables them.
- `streamChanges?: { count?, strategy? }` — commit at most `count` (default 10000; `<= 0` = all)
  changes per frame, `StreamChangeStrategy.LINEAR`.
- `bufferManagement?` — `IShaderInputInstancing` plus `optimize: { bufferDoubling,
  expectedInstanceCount }`; a hint layers may honour.
- `fs?` — fragment source overrides/additions per output type; `mapOutput?` — remap the layer's
  fragment output types (map to `FragmentOutputType.NONE` to drop one).
- `materialOptions?`, `baseShaderModules?(shaderIO, modules)`, `printShader?` (logs generated
  shaders), `ref?: ILayerRef` (receives the easing manager).

### Construction and `init(views)`

`LayerScene` calls `new LayerClass(surface, scene, { ...defaultProps, ...props })`, sets
`layer.initializer`, `props.data.sync()`, wires `parent`/`children`, then `layer.init(scene.views)`.
`init` returns `true` on success; `false` makes the scene drop the layer with a warning. Steps:

1. Set `this.picking` from `props.picking`; `this.resource = surface.resourceManager`.
2. `shaderIO = this.initShader()`; create `this.interactions`. `null` → a *shell layer*
   (`picking.type = NONE`, nothing rendered, `init` returns `true`). Missing `vs`/`fs` → `false`.
3. Raw shader transforms: each `BaseShaderTransform.rawVertex` / `rawFragment`.
4. `cleanShaderIOElements` (drops `null` attributes/uniforms), `checkForDuplicateOutputTypes`
   (applies `mapOutput`; duplicates → `false`).
5. `processFragmentShadersForEachView` — applies `props.fs`, auto-injects the picking fragment
   output when `picking === SINGLE` (throws if the layer declares its own `PICKING` output too),
   and builds one output fragment shader per view, matched to `view.getOutputTargets()` via
   `ShaderProcessor.makeOutputFragmentShader`.
6. `processLayerShaders` — `new ShaderProcessor().process(...)` with the surface's IO expanders,
   transforms and sorting; fills `layer.shaderIOInfo` (`vs`, `fs` map per view, attributes,
   uniforms, `maxInstancesPerBuffer`, `instancing` default `true`, `baseBufferGrowthRate` default
   1000, `drawMode` default `TRIANGLE_STRIP`). See
   [Shader processing](../shaders/shader-processing.md).
7. `processVertexAttributes` → `generateLayerGeometry`.
8. `makeLayerBufferManager` — chooses the strategy (below) and calls `setBufferManager`, which
   also creates the `InstanceDiffManager` and its processor.
9. `updateDiffHandlers` — installs `onDiffAdd`/`onDiffRemove` for picking (`uidToInstance`) and/or
   easing (`instance.easingId`).
10. `props.ref.easing = easingManager`; `props.data.sync()`.

### Buffer strategy (`getLayerBufferType`)

Computed once per layer. With `WebGLStat.HARDWARE_INSTANCING`: count vertex-attribute slots
(`ceil(size / 4)` per vertex and instance attribute). If within `WebGLStat.MAX_VERTEX_ATTRIBUTES`
→ `INSTANCE_ATTRIBUTE` (or `VERTEX_ATTRIBUTE` when `shaderIO.instancing === false`). Otherwise
retry counting packed blocks (`attribute.block`) → `INSTANCE_ATTRIBUTE_PACKING` /
`VERTEX_ATTRIBUTE_PACKING`. Anything else → `UNIFORM`. The managers are
`InstanceAttributeBufferManager`, `InstanceAttributePackingBufferManager`,
`VertexAttributeBufferManager`, `VertexAttributePackingBufferManager`, `UniformBufferManager`;
see [Buffers overview](../buffers/overview.md). Fallbacks log through the `debug("performance")`
channel.

### Per frame: `Layer.draw()`

Called by `Surface.commit` once per drawn view, after `layer.view` is set:
`updateStreamLock` → `getChangeList` (whole `props.data.changeList` then `data.resolve(id)`, or the
next slice of the current stream) → `processor.incomingChangeList` and
`bufferManager.incomingChangeList` → for each change `diffManager.processing[changeType](processor,
instance, changedPropIds, bufferLocations)` and `instance.changes = {}` → `processor.commit()` →
`bufferManager.changesProcessed()` → `updateEasingManager` (re-arms
`easingManager.complete()` for `animationEndTime`) → `updateUniforms` (each uniform's
`update(uniform)` written to every material uniform).

### Updates, rebuilds, destruction

- Re-diffing the scene with the same key: `willUpdateProps(newProps)` → a new `data` provider is
  `sync()`ed → `shouldDrawView(old, new)` (shallow compare) sets `needsViewDrawn` →
  `Object.assign(layer.props, newProps)` → `didUpdateProps()` → `childLayers()` inlined.
- `rebuildLayer()` sets `willRebuildLayer` (recursively on `children`); on the next scene update
  the `ReactiveDiff` destroys and re-creates the layer (new shaders, buffers, strategy). A change of
  `picking` triggers it automatically in `willUpdateProps`.
- `destroy()` removes the model from the scene and destroys the buffer manager.

## Extension points

- Subclass `Layer<TInstance, TProps>`; set `static defaultProps` (needs `key` and `data`);
  implement `initShader()` returning `IShaderInitialization` (`vs`, `fs`, `vertexAttributes`,
  `instanceAttributes`, `uniforms`, `vertexCount`, optional `indexBuffer`, `drawMode`,
  `instancing`, `baseBufferGrowthRate`) or `null` for a shell layer. Details:
  [Authoring a layer](../shaders/authoring-a-layer.md).
- `childLayers()` — return `createChildLayer(...)` initializers to compose layers; they are
  inlined right after the parent.
- `getMaterialOptions()`, `props.materialOptions` — GL material settings.
- `baseShaderModules(shaderIO)` — modules imported by default (`instancing`, `picking` when
  picking is on, `frame` when an attribute has easing).
- `willUpdateProps`, `didUpdateProps`, `shouldDrawView(oldProps, newProps)`.
- `draw()` override — call `super.draw()`, or consume changes yourself with
  `resolveChanges(preserveProvider?)`.
- `managesInstance(instance)` — override for layers that do not own buffer space.
- `onDiffAdd` / `onDiffRemove` — per-instance hooks; `updateDiffHandlers` overwrites them when
  picking or easing is active.

## Gotchas

- The buffer strategy and buffer manager can be set only once per layer instance
  (`setBufferType`/`setBufferManager` warn otherwise); changing IO needs `rebuildLayer()`.
- `onDiffAdd`/`onDiffRemove` run per instance in the hottest path: assignments only.
- Declaring `picking: PickType.SINGLE` **and** a `PICKING` fragment output throws during `init`.
- `layer.view` changes during a frame (one value per view being drawn); do not cache it.
- Two fragment outputs resolving to the same output type (after `mapOutput`) fail `init`.
- With `streamChanges`, the first frame of a stream commits nothing, and later provider changes
  wait until the current stream is fully committed.
- The constructor merges `Layer.defaultProps` (the base class's), not the subclass's; the
  subclass defaults come from `LayerScene` / `createLayer` merging `LayerClass.defaultProps`.
  Constructing a layer by hand skips them.
- `willUpdateProps` assigns the easing manager to the *old* `props.ref` when `ref` changes;
  `init` is what sets it on the initial ref.
- `getInstanceObservableIds` toggles global observable monitoring; keep it out of loops.

## Related

- [Authoring a layer](../shaders/authoring-a-layer.md) — writing `initShader`.
- [Shader processing](../shaders/shader-processing.md) — what `ShaderProcessor.process` produces.
- [Buffers overview](../buffers/overview.md) — the five strategies.
- [Instance diffing](../buffers/instance-diffing.md) — `InstanceDiffManager` and processors.
- [Instance providers](../instances/instance-providers.md) — `props.data`, change lists, `sync`.
- [Picking](../interaction/picking.md) — `PickType.SINGLE` end to end.
- [Render loop](render-loop.md) — when `draw()` runs.
