import { Bounds } from "../primitives";
import { LayerScene } from "../surface/layer-scene";
import { Surface } from "../surface/surface";
import { View } from "../surface/view";
import {
  add2,
  ChartCamera,
  isDefined,
  length2,
  scale2,
  subtract2,
  Vec2,
  ViewCamera
} from "../util";
import { Camera } from "../util/camera";
import { eventElementPosition, normalizeWheel } from "../util/mouse";
import { QuadTree } from "../util/quad-tree";
import { EventManager } from "./event-manager";
import {
  IMouseInteraction,
  IMouseMetrics,
  IMultiTouchInteraction,
  IMultiTouchMetrics,
  ISingleTouchInteraction,
  ITouchInteraction,
  ITouchMetrics,
  IWheelMetrics
} from "./types";

// If a mouse up after a mouse down happens before this many milliseconds, a click gesture will happen
const VALID_CLICK_DELAY = 1e3;
const VALID_TAP_DELAY = 200;

const emptyView: View = new View(
  new LayerScene(undefined, { key: "error", layers: [], views: [] }),
  {
    key: "error",
    viewport: {},
    viewCamera: new ViewCamera(Camera.defaultCamera()),
    camera: new ChartCamera()
  }
);

emptyView.fitViewtoViewport(
  new Bounds({ x: 0, y: 0, width: 100, height: 100 })
);

function sortByDepth(a: Bounds<View>, b: Bounds<View>) {
  if (b.d && a.d) return b.d.depth - a.d.depth;
  return 0;
}

/**
 * Sorts touch metrics by the identifier for the touch
 */
function sortByIdentifier(a: ITouchMetrics, b: ITouchMetrics) {
  return a.touch.identifier - b.touch.identifier;
}

/**
 * This manages mouse events on the provided canvas and provides some higher level
 * interactions with the surface.
 */
export class UserInputEventManager {
  /** This is the canvas context we are rendering to */
  context: HTMLCanvasElement;
  /** This is list of Event Managers that receive the events and gestures which perform the nexessary actions */
  controllers: EventManager[];
  /** This is the quad tree for finding intersections with the mouse */
  quadTree: QuadTree<Bounds<View>>;
  /** The parent layer surface this event manager is beneath */
  surface: Surface;
  /** The events created that need to be removed */
  eventCleanup: [string, EventListenerOrEventListenerObject][] = [];

  /**
   * This flag is set when the system is waiting to render the elements to establish bounds.
   * No Mouse interations will happen while this is set to true.
   */
  private _waitingForRender: boolean = true;

  get waitingForRender() {
    return this._waitingForRender;
  }

  set waitingForRender(val: boolean) {
    this._waitingForRender = val;

    // When we're no longer waiting for render to occur we update all of our views in the quad tree
    if (!val) {
      this.quadTree = new QuadTree(0, 0, 0, 0);
      const scenes = this.scenes;
      const bounds = [];

      for (let i = 0, iMax = scenes.length; i < iMax; ++i) {
        const scene = scenes[i];

        for (let k = 0, kMax = scene.views.length; k < kMax; ++k) {
          const view = scene.views[k];
          bounds.push(view.screenBounds);
        }
      }

      this.quadTree.addAll(bounds);
    }
  }

  get scenes(): LayerScene[] {
    if (!this.surface || !this.surface.sceneDiffs) return [];
    return this.surface.sceneDiffs.items;
  }

  constructor(
    canvas: HTMLCanvasElement,
    surface: Surface,
    controllers: EventManager[],
    handlesWheelEvents?: boolean
  ) {
    this.context = canvas;
    this.surface = surface;
    this.setControllers(controllers);
    this.addContextListeners(handlesWheelEvents);
  }

  /**
   * This sets up the DOM events to listen to the events that are broadcasted by the canvas.
   * These events are set up in such a way as to continue some events when the user
   * drags the mouse off of the browser or off the canvas without releasing.
   */
  addContextListeners(handlesWheelEvents?: boolean) {
    // Enable mouse support
    this.addMouseContextListeners(handlesWheelEvents);
    // Enable touch support
    this.addTouchContextListeners();
  }

  /**
   * Adds all listeners needed to make the mouse interact with the context.
   */
  private addMouseContextListeners(handlesWheelEvents?: boolean) {
    const element = this.context;
    // This will store the metrics calculated and found for the mouse
    let mouseMetrics: IMouseMetrics | undefined;
    // This is a special flag that aids in managing when the mouse is moving over a document AND the element. Both can
    // not calculate the movements of the mouse at the same time, lest they fry the delta information before both events
    // get processed by the managers.
    let elementMovedBeforeDocMoved = false;

    if (handlesWheelEvents) {
      const wheelHandler = (event: MouseWheelEvent) => {
        const mouse = eventElementPosition(event, element);
        const viewsUnderMouse = this.getViewsUnderPosition(mouse);
        if (viewsUnderMouse.length <= 0) return;

        mouseMetrics = {
          canClick: false,
          currentPosition: mouse,
          deltaPosition: [0, 0],
          previousPosition: mouse,
          start: mouse,
          startTime: Date.now(),
          startView: viewsUnderMouse[0].d,
          event,
          wheel: this.makeWheel(event),
          button: -1
        };

        const interaction = this.makeMouseInteraction(mouseMetrics);

        this.controllers.forEach(controller => {
          controller.handleWheel(interaction);
        });

        event.stopPropagation();
        event.preventDefault();
      };

      if ("onwheel" in element) {
        element.onwheel = wheelHandler;
      }

      if ("addEventListener" in element) {
        element.addEventListener("DOMMouseScroll", wheelHandler);
        this.eventCleanup.push(["DOMMouseScroll", wheelHandler]);
      }
    }

    element.onmouseleave = (event: any) => {
      // No interactions while waiting for the render to update
      if (this.waitingForRender || !mouseMetrics) return;

      const mouse = eventElementPosition(event, element);
      mouseMetrics.deltaPosition = subtract2(
        mouse,
        mouseMetrics.currentPosition
      );
      mouseMetrics.previousPosition = mouseMetrics.currentPosition;
      mouseMetrics.currentPosition = mouse;
      const interaction = this.makeMouseInteraction(mouseMetrics);

      this.controllers.forEach(controller => {
        controller.handleMouseOut(interaction);
      });
    };

    element.onmousemove = (event: any) => {
      // No interactions while waiting for the render to update
      if (this.waitingForRender) return;
      const mouse = eventElementPosition(event, element);

      if (!mouseMetrics) {
        const viewsUnderMouse = this.getViewsUnderPosition(mouse);

        mouseMetrics = {
          canClick: false,
          currentPosition: mouse,
          deltaPosition: [0, 0],
          previousPosition: mouse,
          start: mouse,
          startTime: Date.now(),
          startView: viewsUnderMouse[0].d,
          event,
          wheel: this.makeWheel(),
          button: -1
        };
      }

      mouseMetrics.deltaPosition = subtract2(
        mouse,
        mouseMetrics.currentPosition
      );
      mouseMetrics.previousPosition = mouseMetrics.currentPosition;
      mouseMetrics.currentPosition = mouse;
      mouseMetrics.canClick = false;
      const interaction = this.makeMouseInteraction(mouseMetrics);

      this.controllers.forEach(controller => {
        controller.handleMouseMove(interaction);
      });

      elementMovedBeforeDocMoved = true;
    };

    element.onmousedown = (event: any) => {
      // No interactions while waiting for the render to update
      if (this.waitingForRender) return;

      const startPosition = eventElementPosition(event, element);
      const downViews = this.getViewsUnderPosition(startPosition);

      // If no views under this view, then we just quick exit with no interactions
      if (downViews.length <= 0) {
        return;
      }

      mouseMetrics = {
        canClick: true,
        currentPosition: startPosition,
        deltaPosition: [0, 0],
        previousPosition: startPosition,
        start: startPosition,
        startTime: Date.now(),
        startView: downViews[0].d,
        event,
        wheel: this.makeWheel(),
        button: event.button
      };

      const interaction = this.makeMouseInteraction(mouseMetrics);

      this.controllers.forEach(controller => {
        controller.handleMouseDown(interaction);
      });

      event.stopPropagation();

      document.onmousemove = (event: any) => {
        if (!mouseMetrics) return;

        if (!elementMovedBeforeDocMoved) {
          const mouse = eventElementPosition(event, element);
          mouseMetrics.deltaPosition = subtract2(
            mouse,
            mouseMetrics.currentPosition
          );
          mouseMetrics.previousPosition = mouseMetrics.currentPosition;
          mouseMetrics.currentPosition = mouse;
          mouseMetrics.canClick = false;
        }

        const interaction = this.makeMouseInteraction(mouseMetrics);

        this.controllers.forEach(controller => {
          controller.handleDrag(interaction);
        });

        event.preventDefault();
        event.stopPropagation();

        // Reset the element moved flag so we can see if the doc movement needs to handle the mouse metrics
        elementMovedBeforeDocMoved = false;
      };

      document.onmouseup = _event => {
        document.onmousemove = null;
        document.onmouseup = null;
        document.onmouseover = null;
        mouseMetrics = undefined;
      };

      document.onmouseover = event => {
        if (!mouseMetrics) return;

        const mouse = eventElementPosition(event, element);
        mouseMetrics.deltaPosition = subtract2(
          mouse,
          mouseMetrics.currentPosition
        );
        mouseMetrics.previousPosition = mouseMetrics.currentPosition;
        mouseMetrics.currentPosition = mouse;
        const interaction = this.makeMouseInteraction(mouseMetrics);

        this.controllers.forEach(controller => {
          controller.handleMouseOver(interaction);
        });

        event.stopPropagation();
      };

      element.onmouseup = event => {
        if (!mouseMetrics) return;
        const mouse = eventElementPosition(event, element);
        mouseMetrics.deltaPosition = subtract2(
          mouse,
          mouseMetrics.currentPosition
        );
        mouseMetrics.previousPosition = mouseMetrics.currentPosition;
        mouseMetrics.currentPosition = mouse;
        mouseMetrics.button = event.button;
        const interaction = this.makeMouseInteraction(mouseMetrics);

        this.controllers.forEach(controller => {
          controller.handleMouseUp(interaction);
        });

        // If we release the mouse before the valid click delay
        if (
          mouseMetrics.canClick &&
          Date.now() - mouseMetrics.startTime < VALID_CLICK_DELAY
        ) {
          this.controllers.forEach(controller => {
            controller.handleClick(interaction);
          });
        }

        mouseMetrics = undefined;
      };

      // Text will not be selected when it is being dragged
      const experimental = element as any;
      if (experimental.onselectstart !== undefined) {
        experimental.onselectstart = function() {
          return false;
        };
      } else {
        element.addEventListener("selectstart", function() {
          event.preventDefault();
        });
      }
    };
  }

  /**
   * Adds all the listeners necessary to make the context interactive with multitouch support.
   */
  private addTouchContextListeners() {
    // This is the element we are listening to for touch events
    const element = this.context;
    // This stores the most recent touch metrics associated with a touch by the touch's identifier
    const trackedTouches = new Map<number, ITouchMetrics>();
    // This is the most recent touch interaction event recorded for the touch, identifiable by the touch's identifier
    const currentTouchInteractions = new Map<number, ISingleTouchInteraction>();

    /**
     * Converts Touch interaction list to touch metrics
     */
    function getTouchMetrics(touches: ISingleTouchInteraction[]) {
      return touches.map(t => t.touch);
    }

    /**
     * Gets the touch that happened the most recent.
     */
    function getLatestTouch(touches: ISingleTouchInteraction[]) {
      return touches.reduce(
        (p, n) => (n.touch.startTime > p.touch.startTime ? n : p),
        touches[0]
      );
    }

    /**
     * This is the multitouch query object handed to our controllers so they can query for metrics for multiple touches
     */
    const multiTouchInteraction: IMultiTouchInteraction = {
      center: (touches: ISingleTouchInteraction[]) => {
        if (touches.length <= 0) return [0, 0];

        return this.getTouchCenter(getTouchMetrics(touches));
      },

      centerDelta: (touches: ISingleTouchInteraction[]) => {
        if (touches.length <= 0) return [0, 0];
        const metrics = getTouchMetrics(touches);
        const previous = this.getTouchCenter(
          metrics,
          (touch: ITouchMetrics) => touch.previousPosition
        );
        const current = this.getTouchCenter(metrics);

        return subtract2(current, previous);
      },

      centerStart: (touches: ISingleTouchInteraction[]) => {
        if (touches.length <= 0) return [0, 0];
        const primary = getLatestTouch(touches).touch;

        return this.getTouchCenter(
          getTouchMetrics(touches),
          (touch: ITouchMetrics) => {
            if (touch === primary) {
              return touch.start;
            }

            return touch.startRelative.get(primary) || [0, 0];
          }
        );
      },

      id: (touches: ISingleTouchInteraction[]) => {
        const metrics = getTouchMetrics(touches);

        return metrics
          .sort(sortByIdentifier)
          .map(m => m.touch.identifier)
          .join("_");
      },

      rotation: (touches: ISingleTouchInteraction[]) => {
        if (touches.length <= 0) return 0;
        const metrics = getTouchMetrics(touches);
        const center = this.getTouchCenter(metrics);

        return this.getAverageAngle(metrics, center);
      },

      rotationDelta: (touches: ISingleTouchInteraction[]) => {
        if (touches.length <= 0) return 0;
        const metrics = getTouchMetrics(touches);
        const previousCenter = this.getTouchCenter(
          metrics,
          (touch: ITouchMetrics) => touch.previousPosition
        );
        const previousAngle = this.getAverageAngle(
          metrics,
          previousCenter,
          (touch: ITouchMetrics) => touch.previousPosition
        );
        const currentCenter = this.getTouchCenter(metrics);
        const currentAngle = this.getAverageAngle(metrics, currentCenter);

        return currentAngle - previousAngle;
      },

      rotationStart: (touches: ISingleTouchInteraction[]) => {
        if (touches.length <= 0) return 0;
        const primary = getLatestTouch(touches).touch;
        const metrics = getTouchMetrics(touches);

        const startCenter = this.getTouchCenter(
          metrics,
          (touch: ITouchMetrics) => {
            if (touch === primary) {
              return touch.start;
            }

            return touch.startRelative.get(primary) || [0, 0];
          }
        );

        return this.getAverageAngle(
          metrics,
          startCenter,
          (touch: ITouchMetrics) => {
            if (touch === primary) {
              return touch.start;
            }

            return touch.startRelative.get(primary) || [0, 0];
          }
        );
      },

      spread: (touches: ISingleTouchInteraction[]) => {
        if (touches.length <= 0) return 0;
        const metrics = getTouchMetrics(touches);
        const center = this.getTouchCenter(metrics);

        return this.getAverageDistance(metrics, center);
      },

      spreadDelta: (touches: ISingleTouchInteraction[]) => {
        if (touches.length <= 0) return 0;
        const metrics = getTouchMetrics(touches);
        const previousCenter = this.getTouchCenter(
          metrics,
          (touch: ITouchMetrics) => touch.previousPosition
        );
        const previousSpread = this.getAverageDistance(
          metrics,
          previousCenter,
          (touch: ITouchMetrics) => touch.previousPosition
        );
        const currentCenter = this.getTouchCenter(metrics);
        const currentSpread = this.getAverageDistance(metrics, currentCenter);

        return currentSpread - previousSpread;
      },

      spreadStart: (touches: ISingleTouchInteraction[]) => {
        if (touches.length <= 0) return 0;
        const primary = getLatestTouch(touches).touch;
        const metrics = getTouchMetrics(touches);

        const startCenter = this.getTouchCenter(
          metrics,
          (touch: ITouchMetrics) => {
            if (touch === primary) {
              return touch.start;
            }

            return touch.startRelative.get(primary) || [0, 0];
          }
        );

        return this.getAverageDistance(
          metrics,
          startCenter,
          (touch: ITouchMetrics) => {
            if (touch === primary) {
              return touch.start;
            }

            return touch.startRelative.get(primary) || [0, 0];
          }
        );
      }
    };

    element.ontouchstart = event => {
      event.preventDefault();
      event.stopPropagation();
      const touches = this.getTouches(event);
      const currentTouches: ITouchMetrics[] = [];
      const newTouches: ITouchMetrics[] = [];

      for (let i = 0, iMax = touches.length; i < iMax; ++i) {
        const touch = touches[i];
        const trackedTouch = trackedTouches.get(touch.identifier);

        if (!trackedTouch) {
          const position = eventElementPosition(touch);
          const downViews = this.getViewsUnderPosition(position);
          if (downViews.length <= 0) continue;
          const startView = downViews[0].d;

          const metrics: ITouchMetrics = {
            canTap: true,
            currentPosition: position,
            deltaPosition: [0, 0],
            startTime: Date.now(),
            start: position,
            startView,
            previousPosition: position,
            startRelative: new Map(),
            touch
          };

          // Track the information with the touch
          trackedTouches.set(touch.identifier, metrics);
          // Identify which touches are new
          newTouches.push(metrics);
        } else {
          // Identify existing touches
          currentTouches.push(trackedTouch);
        }
      }

      // If we have a change in touch count, then we have to create relative start positions for all touches that
      // now exists
      if (newTouches.length > 0) {
        const allTouches = newTouches.concat(currentTouches);
        const singleInteractions: ISingleTouchInteraction[] = [];

        for (let i = 0, iMax = newTouches.length; i < iMax; ++i) {
          const newTouch = newTouches[i];

          for (let k = 0, kMax = allTouches.length; k < kMax; ++k) {
            const touch = allTouches[k];

            if (newTouch !== touch) {
              touch.startRelative.set(newTouch, touch.currentPosition);
            }
          }

          // Make the interaction for the single touch
          const interaction = this.makeSingleTouchInteraction(newTouch);
          singleInteractions.push(interaction);
          currentTouchInteractions.set(newTouch.touch.identifier, interaction);
        }

        const downEvent: ITouchInteraction = {
          touches: singleInteractions,
          allTouches: allTouches
            .map(t => currentTouchInteractions.get(t.touch.identifier))
            .filter(isDefined),
          multitouch: multiTouchInteraction
        };

        // Broadcast to the controllers
        this.controllers.forEach(controller => {
          controller.handleTouchDown(downEvent);
        });
      }

      // Add all of the document events
      document.ontouchend = event => {
        documenttouchend.call(document, event);
        document.ontouchend = null;
        document.ontouchcancel = null;
        document.ontouchmove = null;
      };

      document.ontouchcancel = event => {
        documenttouchcancel.call(document, event);
        document.ontouchend = null;
        document.ontouchcancel = null;
        document.ontouchmove = null;
      };

      document.ontouchmove = documenttouchmove;
    };

    const documenttouchend = (element.ontouchend = event => {
      // Prevent document events from handling twice
      event.stopPropagation();
      event.preventDefault();

      // The touches actually ended are in the changed list in the event
      const touches = this.getTouches(event, "changed");
      const allTouches = Array.from(currentTouchInteractions.values());
      const upTouches: ITouchMetrics[] = [];

      for (let i = 0, iMax = touches.length; i < iMax; ++i) {
        const touch = touches[i];
        const touchMetrics = trackedTouches.get(touch.identifier);
        if (!touchMetrics) continue;

        // Detect a tap gesture
        if (
          touchMetrics.canTap &&
          Date.now() - touchMetrics.startTime < VALID_TAP_DELAY
        ) {
          const interactions = [this.makeSingleTouchInteraction(touchMetrics)];

          const tapEvent: ITouchInteraction = {
            touches: interactions,
            allTouches,
            multitouch: multiTouchInteraction
          };

          // Broadcast to the controllers
          this.controllers.forEach(controller => {
            controller.handleTap(tapEvent);
          });
        }

        // Always touch up as the touch is ended
        upTouches.push(touchMetrics);
        trackedTouches.delete(touch.identifier);
        currentTouchInteractions.delete(touch.identifier);
      }

      if (upTouches.length > 0) {
        const interactions = upTouches.map(metrics =>
          this.makeSingleTouchInteraction(metrics)
        );

        const moveEvent: ITouchInteraction = {
          touches: interactions,
          allTouches,
          multitouch: multiTouchInteraction
        };

        // Broadcast to the controllers
        this.controllers.forEach(controller => {
          controller.handleTouchUp(moveEvent);
        });
      }
    });

    const documenttouchmove = (element.ontouchmove = event => {
      // We do not want the move events bubbling to the document to have repeat events broadcasted
      event.stopPropagation();
      event.preventDefault();

      const touches = this.getTouches(event);
      const moved = [];
      const unmoved = [];

      for (let i = 0, iMax = touches.length; i < iMax; ++i) {
        const touch = touches[i];
        const trackedTouch = trackedTouches.get(touch.identifier);

        if (trackedTouch) {
          const position = eventElementPosition(touch);
          const deltaPosition = subtract2(
            position,
            trackedTouch.currentPosition
          );

          if (length2(deltaPosition) <= 0) {
            unmoved.push(trackedTouch);
            Object.assign(trackedTouch, {
              currentPosition: position,
              deltaPosition,
              previousPosition: trackedTouch.currentPosition,
              touch
            });
            continue;
          }

          moved.push(trackedTouch);

          Object.assign(trackedTouch, {
            canTap: false,
            currentPosition: position,
            deltaPosition,
            previousPosition: trackedTouch.currentPosition,
            touch
          });
        }
      }

      if (moved.length > 0) {
        const all = moved.concat(unmoved);
        const interactions = moved.map(metrics =>
          this.makeSingleTouchInteraction(metrics)
        );

        const moveEvent: ITouchInteraction = {
          touches: interactions,
          allTouches: all
            .map(m => currentTouchInteractions.get(m.touch.identifier))
            .filter(isDefined),
          multitouch: multiTouchInteraction
        };

        // Broadcast to the controllers
        this.controllers.forEach(controller => {
          controller.handleTouchDrag(moveEvent);
        });
      }
    });

    const documenttouchcancel = (element.ontouchcancel = event => {
      // Prevent the document events from firing twice
      event.stopPropagation();
      event.preventDefault();

      // The touches actually ended are in the changed list in the event
      const touches = this.getTouches(event, "changed");
      const allTouches = Array.from(currentTouchInteractions.values());
      const upTouches: ITouchMetrics[] = [];

      for (let i = 0, iMax = touches.length; i < iMax; ++i) {
        const touch = touches[i];
        const touchMetrics = trackedTouches.get(touch.identifier);
        if (!touchMetrics) continue;
        // Always touch up as the touch is ended
        upTouches.push(touchMetrics);
        trackedTouches.delete(touch.identifier);
        currentTouchInteractions.delete(touch.identifier);
      }

      if (upTouches.length > 0) {
        const interactions = upTouches.map(metrics =>
          this.makeSingleTouchInteraction(metrics)
        );

        const moveEvent: ITouchInteraction = {
          touches: interactions,
          allTouches,
          multitouch: multiTouchInteraction
        };

        // Broadcast to the controllers
        this.controllers.forEach(controller => {
          controller.handleTouchCancelled(moveEvent);
        });
      }
    });
  }

  /**
   * This takes all of the touches and averages their distance from the center point.
   */
  getAverageDistance(
    touches: ITouchMetrics[],
    center: Vec2,
    accessor?: (touch: ITouchMetrics) => Vec2
  ): number {
    let total = 0;
    if (touches.length <= 0) return total;
    if (!accessor) accessor = (touch: ITouchMetrics) => touch.currentPosition;

    for (let i = 0, iMax = touches.length; i < iMax; ++i) {
      const touch = touches[i];
      total += length2(subtract2(accessor(touch), center));
    }

    return total / touches.length;
  }

  /**
   * This takes all of the touches and averages their angle around the center point.
   */
  getAverageAngle(
    touches: ITouchMetrics[],
    center: Vec2,
    accessor?: (touch: ITouchMetrics) => Vec2
  ): number {
    let total = 0;
    if (touches.length <= 0) return total;
    if (!accessor) accessor = (touch: ITouchMetrics) => touch.currentPosition;

    for (let i = 0, iMax = touches.length; i < iMax; ++i) {
      const touch = touches[i];
      const direction = subtract2(accessor(touch), center);
      let angle = Math.atan2(direction[1], direction[0]);
      if (angle < 0) angle += Math.PI * 2;
      total += angle;
    }

    return total / touches.length;
  }

  /**
   * This takes a list of touches and averages their position for a mid point between all of them.
   */
  getTouchCenter(
    touches: ITouchMetrics[],
    accessor?: (touch: ITouchMetrics) => Vec2
  ): Vec2 {
    let total: Vec2 = [0, 0];
    if (touches.length <= 0) return total;
    if (!accessor) accessor = (touch: ITouchMetrics) => touch.currentPosition;

    for (let i = 0, iMax = touches.length; i < iMax; ++i) {
      const touch = touches[i];
      const position = accessor(touch);
      total = add2(total, position);
    }

    return scale2(total, 1 / touches.length);
  }

  /**
   * Retrieves all touches from a touch event. This normalizes the touch information across: touches, changedTouches,
   * and targetTouches
   */
  getTouches(event: TouchEvent, category?: "touches" | "changed" | "target") {
    const touches = new Map<number, Touch>();

    if (
      event.touches &&
      event.touches.length > 0 &&
      (!category || category === "touches")
    ) {
      for (let i = 0, iMax = event.touches.length; i < iMax; ++i) {
        const touch = event.touches.item(i);
        if (!touch) continue;
        touches.set(touch.identifier, touch);
      }
    }

    if (
      event.changedTouches &&
      event.changedTouches.length > 0 &&
      (!category || category === "changed")
    ) {
      for (let i = 0, iMax = event.changedTouches.length; i < iMax; ++i) {
        const touch = event.changedTouches.item(i);
        if (!touch) continue;
        touches.set(touch.identifier, touch);
      }
    }

    if (
      event.targetTouches &&
      event.targetTouches.length > 0 &&
      (!category || category === "target")
    ) {
      for (let i = 0, iMax = event.targetTouches.length; i < iMax; ++i) {
        const touch = event.targetTouches.item(i);
        if (!touch) continue;
        touches.set(touch.identifier, touch);
      }
    }

    return Array.from(touches.values());
  }

  /**
   * Retrieves the view for the provided id
   */
  getView(viewId: string): View | null {
    const scenes = this.scenes;

    for (let i = 0, iMax = scenes.length; i < iMax; ++i) {
      const scene = scenes[i];
      const view = scene.viewDiffs.getByKey(viewId);
      if (view) return view;
    }

    return null;
  }

  /**
   * Retrieves the views underneath the mouse with the top most view as
   * the first view in the list.
   */
  getViewsUnderPosition = (mouse: Vec2) => {
    // Find the views the mouse has interacted with
    const hitViews = this.quadTree.query(mouse);
    // Sort them by depth
    hitViews.sort(sortByDepth);

    return hitViews;
  };

  /**
   * This makes the metrics for interactions with the views.
   */
  makeMouseInteraction(mouse: IMouseMetrics): IMouseInteraction {
    // Find the views the mouse has interacted with
    const hitViews = this.getViewsUnderPosition(mouse.currentPosition);
    let targetSceneView = hitViews[0] && hitViews[0].d;
    if (!targetSceneView) targetSceneView = emptyView;
    const startViews = this.getViewsUnderPosition(mouse.start);
    let startView = mouse.startView;
    if (!startView) startView = emptyView;

    return {
      mouse,
      screen: {
        position: mouse.currentPosition
      },
      start: {
        position: startView.screenToView(mouse.start),
        view: startView,
        views: startViews.map(v => {
          if (!v.d) v.d = emptyView;

          return {
            position: v.d.screenToView(mouse.start),
            view: v.d
          };
        })
      },
      target: {
        position: targetSceneView.screenToView(mouse.currentPosition),
        view: targetSceneView,
        views: hitViews.map(v => {
          if (!v.d) v.d = emptyView;

          return {
            position: v.d.screenToView(mouse.currentPosition),
            view: v.d
          };
        })
      }
    };
  }

  /**
   * Make an interaction depicting the interactions with the touch
   */
  makeSingleTouchInteraction(touch: ITouchMetrics): ISingleTouchInteraction {
    const position = touch.currentPosition;
    const hitViews = this.getViewsUnderPosition(position);
    let targetSceneView = hitViews[0] && hitViews[0].d;
    if (!targetSceneView) targetSceneView = emptyView;
    let startView = touch.startView;
    if (!startView) startView = emptyView;

    return {
      touch,
      screen: {
        position
      },
      start: {
        position: startView.screenToView(touch.start),
        view: startView,
        views: this.getViewsUnderPosition(touch.start).map(v => {
          if (!v.d) v.d = emptyView;

          return {
            position: v.d.screenToView(touch.start),
            view: v.d
          };
        })
      },
      target: {
        position: targetSceneView.screenToView(position),
        view: targetSceneView,
        views: hitViews.map(v => {
          if (!v.d) v.d = emptyView;

          return {
            position: v.d.screenToView(position),
            view: v.d
          };
        })
      }
    };
  }

  /**
   * This produces an object for handling several touches at once. It will store all of the combinations of touches
   * and their associative metrics into the lookup mapping provideds.
   */
  makeMultiTouchInteractions(
    touchMetrics: ITouchMetrics[],
    multiTouchLookup: Map<string, IMultiTouchMetrics>
  ) {
    // Make sure the identifiers come out in the same order of permutation everytime. This makes the combined identifiers
    // stay properly maintained.
    touchMetrics.sort(sortByIdentifier);
    // Now make all of the combinations of touches that are possible between all of the current touches
    const allCombinations = this.allTouchCombinations(touchMetrics);

    // With all combinations in place, we can now find any combination that newly exists as a result of the new touches.
    for (let i = 0, iMax = allCombinations.length; i < iMax; ++i) {
      const combo = allCombinations[i];
      const id = combo.map(metrics => metrics.touch.identifier).join("_");
      let multitouch = multiTouchLookup.get(id);

      if (!multitouch) {
        const center = this.getTouchCenter(combo);
        multitouch = {
          touches: combo,
          averageSpreadDelta: 0,
          startCenter: center,
          currentCenter: center,
          currentRotation: this.getAverageAngle(combo, center),
          centerDelta: [0, 0],
          rotationDelta: 0
        };

        multiTouchLookup.set(id, multitouch);
      }
    }
  }

  /**
   * This updates all existing multitouch metrics with their new frame of data
   */
  updateMultiTouchInteractions(
    touchMetrics: ITouchMetrics[],
    multiTouchLookup: Map<string, IMultiTouchMetrics>
  ) {
    // Make sure the identifiers come out in the same order of permutation everytime. This makes the combined identifiers
    // stay properly maintained.
    touchMetrics.sort(sortByIdentifier);
    // Now make all of the combinations of touches that are possible between all of the current touches
    const allCombinations = this.allTouchCombinations(touchMetrics);

    for (let i = 0, iMax = allCombinations.length; i < iMax; ++i) {
      const combo = allCombinations[i];
      const id = combo.map(metrics => metrics.touch.identifier).join("_");
      const multitouch = multiTouchLookup.get(id);

      if (multitouch) {
        const center = this.getTouchCenter(combo);
        const rotation = this.getAverageAngle(combo, center);

        multitouch.centerDelta = subtract2(center, multitouch.currentCenter);
        multitouch.currentCenter = center;
        multitouch.rotationDelta = rotation - multitouch.currentRotation;
        multitouch.currentRotation = rotation;
      }
    }
  }

  /**
   * This makes all of the possible combinations of touches.
   */
  allTouchCombinations(list: ITouchMetrics[]) {
    const allCombinations = [];
    const listSize = list.length;
    const combinationsCount = 1 << listSize;

    for (let i = 1; i < combinationsCount; i++) {
      const combination = [];

      for (let j = 0; j < listSize; j++) {
        if (i & (1 << j)) {
          combination.push(list[j]);
        }
      }

      allCombinations.push(combination);
    }
    return allCombinations;
  }

  makeWheel(event?: MouseWheelEvent): IWheelMetrics {
    if (!event) {
      return {
        delta: [0, 0]
      };
    }

    const wheel = normalizeWheel(event);

    return {
      delta: [wheel.pixelX, wheel.pixelY]
    };
  }

  /**
   * When the renderer is resized, we must reform our quad tree
   */
  resize = () => {
    this._waitingForRender = true;
  };

  /**
   * Sets the controllers to receive events from this manager.
   */
  setControllers(controllers: EventManager[]) {
    this.controllers = controllers;

    for (const controller of this.controllers) {
      controller.setUserInputManager(this);
    }
  }

  destroy() {
    delete this.quadTree;
    this.context.onmousedown = null;
    this.context.onmousemove = null;
    this.context.onmouseleave = null;

    const experimental = this.context as any;

    if (experimental.onmousewheel) {
      experimental.onmousewheel = null;
    }

    this.eventCleanup.forEach(event => {
      this.context.removeEventListener(event[0], event[1]);
    });
  }
}
