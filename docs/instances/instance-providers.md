---
title: Instance providers
summary: InstanceProvider and InstanceProviderWithList: adding and removing instances and the per-frame change list a layer consumes.
covers:
  - ui/src/instance-provider/instance-provider.ts
  - ui/src/instance-provider/instance-provider-with-list.ts
related:
  - instances/instances.md
  - surface/layer.md
  - buffers/instance-diffing.md
status: complete
verified-at: 5b9f617f
---

## Purpose

A provider is a layer's data source (`props.data`). It owns a set of instances, observes their
`@observable` properties, and accumulates one diff per changed instance until the layer consumes
the list on its next draw. Layers never scan all instances; they only process what the provider
reports.

## Key files

- `ui/src/instance-provider/instance-provider.ts` — `InstanceProvider<T>` (implements `IInstanceProvider`).
- `ui/src/instance-provider/instance-provider-with-list.ts` — `InstanceProviderWithList<T>`, adds a readable `instances` array.
- `ui/src/types.ts` — `IInstanceProvider`, `InstanceDiff` (`[instance, InstanceDiffType, changes]`), `InstanceDiffType` (`CHANGE = 0`, `INSERT = 1`, `REMOVE = 2`).

## How it works

### State

- `cleanObservation: Map<uid, [instance, disposer]>` — the membership set (there is no other list
  in the base class).
- `instanceChanges: Map<uid, InstanceDiff>` — at most **one** pending diff per instance; a later
  event overwrites an earlier one.
- `allowChanges` — false between reading `changeList` and `resolve`.
- `resolveContext` — id of the layer that resolved this provider.

### API

| Method | Effect |
|---|---|
| `new InstanceProvider(instances?)` | `add`s each |
| `add(instance)` | No-op if already a member. Sets `instance.observer = this` (which removes it from any previous provider), stores the disposer, records `INSERT` with `instance.changes`. Returns the instance |
| `instanceUpdated(instance)` | Called by observable setters; records `CHANGE` with `instance.changes` |
| `remove(instance)` | Calls the disposer (detaches the observer), drops membership, records `REMOVE` with `{}`. Always returns `false` |
| `has(instance)` | Membership test by `uid` |
| `clear()` | `remove`s every member (emits `REMOVE` diffs) |
| `destroy()` | Calls every disposer and clears both maps **without** emitting diffs |
| `changeList` (getter) | Sets `allowChanges = false`, returns the pending diffs as an array |
| `resolve(context)` | Clears pending diffs, re-allows changes, records `context`; throws if a different context resolved it before |
| `sync()` | Re-flags every member as `INSERT` with no property ids (full re-add) |

### Per-frame flow

```
instance.x = v  -> observable setter -> provider.instanceUpdated -> instanceChanges[uid] = CHANGE
Surface draw    -> Layer.draw -> Layer.getChangeList -> provider.changeList ; provider.resolve(layer.id)
                -> diff processor: processing[diffType](processor, instance, propIds, bufferLocations)
                -> instance.changes = {}
```

`Layer.getChangeList` reads `changeList` and calls `resolve(this.id)` immediately in the same
call. With the layer prop `streamChanges`, the whole list is copied into a stream, the provider is
resolved at once, and the layer applies `streamChanges.count` diffs per frame (default 10000;
`<= 0` means all) while new provider changes keep accumulating. On layer init, `Layer` calls
`props.data.sync()` so a provider that already holds instances (or came from another layer) is
fully re-inserted. Diff types map to `InstanceDiffManager.processing`
(`[changeInstance, addInstance, removeInstance]`, indexed by `InstanceDiffType`); the processors and
buffer side are in [Instance diffing](../buffers/instance-diffing.md).

### Collapsing of events within a frame

Because only the last diff per uid survives:

- `add` then property changes → `CHANGE`; the diff processors' `changeInstance` falls back to
  `addInstance` when the instance has no buffer location, so it is still inserted.
- `add` then `remove` → `REMOVE`; `removeInstance` with no buffer location does nothing.
- `remove` then `add` → `INSERT`; `addInstance` with an existing buffer location becomes a change.

The `changes` object in a diff is the instance's live `changes` object, so later assignments in
the same frame are included.

### InstanceProviderWithList

Overrides `add`, `remove`, `clear`, `destroy` to maintain `_instances`, exposed read-only as
`instances`. `add` pushes before delegating, so adding an instance that is already a member pushes
a duplicate into the list (the base `add` dedupes only the observation). `remove` is
`findIndex` + `splice` — O(n) per removal.

## Extension points

- Any object implementing `IInstanceProvider` (`uid`, `resolveContext`, `changeList`, `remove`,
  `resolve`, `sync`) can be a layer's `data`. Instances call `observer.instanceUpdated`, and
  `Instance.observer` is typed as `InstanceProvider`, so subclassing `InstanceProvider` is the
  practical route.
- Override `add`/`remove`/`clear`/`destroy` (calling `super`) to maintain extra indexes, as
  `InstanceProviderWithList` does.

## Gotchas

- **One provider per layer.** `resolve` throws "An instance provider has been issued to two
  layers" when a second layer resolves it. To show the same data twice, use separate providers
  (an instance can only belong to one provider at a time, since `add` steals it from the previous
  one).
- While `allowChanges` is false, `add`, `remove` and `instanceUpdated` are silently dropped. Reading
  `changeList` yourself without `resolve` freezes the provider; never read it outside the layer.
- `destroy()` emits no `REMOVE` diffs: the layer keeps rendering what it already buffered. Use
  `clear()` to remove instances visibly.
- `sync()` is expensive (re-inserts everything); the framework calls it, user code rarely should.
- `remove` accepts `{ uid }`, so removing by a stale object with the same uid works.

## Related

- [Instances](instances.md) — observables and `instance.changes`.
- [Layer](../surface/layer.md) — `props.data`, `streamChanges`, `Layer.draw`.
- [Instance diffing](../buffers/instance-diffing.md) — diff processors and buffer updates.
