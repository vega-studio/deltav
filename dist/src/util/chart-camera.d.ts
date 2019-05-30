import { Surface } from "../surface";
import { IAutoEasingMethod } from "../util/auto-easing-method";
import { Vec3 } from "./vector";
export interface IChartCameraOptions {
    offset?: Vec3;
    scale?: Vec3;
}
export declare class ChartCamera {
    animation: IAutoEasingMethod<Vec3>;
    animationEndTime: number;
    private offsetBroadcastTime;
    private scaleBroadcastTime;
    private _id;
    private _offset;
    private startOffset;
    private startOffsetTime;
    private offsetEndTime;
    private _scale;
    private startScale;
    private startScaleTime;
    private scaleEndTime;
    private _needsViewDrawn;
    surface: Surface;
    private onViewChange?;
    private viewChangeViewId;
    private needsBroadcast;
    readonly id: number;
    constructor(options?: IChartCameraOptions);
    broadcast(): void;
    centerOn(viewId: string, position: Vec3): void;
    private getCurrentTime;
    getOffset(): [number, number, number];
    getScale(): [number, number, number];
    readonly needsViewDrawn: boolean;
    readonly offset: [number, number, number];
    setId(id: number): void;
    setOffset(offset: Vec3): void;
    readonly scale: [number, number, number];
    setViewChangeHandler(viewId: string, handler: ChartCamera["onViewChange"]): void;
    setScale(scale: Vec3): void;
    resolve(): void;
    update(): void;
    private updateEndTime;
}
