import { Bounds } from "../primitives";
import { IProjection } from "../types";
import { IDragMetrics, IMouseInteraction, IWheelMetrics, MouseEventManager } from "./mouse-event-manager";
import { View } from "./view";
export declare abstract class EventManager {
    private mouseManager;
    abstract handleMouseDown(e: IMouseInteraction, button: number): void;
    abstract handleMouseUp(e: IMouseInteraction, button: number): void;
    abstract handleMouseOver(e: IMouseInteraction): void;
    abstract handleMouseOut(e: IMouseInteraction): void;
    abstract handleMouseMove(e: IMouseInteraction): void;
    abstract handleClick(e: IMouseInteraction, button: number): void;
    abstract handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
    abstract handleWheel(e: IMouseInteraction, wheel: IWheelMetrics): void;
    getProjection(viewId: string): IProjection | null;
    getView(viewId: string): View | null;
    getViewScreenBounds(viewId: string): Bounds | null;
    setMouseManager(mouseManager: MouseEventManager): void;
}
