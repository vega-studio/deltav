import {
  add2,
  add4,
  dot2,
  EdgeInstance,
  EdgeType,
  length2,
  scale2,
  scale4,
  subtract2,
  subtract4,
  tod_flip2,
  V4R,
  Vec2,
  type Vec4,
} from "../../../src";
import type { LineSweep } from "./line-sweep";

// These are temp vector storage registers for storing results for multiple
// vector steps. Using these as out values greatly reduces allocations.
const REGISTER1: Vec2 = [0, 0];
const REGISTER2: Vec2 = [0, 0];
const REGISTER3: Vec2 = [0, 0];
const REGISTER4: Vec2 = [0, 0];
const REGISTER5: Vec2 = [0, 0];
const REGISTER6: Vec2 = [0, 0];

/**
 * As a utility class: Provides helper equations for line segments.
 *
 * As a class: Stores an edge and manages the breakup of the edge into easier to
 * process line segments for analysis. This helps with handling bezier
 * complexity uncluding splitting the curves and detecting interactions with the
 * curve based on CPU processes.
 */
export class LineSegments {
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
  tDivision = 1;
  /**
   * The segments that represents the edge. Each segment has a self reference
   * to keep it associated with the LineSegements it originated from. While this
   * costs a little more memory, it prevents the need to generate lookup maps
   * during processing which ends up being more costly anywho.
   */
  get segments(): readonly [Vec2, Vec2, LineSegments, boolean][] {
    if (this.needsUpdate) this.updateSegments();
    return this._segments;
  }
  private _segments: [Vec2, Vec2, LineSegments, boolean][] = [];

  /**
   * This is the approximated length of the edge. It computes the length of each
   * line segment to get the total length of the edge.
   */
  get length(): number {
    if (this.needsUpdate) this.updateSegments();
    return this._length;
  }
  private _length = 0;
  /**
   * Flag this as true when the segments should be updated to new values on next
   * segments retrieval.
   */
  needsUpdate = true;

  constructor(edge: EdgeInstance, type: EdgeType) {
    this.edge = edge;
    this.type = type;
  }

  /**
   * This computes new edges that represents the exact same edge split at
   * the specified t intervals along this edge.
   */
  split(tVals: number[]): LineSegments[] {
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

    // Always ensure the tVals are sorted ASC
    tVals.sort((a, b) => a - b);

    // Always ensure the final value is < 1
    if (tVals[tVals.length - 1] > 1) {
      console.error("Can not split an edge at t > 1. Returning unsplit edge.");
      return [this];
    }

    // Always ensure the final value IS NOT1
    if (tVals[tVals.length - 1] === 1) {
      tVals.pop();
    }

    // Ensure the first value is not negative
    if (tVals[0] < 0) {
      console.error("Can not split an edge at t < 0. Returning unsplit edge.");
      return [this];
    }

    // Remove a value of 0
    if (tVals[0] === 0) {
      tVals.shift();
    }

    // Thickness split is the same for all curves as it's linear
    const dThickness = this.edge.thickness[1] - this.edge.thickness[0];
    const dColor = subtract4(this.edge.endColor, this.edge.startColor);
    const edges: EdgeInstance[] = [];

    const getLinearMetrics = (prevT: number, t: number) => {
      const startThickness = this.edge.thickness[0] + dThickness * prevT;
      const endThickness = this.edge.thickness[0] + dThickness * t;
      const startColor = add4(
        this.edge.startColor,
        scale4(dColor, prevT, V4R[0])
      );
      const endColor = add4(this.edge.startColor, scale4(dColor, t, V4R[0]));

      return {
        startColor,
        endColor,
        thickness: [startThickness, endThickness] as Vec2,
      };
    };

    switch (this.type) {
      // Lines are simple in that we just have to linear interpolate the end
      // points.
      case EdgeType.LINE: {
        // For this process we will loop till the end is a 1. Copy to prevent
        // mutation
        tVals = tVals.slice(0);
        tVals.push(1);

        let start: Vec2 = this.edge.start;
        let end: Vec2 = this.edge.end;
        let prevT = 0;

        for (const t of tVals) {
          start = this.getPoint(prevT);
          end = this.getPoint(t);

          edges.push(
            new EdgeInstance({
              ...getLinearMetrics(prevT, t),
              start,
              end,
            })
          );

          prevT = t;
        }
        break;
      }

      // Bezier curves are more complex as we need to get new end points but
      // also calculate equivalent control points to keep the piece of curve the
      // same shape. So we will do a sort of recursive split where we make a
      // split, retain the first piece, then split the next piece.
      case EdgeType.BEZIER: {
        let prevT = 0;
        let P0 = this.edge.start;
        let P1 = this.edge.control[0];
        const P2 = this.edge.end;

        for (let i = 0, iMax = tVals.length, iLast = iMax - 1; i < iMax; i++) {
          const t = tVals[i];

          const t_1 = 1 - t;
          const P01 = add2(
            scale2(P0, t_1, REGISTER1),
            scale2(P1, t, REGISTER2)
          );
          const P12 = add2(
            scale2(P1, t_1, REGISTER1),
            scale2(P2, t, REGISTER2)
          );
          const P012 = add2(
            scale2(P01, t_1, REGISTER1),
            scale2(P12, t, REGISTER2)
          );

          edges.push(
            new EdgeInstance({
              ...getLinearMetrics(prevT, t),
              start: P0,
              end: P012,
              control: [P01],
            })
          );

          // Move our next split computation to the next edge to split
          P0 = P012;
          P1 = P12;
          // P2 = P2;

          // We must add the final curve if we performed the final split
          if (i === iLast) {
            edges.push(
              new EdgeInstance({
                ...getLinearMetrics(prevT, t),
                start: P0,
                end: P2,
                control: [P12],
              })
            );
          }

          prevT = t;
        }

        break;
      }

      // Bezier curves are more complex as we need to get new end points but
      // also calculate equivalent control points to keep the piece of curve the
      // same shape. So we will do a sort of recursive split where we make a
      // split, retain the first piece, then split the next piece.
      case EdgeType.BEZIER2: {
        let prevT = 0;
        let P0 = this.edge.start;
        const P3 = this.edge.end;
        let P1 = this.edge.control[0];
        let P2 = this.edge.control[1];

        for (let i = 0, iMax = tVals.length, iLast = iMax - 1; i < iMax; i++) {
          const t = tVals[i];
          const t_1 = 1 - t;
          const P01 = add2(
            scale2(P0, t_1, REGISTER1),
            scale2(P1, t, REGISTER2)
          );
          const P12 = add2(
            scale2(P1, t_1, REGISTER1),
            scale2(P2, t, REGISTER2)
          );
          const P23 = add2(
            scale2(P2, t_1, REGISTER1),
            scale2(P3, t, REGISTER2)
          );
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

          edges.push(
            new EdgeInstance({
              ...getLinearMetrics(prevT, t),
              start: P0,
              end: P01,
              control: [P012, P0123],
            })
          );

          // Move our next split computation to the next edge to split
          P0 = P0123;
          P1 = P123;
          P2 = P23;
          // P3 = P3;

          // We must add the final curve if we performed the final split
          if (i === iLast) {
            edges.push(
              new EdgeInstance({
                ...getLinearMetrics(prevT, t),
                start: P0,
                end: P3,
                control: [P1, P2],
              })
            );
          }

          prevT = t;
        }
        break;
      }
    }

    // Wrap all computed edges in LineSegments and provide them to the caller
    return edges.map((e) => {
      const line = new LineSegments(e, this.type);
      line.updateSegments();
      return line;
    });
  }

  getRoughYBounds() {
    switch (this.type) {
      case EdgeType.LINE:
        return [
          Math.min(this.edge.start[1], this.edge.end[1]),
          Math.max(this.edge.start[1], this.edge.end[1]),
        ];

      case EdgeType.BEZIER:
        return [
          Math.min(
            this.edge.start[1],
            this.edge.end[1],
            this.edge.control[0][1]
          ),
          Math.max(
            this.edge.start[1],
            this.edge.end[1],
            this.edge.control[0][1]
          ),
        ];

      case EdgeType.BEZIER2:
        return [
          Math.min(
            this.edge.start[1],
            this.edge.end[1],
            this.edge.control[0][1],
            this.edge.control[1][1]
          ),
          Math.max(
            this.edge.start[1],
            this.edge.end[1],
            this.edge.control[0][1],
            this.edge.control[1][1]
          ),
        ];
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
            scale2(this.edge.start, t_1 * t_1, REGISTER1),
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
   * This takes a segment and returns the start and end t value of the segment.
   * This ONLY works if the segment used comes from the most recent update of
   * this line segment's segments.
   *
   * Returns null if the segment is not part of this line segment.
   */
  getSegmentT(segment: LineSegments["segments"][number]): Vec2 | null {
    const index = this.segments.findIndex((s) => s === segment);
    if (index < 0) return null;

    return [index * this.tDivision, (index + 1) * this.tDivision];
  }

  /**
   * Call this to update the line segment representation of the edge. Curves
   * require several line segments to represent them for mathematical collisions
   * and intersections.
   */
  updateSegments(customCount?: number) {
    // Generate the new segments for the edge
    switch (this.type) {
      case EdgeType.LINE:
        this.tDivision = 1;
        if (this.edge.start[0] < this.edge.end[0]) {
          this._segments = [[this.edge.start, this.edge.end, this, true]];
        } else {
          this._segments = [[this.edge.end, this.edge.start, this, false]];
        }
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

        for (let i = 1; i <= count; ++i) {
          const t = i * this.tDivision;
          const p = this.getPoint(t);
          // Segments always travel from left to right to aid in sweep
          // calculations
          if (p[0] > previous[0]) {
            this._segments.push([previous, p, this, true]);
          } else this._segments.push([p, previous, this, false]);
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

        for (let i = 1; i <= count; ++i) {
          const t = i * this.tDivision;
          const p = this.getPoint(t);
          // Segments always travel from left to right to aid in sweep
          // calculations
          if (p[0] > previous[0]) {
            this._segments.push([previous, p, this, true]);
          } else this._segments.push([p, previous, this, false]);
          previous = p;
        }
        break;
      }
    }

    // Loop through the generated segments to add each segment's length
    this._length = 0;
    for (const segment of this._segments) {
      this._length += length2(subtract2(segment[1], segment[0], REGISTER1));
    }

    this.needsUpdate = false;
  }

  /**
   * This calculates the SQUARED distance to a point from this line segment. If
   * you need the real distance take the square root of this value. This is done
   * for a performance reminder and consideration when writing applications with
   * this method.
   *
   * This also returns the t value calculated while determining the distance.
   */
  static distanceToPointSq(segment: [Vec2, Vec2, ...any], p: Vec2): Vec2 {
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
    if (len_sq !== 0) {
      param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
      param = 0;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
      param = 1;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return [dx * dx + dy * dy, param];
  }

  static yCheck(y1: number, y2: number, y3: number, y4: number) {
    if (y1 < y3 && y2 < y3 && y1 < y4 && y2 < y4) return true;
    if (y1 > y3 && y2 > y3 && y1 > y4 && y2 > y4) return true;
    return false;
  }

  /**
   * Computes segment to segment intersections. Provides the point + the t value
   * along the segment.
   */
  static intersect(
    s1: [Vec2, Vec2, ...any],
    s2: [Vec2, Vec2, ...any]
  ): Vec4 | null {
    // const { 0: x1, 1: y1 } = s1[0];
    // const { 0: x2, 1: y2 } = s1[1];
    // const { 0: x3, 1: y3 } = s2[0];
    // const { 0: x4, 1: y4 } = s2[1];
    // if (y1 < y3 && y2 < y3 && y1 < y4 && y2 < y4) return null;
    // if (y1 > y3 && y2 > y3 && y1 > y4 && y2 > y4) return null;
    // const a = x2 - x1;
    // const b = y2 - y1;
    // const c = x4 - x3;
    // const d = y4 - y3;
    // let denom = d * a - c * b;
    // if (denom === 0) return null;
    // denom = 1 / denom;
    // const ua = (c * (y1 - y3) - d * (x1 - x3)) * denom;
    // const ub = (a * (y1 - y3) - b * (x1 - x3)) * denom;
    // if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
    // const x = x1 + ua * a;
    // const y = y1 + ua * b;

    const s10 = s1[0];
    const s20 = s2[0];
    if (LineSegments.yCheck(s10[1], s1[1][1], s20[1], s2[1][1])) return null;
    let denom = tod_flip2(
      // a b
      subtract2(s1[1], s10, REGISTER1),
      // c d
      subtract2(s2[1], s20, REGISTER2)
    );
    if (denom === 0) return null;
    denom = 1 / denom;
    const ua = tod_flip2(REGISTER2, subtract2(s10, s20, REGISTER3)) * denom;
    const ub = tod_flip2(REGISTER1, REGISTER3) * denom;
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
    const x = s10[0] + ua * REGISTER1[0];
    const y = s10[1] + ua * REGISTER1[1];

    return [x, y, ua, ub];
  }

  /**
   * Calculates if a circle intersects the specified segment.
   */
  static intersectsCircle(
    p0: Vec2,
    p1: Vec2,
    circle: { r: number; center: Vec2 }
  ) {
    // const circleDistance = {
    //   x: Math.abs(circle.x - (p0.x + p1.x) / 2),
    //   y: Math.abs(circle.y - (p0.y + p1.y) / 2)
    // };
    subtract2(circle.center, scale2(add2(p0, p1, REGISTER1), 0.5, REGISTER2));

    // const dx = p1.x - p0.x;
    // const dy = p1.y - p0.y;
    subtract2(p1, p0, REGISTER3);

    // const length = Math.sqrt(dx * dx + dy * dy);
    const lengthSq = dot2(REGISTER3, REGISTER3);

    // const dot =
    //   ((circle.x - p0.x) * dx + (circle.y - p0.y) * dy) / Math.pow(length, 2);
    const dot =
      dot2(subtract2(circle.center, p0, REGISTER4), REGISTER3) / lengthSq;

    // const closest = { x: p0.x + dot * dx, y: p0.y + dot * dy };
    add2(p0, scale2(REGISTER3, dot), REGISTER5);

    // const dClosest = { x: circle.x - closest.x, y: circle.y - closest.y };
    subtract2(circle.center, REGISTER5, REGISTER6);

    // const distClosest = Math.sqrt(
    //   dClosest.x * dClosest.x + dClosest.y * dClosest.y
    // );
    const distClosestSq = dot2(REGISTER6, REGISTER6);

    // if (distClosest > circle.radius) {
    //   return false;
    // }
    if (distClosestSq > circle.r * circle.r) {
      return false;
    }

    // const t =
    //   ((circle.x - p0.x) * (p1.x - p0.x) + (circle.y - p0.y) * (p1.y - p0.y)) /
    //   (length * length);
    // center - p0 = REGISTER4
    // p1 - p0 = REGISTER3
    const t = dot2(REGISTER3, REGISTER4) / lengthSq;

    // We're off the edge of the segment from the p0 point. So just test
    // distance to that point
    if (t < 0) {
      const dSq = dot2(REGISTER4, REGISTER4);
      return dSq < circle.r * circle.r;
    }

    // We're off the edge on the other end.
    else if (t > 1) {
      const v = subtract2(circle.center, p1, REGISTER1);
      const dSq = dot2(v, v);
      return dSq < circle.r * circle.r;
    }

    if (t < 0.0 || t > 1.0) return false;

    return true;
  }

  /**
   * This makes working with a list of intersections easier to work with by
   * contextualizing the intersection target.
   */
  static filterIntersections(
    check: LineSegments,
    intersections: ReturnType<typeof LineSweep.lineSweepIntersections>
  ) {
    return intersections
      .filter((i) => i[1] === check || i[3] === check)
      .map((o) => {
        const is1 = o[1] === check;

        return {
          target: is1 ? o[3] : o[1],
          target_t: is1 ? o[4] : o[2],
          self_t: is1 ? o[2] : o[4],
          intersection: o[0],
        };
      });
  }
}
