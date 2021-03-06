import { Vec3Compat } from "./vector";
export declare type Mat2x2 = [number, number, number, number];
export declare type Mat3x3 = [number, number, number, number, number, number, number, number, number];
export declare type Mat4x4 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
export declare function determinant2x2(mat: Mat2x2): number;
export declare function determinant3x3(mat: Mat3x3): number;
export declare function determinant4x4(mat: Mat4x4): number;
export declare function affineInverse2x2(mat: Mat2x2): Mat2x2 | null;
export declare function affineInverse3x3(mat: Mat3x3): Mat3x3 | null;
export declare function affineInverse4x4(mat: Mat4x4): Mat4x4 | null;
export declare function scale2x2(mat: Mat2x2, scale: number): Mat2x2;
export declare function scale3x3(mat: Mat3x3, scale: number): Mat3x3;
export declare function multiplyScalar4x4(mat: Mat4x4, scale: number): Mat4x4;
export declare function identity2(): Mat2x2;
export declare function identity3(): Mat3x3;
export declare function identity4(): Mat4x4;
export declare function multiply2x2(left: Mat2x2, right: Mat2x2): Mat2x2;
export declare function multiply3x3(left: Mat3x3, right: Mat3x3): Mat3x3;
export declare function multiply4x4(left: Mat4x4, right: Mat4x4): Mat4x4;
export declare function add2x2(left: Mat2x2, right: Mat2x2): Mat2x2;
export declare function add3x3(left: Mat3x3, right: Mat3x3): Mat3x3;
export declare function add4x4(left: Mat4x4, right: Mat4x4): Mat4x4;
export declare function subtract2x2(left: Mat2x2, right: Mat2x2): Mat2x2;
export declare function subtract3x3(left: Mat3x3, right: Mat3x3): Mat3x3;
export declare function subtract4x4(left: Mat4x4, right: Mat4x4): Mat4x4;
export declare function Hadamard2x2(left: Mat2x2, right: Mat2x2): Mat2x2;
export declare function Hadamard3x3(left: Mat3x3, right: Mat3x3): Mat3x3;
export declare function Hadamard4x4(left: Mat4x4, right: Mat4x4): Mat4x4;
export declare function transpose2x2(mat: Mat2x2): Mat2x2;
export declare function transpose3x3(mat: Mat3x3): Mat3x3;
export declare function transpose4x4(mat: Mat4x4): Mat4x4;
export declare function toString4x4(mat: Mat4x4): string;
export declare function scale4x4by3(p: Vec3Compat): Mat4x4;
export declare function scale4x4(x: number, y: number, z: number): Mat4x4;
export declare function translation4x4by3(t: Vec3Compat): Mat4x4;
export declare function translation4x4(x: number, y: number, z: number): Mat4x4;
export declare function perspective4x4(fovRadians: number, aspectRatio: number, near: number, far: number): Mat4x4;
export declare function orthographic4x4(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4x4;
