---
title: Library utilities
summary: The helpers in ui/src/util: Camera, frame scheduling, ReactiveDiff, QuadTree, ResourcePool, factories, material/texture presets and small helpers — what each does and its traps.
covers:
  - ui/src/util
related:
  - shaders/authoring-a-layer.md
  - surface/render-loop.md
  - instances/easing-and-animation.md
  - surface/views-and-scenes.md
  - interaction/event-management.md
  - utilities/repo-util.md
status: complete
verified-at: 7f23c73a
---

## Purpose

`ui/src/util` holds the library's own general-purpose helpers: the `Camera` class every view uses,
the global frame scheduler, the `ReactiveDiff` that drives resource/scene/layer/view lifecycles, a
spatial `QuadTree`, typed factory pass-throughs (`create.*`), material and texture presets, and
small helpers (ids, map defaults, filters, waits). Reuse these before writing a new helper.
Almost everything is public: `ui/src/util/index.ts` is re-exported by `ui/src/index.ts`.

## Key files

| File | Purpose | Notable symbols |
|---|---|---|
| `ui/src/util/camera.ts` | Projection + view transform for a view | `Camera`, `CameraProjectionType`, `isOrthographic`, `isPerspective`, `ICameraOptions` |
| `ui/src/util/frame.ts` | Global `requestAnimationFrame` command queues | `nextFrame`, `onFrame`, `onAnimationLoop`, `stopAnimationLoop`, `stopAllFrameCommands`, `frameCommandStats` |
| `ui/src/util/reactive-diff.ts` | Keyed build/update/destroy diffing of initializer lists | `ReactiveDiff`, `IReactiveDiffOptions`, `ReactiveDiffObject` |
| `ui/src/util/quad-tree.ts` | Self-expanding 2D spatial index of `Bounds` | `QuadTree`, `QuadTreeNode`, `QuadTreeQuadrants`, `IQuadTreeVisitFunction` |
| `ui/src/util/resource-pool.ts` | Fixed pre-allocated object pool | `ResourcePool`, `IResourcePool` |
| `ui/src/util/create.ts` | `create.layer/view/vertex/uniform/attribute` shorthand | `create` |
| `ui/src/util/create-layer.ts` | Builds a `LayerInitializer` from a layer class + props | `createLayer`, `createChildLayer` |
| `ui/src/util/create-attribute.ts`, `create-uniform.ts`, `create-vertex.ts` | Identity functions that type shader IO literals | `createAttribute`, `createUniform`, `createVertex` |
| `ui/src/util/shader-templating.ts` | `${token}` replacement and `main()` body extraction for shaders | `shaderTemplate`, `IShaderTemplateOptions` |
| `ui/src/util/remove-comments.ts` | Strips `//` and `/* */` comments from shader source | `removeComments` |
| `ui/src/util/common-options.ts` | Material blending presets and WebGL2 texture format presets | `CommonMaterialOptions`, `CommonTextureOptions` |
| `ui/src/util/easing-util.ts` | Bulk access to instance easing controls | `EasingUtil.modify`, `EasingUtil.all` |
| `ui/src/util/easing-props.ts` | Per-attribute easing state object (not re-exported by the util index) | `EasingProps` |
| `ui/src/util/common-operations.ts` | Map get-or-default helpers | `mapInjectDefault`, `mapGetWithDefault` |
| `ui/src/util/common-filters.ts` | Array filters | `isDefined`, `touchesHasStartView`, `touchesContainsStartView` |
| `ui/src/util/identify-by-key.ts` | Immutable `key`/`id` base class (internal) | `IdentifyByKey`, `IdentifiableData` |
| `ui/src/util/uid.ts` | Monotonic id counters | `uid`, `colorUID` |
| `ui/src/util/mouse.ts` | Mouse position relative to an element; re-exports root `normalizeWheel` | `eventElementPosition`, `normalizeWheel` |
| `ui/src/util/promise-resolver.ts` | Promise with external `resolve`/`reject` | `PromiseResolver` |
| `ui/src/util/emit-once.ts` | Coalesce repeated calls per id into one deferred callback (internal) | `emitOnce`, `flushEmitOnce` |
| `ui/src/util/shallow-compare.ts` | One-level object equality | `shallowCompare` |
| `ui/src/util/wait.ts` | `setTimeout` as a promise | `wait` |
| `ui/src/util/array.ts` | Flatten one level of a 2D array (internal) | `flatten2D` |
| `ui/src/util/console-utils.ts` | Debug-only throttled console redraw (internal) | `consoleRender` |
| `ui/src/util/webgl2-type-shim.ts` | Defines a dummy `window.WebGL2RenderingContext` when absent | side-effect import |
| `ui/src/util/index.ts` | Barrel; omits `array`, `console-utils`, `easing-props`, `emit-once`, `identify-by-key`, `webgl2-type-shim` | — |

## How it works

### Camera

`Camera` combines a `Transform` (`ui/src/3d/scene-graph/transform.ts`; `position`, `scale`,
`lookAt`, `view`, `inverseView`) with projection options (`ICameraOrthographicOptions` with
`left/right/top/bottom/near/far`, or `ICameraPerspectiveOptions` with `fov/width/height/near/far`).
Build one with `Camera.makeOrthographic(partial)` / `Camera.makePerspective(partial)`, or switch
in place with `setOrthographic` / `setPerspective` (both fill defaults then set the dirty flag).
Setters for `position`, `scale`, `projectionOptions` and `lookAt` set `needsUpdate` only when the
value actually changes (`compare3`, `compare4x4`, `shallowCompare`). `updateProjection` builds the
projection (`orthographic4x4` / `perspective4x4`) and `viewProjection = multiply4x4(P, V)`.
`fitProjectionToPoints(points, pointsAreCameraSpace?)` tightens the frustum (ortho bounds or
perspective `fov/near/far`) around points. `broadcast(viewId)` calls the `onViewChange` handler;
`Surface` calls it per view. How views/controllers drive cameras: see
[Views and scenes](../surface/views-and-scenes.md) and
[3D view and projection](../3d/view-and-projection.md).

### Frame scheduler (`frame.ts`)

One module-level `requestAnimationFrame(loop)`; the loop stops when no queue has work and every
API call restarts it. Each tick runs, in order: `onAnimationLoop` commands (with optional
`interval` throttle and `duration` cut-off; `zeroTime` makes `t` start at 0), then `onFrame`
commands (this frame, or once `interval` ms have passed), then `nextFrame` commands queued during
the previous tick. All return a `Promise<number>`; the promise returned by `onAnimationLoop` is
also its id for `stopAnimationLoop(id)`. With a `duration` the promise resolves with the planned
end time after the final, guaranteed call; without one it resolves on the first call.
`frameCommandStats()` returns the queue sizes without changing them, for leak tests. The render
loop's use of these is in [Render loop](../surface/render-loop.md).

### ReactiveDiff

`new ReactiveDiff({ buildItem, updateItem, destroyItem })` turns a declarative list of
initializers (`{ key, parent? }`) into live items (`U extends IdentifiableById`). `diff(list)`
walks the list in order, awaiting each callback:

- key seen last diff → `updateItem(init, item)` (or `buildItem` if no item exists for it);
- new key → `buildItem(init)`; a falsy result means "not created";
- keys absent from the list → `destroyItem(init, item)`; the item is forgotten only when it
  resolves truthy.

`items` returns the live items in initializer order. During a callback, `inline(children)`
inserts more initializers right after the current one (used for child layers/views); inside
`buildItem` the insertion is deferred until the parent is built, and each child's `parent` is set
to the current item. `rebuild()`, valid only inside `updateItem`, destroys and rebuilds the current
item. Users: `Surface.resourceDiffs`, `Surface.sceneDiffs`, `LayerScene.layerDiffs`,
`LayerScene.viewDiffs` (see [Surface](../surface/surface.md), [Layer](../surface/layer.md)).

### QuadTree

`new QuadTree(left, right, top, bottom)` indexes items that are `Bounds` (or subclasses, e.g.
`Bounds<View>`). A node holds up to 5 items, then `split`s into `TL/TR/BL/BR` (max depth 10);
items straddling a split line stay on the parent. `add(item)` / `addAll(items)` first `cover` the
item area: if it lies outside, the root bounds grow (plus a 1-unit margin) and every item is
re-inserted. `query(boundsOrVec2, visit?)` returns hits by `hitBounds` or `containsPoint`;
a query rectangle that fully contains a node collects the whole subtree without tests.
`visit(cb)` walks nodes (stops descending when `cb` returns truthy). `UserInputEventManager`
uses it to find the views under the mouse; see
[Event management](../interaction/event-management.md).

### ResourcePool

Pre-creates `firstAlloc` items with `create()`. `retrieve()` hands out the next item;
`replace(item)` swaps it back into the free region; `destroy()` calls `options.destroy` on all.
No code in `ui/src` currently uses it.

### Factories and shader helpers

`createLayer(LayerClass, props)` returns `{ key, init: [LayerClass, props] }` (a
`LayerInitializer`), filling `key`/`data` from `LayerClass.defaultProps`; `createChildLayer` is the
same but typed for `Layer.childLayers()`. `createAttribute/Uniform/Vertex` return their argument
unchanged; they exist only for type inference in `initShader`. `shaderTemplate` and
`removeComments` are used by the shader processor and IO expansion. Details:
[Authoring a layer](../shaders/authoring-a-layer.md),
[Shader processing](../shaders/shader-processing.md).

### Presets

`CommonMaterialOptions.transparentShapeBlending` (SrcAlpha / OneMinusSrcAlpha) and
`transparentImageBlending` (One / OneMinusSrcAlpha, for premultiplied textures), both with culling
`NONE`; `.modify(opts)` returns a shallow copy merged with `opts`. `CommonTextureOptions.<FORMAT>(…)`
returns a `TextureOptions` with a valid `format`/`internalFormat`/`type` triple (RGB, RGBA,
R8 … RGBA32I, depth and depth-stencil formats); integer and depth formats force `Nearest`
filtering and no mipmaps. See [Textures and atlases](../resources/textures-and-atlases.md).

### Easing helpers

`EasingUtil.modify(instances, attrs, fn)` calls `fn` for every `instance.getEasing(attr)` found;
`EasingUtil.all(wait, instances, attrs, fn?)` does the same and, with `wait`, resolves after the
longest `delay + duration`. See [Easing and animation](../instances/easing-and-animation.md).

## Extension points

- New preset: add a static to `CommonMaterialOptions` (a `CommonMaterial` with `modify`) or a
  static factory to `CommonTextureOptions` returning `TextureOptions`.
- New diff-managed collection: implement `IReactiveDiffOptions<U, T>` where `T` has a `key` and
  `U` has an `id` equal to that key (needed by `rebuild`).
- Spatial queries over other objects: extend `Bounds` with your data and insert into a `QuadTree`.
- A new public util module must be added to `ui/src/util/index.ts` to be exported.

## Gotchas

- Importing `frame.ts` (or anything that imports it, e.g. the package root) calls
  `requestAnimationFrame` at module load: it needs a browser `window`. `webgl2-type-shim.ts`
  likewise writes to `window` and is imported first by `ui/src/index.ts`.
- `onAnimationLoop` with a `duration`: the user command receives the current time on its final
  call, not the planned end time; only the returned promise resolves with the end time.
- `stopAllFrameCommands` invokes every animation loop command one last time before clearing all
  queues.
- `Camera.projection` and `Camera.viewProjection` getters force a full recompute on every read and
  reset `needsUpdate` to false; `inverseViewProjection` re-inverts after each such read. Cache the
  matrix in hot loops. `projectionOptions` returns the internal object (its comment says a copy):
  mutating it does not mark the camera dirty — assign a new object instead.
- `ReactiveDiff.diff` resolves before removed items finish `destroyItem` (the removal loop is an
  un-awaited `forEach(async …)`). An item whose `destroyItem` resolves falsy stays alive and is
  retried on the next diff. Duplicate keys in one list cause a second `buildItem`.
- `ReactiveDiff.rebuild` keys its maps by `item.id` and does not await `destroyItem`.
- `QuadTree` has no remove: rebuild it (e.g. `new QuadTree(0, 0, 0, 0)` then `addAll`, as
  `UserInputEventManager` does on resize). Items with NaN or zero-area bounds are logged and
  dropped. A `QuadTree` built with fewer than 4 constructor arguments starts at `0..1`.
- `ResourcePool.retrieve` never grows: past `firstAlloc` it returns `undefined`.
- `isDefined` removes only `null`/`undefined` (despite its comment about falsy values); the type
  guard works only when passed directly, `.filter(isDefined)`.
- `mapInjectDefault` / `mapGetWithDefault` treat a stored `undefined` as missing, and a function
  default is called rather than stored.
- `uid()` starts at 2; `colorUID()` wraps to 0 after `0xffffff`. The two counters are independent.
- `removeComments` does not remove a `//` comment on the last line when the source has no trailing
  newline. `shaderTemplate` replaces unknown `${tokens}` with an empty string.
- `CommonMaterial.modify` is a shallow merge: passing `blending` replaces the whole blending object.
- `emitOnce(id, cb)` fires once after a 1 ms timeout with the call count; `flushEmitOnce` fires all
  pending immediately. The buffer managers and `ui/src/surface/surface-commands.ts` use it to batch warnings.
- `eventElementPosition` uses `pageX/Y` and `offsetParent` offsets, so it ignores CSS transforms.
- `consoleRender` clears the console each tick; debugging only.

## Related

- [Repository utilities](repo-util.md) — root `util/`, including `normalizeWheel`.
- [Render loop](../surface/render-loop.md) — how the surface uses the frame scheduler.
- [Authoring a layer](../shaders/authoring-a-layer.md) — `createAttribute`, `createUniform`, `createVertex`, `shaderTemplate`.
- [Easing and animation](../instances/easing-and-animation.md) — `EasingProps`, `EasingUtil`.
- [Views and scenes](../surface/views-and-scenes.md) — where `Camera` and the view/layer diffs live.
- [Event management](../interaction/event-management.md) — the `QuadTree` of views.
