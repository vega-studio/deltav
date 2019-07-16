import { Camera2D } from "./camera-2d";
import { Control2D } from "./control-2d";
export interface IReferenceControl2DOptions {
    base: Control2D;
    offsetFilter?(offset: [number, number, number]): [number, number, number];
    scaleFilter?(scale: [number, number, number]): [number, number, number];
}
export interface IReferenceCamera2DOptions {
    base: Camera2D;
    offsetFilter?(offset: [number, number, number]): [number, number, number];
    scaleFilter?(scale: [number, number, number]): [number, number, number];
}
export declare class ReferenceCamera2D extends Camera2D {
    private base;
    private _control2D;
    control2D: Control2D;
    constructor(options: IReferenceCamera2DOptions);
}
