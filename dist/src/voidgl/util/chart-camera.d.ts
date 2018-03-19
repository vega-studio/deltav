export interface IChartCameraOptions {
    /** The world space offset of elements in the chart */
    offset?: [number] | [number, number] | [number, number, number];
    /** The world space scaling present in the chart */
    scale?: [number] | [number, number] | [number, number, number];
}
export declare class ChartCamera {
    /** Internally set id */
    _id: number;
    /** Represents how much an element should be offset in world space */
    offset: [number, number, number];
    /** Represents how scaled each axis should be in world space */
    scale: [number, number, number];
    constructor(options?: IChartCameraOptions);
    /** Keep id as readonly */
    readonly id: number;
    /**
     * Sets the location of the camera by adjusting the offsets to match.
     */
    position(location: [number, number, number]): void;
}
