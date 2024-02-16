import { EventManager } from "./event-manager";
import { SimpleEventHandler } from "./simple-event-handler";
import {
  IEventInteraction,
  IMouseInteraction,
  ITouchInteraction,
} from "./types";

/**
 * This takes in events and stores them for a later moment to be dequeued in a
 * controlled manner where timing is important relative to other actions
 * happening.
 */
export class QueuedEventHandler extends EventManager {
  private handlers: SimpleEventHandler;
  private preserveQueueMouse: [Function, IEventInteraction][] = [];
  private singleQueueMouse = new Map<Function, IEventInteraction>();
  private preserveQueueTouch: [Function, ITouchInteraction][] = [];
  private singleQueueTouch = new Map<Function, ITouchInteraction>();
  private preserveEvents: boolean = false;

  /**
   * Default ctor for Queued event handling.
   *
   * @param handlers Custom handlers for all of the normal Event manager events
   * @param preserveEvents When set to true, ALL events will be stored and
   *                       broadcasted upon dequeuing of the events. Conversely,
   *                       when false, only the last event of a given event type
   *                       will be preserved for broadcast.
   */
  constructor(
    handlers: Partial<EventManager>,
    preserveEvents: boolean = false
  ) {
    super();
    this.handlers = new SimpleEventHandler(handlers);
    this.preserveEvents = preserveEvents;
  }

  /**
   * Broadcast all of the events this manager is hanging onto in the order the
   * events were received.
   */
  dequeue() {
    try {
      if (this.preserveEvents) {
        this.preserveQueueMouse.forEach((queue) => {
          queue[0](queue[1]);
        });

        this.preserveQueueTouch.forEach((queue) => {
          queue[0](queue[1]);
        });
      } else {
        this.singleQueueMouse.forEach((event, handler) => {
          handler(event);
        });

        this.singleQueueTouch.forEach((event, handler) => {
          handler(event);
        });
      }
    } catch (err) {
      console.error("Queued events had errors. Further events aborted");
      if (err instanceof Error) console.error(err.stack || err.message);
    }

    this.preserveQueueMouse = [];
    this.singleQueueMouse.clear();
    this.preserveQueueTouch = [];
    this.singleQueueTouch.clear();
  }

  handleMouseDown(e: IMouseInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueMouse.push([this.handlers.handleMouseDown, e]);
    } else this.singleQueueMouse.set(this.handlers.handleMouseDown, e);
  }

  handleMouseUp(e: IMouseInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueMouse.push([this.handlers.handleMouseUp, e]);
    } else this.singleQueueMouse.set(this.handlers.handleMouseUp, e);
  }

  handleMouseOver(e: IMouseInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueMouse.push([this.handlers.handleMouseOver, e]);
    } else this.singleQueueMouse.set(this.handlers.handleMouseOver, e);
  }

  handleMouseOut(e: IMouseInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueMouse.push([this.handlers.handleMouseOut, e]);
    } else this.singleQueueMouse.set(this.handlers.handleMouseOut, e);
  }

  handleMouseMove(e: IMouseInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueMouse.push([this.handlers.handleMouseMove, e]);
    } else this.singleQueueMouse.set(this.handlers.handleMouseMove, e);
  }

  handleClick(e: IMouseInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueMouse.push([this.handlers.handleClick, e]);
    } else this.singleQueueMouse.set(this.handlers.handleClick, e);
  }

  handleDrag(e: IMouseInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueMouse.push([this.handlers.handleDrag, e]);
    } else this.singleQueueMouse.set(this.handlers.handleDrag, e);
  }

  handleWheel(e: IMouseInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueMouse.push([this.handlers.handleWheel, e]);
    } else this.singleQueueMouse.set(this.handlers.handleWheel, e);
  }

  handleTouchCancelled(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleTouchCancelled, e]);
    } else this.singleQueueTouch.set(this.handlers.handleTouchCancelled, e);
  }

  handleTouchDown(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleTouchDown, e]);
    } else this.singleQueueTouch.set(this.handlers.handleTouchDown, e);
  }

  handleTouchUp(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleTouchUp, e]);
    } else this.singleQueueTouch.set(this.handlers.handleTouchUp, e);
  }

  handleTouchOut(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleTouchOut, e]);
    } else this.singleQueueTouch.set(this.handlers.handleTouchOut, e);
  }

  handleTouchDrag(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleTouchDrag, e]);
    } else this.singleQueueTouch.set(this.handlers.handleTouchDrag, e);
  }

  handleTap(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleTap, e]);
    } else this.singleQueueTouch.set(this.handlers.handleTap, e);
  }

  handleDoubleTap(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleDoubleTap, e]);
    } else this.singleQueueTouch.set(this.handlers.handleDoubleTap, e);
  }

  handleLongTouch(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleLongTouch, e]);
    } else this.singleQueueTouch.set(this.handlers.handleLongTouch, e);
  }

  handleLongTap(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleLongTap, e]);
    } else this.singleQueueTouch.set(this.handlers.handleLongTap, e);
  }

  handlePinch(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handlePinch, e]);
    } else this.singleQueueTouch.set(this.handlers.handlePinch, e);
  }

  handleSpread(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleSpread, e]);
    } else this.singleQueueTouch.set(this.handlers.handleSpread, e);
  }

  handleTouchRotate(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleTouchRotate, e]);
    } else this.singleQueueTouch.set(this.handlers.handleTouchRotate, e);
  }

  handleSwipe(e: ITouchInteraction): void {
    if (this.preserveEvents) {
      this.preserveQueueTouch.push([this.handlers.handleSwipe, e]);
    } else this.singleQueueTouch.set(this.handlers.handleSwipe, e);
  }
}
