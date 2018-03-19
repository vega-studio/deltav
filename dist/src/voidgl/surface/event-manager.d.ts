import { IDragMetrics, IMouseInteraction, IWheelMetrics } from './mouse-event-manager';
/**
 * Classes can extend this and override the methods to respond to events.
 */
export declare class EventManager {
    handleMouseDown(e: IMouseInteraction, button: number): void;
    handleMouseUp(e: IMouseInteraction): void;
    handleMouseOver(e: IMouseInteraction): void;
    handleMouseOut(e: IMouseInteraction): void;
    handleMouseMove(e: IMouseInteraction): void;
    handleClick(e: IMouseInteraction, button: number): void;
    handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
    handleWheel(e: IMouseInteraction, wheel: IWheelMetrics): void;
}
