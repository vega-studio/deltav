import { BaseProjection } from "../math";
import { Bounds } from "../math/primitives";
import { IViewProps, View } from "../surface/view";
import { IMouseInteraction, ITouchInteraction } from "./types";
import { UserInputEventManager } from "./user-input-event-manager";
/**
 * Classes can extend this and override the methods to respond to events.
 */
export declare abstract class EventManager {
    private userInputManager;
    /** Allows an event manager to access it's governing surface */
    readonly surface: import("..").Surface;
    abstract handleMouseDown(e: IMouseInteraction): void;
    abstract handleMouseUp(e: IMouseInteraction): void;
    abstract handleMouseOver(e: IMouseInteraction): void;
    abstract handleMouseOut(e: IMouseInteraction): void;
    abstract handleMouseMove(e: IMouseInteraction): void;
    abstract handleClick(e: IMouseInteraction): void;
    abstract handleDrag(e: IMouseInteraction): void;
    abstract handleWheel(e: IMouseInteraction): void;
    /** Handles when a touch first interacts with the screen */
    abstract handleTouchDown(e: ITouchInteraction): void;
    /** Handles when a touch is no longer interacting with the screen */
    abstract handleTouchUp(e: ITouchInteraction): void;
    /** Handles when an existing touch slides off of it's start view. */
    abstract handleTouchOut(e: ITouchInteraction): void;
    /**
     * Handles when the system nukes your touch whether you like it or not. Some examples of when this 'might' happen:
     * Hand gestures in iOS Safari that causes the window to be closed or open up multitasking in some fashion.
     * Basically, more and more convenience gestures in the OS has more and more potential to kill your touches.
     * So make sure you are using this.
     */
    abstract handleTouchCancelled(e: ITouchInteraction): void;
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
    getProjection(viewId: string): BaseProjection<any> | null;
    /**
     * This retrieves the actual view for the view specified by the provided viewId.
     */
    getView(viewId: string): View<IViewProps> | null;
    /**
     * This retrieves the screen bounds for the view specified by the provided viewId.
     */
    getViewScreenBounds(viewId: string): Bounds<View<IViewProps>> | null;
    /**
     * This is used internally which provides the parent MouseEventManager via the param mouseManager for this
     * EventManager.
     */
    setUserInputManager(mouseManager: UserInputEventManager): void;
}
