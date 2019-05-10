import { LayerSurface } from "../surface";
import { IAutoEasingMethod } from "../util/auto-easing-method";
import { Vec3 } from "./vector";
export interface IChartCameraOptions {
    offset?: Vec3;
    scale?: Vec3;
}
export declare class ChartCamera {
    animation: IAutoEasingMethod<Vec3>;
    animationEndTime: number;
    private _id;
    private _offset;
    private startOffset;
    private startOffsetTime;
    private _scale;
    private startScale;
    private startScaleTime;
    private _needsViewDrawn;
    surface: LayerSurface;
    constructor(options?: IChartCameraOptions);
    readonly id: number;
    centerOn(viewId: string, position: Vec3): void;
    setId(id: number): void;
    readonly offset: [number, number, number];
    getOffset(): [number, number, number];
    getScale(): [number, number, number];
    setOffset(offset: Vec3): void;
    readonly scale: [number, number, number];
    setScale(scale: Vec3): void;
    readonly needsViewDrawn: boolean;
    resolve(): void;
    update(): void;
    private getCurrentTime;
}
