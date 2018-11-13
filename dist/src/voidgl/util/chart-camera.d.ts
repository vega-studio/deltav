export interface IChartCameraOptions {
    offset?: [number] | [number, number] | [number, number, number];
    scale?: [number] | [number, number] | [number, number, number];
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
    setOffset(offset: [number, number, number]): void;
    readonly scale: [number, number, number];
    setScale(scale: [number, number, number]): void;
    readonly needsViewDrawn: boolean;
    resolve(): void;
    update(): void;
}
