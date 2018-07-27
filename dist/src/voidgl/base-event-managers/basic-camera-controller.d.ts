import { Bounds } from "../primitives/bounds";
import { EventManager } from "../surface/event-manager";
import { IDragMetrics, IMouseInteraction, IWheelMetrics } from "../surface/mouse-event-manager";
import { View } from "../surface/view";
import { Vec3 } from "../util";
import { ChartCamera } from "../util/chart-camera";
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
export interface ICameraBoundsOptions {
    anchor: CameraBoundsAnchor;
    scaleMin?: Vec3;
    scaleMax?: Vec3;
    screenPadding: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    view: string;
    worldBounds: Bounds;
}
export interface IBasicCameraControllerOptions {
    bounds?: ICameraBoundsOptions;
    camera: ChartCamera;
    ignoreCoverViews?: boolean;
    panFilter?(offset: [number, number, number], view: View, allViews: View[]): [number, number, number];
    scaleFactor?: number;
    scaleFilter?(scale: [number, number, number], view: View, allViews: View[]): [number, number, number];
    startView?: string | string[];
    onRangeChanged?(camera: ChartCamera, targetView: View): void;
}
export declare class BasicCameraController extends EventManager {
    bounds?: ICameraBoundsOptions;
    camera: ChartCamera;
    ignoreCoverViews?: boolean;
    isPanning: boolean;
    private panFilter;
    scaleFactor: number;
    private scaleFilter;
    startViews: string[];
    private coveredStartView;
    private onRangeChanged;
    private startViewDidStart;
    constructor(options: IBasicCameraControllerOptions);
    applyBounds: () => void;
    applyScaleBounds: () => void;
    anchoredByBoundsHorizontal(targetView: View, bounds: ICameraBoundsOptions): number;
    anchoredByBoundsVertical(targetView: View, bounds: ICameraBoundsOptions): number;
    boundsHorizontalOffset(targetView: View, bounds: ICameraBoundsOptions): number;
    boundsVerticalOffset(targetView: View, bounds: ICameraBoundsOptions): number;
    private canStart;
    private findCoveredStartView;
    private getTargetView;
    handleMouseDown(e: IMouseInteraction, _button: number): void;
    handleMouseUp(_e: IMouseInteraction): void;
    handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
    handleWheel(e: IMouseInteraction, wheelMetrics: IWheelMetrics): void;
    handleMouseOut(_e: IMouseInteraction): void;
    handleClick(_e: IMouseInteraction): void;
    handleMouseMove(_e: IMouseInteraction): void;
    handleMouseOver(_e: IMouseInteraction): void;
    getRange(viewId: string): Bounds;
    readonly pan: Vec3;
    setBounds(bounds: ICameraBoundsOptions): void;
    readonly scale: Vec3;
    setRange(newWorld: Bounds, viewId: string): void;
}
