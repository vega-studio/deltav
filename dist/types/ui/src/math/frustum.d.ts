import type { Mat4x4 } from "./matrix.js";
import { type Plane } from "./plane.js";
import type { Vec3 } from "./vector.js";
/**
 * Minimal representation of a frustum.
 * The planes are ordered as follows:
 * - left
 * - right
 * - bottom
 * - top
 * - near
 */
export type Frustum = [Plane, Plane, Plane, Plane, Plane, Plane];
/**
 * Extracts the 6 planes of the frustum from the view projection matrix.
 * The planes are in world space.
 */
export declare function frustumFromViewProjection(m: number[], out?: Frustum): Frustum;
/**
 * Extracts the 8 points of the frustum from the inverse view projection matrix.
 * The points are in world space.
 */
export declare function frustumCornersFromInvViewProjection(invViewProj: Mat4x4, out?: Vec3[]): Vec3[];
