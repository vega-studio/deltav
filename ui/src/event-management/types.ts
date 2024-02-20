import { IViewProps, View } from "../surface/view";
import { Vec2 } from "../math/vector";

export enum MouseButton {
  /** No button detected */
  NONE = -1,
  /** Mouse click left */
  LEFT = 0,
  /** Usually mouse wheel click */
  AUX = 1,
  /** Mosue right click */
  RIGHT = 2,
  /** Usually side left mouse button (will cause 'browser back' in some cases) */
  FOURTH = 3,
  /** Usually side right mouse button (will cause 'browser forward' in some cases) */
  FIFTH = 4,
}

export interface IEventInteraction {
  /**
   * This is the root canvas element the events are related to. This allows us
   * to have some additional information and unsafe controls over our context we
   * are working with.
   */
  canvas?: HTMLCanvasElement;
  /** Metrics of the interaction in screen space */
  screen: {
    position: Vec2;
  };
  /**
   * The View the event was 'down' on. The position stored is the screen
   * position relative to the view.
   */
  start: {
    /** Position the event started relative to the view */
    position: Vec2;
    /** The immediate view beneath the event when the event started */
    view: View<IViewProps>;
    /** All of the views beneath the event when the event started */
    views: {
      /** The position of the event where it started relative to the view */
      position: Vec2;
      /**
       * A view beneath the start position of the event, but possibly not the
       * immediate view
       */
      view: View<IViewProps>;
    }[];
  };
  /**
   * The View Immediately underneath the event. The position stored is the
   * screen position relative to the view.
   */
  target: {
    /** The position of the event relative to the target */
    position: Vec2;
    /** The view imeediately beneath the event */
    view: View<IViewProps>;
    /**
     * All views beneath the event (views that may be overlapping within the
     * area)
     */
    views: {
      /** The position of the event relative to the view indicated */
      position: Vec2;
      /** One of the view's beneath the event currently. */
      view: View<IViewProps>;
    }[];
  };
}

/**
 * This represents an interaction with the Layer Surface. It provides mouse metrics with how the mouse
 * interacts with the views below it.
 */
export interface IMouseInteraction extends IEventInteraction {
  /** The metrics associated with the mouse during this interaction */
  mouse: IMouseMetrics;
}

export interface IWheelMetrics {
  delta: [number, number];
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

export interface IInteractionMetrics {
  /** The current position of the touch on the screen */
  currentPosition: Vec2;
  /** The change in position the touch has experienced from last event to this event */
  deltaPosition: Vec2;
  /** The location of the touch from it's previous event */
  previousPosition: Vec2;
  /** The time stamp this touch began */
  startTime: number;
  /** The position this touch started */
  start: Vec2;
  /** The beginning view of the touch */
  startView: View<IViewProps> | undefined;
}

/**
 * Metrics calculated and stored for the mouse
 */
export interface IMouseMetrics extends IInteractionMetrics {
  /** The mouse button pressed */
  button: MouseButton;
  /** Flag for storing whether a mouse event is still eligible to register a click event */
  canClick: boolean;
  /** The latest event object associated with this mouse event */
  event: MouseEvent;
  /** Information derived for the wheel */
  wheel: IWheelMetrics;
}

/**
 * Metrics calculated and stored per touch
 */
export interface ITouchMetrics extends IInteractionMetrics {
  /** Flag storing whether a touch is still eligible to register a tap event */
  canTap: boolean;
  /**
   * The start position of the touch relative to other touches. When a new touch is down, all of the other touches
   * register their current position as a new starting position relative to when that touch was down.
   */
  startRelative: Map<ITouchMetrics, Vec2>;
  /** The base touch object making this metric */
  touch: Touch;
}

/**
 * Metrics calculated for multitouch information
 */
export interface IMultiTouchMetrics {
  /**
   * The average distance increase/decrease all touches are from the center present from spreading or pinching gesture
   * from previous event to this event.
   */
  averageSpreadDelta: number;
  /**
   * The change in the central point as all fingers migrate from one location to another from previous event to
   * this event.
   */
  centerDelta: Vec2;
  /** The central point between all current touches for the current event */
  currentCenter: Vec2;
  /** Stores the current rotation the touches have on average exhibited around the central point */
  currentRotation: number;
  /**
   * The change in rotation of the touches around the central point as the touches move from previous event to
   * this event.
   */
  rotationDelta: number;
  /** The central point between all current touches when all of the touches began */
  startCenter: Vec2;
  /** All of the touch metrics that makes this multitouch information */
  touches: ITouchMetrics[];
}

/**
 * Metrics calculated for all touches to be broadcasted to the event managers
 */
export interface ITouchInteraction {
  /** Contains ALL of the touch interactions with the screen that currently exists */
  allTouches: ISingleTouchInteraction[];
  /**
   * Stores multitouch interaction information. All multitouch information is query based
   */
  multitouch: IMultiTouchInteraction;
  /** Contains all of the touch interactions with the screen for the given event */
  touches: ISingleTouchInteraction[];
}

/**
 * Metrics calculated for a single touch on the screen
 */
export interface ISingleTouchInteraction extends IEventInteraction {
  /** The source touch metrics for the touch */
  touch: ITouchMetrics;
}

/**
 * This is multitouch information. This stores multitouch metrics between every touch and every permutation of every
 * touch. This means if you have four touches on the screen, you can query multitouch information between any of the
 * touches.
 */
export interface IMultiTouchInteraction {
  /**
   * Produces an identifier for the set of touches that will always be the same identifier for the same touches.
   */
  id(touches: ISingleTouchInteraction[]): string;
  /**
   * The average distance all touches are from the center for the current event.
   */
  spread(touches: ISingleTouchInteraction[]): number;
  /**
   * The average distance increase/decrease all touches are from the center present from spreading or pinching gesture.
   */
  spreadDelta(touches: ISingleTouchInteraction[]): number;
  /**
   * The average distance all touches are from the center when the touches first became present on the context.
   */
  spreadStart(touches: ISingleTouchInteraction[]): number;
  /** This is the calculated center of all the touches queried */
  center(touches: ISingleTouchInteraction[]): Vec2;
  /** This is the position change of the center of the touches */
  centerDelta(touches: ISingleTouchInteraction[]): Vec2;
  /** Gets the starting center point of the touches */
  centerStart(touches: ISingleTouchInteraction[]): Vec2;
  /** Gets the current rotation orientation of the touches around their center point */
  rotation(touches: ISingleTouchInteraction[]): number;
  /** This is the change in rotation of the touches around their perceived center. */
  rotationDelta(touches: ISingleTouchInteraction[]): number;
  /** Gets the starting touch rotation orientation */
  rotationStart(touches: ISingleTouchInteraction[]): number;
}
