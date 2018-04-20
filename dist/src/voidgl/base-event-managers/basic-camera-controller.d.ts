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
     * This adjusts how fast scaling is applied from the mouse wheel
     */
    scaleFactor?: number;
    /**
     * This is the view that MUST be the start view from the events.
     * If not provided, then dragging anywhere will adjust the camera
     */
    startView?: string | string[];
}
export declare class BasicCameraController extends EventManager {
    /** This is the camera that this controller will manipulate */
    camera: ChartCamera;
    /** When this is set to true, the start view can be targetted even when behind other views */
    ignoreCoverViews?: boolean;
    /** The rate scale is adjusted with the mouse wheel */
    scaleFactor: number;
    /** The view that must be the start or focus of the interactions in order for the interactions to occur */
    startViews: string[] | undefined;
    /**
     * This flag is set to true when a start view is targetted on mouse down even if it is not
     * the top most view.
     */
    private startViewDidStart;
    private coveredStartView;
    constructor(options: IBasicCameraControllerOptions);
    findCoveredStartView(e: IMouseInteraction): void;
    getTargetView(e: IMouseInteraction): View;
    handleMouseDown(e: IMouseInteraction, button: number): void;
    handleMouseUp(e: IMouseInteraction): void;
    handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
    handleWheel(e: IMouseInteraction, wheelMetrics: IWheelMetrics): void;
    canStart(viewId: string): boolean;
}
