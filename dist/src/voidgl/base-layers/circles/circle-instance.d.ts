import { Circle } from "../../primitives/circle";
import { IInstanceOptions, Instance } from "../../util/instance";
export interface ICircleInstanceOptions extends IInstanceOptions, Circle {
    color?: [number, number, number, number];
    depth?: number;
}
export declare class CircleInstance extends Instance implements Circle {
    color: [number, number, number, number];
    radius: number;
    x: number;
    y: number;
    depth: number;
    constructor(options: ICircleInstanceOptions);
    readonly width: number;
    readonly height: number;
}
