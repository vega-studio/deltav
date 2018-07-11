import { IPoint } from "../primitives/point";
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
        mouse: IPoint;
    };
    start?: {
        mouse: IPoint;
        view: View;
    };
    target: {
        mouse: IPoint;
        view: View;
    };
    viewsUnderMouse: {
        mouse: IPoint;
        view: View;
    }[];
}
export interface IDragMetrics {
    screen: {
        start: IPoint;
        previous: IPoint;
        current: IPoint;
        delta: IPoint;
    };
}
export interface IWheelMetrics {
    wheel: [number, number];
}
export interface ITouchRelation {
    direction: IPoint;
    distance: number;
    id: number;
}
export interface ITouchFrame {
    location: IPoint;
    direction: IPoint;
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
    getViewsUnderMouse: (mouse: IPoint) => DataBounds<SceneView>[];
    makeDrag(mouse: IPoint, start: IPoint, previous: IPoint, delta: IPoint): IDragMetrics;
    makeInteraction(mouse: IPoint, start?: IPoint, startView?: SceneView): IMouseInteraction;
    makeWheel(event: MouseWheelEvent): IWheelMetrics;
    resize: () => void;
    setControllers(controllers: EventManager[]): void;
    setViews(views: SceneView[]): void;
    destroy(): void;
}
