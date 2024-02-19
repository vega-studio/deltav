import { Anchor, ScaleMode } from "../../types";
import { IInstanceOptions, Instance } from "../../../instance-provider/instance";
import { Vec2 } from "../../../math/vector";
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
}
/**
 * This generates a new rectangle instance which will render a single line of text for a given layer.
 * There are restrictions surrounding rectangles due to texture sizes and rendering limitations.
 *
 * Currently, we only support rendering a rectangle via canvas, then rendering it to an Atlas texture
 * which is used to render to cards in the world for rendering. This is highly performant, but means:
 *
 * - Rectangles should only be so long.
 * - Multiline is not supported inherently
 * - Once a rectangle is constructed, only SOME properties can be altered thereafter
 *
 * A rectangle that is constructed can only have some properties set upon creating the rectangle and are locked
 * thereafter. The only way to modify them would be to destroy the rectangle, then construct a new rectangle
 * with the modifications. This has to deal with performance regarding rasterizing the rectangle
 */
export declare class RectangleInstance extends Instance {
    /** This is the rendered color of the rectangle */
    color: [number, number, number, number];
    /** Depth sorting of the rectangle (or the z value of the rectangle) */
    depth: number;
    /** When in BOUND_MAX mode, this allows the rectangle to scale up beyond it's max size */
    maxScale: number;
    /** Scales the rectangle uniformly */
    scale: number;
    /** Sets the way the rectangle scales with the world */
    scaling: ScaleMode;
    /** The size of the rectangle as it is to be rendered in world space */
    size: Vec2;
    /** The coordinate where the rectangle will be anchored to in world space */
    position: Vec2;
    /** This is the anchor location on the  */
    private _anchor;
    constructor(options: IRectangleInstanceOptions);
    get anchor(): Anchor;
    /**
     * This applies a new anchor to this rectangle and properly determines it's anchor position on the rectangle
     */
    setAnchor(anchor: Anchor): void;
}
