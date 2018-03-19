import { EventManager } from '../surface/event-manager';
import { IDragMetrics, IMouseInteraction, IWheelMetrics } from '../surface/mouse-event-manager';
import { ChartCamera } from '../util/chart-camera';
export interface IBasicCameraControllerOptions {
    /** This is the camera this controller will manipulate */
    camera: ChartCamera;
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
    /** The rate scale is adjusted with the mouse wheel */
    scaleFactor: number;
    /** The view that must be the start or focus of the interactions in order for the interactions to occur */
    startViews: string[];
    constructor(options: IBasicCameraControllerOptions);
    handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
    handleWheel(e: IMouseInteraction, wheelMetrics: IWheelMetrics): void;
    canStart(viewId: string): boolean;
}
