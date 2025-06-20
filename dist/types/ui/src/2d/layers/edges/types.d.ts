export declare enum EdgeScaleType {
    /** All dimensions are within world space */
    NONE = 0,
    /**
     * The control points are a delta from the end points within screen space, and the line thickness is within
     * screen space as well all measured in pixels. The scaleFactor scales both thickness and control delta values.
     * The endpoints remain in world space
     */
    SCREEN_CURVE = 1
}
export declare enum EdgeType {
    /** Makes a straight edge with no curve */
    LINE = 0,
    /** Makes a single control point Bezier curve */
    BEZIER = 1,
    /** Makes a two control point bezier curve */
    BEZIER2 = 2,
    /** Makes a thin line with no thickness. High performance */
    LINE_THIN = 3,
    /** Makes a bezier curve with no thickness. High performance */
    BEZIER_THIN = 4,
    /** Makes a two control point bezier curve with no thickness. High performance */
    BEZIER2_THIN = 5
}
/**
 * This is the broadphase control for edges to help handle quad tree adjustments for picking. If the edge scale type
 * is NONE, you don't need to utilize this. If you use screen space and have camera distortions along an axis, this
 * can help greatly.
 */
export declare enum EdgeBroadphase {
    /** Use this if the broad phase detection should use both width and height of the edge's bounds */
    ALL = 0,
    /** Use this to ensure a test against the edge is performed if the mouse aligns with it on the x-axis */
    PASS_Y = 1,
    /** Use this to ensure a test against the edge is performed if the mouse aligns with it on the y axis */
    PASS_X = 2
}
