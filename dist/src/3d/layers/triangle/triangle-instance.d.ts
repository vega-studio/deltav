import { Color } from "../../../types";
import { IInstance3DOptions, Instance3D } from "../base/instance-3d";
export interface ITriangleOptions extends IInstance3DOptions {
    color?: Color;
    size?: number;
}
export declare class TriangleInstance extends Instance3D {
    color: Color;
    size: number;
    constructor(options: ITriangleOptions);
}
