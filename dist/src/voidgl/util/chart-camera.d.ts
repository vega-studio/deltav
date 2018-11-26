import { Vec3 } from "./vector";
export interface IChartCameraOptions {
    offset?: [number] | [number, number] | Vec3;
    scale?: [number] | [number, number] | Vec3;
}
export declare class ChartCamera {
    private _id;
    private _offset;
    private _scale;
    private _needsViewDrawn;
    constructor(options?: IChartCameraOptions);
    readonly id: number;
    setId(id: number): void;
    readonly offset: [number, number, number];
    setOffset(offset: Vec3): void;
    readonly scale: [number, number, number];
    setScale(scale: Vec3): void;
    readonly needsViewDrawn: boolean;
    resolve(): void;
    update(): void;
}
