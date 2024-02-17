import { Color, IInstance3DOptions, Instance3D, Size } from "../../../../src";
/** Customizes a new Cube instance */
export interface ICubeOptions extends IInstance3DOptions {
    /** Sets the dimensions of the cube */
    size?: Size;
    /** Sets the color of the cube */
    color?: Color;
    /** Sets the color of the cube */
    glow?: Color;
}
/**
 * Represents a cube model within 3D space.
 */
export declare class CubeInstance extends Instance3D {
    /** Sets the dimensions of the cube */
    size: Size;
    /** Sets the color of the cube */
    color: Color;
    /** Color of the front face [0, 0, -1] face */
    glow: Color;
    constructor(options: ICubeOptions);
}
