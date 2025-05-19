import {
  add3,
  copy3,
  normalize3,
  type ReadonlyVec3Compat,
  scale3,
  subtract3,
  Vec3,
} from "../math/vector.js";

/**
 * Represents a ray starting from some origin eminating in a direction. [Origin,
 * Direction]. The direction is a unit vector so:
 *
 * add3(Origin, scale3(Direction, Distance)) is how you would use the ray to
 * find a location in a given direction.
 */
export type Ray = [Vec3, Vec3];

/**
 * Represents a ray starting from some origin eminating in a direction. [Origin,
 * Direction]. The direction is a unit vector so:
 *
 * add3(Origin, scale3(Direction, Distance)) is how you would use the ray to
 * find a location in a given direction.
 */
export type ReadonlyRay = Readonly<Ray>;

/**
 * Create a ray structur from an origin and a direction.
 */
export function ray(origin: Vec3, direction: Vec3): Ray {
  return [origin, direction];
}

/**
 * Provides a location based on a ray and a given distance away
 */
export function rayToLocation(
  ray: ReadonlyRay,
  distance: number,
  out?: Vec3
): Vec3 {
  out = out || [0, 0, 0];

  return add3(ray[0], scale3(ray[1], distance), out);
}

/**
 * Generates a ray from two points. Ray starts at 'origin' and points toward
 * 'destination'
 */
export function rayFromPoints(
  origin: ReadonlyVec3Compat,
  destination: ReadonlyVec3Compat,
  out?: Ray
): Ray {
  out = out || [
    [0, 0, 0],
    [0, 0, 0],
  ];
  copy3(origin, out[0]);
  normalize3(subtract3(destination, origin), out[1]);

  return out;
}
