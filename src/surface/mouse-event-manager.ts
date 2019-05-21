import { Bounds } from "../primitives";
import { ChartCamera, subtract2, Vec2, ViewCamera } from "../util";
import { Camera } from "../util/camera";
import { eventElementPosition, normalizeWheel } from "../util/mouse";
import { QuadTree } from "../util/quad-tree";
import { EventManager } from "./event-manager";
import { LayerScene } from "./layer-scene";
import { Surface } from "./surface";
import { View } from "./view";

// If a mouse up after a mouse down happens before this many milliseconds, a click gesture will happen
const VALID_CLICK_DELAY = 1e3;

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

/**
 * This represents an interaction with the Layer Surface. It provides mouse metrics with how the mouse
 * interacts with the views below it.
 */
export interface IMouseInteraction {
  /** When present indicates any relevant button codes used during a click event */
  button?: number;
  /** Metrics of the interaction in screen space */
  screen: {
    mouse: Vec2;
  };
  /** The View the mouse was 'down' on */
  start?: {
    mouse: Vec2;
    view: View;
  };
  /** The View Immediately underneath the mouse */
  target: {
    mouse: Vec2;
    view: View;
  };
  /** This is populated with ALL of the views underneath the mouse */
  viewsUnderMouse: {
    /** The mouse's location in the views coordinate space */
    mouse: Vec2;
    /** The view that is interacted with */
    view: View;
  }[];
}

export interface IDragMetrics {
  /** Drag metrics in screen space */
  screen: {
    /** The start position of the drag where the mouse down first occurred */
    start: Vec2;
    /** The previous position of the mouse last frame */
    previous: Vec2;
    /** The current position the mouse is located for this frame */
    current: Vec2;
    /** The change in position from last frame to this frame */
    delta: Vec2;
  };
}

export interface IWheelMetrics {
  wheel: [number, number];
}

/**
 * This is metrics measured between two touches
 */
export interface ITouchRelation {
  /** The direction to the other touch */
  direction: Vec2;
  /** The current distance to the other touch */
  distance: number;
  /** The id of the other touch */
  id: number;
}

/**
 * This is the information of a touch for a given frame.
 */
export interface ITouchFrame {
  /** This is the location or delta location of the touch for this frame */
  location: Vec2;
  /** This is the direction from the start touch frame */
  direction: Vec2;
  /** This is the metrics or delta metrics of the touch relative to the other touches for the frame */
  relations: Map<number, ITouchRelation>;
}

export interface ITouchMetrics {
  /** The starting metrics of the touch */
  start: ITouchFrame;
  /** The delta changes from previous event to the current event */
  delta: ITouchFrame;
  /** The current metrics of the touch event */
  current: ITouchFrame;
}

function sortByDepth(a: Bounds<View>, b: Bounds<View>) {
  if (b.d && a.d) return b.d.depth - a.d.depth;
  return 0;
}

/**
 * This manages mouse events on the provided canvas and provides some higher level
 * interactions with the surface.
 */
export class MouseEventManager {
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
    const element = this.context;
    let startView: View | undefined;
    let startPosition: Vec2 = [0, 0];

    if (handlesWheelEvents) {
      const wheelHandler = (event: MouseWheelEvent) => {
        const mouse = eventElementPosition(event, element);
        const interaction = this.makeInteraction(
          mouse,
          startPosition,
          startView
        );
        const wheel = this.makeWheel(event);

        this.controllers.forEach(controller => {
          controller.handleWheel(interaction, wheel);
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

    element.onmouseleave = event => {
      // No interactions while waiting for the render to update
      if (this.waitingForRender) return;

      const mouse = eventElementPosition(event, element);
      const interaction = this.makeInteraction(mouse, startPosition, startView);

      this.controllers.forEach(controller => {
        controller.handleMouseOut(interaction);
      });
    };

    element.onmousemove = event => {
      // No interactions while waiting for the render to update
      if (this.waitingForRender) return;

      const mouse = eventElementPosition(event, element);
      const interaction = this.makeInteraction(mouse, startPosition, startView);

      this.controllers.forEach(controller => {
        controller.handleMouseMove(interaction);
      });
    };

    element.onmousedown = (event: MouseEvent) => {
      // No interactions while waiting for the render to update
      if (this.waitingForRender) return;

      startPosition = eventElementPosition(event, element);
      const downViews = this.getViewsUnderMouse(startPosition);
      // While this is true, when mouse up happens, the click gesture will execute
      let canClick = true;
      const clickStartTime = Date.now();

      // If no views under this view, then we just quick exit with no interactions
      if (downViews.length <= 0) {
        return;
      }

      startView = downViews[0].d;
      if (!startView) return;

      const interaction = this.makeInteraction(
        startPosition,
        startPosition,
        startView
      );
      let currentPosition = startPosition;

      this.controllers.forEach(controller => {
        controller.handleMouseDown(interaction, event.button);
      });

      event.stopPropagation();

      document.onmousemove = (event: MouseEvent) => {
        const mouse = eventElementPosition(event, element);
        const interaction = this.makeInteraction(
          mouse,
          startPosition,
          startView
        );
        const delta: Vec2 = subtract2(mouse, currentPosition);

        const drag = this.makeDrag(
          mouse,
          startPosition || { x: 0, y: 0 },
          currentPosition,
          delta
        );
        currentPosition = mouse;

        this.controllers.forEach(controller => {
          controller.handleDrag(interaction, drag);
        });

        // If we move after a mouse down, it's no longer a click
        canClick = false;
      };

      document.onmouseup = (_event: MouseEvent) => {
        document.onmousemove = null;
        document.onmouseup = null;
        document.onmouseover = null;
      };

      document.onmouseover = (event: MouseEvent) => {
        const mouse = eventElementPosition(event, element);
        const interaction = this.makeInteraction(
          mouse,
          startPosition,
          startView
        );

        this.controllers.forEach(controller => {
          controller.handleMouseOver(interaction);
        });

        event.stopPropagation();
      };

      element.onmouseup = (event: MouseEvent) => {
        const mouse = eventElementPosition(event, element);
        const interaction = this.makeInteraction(
          mouse,
          startPosition,
          startView
        );

        this.controllers.forEach(controller => {
          controller.handleMouseUp(interaction, event.button);
        });

        // If we release the mouse before the valid click delay
        if (canClick && Date.now() - clickStartTime < VALID_CLICK_DELAY) {
          this.controllers.forEach(controller => {
            controller.handleClick(interaction, event.button);
          });
        }
      };

      // Text will not be selected when it is being dragged
      const experiemental = element as any;
      if (experiemental.onselectstart !== undefined) {
        experiemental.onselectstart = function() {
          return false;
        };
      } else {
        element.addEventListener("selectstart", function() {
          event.preventDefault();
        });
      }
    };

    // Enable touch support
    this.addTouchContextListeners();
  }

  addTouchContextListeners() {
    const element = this.context;

    element.ontouchstart = _event => {
      // TODO: This is the start work for the touch events. And this retains sentimental value.
      // For (let i = 0, end = event.changedTouches.length; i < end; ++i) {
      // TODO
      // Const touch = event.changedTouches.item(i);
      // CurrentTouches.set(touch.identifier, to);
      // }
    };

    element.ontouchend = _event => {
      // TODO
    };

    element.ontouchmove = _event => {
      // TODO
    };

    element.ontouchcancel = _event => {
      // TODO
    };
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
  getViewsUnderMouse = (mouse: Vec2) => {
    // Find the views the mouse has interacted with
    const hitViews = this.quadTree.query(mouse);
    // Sort them by depth
    hitViews.sort(sortByDepth);

    return hitViews;
  };

  /**
   * This generates the metrics for a drag gesture.
   */
  makeDrag(
    mouse: Vec2,
    start: Vec2,
    previous: Vec2,
    delta: Vec2
  ): IDragMetrics {
    return {
      screen: {
        current: mouse,
        delta,
        previous,
        start
      }
    };
  }

  /**
   * This makes the metrics for interactions with the views.
   */
  makeInteraction(
    mouse: Vec2,
    start?: Vec2,
    startView?: View
  ): IMouseInteraction {
    // Find the views the mouse has interacted with
    const hitViews = this.getViewsUnderMouse(mouse);
    let targetSceneView = hitViews[0] && hitViews[0].d;
    if (!targetSceneView) targetSceneView = emptyView;

    return {
      screen: {
        mouse
      },
      start: start &&
        startView && {
          mouse: startView.screenToView(mouse),
          view: startView
        },
      target: {
        mouse: targetSceneView.screenToView(mouse),
        view: targetSceneView
      },
      viewsUnderMouse: hitViews.map(v => {
        if (!v.d) v.d = emptyView;

        return {
          mouse: v.d.screenToView(mouse),
          view: v.d
        };
      })
    };
  }

  makeWheel(event: MouseWheelEvent): IWheelMetrics {
    const wheel = normalizeWheel(event);

    return {
      wheel: [wheel.pixelX, wheel.pixelY]
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
      controller.setMouseManager(this);
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
