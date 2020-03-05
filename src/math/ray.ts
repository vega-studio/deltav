import {
  add3,
  copy3,
  normalize3,
  scale3,
  subtract3,
  Vec3
} from "../math/vector";

/**
 * Represents a ray starting from some origin eminating in a direction.
 * [Origin, Direction]. The direction is a unit vector so:
 *
 * add3(Origin, scale3(Direction, Distance)) is how you would use the ray to find a location in a given direction.
 */
export type Ray = [Vec3, Vec3];

/**
 * Provides a location based on a ray and a given distance away
 */
export function rayToLocation(ray: Ray, distance: number, out?: Vec3): Vec3 {
  out = out || [0, 0, 0];

  return add3(ray[0], scale3(ray[1], distance), out);
}

/**
 * Generates a ray from two points. Ray starts at 'origin' and points toward 'destination'
 */
export function rayFromPoints(origin: Vec3, destination: Vec3, out?: Ray): Ray {
  out = out || [
    [0, 0, 0],
    [0, 0, 0]
  ];
  copy3(origin, out[0]);
  normalize3(subtract3(destination, origin), out[1]);

  return out;
}
