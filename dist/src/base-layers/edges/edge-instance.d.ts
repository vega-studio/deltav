import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Vec2, Vec4 } from "../../util";
export interface IEdgeInstanceOptions extends IInstanceOptions {
    control?: Vec2[];
    depth?: number;
    end: Vec2;
    endColor?: Vec4;
    start: Vec2;
    startColor?: Vec4;
    thickness?: Vec2;
}
export declare class EdgeInstance extends Instance {
    control: Vec2[];
    depth: number;
    end: Vec2;
    endColor: Vec4;
    start: Vec2;
    startColor: Vec4;
    thickness: Vec2;
    readonly length: number;
    readonly midpoint: number;
    readonly perpendicular: Vec2;
    setEdgeThickness(thickness: number): void;
    setColor(color: Vec4): void;
    constructor(options: IEdgeInstanceOptions);
}
