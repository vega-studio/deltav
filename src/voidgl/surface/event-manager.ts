import { Bounds } from '../primitives';
import { IProjection } from '../types';
import { IDragMetrics, IMouseInteraction, IWheelMetrics, MouseEventManager } from './mouse-event-manager';
import { View } from './view';

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

  /**
   * This retrieves the projections for the view specified by the provided viewId.
   */
  getProjection(viewId: string): IProjection | null {
    return this.mouseManager.getView(viewId);
  }

  /**
   * This retrieves the actual view for the view specified by the provided viewId.
   */
  getView(viewId: string): View | null {
    return this.mouseManager.getView(viewId) || null;
  }

  /**
   * This retrieves the screen bounds for the view specified by the provided viewId.
   */
  getViewScreenBounds(viewId: string): Bounds | null {
    const view = this.mouseManager.getView(viewId);

    if (view) {
      return view.screenBounds;
    }

    return null;
  }

  /**
   * This is used internally which provides the parent MouseEventManager via the param mouseManager for this
   * EventManager.
   */
  setMouseManager(mouseManager: MouseEventManager) {
    this.mouseManager = mouseManager;
  }
}
