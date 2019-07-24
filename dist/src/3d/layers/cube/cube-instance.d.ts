import { Color, Size } from "../../../types";
import { IInstance3DOptions, Instance3D } from "../base/instance-3d";
export interface ICubeOptions extends IInstance3DOptions {
    size?: Size;
    color?: Color;
}
export declare class CubeInstance extends Instance3D {
    size: Size;
    color: Color;
    constructor(options: ICubeOptions);
}
