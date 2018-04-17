import { Bounds } from './bounds';
import { IPoint } from './point';
/**
 * Represents a line with a given slope
 */
export declare class Line<T> extends Bounds<T> {
    p1: IPoint;
    p2: IPoint;
    slope: number;
    magnitude: number;
    /** Stores a normalized vector that is perpendicular to this line */
    perpendicular: IPoint;
    /**
     * Creates a new line that passes through the two specified points
     *
     * @param {IPoint} p1 The start point
     * @param {IPoint} p2 The end point
     */
    constructor(p1: IPoint, p2: IPoint);
    /**
     * This calculates the distance to a point from the provided line
     * BUT this ALSO retains the directionality of that distance. So one side of
     * the line will be positive while the other negative
     *
     * @param {IPoint} p The Point to see how far from the line we are
     *
     * @return {number} The calculated distance to the provided point
     */
    directionTo(p: IPoint): number;
    /**
     * This calculates the distance to a point from the provided line
     *
     * @param {IPoint} p The Point to see how far from the line we are
     *
     * @return {number} The calculated distance to the provided point
     */
    distanceTo(p: IPoint): number;
    /**
     * Picks the closest line in the list to a given point
     *
     * @param {Array} lines The lines to compare
     * @param {IPoint} p The point to compare against
     *
     * @return {Line} The nearest line to the point
     */
    static getClosest(lines: Line<any>[], p: IPoint): Line<any>;
    /**
     * This sets the two endpoints for this line and recalculates the bounds
     * of the line accordingly
     *
     * @param {IPoint} p1 The start point
     * @param {IPoint} p2 The end point
     */
    setPoints(p1: IPoint, p2: IPoint): void;
}
