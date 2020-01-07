import { Camera2D } from "./camera-2d";
import { Control2D } from "./control-2d";
export interface IReferenceControl2DOptions {
    /** This is the base camera to monitor */
    base: Control2D;
    /**
     * This is a filter applied to the offset that comes from the chart camera.
     */
    offsetFilter?(offset: [number, number, number]): [number, number, number];
    /**
     * This is a filter applied to the scale that comes from the chart camera.
     */
    scaleFilter?(scale: [number, number, number]): [number, number, number];
}
export interface IReferenceCamera2DOptions {
    /** This is the base camera to monitor */
    base: Camera2D;
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
export declare class ReferenceCamera2D extends Camera2D {
    private base;
    private _control2D;
    control2D: Control2D;
    constructor(options: IReferenceCamera2DOptions);
}
