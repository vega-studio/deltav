import type { Ray } from "./ray.js";
import { type Vec3 } from "./vector.js";
/**
 * Minimum representation of a plane in space.
 * [normal, distance]
 *
 * for the form:
 *
 * normal.x * x + normal.y * y + normal.z * z + distance = 0
 */
export type Plane = [Vec3, number];
/**
 * Construct a plane representation from a normal and a distance.
 */
export declare function plane(normal: Vec3, distance: number, out?: Plane): Plane;
/**
 * Copy a plane to a new object.
 */
export declare function planeCopy(planeIn: Plane, out?: Plane): Plane;
/**
 * Construct a plane representation from a non-unit direction normal and a
 * distance. If you have a normalized normal, use {@link plane} instead.
 */
export declare function planeFromPointAndDistance(point: Vec3, distance: number, out?: Plane): Plane;
/**
 * Construct a plane representation from three points.
 */
export declare function planeFromPoints(a: Vec3, b: Vec3, c: Vec3, out?: Plane): Plane;
/**
 * Construct a plane representation from a point and a normal. The normal MUST
 * be a unit vector.
 */
export declare function planeFromPointAndNormal(point: Vec3, normal: Vec3, out?: Plane): Plane;
/**
 * Get the SIGNED distance from a point to a plane.
 */
export declare function planeDistance(plane: Plane, point: Vec3): number;
/**
 * Project a point onto a plane.
 */
export declare function planeProjectPoint(plane: Plane, point: Vec3, out?: Vec3): Vec3;
/**
 * Reflect a point across a plane.
 */
export declare function planeReflectPoint(plane: Plane, point: Vec3, out?: Vec3): Vec3;
/**
 * Get the intersection of a line and a plane.
 */
export declare function planeLineIntersection(plane: Plane, line: [Vec3, Vec3], out?: Vec3): Vec3 | null;
/**
 * Get the intersection of a line and a plane.
 */
export declare function planeLineSegmentIntersection(plane: Plane, line: [Vec3, Vec3], out?: Vec3): Vec3 | null;
/**
 * Get the intersection of a ray and a plane.
 * (Same as {@link planeLineIntersection} but formally handles the type)
 */
export declare function planeRayIntersection(plane: Plane, ray: Ray, out?: Vec3): Vec3 | null;
/**
 * Check if a point is in front of a plane.
 */
export declare function planePointIsInFront(plane: Plane, point: Vec3): boolean;
/**
 * Check if a point is behind a plane.
 */
export declare function planePointIsBehind(plane: Plane, point: Vec3): boolean;
/**
 * Invert a plane.
 */
export declare function planeInvert(planeIn: Plane, out?: Plane): Plane;
/**
 * Get the normal of a plane.
 */
export declare function planeNormal(plane: Plane): Vec3;
/**
 * Get the distance of a plane from the origin.
 */
export declare function planeOriginDistance(plane: Plane): number;
