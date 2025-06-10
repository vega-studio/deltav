import { Color, IInstance3DOptions, Instance3D, Vec4 } from "../../../../src";
export interface ISimpleMeshInstanceOptions extends IInstance3DOptions {
    color?: Vec4;
}
/**
 * Represents a simple mesh instance with custom vertices and normals
 */
export declare class SimpleMeshInstance extends Instance3D {
    color: Color;
    constructor(options: ISimpleMeshInstanceOptions);
}
