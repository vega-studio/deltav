import { Vec2 } from "../math/vector";
import { IViewProps, View } from "../surface/view";
export declare enum MouseButton {
    NONE = -1,
    LEFT = 0,
    AUX = 1,
    RIGHT = 2,
    FOURTH = 3,
    FIFTH = 4
}
export interface IEventInteraction {
    screen: {
        position: Vec2;
    };
    start: {
        position: Vec2;
        view: View<IViewProps>;
        views: {
            position: Vec2;
            view: View<IViewProps>;
        }[];
    };
    target: {
        position: Vec2;
        view: View<IViewProps>;
        views: {
            position: Vec2;
            view: View<IViewProps>;
        }[];
    };
}
export interface IMouseInteraction extends IEventInteraction {
    mouse: IMouseMetrics;
}
export interface IWheelMetrics {
    delta: [number, number];
}
export interface ITouchRelation {
    direction: Vec2;
    distance: number;
    id: number;
}
export interface ITouchFrame {
    location: Vec2;
    direction: Vec2;
    relations: Map<number, ITouchRelation>;
}
export interface IInteractionMetrics {
    currentPosition: Vec2;
    deltaPosition: Vec2;
    previousPosition: Vec2;
    startTime: number;
    start: Vec2;
    startView: View<IViewProps> | undefined;
}
export interface IMouseMetrics extends IInteractionMetrics {
    button: MouseButton;
    canClick: boolean;
    event: MouseEvent;
    wheel: IWheelMetrics;
}
export interface ITouchMetrics extends IInteractionMetrics {
    canTap: boolean;
    startRelative: Map<ITouchMetrics, Vec2>;
    touch: Touch;
}
export interface IMultiTouchMetrics {
    averageSpreadDelta: number;
    centerDelta: Vec2;
    currentCenter: Vec2;
    currentRotation: number;
    rotationDelta: number;
    startCenter: Vec2;
    touches: ITouchMetrics[];
}
export interface ITouchInteraction {
    allTouches: ISingleTouchInteraction[];
    multitouch: IMultiTouchInteraction;
    touches: ISingleTouchInteraction[];
}
export interface ISingleTouchInteraction extends IEventInteraction {
    touch: ITouchMetrics;
}
export interface IMultiTouchInteraction {
    id(touches: ISingleTouchInteraction[]): string;
    spread(touches: ISingleTouchInteraction[]): number;
    spreadDelta(touches: ISingleTouchInteraction[]): number;
    spreadStart(touches: ISingleTouchInteraction[]): number;
    center(touches: ISingleTouchInteraction[]): Vec2;
    centerDelta(touches: ISingleTouchInteraction[]): Vec2;
    centerStart(touches: ISingleTouchInteraction[]): Vec2;
    rotation(touches: ISingleTouchInteraction[]): number;
    rotationDelta(touches: ISingleTouchInteraction[]): number;
    rotationStart(touches: ISingleTouchInteraction[]): number;
}
