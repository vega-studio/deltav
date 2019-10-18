import { Vec2, Vec3, Vec3Compat, Vec4 } from "./vector";
export declare type Mat2x2 = [number, number, number, number];
export declare type Mat3x3 = [number, number, number, number, number, number, number, number, number];
export declare type Mat4x4 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
export declare const M200 = 0;
export declare const M201 = 1;
export declare const M210 = 2;
export declare const M211 = 3;
export declare const M300 = 0;
export declare const M301 = 1;
export declare const M302 = 2;
export declare const M310 = 3;
export declare const M311 = 4;
export declare const M312 = 5;
export declare const M320 = 6;
export declare const M321 = 7;
export declare const M322 = 8;
export declare const M400 = 0;
export declare const M401 = 1;
export declare const M402 = 2;
export declare const M403 = 3;
export declare const M410 = 4;
export declare const M411 = 5;
export declare const M412 = 6;
export declare const M413 = 7;
export declare const M420 = 8;
export declare const M421 = 9;
export declare const M422 = 10;
export declare const M423 = 11;
export declare const M430 = 12;
export declare const M431 = 13;
export declare const M432 = 14;
export declare const M433 = 15;
export declare function apply2x2(m: Mat2x2 | undefined, m00: number, m01: number, m10: number, m11: number): [number, number, number, number];
export declare function apply3x3(m: Mat3x3 | undefined, m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): [number, number, number, number, number, number, number, number, number];
export declare function apply4x4(m: Mat4x4 | undefined, m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
export declare function determinant2x2(mat: Mat2x2): number;
export declare function determinant3x3(mat: Mat3x3): number;
export declare function determinant4x4(mat: Mat4x4): number;
export declare function affineInverse2x2(mat: Mat2x2, out?: Mat2x2): Mat2x2 | null;
export declare function affineInverse3x3(mat: Mat3x3, out?: Mat3x3): Mat3x3 | null;
export declare function affineInverse4x4(mat: Mat4x4, out?: Mat4x4): Mat4x4 | null;
export declare function multiplyScalar2x2(mat: Mat2x2, scale: number, out?: Mat2x2): Mat2x2;
export declare function multiplyScalar3x3(mat: Mat3x3, scale: number, out?: Mat3x3): Mat3x3;
export declare function multiplyScalar4x4(mat: Mat4x4, scale: number, out?: Mat4x4): Mat4x4;
export declare function identity2(out?: Mat2x2): Mat2x2;
export declare function identity3(out?: Mat3x3): Mat3x3;
export declare function identity4(out?: Mat4x4): Mat4x4;
export declare function multiply2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2;
export declare function multiply3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3;
export declare function multiply4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4;
export declare function concat4x4(out?: Mat4x4, ...m: Mat4x4[]): Mat4x4;
export declare function add2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2;
export declare function add3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3;
export declare function add4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4;
export declare function subtract2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2;
export declare function subtract3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3;
export declare function subtract4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4;
export declare function Hadamard2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2;
export declare function Hadamard3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3;
export declare function Hadamard4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4;
export declare function transpose2x2(mat: Mat2x2, out?: Mat2x2): Mat2x2;
export declare function transpose3x3(mat: Mat3x3, out?: Mat3x3): Mat3x3;
export declare function transpose4x4(mat: Mat4x4, out?: Mat4x4): Mat4x4;
export declare function shearX2x2(radians: number, out?: Mat2x2): Mat2x2;
export declare function shearY2x2(radians: number, out?: Mat2x2): Mat2x2;
export declare function shearX4x4(radians: number, out?: Mat4x4): Mat4x4;
export declare function shearY4x4(radians: number, out?: Mat4x4): Mat4x4;
export declare function shearZ4x4(radians: number, out?: Mat4x4): Mat4x4;
export declare function transform2(m: Mat2x2, v: Vec2, out?: Vec2): Vec2;
export declare function transform3(m: Mat3x3, v: Vec3, out?: Vec3): Vec3;
export declare function transform3as4(m: Mat4x4, v: Vec3, out?: Vec4): Vec4;
export declare function transform4(m: Mat4x4, v: Vec4, out?: Vec4): Vec4;
export declare function toString2x2(mat: Mat2x2): string;
export declare function toString3x3(mat: Mat3x3): string;
export declare function toString4x4(mat: Mat4x4): string;
export declare function rotation4x4(x: number, y: number, z: number, out?: Mat4x4): [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
export declare function rotation4x4by3(v: Vec3, out?: Mat4x4): [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
export declare function scale4x4by3(p: Vec3Compat, out?: Mat4x4): Mat4x4;
export declare function scale4x4(x: number, y: number, z: number, out?: Mat4x4): Mat4x4;
export declare function translation4x4by3(t: Vec3Compat, out?: Mat4x4): Mat4x4;
export declare function translation4x4(x: number, y: number, z: number, out?: Mat4x4): Mat4x4;
export declare function perspectiveFrustum4x4(n: number, f: number, l: number, r: number, t: number, b: number, out?: Mat4x4): [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
export declare function perspective4x4(fovRadians: number, width: number, height: number, near: number, far: number, out?: Mat4x4): Mat4x4;
export declare function perspectiveFOVY4x4(fovRadians: number, width: number, height: number, near: number, far: number, out?: Mat4x4): Mat4x4;
export declare function orthographic4x4(left: number, right: number, bottom: number, top: number, near: number, far: number, out?: Mat4x4): Mat4x4;
export declare function projectToScreen(proj: Mat4x4, point: Vec4, width: number, height: number, out?: Vec4): Vec4;
export declare function project3As4ToScreen(proj: Mat4x4, point: Vec3Compat, width: number, height: number, out?: Vec4): [number, number, number, number];
export declare function compare2x2(m1: Mat2x2, m2: Mat2x2): boolean;
export declare function compare3x3(m1: Mat3x3, m2: Mat3x3): boolean;
export declare function compare4x4(m1: Mat4x4, m2: Mat4x4): boolean;