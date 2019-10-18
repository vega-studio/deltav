import { Camera } from "../../util/camera";
import { Control2D, IControl2DOptions } from "./control-2d";
export declare class Camera2D extends Camera {
    control2D: Control2D;
    readonly scale2D: [number, number, number];
    readonly offset: [number, number, number];
    constructor(options?: IControl2DOptions);
}
