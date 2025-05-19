import { Vec2 } from "../vector.js";
export interface IBoundsOptions {
    /** Top left x position */
    x?: number;
    /** Top left y position */
    y?: number;
    /** Width covered */
    width?: number;
    /** height covered */
    height?: number;
    /** Specify the left */
    left?: number;
    /** Specify the right */
    right?: number;
    /** Specify the top */
    top?: number;
    /** Specify the bottom */
    bottom?: number;
}
/**
 * Class to manage the x, y, width, and height of an object
 *
 * @template T This specifies the data type associated with this shape and is accessible
 *             via the property 'd'
 */
export declare class Bounds<T> {
    x: number;
    y: number;
    width: number;
    height: number;
    d?: T;
    get area(): number;
    get bottom(): number;
    get left(): number;
    get mid(): Vec2;
    get right(): number;
    get top(): number;
    static emptyBounds<T>(): Bounds<T>;
    /**
     * Create a new instance
     *
     * @param left  The left side (x coordinate) of the instance
     * @param right The right side of the instance
     * @param top The top (y coordinate) of the instance
     * @param bottom The bottom of the instance
     */
    constructor(options: IBoundsOptions);
    /**
     * Checks to see if a point is within this bounds object.
     *
     * @param point
     */
    containsPoint(point: Vec2): boolean;
    /**
     * Grows this bounds object to cover the space of the provided bounds object
     *
     * @param item
     */
    encapsulate(item: Bounds<any> | Vec2): boolean;
    /**
     * Grows the bounds (if needed) to encompass all bounds or points provided. This
     * performs much better than running encapsulate one by one.
     */
    encapsulateAll(all: Bounds<any>[] | Vec2[]): void;
    /**
     * Checks to see if the provided bounds object could fit within the dimensions of this bounds object
     * This ignores position and just checks width and height.
     *
     * @param bounds
     *
     * @return {number} 0 if it doesn't fit. 1 if it fits perfectly. 2 if it just fits.
     */
    fits(bounds: Bounds<T>): 0 | 1 | 2;
    /**
     * Checks if a bounds object intersects another bounds object.
     *
     * @param bounds
     */
    hitBounds(bounds: Bounds<any>): boolean;
    /**
     * Sees if the provided bounds is completely within this bounds object. Unlike fits() this takes
     * position into account.
     *
     * @param bounds
     */
    isInside(bounds: Bounds<any>): boolean;
    /**
     * Top left position of the bounds
     */
    get location(): Vec2;
    /**
     * Easy readout of this Bounds object.
     */
    toString(): string;
}
