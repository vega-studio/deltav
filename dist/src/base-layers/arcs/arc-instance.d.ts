import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Vec2, Vec4 } from "../../util";
export interface IArcInstanceOptions extends IInstanceOptions {
    angle: Vec2;
    center: Vec2;
    colorEnd: Vec4;
    colorStart: Vec4;
    depth: number;
    radius: number;
    thickness: Vec2;
}
export declare class ArcInstance extends Instance {
    angle: Vec2;
    colorEnd: Vec4;
    colorStart: Vec4;
    center: Vec2;
    depth: number;
    radius: number;
    thickness: Vec2;
    constructor(options: IArcInstanceOptions);
}
