import { IInstanceOptions, Instance } from '../../util/instance';
export interface IEdgeInstanceOptions extends IInstanceOptions {
    /** The color of this edge at the start point. */
    colorStart?: [number, number, number, number];
    /** The color of this edge at the end point. */
    colorEnd?: [number, number, number, number];
    /** This is the list of control points  */
    control?: [number, number][];
    /** The z depth of the edge (for draw ordering) */
    depth?: number;
    /** End point of the edge. */
    end: [number, number];
    /** Beginning point of the edge. */
    start: [number, number];
    /** Start width of the edge. */
    widthStart?: number;
    /** End width of the edge */
    widthEnd?: number;
}
export declare type EdgeColor = [number, number, number, number];
export declare class EdgeInstance extends Instance {
    colorStart: EdgeColor;
    colorEnd: EdgeColor;
    control: [number, number][];
    depth: number;
    end: [number, number];
    start: [number, number];
    widthStart: number;
    widthEnd: number;
    readonly length: number;
    /**
     * Calculates a perpendicular direction vector to the edge
     */
    readonly perpendicular: number;
    /**
     * Calculates the midpoint of the edge
     */
    readonly midpoint: number;
    /**
     * Applies the edge width to the start and end
     */
    setEdgeWidth(width: number): void;
    /**
     * Applies the color to the start and end
     */
    setColor(color: EdgeColor): void;
    constructor(options: IEdgeInstanceOptions);
}
