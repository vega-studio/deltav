import {
  EventManager,
  IDragMetrics,
  IMouseInteraction,
  IWheelMetrics
} from "src";

/**
 * This is a simple way to access the events executing on the chart.
 */
export class EventHandler extends EventManager {
  constructor(handlers: Partial<EventManager>) {
    super();
    Object.assign(this, handlers);
  }

  handleMouseDown(_e: IMouseInteraction, _button: number): void {
    /* No op */
  }

  handleMouseUp(_e: IMouseInteraction, _button: number): void {
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

  handleClick(_e: IMouseInteraction, _button: number): void {
    /* No op */
  }

  handleDrag(_e: IMouseInteraction, _drag: IDragMetrics): void {
    /* No op */
  }

  handleWheel(_e: IMouseInteraction, _wheel: IWheelMetrics): void {
    /* No op */
  }
}
