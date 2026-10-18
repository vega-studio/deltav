---
title: Instance diffing
summary: How InstanceProvider change lists become buffer writes each frame: InstanceDiff tuples, InstanceDiffManager dispatch, streaming and the onDiffAdd/onDiffRemove hooks.
covers:
  - ui/src/surface/buffer-management/instance-diff-manager.ts
related:
  - buffers/overview.md
  - instances/instance-providers.md
  - surface/render-loop.md
  - instances/easing-and-animation.md
status: complete
verified-at: 8f06ee61
---

## Purpose

Instances never touch GPU buffers directly. Changes to `@observable` properties are recorded by
the layer's `InstanceProvider` as `InstanceDiff` tuples; once per frame `Layer.draw` drains that
list and dispatches each diff to the diff processor matching the layer's buffering strategy.
`InstanceDiffManager` is the small class that chooses that processor and exposes the dispatch
table.

## Key files

- `ui/src/surface/buffer-management/instance-diff-manager.ts` — `InstanceDiffManager`, `IInstanceDiffManagerTarget`, `DiffHandler`, `DiffLookup`.
- `ui/src/types.ts` — `InstanceDiff` (`[instance, InstanceDiffType, changes]`), `InstanceDiffType` (`CHANGE = 0`, `INSERT = 1`, `REMOVE = 2`).
- `ui/src/instance-provider/instance-provider.ts` — `InstanceProvider.add/remove/instanceUpdated/changeList/resolve`.
- `ui/src/surface/layer.ts` — `Layer.draw`, `Layer.getChangeList`, streaming (`props.streamChanges`), `Layer.updateDiffHandlers`, `Layer.setBufferManager`.

## How it works

### Producing diffs

`InstanceProvider` keeps one entry per instance UID in `instanceChanges`, so several edits in a
frame collapse to the latest tuple:

- `add(instance)` → `[instance, INSERT, instance.changes]` (ignored if already added).
- an observable setter → `instanceUpdated` → `[instance, CHANGE, instance.changes]`.
  `instance.changes` is a `{ propertyUID: propertyUID }` map filled by the setter.
- `remove(instance)` → disposes observation and records `[instance, REMOVE, {}]`.

Reading `changeList` sets `allowChanges = false` until `resolve(layerId)` clears the map and
re-enables recording. `resolve` throws if one provider is resolved by two different layers.

### Choosing the processor: `InstanceDiffManager.makeProcessor`

`Layer.setBufferManager` creates the manager and calls `makeProcessor(layer, bufferManager)`
once (the result is cached in `processing`):

| `layer.bufferType` | Processor |
|---|---|
| `INSTANCE_ATTRIBUTE`, `INSTANCE_ATTRIBUTE_PACKING` | `InstanceAttributeDiffProcessor` |
| `VERTEX_ATTRIBUTE`, `VERTEX_ATTRIBUTE_PACKING` | `VertexAttributeDiffProcessor` |
| anything else (`UNIFORM`) | `UniformDiffProcessor` |

`processing` is `[processor.changeInstance, processor.addInstance, processor.removeInstance]`,
indexed directly by `InstanceDiffType` — the array order must match the enum values.

### Consuming diffs: `Layer.draw`

Run by `Surface` for each layer during rendering:

1. `updateStreamLock()`, then `getChangeList()`:
   - no `props.streamChanges`: take `props.data.changeList`, call `props.data.resolve(layer.id)`;
   - with `streamChanges`: the first frame snapshots the whole list as a stream, resolves the
     provider and returns `[]`; following frames return slices of `streamChanges.count`
     (default 10000; `<= 0` = everything) using `StreamChangeStrategy.LINEAR`. New provider
     changes are not read while the stream is locked.
2. Non-empty list → `needsViewDrawn = true`.
3. `processor.incomingChangeList(list)` (choose PARTIAL/FULL), `bufferManager.incomingChangeList(list)`
   (size one resize for all inserts).
4. For each diff: `processing[diff[1]](processor, instance, Object.values(diff[2]),
   bufferManager.getBufferLocations(instance))`, then `instance.changes = {}`.
5. `processor.commit()` (set `Attribute.updateRange`), `bufferManager.changesProcessed()`,
   `updateEasingManager()`, `updateUniforms()`.

Processor semantics shared by all strategies: INSERT for a managed instance becomes a full
CHANGE; CHANGE for an unmanaged instance becomes an INSERT; REMOVE of an unmanaged instance is
ignored. Insert sets `instance.active = true`, remove sets it false and writes only `_active`.

### `IInstanceDiffManagerTarget`

The processor sees the layer only through this interface: `shaderIOInfo`, `picking`,
`resource`, `bufferManager`, `bufferType`, optional `onDiffAdd(instance)` /
`onDiffRemove(instance)`. `Layer.updateDiffHandlers` installs those hooks when an instance
attribute has `easing` (`handleDiffAddWithEasing` / `handleDiffAddWithPickingAndEasing` and the
matching removes), so instances get their per-layer easing bookkeeping on add and lose it on
remove.

## Extension points

- New buffering strategy: add a branch in `InstanceDiffManager.makeProcessor` returning your
  `BaseDiffProcessor` subclass (see [Buffer management overview](overview.md)).
- Per-layer add/remove side effects: assign `onDiffAdd` / `onDiffRemove` on the layer; keep them
  to trivial assignments — they run once per added/removed instance inside the hot loop.
- Throttle large updates with the layer prop `streamChanges: { count, strategy }`.

## Gotchas

- Handlers are invoked unbound with the processor as the first argument; inside them use
  `manager`, never `this` for the processor.
- Only the property UIDs in `instance.changes` are rewritten. An attribute is refreshed only
  if its registered property UID is in that list (see
  [Instance attribute strategies](instance-attribute-strategies.md)).
- One `InstanceProvider` per layer: sharing a provider between layers throws in `resolve`.
- A layer without a `diffManager`/`bufferManager` returns from `draw` early; one without a
  processor warns and skips the frame's diffs.
- With streaming, the first frame after new changes renders nothing new, by design.

## Related

- [Buffer management overview](overview.md) — strategies and base classes.
- [Instance providers](../instances/instance-providers.md) — producing diffs.
- [Render loop](../surface/render-loop.md) — when `Layer.draw` runs.
- [Easing and animation](../instances/easing-and-animation.md) — what `onDiffAdd` sets up.
