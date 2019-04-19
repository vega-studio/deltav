import { ChartCamera } from "./chart-camera";
export interface IReferenceCameraOptions {
    base: ChartCamera;
    offsetFilter?(offset: [number, number, number]): [number, number, number];
    scaleFilter?(scale: [number, number, number]): [number, number, number];
}
export declare class ReferenceCamera extends ChartCamera {
    private base;
    private offsetFilter;
    private scaleFilter;
    offset: any;
    scale: any;
    constructor(options: IReferenceCameraOptions);
}
