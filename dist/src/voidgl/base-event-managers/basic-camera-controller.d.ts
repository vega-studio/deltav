import { Bounds } from '../primitives/bounds';
import { EventManager } from '../surface/event-manager';
import { IDragMetrics, IMouseInteraction, IWheelMetrics } from '../surface/mouse-event-manager';
import { View } from '../surface/view';
import { ChartCamera } from '../util/chart-camera';
export interface IBasicCameraControllerOptions {
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
}
/**
 * This provides some very basic common needs for a camera control system. This is not a total solution
 * very every scenario. This should just often handle most basic needs.
 */
export declare class BasicCameraController extends EventManager {
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
     * This flag is set to true when a start view is targetted on mouse down even if it is not
     * the top most view.
     */
    private startViewDidStart;
    /**
     * If an unconvered start view is not available, this is the next available covered view, if present
     */
    private coveredStartView;
    constructor(options: IBasicCameraControllerOptions);
    readonly pan: [number, number, number];
    readonly scale: [number, number, number];
    canStart(viewId: string): boolean;
    findCoveredStartView(e: IMouseInteraction): void;
    getTargetView(e: IMouseInteraction): View;
    handleMouseDown(e: IMouseInteraction, button: number): void;
    handleMouseUp(e: IMouseInteraction): void;
    handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
    handleWheel(e: IMouseInteraction, wheelMetrics: IWheelMetrics): void;
    handleMouseOut(e: IMouseInteraction): void;
    handleClick(e: IMouseInteraction): void;
    handleMouseMove(e: IMouseInteraction): void;
    handleMouseOver(e: IMouseInteraction): void;
    /**
     * Evaluates the world bounds the specified view is observing
     */
    getRange(view: string): Bounds;
    /**
     * This lets you set the visible range of a view based on the view's camera. This will probably not work
     * as expected if the view indicated and this controller do not share the same camera.
     */
    setRange(newWorld: Bounds, view: string): void;
}
