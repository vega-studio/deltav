import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Vec2 } from "../../util";
export interface IRingInstanceOptions extends IInstanceOptions {
    center?: Vec2;
    color?: [number, number, number, number];
    depth?: number;
    radius?: number;
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
