import { Circle } from "../../primitives";
import { IInstanceOptions, Instance } from "../../util";
export interface IRingInstanceOptions extends IInstanceOptions, Circle {
    color?: [number, number, number, number];
    depth?: number;
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
