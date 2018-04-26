import { EventManager } from '../surface/event-manager';
import { IDragMetrics, IMouseInteraction } from '../surface/mouse-event-manager';

export enum LogControllerType {
  EVENTS,
  MOUSE,
}

/**
 * This is merely a controller to log mouse events for debugging.
 */
export class LogController extends EventManager {
  type: LogControllerType = LogControllerType.EVENTS;

  constructor(type: LogControllerType) {
    super();
    this.type = type;
  }

  handleMouseDown(e: IMouseInteraction, button: number) {
    if (this.type === LogControllerType.EVENTS) console.warn('MOUSE DOWN', e, button);
  }

  handleMouseUp(e: IMouseInteraction) {
    if (this.type === LogControllerType.EVENTS) console.warn('MOUSE UP', e);
  }

  handleMouseOver(e: IMouseInteraction) {
    if (this.type === LogControllerType.EVENTS) console.warn('MOUSE OVER', e);
  }

  handleMouseOut(e: IMouseInteraction) {
    if (this.type === LogControllerType.EVENTS) console.warn('MOUSE OUT', e);
  }

  handleMouseMove(e: IMouseInteraction) {
    if (this.type === LogControllerType.EVENTS) console.warn('MOUSE MOVE', e);
    else if (this.type === LogControllerType.MOUSE) {
      const view = e.target.view;

      if (view) {
        console.clear();
        console.warn(
          `
          View: ${view.id}
          Screen to world: ${JSON.stringify(view.screenToWorld(e.screen.mouse))}
          Screen to view: ${JSON.stringify(view.screenToView(e.screen.mouse))}
          Screen to pixel: ${JSON.stringify(view.screenToPixelSpace(e.screen.mouse))}
          `,
        );
      }
    }
  }

  handleClick(e: IMouseInteraction, button: number) {
    if (this.type === LogControllerType.EVENTS) console.warn('CLICK', e, button);
    else if (this.type === LogControllerType.MOUSE) {
      const view = e.target.view;

      if (view) {
        console.clear();
        console.warn(
          `
          View: ${view.id}
          Screen to world: ${view.screenToWorld(e.screen.mouse)}
          Screen to view: ${view.screenToView(e.screen.mouse)}
          Screen to pixel: ${view.screenToPixelSpace(e.screen.mouse)}
          `,
        );
      }
    }
  }

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    if (this.type === LogControllerType.EVENTS) console.warn('DRAG', e, drag);
  }
}
