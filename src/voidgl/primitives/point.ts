/**
 * Defines a 2d point within a coordinate plane
 */
export interface IPoint {
  x : number
  y : number
}

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
function squareDistance(p1: IPoint, p2: IPoint): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;

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
   * @param {IPoint} p1
   * @param {IPoint} p2
   * @param {IPoint} out If this is specified, the results will be placed into this rather than allocate a new object
   *
   * @return {IPoint} The two points added together
   */
  static add(p1: IPoint, p2: IPoint, out?: IPoint): IPoint {
    if (out) {
      out.x = p1.x + p2.x;
      out.y = p1.y + p2.y;
      return out;
    }

    return {
      x: p1.x + p2.x,
      y: p1.y + p2.y,
    };
  }

  /**
   * @static
   * This analyzes a test point against a list of points and determines which of the points is
   * the closest to the test point. If there are equi-distant points in the list, this will return
   * the first found in the list.
   *
   * @param {IPoint} testPoint The point to compare against other points
   * @param {IPoint[]} points The list of points to be compared against
   *
   * @return {IPoint} The closest point to the test point
   */
  static getClosest(testPoint: IPoint, points: IPoint[]): IPoint {
    let closestDistance = Number.MAX_VALUE;
    let closestPoint: IPoint = null;
    let distance: number;

    const findClosest = function(point: IPoint) {
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
   * @param {IPoint} testPoint The point to compare against other points
   * @param {IPoint[]} points The list of points to be compared against
   *
   * @return {number} The index of the closest point to the test point
   */
  static getClosestIndex(testPoint: IPoint, points: IPoint[]): number {
    let closestDistance = Number.MAX_VALUE;
    let closestPoint: number = 0;
    let distance: number;

    const findClosest = function(point: IPoint, i: number) {
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
   * @param {IPoint} p1 The start of the direction
   * @param {IPoint} p2 The direction to point the vector towards
   * @param {boolean} normalize If true, this will make the vector have a magnitude of 1
   *
   * @returns {number}
   */
  static getDirection(p1: IPoint, p2: IPoint, normalize: boolean = false): IPoint {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;

    if (normalize) {
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      dx /= magnitude;
      dy /= magnitude;
    }

    return {
      x: dx,
      y: dy,
    };
  }

  /**
   * @static
   * Gets the distance between two points
   *
   * @param {IPoint} p1
   * @param {IPoint} p2
   * @param {boolean} squared If set to true, returns the distance * distance (performs faster)
   *
   * @returns {number} The real distance between two points
   */
  static getDistance(p1: IPoint, p2: IPoint, squared: boolean = false): number {
    if (squared) {
      return squareDistance(p1, p2);
    }

    return Math.sqrt(squareDistance(p1, p2));
  }

  /**
   * @static
   * Gets a point perfectly between two points
   *
   * @param {IPoint} p1
   * @param {IPoint} p2
   *
   * @returns {IPoint} The point between the two provided points
   */
  static getMidpoint(p1: IPoint, p2: IPoint) {
    const direction = Point.getDirection(p1, p2);

    return {
      x: direction.x / 2 + p1.x,
      y: direction.y / 2 + p1.y,
    };
  }

  static make(x: number, y: number) {
    return {x, y};
  }

  /**
   * Scales a point by a given amount
   *
   * @static
   * @param {IPoint} p1
   * @param {number} s The amount to scale the point by
   * @param {IPoint} out If this is specified, the results will be placed into this rather than allocate a new object
   *
   * @memberof Point
   */
  static scale(p1: IPoint, s: number, out?: IPoint): IPoint {
    if (out) {
      out.x = p1.x * s;
      out.y = p1.y * s;
      return out;
    }

    return {
      x: p1.x * s,
      y: p1.y * s,
    };
  }

  /**
   * Makes a new point initialized to {0,0}
   *
   * @static
   * @returns {IPoint} A new point object at {0,0}
   */
  static zero(): IPoint {
    return {
      x: 0,
      y: 0,
    };
  }
}
