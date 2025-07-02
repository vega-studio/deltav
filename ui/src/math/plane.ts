import type { Ray } from "./ray.js";
import {
  add3,
  cross3,
  dot3,
  normalize3,
  scale3,
  subtract3,
  type Vec3,
} from "./vector.js";

// A temp register for a vector result to reduce allocations.
const PLANE_VEC_R: Vec3 = [0, 0, 0];
const PLANE_VEC_R1: Vec3 = [0, 0, 0];
const PLANE_VEC_R2: Vec3 = [0, 0, 0];
const PLANE_VEC_R3: Vec3 = [0, 0, 0];

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
export function plane(normal: Vec3, distance: number, out?: Plane): Plane {
  if (out) {
    out[0] = normal;
    out[1] = distance;
    return out;
  }

  return [normal, distance];
}

/**
 * Copy a plane to a new object.
 */
export function planeCopy(planeIn: Plane, out?: Plane): Plane {
  return plane(planeIn[0], planeIn[1], out);
}

/**
 * Construct a plane representation from a non-unit direction normal and a
 * distance. If you have a normalized normal, use {@link plane} instead.
 */
export function planeFromPointAndDistance(
  point: Vec3,
  distance: number,
  out?: Plane
): Plane {
  return plane(normalize3(point, PLANE_VEC_R), distance, out);
}

/**
 * Construct a plane representation from three points.
 */
export function planeFromPoints(a: Vec3, b: Vec3, c: Vec3, out?: Plane): Plane {
  const normal = normalize3(
    cross3(
      subtract3(b, a, PLANE_VEC_R1),
      subtract3(c, a, PLANE_VEC_R2),
      PLANE_VEC_R3
    ),
    PLANE_VEC_R1
  );
  const distance = dot3(normal, a);

  return plane(normal, distance, out);
}

/**
 * Construct a plane representation from a point and a normal. The normal MUST
 * be a unit vector.
 */
export function planeFromPointAndNormal(
  point: Vec3,
  normal: Vec3,
  out?: Plane
): Plane {
  const distance = dot3(normal, point);

  return plane(normal, distance, out);
}

/**
 * Get the SIGNED distance from a point to a plane.
 */
export function planeDistance(plane: Plane, point: Vec3): number {
  return dot3(plane[0], point) - plane[1];
}

/**
 * Project a point onto a plane.
 */
export function planeProjectPoint(plane: Plane, point: Vec3, out?: Vec3): Vec3 {
  const distance = planeDistance(plane, point);
  return add3(point, scale3(plane[0], -distance, PLANE_VEC_R), out);
}

/**
 * Reflect a point across a plane.
 */
export function planeReflectPoint(plane: Plane, point: Vec3, out?: Vec3): Vec3 {
  const distance = planeDistance(plane, point);
  return add3(point, scale3(plane[0], distance, PLANE_VEC_R), out);
}

/**
 * Get the intersection of a line and a plane.
 */
export function planeLineIntersection(
  plane: Plane,
  line: [Vec3, Vec3],
  out?: Vec3
): Vec3 | null {
  const { 0: p0, 1: p1 } = line;
  const lineDir: Vec3 = subtract3(p1, p0, PLANE_VEC_R1);
  const denom: number = dot3(plane[0], lineDir);

  // Check if line and plane are parallel (denom ≈ 0) which means no intersection
  if (Math.abs(denom) < 1e-6) {
    return null;
  }

  const t = -(dot3(plane[0], p0) + plane[1]) / denom;

  return add3(p0, scale3(lineDir, t, PLANE_VEC_R2), out);
}

/**
 * Get the intersection of a line and a plane.
 */
export function planeLineSegmentIntersection(
  plane: Plane,
  line: [Vec3, Vec3],
  out?: Vec3
): Vec3 | null {
  const { 0: p0, 1: p1 } = line;
  const lineDir: Vec3 = subtract3(p1, p0, PLANE_VEC_R1);
  const denom: number = dot3(plane[0], lineDir);

  // Check if line and plane are parallel (denom ≈ 0) which means no intersection
  if (Math.abs(denom) < 1e-6) {
    return null;
  }

  const t = -(dot3(plane[0], p0) + plane[1]) / denom;

  // For line segment, ensure 0 ≤ t ≤ 1 otherwise
  if (t < 0.0 || t > 1.0) {
    return null; // Intersection is outside the segment
  }

  return add3(p0, scale3(lineDir, t, PLANE_VEC_R2), out);
}

/**
 * Get the intersection of a ray and a plane.
 * (Same as {@link planeLineIntersection} but formally handles the type)
 */
export function planeRayIntersection(
  plane: Plane,
  ray: Ray,
  out?: Vec3
): Vec3 | null {
  const { 0: p0, 1: p1 } = ray;
  const lineDir: Vec3 = subtract3(p1, p0, PLANE_VEC_R1);
  const denom: number = dot3(plane[0], lineDir);

  // Check if line and plane are parallel (denom ≈ 0) which means no intersection
  if (Math.abs(denom) < 1e-6) {
    return null;
  }

  const t = -(dot3(plane[0], p0) + plane[1]) / denom;

  return add3(p0, scale3(lineDir, t, PLANE_VEC_R2), out);
}

/**
 * Check if a point is in front of a plane.
 */
export function planePointIsInFront(plane: Plane, point: Vec3): boolean {
  return planeDistance(plane, point) > 0;
}

/**
 * Check if a point is behind a plane.
 */
export function planePointIsBehind(plane: Plane, point: Vec3): boolean {
  return planeDistance(plane, point) < 0;
}

/**
 * Invert a plane.
 */
export function planeInvert(planeIn: Plane, out?: Plane): Plane {
  return plane(planeIn[0], -planeIn[1], out);
}

/**
 * Get the normal of a plane.
 */
export function planeNormal(plane: Plane): Vec3 {
  return plane[0];
}

/**
 * Get the distance of a plane from the origin.
 */
export function planeOriginDistance(plane: Plane): number {
  return plane[1];
}
