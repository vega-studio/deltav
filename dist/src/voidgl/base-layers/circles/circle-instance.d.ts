import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Circle } from "../../primitives/circle";
export interface ICircleInstanceOptions extends IInstanceOptions, Circle {
    color?: [number, number, number, number];
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
