import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Vec2 } from "../../util";
export interface ICircleInstanceOptions extends IInstanceOptions {
    center: Vec2;
    radius: number;
    color?: [number, number, number, number];
    depth?: number;
}
export declare class CircleInstance extends Instance {
    color: [number, number, number, number];
    depth: number;
    radius: number;
    center: Vec2;
    constructor(options: ICircleInstanceOptions);
    readonly width: number;
    readonly height: number;
}
