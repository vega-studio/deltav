import { SimpleEventHandler } from "../../event-management/simple-event-handler.js";
import { IMouseInteraction, ISingleTouchInteraction, ITouchInteraction } from "../../event-management/types.js";
import { BaseProjection, Vec3 } from "../../math";
import { Bounds } from "../../math/primitives/bounds.js";
import { IViewProps, View } from "../../surface/view.js";
import { Camera2D } from "./camera-2d.js";
/**
 * Anchor options for the controller
 */
export declare enum CameraBoundsAnchor {
    TOP_LEFT = 0,
    TOP_MIDDLE = 1,
    TOP_RIGHT = 2,
    MIDDLE_LEFT = 3,
    MIDDLE = 4,
    MIDDLE_RIGHT = 5,
    BOTTOM_LEFT = 6,
    BOTTOM_MIDDLE = 7,
    BOTTOM_RIGHT = 8
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
    worldBounds: Bounds<any>;
}
export interface IBasicCamera2DControllerOptions {
    /** Takes in the options to be used for creating a new ViewBounds object on this controller. */
    bounds?: ICameraBoundsOptions;
    /** This is the camera this controller will manipulate */
    camera: Camera2D;
    /** When this is set to true, the start view can be targetted even when behind other views */
    ignoreCoverViews?: boolean;
    /**
     * This is a handler for when the camera has applied changes to the visible range of what is seen.
     * Which most likely means offset or scale has been altered.
     */
    onRangeChanged?(camera: Camera2D, projections: BaseProjection<any>): void;
    /**
     * This provides a control to filter panning that will be applied to the camera. The input and
     * output of this will be the delta value to be applied.
     */
    panFilter?(offset: [number, number, number], view: View<IViewProps>, allViews: View<IViewProps>[]): [number, number, number];
    /**
     * This adjusts how fast scaling is applied from the mouse wheel.
     * Default is 1000. Larger slows down.
     */
    scaleFactor?: number;
    /**
     * This adjusts how fast zooming is applied from pinch gestures. A nice
     * default is set for you, but you can override it.
     *
     * Default is 100. Larger slows down.
     */
    pinchScaleFactor?: number;
    /**
     * This provides a control to filter scaling that will be applied to the camera. The input and
     * output of this will be the delta value to be applied.
     */
    scaleFilter?(scale: [number, number, number], view: View<IViewProps>, allViews: View<IViewProps>[], isPinch?: boolean): [number, number, number];
    /**
     * This is the view that MUST be the start view from the events.
     * If not provided, then dragging anywhere will adjust the camera.
     * This MUST be set for onRangeChange to broadcast animated camera movements.
     */
    startView?: string | string[];
    /** When this is set, it will require two fingers to be down at minimum to pan the camera */
    twoFingerPan?: boolean;
    /**
     * This specifies whether a view can be scrolled by wheel
     * If this is not specified or set false, the view can be zoomed by wheel
     */
    wheelShouldScroll?: boolean;
}
/**
 * This provides some very basic common needs for a camera control system. This is not a total solution
 * for every scenario. This should just often handle most basic needs.
 */
export declare class BasicCamera2DController extends SimpleEventHandler {
    /** Unique identifier of this controller */
    get uid(): number;
    private _uid;
    /**
     * If total bounds of worldbounds + screenpadding is smaller
     * than width or height of view, anchor dictates placement.
     */
    bounds?: ICameraBoundsOptions;
    /** This is the camera that this controller will manipulate */
    get camera(): Camera2D;
    private _camera;
    /** When this is set to true, the start view can be targetted even when behind other views */
    ignoreCoverViews?: boolean;
    /** Informative property indicating the controller is panning the chart or not */
    isPanning: boolean;
    /** Informative property indicationt he controller is scaling via touch gesture */
    isScaling: boolean;
    /** This is the filter applied to panning operations */
    private panFilter;
    /** The rate scale is adjusted with the mouse wheel */
    scaleFactor: number;
    /**
     * This adjusts how fast zooming is applied from pinch gestures. A nice
     * default is set for you, but you can override it.
     */
    pinchScaleFactor: number;
    /** This is the filter applied to tscaling operations */
    private scaleFilter;
    /** The view that must be the start or focus of the interactions in order for the interactions to occur */
    startViews: string[];
    /** Whether a view can be scrolled by wheel */
    wheelShouldScroll?: boolean;
    /** Indicates if panning will happen with two or more fingers down instead of one */
    twoFingerPan: boolean;
    /** Stores the views this controller has flagged for optimizing */
    private optimizedViews;
    /** The animation used to immediately position the camera */
    private cameraImmediateAnimation;
    /** This is the identifier of the primary touch controlling panning */
    private targetTouches;
    /**
     * If an unconvered start view is not available, this is the next available covered view, if present
     */
    private coveredStartView?;
    /**
     * Callback for when the range has changed for the camera in a view
     */
    private onRangeChanged;
    /**
     * This flag is set to true when a start view is targetted on mouse down even if it is not
     * the top most view.
     */
    private startViewDidStart;
    /** Set to true to disable this controller from being used. */
    disabled: boolean;
    /**
     * Set to true to disable drag panning. While drag pannign is disabled, wheel
     * panning will still work if wheelShouldScroll is true.
     */
    disableDragPanning: boolean;
    constructor(options: IBasicCamera2DControllerOptions);
    /**
     * Corrects camera offset to respect the current bounds and anchor.
     */
    applyBounds: () => void;
    /**
     * Corrects camera scale to respect the current bounds and anchor.
     */
    applyScaleBounds: () => void;
    /**
     * Calculation for adhering to an anchor - x-axis offset only.
     */
    anchoredByBoundsHorizontal(targetView: View<IViewProps>, bounds: ICameraBoundsOptions): number;
    /**
     * Calculation for adhering to an anchor - y-axis offset only.
     */
    anchoredByBoundsVertical(targetView: View<IViewProps>, bounds: ICameraBoundsOptions): number;
    /**
     * Returns offset on x-axis due to current bounds and anchor.
     */
    boundsHorizontalOffset(targetView: View<IViewProps>, bounds: ICameraBoundsOptions): number;
    /**
     * Returns offset on y-axis due to current bounds and anchor.
     */
    boundsVerticalOffset(targetView: View<IViewProps>, bounds: ICameraBoundsOptions): number;
    /**
     * Computes if all conditions are met for this controller to begin modifying
     * the current camera state.
     */
    private canStart;
    /**
     * Centers the camera on a position. Must provide a reference view.
     */
    centerOn(viewId: string, position: Vec3): void;
    /**
     * Performs the panning operation for the camera
     *
     * @param allViews This is all of the related views under the event interactions
     * @param relativeView This is the view that performs the projections related to the operation
     * @param allViews All the views associated with the operation or event interaction
     * @param delta This is the amount of panning being requested to happen
     */
    private doPan;
    /**
     * Scales the camera relative to a point and a view.
     *
     * @param focalPoint The point the scaling happens around
     * @param targetView The relative view this operation happens in relation to
     * @param deltaScale The amount of scaling per axis that should happen
     */
    private doScale;
    /**
     * This filters a set of touches to be touches that had a valid starting view interaction.
     */
    filterTouchesByValidStart(touches: ISingleTouchInteraction[]): ISingleTouchInteraction[];
    /**
     * Finds a view within the event that matches a start view even if the view is covered by other views at the event's
     * interaction point.
     */
    private findCoveredStartView;
    /**
     * Evaluates the world bounds the specified view is observing
     *
     * @param viewId The id of the view when the view was generated when the surface was made
     */
    getRange(viewId: string): Bounds<never>;
    private getTargetView;
    /**
     * Used to aid in handling the pan effect and determine the contextual view targetted.
     */
    handleMouseDown(e: IMouseInteraction): void;
    /**
     * Aids in understanding how the user is interacting with the views. If a single touch is present, we're panning.
     * If multiple touches are present, we're panning and we're zooming
     */
    handleTouchDown(e: ITouchInteraction): void;
    /**
     * Used to aid in handling the pan effect. Stops panning operations when mouse is up.
     */
    handleMouseUp(_e: IMouseInteraction): void;
    /**
     * Used to stop panning and scaling effects
     */
    handleTouchUp(e: ITouchInteraction): void;
    /**
     * Used to stop panning and scaling effects when touches are forcibly ejected from existence.
     */
    handleTouchCancelled(e: ITouchInteraction): void;
    /**
     * Applies a panning effect by adjusting the camera's offset.
     */
    handleDrag(e: IMouseInteraction): void;
    /**
     * Applies panning effect from single or multitouch interaction.
     */
    handleTouchDrag(e: ITouchInteraction): void;
    /**
     * Applies a scaling effect to the camera for mouse wheel events
     */
    handleWheel(e: IMouseInteraction): void;
    /**
     * Handles changes broadcasted by the camera
     */
    private handleCameraViewChange;
    /**
     * Retrieves the current pan of the controlled camera
     */
    get pan(): Vec3;
    /**
     * Retrieves the current scale of the camera
     */
    get scale(): Vec3;
    /**
     * Sets bounds applicable to the supplied view.
     * If no view is supplied, it uses the first in the startViews array
     */
    setBounds(bounds: ICameraBoundsOptions): void;
    /**
     * Tells the controller to set an explicit offset for the camera.
     * Must provide a reference view.
     */
    setOffset(viewId: string, offset: Vec3): void;
    /**
     * This lets you set the visible range of a view based on the view's camera. This will probably not work
     * as expected if the view indicated and this controller do not share the same camera.
     *
     * @param viewId The id of the view when the view was generated when the surface was made
     */
    setRange(newWorld: Bounds<object>, viewId: string): void;
    /**
     * Applies a handler for the range changing.
     */
    setRangeChangeHandler(handler: BasicCamera2DController["onRangeChanged"]): void;
}
