import { IInstanceOptions, Instance } from "../../../instance-provider/instance";
import { Vec2 } from "../../../math";
export interface IRingInstanceOptions extends IInstanceOptions {
    /** The center of the ring */
    center?: Vec2;
    /** The color of this ring */
    color?: [number, number, number, number];
    /** The z depth of the ring (for draw ordering) */
    depth?: number;
    /** The outer radius of the ring */
    radius?: number;
    /** The thickness of the ring */
    thickness?: number;
}
export declare class RingInstance extends Instance {
    color: [number, number, number, number];
    depth: number;
    radius: number;
    thickness: number;
    center: Vec2;
    constructor(options: IRingInstanceOptions);
    readonly width: number;
    readonly height: number;
    readonly innerRadius: number;
}
