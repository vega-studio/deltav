---
title: Event management
summary: How DOM mouse/touch input becomes view-aware interactions broadcast to EventManager subclasses (UserInputEventManager, SimpleEventHandler, QueuedEventHandler).
covers:
  - ui/src/event-management
related:
  - interaction/picking.md
  - interaction/camera-controllers.md
  - surface/surface.md
  - surface/render-loop.md
  - surface/views-and-scenes.md
status: complete
verified-at: 7323839e
---

## Purpose

A `Surface` owns one `UserInputEventManager` that listens to the canvas (and the document during
drags), turns raw mouse/touch events into interaction objects that know which views are under the
pointer and where the pointer is in each view, and broadcasts them to a list of `EventManager`
instances. Camera controllers, layer picking and user handlers are all `EventManager`s.

## Key files

- `ui/src/event-management/event-manager.ts` — `EventManager`: abstract base with one `handle*` method per gesture, view/projection lookups, `willRender`/`didRender` hooks.
- `ui/src/event-management/user-input-event-manager.ts` — `UserInputEventManager`: DOM listeners, metrics tracking, view hit testing (quad tree), interaction construction, broadcast.
- `ui/src/event-management/simple-event-handler.ts` — `SimpleEventHandler`: every handler a no-op; constructor `Object.assign`s a `Partial<EventManager>` of overrides.
- `ui/src/event-management/queued-event-handler.ts` — `QueuedEventHandler`: stores events and replays them on `dequeue()`.
- `ui/src/event-management/types.ts` — `MouseButton`, `IEventInteraction`, `IMouseInteraction`, `ITouchInteraction`, `ISingleTouchInteraction`, `IMultiTouchInteraction`, `IMouseMetrics`, `ITouchMetrics`, `IWheelMetrics`.

## How it works

### Wiring

`Surface.initUserInputManager` builds the manager list as `[new LayerMouseEvents(), ...options.eventManagers]`
and constructs `new UserInputEventManager(canvas, surface, eventManagers, options.handlesWheelEvents)`.
The constructor calls `setControllers` (which calls `EventManager.setUserInputManager(this)` on each
manager, giving it `this.surface`, `getView`, `getProjection`, `getViewScreenBounds`) and
`addContextListeners`. `LayerMouseEvents` is always first; it feeds layer picking (see
[Picking](picking.md)). Managers are notified in array order.

Each frame, `Surface.draw` calls `broadcastEventManagerCycle`: `willRender()` on every manager before
committing/drawing and `didRender()` after. After the first draw (and after every resize, which sets
`waitingForRender = true` via `UserInputEventManager.resize`) the surface sets
`waitingForRender = false`, whose setter rebuilds `quadTree` from every scene view's `screenBounds`.

### Hit testing and coordinates

`getViewsUnderPosition(screenPos)` queries the `QuadTree` of view `screenBounds` and sorts by view
`depth` (top-most first). `makeMouseInteraction` / `makeSingleTouchInteraction` build an
`IEventInteraction`:

| Field | Content |
|---|---|
| `screen.position` | Pointer position in canvas pixels (`eventElementPosition` from `ui/src/util/mouse.ts`) |
| `start.view` / `start.position` | View where the gesture began and the start point converted with `view.projection.screenToView` |
| `start.views` | Every view under the start point, each with its view-relative position |
| `target.view` / `target.position` | Top-most view under the current point (a hidden `NoView` placeholder when none) |
| `target.views` | Every view under the current point, top-most first |
| `canvas` | The canvas, `undefined` for an `OffscreenCanvas` |

The latest interaction is stored in `currentInteraction` (read through `Surface.getCurrentInteraction`,
which picking uses for the pixel location).

### Mouse flow

Listeners are assigned as element properties (`onmousedown`, `onmousemove`, `onmouseleave`,
`onmouseup`, `onwheel`), not `addEventListener`, except `DOMMouseScroll`.

- `onmousemove` → `handleMouseMove` (metrics created lazily; `canClick = false`).
- `onmousedown` (only if a view is under the pointer) → `handleMouseDown`, then installs
  `document.onmousemove` → `handleDrag`, `document.onmouseover` → `handleMouseOver`,
  `document.onmouseup` (clears the document handlers), and `element.onmouseup` → `handleMouseUp`,
  then `handleClick` if `canClick` is still true and less than 1000 ms (`VALID_CLICK_DELAY`) elapsed.
  Any mouse move sets `canClick = false`, so a click requires zero movement.
- `onmouseleave` → `handleMouseOut`.
- Wheel (only when `handlesWheelEvents`) → `handleWheel`, with `mouse.wheel.delta` from
  `normalizeWheel` (`[pixelX, pixelY]`); the DOM event gets `preventDefault`/`stopPropagation`.

`IMouseMetrics` carries `start`, `currentPosition`, `previousPosition`, `deltaPosition`,
`startTime`, `startView`, `button` (`MouseButton`), `canClick`, `event` and `wheel`.

### Touch flow

`ontouchstart` creates an `ITouchMetrics` per new touch (`trackedTouches` keyed by
`Touch.identifier`) and records `startRelative` positions between touches, then broadcasts
`handleTouchDown`. Move/end/cancel handlers are attached to both the element and the document.

- `ontouchmove` → `handleTouchDrag` for touches whose position changed (`canTap = false`).
- `ontouchend` → `handleTap` per ended touch still `canTap` and younger than 200 ms
  (`VALID_TAP_DELAY`), then `handleTouchUp`.
- `ontouchcancel` → `handleTouchCancelled`.

An `ITouchInteraction` has `touches` (the touches this event is about), `allTouches` (all live
touches) and `multitouch`, an `IMultiTouchInteraction` whose query methods (`center`,
`centerDelta`, `centerStart`, `spread`, `spreadDelta`, `spreadStart`, `rotation`,
`rotationDelta`, `rotationStart`, `id`) compute metrics on demand for any subset of touches.

### Handler classes

- `SimpleEventHandler` — subclass it and override a few methods, or pass overrides:
  `new SimpleEventHandler({ handleClick: (e) => … })`.
- `QueuedEventHandler(handlers, preserveEvents = false)` — each `handle*` records the call; with
  `preserveEvents` false only the latest event per handler is kept (a `Map` keyed by the handler
  function), with true every event is kept in arrival order. `dequeue()` replays mouse events, then
  touch events, then clears the queues; an exception aborts the rest of that batch (logged).
  Nothing calls `dequeue()` for you unless you override `willRender`/`didRender` as
  `LayerMouseEvents` does.

## Extension points

- Custom input behaviour: extend `SimpleEventHandler` (or `EventManager` and implement every
  abstract `handle*`), pass it in `ISurfaceOptions.eventManagers` (React: `SimpleEventHandlerJSX`,
  `QueuedEventHandlerJSX` or any component tagged `SurfaceJSXType.EVENT_MANAGER`, in
  `ui/src/base-surfaces/react-surface/event-managers/`).
- Frame-synchronised work: override `EventManager.willRender` / `didRender`.
- Coalescing high-rate input to one call per frame: `QueuedEventHandler` + call `dequeue()` from
  `willRender`.
- Wheel input requires `ISurfaceOptions.handlesWheelEvents: true`.

## Gotchas

- Only these gestures are ever dispatched by `UserInputEventManager`: mouse down/up/move/over/out,
  click, drag, wheel, touch down/up/drag/cancelled and tap. `handleTouchOut`, `handleDoubleTap`,
  `handleLongTouch`, `handleLongTap`, `handlePinch`, `handleSpread`, `handleTouchRotate` and
  `handleSwipe` are declared but never called; derive pinch/rotate from `e.multitouch` in
  `handleTouchDrag` instead.
- No events are produced while `waitingForRender` is true (before the first draw and after every
  resize until the next draw); mouse down/wheel/touch start over no view are dropped entirely.
- `handleMouseOver` fires from `document.onmouseover` during a drag, not on entering the canvas.
- `QueuedEventHandler.dequeue` calls stored handler functions unbound (`handler(event)`), so
  handlers passed to it must not rely on `this`; use arrow functions or closures.
- With `preserveEvents` false, a frame that receives several moves delivers only the last one;
  deltas between intermediate events are lost.
- `setControllers` is called once by the constructor; the manager list is fixed at surface
  creation.
- `UserInputEventManager.destroy` nulls `onmousedown`/`onmousemove`/`onmouseleave`, `onmousewheel`
  and the `DOMMouseScroll` listener, but not `onwheel`, `onmouseup` or the touch handlers.
- `OffscreenCanvas` contexts get no listeners at all.

## Related

- [Picking](picking.md) — `LayerMouseEvents`, the built-in manager that routes events to layers.
- [Camera controllers](camera-controllers.md) — `EventManager`s that move cameras.
- [Surface](../surface/surface.md) — `ISurfaceOptions.eventManagers`, `handlesWheelEvents`.
- [Render loop](../surface/render-loop.md) — where `willRender`/`didRender` fire.
- [Views and scenes](../surface/views-and-scenes.md) — view `screenBounds`, depth and projections.
