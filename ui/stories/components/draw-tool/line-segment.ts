import { EdgeInstance, EdgeType, Vec2 } from "../../../src";

/**
 * Provides helper equations
 */
export class LineSegments {
  type: EdgeType;
  edge: EdgeInstance;
  /**
   * The t amount used to generate each line segment. Only is < 1 when there
   * are more than 1 segment to represent the edge
   */
  tDivision = 1;
  /** The segments that represents the edge */
  segments: [Vec2, Vec2][] = [];

  constructor(edge: EdgeInstance, type: EdgeType) {
    this.edge = edge;
    this.type = type;
  }

  /**
   * Call this to update the line segment representation of the edge. Curves
   * require several line segments to represent them for mathematical collisions
   * and intersections.
   */
  updateSegments() {
    switch (this.type) {
      case EdgeType.LINE:
        this.segments = [[this.edge.start, this.edge.end]];
        break;

      case EdgeType.BEZIER: {
        /** We want 25 segments for this simpler curve */
        const count = 25;
        this.tDivision = 1 / count;

        loop;
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
  static distanceToPointSq(edge: EdgeInstance, p: Vec2) {
    const { 0: px, 1: py } = p;
    const { 0: x1, 1: y1 } = edge.start;
    const { 0: x2, 1: y2 } = edge.end;

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
   * Computes edge to edge intersections.
   */
  static intersect(edge1: EdgeInstance, edg2: EdgeInstance) {
    const { 0: x1, 1: y1 } = edge1.start;
    const { 0: x2, 1: y2 } = edge1.end;
    const { 0: x3, 1: y3 } = edg2.start;
    const { 0: x4, 1: y4 } = edg2.end;
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return null;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
    const x = x1 + ua * (x2 - x1);
    const y = y1 + ua * (y2 - y1);
    return { x, y };
  }

  /**
   * Performs a line sweep algorithm to compute ALL intersections for a list of
   * edges.
   */
  static lineSweepIntersections() {}
}
