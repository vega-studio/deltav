import { IPoint } from '../primitives/point';
import { DataBounds } from '../util/data-bounds';
import { eventElementPosition, normalizeWheel } from '../util/mouse';
import { QuadTree } from '../util/quad-tree';
import { EventManager } from './event-manager';
import { Scene } from './scene';
import { View } from './view';

// If a mouse up after a mouse down happens before this many milliseconds, a click gesture will happen
const VALID_CLICK_DELAY = 1E3;

/**
 * Theorectically we can have a view be applied to multiple scenes. So to properly qualify a view
 * it must be paired with the scene it is rendering for.
 */
export type SceneView = {
  /** This specifies the order the view is rendered in so we can pick the top most item when needed */
  depth: number;
  /** This is the scene the view is rendering for */
  scene: Scene;
  /** This is the view itself that our mouse will interact with */
  view: View;
  /** Gets the bounds of this view for this particular scene */
  bounds?: DataBounds<SceneView>
};

/**
 * This represents an interaction with the Layer Surface. It provides mouse metrics with how the mouse
 * interacts with the views below it.
 */
export interface IMouseInteraction {
  /** When present indicates any relevant button codes used during a click event */
  button?: number;
  /** Metrics of the interaction in screen space */
  screen: {
    mouse: IPoint;
  };
  /** The View the mouse was 'down' on */
  start?: {
    mouse: IPoint;
    view: View;
  };
  /** The View Immediately underneath the mouse */
  target: {
    mouse: IPoint;
    view: View;
  };
  /** This is populated with ALL of the views underneath the mouse */
  viewsUnderMouse: {
    /** The mouse's location in the views coordinate space */
    mouse: IPoint,
    /** The view that is interacted with */
    view: View,
  }[];
}

export interface IDragMetrics {
  /** Drag metrics in screen space */
  screen: {
    /** The start position of the drag where the mouse down first occurred */
    start: IPoint;
    /** The previous position of the mouse last frame */
    previous: IPoint;
    /** The current position the mouse is located for this frame */
    current: IPoint;
    /** The change in position from last frame to this frame */
    delta: IPoint;
  },
}

export interface IWheelMetrics {
  wheel: [number, number];
}

/**
 * This is metrics measured between two touches
 */
export interface ITouchRelation {
  /** The direction to the other touch */
  direction: IPoint;
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
  location: IPoint;
  /** This is the direction from the start touch frame */
  direction: IPoint;
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

function sortByDepth(a: DataBounds<SceneView>, b: DataBounds<SceneView>) {
  return b.data.depth - a.data.depth;
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
  quadTree: QuadTree<DataBounds<SceneView>>;
  /** This is the current list of views being managed */
  views: SceneView[];

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
      this.quadTree.addAll(this.views.map(v => v.bounds).filter(Boolean));
    }
  }

  constructor(canvas: HTMLCanvasElement, views: SceneView[], controllers: EventManager[], handlesWheelEvents?: boolean) {
    this.context = canvas;
    this.setViews(views);
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
    let startView: SceneView | null = null;
    let startPosition: IPoint | null = null;

    if (handlesWheelEvents) {
      element.onmousewheel = (event: MouseWheelEvent) => {
        const mouse = eventElementPosition(event, element);
        const interaction = this.makeInteraction(mouse, startPosition, startView);
        const wheel = this.makeWheel(event);

        this.controllers.forEach(controller => {
          controller.handleWheel(interaction, wheel);
        });

        event.stopPropagation();
        event.preventDefault();
      };
    }

    element.onmouseleave = (event) => {
      // No interactions while waiting for the render to update
      if (this.waitingForRender) return;

      const mouse = eventElementPosition(event, element);
      const interaction = this.makeInteraction(mouse, startPosition, startView);

      this.controllers.forEach(controller => {
        controller.handleMouseOut(interaction);
      });
    };

    element.onmousemove = (event) => {
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

      startView = downViews[0].data;
      const interaction = this.makeInteraction(startPosition, startPosition, startView);
      let currentPosition = startPosition;

      this.controllers.forEach(controller => {
        controller.handleMouseDown(interaction, event.button);
      });

      event.stopPropagation();

      document.onmousemove = (event: MouseEvent) => {
        const mouse = eventElementPosition(event, element);
        const interaction = this.makeInteraction(mouse, startPosition, startView);
        const delta = {
          x: mouse.x - currentPosition.x,
          y: mouse.y - currentPosition.y,
        };

        const drag = this.makeDrag(mouse, startPosition, currentPosition, delta);
        currentPosition = mouse;

        this.controllers.forEach(controller => {
          controller.handleDrag(interaction, drag);
        });

        // If we move after a mouse down, it's no longer a click
        canClick = false;
      };

      document.onmouseup = (event: MouseEvent) => {
        document.onmousemove = null;
        document.onmouseup = null;
        document.onmouseover = null;
      };

      document.onmouseover = (event: MouseEvent) => {
        const mouse = eventElementPosition(event, element);
        const interaction = this.makeInteraction(mouse, startPosition, startView);

        this.controllers.forEach(controller => {
          controller.handleMouseOver(interaction);
        });

        event.stopPropagation();
      };

      element.onmouseup = (event: MouseEvent) => {
        const mouse = eventElementPosition(event, element);
        const interaction = this.makeInteraction(mouse, startPosition, startView);

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
      element.onselectstart = function() {
        return false;
      };
    };

    // Enable touch support
    this.addTouchContextListeners();
  }

  addTouchContextListeners() {
    const element = this.context;

    element.ontouchstart = (event) => {
      // TODO: This is the start work for the touch events. And this retains sentimental value.
      // For (let i = 0, end = event.changedTouches.length; i < end; ++i) {
        // TODO
        // Const touch = event.changedTouches.item(i);
        // CurrentTouches.set(touch.identifier, to);
      // }
    };

    element.ontouchend = (event) => {
      // TODO
    };

    element.ontouchmove = (event) => {
      // TODO
    };

    element.ontouchcancel = (event) => {
      // TODO
    };
  }

  /**
   * Retrieves the view for the provided id
   */
  getView(viewId: string): View | null {
    for (const view of this.views) {
      if (view.view.id === viewId) {
        return view.view;
      }
    }

    return null;
  }

  /**
   * Retrieves the views underneath the mouse with the top most view as
   * the first view in the list.
   */
  getViewsUnderMouse = (mouse: IPoint) => {
    // Find the views the mouse has interacted with
    const hitViews = this.quadTree.query(mouse);
    // Sort them by depth
    hitViews.sort(sortByDepth);

    return hitViews;
  }

  /**
   * This generates the metrics for a drag gesture.
   */
  makeDrag(mouse: IPoint, start: IPoint, previous: IPoint, delta: IPoint): IDragMetrics {
    return {
      screen: {
        current: mouse,
        delta,
        previous,
        start,
      },
    };
  }

  /**
   * This makes the metrics for interactions with the views.
   */
  makeInteraction(mouse: IPoint, start?: IPoint, startView?: SceneView): IMouseInteraction {
    // Find the views the mouse has interacted with
    const hitViews = this.getViewsUnderMouse(mouse);

    return {
      screen: {
        mouse,
      },
      start: start && startView && {
        mouse: startView.view.screenToView(mouse),
        view: startView.view,
      },
      target: {
        mouse: hitViews[0] && hitViews[0].data.view.screenToView(mouse),
        view: hitViews[0] && hitViews[0].data.view,
      },
      viewsUnderMouse: hitViews.map(v => ({
        mouse: v.data.view.screenToView(mouse),
        view: v.data.view,
      })),
    };
  }

  makeWheel(event: MouseWheelEvent): IWheelMetrics {
    const wheel = normalizeWheel(event);

    return {
      wheel: [wheel.x, wheel.y],
    };
  }

  /**
   * When the renderer is resized, we must reform our quad tree
   */
  resize = () => {
    this._waitingForRender = true;
  }

  /**
   * Sets the controllers to receive events from this manager.
   */
  setControllers(controllers: EventManager[]) {
    this.controllers = controllers;

    for (const controller of this.controllers) {
      controller.setMouseManager(this);
    }
  }

  /**
   * Sets the views that gets queried for interactions.
   */
  setViews(views: SceneView[]) {
    this.views = views;
  }

  destroy() {
    this.quadTree = null;
    this.context.onmousedown = null;
    this.context.onmousemove = null;
    this.context.onmouseleave = null;
    this.context.onmousewheel = null;
  }
}
