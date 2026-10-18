---
title: Instance attribute strategies
summary: Instanced attribute buffering, plain and packed: registration, buffer layout, growth, slot reuse and partial/full GPU updates.
covers:
  - ui/src/surface/buffer-management/instance-attribute-buffering
  - ui/src/surface/buffer-management/instance-attribute-packed-buffering
related:
  - buffers/overview.md
  - buffers/vertex-and-uniform-strategies.md
  - buffers/instance-diffing.md
  - instances/instances.md
status: complete
verified-at: 8f06ee61
---

## Purpose

`INSTANCE_ATTRIBUTE` (the default) and `INSTANCE_ATTRIBUTE_PACKING` store one value per instance
in instanced vertex attributes (divisor 1), so the shared mesh is drawn once with
`drawInstances`. The packed variant crams several attributes into vec4-sized `block<N>`
attributes when the unpacked layout exceeds `MAX_VERTEX_ATTRIBS`. Both use
`InstanceAttributeDiffProcessor`.

## Key files

- `ui/src/surface/buffer-management/instance-attribute-buffering/instance-attribute-buffer-manager.ts` — `InstanceAttributeBufferManager`, `IInstanceAttributeBufferLocation`, `IInstanceAttributeBufferLocationGroup`, `isInstanceAttributeBufferLocation`, `isInstanceAttributeBufferLocationGroup`.
- `ui/src/surface/buffer-management/instance-attribute-buffering/instance-attribute-diff-processor.ts` — `InstanceAttributeDiffProcessor` (also used by the packed manager).
- `ui/src/surface/buffer-management/instance-attribute-packed-buffering/instance-attribute-packing-buffer-manager.ts` — `InstanceAttributePackingBufferManager`, `IInstanceAttributePackingBufferLocation(Group)`.
- `ui/src/shaders/processing/pack-attributes.ts` — `packAttributes`, assigns `block` / `blockIndex` used by the packed layout.

## How it works

### Registration (first add)

`add` starts as `doAddWithRegistration`. On the first instance it:

1. Turns on `ObservableMonitoring.setObservableMonitor(true)` and calls every non-child
   instance attribute's `update(instance)`, recording which `@observable` property UIDs each
   read. Only the **last** UID read is kept per attribute (`attributeToPropertyIds`); the
   `_active` attribute's first UID becomes `activePropertyId`.
2. Turns monitoring off, builds `updateAllPropertyIdList` (deduped UIDs, falsy removed).
3. Calls `resizeBuffer()` then `gatherLocationsIntoGroups()`, swaps `add` to `doAdd`, and adds.

### Layout and growth: `resizeBuffer`

- Growth is computed once per change list from `changeListContext`:
  `shaderIOInfo.baseBufferGrowthRate` (default 1000) + one per `INSERT`/`CHANGE` diff whose
  instance has no location yet. Without a context the growth is 0.
- First call: growth is raised to `props.bufferManagement.optimize.expectedInstanceCount` if
  larger; a `Geometry` is created holding the layer's shared vertex attributes and index buffer.
  - Plain: one `Attribute(Float32Array, size, dynamic=true, instanced=true)` per instance
    attribute, resized to `maxInstancedCount` (starts at 0).
  - Packed: per block, `blockSize = max(blockIndex + size)` of its members; one
    `Attribute` named `block<N>` of `blockSize` floats per instance. `maxInstancedCount`
    starts at **1000**, so the first allocation is `1000 + growth`.
- Later calls: `geometry.rebuild()` (drops the GL-side geometry), `maxInstancedCount += growth`
  and `Attribute.resize(newCount, previousCount)` for every buffer still too small; with
  `optimize.bufferDoubling` the backing array is sized `2 × maxInstancedCount`.
- New `IBufferLocation`s are created for indices `[previous, max)`: plain
  `start = i * size`; packed `start = i * blockSize + blockIndex`, `end = start + size`.
  `location.buffer` is the `Attribute` object, so `resize` replacing `Attribute.data` is seen
  by every existing location without a loop.
- The model is regenerated (`generateLayerModel`) and re-added to `scene.container` on every
  resize; the material is created once (`makeLayerMaterial`) and its global uniforms are pushed
  into each `IUniformInternal.materialUniforms`.

### Slot groups and reuse

`gatherLocationsIntoGroups(newLocations, growth)` builds `growth` groups. Each group has the
`instanceIndex` and `propertyToBufferLocation[propertyUID] = location` for each attribute;
child attributes (easing helpers with `parentAttribute`) are attached as
`location.childLocations` of their parent. Groups go into `availableLocations`.

`doAdd` takes `availableLocations[++currentAvailableLocation]` (resizing first if exhausted),
records it in `instanceToBufferLocation[instance.uid]`, and sets
`geometry.maxInstancedCount = model.drawInstances = max(current, instanceIndex + 1)` and
`model.vertexDrawRange = [0, indexBuffer.indexCount || instanceVertexCount]` (when
`instanceVertexCount === 0` the range end is the instance count, for vertex-less layers).
`remove` deletes the mapping and pushes the group back onto `availableLocations`.
`changesProcessed()` splices consumed groups off the front once per frame instead of shifting
per add.

### Writing values: `InstanceAttributeDiffProcessor`

- `addInstance`: no location → `bufferManager.add`, `instance.active = true`, `layer.onDiffAdd`,
  full write. Existing location → treated as change with no prop ids (full write).
- `changeInstance`: location → `updateInstance(propIds)`; none → `addInstance`.
- `removeInstance`: `instance.active = false`, `layer.onDiffRemove`, write `_active` only,
  then `bufferManager.remove`. The slot keeps its stale data; `_active = 0` hides it.
- `updateInstance` (active): if `propIds` is empty or `instance.reactivate` is set, use
  `getUpdateAllPropertyIdList()`. For each id, look up the location, call
  `attribute.update(instance)` and copy into `buffer.data[start..end)` with a plain loop
  (faster than `TypedArray.set` for small copies), then the same for `childLocations`.
  Inactive instance: write only the location of `getActiveAttributePropertyId()`.
  Ends with `instance.reactivate = false`.
- Mode, chosen in `incomingChangeList`: `FULL` when `changes.length > 0.7 × getInstanceCount()`,
  else `PARTIAL`. `updateInstancePartial` tracks a `[attribute, minStart, maxEnd]` range per
  `packUID || uid` (one range per packed block); `updateInstanceFull` only marks the attribute.
- `commit()`: PARTIAL sets `bufferAttribute.updateRange = { offset: min, count: max - min }`;
  FULL sets `{ offset: 0, count: -1 }` (whole buffer). The GL proxy uploads on next render.

## Extension points

- Per layer: `initShader()` returns `baseBufferGrowthRate` (0 = tight, for single huge models).
- Per instance of a layer: `props.bufferManagement.optimize.expectedInstanceCount` (presize) and
  `.bufferDoubling` (fewer reallocations, more memory).
- Easing and other expanders add child attributes; they are written automatically when their
  parent's property changes.

## Gotchas

- An attribute is keyed by the **last** observable its `update` reads. Reading several
  observables means changes to the earlier ones do not refresh it (a `debug` message says so).
- `propertyToBufferLocation` holds one location per property UID: if two attributes' last-read
  property is the same, only the later attribute is written on change or add. An attribute
  reading no observable has no UID and is never written. Give each attribute its own observable.
- Registration runs with the first instance added; observables an attribute reads only
  conditionally may be missed.
- `maxInstancedCount` (capacity) ≠ `currentInstancedCount` (draw count). Removed slots are
  reused but the draw count never shrinks; holes are hidden by `_active`.
- Packed manager: the first allocation is `1000 + growth` slots but only `growth` groups are
  created, so those extra slots are never assigned and later instances get higher indices;
  they still count toward `drawInstances` (drawn inactive with zeroed data).
- Every resize rebuilds the geometry and model and re-uploads full buffers: size up front with
  `expectedInstanceCount` for large or bursty data.
- Diff handlers are called detached (`processing[type](processor, …)`), so they use the
  `manager` argument, not `this`.

## Related

- [Buffer management overview](overview.md) — selection rules and base classes.
- [Vertex and uniform strategies](vertex-and-uniform-strategies.md) — non-instanced variants.
- [Instance diffing](instance-diffing.md) — where the change list comes from.
- [Instances](../instances/instances.md) — `@observable`, `active`, `changes`.
