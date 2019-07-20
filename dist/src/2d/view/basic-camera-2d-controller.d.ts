import { SimpleEventHandler } from "../../event-management/simple-event-handler";
import { IMouseInteraction, ISingleTouchInteraction, ITouchInteraction } from "../../event-management/types";
import { BaseProjection, Vec3 } from "../../math";
import { Bounds } from "../../math/primitives/bounds";
import { IViewProps, View } from "../../surface/view";
import { Camera2D } from "./camera-2d";
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
    worldBounds: Bounds<any>;
}
export interface IBasicCamera2DControllerOptions {
    bounds?: ICameraBoundsOptions;
    camera: Camera2D;
    ignoreCoverViews?: boolean;
    onRangeChanged?(camera: Camera2D, projections: BaseProjection<any>): void;
    panFilter?(offset: [number, number, number], view: View<IViewProps>, allViews: View<IViewProps>[]): [number, number, number];
    scaleFactor?: number;
    scaleFilter?(scale: [number, number, number], view: View<IViewProps>, allViews: View<IViewProps>[]): [number, number, number];
    startView?: string | string[];
    twoFingerPan?: boolean;
    wheelShouldScroll?: boolean;
}
export declare class BasicCamera2DController extends SimpleEventHandler {
    readonly uid: number;
    private _uid;
    bounds?: ICameraBoundsOptions;
    readonly camera: Camera2D;
    private _camera;
    ignoreCoverViews?: boolean;
    isPanning: boolean;
    isScaling: boolean;
    private panFilter;
    scaleFactor: number;
    private scaleFilter;
    startViews: string[];
    wheelShouldScroll: boolean;
    twoFingerPan: boolean;
    private optimizedViews;
    private cameraImmediateAnimation;
    private targetTouches;
    private coveredStartView;
    private onRangeChanged;
    private startViewDidStart;
    constructor(options: IBasicCamera2DControllerOptions);
    applyBounds: () => void;
    applyScaleBounds: () => void;
    anchoredByBoundsHorizontal(targetView: View<IViewProps>, bounds: ICameraBoundsOptions): number;
    anchoredByBoundsVertical(targetView: View<IViewProps>, bounds: ICameraBoundsOptions): number;
    boundsHorizontalOffset(targetView: View<IViewProps>, bounds: ICameraBoundsOptions): number;
    boundsVerticalOffset(targetView: View<IViewProps>, bounds: ICameraBoundsOptions): number;
    private canStart;
    centerOn(viewId: string, position: Vec3): void;
    private doPan;
    private doScale;
    filterTouchesByValidStart(touches: ISingleTouchInteraction[]): ISingleTouchInteraction[];
    private findCoveredStartView;
    getRange(viewId: string): Bounds<never>;
    private getTargetView;
    handleMouseDown(e: IMouseInteraction): void;
    handleTouchDown(e: ITouchInteraction): void;
    handleMouseUp(_e: IMouseInteraction): void;
    handleTouchUp(e: ITouchInteraction): void;
    handleTouchCancelled(e: ITouchInteraction): void;
    handleDrag(e: IMouseInteraction): void;
    handleTouchDrag(e: ITouchInteraction): void;
    handleWheel(e: IMouseInteraction): void;
    private handleCameraViewChange;
    readonly pan: Vec3;
    readonly scale: Vec3;
    setBounds(bounds: ICameraBoundsOptions): void;
    setOffset(viewId: string, offset: Vec3): void;
    setRange(newWorld: Bounds<{}>, viewId: string): void;
    setRangeChangeHandler(handler: BasicCamera2DController["onRangeChanged"]): void;
}
