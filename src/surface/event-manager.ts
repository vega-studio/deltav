import { Bounds } from "../primitives";
import { IProjection } from "../types";
import {
  IDragMetrics,
  IMouseInteraction,
  ITouchInteraction,
  IWheelMetrics,
  UserInputEventManager
} from "./user-input-event-manager";
import { View } from "./view";

/**
 * Classes can extend this and override the methods to respond to events.
 */
export abstract class EventManager {
  private mouseManager: UserInputEventManager;

  // MOUSE EVENTS

  abstract handleMouseDown(e: IMouseInteraction, button: number): void;
  abstract handleMouseUp(e: IMouseInteraction, button: number): void;
  abstract handleMouseOver(e: IMouseInteraction): void;
  abstract handleMouseOut(e: IMouseInteraction): void;
  abstract handleMouseMove(e: IMouseInteraction): void;
  abstract handleClick(e: IMouseInteraction, button: number): void;
  abstract handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
  abstract handleWheel(e: IMouseInteraction, wheel: IWheelMetrics): void;

  // TOUCH EVENTS

  /** Handles when a touch first interacts with the screen */
  abstract handleTouchDown(e: ITouchInteraction): void;
  /** Handles when a touch is no longer interacting with the screen */
  abstract handleTouchUp(e: ITouchInteraction): void;
  /** Handles when an existing touch starts dragging across the screen */
  abstract handleTouchOut(e: ITouchInteraction): void;

  /** Handles when a touch is dragged across the screen */
  abstract handleTouchDrag(e: ITouchInteraction): void;
  /** Handles when a touch has tapped the screen quickly */
  abstract handleTap(e: ITouchInteraction): void;
  /** Handles when a touch double taps quickly on the screen */
  abstract handleDoubleTap(e: ITouchInteraction): void;
  /** Handles when a touch is left in a location for an extended period of time */
  abstract handleLongTouch(e: ITouchInteraction): void;
  /** Handles when a touch taps a location with a lengthy delay */
  abstract handleLongTap(e: ITouchInteraction): void;
  /** Handles when multiple touches converge toward each other */
  abstract handlePinch(e: ITouchInteraction): void;
  /** Handles when multiple touches spread away from each other */
  abstract handleSpread(e: ITouchInteraction): void;
  /** Handles when multiple touches rotate about a point */
  abstract handleTouchRotate(e: ITouchInteraction): void;
  /** Handles when a single touch or multiple touches swipe quickly in a direction */
  abstract handleSwipe(e: ITouchInteraction): void;

  /**
   * This retrieves the projections for the view specified by the provided viewId.
   */
  getProjection(viewId: string): IProjection | null {
    return this.mouseManager.getView(viewId);
  }

  /**
   * This retrieves the actual view for the view specified by the provided viewId.
   */
  getView(viewId: string): View | null {
    return (this.mouseManager && this.mouseManager.getView(viewId)) || null;
  }

  /**
   * This retrieves the screen bounds for the view specified by the provided viewId.
   */
  getViewScreenBounds(viewId: string): Bounds<View> | null {
    const view = this.mouseManager.getView(viewId);

    if (view) {
      return view.screenBounds;
    }

    return null;
  }

  /**
   * This is used internally which provides the parent MouseEventManager via the param mouseManager for this
   * EventManager.
   */
  setMouseManager(mouseManager: UserInputEventManager) {
    this.mouseManager = mouseManager;
  }
}
