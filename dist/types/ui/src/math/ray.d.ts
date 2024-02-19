import { Vec3 } from "../math/vector";
/**
 * Represents a ray starting from some origin eminating in a direction. [Origin,
 * Direction]. The direction is a unit vector so:
 *
 * add3(Origin, scale3(Direction, Distance)) is how you would use the ray to
 * find a location in a given direction.
 */
export type Ray = [Vec3, Vec3];
/**
 * Create a ray structur from an origin and a direction.
 */
export declare function ray(origin: Vec3, direction: Vec3): Ray;
/**
 * Provides a location based on a ray and a given distance away
 */
export declare function rayToLocation(ray: Ray, distance: number, out?: Vec3): Vec3;
/**
 * Generates a ray from two points. Ray starts at 'origin' and points toward
 * 'destination'
 */
export declare function rayFromPoints(origin: Vec3, destination: Vec3, out?: Ray): Ray;
