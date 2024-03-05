import { type Vec2 } from "../../../src/index.js";
import { LineSegments } from "./line-segment";
/**
 * Contains various line sweep tests for detecting intersections between
 * objects.
 */
export declare class LineSweep {
    /**
     * This generalizes the line sweep algorithm to the sweep execution which
     * finds a target and a queue of targets that are potential interaction
     * candidates. This algorithm provides a callback for these moments of
     * execution but does not do any fine tuned tests. Consider this to be the
     * Broadphase portion of the algorithm.
     *
     * Note that the provided targets are SEGMENTS of the lines provided which are
     * in the format: [Vec2, Vec2, LineSegments]. These elements are elements in
     * the line.segments property.
     */
    static lineSweep(segments: LineSegments[], bucketOptimization: number | undefined, test: (target: [Vec2, Vec2, LineSegments, boolean], queue: Set<[Vec2, Vec2, LineSegments, boolean]>) => void): void;
    /**
     * Performs a line sweep algorithm to compute ALL intersections for a list of
     * edges.
     *
     * There is a broadphase bucketization step in this algorithm to reduce the
     * need to brute force calculate all intersections. If there are few lines or
     * really small vertical space, this number can be reduced to improve
     * performance, or if a lot of vertical space, this can be increased to
     * improve performance.
     */
    static lineSweepIntersections(segments: LineSegments[], bucketOptimization?: number): [Vec2, LineSegments, number, LineSegments, number][];
    /**
     * Performs a line sweep algorithm to compute intersections ONLY against the
     * targets specified. This will only perform the intersection test when it
     * involves the target and all other intersections will be ignored.
     *
     * There is a broadphase bucketization step in this algorithm to reduce the
     * need to brute force calculate all intersections. If there are few lines or
     * really small vertical space, this number can be reduced to improve
     * performance, or if a lot of vertical space, this can be increased to
     * improve performance.
     */
    static lineSweepIntersectionWith(targets: Set<LineSegments>, segments: LineSegments[], bucketOptimization?: number): [Vec2, LineSegments, number, LineSegments, number][];
    /**
     * Performs a line sweep algorithm to compute which segments intersects with a
     * provided circle. This does NOT provide intersection metrics, it simply
     * provides a list of line segments that DID intersect with the circle.
     *
     * There is a broadphase bucketization step in this algorithm to reduce the
     * need to brute force calculate all intersections. If there are few lines or
     * really small vertical space, this number can be reduced to improve
     * performance, or if a lot of vertical space, this can be increased to
     * improve performance.
     */
    static lineSweepIntersectionWithCircle(circle: {
        r: number;
        center: Vec2;
    }, segments: LineSegments[], bucketOptimization?: number): [Vec2, Vec2, LineSegments, boolean][];
}
