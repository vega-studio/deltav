import { IInstanceOptions, Instance, Vec2 } from "../../../../src/index.js";
export interface IVertexPackingCircleInstanceOptions extends IInstanceOptions {
    /** Center position of the circle */
    center: Vec2;
    /** The radius of the circle */
    radius: number;
    /** The color of this circle */
    color?: [number, number, number, number];
    color2?: [number, number, number, number];
    /** The z depth of the circle (for draw ordering) */
    depth?: number;
}
/**
 * A poorly optimized circle that causes vertex packing to happen in the buffer
 * management (there is more vertex information than available vertex attributes
 * thus causing multiple vertex atttributes to be packed into a single vertex.)
 */
export declare class VertexPackingCircleInstance extends Instance {
    /** The color of this circle */
    color: [number, number, number, number];
    color2: [number, number, number, number];
    /** The z depth of the circle (for draw ordering) */
    depth: number;
    /** The radius of the circle */
    radius: number;
    /** Center position of the circle */
    center: Vec2;
    constructor(options: IVertexPackingCircleInstanceOptions);
    get width(): number;
    get height(): number;
}
