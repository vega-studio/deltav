---
title: 2D view and camera
summary: View2D, Camera2D and the 2D shader modules: world-to-screen projection for 2D scenes.
covers:
  - ui/src/2d/view
  - ui/src/2d/shader-modules
related:
  - 2d/layers.md
  - interaction/camera-controllers.md
  - surface/views-and-scenes.md
  - shaders/shader-modules.md
  - math/projection-and-geometry.md
status: complete
verified-at: d80bb72a
---

## Purpose

The 2D system layers a simple "offset + scale" camera (`Control2D`) on top of a real orthographic
`Camera`, so 2D layers can work in world coordinates with a pan/zoom model while the GPU still uses
ordinary view/projection matrices. `View2D` fits that orthographic camera to its viewport (origin
top-left, +y down, 1 world unit = 1 CSS pixel at scale 1), `Projection2D` converts points between
screen, view and world space on the CPU, and the `world2D` shader module gives every `Layer2D` the
matching GLSL functions (`clipSpace`, `cameraSpace`, ...).

## Key files

- `ui/src/2d/view/view-2d.ts` — `View2D`, `IView2DProps` (requires a `Camera2D`); fits the camera to the viewport.
- `ui/src/2d/view/camera-2d.ts` — `Camera2D`: orthographic `Camera` plus a `control2D` (`scale2D`, `offset` getters).
- `ui/src/2d/view/control-2d.ts` — `Control2D`, `IControl2DOptions`: animated offset/scale, `centerOn`, view-change broadcast.
- `ui/src/2d/view/reference-camera-2d.ts` — `ReferenceCamera2D`, `IReferenceCamera2DOptions`: read-only camera that mirrors (and filters) another `Camera2D`.
- `ui/src/2d/view/projection-2d.ts` — `Projection2D`: `screenToWorld`, `worldToScreen`, `viewToWorld`, `worldToView`, `screenRay`.
- `ui/src/2d/view/layer-2d.ts` — `Layer2D`, `ILayer2DProps`: base class of every 2D layer; adds the `world2D` shader module.
- `ui/src/2d/view/basic-camera-2d-controller.ts` — `BasicCamera2DController` (pan/zoom input); documented in [Camera controllers](../interaction/camera-controllers.md).
- `ui/src/2d/shader-modules/world-2d.shader.ts` — registers shader module `world2D` (camera uniforms).
- `ui/src/2d/shader-modules/shader-fragments/world-2d-projection.vs` — GLSL `cameraSpace`, `cameraSpaceSize`, `clipSpace`, `clipSpaceSize`.
- `ui/src/2d/types.ts` — `AnchorType`, `Anchor`, `ScaleMode` shared by 2D layers (see [2D layers](layers.md)).
- `ui/src/2d/index.ts` — barrel; its `import "./shader-modules"` is what registers `world2D`.

## How it works

### Coordinate model

World → camera space is `(world + offset) * scale` per axis, where `offset` and `scale` are the
`Control2D` values (`Vec3`). The underlying orthographic camera then maps camera space to clip
space. CPU and GPU use the same formula:

- GLSL (`world-2d-projection.vs`): `cameraSpace(world) = (world + cameraOffset) * cameraScale2D`,
  `clipSpace(world) = viewProjection * vec4(cameraSpace(world), 1.0)`. The `*Size` variants skip
  the offset (and use `w = 0.0`) for converting extents.
- CPU (`Projection2D`): `worldToView(p) = p * scale2D + offset * scale2D`, `viewToWorld` is the
  inverse. `screenToWorld` first calls `BaseProjection.screenToView` (subtract
  `screenBounds.x/y`), `worldToScreen` ends with `viewToScreen`. `screenRay` returns the ray
  `[[x, y, 0], [x, y, -1]]` through the world point.

So panning right means decreasing `offset[0]`; zooming means changing `scale`. Scale is per axis:
`scale[0] != scale[1]` gives an anisotropic zoom (several layers special-case this, see
[2D layers](layers.md)).

### View2D.fitViewtoViewport

Called by the surface when view sizes are computed. When the camera is orthographic it:

1. Sets `projectionOptions` to a viewport centred on 0 (`left = -width/2` ... `top = height/2`,
   `near = -100`, `far = 10000000`), where `width/height` are `viewBounds` (device pixels).
2. Puts the camera at `[width / (2 * pixelRatio), height / (2 * pixelRatio), z]`, sets
   `camera.scale = [1 / pixelRatio, -1 / pixelRatio, 1]` (the negative y flips to +y down) and
   looks down -z.
3. Stores `viewBounds` on `projection` and recomputes `projection.screenBounds` in CSS pixels.

A non-orthographic camera only logs `"View2D does not support non-orthographic cameras."`.
`View2D.willUpdateProps` swaps `projection.camera` when the `camera` prop changes.

### Camera2D and Control2D

`new Camera2D(options?: IControl2DOptions)` builds an orthographic `Camera` and a `Control2D`
seeded with `options.offset` / `options.scale` (copied). `camera.scale2D` and `camera.offset` read
`control2D.scale` / `control2D.offset`.

`Control2D` keeps target values (`getOffset()`, `getScale()`) and animated values (the `offset` /
`scale` getters). `setOffset(v)` / `setScale(v)` record the current animated value as the start,
store the target, stamp a start time and compute `animationEndTime` from `animation.duration`.
The getters evaluate `animation.cpu(start, target, (now - startTime) / duration)`, where `now` is
`surface.frameMetrics.currentTime` (0 when `control2D.surface` is unset). `animation` defaults to
`AutoEasingMethod.immediate(0)`, i.e. jumps. `centerOn(viewId, position)` moves the offset so
`position` sits at the centre of the named view, using `surface.getViewSize`; it always applies
immediately.

`setViewChangeHandler(fn)` installs `onViewChange`; when one is installed, setters and getters
flag `needsBroadcast`, and `Control2D.broadcast(viewId)` calls `fn(camera, viewId)` at most once
per flag. `BasicCamera2DController` installs this handler when it has `startView`s.

### ReferenceCamera2D

`new ReferenceCamera2D({ base, offsetFilter?, scaleFilter? })` creates a `Camera2D` whose
`control2D` is a private `ReferenceControl2D`: its `offset`/`scale` getters return
`filter(base.control2D.offset|scale)` and its setters are no-ops; assigning `control2D` is a
no-op too. Typical use: a side list that follows only the y offset of a chart camera
(`offsetFilter: o => [0, o[1], 0]`).

### Layer2D and the world2D module

`Layer2D.baseShaderModules` appends `"world2D"` to the vertex modules, so every 2D layer's vertex
shader can call `clipSpace` etc. without importing anything. The module (registered once via
`ShaderModule.register` in `world-2d.shader.ts`, `compatibility: ShaderInjectionTarget.ALL`)
supplies these uniforms, all read from `layer.view.props.camera` each frame:

| Uniform | Type | Source |
|---|---|---|
| `projection`, `view`, `viewProjection` | mat4 | `camera.projection`, `.view`, `.viewProjection` |
| `cameraOffset` | vec3 | `camera.control2D.offset` (0 for a non-`Camera2D`) |
| `cameraPosition`, `cameraScale` | vec3 | `camera.position`, `camera.scale` |
| `cameraScale2D` | vec3 | `camera.scale2D` (1 for a non-`Camera2D`) |
| `cameraRotation` | vec3 | `camera.scale` (see Gotchas) |
| `viewSize` | vec2 | `view.viewBounds.width/height` (device pixels) |
| `pixelRatio` | float | `view.pixelRatio` |

Screen-space layers (circles, rings, screen-curve edges) use the idiom
`(clipSpace(p).xy + 1.0) * 0.5 * viewSize` to get a pixel position, offset in pixels, then convert
back with `(v / viewSize) * 2.0 - 1.0`.

## Extension points

- New 2D layer: subclass `Layer2D<TInstance, TProps extends ILayer2DProps<TInstance>>` and
  implement `initShader()`; call `clipSpace(vec3(worldXY, depth))` in the vertex shader. See
  [Authoring a layer](../shaders/authoring-a-layer.md).
- Different projection: subclass `BaseProjection` (`ui/src/math/base-projection.ts`) or
  `Projection2D` and assign it to a `View2D` subclass's `projection`.
- Linked cameras: `ReferenceCamera2D` with `offsetFilter` / `scaleFilter`.
- Animated camera moves: set `control2D.animation` to an `IAutoEasingMethod<Vec3>` (e.g.
  `AutoEasingMethod.easeInOutCubic(500)`) before `setOffset` / `setScale`, and set
  `control2D.surface` so time advances.
- Using 2D layers inside a 3D view: `createLayer2Din3D` and the `world2DXY|XZ|YZ` modules
  (`ui/src/3d/view/layer-2d-in-3d.ts`, see [3D view and projection](../3d/view-and-projection.md)).

## Gotchas

- `Control2D.surface` is never assigned anywhere in the library. Until you set it, the current
  time is always 0: non-immediate animations never progress (the getter keeps returning the start
  value), and `centerOn` plus the controller's view-size-dependent features silently return.
- The surface's render loop calls `Camera.broadcast` (the base `onChange` hook), not
  `Control2D.broadcast`, and reads `camera.animationEndTime` from the base `Camera`, not
  `Control2D.animationEndTime`; a running `Control2D` animation does not by itself keep the
  surface redrawing.
- The `cameraRotation` uniform is fed `camera.scale`, not a rotation.
- `View2D.defaultProps.camera` and `Projection2D`'s fallback camera are single shared
  `Camera2D` instances; always pass your own `camera` to each view that needs independent
  control.
- `viewSize` is in device pixels (`viewBounds`), while world units at scale 1 are CSS pixels;
  shaders multiply by `pixelRatio` where needed.
- Changing `View2D` to a perspective camera is unsupported (only a warning is logged).
- Without `import` of `ui/src/2d` (or `ui/src/2d/shader-modules`) the `world2D` module is not
  registered and 2D shaders fail to compile; the package entry point imports it.

## Related

- [2D layers](layers.md) — the built-in layers that use this projection.
- [Labels](labels.md) — text layers, which rely on `cameraScale2D` for scale modes.
- [Camera controllers](../interaction/camera-controllers.md) — `BasicCamera2DController` pan/zoom input.
- [Views and scenes](../surface/views-and-scenes.md) — `View`, viewports and how views are sized.
- [Shader modules](../shaders/shader-modules.md) — how `world2D` is registered and injected.
- [Projection and geometry](../math/projection-and-geometry.md) — `BaseProjection` and rays.
