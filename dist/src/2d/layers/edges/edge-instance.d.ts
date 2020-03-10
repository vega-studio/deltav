import { IInstanceOptions, Instance } from "../../../instance-provider/instance";
import { Vec2, Vec4 } from "../../../math";
export interface IEdgeInstanceOptions extends IInstanceOptions {
    /** This is the list of control points  */
    control?: Vec2[];
    /** The z depth of the edge (for draw ordering) */
    depth?: number;
    /** End point of the edge. */
    end: Vec2;
    /** End color of the edge */
    endColor?: Vec4;
    /** Beginning point of the edge. */
    start: Vec2;
    /** Start color of the edge */
    startColor?: Vec4;
    /** Start width of the edge. */
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
    /**
     * Calculates length from beginning point to end point
     */
    get length(): number;
    /**
     * Calculates the midpoint of the edge
     */
    get midpoint(): number;
    /**
     * Calculates a perpendicular direction vector to the edge
     */
    get perpendicular(): Vec2;
    /**
     * Applies the edge width to the start and end
     */
    setEdgeThickness(thickness: number): void;
    /**
     * Applies the color to the start and end
     */
    setColor(color: Vec4): void;
    constructor(options: IEdgeInstanceOptions);
}
