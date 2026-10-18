---
title: 3D view and projection
summary: View3D, Camera and the 3D shader modules: perspective and orthographic projection for 3D scenes.
covers:
  - ui/src/3d/view
  - ui/src/3d/shader-modules
related:
  - 3d/scene-graph.md
  - 3d/layers.md
  - math/projection-and-geometry.md
  - interaction/camera-controllers.md
  - surface/views-and-scenes.md
  - 2d/view-and-camera.md
  - shaders/shader-modules.md
  - utilities/library-util.md
status: complete
verified-at: 7323839e
---

## Purpose

`View3D` renders a scene through a 3D `Camera` (perspective or orthographic, y-axis up) and keeps
the camera's projection fitted to the view's viewport. `Projection3D` converts between screen,
view and world coordinates for picking and interaction. `createLayer2Din3D` plus the
`world2DXY` / `world2DXZ` / `world2DYZ` shader modules let an existing `Layer2D` draw into the 3D
world on a chosen plane.

## Key files

- `ui/src/3d/view/view-3d.ts` — `View3D`, `IView3DProps` (`preventCameraAdjustment`).
- `ui/src/3d/view/projection-3d.ts` — `Projection3D`: `screenToWorld`, `screenRay`, `worldToScreen`, `viewToWorld`, `worldToView`.
- `ui/src/3d/view/layer-2d-in-3d.ts` — `Axis2D` (`XY`, `XZ`, `YZ`), `createLayer2Din3D`.
- `ui/src/3d/shader-modules/world-2d-xy.shader.ts` — registers `world2DXY` (reuses the 2D projection fragment).
- `ui/src/3d/shader-modules/world-2d-xz.shader.ts` — registers `world2DXZ`.
- `ui/src/3d/shader-modules/world-2d-yz.shader.ts` — registers `world2DYZ`.
- `ui/src/3d/shader-modules/shader-fragments/world-2d-xz-projection.vs`, `ui/src/3d/shader-modules/shader-fragments/world-2d-yz-projection.vs` — the GLSL for the swizzled projections.
- `ui/src/3d/view/simple-3d-transform-controller.ts`, `ui/src/3d/view/mouse-swivel-camera-controller.ts` — input controllers, documented in [Camera controllers](../interaction/camera-controllers.md).
- `ui/src/util/camera.ts` — `Camera`, `CameraProjectionType` (owned by [Library utilities](../utilities/library-util.md), summarised here).

## How it works

### Camera

`Camera` holds `projectionOptions` (`type: CameraProjectionType.PERSPECTIVE` with
`fov`/`width`/`height`/`near`/`far`, or `ORTHOGRAPHIC` with `left`/`right`/`top`/`bottom`/`near`/`far`)
and a `transform: Transform` (see [3D scene graph](scene-graph.md)) for placement.
`position`, `scale` and `lookAt(target, up?)` act on that transform; `view` is
`transform.viewMatrix`; `projection` and `viewProjection` (= projection × view) are recomputed by
`update()`. Factories: `Camera.makePerspective`, `Camera.makeOrthographic`; switch in place with
`setPerspective` / `setOrthographic`. `fitProjectionToPoints` tightens the frustum around a set of points.

### View3D

`View3D extends View`. `View3D.defaultProps.camera` is a perspective camera (fov π/2, near 1,
far 100000). The constructor creates `this.projection = new Projection3D()` and copies `camera`
and `pixelRatio` into it; `willUpdateProps` re-assigns `projection.camera` when props change.

The surface calls `fitViewtoViewport(surfaceDimensions, viewBounds)` whenever the viewport is
resolved. For a perspective camera it writes `width`/`height` = the view's pixel size; for an
orthographic camera it writes `left/right/top/bottom = ∓width/2, ±height/2` (origin centred). Both
keep `near`/`far` and call `camera.update()`. Then it sets `projection.viewBounds` (render pixels)
and `projection.screenBounds` (= viewBounds / pixelRatio). With `preventCameraAdjustment: true`
the camera options are left alone (e.g. a light camera with a hand-fitted frustum) but the
projection bounds are still updated.

Layers in a `View3D` use the base `projection` shader module (`${import: projection}`), whose
`clipSpace(world)` is `viewProjection * vec4(world, 1.0)` and whose `camera` module supplies
`projection`, `view`, `viewProjection`, `cameraPosition`, `viewSize`, `pixelRatio`, … from
`layer.view.props.camera` — see [Shader modules](../shaders/shader-modules.md).

### Projection3D

`Projection3D extends BaseProjection` (screen↔view conversions are inherited; see
[Projection and geometry](../math/projection-and-geometry.md)).

- `worldToView(point)` / `worldToScreen(point)` — `project3As4ToScreen(projection × view, …)` over
  `viewBounds`, divided by `pixelRatio`.
- `viewToWorld(point)` — perspective: un-projects the pixel centre onto the near plane in camera
  space (`[Px, Py, -1]` scaled by `tan(fov/2) * near`) and transforms by `camera.transform.matrix`.
  Orthographic: offsets from the view centre at depth `-near`, transformed by
  `camera.transform.viewMatrix`, with y negated.
- `screenToWorld(point)` = `viewToWorld(screenToView(point))`.
- `screenRay(point)` — orthographic: `ray(screenToWorld(p), camera.transform.forward)`;
  perspective: `rayFromPoints(camera.transform.position, screenToWorld(p))`.

`unit-test/projection-3d.test.ts` pins these for origin, angled and positioned cameras.

### 2D layers in a 3D world

`createLayer2Din3D(axis, LayerClass, props)` requires `LayerClass` to be `Layer2D` or a subclass
and `props.control2D` (a `Control2D`). It returns `createLayer(...)` with an added
`baseShaderModules` prop that swaps the `world2D` module (pushed by `Layer2D.baseShaderModules`)
for `world2DXY`, `world2DXZ` or `world2DYZ`. The shader processor applies the prop after the
layer's own `baseShaderModules`.

Each module keeps the 2D API (`cameraSpace`, `cameraSpaceSize`, `clipSpace`, `clipSpaceSize`):
2D positions are offset and scaled by the `Control2D` (`cameraOffset`, `cameraScale2D` uniforms),
then projected with the 3D camera's `projection * view`:

| Axis2D | Module | Fragment | 2D (x, y) lands on |
|---|---|---|---|
| `XY` | `world2DXY` | `ui/src/2d/shader-modules/shader-fragments/world-2d-projection.vs` | world x, y |
| `XZ` | `world2DXZ` | `world-2d-xz-projection.vs` (`world.xzy`) | world x, z |
| `YZ` | `world2DYZ` | `world-2d-yz-projection.vs` (`world.zyx`) | world z, y |

Uniforms: `projection`, `view`, `cameraOffset`, `cameraPosition`, `cameraScale`, `cameraScale2D`,
`cameraRotation`, `viewSize`, `pixelRatio`.

## Extension points

- **Custom 3D view:** extend `View3D<TProps extends IView3DProps>`; override `fitViewtoViewport`
  to change how the camera follows the viewport, keeping `projection.viewBounds` /
  `screenBounds` set.
- **Hand-managed camera:** pass your own `Camera` in the view props and set
  `preventCameraAdjustment: true`.
- **Another 2D plane mapping:** register a module with `ShaderModule.register` exposing the same
  four functions and uniforms, then supply a `baseShaderModules` prop that replaces `world2D`
  with it, as `createLayer2Din3D` does.
- **Picking/interaction:** use `view.projection.screenRay(point)` and intersect with
  `Ray`/`Plane` helpers from `ui/src/math`.

## Gotchas

- `fitViewtoViewport` overwrites the camera's `width`/`height` (perspective) or frustum
  extents (orthographic) on every resize; values set by hand are lost unless
  `preventCameraAdjustment` is set.
- `worldToScreen` and `worldToView` have identical bodies: `worldToScreen` returns view-relative
  coordinates and does not add the view's screen offset.
- Orthographic frustums are centred on the camera: `(0, 0)` world is the middle of the view.
- `createLayer2Din3D` with a non-`Layer2D` class only warns and returns an unmodified layer.
  Without `control2D`, the modules warn and return no uniforms, leaving the fragment's uniforms
  undeclared.
- `world2DXY` reuses the View2D fragment, which calls `viewProjection`, but the module's uniform
  list does not declare `viewProjection`; `Axis2D.XY` is the path most likely to fail shader
  compilation.
- `world2DXZ` / `world2DYZ` declare `cameraRotation` as a `vec3` fed with `camera.scale`;
  `world2DXY` declares it as a `vec4` with the rotation quaternion. Do not rely on
  `cameraRotation` in 2D-in-3D shaders.
- 2D-in-3D only moves vertex positions: screen-space constructs (e.g. label glyphs) keep facing the
  screen. To draw content truly flat in 3D, render it to a render target and texture it in 3D.
- `ui/src/3d/view/index.ts` does not export `mouse-swivel-camera-controller.ts`.

## Related

- [3D scene graph](scene-graph.md) — `Transform`, which backs `Camera.transform`.
- [3D layers](layers.md) — layers drawn in a `View3D`.
- [Views and scenes](../surface/views-and-scenes.md) — base `View`, viewports and `fitViewtoViewport` call site.
- [2D view and camera](../2d/view-and-camera.md) — `Layer2D`, `Control2D` and the `world2D` module.
- [Projection and geometry](../math/projection-and-geometry.md) — `BaseProjection`, `Ray`, frustum math.
- [Camera controllers](../interaction/camera-controllers.md) — 3D transform and swivel controllers.
- [Shader modules](../shaders/shader-modules.md) — `camera` / `projection` modules and registration.
- [Library utilities](../utilities/library-util.md) — `Camera` source location.
