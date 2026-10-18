---
title: Easing and animation
summary: GPU-side easing of instance attributes: IAutoEasingMethod, per-instance EasingProps, loop styles, and EasingUtil / layer refs for controlling and awaiting animations.
covers:
  - ui/src/math/auto-easing-method.ts
  - ui/src/util/easing-props.ts
  - ui/src/util/easing-util.ts
related:
  - instances/instances.md
  - shaders/io-expansion.md
status: complete
verified-at: 5b9f617f
---

## Purpose

DeltaV animates instance attributes on the GPU. When an instance attribute declares an `easing`
method, changing the instance property does not snap the rendered value: the CPU computes where
the value currently is, uploads a start value, start time and duration, and the vertex shader
interpolates to the new end value every frame. No per-frame CPU work or buffer upload happens
while the animation runs.

## Key files

- `ui/src/math/auto-easing-method.ts` — `IAutoEasingMethod`, `AutoEasingMethod` (built-in factories), `AutoEasingLoopStyle`.
- `ui/src/util/easing-props.ts` — `EasingProps`, the per-instance, per-attribute easing state (`IEasingProps`, exposed as `IEasingControl`).
- `ui/src/util/easing-util.ts` — `EasingUtil.modify`, `EasingUtil.all`, `EasingUtilAllHandler`.
- `ui/src/surface/layer-processing/base-io-expanders/easing-io-expansion.ts` — `EasingIOExpansion`, `createEasingAttribute`: turns an eased attribute into shader IO (detailed in [IO expansion](../shaders/io-expansion.md)).

## How it works

### The easing method

`IAutoEasingMethod<T>` is a plain object:

| Field | Meaning |
|---|---|
| `cpu(start, end, t, out?)` | JS interpolation; must give the same result as `gpu` |
| `gpu` | GLSL body template using `${easingMethod}` (the generated signature `T name(T start, T end, float t)`) and `${T}` (float/vec2/vec3/vec4) |
| `methodName` | GLSL function name; also the dedupe key for the shader header |
| `duration`, `delay` | ms; read from the method on every attribute update, so they may be mutated |
| `loop` | `AutoEasingLoopStyle` |
| `uid` | must be unique per attribute in a layer |
| `validation?` | `ignoreEndValueCheck`, `ignoreOverTimeCheck` flags for methods that do not end at `end` |

`AutoEasingMethod.<name>(duration, delay = 0, loop = NONE)` builds one with a fresh `uid()`.
Built-ins: `immediate`, `linear`, `easeIn/Out/InOut` × `Quad|Cubic|Quart|Quint`, `easeOutElastic`,
`easeBackIn`, `easeBackOut`, `easeBackInOut`, `continuousSinusoidal` (default loop `CONTINUOUS`),
and `slerpQuat*` variants of each curve (quaternion slerp; Vec4 only, otherwise they warn and
return the identity quaternion). `new AutoEasingMethod(cpu, gpu, duration?, methodName?)` builds a
custom one (defaults 500 ms, `"easingMethod"`).

### Loop styles (`AutoEasingLoopStyle`)

`NONE` — t clamped to 0..1. `REPEAT` — fract of elapsed/duration. `REFLECT` — triangle wave
0→1→0. `CONTINUOUS` — elapsed/duration unclamped (0→∞). Both the CPU path and the generated GLSL
implement the same formulas.

### Attribute expansion

A layer opts in per instance attribute (`easing: IAutoEasingMethod`, `size` ≤ 4 required, no
`resource`). Built-in layers expose this as an `animate` prop (e.g. `CircleLayer` `animate.center`).
`EasingIOExpansion.expand` (registered by default on `Surface`):

1. Renames the attribute to `_<name>_end` and records `layer.easingId["_<name>_end"] = easing.uid`.
2. Adds child attributes `_<name>_start` (size of the attribute), `_<name>_start_time` and
   `_<name>_duration` (size 1). Children update whenever the parent does.
3. Wraps `attribute.update` (below).
4. In the vertex shader it declares `_<name>_time` from `currentTime` (the `frame` shader module is
   imported automatically) and `<name> = methodName(_<name>_start, _<name>_end, _<name>_time)`, so
   shader code keeps using `<name>`. GPU methods are emitted once per (`methodName`, size).

### Per-update CPU step (the wrapped `update`)

On each buffer update of the attribute for an instance:

1. `end = originalUpdate(instance)`; `currentTime = layer.surface.frameMetrics.currentTime`.
2. Get or create `instance.easing.get(easing.uid)` — an `EasingProps` initialised with
   `start = end`, `startTime = currentTime` (first sight never animates).
3. Unless `isManualStart`, set `start = cpu(start, oldEnd, t)` where `t` comes from the loop style:
   the currently rendered value becomes the new start, so retargeting mid-animation is seamless.
4. `startTime = currentTime + delay`; copy `end` into `values.end`.
5. `layer.animationEndTime = max(..., startTime + duration + frameDuration)` (keeps the surface
   rendering until the animation ends); `layer.alwaysDraw` is set true for `REPEAT`/`REFLECT`/`CONTINUOUS`, false for `NONE`.

`duration`/`delay` come from the easing method unless `EasingProps.isTimeSet`, then from the props.

### Controlling and awaiting animations

- `Instance.getEasing(attrName)` returns the `IEasingControl` (`EasingProps`) for the base
  attribute name, or `undefined` if the instance is not in a layer easing that attribute.
  `layer.easingId` is copied to `instance.easingId` on diff add and removed with `instance.easing`
  on diff remove (`Layer.handleDiffAddWithEasing` / `handleDiffRemoveWithEasing`).
- `EasingProps.setStart(vec)` forces the start value (length must match, else warns and ignores);
  `setTiming(delay?, duration?)` overrides timing; `setAutomatic()` clears both overrides. Overrides
  persist across later changes until `setAutomatic()`.
- `EasingUtil.modify(instances, attrNames, handler)` calls `handler(easing, instance, k, i)` for
  every existing easing control. `EasingUtil.all(wait, instances, attrNames, handler?)` does the
  same and, when `wait` is true, resolves after the largest `delay + duration` found has elapsed
  (frame-based, via `onFrame`).
- Layer prop `ref: ILayerRef` receives `ref.easing: ILayerEasingManager`; `complete()` resolves
  when the current change batch (or, with `streamChanges`, the whole stream) has finished
  animating, based on `layer.animationEndTime`.

Typical use: change the property after the instance has been rendered once, then
`getEasing("center")?.setTiming(delay)` in the same frame for staggered starts.

## Extension points

- Custom curve: an object implementing `IAutoEasingMethod` (use `uid()` from `ui/src/util/uid.ts`),
  or `new AutoEasingMethod(cpu, gpu, duration, methodName)`. Write `gpu` against
  `${easingMethod}`/`${T}` and keep `cpu` numerically identical.
- New animatable layer property: put `easing` on the instance attribute in `initShader`
  (optionally via `createEasingAttribute`), usually sourced from an `animate` prop.

## Gotchas

- Reusing one easing object (same `uid`) on two attributes of a layer logs an error and gives
  undefined behaviour: easing state is keyed by `uid`. Create one method per attribute
  (`AutoEasingMethod.linear(...)` per use).
- Two different methods with the same `methodName` and size collide in the shader; one wins.
- The first time an instance is buffered it renders at its end value; animate by changing it
  afterwards (e.g. next frame).
- `cpu` and `gpu` must agree: the CPU result is the next start value, so a mismatch makes values
  jump on retarget.
- `layer.alwaysDraw` is reassigned by every eased attribute update, so the last updated attribute's
  loop style decides whether the layer keeps redrawing.
- The `_<name>_duration` attribute uploads `EasingProps.duration`, which is set when the props are
  created and only changed by `setTiming`; the CPU step uses the method's current `duration`.
  Mutating `easing.duration` after instances exist can therefore make CPU and GPU timing disagree.
- Each eased attribute adds `size + 2` floats per instance plus a start value upload on every
  change; prefer non-animated layers for data that rarely moves.
- `EasingProps` is not re-exported from the package index; use the `IEasingControl` type.

## Related

- [Instances](instances.md) — `Instance.easing`, `easingId`, `getEasing`.
- [IO expansion](../shaders/io-expansion.md) — how `EasingIOExpansion` plugs into shader IO.
