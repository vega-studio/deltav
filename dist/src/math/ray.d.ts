import { Vec3 } from "../math/vector";
export declare type Ray = [Vec3, Vec3];
export declare function rayToLocation(ray: Ray, distance: number, out?: Vec3): Vec3;
export declare function rayFromPoints(origin: Vec3, destination: Vec3, out?: Ray): Ray;
