import { EdgeInstance, EdgeType, Vec2, type Vec4 } from "../../../src";
import type { LineSweep } from "./line-sweep";
/**
 * As a utility class: Provides helper equations for line segments.
 *
 * As a class: Stores an edge and manages the breakup of the edge into easier to
 * process line segments for analysis. This helps with handling bezier
 * complexity uncluding splitting the curves and detecting interactions with the
 * curve based on CPU processes.
 */
export declare class LineSegments {
    /**
     * Tracks the mode of the line. This should always match the Layer edge type
     * the edge is added to.
     */
    type: EdgeType;
    /** The tracked edge graphic that this LineSegments represents */
    edge: EdgeInstance;
    /**
     * The t amount used to generate each line segment. Only is < 1 when there
     * are more than 1 segment to represent the edge
     */
    tDivision: number;
    /**
     * The segments that represents the edge. Each segment has a self reference
     * to keep it associated with the LineSegements it originated from. While this
     * costs a little more memory, it prevents the need to generate lookup maps
     * during processing which ends up being more costly anywho.
     */
    get segments(): readonly [Vec2, Vec2, LineSegments, boolean][];
    private _segments;
    /**
     * This is the approximated length of the edge. It computes the length of each
     * line segment to get the total length of the edge.
     */
    get length(): number;
    private _length;
    /**
     * Flag this as true when the segments should be updated to new values on next
     * segments retrieval.
     */
    needsUpdate: boolean;
    constructor(edge: EdgeInstance, type: EdgeType);
    /**
     * This computes new edges that represents the exact same edge split at
     * the specified t intervals along this edge.
     */
    split(tVals: number[]): LineSegments[];
    getRoughYBounds(): number[];
    getPoint(t: number): Vec2;
    /**
     * This takes a segment and returns the start and end t value of the segment.
     * This ONLY works if the segment used comes from the most recent update of
     * this line segment's segments.
     *
     * Returns null if the segment is not part of this line segment.
     */
    getSegmentT(segment: LineSegments["segments"][number]): Vec2 | null;
    /**
     * Call this to update the line segment representation of the edge. Curves
     * require several line segments to represent them for mathematical collisions
     * and intersections.
     */
    updateSegments(customCount?: number): void;
    /**
     * This calculates the SQUARED distance to a point from this line segment. If
     * you need the real distance take the square root of this value. This is done
     * for a performance reminder and consideration when writing applications with
     * this method.
     *
     * This also returns the t value calculated while determining the distance.
     */
    static distanceToPointSq(segment: [Vec2, Vec2, ...any], p: Vec2): Vec2;
    static yCheck(y1: number, y2: number, y3: number, y4: number): boolean;
    /**
     * Computes segment to segment intersections. Provides the point + the t value
     * along the segment.
     */
    static intersect(s1: [Vec2, Vec2, ...any], s2: [Vec2, Vec2, ...any]): Vec4 | null;
    /**
     * Calculates if a circle intersects the specified segment.
     */
    static intersectsCircle(p0: Vec2, p1: Vec2, circle: {
        r: number;
        center: Vec2;
    }): boolean;
    /**
     * This makes working with a list of intersections easier to work with by
     * contextualizing the intersection target.
     */
    static filterIntersections(check: LineSegments, intersections: ReturnType<typeof LineSweep.lineSweepIntersections>): {
        target: LineSegments;
        target_t: number;
        self_t: number;
        intersection: Vec2;
    }[];
}
