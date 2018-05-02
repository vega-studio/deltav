import { Bounds } from '../primitives';
import { IProjection } from '../types';
import { IDragMetrics, IMouseInteraction, IWheelMetrics, MouseEventManager } from './mouse-event-manager';

/**
 * Classes can extend this and override the methods to respond to events.
 */
export abstract class EventManager {
  private mouseManager: MouseEventManager;

  abstract handleMouseDown(e: IMouseInteraction, button: number): void;
  abstract handleMouseUp(e: IMouseInteraction, button: number): void;
  abstract handleMouseOver(e: IMouseInteraction): void;
  abstract handleMouseOut(e: IMouseInteraction): void;
  abstract handleMouseMove(e: IMouseInteraction): void;
  abstract handleClick(e: IMouseInteraction, button: number): void;
  abstract handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
  abstract handleWheel(e: IMouseInteraction, wheel: IWheelMetrics): void;

  getProjection(viewId: string): IProjection | null {
    return this.mouseManager.getView(viewId);
  }

  getViewScreenBounds(viewId: string): Bounds | null {
    const view = this.mouseManager.getView(viewId);

    if (view) {
      return view.screenBounds;
    }

    return null;
  }

  setMouseManager(mouseManager: MouseEventManager) {
    this.mouseManager = mouseManager;
  }
}
