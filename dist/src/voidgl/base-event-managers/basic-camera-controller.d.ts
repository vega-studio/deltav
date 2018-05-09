import { Bounds } from '../primitives/bounds';
import { EventManager } from '../surface/event-manager';
import { IDragMetrics, IMouseInteraction, IWheelMetrics } from '../surface/mouse-event-manager';
import { View } from '../surface/view';
import { Vec3 } from '../util';
import { ChartCamera } from '../util/chart-camera';
export declare enum CameraBoundsAnchor {
    TOP_LEFT = 0,
    TOP_MIDDLE = 1,
    TOP_RIGHT = 2,
    MIDDLE_LEFT = 3,
    MIDDLE = 4,
    MIDDLE_RIGHT = 5,
    BOTTOM_LEFT = 6,
    BOTTOM_MIDDLE = 7,
    BOTTOM_RIGHT = 8,
}
/**
 * This represents how the camera should be bounded in the world space. This gives enough information
 * to handle all cases of bounding, including screen padding and anchoring for cases where the viewed space
 * is smaller than the view.
 */
export interface ICameraBoundsOptions {
    /** How the bounded world space should anchor itself within the view when the projected world space to the screen is smaller than the view */
    anchor: CameraBoundsAnchor;
    /** Minimum settings the camera can scale to */
    scaleMin?: Vec3;
    /** Maximum settings the camera can scale to */
    scaleMax?: Vec3;
    /** The actual screen pixels the bounds can exceed when the camera's view has reached the bounds of the world */
    screenPadding: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    /** This is the view for which the bounds applies towards */
    view: string;
    /** The area the camera is bound inside */
    worldBounds: Bounds;
}
export interface IBasicCameraControllerOptions {
    /** Takes in the options to be used for creating a new ViewBounds object on this controller. */
    bounds?: ICameraBoundsOptions;
    /** This is the camera this controller will manipulate */
    camera: ChartCamera;
    /** When this is set to true, the start view can be targetted even when behind other views */
    ignoreCoverViews?: boolean;
    /**
     * This provides a control to filter panning that will be applied to the camera. The input and
     * output of this will be the delta value to be applied.
     */
    panFilter?(offset: [number, number, number], view: View, allViews: View[]): [number, number, number];
    /**
     * This adjusts how fast scaling is applied from the mouse wheel
     */
    scaleFactor?: number;
    /**
     * This provides a control to filter scaling that will be applied to the camera. The input and
     * output of this will be the delta value to be applied.
     */
    scaleFilter?(scale: [number, number, number], view: View, allViews: View[]): [number, number, number];
    /**
     * This is the view that MUST be the start view from the events.
     * If not provided, then dragging anywhere will adjust the camera
     */
    startView?: string | string[];
    /**
     * This is a handler for when the camera has applied changes to the visible range of what is seen.
     * Which most likely means offset or scale has been altered.
     */
    onRangeChanged?(camera: ChartCamera, targetView: View): void;
}
/**
 * This provides some very basic common needs for a camera control system. This is not a total solution
 * very every scenario. This should just often handle most basic needs.
 */
export declare class BasicCameraController extends EventManager {
    /**
     * If total bounds of worldbounds + screenpadding is smaller
     * than width or height of view, anchor dictates placement.
     */
    bounds?: ICameraBoundsOptions;
    /** This is the camera that this controller will manipulate */
    camera: ChartCamera;
    /** When this is set to true, the start view can be targetted even when behind other views */
    ignoreCoverViews?: boolean;
    /** Informative property indicating the controller is panning the chart or not */
    isPanning: boolean;
    /** This is the filter applied to panning operations */
    private panFilter;
    /** The rate scale is adjusted with the mouse wheel */
    scaleFactor: number;
    /** THis is the filter applied to tscaling operations */
    private scaleFilter;
    /** The view that must be the start or focus of the interactions in order for the interactions to occur */
    startViews: string[] | undefined;
    /**
     * If an unconvered start view is not available, this is the next available covered view, if present
     */
    private coveredStartView;
    /**
     * Callback for when the range has changed for the camera in a view
     */
    private onRangeChanged;
    /**
     * This flag is set to true when a start view is targetted on mouse down even if it is not
     * the top most view.
     */
    private startViewDidStart;
    constructor(options: IBasicCameraControllerOptions);
    /**
     * Corrects camera offset to respect current bounds and anchor.
     */
    applyBounds: () => void;
    applyScaleBounds: () => void;
    /**
     * Calculation for adhering to an anchor - x-axis offset only.
     */
    anchoredByBoundsHorizontal(targetView: View): number;
    /**
     * Calculation for adhering to an anchor - y-axis offset only.
     */
    anchoredByBoundsVertical(targetView: View): number;
    /**
     * Returns offset on x-axis due to current bounds and anchor.
     */
    boundsHorizontalOffset(targetView: View): number;
    /**
     * Returns offset on y-axis due to current bounds and anchor.
     */
    boundsVerticalOffset(targetView: View): number;
    private canStart(viewId);
    private findCoveredStartView(e);
    private getTargetView(e);
    /**
     * Used to aid in handling the pan effect and determine the contextual view targetted.
     */
    handleMouseDown(e: IMouseInteraction, button: number): void;
    /**
     * Used to aid in handling the pan effect
     */
    handleMouseUp(e: IMouseInteraction): void;
    /**
     * Applies a panning effect by adjusting the camera's offset.
     */
    handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
    /**
     * Applies a scaling effect to the camera for mouse wheel events
     */
    handleWheel(e: IMouseInteraction, wheelMetrics: IWheelMetrics): void;
    handleMouseOut(e: IMouseInteraction): void;
    handleClick(e: IMouseInteraction): void;
    handleMouseMove(e: IMouseInteraction): void;
    handleMouseOver(e: IMouseInteraction): void;
    /**
     * Evaluates the world bounds the specified view is observing
     *
     * @param viewId The id of the view when the view was generated when the surface was made
     */
    getRange(viewId: string): Bounds;
    /**
     * Retrieves the current pan of the controlled camera
     */
    readonly pan: Vec3;
    /**
     * Sets bounds applicable to the supplied view.
     * If no view is supplied, it uses the first in the startViews array
     */
    setBounds(bounds: ICameraBoundsOptions): void;
    /**
     * Retrieves the current scale of the camera
     */
    readonly scale: Vec3;
    /**
     * This lets you set the visible range of a view based on the view's camera. This will probably not work
     * as expected if the view indicated and this controller do not share the same camera.
     *
     * @param viewId The id of the view when the view was generated when the surface was made
     */
    setRange(newWorld: Bounds, viewId: string): void;
}
