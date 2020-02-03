import { IInstanceOptions, Instance } from "../../../instance-provider/instance";
import { Vec2, Vec4 } from "../../../math";
export interface IArcInstanceOptions extends IInstanceOptions {
    /** The start and end angle of the arc */
    angle: Vec2;
    /** The center point where the arc wraps around */
    center: Vec2;
    /** This is the end color of the arc */
    colorEnd?: Vec4;
    /** This is the start color of the arc */
    colorStart?: Vec4;
    /** Depth sorting of the arc (or the z value of the arc) */
    depth?: number;
    /** The radius of how far the middle of the arc is from the center point */
    radius: number;
    /** The start to end thickness of the arc */
    thickness?: Vec2;
}
/**
 * This generates a new arc instance. An arc is a shape with a center and an angle that
 * is spans. This effectively can be used for a 'pie slice' or just the edge line on the pie
 * slice.
 */
export declare class ArcInstance extends Instance {
    /** The start and end angle of the arc */
    angle: Vec2;
    /** This is the end color of the arc */
    colorEnd: Vec4;
    /** This is the start color of the arc */
    colorStart: Vec4;
    /** The center point where the arc wraps around */
    center: Vec2;
    /** Depth sorting of the arc (or the z value of the arc) */
    depth: number;
    /** An offset to apply to the angle. This makes it easy to animate the arc or set a point of reference for angle 0 */
    angleOffset: number;
    /** The radius of how far the middle of the arc is from the center point */
    radius: number;
    /** The start to end thickness of the arc */
    thickness: Vec2;
    constructor(options: IArcInstanceOptions);
}
