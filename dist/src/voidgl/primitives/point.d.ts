/**
 * Defines a 2d point within a coordinate plane
 */
export interface IPoint {
    x: number;
    y: number;
}
/**
 * Contains methods for managing or manipulating points
 *
 * @export
 * @class Point
 */
export declare class Point {
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
    static add(p1: IPoint, p2: IPoint, out?: IPoint): IPoint;
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
    static getClosest(testPoint: IPoint, points: IPoint[]): IPoint;
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
    static getClosestIndex(testPoint: IPoint, points: IPoint[]): number;
    /**
     * @static
     * This will calculate a direction vector between two points that points toward p2
     *
     * @param {IPoint} amount The start of the direction
     * @param {IPoint} from The direction to point the vector towards
     * @param {boolean} normalize If true, this will make the vector have a magnitude of 1
     *
     * @returns {number}
     */
    static subtract(amount: IPoint, from: IPoint, normalize?: boolean): IPoint;
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
    static getDistance(p1: IPoint, p2: IPoint, squared?: boolean): number;
    /**
     * @static
     * Gets a point perfectly between two points
     *
     * @param {IPoint} p1
     * @param {IPoint} p2
     *
     * @returns {IPoint} The point between the two provided points
     */
    static getMidpoint(p1: IPoint, p2: IPoint): {
        x: number;
        y: number;
    };
    static make(x: number, y: number): {
        x: number;
        y: number;
    };
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
    static scale(p1: IPoint, s: number, out?: IPoint): IPoint;
    /**
     * Makes a new point initialized to {0,0}
     *
     * @static
     * @returns {IPoint} A new point object at {0,0}
     */
    static zero(): IPoint;
}
