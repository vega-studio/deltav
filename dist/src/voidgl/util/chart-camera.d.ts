export interface IChartCameraOptions {
    offset?: [number] | [number, number] | [number, number, number];
    scale?: [number] | [number, number] | [number, number, number];
}
export declare class ChartCamera {
    _id: number;
    offset: [number, number, number];
    scale: [number, number, number];
    constructor(options?: IChartCameraOptions);
    readonly id: number;
    position(location: [number, number, number]): void;
}
