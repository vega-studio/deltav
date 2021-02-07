import { CanvasElement } from "../gl";
import { Bounds } from "../math/primitives";
import { Vec2 } from "../math/vector";
import { LayerScene } from "../surface/layer-scene";
import { Surface } from "../surface/surface";
import { IViewProps, View } from "../surface/view";
import { QuadTree } from "../util/quad-tree";
import { EventManager } from "./event-manager";
import { IEventInteraction, IMouseInteraction, IMouseMetrics, IMultiTouchMetrics, ISingleTouchInteraction, ITouchMetrics, IWheelMetrics } from "./types";
/**
 * This manages mouse events on the provided canvas and provides some higher
 * level interactions with the surface.
 */
export declare class UserInputEventManager {
    /** This is the canvas context we are rendering to */
    context: CanvasElement;
    /**
     * This is list of Event Managers that receive the events and gestures which
     * respond to the events and perform actions.
     */
    eventManagers: EventManager[];
    /** This is the quad tree for finding intersections with the mouse */
    quadTree: QuadTree<Bounds<View<IViewProps>>>;
    /** The parent layer surface this event manager is beneath */
    surface: Surface;
    /** The events created that need to be removed */
    eventCleanup: [string, EventListenerOrEventListenerObject][];
    /** This is the most recent event interaction produced by this manager */
    currentInteraction?: IEventInteraction;
    /**
     * This flag is set when the system is waiting to render the elements to
     * establish bounds. No Mouse interations will happen while this is set to
     * true.
     */
    private _waitingForRender;
    get waitingForRender(): boolean;
    set waitingForRender(val: boolean);
    get scenes(): LayerScene[];
    constructor(canvas: CanvasElement, surface: Surface, controllers: EventManager[], handlesWheelEvents?: boolean);
    /**
     * This sets up the DOM events to listen to the events that are broadcasted by the canvas.
     * These events are set up in such a way as to continue some events when the user
     * drags the mouse off of the browser or off the canvas without releasing.
     */
    addContextListeners(handlesWheelEvents?: boolean): void;
    /**
     * Adds all listeners needed to make the mouse interact with the context.
     */
    private addMouseContextListeners;
    /**
     * Adds all the listeners necessary to make the context interactive with multitouch support.
     */
    private addTouchContextListeners;
    /**
     * This takes all of the touches and averages their distance from the center point.
     */
    getAverageDistance(touches: ITouchMetrics[], center: Vec2, accessor?: (touch: ITouchMetrics) => Vec2): number;
    /**
     * This takes all of the touches and averages their angle around the center point.
     */
    getAverageAngle(touches: ITouchMetrics[], center: Vec2, accessor?: (touch: ITouchMetrics) => Vec2): number;
    /**
     * This takes a list of touches and averages their position for a mid point between all of them.
     */
    getTouchCenter(touches: ITouchMetrics[], accessor?: (touch: ITouchMetrics) => Vec2): Vec2;
    /**
     * Retrieves all touches from a touch event. This normalizes the touch information across: touches, changedTouches,
     * and targetTouches
     */
    getTouches(event: TouchEvent, category?: "touches" | "changed" | "target"): Touch[];
    /**
     * Retrieves the view for the provided id
     */
    getView(viewId: string): View<IViewProps> | null;
    /**
     * Retrieves the views underneath the mouse with the top most view as
     * the first view in the list.
     */
    getViewsUnderPosition: (mouse: Vec2) => Bounds<View<IViewProps>>[];
    /**
     * This makes the metrics for interactions with the views.
     */
    makeMouseInteraction(mouse: IMouseMetrics): IMouseInteraction;
    /**
     * Make an interaction depicting the interactions with the touch
     */
    makeSingleTouchInteraction(touch: ITouchMetrics): ISingleTouchInteraction;
    /**
     * This produces an object for handling several touches at once. It will store all of the combinations of touches
     * and their associative metrics into the lookup mapping provideds.
     */
    makeMultiTouchInteractions(touchMetrics: ITouchMetrics[], multiTouchLookup: Map<string, IMultiTouchMetrics>): void;
    /**
     * This updates all existing multitouch metrics with their new frame of data
     */
    updateMultiTouchInteractions(touchMetrics: ITouchMetrics[], multiTouchLookup: Map<string, IMultiTouchMetrics>): void;
    /**
     * This makes all of the possible combinations of touches.
     */
    allTouchCombinations(list: ITouchMetrics[]): ITouchMetrics[][];
    makeWheel(event?: MouseWheelEvent): IWheelMetrics;
    /**
     * When the renderer is resized, we must reform our quad tree
     */
    resize: () => void;
    /**
     * Sets the controllers to receive events from this manager.
     */
    setControllers(controllers: EventManager[]): void;
    destroy(): void;
}
