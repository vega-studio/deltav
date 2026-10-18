---
title: Vertex and uniform strategies
summary: Non-instanced vertex attribute buffering, vertex attribute packing and the uniform-array fallback: layout, growth, diffs and current limitations.
covers:
  - ui/src/surface/buffer-management/vertex-attribute-buffering
  - ui/src/surface/buffer-management/vertex-attribute-packing-buffering
  - ui/src/surface/buffer-management/uniform-buffering
related:
  - buffers/overview.md
  - buffers/instance-attribute-strategies.md
  - buffers/instance-diffing.md
status: complete
verified-at: 8f06ee61
---

## Purpose

These strategies cover layers that opt out of hardware instancing (`instancing: false` in
`initShader()`) and hardware that cannot instance or fit the attributes.
`VERTEX_ATTRIBUTE` copies every per-instance value onto every vertex of the instance, trading
memory and update cost for plain, non-instanced draws. `VERTEX_ATTRIBUTE_PACKING` is its packed
variant. `UNIFORM` is the last-resort fallback that stores instance data in a vec4 uniform array.

## Key files

- `ui/src/surface/buffer-management/vertex-attribute-buffering/vertex-attribute-buffer-manager.ts` — `VertexAttributeBufferManager`, `IVertexAttributeBufferLocation(Group)`, `isVertexAttributeBufferLocation(Group)`.
- `ui/src/surface/buffer-management/vertex-attribute-buffering/vertex-attribute-diff-processor.ts` — `VertexAttributeDiffProcessor` (used by both vertex strategies).
- `ui/src/surface/buffer-management/vertex-attribute-packing-buffering/vertex-attribute-packing-buffer-manager.ts` — `VertexAttributePackingBufferManager`.
- `ui/src/surface/buffer-management/uniform-buffering/uniform-buffer-manager.ts` — `UniformBufferManager`, `IUniformBufferLocation`, `InstanceUniformBuffer`, `isUniformBufferLocation`.
- `ui/src/surface/buffer-management/uniform-buffering/uniform-diff-processor.ts` — `UniformDiffProcessor`.
- `ui/src/gl/attribute.ts` / `ui/src/gl/index-buffer.ts` — `Attribute.repeatInstances`, `IndexBuffer.repeatInstances` used to replicate the mesh.

## How it works

### `VERTEX_ATTRIBUTE` — `VertexAttributeBufferManager`

Follows the instance-attribute manager's pattern exactly (registration add, `availableLocations`
groups, `currentAvailableLocation` cursor, `changesProcessed` splice — see
[Instance attribute strategies](instance-attribute-strategies.md)), with these differences:

- Buffer locations are generated in **instance units** (`start = i * size`); the diff processor
  multiplies by `instanceVertexCount` when writing. Location `buffer` is a separate
  `{ data }` object per location, so after a resize every location's `buffer.data` is
  reassigned in a loop (`allBufferLocations`).
- Instance attributes are `Attribute(data, size, dynamic=true, instanced=false)` sized
  `maxInstancedCount × instanceVertexCount`.
- The layer's shared vertex attributes (`shaderIOInfo.vertexAttributes[].materialAttribute`)
  are themselves resized to `vertexCount × maxInstancedCount`, made dynamic and filled with
  `repeatInstances` copies of instance 0's vertices. The index buffer is resized and
  `repeatInstances` offsets each copy's indices to its instance's vertices.
- `doAdd` sets `vertexDrawRange = [0, instanceVertexCount × currentInstancedCount]`.
- Growth: `baseBufferGrowthRate` + unmanaged INSERT/CHANGE diffs, like the instanced managers,
  but `optimize.expectedInstanceCount` and `optimize.bufferDoubling` are **not** read.

### `VertexAttributeDiffProcessor`

Same add/change/remove/reactivate logic and the same PARTIAL/FULL switch (`> 0.7 ×
getInstanceCount()` changes → FULL) as `InstanceAttributeDiffProcessor`. Writing differs: for
a location, the range `[start × vertexCount, end × vertexCount)` is filled by repeating the
`attribute.size` values once per vertex, and update ranges are tracked in those vertex-scaled
float offsets. `commit()` applies `updateRange` the same way.

### `VERTEX_ATTRIBUTE_PACKING` — `VertexAttributePackingBufferManager`

Structurally a copy of the instanced packing manager: `block<N>` attributes of `blockSize`
floats per instance, created with `instanced=true`, `maxInstancedCount` starting at 1000,
`vertexDrawRange = [0, instanceVertexCount]` and `drawInstances` set — i.e. it draws instanced,
does not replicate vertex or index data, and ignores `optimize.*`. On resize it destroys and
recreates the `Geometry` and reallocates each block buffer at twice the needed size
("sneaky" built-in doubling) whenever it is too small. It is paired with
`VertexAttributeDiffProcessor`, whose vertex-scaled offsets do not match this per-instance
packed layout (see Gotchas).

### `UNIFORM` — `UniformBufferManager`

- Constructor: `uniformBlocksPerInstance = max(attribute.block) + 1`.
- `makeNewBuffer()` creates a `Geometry` with the shared vertex attributes, a material
  (`makeLayerMaterial`) and a model with `vertexDrawRange = [0, maxInstancesPerBuffer ×
  instanceVertexCount]`. It reads the material uniform named `uniformBufferInstanceBufferName`
  (`"instanceData"`, `ui/src/constants.ts`), gives it fresh `Vec4`s, and slices it into
  `shaderIOInfo.maxInstancesPerBuffer` clusters (`IUniformBufferLocation`,
  `start..end` = `uniformBlocksPerInstance` vec4s each). Each buffer is one model (one draw call)
  added to the scene.
- `add` pops a free cluster (creating a new buffer when none), `remove` returns it.
- The `instancing` shader module adds a per-vertex `instance` attribute only for this strategy so
  the vertex shader can index its cluster.
- `UniformDiffProcessor.updateInstance` writes **every** instance attribute on every change
  (`propIds` ignored) into `instanceData[start + block][blockIndex…]`; inactive instances write
  only `_active`. `commit` and `incomingChangeList` are no-ops; `getInstanceCount()` returns -1,
  `getUpdateAllPropertyIdList()` returns `[]`, `getActiveAttributePropertyId()` returns -1.

## Extension points

- Opt a layer into vertex buffering by returning `instancing: false` from `initShader()`
  (optionally forwarding `props.bufferManagement.instancing`). Useful for small-vertex-count,
  mostly static data; avoid for frequently updated instances.
- `baseBufferGrowthRate` applies to both vertex managers.

## Gotchas

- `VERTEX_ATTRIBUTE` memory and write cost scale with `instanceVertexCount`: every property
  change rewrites `size × vertexCount` floats, and every resize re-replicates the mesh.
- `VERTEX_ATTRIBUTE` mutates the layer's shared `shaderIOInfo` vertex attribute and index
  buffer objects in place (resize + repeat).
- `VERTEX_ATTRIBUTE_PACKING` appears inconsistent: the manager lays data out per instance and
  draws instanced, but `VertexAttributeDiffProcessor` writes at `start × instanceVertexCount`.
  It is only selected for `instancing: false` layers that overflow `MAX_VERTEX_ATTRIBS`; prefer
  to keep such layers within the attribute limit.
- `UNIFORM` is currently non-functional: the `instanceData` uniform declaration and
  destructuring in `BasicIOExpansion` are commented out, so `makeNewBuffer` finds no
  `instanceData` uniform, warns and creates no clusters.
- `UniformBufferManager.managesInstance` returns `true` when the instance has **no** cluster
  (`=== undefined`), the opposite of the other managers.

## Related

- [Buffer management overview](overview.md) — when each strategy is selected.
- [Instance attribute strategies](instance-attribute-strategies.md) — the shared registration/slot pattern.
- [Instance diffing](instance-diffing.md) — the per-frame change pipeline.
