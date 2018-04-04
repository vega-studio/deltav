import { Circle } from '../../primitives';
import { IInstanceOptions, Instance } from '../../util';
export interface IRingInstanceOptions extends IInstanceOptions, Circle {
    /** The color of this ring */
    color?: [number, number, number, number];
    /** The z depth of the ring (for draw ordering) */
    depth?: number;
    /** The thickness of the ring */
    thickness?: number;
}
export declare class RingInstance extends Instance implements Circle {
    color: [number, number, number, number];
    depth: number;
    radius: number;
    thickness: number;
    x: number;
    y: number;
    constructor(options: IRingInstanceOptions);
    readonly width: number;
    readonly height: number;
    readonly innerRadius: number;
}
