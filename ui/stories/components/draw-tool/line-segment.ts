import {
  add2,
  copy2,
  EdgeInstance,
  EdgeType,
  scale2,
  subtract2,
  Vec2,
  type Vec3,
} from "../../../src";

// These are temp vector storage registers for storing results for multiple
// vector steps. Using these as out values greatly reduces allocations.
const REGISTER1: Vec2 = [0, 0];
const REGISTER2: Vec2 = [0, 0];
const REGISTER3: Vec2 = [0, 0];
const REGISTER4: Vec2 = [0, 0];
const REGISTER5: Vec2 = [0, 0];
const REGISTER6: Vec2 = [0, 0];

/**
 * This takes our intersections a step further and computes the actual
 * intersection information relative to the LineSegments/Edge. The
 * intersection computation in the other method is merely for a single two
 * point line segment, this is for an edge decomposed into multiple segments.
 */
function computeFinalIntersection(
  seg1: [Vec2, Vec2, LineSegments],
  seg2: [Vec2, Vec2, LineSegments]
): [Vec2, LineSegments, number, LineSegments, number] | null {
  const intersection = LineSegments.intersect(seg1, seg2);

  // If we intersect, we need to add it to the intersection list AND
  // calculate the true t value of the intersection relative to the
  // edges that collided. The intersection t value is merely the
  // intersection for the segment and NOT the edge as a whole.
  if (intersection) {
    const { 0: x, 1: y, 2: ut } = intersection;
    const edge1 = seg1[2];
    const edge2 = seg2[2];

    // Find the segments index in each edge
    const index1 = edge1.segments.findIndex((s) => s === seg1);
    const index2 = edge2.segments.findIndex((s) => s === seg2);

    // Use the segment dvision amounts to get the t value that should
    // be associate
    const tEdge1 = index1 * edge1.tDivision + ut;
    const tEdge2 = index2 * edge2.tDivision + ut;

    // Compute the t value along checkEject line
    return [[x, y], edge1, tEdge1, edge2, tEdge2];
  }

  // No intersection
  return null;
}

/**
 * As a utility class: Provides helper equations for line segments.
 *
 * As a class: Stores an edge and manages the breakup of the edge into easier to
 * process line segments for analysis. This helps with handling bezier
 * complexity uncluding splitting the curves and detecting interactions with the
 * curve based on CPU processes.
 */
export class LineSegments {
  type: EdgeType;
  edge: EdgeInstance;
  /**
   * The t amount used to generate each line segment. Only is < 1 when there
   * are more than 1 segment to represent the edge
   */
  tDivision = 1;
  /**
   * The segments that represents the edge. Each segment has a self reference
   * to keep it associated with the LineSegements it originated from. While this
   * costs a little more memory, it prevents the need to generate lookup maps
   * during processing which ends up being more costly anywho.
   */
  private _segments: [Vec2, Vec2, LineSegments][] = [];
  /**
   * Flag this as true when the segments should be updated to new values on next
   * segments retrieval.
   */
  needsUpdate = true;

  get segments(): readonly [Vec2, Vec2, LineSegments][] {
    if (this.needsUpdate) this.updateSegments();
    return this._segments;
  }

  constructor(edge: EdgeInstance, type: EdgeType) {
    this.edge = edge;
    this.type = type;
  }

  /**
   * This computes two new edges that represents the exact same edge split at
   * the specified t interval along this edge.
   */
  splitEdge(t: number): [EdgeInstance, EdgeInstance] {
    // From ChatGPT Splitting a Bézier curve at a parameter \(t\) along its
    // path results in two new Bézier curves that, when combined, match the
    // original curve exactly. The process of splitting a Bézier curve
    // (whether quadratic or cubic) involves computing new control points
    // for the two resulting curves. The method described here focuses on a
    // cubic Bézier curve, but a similar principle applies to quadratic
    // curves with one less control point. Given a cubic Bézier curve
    // defined by four points: the initial point \(P_0\), two control points
    // \(P_1\) and \(P_2\), and the final point \(P_3\), and a parameter
    // \(t\) between 0 and 1, you can use the de Casteljau's algorithm to
    // find the new control points. Here’s how you compute the new control
    // points:
    //
    // 1. Interpolate between each pair of adjacent control points to find
    //    points at \(t\):
    //    - \(P_{01} = (1-t)P_0 + tP_1\)
    //    - \(P_{12} = (1-t)P_1 + tP_2\)
    //    - \(P_{23} = (1-t)P_2 + tP_3\)
    // 2. Repeat the interpolation on the points found in step 1 to find new
    //    points:
    //    - \(P_{012} = (1-t)P_{01} + tP_{12}\)
    //    - \(P_{123} = (1-t)P_{12} + tP_{23}\)
    // 3. Finally, interpolate between the points found in step 2 to find
    //    the splitting point on the curve:
    //    - \(P_{0123} = (1-t)P_{012} + tP_{123}\)
    //
    // Now, you have two new cubic Bézier curves defined by the following
    // control points:
    //
    // - First curve: \(P_0\), \(P_{01}\), \(P_{012}\), \(P_{0123}\)
    // - Second curve: \(P_{0123}\), \(P_{123}\), \(P_{23}\), \(P_3\)
    //
    // These steps effectively split the original cubic Bézier curve into
    // two curves that exactly follow the original curve's path.
    //
    // The new control points \(P_{01}\), \(P_{012}\), \(P_{0123}\),
    // \(P_{123}\), and \(P_{23}\) ensure that the two segments of the curve
    // smoothly connect at \(P_{0123}\) and retain the original curve's
    // shape.

    // Thickness split is the same for all curves as it's linear
    const dT = this.edge.thickness[1] - this.edge.thickness[0];
    const tThickness = this.edge.thickness[0] + dT * t;

    switch (this.type) {
      case EdgeType.LINE: {
        const splitPoint = add2(
          this.edge.start,
          scale2(subtract2(this.edge.end, this.edge.start, REGISTER1), t)
        );

        return [
          new EdgeInstance({
            startColor: this.edge.startColor,
            endColor: this.edge.endColor,
            thickness: [this.edge.thickness[0], tThickness],
            start: copy2(this.edge.start),
            end: splitPoint,
          }),
          new EdgeInstance({
            startColor: this.edge.startColor,
            endColor: this.edge.endColor,
            thickness: [tThickness, this.edge.thickness[1]],
            start: copy2(splitPoint),
            end: copy2(this.edge.end),
          }),
        ];
      }

      case EdgeType.BEZIER: {
        const P0 = this.edge.start;
        const P1 = this.edge.control[0];
        const P2 = this.edge.end;
        const t_1 = 1 - t;
        const P01 = add2(scale2(P0, t_1, REGISTER1), scale2(P1, t, REGISTER2));
        const P12 = add2(scale2(P1, t_1, REGISTER1), scale2(P2, t, REGISTER2));
        const P012 = add2(
          scale2(P01, t_1, REGISTER1),
          scale2(P12, t, REGISTER2)
        );

        return [
          new EdgeInstance({
            startColor: this.edge.startColor,
            endColor: this.edge.endColor,
            thickness: [this.edge.thickness[0], tThickness],
            start: P0,
            end: P012,
            control: [P01],
          }),
          new EdgeInstance({
            startColor: this.edge.startColor,
            endColor: this.edge.endColor,
            thickness: [tThickness, this.edge.thickness[1]],
            start: P012,
            end: P2,
            control: [P12],
          }),
        ];
      }

      case EdgeType.BEZIER2: {
        const P0 = this.edge.start;
        const P3 = this.edge.end;
        const P1 = this.edge.control[0];
        const P2 = this.edge.control[1];
        const t_1 = 1 - t;
        const P01 = add2(scale2(P0, t_1, REGISTER1), scale2(P1, t, REGISTER2));
        const P12 = add2(scale2(P1, t_1, REGISTER1), scale2(P2, t, REGISTER2));
        const P23 = add2(scale2(P2, t_1, REGISTER1), scale2(P3, t, REGISTER2));
        const P012 = add2(
          scale2(P01, t_1, REGISTER1),
          scale2(P12, t, REGISTER2)
        );
        const P123 = add2(
          scale2(P12, t_1, REGISTER1),
          scale2(P23, t, REGISTER2)
        );
        const P0123 = add2(
          scale2(P012, t_1, REGISTER1),
          scale2(P123, t, REGISTER2)
        );

        return [
          new EdgeInstance({
            startColor: this.edge.startColor,
            endColor: this.edge.endColor,
            thickness: [this.edge.thickness[0], tThickness],
            start: P0,
            end: P01,
            control: [P012, P0123],
          }),
          new EdgeInstance({
            startColor: this.edge.startColor,
            endColor: this.edge.endColor,
            thickness: [tThickness, this.edge.thickness[1]],
            start: P0123,
            end: P3,
            control: [P123, P23],
          }),
        ];
      }
    }
  }

  getPoint(t: number) {
    switch (this.type) {
      case EdgeType.LINE: {
        return add2(
          this.edge.start,
          scale2(
            subtract2(this.edge.end, this.edge.start, REGISTER1),
            t,
            REGISTER2
          )
        );
      }

      /**
       * vec2 interpolation(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2) {
       *   return (1.0 - t) * (1.0 - t) * p1 + 2.0 * t * (1.0 - t) * c1 + t * t * p2;
       * }
       */
      case EdgeType.BEZIER: {
        const t_1 = 1 - t;
        return add2(
          add2(
            scale2(this.edge.start, t_1, REGISTER1),
            scale2(this.edge.control[0], 2 * t * t_1, REGISTER2),
            REGISTER3
          ),
          scale2(this.edge.end, t * t, REGISTER4)
        );
      }

      /**
       * vec2 interpolation(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2) {
       *   float t1 = 1.0 - t;
       *   return pow(t1, 3.0) * p1 + 3.0 * t * pow(t1, 2.0) * c1 + 3.0 * pow(t, 2.0) * t1 * c2 + pow(t, 3.0) * p2;
       * }
       */
      case EdgeType.BEZIER2: {
        const t_1 = 1 - t;
        return add2(
          add2(
            scale2(this.edge.start, t_1 * t_1 * t_1, REGISTER1),
            add2(
              scale2(this.edge.control[0], 3 * t * t_1 * t_1, REGISTER2),
              scale2(this.edge.control[1], 3 * t * t * t_1, REGISTER3),
              REGISTER4
            ),
            REGISTER5
          ),
          scale2(this.edge.end, t * t * t, REGISTER6)
        );
      }
    }
  }

  /**
   * Call this to update the line segment representation of the edge. Curves
   * require several line segments to represent them for mathematical collisions
   * and intersections.
   */
  updateSegments(customCount?: number) {
    switch (this.type) {
      case EdgeType.LINE:
        this.tDivision = 1;
        this._segments = [[this.edge.start, this.edge.end, this]];
        break;

      case EdgeType.BEZIER: {
        // TODO:
        // We can compute a reasonable amount of segments based on the ration
        // of:
        //
        // distance between the end points / distance from the straight line
        // edge to the control point
        //
        // The idea is if the control point is further away than the end points
        // are from each other, the curve gets sharp which requires additional
        // segments to appear smoothe, but when the control is the same distance
        // or less the curve becomes gentler and more linear requiring less
        // details to render.
        //
        /** We want some additional segments for this curve */
        const count = customCount || 25;
        this.tDivision = 1 / count;
        let previous = this.getPoint(0);
        this._segments = [];

        for (let i = 1; i < count; ++i) {
          const t = i * this.tDivision;
          const p = this.getPoint(t);
          // Segments always travel from left to right to aid in sweep
          // calculations
          if (p[0] > previous[0]) this._segments.push([previous, p, this]);
          else this._segments.push([p, previous, this]);
          previous = p;
        }
        break;
      }

      case EdgeType.BEZIER2: {
        // TODO:
        // We can compute a reasonable amount of segments based on the ration
        // of:
        //
        // distance between the end points / distance from the straight line
        // edge to the control point
        //
        // The idea is if the control point is further away than the end points
        // are from each other, the curve gets sharp which requires additional
        // segments to appear smoothe, but when the control is the same distance
        // or less the curve becomes gentler and more linear requiring less
        // details to render.
        //
        /** We want more segments for this more complex curve */
        const count = customCount || 40;
        this.tDivision = 1 / count;
        let previous = this.getPoint(0);
        this._segments = [];

        for (let i = 1; i < count; ++i) {
          const t = i * this.tDivision;
          const p = this.getPoint(t);
          // Segments always travel from left to right to aid in sweep
          // calculations
          if (p[0] > previous[0]) this._segments.push([previous, p, this]);
          else this._segments.push([p, previous, this]);
          previous = p;
        }
        break;
      }
    }
  }

  /**
   * This calculates the SQUARED distance to a point from this line segment. If
   * you need the real distance take the square root of this value. This is done
   * for a performance reminder and consideration when writing applications with
   * this method.
   */
  static distanceToPointSq(segment: [Vec2, Vec2], p: Vec2) {
    const { 0: px, 1: py } = p;
    const { 0: x1, 1: y1 } = segment[0];
    const { 0: x2, 1: y2 } = segment[1];

    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    // In case of 0 length line
    if (len_sq != 0) {
      param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return dx * dx + dy * dy;
  }

  /**
   * Computes segment to segment intersections. Provides the point + the t value
   * along the segment.
   */
  static intersect(
    s1: [Vec2, Vec2, ...any],
    s2: [Vec2, Vec2, ...any]
  ): Vec3 | null {
    const { 0: x1, 1: y1 } = s1[0];
    const { 0: x2, 1: y2 } = s1[1];
    const { 0: x3, 1: y3 } = s2[0];
    const { 0: x4, 1: y4 } = s2[1];
    const a = x2 - x1;
    const b = y2 - y1;
    const c = x4 - x3;
    const d = y4 - y3;
    const denom = d * a - c * b;
    if (denom === 0) return null;
    const ua = (c * (y1 - y3) - d * (x1 - x3)) / denom;
    const ub = (a * (y1 - y3) - b * (x1 - x3)) / denom;
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
    const x = x1 + ua * a;
    const y = y1 + ua * b;

    return [x, y, ua];
  }

  /**
   * Performs a line sweep algorithm to compute ALL intersections for a list of
   * edges.
   */
  static lineSweepIntersections(segments: LineSegments[]) {
    const intersections: [Vec2, LineSegments, number, LineSegments, number][] =
      [];
    // Gather all segments from all edges.
    const allSegments = segments.flatMap((s) => s.segments);
    // Sort all of the edges by X by their left side
    const sortedLeft = allSegments.slice(0).sort((a, b) => a[0][0] - b[0][0]);
    // Sort all of the edges by X by their right side
    const sortedRight = allSegments.sort((a, b) => b[1][0] - a[1][0]);
    // Retains all of the lines that should be tested against on each new event
    // point.
    const testQueue = new Set<[Vec2, Vec2, LineSegments]>();

    let left = 0;
    let right = 0;

    for (; left < sortedLeft.length; ++left) {
      const cursor = sortedLeft[left][0];
      let checkEject = sortedRight[right];

      while (cursor >= checkEject[0]) {
        // We remove the ejected element from the test queue, when ejecting we
        // test that element against everything in the queue.
        if (testQueue.delete(checkEject)) {
          testQueue.forEach((e) => {
            const intersection = computeFinalIntersection(checkEject, e);

            if (intersection) {
              intersections.push(intersection);
            }
          });
        }

        right++;
        checkEject = sortedRight[right];
      }

      testQueue.add(sortedLeft[left]);
    }

    // Finish the remaining right queue to perform remaining tests and
    // ejections.
    for (; right < sortedRight.length; ++right) {
      const checkEject = sortedRight[right];

      if (testQueue.delete(checkEject)) {
        testQueue.forEach((e) => {
          const intersection = computeFinalIntersection(checkEject, e);

          if (intersection) {
            intersections.push(intersection);
          }
        });
      }
    }
  }
}
