---
title: Projection and geometry
summary: BaseProjection (screen/view/world mapping), Ray, Plane, Frustum and the Bounds/AbsolutePosition primitives used by views, cameras and picking.
covers:
  - ui/src/math/base-projection.ts
  - ui/src/math/frustum.ts
  - ui/src/math/plane.ts
  - ui/src/math/ray.ts
  - ui/src/math/primitives
related:
  - math/vectors-matrices-quaternions.md
  - 3d/view-and-projection.md
  - interaction/picking.md
  - 2d/view-and-camera.md
  - surface/views-and-scenes.md
status: complete
verified-at: b5262b21
---

## Purpose

These files hold the geometry that sits between a view's camera and the screen: `BaseProjection`
is the contract every view exposes for converting points between screen, view and world space;
`Ray`, `Plane` and `Frustum` are tuple-based primitives for hit tests and culling; `Bounds` and
`AbsolutePosition` describe 2D rectangles and CSS-like view placement.

## Key files

- `ui/src/math/base-projection.ts` — `BaseProjection<T>` (abstract) and the no-op `SimpleProjection`.
- `ui/src/math/ray.ts` — `Ray = [origin, direction]`, `ReadonlyRay`, `ray`, `rayFromPoints`, `rayToLocation`.
- `ui/src/math/plane.ts` — `Plane = [normal, distance]` and the `plane*` functions.
- `ui/src/math/frustum.ts` — `Frustum` (6 planes), `frustumFromViewProjection`, `frustumCornersFromInvViewProjection`.
- `ui/src/math/primitives/bounds.ts` — `Bounds<T>` rectangle class, `IBoundsOptions`.
- `ui/src/math/primitives/absolute-position.ts` — `AbsolutePosition` type, `getAbsolutePositionBounds`.
- `ui/src/2d/view/projection-2d.ts`, `ui/src/3d/view/projection-3d.ts` — the two real `BaseProjection` implementations (`Projection2D`, `Projection3D`).

## How it works

### Coordinate spaces

| Space | Origin / units | Produced by |
|---|---|---|
| Screen | top-left of the canvas element, CSS pixels | mouse/touch events |
| View | top-left of the view's viewport, CSS pixels | `screenToView` (subtract `screenBounds.x/y`) |
| Render space | view-relative, device pixels | multiply by `pixelRatio` |
| World | the camera's world | `viewToWorld` / `screenToWorld` |

### `BaseProjection<T>`

Every `View` has a `projection: BaseProjection` (`ui/src/surface/view.ts`; `View2D` uses
`Projection2D`, `View3D` uses `Projection3D`, the placeholder `NoView` uses `SimpleProjection`) and
its `screenBounds`/`viewBounds` accessors read and write the projection's.

- State: `pixelRatio` (default 1), `screenBounds` (view rectangle in CSS pixels), `viewBounds`
  (render-space rectangle including `pixelRatio`), `screenScale` (`Vec2`, for views rendering to a
  resource at a different size than the screen; the `screenBounds` getter returns the bounds scaled
  by it and caches the result until either changes), `id`, `uid`.
- Concrete methods: `screenToView`, `viewToScreen` (offset by `screenBounds`),
  `screenToRenderSpace`, `renderSpaceToScreen`.
- Abstract methods a subclass implements: `screenToWorld`, `worldToScreen`, `viewToWorld`,
  `worldToView`, `screenRay(point): Ray`.
- `Projection2D` inverts the 2D camera's `scale2D` and `control2D.offset`; its `screenRay` is a
  segment straight into the screen at the world point.
- `Projection3D.viewToWorld` maps a view point to a world point on that pixel's ray in front of the
  camera (perspective: reversing the frustum math; orthographic: offset from the view centre);
  `screenRay` is `rayFromPoints(camera position, world point)` for perspective cameras and
  `ray(world point, camera.transform.forward)` for orthographic ones. `worldToScreen`/`worldToView`
  use `projectToScreen` on `projection · view`, which yields y-up coordinates. Details:
  [3D view and projection](../3d/view-and-projection.md).

`View2D` (`ui/src/2d/view/view-2d.ts`) sets `viewBounds` and derives `screenBounds` by dividing
by the view's `pixelRatio`; `View3D` also assigns `projection.pixelRatio`.

### Ray

`Ray = [origin, direction]`; the doc comment says the direction is a unit vector and
`rayToLocation(ray, d)` = `origin + direction * d`. `rayFromPoints(origin, destination)` normalizes
the direction. `ray(origin, direction)` stores both references without copying or normalizing.

### Plane

`Plane = [normal: Vec3, distance: number]`. Constructors: `plane`, `planeCopy`,
`planeFromPoints(a, b, c)` (normal = normalize((b - a) × (c - a))), `planeFromPointAndNormal`,
`planeFromPointAndDistance` (normalizes the given direction). Queries: `planeDistance` (signed,
`dot(normal, p) - distance`), `planePointIsInFront` / `planePointIsBehind`, `planeProjectPoint`,
`planeReflectPoint`, `planeInvert`, `planeNormal`, `planeOriginDistance`. Intersections:
`planeLineIntersection`, `planeLineSegmentIntersection` (requires `0 ≤ t ≤ 1`),
`planeRayIntersection`; each returns `null` when the line is parallel (`|denominator| < 1e-6`).
Exposed as the `PlaneMath` namespace and `RayMath` for rays (`ui/src/math/index.ts`).

### Frustum

`frustumFromViewProjection(m)` extracts the 6 planes (left, right, bottom, top, near, far) from a
column-major view-projection matrix with the Gribb–Hartmann row sums (`m3 ± m0` …), normalized.
`frustumCornersFromInvViewProjection(inv)` unprojects the 8 NDC cube corners (near face first,
counter-clockwise from bottom-left) to world space. Both accept `out` to avoid allocation.

### Bounds and AbsolutePosition

`Bounds<T>` is a mutable `x, y, width, height` rectangle with y growing downward (`top = y`,
`bottom = y + height`) and an optional data payload `d`. Getters: `left`, `right`, `top`,
`bottom`, `mid`, `area`, `location`. Methods: `containsPoint` (edges inclusive), `hitBounds`
(overlap), `isInside`, `fits` (size only: 0 no, 1 exact, 2 fits), `encapsulate`, `encapsulateAll`,
`toString`, static `emptyBounds`. Used for view rectangles, texture-atlas packing and the quad tree.

`getAbsolutePositionBounds(item, reference, scaleRatio)` resolves a CSS-like `AbsolutePosition`
(`left/right/top/bottom/width/height`, numbers or `"N%"` strings) against a reference `Bounds`. The
`Surface` uses it to place each view's `viewport` inside the canvas. Rules, pinned by the archived (no longer run)
`archive/unit-test/absolute-bounds.test.ts`: an explicit `width`/`height` wins over `right`/`bottom`; with
no size, size = reference − left − right; percentages are taken of the reference size, plain numbers
are multiplied by `scaleRatio` (the `Surface` passes its `pixelRatio`) and any unit suffix other than `%` is ignored.

## Extension points

- A new view type implements `BaseProjection<T>`'s five abstract methods and assigns the instance to
  its `View.projection`; keep `screenBounds`, `viewBounds` and `pixelRatio` updated in the view's
  sizing code (see `View2D`/`View3D`).
- New geometric primitives follow the math-library scheme: plain tuples, free functions, optional
  `out` last ([Vectors, matrices and quaternions](vectors-matrices-quaternions.md)).

## Gotchas

- `ui/src/math/frustum.ts` is **not** exported from `ui/src/math/index.ts` and nothing in `ui/src`
  imports it; import it by path. Its `Frustum` doc comment lists only 5 planes; there are 6 (far last).
- **Plane sign convention is inconsistent.** The `Plane` comment says `n·x + d = 0`;
  `planeDistance`, `planeFromPoints` and `planeFromPointAndNormal` use `n·x - d = 0`; the three
  intersection functions solve `n·x + d = 0`; `frustumFromViewProjection` produces `n·x + d ≥ 0`
  for points inside. Planes built by one family give wrong answers in the other unless you negate
  `distance` (`planeInvert`). Check the sign before mixing them.
- `planeReflectPoint` returns `p + distance · n`, not a mirror image (`p - 2 · distance · n`).
- `plane()` stores the normal **by reference**, and `planeFromPoints` / `planeFromPointAndDistance`
  pass a module-level scratch vector as that normal: the returned plane's normal is overwritten by
  the next call to either function. Copy it (`copy3`) if the plane must persist.
- `BaseProjection.screenToRenderSpace` discards the `screenToView` offset and returns
  `point * pixelRatio`; `renderSpaceToScreen` subtracts `screenBounds` instead of adding it. Neither
  is called inside `ui/src`; prefer `screenToView` then scale yourself.
- `BaseProjection.pixelRatio` stays 1 unless the view sets it; only `View3D` does.
- `Projection3D.worldToScreen` returns y-up coordinates (from `projectToScreen`), unlike screen
  space, which is y-down.
- `SimpleProjection.screenRay` returns `[[0, 0, -1], [0, 0, -2]]`, whose second element is a point,
  not a unit direction; `Projection2D.screenRay` does the same with `[x, y, -1]`.
- `Bounds` constructor uses `||`: `x: 0, left: 5` gives `x = 5`; `height: 0` with `bottom` set
  derives the height from `bottom - y`.
- `Bounds.encapsulate(point)` grows `width` by `point[0] - x` (not `- right`) when the point lies
  right of the box, over-growing it (same for height); `encapsulateAll` keeps the larger of the old
  size and the new extent rather than a true union. Use `encapsulateAll` on a fresh `emptyBounds`
  positioned at the first item, or compute min/max yourself, when exact bounds matter.
- `getAbsolutePositionBounds` falls back to the full reference rectangle when the result has zero
  width/height or NaN, and logs a warning once per `AbsolutePosition` object (`WeakSet`).

## Related

- [Vectors, matrices and quaternions](vectors-matrices-quaternions.md) — the tuple types, `projectToScreen`, matrix layout.
- [3D view and projection](../3d/view-and-projection.md) — `View3D`, `Projection3D`, cameras.
- [2D view and camera](../2d/view-and-camera.md) — `View2D`, `Projection2D`, `Camera2D`.
- [Views and scenes](../surface/views-and-scenes.md) — `View`, viewports resolved with `getAbsolutePositionBounds`.
- [Picking](../interaction/picking.md) — screen-to-world conversion and hit tests built on these projections.
