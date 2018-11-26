import { Vec2 } from "../util";
import { DataBounds } from "../util/data-bounds";
import { QuadTree } from "../util/quad-tree";
import { EventManager } from "./event-manager";
import { Scene } from "./scene";
import { View } from "./view";
export declare type SceneView = {
    depth: number;
    scene: Scene;
    view: View;
    bounds?: DataBounds<SceneView>;
};
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
    quadTree: QuadTree<DataBounds<SceneView>>;
    views: SceneView[];
    eventCleanup: [string, EventListenerOrEventListenerObject][];
    private _waitingForRender;
    waitingForRender: boolean;
    constructor(canvas: HTMLCanvasElement, views: SceneView[], controllers: EventManager[], handlesWheelEvents?: boolean);
    addContextListeners(handlesWheelEvents?: boolean): void;
    addTouchContextListeners(): void;
    getView(viewId: string): View | null;
    getViewsUnderMouse: (mouse: [number, number]) => DataBounds<SceneView>[];
    makeDrag(mouse: Vec2, start: Vec2, previous: Vec2, delta: Vec2): IDragMetrics;
    makeInteraction(mouse: Vec2, start?: Vec2, startView?: SceneView): IMouseInteraction;
    makeWheel(event: MouseWheelEvent): IWheelMetrics;
    resize: () => void;
    setControllers(controllers: EventManager[]): void;
    setViews(views: SceneView[]): void;
    destroy(): void;
}
