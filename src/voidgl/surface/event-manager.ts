import { IDragMetrics, IMouseInteraction } from './mouse-event-manager';

/**
 * Classes can extend this and override the methods to respond to events.
 */
export class EventManager {
  handleMouseDown(e: IMouseInteraction, button: number) {
    // HOOK: This is for a subclass
  }

  handleMouseUp(e: IMouseInteraction) {
    // HOOK: This is for a subclass
  }

  handleMouseOver(e: IMouseInteraction) {
    // HOOK: This is for a subclass
  }

  handleMouseOut(e: IMouseInteraction) {
    // HOOK: This is for a subclass
  }

  handleMouseMove(e: IMouseInteraction) {
    // HOOK: This is for a subclass
  }

  handleClick(e: IMouseInteraction, button: number) {
    // HOOK: This is for a subclass
  }

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    // HOOK: This is for a subclass
  }

  handleWheel(e: IMouseInteraction, wheel: IWheelMetrics) {

  }
}
