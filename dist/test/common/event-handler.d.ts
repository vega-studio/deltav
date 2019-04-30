import { EventManager, IDragMetrics, IMouseInteraction, IWheelMetrics } from "src";
export declare class EventHandler extends EventManager {
    constructor(handlers: Partial<EventManager>);
    handleMouseDown(_e: IMouseInteraction, _button: number): void;
    handleMouseUp(_e: IMouseInteraction, _button: number): void;
    handleMouseOver(_e: IMouseInteraction): void;
    handleMouseOut(_e: IMouseInteraction): void;
    handleMouseMove(_e: IMouseInteraction): void;
    handleClick(_e: IMouseInteraction, _button: number): void;
    handleDrag(_e: IMouseInteraction, _drag: IDragMetrics): void;
    handleWheel(_e: IMouseInteraction, _wheel: IWheelMetrics): void;
}
