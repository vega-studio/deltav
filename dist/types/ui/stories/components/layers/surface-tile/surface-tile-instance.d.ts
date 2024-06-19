import { Color, IInstanceOptions, Instance, Vec3, Vec4 } from "../../../../src";
export interface ISurfaceTileInstance extends IInstanceOptions {
    corners: [Vec3, Vec3, Vec3, Vec3];
    color?: Vec4;
}
/**
 * Makes a surface piece that fits 4 points in 3D space
 */
export declare class SurfaceTileInstance extends Instance {
    c1: Vec3;
    c2: Vec3;
    c3: Vec3;
    c4: Vec3;
    color: Color;
    constructor(options: ISurfaceTileInstance);
}
