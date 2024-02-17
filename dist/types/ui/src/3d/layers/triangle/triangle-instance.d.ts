import { Color } from "../../../types";
import { IInstance3DOptions, Instance3D } from "../../scene-graph/instance-3d";
/** Customizes a new Triangle instance */
export interface ITriangleOptions extends IInstance3DOptions {
    /** Sets the color of the Triangle */
    color?: Color;
    /** Sizes the triangle */
    size?: number;
}
/**
 * Represents a Triangle model within 3D space.
 */
export declare class TriangleInstance extends Instance3D {
    /** Sets the color of the Triangle */
    color: Color;
    /** Sizes the triangle */
    size: number;
    constructor(options: ITriangleOptions);
}
