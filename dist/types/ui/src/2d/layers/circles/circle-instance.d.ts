import { IInstanceOptions, Instance } from "../../../instance-provider/instance.js";
import { Vec2 } from "../../../math";
export interface ICircleInstanceOptions extends IInstanceOptions {
    /** Center position of the circle */
    center: Vec2;
    /** The radius of the circle */
    radius: number;
    /** The color of this circle */
    color?: [number, number, number, number];
    /** The z depth of the circle (for draw ordering) */
    depth?: number;
}
export declare class CircleInstance extends Instance {
    /** The color of this circle */
    color: [number, number, number, number];
    /** The z depth of the circle (for draw ordering) */
    depth: number;
    /** The radius of the circle */
    radius: number;
    /** Center position of the circle */
    center: Vec2;
    constructor(options: ICircleInstanceOptions);
    get width(): number;
    get height(): number;
}
