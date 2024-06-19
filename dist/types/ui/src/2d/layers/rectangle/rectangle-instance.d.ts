import { Anchor, ScaleMode } from "../../types";
import { IInstanceOptions, Instance } from "../../../instance-provider/instance";
import { Vec2, type Vec4 } from "../../../math/vector";
import type { Color } from "../../../types";
export interface IRectangleInstanceOptions extends IInstanceOptions {
    /**
     * The point on the rectangle which will be placed in world space via the x, y coords. This is also the point
     * which the rectangle will be scaled around.
     */
    anchor?: Anchor;
    /** Depth sorting of the rectangle (or the z value of the box) */
    depth?: number;
    /** Sets the way the rectangle scales with the world */
    scaling?: ScaleMode;
    /** The color the rectangle should render as */
    color?: [number, number, number, number];
    /** The coordinate where the rectangle will be anchored to in world space */
    position?: Vec2;
    /** The size of the rectangle as it is to be rendered in world space */
    size?: Vec2;
    /**
     * The thickness of the outline of the rectangle. This fits "within" the size
     * of the rectangle and does not add to it
     */
    outline?: number;
    /** The color of the outline of the rectangle when outline is non-zero */
    outlineColor?: Color;
}
/**
 * Renders a rectangle with some given properties that supports some scale
 * modes.
 *
 * Be warned, there are more properties in the rectangle than the GPU can handle
 * easily so animating too many properties can lose performance rapidly.
 */
export declare class RectangleInstance extends Instance {
    /** This is the rendered color of the rectangle */
    color: [number, number, number, number];
    /** Depth sorting of the rectangle (or the z value of the rectangle) */
    depth: number;
    /** When in BOUND_MAX mode, this allows the rectangle to scale up beyond it's
     * max size */
    maxScale: number;
    /** Scales the rectangle uniformly */
    scale: number;
    /** Sets the way the rectangle scales with the world */
    scaling: ScaleMode;
    /** The size of the rectangle as it is to be rendered in world space */
    size: Vec2;
    /** The coordinate where the rectangle will be anchored to in world space */
    position: Vec2;
    /** When true, wll render the rectangle as an outline */
    outline: number;
    /** When outline is > 0, this will be the color that it renders */
    outlineColor: Vec4;
    /** This is the anchor location on the  */
    private _anchor;
    constructor(options: IRectangleInstanceOptions);
    get anchor(): Anchor;
    /**
     * This applies a new anchor to this rectangle and properly determines it's anchor position on the rectangle
     */
    setAnchor(anchor: Anchor): void;
}
