import { Bounds } from "../primitives";
import { Vec2 } from "../util";
import { QuadTree } from "../util/quad-tree";
import { EventManager } from "./event-manager";
import { LayerScene } from "./layer-scene";
import { Surface } from "./surface";
import { View } from "./view";
export interface IMouseInteraction {
    button?: number;
    screen: {
        mouse: Vec2;
    };
    start?: {
        mouse: Vec2;
        view: View;
    };
    target: {
        mouse: Vec2;
        view: View;
    };
    viewsUnderMouse: {
        mouse: Vec2;
        view: View;
    }[];
}
export interface IDragMetrics {
    screen: {
        start: Vec2;
        previous: Vec2;
        current: Vec2;
        delta: Vec2;
    };
}
export interface IWheelMetrics {
    wheel: [number, number];
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
export interface ITouchMetrics {
    start: ITouchFrame;
    delta: ITouchFrame;
    current: ITouchFrame;
}
export declare class MouseEventManager {
    context: HTMLCanvasElement;
    controllers: EventManager[];
    quadTree: QuadTree<Bounds<View>>;
    surface: Surface;
    eventCleanup: [string, EventListenerOrEventListenerObject][];
    private _waitingForRender;
    waitingForRender: boolean;
    readonly scenes: LayerScene[];
    constructor(canvas: HTMLCanvasElement, surface: Surface, controllers: EventManager[], handlesWheelEvents?: boolean);
    addContextListeners(handlesWheelEvents?: boolean): void;
    addTouchContextListeners(): void;
    getView(viewId: string): View | null;
    getViewsUnderMouse: (mouse: [number, number]) => Bounds<View>[];
    makeDrag(mouse: Vec2, start: Vec2, previous: Vec2, delta: Vec2): IDragMetrics;
    makeInteraction(mouse: Vec2, start?: Vec2, startView?: View): IMouseInteraction;
    makeWheel(event: MouseWheelEvent): IWheelMetrics;
    resize: () => void;
    setControllers(controllers: EventManager[]): void;
    destroy(): void;
}
