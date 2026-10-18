---
title: Instances
summary: The Instance base class and the observable decorator: how instance property changes are recorded and reported to the owning InstanceProvider.
covers:
  - ui/src/instance-provider/instance.ts
  - ui/src/instance-provider/observable.ts
related:
  - instances/instance-providers.md
  - instances/easing-and-animation.md
  - buffers/instance-diffing.md
status: complete
verified-at: 5b9f617f
---

## Purpose

An `Instance` is one renderable data item (a circle, a glyph, an edge…). Its fields decorated
with `@observable` are rewritten into getter/setter pairs so that every assignment records a
numeric property id in `instance.changes` and notifies the instance's observer (an
`InstanceProvider`). Layers later read only the changed property ids and update only the
GPU buffer slots that depend on them.

## Key files

- `ui/src/instance-provider/instance.ts` — `Instance` (base class), `IInstanceOptions` (`active`, `id`).
- `ui/src/instance-provider/observable.ts` — `observable` decorator, `makeObservable`, `ObservableMonitoring` (property-id gathering used by buffer managers).
- `ui/src/instance-provider/index.ts` — re-exports the folder (public via `ui/src/index.ts`).

## How it works

### Declaring an instance

```ts
export class CircleInstance extends Instance {
  @observable center: Vec2 = [0, 0];
  @observable radius = 0;

  constructor(options: ICircleInstanceOptions) {
    super(options);
    makeObservable(this, CircleInstance); // must name the class being constructed
    this.center = options.center || this.center;
  }
}
```

(`ui/src/2d/layers/circles/circle-instance.ts` is the canonical example.)

### The decorator (class definition time)

`observable(target, key)` runs once per decorated field, on the prototype (`experimentalDecorators`
in `tsconfig.json`):

1. Assigns the **name** a global numeric property UID in `ObservableMonitoring.observableNamesToUID`
   (`propUID` counter). The UID is per property *name*, not per class: every class with an
   observable `center` shares one id, which lets one layer's attribute map work for different
   instance classes.
2. Adds the name to a per-constructor `Set` (module-private `isObservable` map) and merges in the
   observable names of every ancestor class found on the prototype chain.
3. Defines a plain writable property on the prototype so the field initializer still works.

### `makeObservable(this, Ctor)` (construction time)

Returns immediately unless `this.constructor === Ctor`, so in an inheritance chain only the call in
the **most-derived** constructor does work (and it runs after that class's field initializers).
For each observable name it calls `observeProperty`, which replaces the own property with a
getter/setter that store the value in `instance.observableStorage[propertyUID]` and re-assigns
the current value through the setter.

- Setter: writes storage, sets `instance.changes[uid] = uid`, then
  `instance.observer?.instanceUpdated(instance)`. There is no equality check: assigning the same
  value (even `this.x = this.x`) is a change.
- Getter: returns storage; when `ObservableMonitoring.gatherIds` is on (and not inside a setter,
  `setCycle`), pushes the property UID to `ObservableMonitoring.observableIds`.

### Built-in instance state

- `uid` — getter over the observable `_uid`, from `Instance.newUID` (wraps at `0xffffff`). Providers,
  buffer managers and picking key on it.
- `active` — getter/setter over the observable `_active`; setting it also sets `reactivate = true`.
  The diff processors set `active = true` on add and `false` on remove; a layer's generated
  active attribute reads it (`Layer` builds it from `o.active`). When `reactivate` is true the next
  buffer update writes **all** attributes of the instance; the diff processor then clears it.
- `changes` — `{ [propertyUID]: propertyUID }` since the last processed frame; `Layer.draw` resets
  it to `{}` after processing the instance's diff.
- `observer` — the `InstanceProvider` that owns it. Setting a different observer first clears
  `easing` and calls `oldObserver.remove(this)`, so an instance belongs to at most one provider.
  `observableDisposer` returns a function that nulls the observer (used by the provider).
- `easing` / `easingId` / `getEasing(attributeName)` — per-instance easing state, filled by layers
  with eased attributes; see [Easing and animation](easing-and-animation.md).
- `resourceTrigger()` — called when a resource the instance requested (e.g. a texture/glyph)
  becomes ready. The default only warns; subclasses using resources override it to re-assign
  the observable that commits the resource (`GlyphInstance.resourceTrigger` re-assigns its own
  properties).

### Property-id discovery (`ObservableMonitoring`)

Layers do not know which instance property feeds which attribute. Buffer managers find out on the
first added instance (`doAddWithRegistration` in the buffer managers): for each attribute they call
`ObservableMonitoring.setObservableMonitor(true)`, run `attribute.update(instance)`, and read
`getObservableMonitorIds(true)`. `Layer.getInstanceObservableIds(instance, props)` uses the same
trick to map property names to UIDs. `setObservableMonitor(false)` must always follow, or every
getter keeps pushing ids (memory growth). The change → buffer path is in
[Instance diffing](../buffers/instance-diffing.md).

## Extension points

- New instance type: subclass `Instance`, decorate GPU-relevant fields with `@observable`, call
  `super(options)` then `makeObservable(this, YourClass)` in the constructor, and accept
  `IInstanceOptions` in the options. A subclass of a subclass calls `makeObservable` with its own
  class.
- Plain (non-decorated) fields and getters are fine for CPU-only data or derived values, but
  changing them never reaches the GPU.
- Instances that use resources override `resourceTrigger`.

## Gotchas

- Forgetting `makeObservable(this, YourClass)` leaves **every** observable of that instance
  (including inherited `_active`/`_uid`) a plain field: nothing is tracked and layers misbehave.
- Mutating in place (`inst.center[0] = 5`, `inst.color.push(...)`) does not call the setter, so no
  change is recorded. Assign a new value, or self-assign (`inst.center = inst.center`) to force it.
- An attribute's `update` should read exactly one observable: registration keeps only the **last**
  property id read per attribute ("only ONE property id per change"), so changing the other
  observables it reads will not refresh that attribute.
- Do not read observables (or log instances) between `setObservableMonitor(true/false)` in custom
  code; reads inside the window are attributed to the attribute being registered.
- Property UIDs are global per name; two unrelated classes with an observable of the same name
  share the UID by design.
- Every setter call notifies the provider; batch heavy updates per frame rather than assigning the
  same property repeatedly (each extra assignment is cheap but not free).

## Related

- [Instance providers](instance-providers.md) — collect the changes recorded here.
- [Easing and animation](easing-and-animation.md) — `easing`, `easingId`, `getEasing`.
- [Instance diffing](../buffers/instance-diffing.md) — how changed property ids become buffer writes.
