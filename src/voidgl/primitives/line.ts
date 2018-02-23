import { Bounds } from './bounds';
import { IPoint } from './point';

/**
 * Represents a line with a given slope
 */
export class Line<T> extends Bounds<T> {
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
  constructor(p1: IPoint, p2: IPoint) {
    super(0, 1, 1, 0);
    this.setPoints(p1, p2);
  }

  /**
   * This calculates the distance to a point from the provided line
   * BUT this ALSO retains the directionality of that distance. So one side of
   * the line will be positive while the other negative
   *
   * @param {IPoint} p The Point to see how far from the line we are
   *
   * @return {number} The calculated distance to the provided point
   */
  directionTo(p: IPoint) {
    // Make a vector from a line point to the indicated point
    const vector =  {
      x: this.p1.x - p.x,
      y: this.p1.y - p.y,
    };

    // The distance is d = |v . r| where v is a unit perpendicular vector to the
    // Line, but we won't take the absolute to retain the direction
    return this.perpendicular.x * vector.x + this.perpendicular.y * vector.y;
  }

  /**
   * This calculates the distance to a point from the provided line
   *
   * @param {IPoint} p The Point to see how far from the line we are
   *
   * @return {number} The calculated distance to the provided point
   */
  distanceTo(p: IPoint) {
    // Make a vector from a line point to the indicated point
    const vector =  {
      x: this.p1.x - p.x,
      y: this.p1.y - p.y,
    };

    // The distance is d = |v . r| where v is a unit perpendicular vector to the
    // Line
    return Math.abs(
      this.perpendicular.x * vector.x +
      this.perpendicular.y * vector.y,
    );
  }

  /**
   * Picks the closest line in the list to a given point
   *
   * @param {Array} lines The lines to compare
   * @param {IPoint} p The point to compare against
   *
   * @return {Line} The nearest line to the point
   */
  static getClosest(lines: Line<any>[], p: IPoint): Line<any> {
    let closestLine;
    let closestDistance = Number.MAX_VALUE;
    let distance = 0;

    lines.forEach((line) => {
      distance = line.distanceTo(p);
      if (distance < closestDistance) {
        closestLine = line;
        closestDistance = distance;
      }
    });

    return closestLine;
  }

  /**
   * This sets the two endpoints for this line and recalculates the bounds
   * of the line accordingly
   *
   * @param {IPoint} p1 The start point
   * @param {IPoint} p2 The end point
   */
  setPoints(p1: IPoint, p2: IPoint) {
    this.x = p1.x - 1;
    this.y = p1.y - 1;
    this.width = 2;
    this.height = 2;
    this.encapsulatePoint(p2);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    this.slope = dy / dx;
    this.p1 = p1;
    this.p2 = p2;
    this.magnitude = Math.sqrt(dx * dx + dy * dy);

    this.perpendicular = {
      x: this.p2.y - this.p1.y,
      y: -(this.p2.x - this.p1.x),
    };

    // Normalize the perpendicular line
    const mag = Math.sqrt(
      this.perpendicular.x * this.perpendicular.x +
      this.perpendicular.y * this.perpendicular.y,
    );

    this.perpendicular.x /= mag;
    this.perpendicular.y /= mag;
  }
}
