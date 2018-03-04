import { EventManager } from '../surface/event-manager';
import { IDragMetrics, IMouseInteraction } from '../surface/mouse-event-manager';

/**
 * This is merely a controller to log mouse events for debugging.
 */
export class LogController extends EventManager {
  handleMouseDown(e: IMouseInteraction, button: number) {
    console.warn('MOUSE DOWN', e, button);
  }

  handleMouseUp(e: IMouseInteraction) {
    console.warn('MOUSE UP', e);
  }

  handleMouseOver(e: IMouseInteraction) {
    console.warn('MOUSE OVER', e);
  }

  handleMouseOut(e: IMouseInteraction) {
    console.warn('MOUSE OUT', e);
  }

  handleMouseMove(e: IMouseInteraction) {
    console.warn('MOUSE MOVE', e);
  }

  handleClick(e: IMouseInteraction, button: number) {
    console.warn('CLICK', e, button);
  }

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    console.warn('DRAG', e, drag);
  }
}
