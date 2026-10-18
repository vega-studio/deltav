---
title: Buffer management overview
summary: The buffer manager and diff processor base classes, the five buffering strategies, and the rules a layer uses to pick one.
covers:
  - ui/src/surface/buffer-management/buffer-manager-base.ts
  - ui/src/surface/buffer-management/base-diff-processor.ts
  - ui/src/surface/buffer-management/index.ts
related:
  - buffers/instance-attribute-strategies.md
  - buffers/vertex-and-uniform-strategies.md
  - buffers/instance-diffing.md
  - surface/layer.md
  - shaders/io-expansion.md
status: complete
verified-at: 8f06ee61
---

## Purpose

Buffer management is the glue between `Instance` objects and GPU memory. Every `Layer` owns
exactly one buffer manager (where an instance's values live in GPU-bound arrays) and one diff
processor (how an add/change/remove is written into those arrays). Five strategies exist because
hardware differs in instancing support and vertex-attribute count; the layer picks one once, at
shader-initialization time, and can never change it.

## Key files

- `ui/src/surface/buffer-management/buffer-manager-base.ts` — `BufferManagerBase`, `IBufferLocation`, `IBufferLocationGroup`, `isBufferLocation`, `isBufferLocationGroup`.
- `ui/src/surface/buffer-management/base-diff-processor.ts` — `BaseDiffProcessor` (abstract add/change/remove/commit/incomingChangeList).
- `ui/src/surface/buffer-management/instance-diff-manager.ts` — `InstanceDiffManager`, picks the processor class from `layer.bufferType` (see [Instance diffing](instance-diffing.md)).
- `ui/src/surface/buffer-management/index.ts` — re-exports the base plus the instance-attribute, instance-attribute-packing and uniform managers (the vertex managers are imported by path in `layer.ts`).
- `ui/src/types.ts` — `LayerBufferType` enum, `IShaderInputInstancing` (`instancing`, `baseBufferGrowthRate`).
- `ui/src/surface/layer.ts` — `Layer.getLayerBufferType`, `Layer.makeLayerBufferManager`, `Layer.setBufferManager`, `Layer.draw`, `ILayerProps.bufferManagement`.

## How it works

### Strategy comparison

| `LayerBufferType` | Manager / processor | GPU layout | Draw | When chosen |
|---|---|---|---|---|
| `INSTANCE_ATTRIBUTE` (2) | `InstanceAttributeBufferManager` / `InstanceAttributeDiffProcessor` | One instanced `Attribute` per instance attribute, `size` floats per instance | 1 instanced draw call | Default: instancing available, attributes fit, `instancing !== false` |
| `INSTANCE_ATTRIBUTE_PACKING` (3) | `InstanceAttributePackingBufferManager` / `InstanceAttributeDiffProcessor` | Attributes packed into vec4 `block<N>` instanced attributes | 1 instanced draw call | Too many attributes unpacked, fit once packed |
| `VERTEX_ATTRIBUTE` (4) | `VertexAttributeBufferManager` / `VertexAttributeDiffProcessor` | Non-instanced; every value repeated per vertex; vertex and index buffers replicated per instance | 1 plain draw call | `instancing === false`, attributes fit |
| `VERTEX_ATTRIBUTE_PACKING` (5) | `VertexAttributePackingBufferManager` / `VertexAttributeDiffProcessor` | Packed `block<N>` attributes | 1 draw call | `instancing === false`, fit only once packed |
| `UNIFORM` (1) | `UniformBufferManager` / `UniformDiffProcessor` | `instanceData` vec4 uniform array per material, `maxInstancesPerBuffer` instances each | 1 draw call per buffer | No hardware instancing, or attributes do not fit even packed |

Details per strategy: [Instance attribute strategies](instance-attribute-strategies.md),
[Vertex and uniform strategies](vertex-and-uniform-strategies.md).

### Selection: `Layer.getLayerBufferType`

Called first from `injectShaderIO` (`ui/src/shaders/processing/inject-shader-io.ts`), right after
`packAttributes` assigns every instance attribute a `block`/`blockIndex`, and before the shader
text is generated — the shader IO expanders (`BasicIOExpansion`) branch on `layer.bufferType`.
The result is stored once with `Layer.setBufferType`; later calls return the cached value.

1. Start with `UNIFORM`. If `WebGLStat.HARDWARE_INSTANCING` is false (WebGL1 without
   `ANGLE_instanced_arrays`), stay on `UNIFORM`. WebGL2 always sets it true.
2. Count attribute slots: `ceil(size / 4)` per vertex attribute plus
   `ceil(instanceAttributeSizeFloatCount[size] / 4)` per instance attribute.
3. If the count is `<= WebGLStat.MAX_VERTEX_ATTRIBUTES` (`gl.MAX_VERTEX_ATTRIBS`):
   `VERTEX_ATTRIBUTE` when `shaderIO.instancing === false`, else `INSTANCE_ATTRIBUTE`.
4. Otherwise recount as "highest `attribute.block` among instance attributes + vertex slots". If
   that is `< MAX_VERTEX_ATTRIBUTES`: `VERTEX_ATTRIBUTE_PACKING` or `INSTANCE_ATTRIBUTE_PACKING`
   (same `instancing` test); a `debug("performance")` "Moderate" message is logged.
5. Else `UNIFORM`, with a "High" performance debug message.

`shaderIO.instancing` comes from the layer's `initShader()` return (`IShaderInputInstancing`,
default `true`). Layers that want to expose the choice pass it through from
`props.bufferManagement.instancing` (e.g. `CircleLayer`); the prop is only a suggestion.

### Construction: `Layer.makeLayerBufferManager`

Called from `Layer.init` after shader processing. It re-reads the cached type, constructs
the matching manager with `(layer, scene)` and hands it to `Layer.setBufferManager`, which also
creates `layer.diffManager = new InstanceDiffManager()` and calls `makeProcessor`. A second
`setBufferManager`/`setBufferType` only logs a warning.

### `BufferManagerBase` contract

- `add(instance)` / `remove(instance)` — instance properties (not methods), so a manager can swap
  the implementation at runtime (attribute managers start with a registration add). `add`
  returns an `IBufferLocation` or `IBufferLocationGroup`.
- `getBufferLocations(instance)`, `managesInstance(instance)`, `getInstanceCount()`.
- `getActiveAttributePropertyId()` — property id driving the injected `_active` attribute;
  used to write only `_active` when an instance is deactivated.
- `getUpdateAllPropertyIdList()` — smallest set of observable property ids that touches every
  attribute; used for full writes on add/reactivate.
- `incomingChangeList(changes)` stores `changeListContext` so a resize can be sized for the whole
  frame; `changesProcessed()` deletes it (subclasses also compact their free lists here).
- `makeLayerMaterial()` — default material via `generateLayerMaterial` from `layer.shaderIOInfo`.
- `destroy()`, `removeFromScene()`.

`IBufferLocation` = `{ attribute, buffer: { data }, instanceIndex, start, end, block?, childLocations? }`;
`start`/`end` index into `buffer.data`. `buffer` is an object holding `data` so a resized array
can be swapped for every location at once (the attribute managers pass the `Attribute` itself).
An `IBufferLocationGroup` is `{ instanceIndex, propertyToBufferLocation }`, keyed by observable
property UID.

### `BaseDiffProcessor` contract

Holds `layer` (an `IInstanceDiffManagerTarget`) and `bufferManager`. Abstract members:
`addInstance`, `changeInstance`, `removeInstance` (all `(manager, instance, propIds, bufferLocation?)`),
`commit()` (finalize GPU update ranges) and `incomingChangeList(changes)` (pick an update mode).

### Per-frame flow

`Surface` calls `Layer.draw()` for each layer of each view. `draw` pulls the change list,
then: `processor.incomingChangeList` → `bufferManager.incomingChangeList` → for each diff
`processing[diffType](processor, instance, Object.values(changes), bufferManager.getBufferLocations(instance))`
and `instance.changes = {}` → `processor.commit()` → `bufferManager.changesProcessed()`. See
[Instance diffing](instance-diffing.md).

## Extension points

- Layer authors influence the strategy through `initShader()`'s `instancing` and
  `baseBufferGrowthRate`, and users through `props.bufferManagement`
  (`instancing`, `baseBufferGrowthRate` where the layer forwards them, and
  `optimize.bufferDoubling` / `optimize.expectedInstanceCount`, read by the instanced managers).
- A new strategy needs: a `LayerBufferType` member, a `BufferManagerBase` subclass, a
  `BaseDiffProcessor` subclass, a branch in `Layer.getLayerBufferType`, `Layer.makeLayerBufferManager`
  and `InstanceDiffManager.makeProcessor`, plus shader IO generation in
  `ui/src/surface/layer-processing/base-io-expanders/basic-io-expansion.ts` (attribute declarations
  and destructuring switch on `layer.bufferType`).

## Gotchas

- The strategy is decided once per layer, before shaders are generated, and cannot change —
  changing `bufferManagement.instancing` on a live layer has no effect.
- `layer.bufferType` returns `INSTANCE_ATTRIBUTE` until `setBufferType` runs.
- The packing fit test compares the highest block *index* (not count) plus vertex slots with
  strict `<`; treat the boundary as approximate.
- `UNIFORM` is the fallback but its shader side is commented out in `BasicIOExpansion`
  ("Uniform buffering currently out of service"), so a layer that lands on it does not render
  instances correctly; see [Vertex and uniform strategies](vertex-and-uniform-strategies.md).
- Hardware-limit decisions use `WebGLStat`, which is filled from the first GL context created.

## Related

- [Instance attribute strategies](instance-attribute-strategies.md) — the default instanced managers.
- [Vertex and uniform strategies](vertex-and-uniform-strategies.md) — non-instanced and uniform fallbacks.
- [Instance diffing](instance-diffing.md) — how change lists reach the processor.
- [Layer](../surface/layer.md) — layer lifecycle that owns the manager.
- [IO expansion](../shaders/io-expansion.md) — shader code generated per buffer type.
