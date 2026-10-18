---
title: Camera controllers
summary: Built-in event managers that move cameras: BasicCamera2DController (pan, wheel/pinch zoom, bounds), Simple3DTransformController and the unfinished MouseSwivelCameraController.
covers:
  - ui/src/2d/view/basic-camera-2d-controller.ts
  - ui/src/3d/view/simple-3d-transform-controller.ts
  - ui/src/3d/view/mouse-swivel-camera-controller.ts
related:
  - interaction/event-management.md
  - 2d/view-and-camera.md
  - 3d/view-and-projection.md
  - 3d/scene-graph.md
status: complete
verified-at: 7323839e
---

## Purpose

Camera controllers are `SimpleEventHandler` subclasses (see
[Event management](event-management.md)) that translate mouse/touch interactions into camera or
transform changes. Add one to `ISurfaceOptions.eventManagers` (React:
`BasicCamera2DControllerJSX`, `Simple3DTransformControllerJSX`).

## Key files

- `ui/src/2d/view/basic-camera-2d-controller.ts` — `BasicCamera2DController`, `IBasicCamera2DControllerOptions`, `ICameraBoundsOptions`, `CameraBoundsAnchor`.
- `ui/src/3d/view/simple-3d-transform-controller.ts` — `Simple3DTransformController`, `ISimple3DTransformControllerOptions`: rotates/scales an `Instance3D`.
- `ui/src/3d/view/mouse-swivel-camera-controller.ts` — `MouseSwivelCameraController`, `IMouseSwivelCameraController`: pointer-lock capture only (not exported from `ui/src/3d/view/index.ts`).
- `ui/src/base-surfaces/react-surface/event-managers/basic-camera-2d-controller-jsx.tsx` — JSX wrapper; `config` applied once on mount, `disabled` / `disableDragPanning` props kept in sync.

## How it works

### BasicCamera2DController

Manipulates a `Camera2D` through `camera.control2D` (`getOffset()`, `getScale()`, `setScale`,
`setOffset`, `animation`). See [2D view and camera](../2d/view-and-camera.md).

Options (`IBasicCamera2DControllerOptions`):

| Option | Effect |
|---|---|
| `camera` | `Camera2D` to drive (required) |
| `startView` | View id or ids where a gesture must start; empty means any view (mouse). Also installs `control2D.setViewChangeHandler` so `onRangeChanged` fires for camera changes on `startViews[0]` |
| `ignoreCoverViews` | Allow starting on a start view covered by other views (uses `e.target.views` / `touch.start.views`) |
| `bounds` | `ICameraBoundsOptions`: `view`, `worldBounds`, `screenPadding`, `anchor`, optional `scaleMin`/`scaleMax` |
| `scaleFactor` | Wheel zoom divisor, default 1000 (larger = slower) |
| `pinchScaleFactor` | Divisor used for ctrl+wheel (trackpad pinch) when `wheelShouldScroll`, default 100 |
| `wheelShouldScroll` | Wheel pans; ctrl+wheel zooms |
| `twoFingerPan` | Touch pan needs at least two valid touches |
| `panFilter(offset, view, allViews)` | Rewrite each pan delta (world units) |
| `scaleFilter(scale, view, allViews, isPinch)` | Rewrite each scale delta |
| `onRangeChanged(camera, projection)` | Called after every pan/zoom/setOffset/setRange |

Public flags: `disabled`, `disableDragPanning`, read-only `isPanning`, `isScaling`, `pan`, `scale`.

Gesture mapping:

- `handleMouseDown` → `findCoveredStartView`; `isPanning` if `canStart(e.start.view.id)`.
  `canStart` is false when `disabled`; otherwise true if `startViews` is empty, contains the id, or
  a covered start view was found and `ignoreCoverViews` is set.
- `handleDrag` → unless `disableDragPanning`, marks every view under the pointer
  `optimizeRendering = true`, then `doPan(views, e.start.view, e.mouse.deltaPosition)`.
  `doPan` divides the screen delta by the current scale, applies `panFilter`, adds it to the offset,
  then `applyBounds` → `onRangeChanged` → `applyBounds`. The camera animation is set to
  `AutoEasingMethod.immediate` so panning does not ease.
- `handleMouseUp` → stops panning and resets `optimizeRendering` on the flagged views.
- `handleWheel` → zoom: delta scale `wheel.delta[1] / scaleFactor * currentScale` per axis, applied
  by `doScale` around `e.screen.position` (the world point under the cursor stays fixed:
  `screenToWorld` before and after, offset corrected by the difference), honouring `scaleMin`/
  `scaleMax`. With `wheelShouldScroll` and no ctrl key it pans by `[-delta[0], delta[1]]` instead.
  Requires `handlesWheelEvents` on the surface.
- Touch: `handleTouchDown` filters `allTouches` with `touchesHasStartView(startViews)` (or
  `touchesContainsStartView` with `ignoreCoverViews`); one valid touch (two with `twoFingerPan`)
  pans, two or more also scale. `handleTouchDrag` pans by `e.multitouch.centerDelta(validTouches)`
  and pinch-zooms by the ratio of the first touch's distance to the touch centroid between the
  previous and current frame. `handleTouchUp` / `handleTouchCancelled` drop ended touches.

Programmatic control: `setRange(worldBounds, viewId)`, `getRange(viewId)`,
`centerOn(viewId, position)`, `setOffset(viewId, offset)` (jumps immediately, then restores the
camera's previous animation), `setBounds(bounds)`, `applyBounds()`, `applyScaleBounds()`,
`setRangeChangeHandler(handler)`.

Bounds: `boundsHorizontalOffset` / `boundsVerticalOffset` clamp the offset so `worldBounds` (plus
`screenPadding` in screen pixels) cannot leave the view; when the projected world is smaller than
the view, `anchoredByBoundsHorizontal` / `anchoredByBoundsVertical` place it by `anchor`.

### Simple3DTransformController

Options: `target: Instance3D`, `camera: Camera` (`setCamera` replaces it). Left-button drag
rotates `target.localRotation` by quaternions about the camera's up axis (dx) and right axis (dy),
read from columns of `camera.transform.matrix`, at 0.01 rad/pixel. Wheel multiplies
`target.localScale` uniformly by `1 + delta[1] * 0.001`, clamped to [0.1, 10]. Rotation is about the
target's own origin; the camera is never moved. See [Scene graph](../3d/scene-graph.md).

### MouseSwivelCameraController

Options: `camera`, `view` (view key), `captureMouse`, `ignoreCoveringViews`. On click (or mouse
move with `captureMouse`) over the configured view it calls `canvas.requestPointerLock()` and
listens to `pointerlockchange`. `handleSwivel` is a `// TODO` and nothing reads `camera`: no
swivel or WASD movement is implemented despite the class comment.

## Extension points

- New controller: extend `SimpleEventHandler`, override the `handle*` methods you need, register it
  in `eventManagers`; for React wrap it like `BasicCamera2DControllerJSX` with
  `surfaceJSXType = SurfaceJSXType.EVENT_MANAGER` and `props.resolver?.resolve(instance)`.
- Constrain 2D motion without subclassing: `panFilter` (e.g. zero `[1]` to lock the y axis),
  `scaleFilter` (per-axis zoom), `bounds`.
- React to camera motion: `onRangeChanged` / `setRangeChangeHandler`.

## Gotchas

- With no `startView`, mouse panning works anywhere but touch never pans: the touch filters match
  start view ids against an empty list.
- `disabled` is only checked by `canStart` (mouse down, drag, wheel); touch pan/pinch ignores it.
- `disableDragPanning` blocks mouse drag panning and, on touch, returns before the pinch-zoom step
  too; wheel panning (`wheelShouldScroll`) still works.
- While dragging, views under the pointer get `optimizeRendering = true`, which also suspends
  picking for them until mouse/touch up.
- `onRangeChanged` from camera animation only fires when `startView` is set (the view-change
  handler is installed only then, and only for the first start view).
- `setRange` passes the pan delta through `scaleFilter`, not `panFilter`.
- `boundsVerticalOffset` divides the top padding by the x scale (`getScale()[0]`); with
  non-uniform scale the top clamp is off.
- `MouseSwivelCameraController.handlePointerLockChange` is a plain method passed to
  `addEventListener`, so `this` is `document` when it runs; the capture bookkeeping does not work.
- `Simple3DTransformController` ignores views: it reacts to drags and wheels anywhere on the
  surface.

## Related

- [Event management](event-management.md) — the interaction objects these controllers consume.
- [2D view and camera](../2d/view-and-camera.md) — `Camera2D`, `Control2D`, `View2D`.
- [3D view and projection](../3d/view-and-projection.md) — `Camera` and 3D projection.
- [Scene graph](../3d/scene-graph.md) — `Instance3D` transforms rotated by `Simple3DTransformController`.
