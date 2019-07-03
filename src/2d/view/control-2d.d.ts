import { Surface } from "../../surface";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { Vec3 } from "../../util/vector";
import { Camera2D } from "./camera-2d";
export interface IControl2DOptions {
    offset?: Vec3;
    scale?: Vec3;
}
export declare class Control2D {
    readonly id: number;
    private _id;
    animation: IAutoEasingMethod<Vec3>;
    animationEndTime: number;
    camera: Camera2D;
    private offsetBroadcastTime;
    private scaleBroadcastTime;
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
    private needsBroadcast;
    constructor(camera: Camera2D, options?: IControl2DOptions);
    broadcast(viewId: string): void;
    centerOn(viewId: string, position: Vec3): void;
    private getCurrentTime;
    getOffset(): [number, number, number];
    getScale(): [number, number, number];
    readonly needsViewDrawn: boolean;
    readonly offset: [number, number, number];
    setId(id: number): void;
    setOffset(offset: Vec3): void;
    readonly scale: [number, number, number];
    setViewChangeHandler(handler: Control2D["onViewChange"]): void;
    setScale(scale: Vec3): void;
    resolve(): void;
    update(): void;
    private updateEndTime;
}
