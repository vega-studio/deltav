import { IPoint } from '../primitives/point';
import { DataBounds } from '../util/data-bounds';
import { QuadTree } from '../util/quad-tree';
import { EventManager } from './event-manager';
import { Scene } from './scene';
import { View } from './view';
/**
 * Theorectically we can have a view be applied to multiple scenes. So to properly qualify a view
 * it must be paired with the scene it is rendering for.
 */
export declare type SceneView = {
    /** This specifies the order the view is rendered in so we can pick the top most item when needed */
    depth: number;
    /** This is the scene the view is rendering for */
    scene: Scene;
    /** This is the view itself that our mouse will interact with */
    view: View;
    /** Gets the bounds of this view for this particular scene */
    bounds?: DataBounds<SceneView>;
};
/**
 * This represents an interaction with the Layer Surface. It provides mouse metrics with how the mouse
 * interacts with the views below it.
 */
export interface IMouseInteraction {
    /** Metrics of the interaction in screen space */
    screen: {
        mouse: IPoint;
    };
    /** The View the mouse was 'down' on */
    start?: {
        mouse: IPoint;
        view: View;
    };
    /** The View Immediately underneath the mouse */
    target: {
        mouse: IPoint;
        view: View;
    };
    /** This is populated with ALL of the views underneath the mouse */
    viewsUnderMouse: {
        mouse: IPoint;
        view: View;
    }[];
}
export interface IDragMetrics {
    /** Drag metrics in screen space */
    screen: {
        /** The start position of the drag where the mouse down first occurred */
        start: IPoint;
        /** The previous position of the mouse last frame */
        previous: IPoint;
        /** The current position the mouse is located for this frame */
        current: IPoint;
        /** The change in position from last frame to this frame */
        delta: IPoint;
    };
}
export interface IWheelMetrics {
    wheel: [number, number];
}
/**
 * This manages mouse events on the provided canvas and provides some higher level
 * interactions with the surface.
 */
export declare class MouseEventManager {
    /** This is the canvas context we are rendering to */
    context: HTMLCanvasElement;
    /** This is list of Event Managers that receive the events and gestures which perform the nexessary actions */
    controllers: EventManager[];
    /** This is the quad tree for finding intersections with the mouse */
    quadTree: QuadTree<DataBounds<SceneView>>;
    /** This is the current list of views being managed */
    views: SceneView[];
    /**
     * This flag is set when the system is waiting to render the elements to establish bounds.
     * No Mouse interations will happen while this is set to true.
     */
    private _waitingForRender;
    waitingForRender: boolean;
    constructor(canvas: HTMLCanvasElement, views: SceneView[], controllers: EventManager[], handlesWheelEvents?: boolean);
    /**
     * This sets up the DOM events to listen to the events that are broadcasted by the canvas.
     * These events are set up in such a way as to continue some events when the user
     * drags the mouse off of the browser or off the canvas without releasing.
     */
    addContextListeners(handlesWheelEvents?: boolean): void;
    /**
     * Retrieves the views underneath the mouse with the top most view as
     * the first view in the list.
     */
    getViewsUnderMouse: (mouse: IPoint) => DataBounds<SceneView>[];
    /**
     * This generates the metrics for a drag gesture.
     */
    makeDrag(mouse: IPoint, start: IPoint, previous: IPoint, delta: IPoint): IDragMetrics;
    /**
     * This makes the metrics for interactions with the views.
     */
    makeInteraction(mouse: IPoint, start?: IPoint, startView?: SceneView): IMouseInteraction;
    makeWheel(event: MouseWheelEvent): IWheelMetrics;
    /**
     * When the renderer is resized, we must reform our quad tree
     */
    resize: () => void;
    /**
     * Sets the controllers to receive events from this manager.
     */
    setControllers(controllers: EventManager[]): void;
    /**
     * Sets the views that gets queried for interactions.
     */
    setViews(views: SceneView[]): void;
    destroy(): void;
}
