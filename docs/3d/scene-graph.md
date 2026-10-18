---
title: 3D scene graph
summary: Transforms and the scene graph: hierarchical 2D/3D transforms, world nodes and how instances attach to them.
covers:
  - ui/src/3d/scene-graph
related:
  - 3d/view-and-projection.md
  - 3d/layers.md
  - math/vectors-matrices-quaternions.md
  - instances/instances.md
  - shaders/shader-modules.md
status: complete
verified-at: 7323839e
---

## Purpose

The scene graph places instances in 3D space through a tree of lazily-updated transforms. A
`Transform` (full 3D, quaternion rotation) or `Transform2D` (x/y position, scalar rotation) holds
local scale/rotation/translation, derives its local and world 4x4 matrices on demand, and pushes the
results into the observable fields of the `Instance3D` / `Instance2D` it is bound to, so the normal
instance-diffing pipeline uploads them to the GPU. `Camera` (`ui/src/util/camera.ts`) also uses a
`Transform` for its placement and view matrix.

## Key files

- `ui/src/3d/scene-graph/tree-node.ts` — `TreeNode<T>`: parent/children tree with gated invalidation (`invalidate`, `resolve`, `childUpdate`, `processParentUpdates`).
- `ui/src/3d/scene-graph/transform.ts` — `Transform`, `ITransform`, `IdentityTransform`: 3D SRT node with world/local/view matrices.
- `ui/src/3d/scene-graph/transform-2d.ts` — `Transform2D`: 2D SRT node (x/y, scalar rotation) producing 4x4 matrices.
- `ui/src/3d/scene-graph/transform-base.ts` — `ITransformBase` (empty marker), `scheduleUpdate` / `resolveUpdate` and the perpetual update loop.
- `ui/src/3d/scene-graph/instance-3d.ts` — `Instance3D`, `IInstance3DOptions`: instance whose orientation properties mirror a `Transform`.
- `ui/src/3d/scene-graph/instance-2d.ts` — `Instance2D`: the same for `Transform2D` (not re-exported by the barrel).
- `ui/src/3d/scene-graph/scene-graph-layer.ts` — `SceneGraphLayer`, `ISceneGraphLayerProps`: layer base adding the `parent-transform` VS module.
- `ui/src/3d/scene-graph/parent-transform.shader.ts` — registers the `parent-transform` shader module (`mat4 parentTransform` uniform).
- `ui/src/3d/scene-graph/world-node.ts` — `WorldNode`: empty abstract class, unused and not exported.
- `ui/src/3d/scene-graph/index.ts` — barrel; imports `parent-transform.shader` for its registration side effect.

## How it works

### TreeNode: gated invalidation

`TreeNode` keeps `parent`, a read-only `children` list, a `needsUpdate` flag and a `childUpdate`
set (children the node has flagged but that have not recomputed yet).

- `setParent(parent, unsafe)` / the `parent` setter: adds to the new parent (`addChild(this, true)`),
  removes from the old one, then `invalidate()`s. `addChild` / `removeChild` keep both sides in sync
  unless `unsafe` is passed.
- `invalidate()` sets `needsUpdate` and recursively invalidates every child, adding each to the
  parent's `childUpdate`. It stops early on a node already invalid, so repeated changes are cheap.
- `resolve()` clears `needsUpdate` and removes the node from its parent's `childUpdate`.
- `processParentUpdates(handle)` collects the chain of invalid ancestors and calls `handle` on them
  top-down, then `resolve()`s each. This lets a leaf pull its ancestors up to date when it is read.

### Transform: lazy SRT matrices

State is kept in `UpdateProp<T>` boxes (`{ value, didUpdate }`, `ui/src/types.ts`). Setters
(`localPosition`, `localRotation`, `localScale`, the chaining `setLocal*` methods,
`applyLocalSRT`, `lookAtLocal`, `localTransform`, `localViewTransform`) copy the values, set
`didUpdate` and call `invalidate()`. Nothing is computed until a getter calls `update()`:

1. If `needsUpdate`: rebuild the local rotation 3x3 from the quaternion
   (`matrix3x3FromUnitQuatModel`), then `SRT4x4(scale, R, position)` into `localMatrix`
   (scale, then rotation, then translation). A `localTransform`, when set, is multiplied on top.
   If a view matrix was ever requested, also build `localViewMatrix` as the inverse-order
   `TRS4x4(1/scale, Rᵀ, -position)`, optionally multiplied by `localViewTransform`.
2. If there is a parent that `needsUpdate`, `processParentUpdates` updates the ancestors first
   (each with `update(true)`); then `matrix = parent.matrix × localMatrix`. The world view matrix is
   `parent.viewMatrix × localViewMatrix` when the parent has its own view matrix, otherwise the
   parent's view matrix is synthesised from its world rotation/scale/position.
3. `decomposeWorldMatrix` recovers world `position` / `scale` / `rotation` from `matrix` — only
   when a parent exists and something asked for world orientation (see below).
4. Changed values are written into the bound instance's private observable fields (`_matrix`,
   `_localMatrix`, `_position`, …), which triggers the instance change tracking.
5. All `didUpdate` flags are cleared and `resolve()` is called.

Getters that trigger `update()`: `matrix`, `localMatrix`, `viewMatrix`, `localViewMatrix`,
`inverseViewMatrix` (cached inverse of `viewMatrix`, identity if singular), `position`,
`rotation`, `scale`. The `local*` property getters return stored values without updating.

**Memory sharing.** Without a parent, world and local values are the same arrays
(`_position.value === _localPosition.value`, etc.). `setParent` calls `divideMemory()` when a
parent is first attached and `mergeMemory()` when it is removed.

**World decomposition is opt-in.** Reading `position` / `rotation` / `scale` sets
`needsWorldOrientation`; only then (and, for a bound instance, only if
`instance.needsWorldUpdate` is also set) does `update()` decompose the world matrix.
`Transform.optimize()` / `Instance3D.optimize()` clear these flags again.

**View matrices** are created only after the first read of `viewMatrix` / `localViewMatrix`
(`hasViewMatrix`); before that the getters return identity after forcing an update. They are the
"camera" form: inverse-order operations rather than a matrix inverse.

### Binding to instances and the update loop

`Instance3D` creates (or takes from `options.transform`) a `Transform`; the `transform` setter
copies the transform's arrays into the instance's `@observable` fields and sets
`transform.instance`. Its `position` / `rotation` / `scale` / `local*` setters forward to the
transform; getters set `needsWorldUpdate` / `needsLocalUpdate` (world getters also call
`transform.update()`). `options.parent` (an `Instance3D` or `Transform`) and the `parent` setter
parent the transforms.

Because both the transform tree and the render pipeline are passive, a changed transform might
never be read. `Transform.invalidate()` therefore calls `queueForUpdate()`: if it is bound to an
`active` instance, it is added to a module-level set via `scheduleUpdate`. A never-ending
`onAnimationLoop` (in `transform-base.ts`, started on import) calls `update()` on every queued
object each frame; `update()` itself removes the object with `resolveUpdate`.

`Transform2D` / `Instance2D` mirror this with a `Vec2Compat` position/scale, a scalar
`localRotation` (`rotation2x2`, `SRT4x4_2D`) and a world `rotation` quaternion from decomposition.
`Transform2D` has no view matrices, no `localTransform`, no `lookAtLocal` and no `forward`, and
`Instance2D` exposes no `matrix` getter (layers read `instance.transform.matrix`).

### Parent transform per layer

`SceneGraphLayer` appends the `parent-transform` module to its vertex modules. The module supplies
`uniform mat4 parentTransform` from `layer.props.parent?.matrix` (identity when absent), so a whole
layer can be rendered relative to one transform. The module has no GLSL content; the layer's shader
must multiply by `parentTransform` itself. The module warns and supplies nothing on a layer that is
not a `SceneGraphLayer`.

## Extension points

- **New 3D instance type:** extend `Instance3D`, add `@observable` fields and call
  `makeObservable(this, MyInstance)` in the constructor after `super(options)` — see
  `CubeInstance` in [3D layers](layers.md).
- **Layer consuming transforms:** add an instance attribute of size
  `InstanceAttributeSize.MAT4X4` whose `update` returns `(o.transform || IdentityTransform).matrix`,
  and multiply vertex positions by it in the vertex shader.
- **Layer-level parent:** extend `SceneGraphLayer` (props `ISceneGraphLayerProps`, `parent?: { matrix }`)
  and use `parentTransform` in the shader.
- **Non-affine tweaks:** set `Transform.localTransform` (node) or `localViewTransform` (view only).
- **New node kind:** extend `TreeNode<T>`; override `invalidate` / `setParent` as `Transform` does.

## Gotchas

- Setting world `position` / `rotation` / `scale` on a parented `Transform` only logs
  `NOT IMPLEMENTED` and does nothing; use the `local*` setters. `Transform2D.rotation` cannot be set
  at all.
- `localTransform` / `localViewTransform` make the decomposed world `position` / `rotation` /
  `scale` unreliable; the matrices remain correct.
- `forward` / `localForward` do not call `update()`; `forward` rotates by the cached world rotation,
  so read `rotation` (or `matrix`) first when parented.
- `applyLocalSRT` stores the passed arrays by reference (no copy); mutating them later changes the
  transform without invalidation.
- When the parent has no view matrix, the child's world view matrix is computed as
  `multiply4x4(localViewMatrix, parentView)` — the opposite argument order to the branch used when
  the parent has its own view matrix (`multiply4x4(parentView, localViewMatrix)`).
- `TreeNode` allows cycles to be built (no check on `setParent`); nothing guards against them.
- Only *active* instances are queued for the background update; a transform without an instance is
  recomputed only when read.
- `instance-2d.ts` declares its own `IInstance3DOptions` (typed for `Transform2D`), and neither
  `Instance2D` nor `WorldNode` is exported from `ui/src/3d/scene-graph/index.ts`.
- `unit-test/transform.test.ts` pins identity matrices (including after `lookAtLocal` and for the
  view matrix) and y-axis rotation.

## Related

- [3D view and projection](view-and-projection.md) — `View3D`, `Projection3D`, cameras that use `Transform`.
- [3D layers](layers.md) — `CubeLayer` / `TriangleLayer` reading `transform.matrix`.
- [Vectors, matrices and quaternions](../math/vectors-matrices-quaternions.md) — `SRT4x4`, `TRS4x4`, quaternion helpers.
- [Instances](../instances/instances.md) — `@observable` and change tracking the transform writes into.
- [Shader modules](../shaders/shader-modules.md) — how `parent-transform` is registered and imported.
