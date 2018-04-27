import { IDragMetrics, IMouseInteraction, IWheelMetrics } from './mouse-event-manager';

/**
 * Classes can extend this and override the methods to respond to events.
 */
export abstract class EventManager {
  abstract handleMouseDown(e: IMouseInteraction, button: number): void;
  abstract handleMouseUp(e: IMouseInteraction, button: number): void;
  abstract handleMouseOver(e: IMouseInteraction): void;
  abstract handleMouseOut(e: IMouseInteraction): void;
  abstract handleMouseMove(e: IMouseInteraction): void;
  abstract handleClick(e: IMouseInteraction, button: number): void;
  abstract handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
  abstract handleWheel(e: IMouseInteraction, wheel: IWheelMetrics): void;
}
