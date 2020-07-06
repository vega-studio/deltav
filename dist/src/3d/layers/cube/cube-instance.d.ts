import { Color, Size } from "../../../types";
import { IInstance3DOptions, Instance3D } from "../../scene-graph/instance-3d";
/** Customizes a new Cube instance */
export interface ICubeOptions extends IInstance3DOptions {
    /** Sets the dimensions of the cube */
    size?: Size;
    /** Sets the color of the cube */
    color?: Color;
}
/**
 * Represents a cube model within 3D space.
 */
export declare class CubeInstance extends Instance3D {
    /** Dimensions of the cube */
    size: Size;
    /** Color of the cube */
    color: Color;
    constructor(options: ICubeOptions);
}
