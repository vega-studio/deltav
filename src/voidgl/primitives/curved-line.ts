import { bezier2, bezier3 } from '../util/interpolation';
import { Bounds } from './bounds';
import { Line } from './line';
import { IPoint, Point } from './point';

const debug = require('debug')('bezier');

export interface ICurvedLineOptions {
  /** Flags whether or not the calculated geometry for the line is cached or not */
  cacheSegments?: boolean;
  /** Specifies the control points that modifies the amount of curve on the curved line */
  controlPoints: IPoint[];
  /** The end point of the line */
  end: IPoint;
  /** The smootheness of the curve. Higher number = better burve but heavier to calculate */
  resolution?: number;
  /** The start point of the line */
  start: IPoint;
  /** The style of curve to be rendered, whether that be straight, bezier or circular */
  type: CurveType;
}

/**
 * This enum covers the type of curved lines that can be made. Making a specific curve
 *
 * @export
 * @enum {number}
 */
export enum CurveType {
  /** This will make the curve be generated from interpolating between the end points and provided control points */
  Bezier,
  /**
   * This will draw a curve as though there is a circular arc passing over the two end points. The radius of the
   * circular arc is determined by how far the control point is from the straight line that can be made from the two
   * end points.
   */
  CircularCCW,
  CircularCW,
  /**
   * This ignores the control points altogether and just created a straight line with a single segment that consists
   * of the specified endpoints
   */
  Straight,
}

// -------[ Distance Calculating Methods ]----------------------------

/**
 * Calculates the distance to the bezier curve by testing all of the bezier curve's segment lines
 *
 * @param {CurvedLine<any>} line The curved bezier line type
 * @param {IPoint} testPoint The Point to test distance to
 *
 * @returns {number} The nearest distance from the curve to the test point
 */
function bezierDistance(line: CurvedLine<any>, testPoint: IPoint): number {
  // Get all of the points associated with the curve
  const lineStrip: IPoint[] = line.getLineStrip();
  // Find the closest points to the mouse
  const closestIndex = Point.getClosestIndex(testPoint, lineStrip);
  // Calculate the lines that eminate from this point and do a distance calculation from that line
  // Find the closest distance and use it
  let closestDistance = Number.MAX_VALUE;
  let straightLine: Line<never>;

  if (closestIndex > 0) {
    straightLine = new Line<never>(lineStrip[closestIndex], lineStrip[closestIndex - 1]);
    closestDistance = straightLine.distanceTo(testPoint);
  }

  if (closestIndex < lineStrip.length - 1) {
    straightLine = new Line<never>(lineStrip[closestIndex], lineStrip[closestIndex + 1]);
    closestDistance = Math.min(closestDistance, straightLine.distanceTo(testPoint));
  }

  return closestDistance;
}

/**
 * Calculates the nearness of the line by using the properties of a circle
 * TODO: Using the segment approach for now. Can be sped up by using circle math
 * instead
 *
 * @param {CurvedLine<any>} line The curved bezier line type
 * @param {IPoint} testPoint The Point to test distance to
 *
 * @returns {number} The nearest distance from the curve to the test point
 */
function circularDistance(line: CurvedLine<any>, testPoint: IPoint): number {
  // Get all of the points associated with the curve
  const lineStrip: IPoint[] = line.getLineStrip();
  // Find the closest points to the mouse
  const closestIndex = Point.getClosestIndex(testPoint, lineStrip);
  // Calculate the lines that eminate from this point and do a distance calculation from that line
  // Find the closest distance and use it
  let closestDistance = Number.MAX_VALUE;
  let straightLine: Line<never>;

  if (closestIndex > 0) {
    straightLine = new Line<never>(lineStrip[closestIndex], lineStrip[closestIndex - 1]);
    closestDistance = straightLine.distanceTo(testPoint);
  }

  if (closestIndex < lineStrip.length - 1) {
    straightLine = new Line<never>(lineStrip[closestIndex], lineStrip[closestIndex + 1]);
    closestDistance = Math.min(closestDistance, straightLine.distanceTo(testPoint));
  }

  return closestDistance;
}

/**
 * Calculates the nearness of the line by using the properties of a straight line
 *
 * @param {CurvedLine<any>} line The curved bezier line type
 * @param {IPoint} testPoint The Point to test distance to
 *
 * @returns {number} The nearest distance from the curve to the test point
 */
function straightDistance(line: CurvedLine<any>, testPoint: IPoint): number {
  return new Line(line.start, line.end).distanceTo(testPoint);
}

// -------[ Segment Generating Methods ]----------------------------

/**
 * Uses quadratic bezier principles to create the segments for a quadratic bezier curve
 *
 * @param {CurvedLine} line The curved line object that contains the info to produce the segments
 *
 * @returns {IPoint[]} A line strip of all the calculated points along the line
 */
function makeBezier2Segments(line: CurvedLine<any>): IPoint[] {
  if (line.cachesSegments && line.cachedSegments) {
    return line.cachedSegments;
  }

  const segments: IPoint[] = [];
  const dt = 1 / line.resolution;
  const start = line.start;
  const lineEnd = line.end;
  const c1 = line.controlPoints[0];

  for (let i = 0, end = line.resolution; i <= end; ++i) {
    segments.push(bezier2(dt * i, start, lineEnd, c1));
  }

  if (line.cachesSegments) {
    line.cachedSegments = segments;
  }

  return segments;
}

/**
 * Uses cubic bezier principles to create the segments for a cubic bezier curve
 *
 * @param {CurvedLine} line The curved line object that contains the info to produce the segments
 *
 * @returns {IPoint[]} A line strip of all the calculated points along the line
 */
function makeBezier3Segments(line: CurvedLine<any>): IPoint[] {
  if (line.cachesSegments && line.cachedSegments) {
    return line.cachedSegments;
  }

  const segments: IPoint[] = [];
  const dt = 1 / line.resolution;
  const start = line.start;
  const lineEnd = line.end;
  const c1 = line.controlPoints[0];
  const c2 = line.controlPoints[1];

  for (let i = 0, end = line.resolution; i <= end; ++i) {
    segments.push(bezier3(dt * i, start, lineEnd, c1, c2));
  }

  if (line.cachesSegments) {
    line.cachedSegments = segments;
  }

  return segments;
}

/**
 * Makes the segments for a line that follows along a circular path on the line.
 * The distance the control point is from the straight line that flows through the two
 * end points of the line determines the radius of the curvature of the line
 *
 * @param {CurvedLine<any>} line
 * @returns {IPoint[]}
 */
function makeCircularCWSegments(line: CurvedLine<any>): IPoint[] {
  if (line.cachesSegments && line.cachedSegments) {
    return line.cachedSegments;
  }
  debug('CW');
  // Generate a line so we can have a perpendicular calculation
  const straightLine: Line<never> = new Line<never>(line.start, line.end);
  let radius: number = Point.getDistance(line.start, line.controlPoints[0]);
  let circleCenter: IPoint = line.controlPoints[1];

  if (!circleCenter) {
    // We get the midpoint of the line as we want to align the center of the circle with this point
    const midPoint: IPoint = Point.getMidpoint(line.start, line.end);
    const minRadius = Point.getDistance(midPoint, line.start);

    // The shortest the radius can be is the distance from the line to the mid point
    // Anything shorter will just result in a hemisphere being rendered
    if (radius < minRadius) {
      radius = Point.getDistance(midPoint, line.start);
    }

    // Get the perpendicular direction to the line so we can calculate the center of our circle
    // From the mid point
    const perpendicular: IPoint = straightLine.perpendicular;
    const distance = Math.sqrt(radius * radius - minRadius * minRadius);

    // Calculate the location of the center of the circle
    circleCenter = {
      x: perpendicular.x * distance + midPoint.x,
      y: perpendicular.y * distance + midPoint.y,
    };

    // Store the circle center as an extra control point in case the value is needed
    // (which it often is)
    line.controlPoints[1] = circleCenter;
  }

  debug(' center of circle is %o  %o', circleCenter.x, circleCenter.y);
  // Get the direction vector from the circle center to the first end point
  const direction1 = Point.getDirection(circleCenter, line.start);
  // Get the angle of the first vector
  let theta1 = Math.atan2(direction1.y, direction1.x);
  // Get the direction vector from the circle center to the second end point

  const direction2 = Point.getDirection(circleCenter, line.end);
  // Get the angle of the second vector
  const theta2 = Math.atan2(direction2.y, direction2.x);
  // Calculate how much to increment theta in our parametric circular equation
  if (theta1 < theta2)theta1 += Math.PI * 2;
  const dTheta = (theta1 - theta2) / line.resolution;

  debug('theta1 is %o, theta2 is %o', theta1, theta2);
  // Compute the segments based on the information we have gathered by applying it to a circular
  // Parametric equation
  const segments: IPoint[] = [];

  for (let i = 0, end = line.resolution + 1; i < end; ++i) {
    segments.push({
      x: Math.cos(theta1 - (dTheta * i)) * radius + circleCenter.x,
      y: Math.sin(theta1 - (dTheta * i)) * radius + circleCenter.y,
    });
  }

  // Cache the segments if specified by the curved line
  if (line.cachesSegments) {
    line.cachedSegments = segments;
  }

  debug('Generated Circular Segments: %o dTheta: %o radius: %o', segments, dTheta, radius);
  return segments;
}

function makeCircularCCWSegments(line: CurvedLine<any>) {
  if (line.cachesSegments && line.cachedSegments){
    return line.cachedSegments;
  }

  const straightLine: Line<never> = new Line<never>(line.start, line.end);
  let radius: number = Point.getDistance(line.start, line.controlPoints[0]);
  let circleCenter: IPoint = line.controlPoints[1];

  if (!circleCenter) {
    const midPoint: IPoint = Point.getMidpoint(line.start, line.end);
    const minRadius = Point.getDistance(midPoint, line.start);

    if (radius < minRadius){
      radius = Point.getDistance(midPoint, line.start);
    }

    const perpendicular: IPoint = straightLine.perpendicular;

    const distance = Math.sqrt(radius * radius - minRadius * minRadius);
    circleCenter = {
      x: -perpendicular.x * distance + midPoint.x,
      y: -perpendicular.y * distance + midPoint.y,
    };

    // Store the circle center as an extra control point in case the value is needed
    // (which it often is)
    line.controlPoints[1] = circleCenter;
  }

  const direction1 =  Point.getDirection(circleCenter, line.start);

  const theta1 = Math.atan2(direction1.y, direction1.x);

  const direction2 = Point.getDirection(circleCenter, line.end);

  let theta2 = Math.atan2(direction2.y, direction2.x);

  if (theta2 < theta1)theta2 += Math.PI * 2;

  const dTheta = (theta2 - theta1) / line.resolution;

  const segments: IPoint[] = [];

  // CCW, from end to start
  for (let i = 0, end = line.resolution + 1; i < end; ++i){
    segments.push({
      x: Math.cos(theta1 + (dTheta * i)) * radius + circleCenter.x,
      y: Math.sin(theta1 + (dTheta * i)) * radius + circleCenter.y,
    });
  }

  if (line.cachedSegments){
    line.cachedSegments = segments;
  }

  return segments;
}

/**
 * Makes the segments for a line that is straight, thus only 1 segments is needed
 * and will be generated.
 *
 * @param {CurvedLine<any>} line
 * @returns {IPoint[]}
 */
function makeStraightSegments(line: CurvedLine<any>) {
  return [line.start, line.end];
}

/** A quick lookup for a proper segment creating method for a curved line  */
const pickSegmentMethod = {
  [CurveType.Bezier]: [
    null,
    makeBezier2Segments,
    makeBezier3Segments,
  ],
  [CurveType.CircularCW]: [
    null,
    makeCircularCWSegments,
    makeCircularCWSegments,
  ],
  [CurveType.CircularCCW]: [
    null,
    makeCircularCCWSegments,
    makeCircularCCWSegments,
  ],
  [CurveType.Straight]: [
    makeStraightSegments,
  ],
};

/** A quick lookup for a proper distance calculating method for a curved line  */
const pickDistanceMethod = {
  [CurveType.Bezier]: bezierDistance,
  [CurveType.CircularCW]: circularDistance,
  [CurveType.CircularCCW]: circularDistance,
  [CurveType.Straight]: straightDistance,
};

/**
 * Defines an object which illustrates a curved line. Curved lines can be formed in many
 * ways but most often from two end points and some provided control points.
 *
 * @export
 * @class CurvedLine
 * @extends {Bounds<T>}
 * @template T An associated data type with this object. Use <never> if no data type is ever associated
 */
export class CurvedLine<T> extends Bounds<T> {
  /** Stores the segments that have been calculated. Only gets populated if cachesSegments is true */
  cachedSegments: IPoint[];
  /** Flag to indicate if this line caches its segments. Uses more ram but performs better if true */
  cachesSegments: boolean;
  /**
   * The control points used for calculating the curvature of the line. Circular curves only use a single point
   * to indicate the middle of the circle that the line arcs from.
   */
  controlPoints: IPoint[];
  /** This is the automatically set method that will be used in calculating the distance to a point from this line */
  distanceMethod: (line: CurvedLine<any>, point: IPoint) => number;
  /** This is an end point of the line */
  start: IPoint;
  /** This is an end point of the line */
  end: IPoint;
  /** This is how many segments can be used to generate the line. More segments = less performant but prettier */
  resolution: number;
  /** This is the automatically set method used to calculate the segments needed to piece together the curve */
  segmentMethod: (line: CurvedLine<any>) => IPoint[];
  /** This indicates how the curve is formed from the control points. See the enum values for more details. */
  type: CurveType;

  /**
   * Generates a primitive that describes a curved line, which is defined by the lines end points, type, and control points
   *
   * @param {ICurvedLineOptions} options The configuration options of this curved line
   */
  constructor(options: ICurvedLineOptions) {
    const minX = Number.MAX_VALUE, maxX = -Number.MAX_VALUE,
            minY = Number.MAX_VALUE, maxY = -Number.MAX_VALUE;
    super(minX, maxX, maxY, minY);

    // Apply the relevant properties to the curve
    this.cachesSegments = options.cacheSegments || false;
    this.type = options.type;
    this.resolution = options.resolution || 20;
    // Set the metrics for this curved line
    this.setPoints(options.start, options.end, options.controlPoints);
    // Set the method that will be used for calculating distance from a point
    this.distanceMethod = pickDistanceMethod[options.type];
  }

  get values() {
    return {
      controlPoints: this.controlPoints,
      end: this.end,
      start: this.start,
    };
  }

  /**
   * Calculates the nearest distance from the provided point to this curved line
   *
   * @param {IPoint} point The point to test the distance from
   *
   * @returns {number} The calculated nearest distance from this curve to the point
   */
  distanceTo(point: IPoint): number {
    return this.distanceMethod(this, point);
  }

  /**
   * Picks the closest line in the list to a given point
   *
   * @param {CurvedLine<any>[]} lines The lines to compare
   * @param {IPoint} p The point to compare against
   *
   * @return {Line} The nearest line to the point
   */
  static getClosest<T>(lines: CurvedLine<T>[], point: IPoint) {
    let closestLine;
    let closestDistance = Number.MAX_VALUE;
    let distance = 0;

    lines.forEach((line) => {
      distance = line.distanceTo(point);
      if (distance < closestDistance) {
        closestLine = line;
        closestDistance = distance;
      }
    });

    return closestLine;
  }

  /**
   * This returns the line strip that represents the curve. A line strip is specifically a group of points
   * that forms line segments by taking the current point as one end and the previous point as the second end
   * thus, you would start at index 1 and loop to the end to generate all of the lines composing this single
   * line.
   *
   * @return {IPoint[]} All of the points in the line strip
   */
  getLineStrip(): IPoint[] {
    return this.segmentMethod(this);
  }

  /**
   * Adjusts the relevant points that defines the curve and recalculates all items necessary
   *
   * @param {IPoint} start
   * @param {IPoint} end
   * @param {IPoint[]} controlPoints
   * @param {boolean} preventRebounding If set, this will prevent the bounds from being recalculated
   */
  setPoints(start: IPoint, end: IPoint, controlPoints?: IPoint[]) {
    // Apply the points
    this.start = start;
    this.end = end;
    if (controlPoints.length === 0) debug('start: %o, end:%o', start, end);

    // Get the available segment methods for the given type
    const segmentMethods = pickSegmentMethod[this.type];

    // If we adjust the control points we need to re-evaluate the type of segment creation method we use
    if (controlPoints) {
      this.controlPoints = controlPoints;
      // Get the number of control points we want to base the curve off of
      let numControlPoints = controlPoints.length;

      // If we have more control points than the methods available, then we use the greatest method available to best
      // Handle as many control points as possible
      if (numControlPoints > segmentMethods.length) {
        numControlPoints = segmentMethods.length - 1;
      }

      // Set the method that will be used for generating segments
      this.segmentMethod = segmentMethods[numControlPoints];
      // Make sure the input wasn't bad
      if (!this.segmentMethod) {
        throw new Error('An Invalid number of control points was provided to a curved line. You must have at LEAST 1 control point. Or 0 for a straight line');
      }

      if (this.type === CurveType.Bezier) {
        this.encapsulatePoints(controlPoints);
      }

      else if (this.type === CurveType.CircularCCW || this.type === CurveType.CircularCW) {
        this.encapsulatePoints(this.getLineStrip());
      }
    }

    this.encapsulatePoint(start);
    this.encapsulatePoint(end);

    // Invalidate caches if they exist
    this.cachedSegments = null;
  }
}
