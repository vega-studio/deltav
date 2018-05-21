import { Circle } from '../../primitives/circle';
import { IInstanceOptions, Instance } from '../../util/instance';
export interface ICircleInstanceOptions extends IInstanceOptions, Circle {
    /** The color of this circle */
    color?: [number, number, number, number];
    /** The z depth of the circle (for draw ordering) */
    depth?: number;
}
export declare class CircleInstance extends Instance implements Circle {
    color: [number, number, number, number];
    depth: number;
    radius: number;
    x: number;
    y: number;
    constructor(options: ICircleInstanceOptions);
    readonly width: number;
    readonly height: number;
}
