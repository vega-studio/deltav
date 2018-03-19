import { ChartCamera } from './chart-camera';
export interface IReferenceCameraOptions {
    /** This is the base camera to monitor */
    base: ChartCamera;
    /**
     * This is a filter applied to the offset that comes from the chart camera.
     */
    offsetFilter?(offset: [number, number, number]): [number, number, number];
    /**
     * This is a filter applied to the scale that comes from the chart camera.
     */
    scaleFilter?(scale: [number, number, number]): [number, number, number];
}
/**
 * This is a camera that is based on another camera. This can apply filters
 * to the information provided from the base camera.
 *
 * Useful for situations such as a chart having a chart area and a list on the
 * left. This can use the same camera the chart area uses, but filter the response
 * to only track the y offset of the base camera.
 *
 * That would allow easy tracking of the left list to track with elements in the
 * chart and only manipulate a single camera instead of managing many cameras and
 * tie them together with lots of events.
 */
export declare class ReferenceCamera extends ChartCamera {
    private base;
    private offsetFilter;
    private scaleFilter;
    offset: any;
    scale: any;
    constructor(options: IReferenceCameraOptions);
}
