import { add2, scale2, subtract2, Vec2 } from "../util/vector";

/**
 * Calculates the distance between two points, but keeps the distance in dquared form
 * thus performing Math.sqrt() on the output of this distance would provide the true
 * distance between the points.
 *
 * It is often faster and all that is needed to compare squared distances vs real distances
 * thus eliminating multiple Math.sqrt operations
 *
 * NOTE: For vectors this is the same as (pseudo code):
 * let vector3 = vector2.subtract(vector1)
 * return vector3.dot(vector3)
 *
 * @param p1 The point to find the distance from the second point
 * @param p2 The point to find the distance from the first point
 *
 * @return {number} The distance * distance between the two points
 */
function squareDistance(p1: Vec2, p2: Vec2): number {
  const delta = subtract2(p1, p2);
  const dx = delta[0];
  const dy = delta[1];

  return dx * dx + dy * dy;
}

/**
 * Contains methods for managing or manipulating points
 *
 * @export
 * @class Point
 */
export class Point {
  /**
   * Adds two points together
   *
   * @static
   * @param p1
   * @param p2
   * @param out If this is specified, the results will be placed into this rather than allocate a new object
   *
   * @return The two points added together
   */
  static add(p1: Vec2, p2: Vec2, out?: Vec2): Vec2 {
    const total = add2(p1, p2);

    if (out) {
      out[0] = total[0];
      out[1] = total[1];
      return out;
    }

    return total;
  }

  /**
   * @static
   * This analyzes a test point against a list of points and determines which of the points is
   * the closest to the test point. If there are equi-distant points in the list, this will return
   * the first found in the list.
   *
   * @param testPoint The point to compare against other points
   * @param points The list of points to be compared against
   *
   * @return The closest point to the test point
   */
  static getClosest(testPoint: Vec2, points: Vec2[]): Vec2 {
    let closestDistance = Number.MAX_VALUE;
    let closestPoint: Vec2 = testPoint;
    let distance: number;

    const findClosest = function(point: Vec2) {
      distance = squareDistance(point, testPoint);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = point;
      }
    };

    points.forEach(findClosest);

    return closestPoint;
  }

  /**
   * @static
   * This analyzes a test point against a list of points and determines which of the points is
   * the closest to the test point. If there are equi-distant points in the list, this will return
   * the first found in the list.
   *
   * This just returns the index of the found point and not the point itself
   *
   * @param testPoint The point to compare against other points
   * @param points The list of points to be compared against
   *
   * @return The index of the closest point to the test point
   */
  static getClosestIndex(testPoint: Vec2, points: Vec2[]): number {
    let closestDistance = Number.MAX_VALUE;
    let closestPoint: number = 0;
    let distance: number;

    const findClosest = function(point: Vec2, i: number) {
      distance = squareDistance(point, testPoint);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = i;
      }
    };

    points.forEach(findClosest);

    return closestPoint;
  }

  /**
   * @static
   * This will calculate a direction vector between two points that points toward p2
   *
   * @param amount The start of the direction
   * @param from The direction to point the vector towards
   * @param normalize If true, this will make the vector have a magnitude of 1
   */
  static subtract(amount: Vec2, from: Vec2, normalize: boolean = false): Vec2 {
    const delta = subtract2(from, amount);
    let dx = delta[0];
    let dy = delta[1];

    if (normalize) {
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      dx /= magnitude;
      dy /= magnitude;
    }

    return [dx, dy];
  }

  /**
   * @static
   * Gets the distance between two points
   *
   * @param p1
   * @param p2
   * @param squared If set to true, returns the distance * distance (performs faster)
   */
  static getDistance(p1: Vec2, p2: Vec2, squared: boolean = false): number {
    if (squared) {
      return squareDistance(p1, p2);
    }

    return Math.sqrt(squareDistance(p1, p2));
  }

  /**
   * @static
   * Gets a point perfectly between two points
   *
   * @param p1
   * @param p2
   *
   * @returns The point between the two provided points
   */
  static getMidpoint(p1: Vec2, p2: Vec2) {
    const mid = scale2(subtract2(p2, p1), 0.5);

    return add2(mid, p1);
  }

  static make(x: number, y: number) {
    return { x, y };
  }

  /**
   * Scales a point by a given amount
   *
   * @static
   * @param p1
   * @param s The amount to scale the point by
   * @param out If this is specified, the results will be placed into this rather than allocate a new object
   */
  static scale(p1: Vec2, s: number, out?: Vec2): Vec2 {
    if (out) {
      out[0] = p1[0] * s;
      out[1] = p1[1] * s;
      return out;
    }

    return [p1[0] * s, p1[1] * s];
  }

  /**
   * Makes a new point initialized to {0,0}
   *
   * @static
   * @returns A new point object at {0,0}
   */
  static zero(): Vec2 {
    return [0, 0];
  }
}
