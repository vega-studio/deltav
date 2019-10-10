import { EventManager } from './event-manager';
import { IMouseInteraction, ITouchInteraction } from './types';

/**
 * This is a simple way to access the events executing on the chart.
 */
export class SimpleEventHandler extends EventManager {
  constructor(handlers: Partial<EventManager>) {
    super();
    Object.assign(this, handlers);
  }

  handleMouseDown(_e: IMouseInteraction): void {
    /* No op */
  }

  handleMouseUp(_e: IMouseInteraction): void {
    /* No op */
  }

  handleMouseOver(_e: IMouseInteraction): void {
    /* No op */
  }

  handleMouseOut(_e: IMouseInteraction): void {
    /* No op */
  }

  handleMouseMove(_e: IMouseInteraction): void {
    /* No op */
  }

  handleClick(_e: IMouseInteraction): void {
    /* No op */
  }

  handleDrag(_e: IMouseInteraction): void {
    /* No op */
  }

  handleWheel(_e: IMouseInteraction): void {
    /* No op */
  }

  handleTouchCancelled(_e: ITouchInteraction): void {
    /* No op */
  }

  handleTouchDown(_e: ITouchInteraction): void {
    /* No op */
  }

  handleTouchUp(_e: ITouchInteraction): void {
    /* No op */
  }

  handleTouchOut(_e: ITouchInteraction): void {
    /* No op */
  }

  handleTouchDrag(_e: ITouchInteraction): void {
    /* No op */
  }

  handleTap(_e: ITouchInteraction): void {
    /* No op */
  }

  handleDoubleTap(_e: ITouchInteraction): void {
    /* No op */
  }

  handleLongTouch(_e: ITouchInteraction): void {
    /* No op */
  }

  handleLongTap(_e: ITouchInteraction): void {
    /* No op */
  }

  handlePinch(_e: ITouchInteraction): void {
    /* No op */
  }

  handleSpread(_e: ITouchInteraction): void {
    /* No op */
  }

  handleTouchRotate(_e: ITouchInteraction): void {
    /* No op */
  }

  handleSwipe(_e: ITouchInteraction): void {
    /* No op */
  }
}
