import { EventManager } from "./event-manager";
import { IMouseInteraction, ITouchInteraction } from "./types";
/**
 * This is a simple way to access the events executing on the chart.
 */
export declare class SimpleEventHandler extends EventManager {
    constructor(handlers: Partial<EventManager>);
    handleMouseDown(_e: IMouseInteraction): void;
    handleMouseUp(_e: IMouseInteraction): void;
    handleMouseOver(_e: IMouseInteraction): void;
    handleMouseOut(_e: IMouseInteraction): void;
    handleMouseMove(_e: IMouseInteraction): void;
    handleClick(_e: IMouseInteraction): void;
    handleDrag(_e: IMouseInteraction): void;
    handleWheel(_e: IMouseInteraction): void;
    handleTouchCancelled(_e: ITouchInteraction): void;
    handleTouchDown(_e: ITouchInteraction): void;
    handleTouchUp(_e: ITouchInteraction): void;
    handleTouchOut(_e: ITouchInteraction): void;
    handleTouchDrag(_e: ITouchInteraction): void;
    handleTap(_e: ITouchInteraction): void;
    handleDoubleTap(_e: ITouchInteraction): void;
    handleLongTouch(_e: ITouchInteraction): void;
    handleLongTap(_e: ITouchInteraction): void;
    handlePinch(_e: ITouchInteraction): void;
    handleSpread(_e: ITouchInteraction): void;
    handleTouchRotate(_e: ITouchInteraction): void;
    handleSwipe(_e: ITouchInteraction): void;
}
