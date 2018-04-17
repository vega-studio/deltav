import { EventManager } from '../surface/event-manager';
import { IDragMetrics, IMouseInteraction } from '../surface/mouse-event-manager';
/**
 * This is merely a controller to log mouse events for debugging.
 */
export declare class LogController extends EventManager {
    handleMouseDown(e: IMouseInteraction, button: number): void;
    handleMouseUp(e: IMouseInteraction): void;
    handleMouseOver(e: IMouseInteraction): void;
    handleMouseOut(e: IMouseInteraction): void;
    handleMouseMove(e: IMouseInteraction): void;
    handleClick(e: IMouseInteraction, button: number): void;
    handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
}
