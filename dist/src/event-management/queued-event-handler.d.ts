import { EventManager } from "./event-manager";
import { IMouseInteraction, ITouchInteraction } from "./types";
/**
 * This takes in events and stores them for a later moment to be dequeued in a
 * controlled manner where timing is important relative to other actions
 * happening.
 */
export declare class QueuedEventHandler extends EventManager {
    private handlers;
    private preserveQueueMouse;
    private singleQueueMouse;
    private preserveQueueTouch;
    private singleQueueTouch;
    private preserveEvents;
    /**
     * Default ctor for Queued event handling.
     *
     * @param handlers Custom handlers for all of the normal Event manager events
     * @param preserveEvents When set to true, ALL events will be stored and
     *                       broadcasted upon dequeuing of the events. Conversely,
     *                       when false, only the last event of a given event type
     *                       will be preserved for broadcast.
     */
    constructor(handlers: Partial<EventManager>, preserveEvents?: boolean);
    /**
     * Broadcast all of the events this manager is hanging onto in the order the
     * events were received.
     */
    dequeue(): void;
    handleMouseDown(e: IMouseInteraction): void;
    handleMouseUp(e: IMouseInteraction): void;
    handleMouseOver(e: IMouseInteraction): void;
    handleMouseOut(e: IMouseInteraction): void;
    handleMouseMove(e: IMouseInteraction): void;
    handleClick(e: IMouseInteraction): void;
    handleDrag(e: IMouseInteraction): void;
    handleWheel(e: IMouseInteraction): void;
    handleTouchCancelled(e: ITouchInteraction): void;
    handleTouchDown(e: ITouchInteraction): void;
    handleTouchUp(e: ITouchInteraction): void;
    handleTouchOut(e: ITouchInteraction): void;
    handleTouchDrag(e: ITouchInteraction): void;
    handleTap(e: ITouchInteraction): void;
    handleDoubleTap(e: ITouchInteraction): void;
    handleLongTouch(e: ITouchInteraction): void;
    handleLongTap(e: ITouchInteraction): void;
    handlePinch(e: ITouchInteraction): void;
    handleSpread(e: ITouchInteraction): void;
    handleTouchRotate(e: ITouchInteraction): void;
    handleSwipe(e: ITouchInteraction): void;
}
