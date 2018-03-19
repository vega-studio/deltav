import { IPoint } from './point';
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
export declare class Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
    readonly area: number;
    readonly bottom: number;
    readonly left: number;
    readonly mid: {
        x: number;
        y: number;
    };
    readonly right: number;
    readonly top: number;
    static emptyBounds(): Bounds;
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
    containsPoint(point: IPoint): boolean;
    /**
     * Grows this bounds object to cover the space of the provided bounds object
     *
     * @param bounds
     */
    encapsulate(bounds: Bounds): boolean;
    /**
     * Checks to see if the provided bounds object could fit within the dimensions of this bounds object
     * This ignores position and just checks width and height.
     *
     * @param bounds
     *
     * @return {number} 0 if it doesn't fit. 1 if it fits perfectly. 2 if it just fits.
     */
    fits(bounds: Bounds): 0 | 1 | 2;
    /**
     * Checks if a bounds object intersects another bounds object.
     *
     * @param bounds
     */
    hitBounds(bounds: Bounds): boolean;
    /**
     * Sees if the provided bounds is completely within this bounds object. Unlike fits() this takes
     * position into account.
     *
     * @param bounds
     */
    isInside(bounds: Bounds): boolean;
    /**
     * Easy readout of this Bounds object.
     */
    toString(): string;
}
