import { type ReadonlyVec2Compat, type ReadonlyVec3Compat, Vec2, Vec3, Vec3Compat, Vec4 } from "./vector";
/**
 * This represents a matrix with enough elements to define a 2x2 matrix. This is
 * specifically used to express a matrix in a linear buffer intentionally to
 * reduce allocations and indexing into the array.
 *
 * Use the indexing constant M2<row><column> or M2<Y><X> to access the elements
 * based on column and row. For example, M211 would be the value at row 1
 * (second row) and column 2 (third column).
 */
export type Mat2x2 = [
    number,
    number,
    number,
    number
];
/**
 * This represents a matrix with enough elements to define a 2x2 matrix. This is
 * specifically used to express a matrix in a linear buffer intentionally to
 * reduce allocations and indexing into the array.
 *
 * Use the indexing constant M2<row><column> or M2<Y><X> to access the elements
 * based on column and row. For example, M211 would be the value at row 1
 * (second row) and column 2 (third column).
 */
export type ReadonlyMat2x2 = Readonly<Mat2x2>;
/**
 * This represents a matrix with enough elements to define a 3x3 matrix. This is
 * specifically used to express a matrix in a linear buffer intentionally to
 * reduce allocations and indexing into the array.
 *
 * Use the indexing constant M3<row><column> or M3<Y><X> to access the elements
 * based on column and row. For example, M321 would be the value at row 1
 * (second row) and column 2 (third column).
 */
export type Mat3x3 = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
/**
 * This represents a matrix with enough elements to define a 3x3 matrix. This is
 * specifically used to express a matrix in a linear buffer intentionally to
 * reduce allocations and indexing into the array.
 *
 * Use the indexing constant M3<row><column> or M3<Y><X> to access the elements
 * based on column and row. For example, M321 would be the value at row 1
 * (second row) and column 2 (third column).
 */
export type ReadonlyMat3x3 = Readonly<Mat3x3>;
/**
 * This represents a matrix with enough elements to define a 4x4 matrix. This is
 * specifically used to express a matrix in a linear buffer intentionally to
 * reduce allocations and indexing into the array.
 *
 * Use the indexing constant M4<row><column> or M4<Y><X> to access the elements
 * based on column and row. For example, M421 would be the value at row 2
 * (third row) and column 1 (second column).
 */
export type Mat4x4 = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
/**
 * This represents a matrix with enough elements to define a 4x4 matrix. This is
 * specifically used to express a matrix in a linear buffer intentionally to
 * reduce allocations and indexing into the array.
 *
 * Use the indexing constant M4<row><column> or M4<Y><X> to access the elements
 * based on column and row. For example, M421 would be the value at row 2
 * (third row) and column 1 (second column).
 */
export type ReadonlyMat4x4 = Readonly<Mat4x4>;
/**
 * This allows a number buffer with elements greater than 4 to be used as the
 * buffer for a Mat2x2.
 *
 * DO NOT ASSUME: DO not use a larger matrix and expect the elements to be used
 * based on meaningful mathematical properties. For instance using a 4x4 matrix
 * will NOT cause this type to be understood as the top left elements of that
 * array.
 *
 * Your expectation will be:
 *
 * 4x4 =
 * [a, b, c, d,]
 * [e, f, g, h,]
 * [i, j, k, l,]
 * [m, n, o, p,]
 *
 * 2x2 =
 * [a, b]
 * [e, f]
 *
 * That assumption is WRONG. You will instead see your mat2x2 play out this way:
 *
 * 2x2=
 * [a, b]
 * [c, d]
 *
 * Which is the linear buffer interpretation of a Mat4x4 type.
 */
export type Mat2x2Compat = Mat2x2 | Mat3x3 | Mat4x4;
/**
 * This allows a number buffer with elements greater than 4 to be used as the
 * buffer for a Mat2x2.
 *
 * DO NOT ASSUME: DO not use a larger matrix and expect the elements to be used
 * based on meaningful mathematical properties. For instance using a 4x4 matrix
 * will NOT cause this type to be understood as the top left elements of that
 * array.
 *
 * Your expectation will be:
 *
 * 4x4 =
 * [a, b, c, d,]
 * [e, f, g, h,]
 * [i, j, k, l,]
 * [m, n, o, p,]
 *
 * 2x2 =
 * [a, b]
 * [e, f]
 *
 * That assumption is WRONG. You will instead see your mat2x2 play out this way:
 *
 * 2x2=
 * [a, b]
 * [c, d]
 *
 * Which is the linear buffer interpretation of a Mat4x4 type.
 */
export type ReadonlyMat2x2Compat = Readonly<Mat2x2Compat>;
/**
 * This allows a number buffer with elements greater than 9 to be used as the
 * buffer for a Mat3x3.
 *
 * DO NOT ASSUME: DO not use a larger matrix and expect the elements to be used
 * based on meaningful mathematical properties. For instance using a 4x4 matrix
 * will NOT cause this type to be understood as the top left elements of that
 * array.
 *
 * Your expectation will be:
 *
 * 4x4 =
 * [a, b, c, d,]
 * [e, f, g, h,]
 * [i, j, k, l,]
 * [m, n, o, p,]
 *
 * 3x3 =
 * [a, b, c]
 * [e, f, g]
 * [i, j, k]
 *
 * That assumption is WRONG. You will instead see your mat3x3 play out this way:
 *
 * 3x3=
 * [a, b, c]
 * [d, e, f]
 * [g, h, i]
 *
 * Which is the linear buffer interpretation of a Mat4x4 type.
 */
export type Mat3x3Compat = Mat3x3 | Mat4x4;
/**
 * This allows a number buffer with elements greater than 9 to be used as the
 * buffer for a Mat3x3.
 *
 * DO NOT ASSUME: DO not use a larger matrix and expect the elements to be used
 * based on meaningful mathematical properties. For instance using a 4x4 matrix
 * will NOT cause this type to be understood as the top left elements of that
 * array.
 *
 * Your expectation will be:
 *
 * 4x4 =
 * [a, b, c, d,]
 * [e, f, g, h,]
 * [i, j, k, l,]
 * [m, n, o, p,]
 *
 * 3x3 =
 * [a, b, c]
 * [e, f, g]
 * [i, j, k]
 *
 * That assumption is WRONG. You will instead see your mat3x3 play out this way:
 *
 * 3x3=
 * [a, b, c]
 * [d, e, f]
 * [g, h, i]
 *
 * Which is the linear buffer interpretation of a Mat4x4 type.
 */
export type ReadonlyMat3x3Compat = Readonly<Mat3x3Compat>;
/** Mat2x2 row column index for convenience M2<row><column> or M2<Y><X> */
export declare const M200 = 0;
/** Mat2x2 row column index for convenience M2<row><column> or M2<Y><X> */
export declare const M201 = 1;
/** Mat2x2 row column index for convenience M2<row><column> or M2<Y><X> */
export declare const M210 = 2;
/** Mat2x2 row column index for convenience M2<row><column> or M2<Y><X> */
export declare const M211 = 3;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export declare const M300 = 0;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export declare const M301 = 1;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export declare const M302 = 2;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export declare const M310 = 3;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export declare const M311 = 4;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export declare const M312 = 5;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export declare const M320 = 6;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export declare const M321 = 7;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export declare const M322 = 8;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M400 = 0;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M401 = 1;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M402 = 2;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M403 = 3;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M410 = 4;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M411 = 5;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M412 = 6;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M413 = 7;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M420 = 8;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M421 = 9;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M422 = 10;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M423 = 11;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M430 = 12;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M431 = 13;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M432 = 14;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export declare const M433 = 15;
/**
 * Temp Matrix 3x3 registers. Can be used for intermediate operations. These
 * are EXTREMELY temporary and volatile for use. Use with EXTREME caution and
 * don't expect them to retain any exepcted value.
 *
 * These are here more for
 * nesting operations and providing the nested operation something to use so it
 * doesn't need to allocate memory to operate.
 *
 * If you use too many registers, you can get weird behavior as some operations
 * may use some registers as well.
 *
 * Again, this is EXTREMELY advanced useage and should NOT be your first
 * inclination to utilize.
 */
export declare const M3R: Mat3x3[];
/**
 * Temp Matrix 4x4 registers. Can be used for intermediate operations. These
 * are EXTREMELY temporary and volatile for use. Use with EXTREME caution and
 * don't expect them to retain any exepcted value.
 *
 * These are here more for
 * nesting operations and providing the nested operation something to use so it
 * doesn't need to allocate memory to operate.
 *
 * If you use too many registers, you can get weird behavior as some operations
 * may use some registers as well.
 *
 * Again, this is EXTREMELY advanced useage and should NOT be your first
 * inclination to utilize.
 */
export declare const M4R: Mat4x4[];
/**
 * It's often much faster to apply values to an existing matrix than to declare
 * a new matrix inline. But it can be annoying and bulky to write the complete
 * array to value sequence to perform such an application. Thus, this method
 * exists to make the process a little more bearable.
 */
export declare function apply2x2(m: Mat2x2 | undefined, m00: number, m01: number, m10: number, m11: number): Mat2x2;
/**
 * It's often much faster to apply values to an existing matrix than to declare
 * a new matrix inline. But it can be annoying and bulky to write the complete
 * array to value sequence to perform such an application. Thus, this method
 * exists to make the process a little more bearable.
 */
export declare function apply3x3(m: Mat3x3 | undefined, m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): Mat3x3;
/**
 * It's often much faster to apply values to an existing matrix than to declare
 * a new matrix inline. But it can be annoying and bulky to write the complete
 * array to value sequence to perform such an application. Thus, this method
 * exists to make the process a little more bearable.
 */
export declare function apply4x4(m: Mat4x4 | undefined, m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): Mat4x4;
/**
 * Determinant value of a 2x2 matrix
 *
 * 3 OPS
 */
export declare function determinant2x2(mat: ReadonlyMat2x2): number;
/**
 * Determinant value of a 3x3 matrix
 *
 * 17 OPS
 */
export declare function determinant3x3(mat: ReadonlyMat3x3): number;
/**
 * Determinant value of a 4x4 matrix
 *
 * 75 OPS, 4 temp Mat3x3, 8 method calls
 */
export declare function determinant4x4(mat: ReadonlyMat4x4): number;
/**
 * Calculates the inverse of ONLY purely affine transforms. A general inverse is
 * considered too computationally expensive and alternative strategies should be
 * considered.
 *
 * 9 OPS, 1 method call
 */
export declare function affineInverse2x2(mat: ReadonlyMat2x2, out?: Mat2x2): Mat2x2 | null;
/**
 * Calculates the inverse of ONLY purely affine transforms. A general inverse is
 * considered too computationally expensive and alternative strategies should be
 * considered.
 *
 * 56 OPS, 10 method calls
 */
export declare function affineInverse3x3(mat: ReadonlyMat3x3, out?: Mat3x3): Mat3x3 | null;
/**
 * Calculates the inverse of ONLY purely affine transforms. A general inverse is
 * considered too computationally expensive and alternative strategies should be
 * considered.
 *
 * 164 OPS + 3 temp 3x3 uses + 13 method calls
 */
export declare function affineInverse4x4(mat: ReadonlyMat4x4, out?: Mat4x4): Mat4x4 | null;
/**
 * 4 OPS
 */
export declare function multiplyScalar2x2(mat: ReadonlyMat2x2, scale: number, out?: Mat2x2): Mat2x2;
/**
 * 9 OPS
 */
export declare function multiplyScalar3x3(mat: ReadonlyMat3x3, scale: number, out?: Mat3x3): Mat3x3;
/**
 * 16 OPS
 */
export declare function multiplyScalar4x4(mat: ReadonlyMat4x4, scale: number, out?: Mat4x4): Mat4x4;
/**
 * Convert or produce a 2x2 identity matrix
 */
export declare function identity2(out?: Mat2x2): Mat2x2;
/**
 * Convert or produce a 3x3 identity matrix
 */
export declare function identity3(out?: Mat3x3): Mat3x3;
/**
 * Convert or produce a 4x4 identity matrix
 */
export declare function identity4(out?: Mat4x4): Mat4x4;
/**
 * Concat two 2x2 matrices. T = left x right
 * 12 OPS
 */
export declare function multiply2x2(left: ReadonlyMat2x2, right: ReadonlyMat2x2, out?: Mat2x2): Mat2x2;
/**
 * Concat two 3x3 matrices. T = left x right
 * 45 OPS
 */
export declare function multiply3x3(left: ReadonlyMat3x3, right: ReadonlyMat3x3, out?: Mat3x3): Mat3x3;
/**
 * Concat two 4x4 matrices. T = left x right
 * 112 OPS
 */
export declare function multiply4x4(left: ReadonlyMat4x4, right: ReadonlyMat4x4, out?: Mat4x4): Mat4x4;
/**
 * Concat a list of matrices in this order:
 * concat4x4(A, B, C, D, E, ..., N);
 * T = A * B * C * E * ... * N
 */
export declare function concat4x4(out?: Mat4x4, ...m: ReadonlyMat4x4[]): Mat4x4;
/**
 * Add each element by each element in two matrices
 * 4 OPS
 */
export declare function add2x2(left: ReadonlyMat2x2, right: ReadonlyMat2x2, out?: Mat2x2): Mat2x2;
/**
 * Add each element by each element in two matrices
 * 9 OPS
 */
export declare function add3x3(left: ReadonlyMat3x3, right: ReadonlyMat3x3, out?: Mat3x3): Mat3x3;
/**
 * Add each element by each element in two matrices
 * 16 OPS
 */
export declare function add4x4(left: ReadonlyMat4x4, right: ReadonlyMat4x4, out?: Mat4x4): Mat4x4;
/**
 * Subtract each element by each element in two matrices
 * 4 OPS
 */
export declare function subtract2x2(left: ReadonlyMat2x2, right: ReadonlyMat2x2, out?: Mat2x2): Mat2x2;
/**
 * Subtract each element by each element in two matrices
 * 9 OPS
 */
export declare function subtract3x3(left: ReadonlyMat3x3, right: ReadonlyMat3x3, out?: Mat3x3): Mat3x3;
/**
 * Subtract each element by each element in two matrices
 * 16 OPS
 */
export declare function subtract4x4(left: ReadonlyMat4x4, right: ReadonlyMat4x4, out?: Mat4x4): Mat4x4;
/**
 * Hadamard product of two matrices. This is essentially multiplying each
 * element by each element between the two. 4 OPS
 */
export declare function Hadamard2x2(left: ReadonlyMat2x2, right: ReadonlyMat2x2, out?: Mat2x2): Mat2x2;
/**
 * Hadamard product of two matrices. This is essentially multiplying each
 * element by each element between the two. 9 OPS
 */
export declare function Hadamard3x3(left: ReadonlyMat3x3, right: ReadonlyMat3x3, out?: Mat3x3): Mat3x3;
/**
 * Hadamard product of two matrices. This is essentially multiplying each
 * element by each element between the two. 16 OPS
 */
export declare function Hadamard4x4(left: ReadonlyMat4x4, right: ReadonlyMat4x4, out?: Mat4x4): Mat4x4;
/**
 * Transposes a 2x2 matrix:
 * [a, b] -> [a, c]
 * [c, d]    [b, d]
 */
export declare function transpose2x2(mat: ReadonlyMat2x2, out?: Mat2x2): Mat2x2;
/**
 * Transposes a 3x3 matrix:
 * [a, b, c] -> [a, d, g]
 * [d, e, f]    [b, e, h]
 * [g, h, i]    [c, f, i]
 */
export declare function transpose3x3(mat: ReadonlyMat3x3, out?: Mat3x3): Mat3x3;
/**
 * Transposes a 4x4 matrix:
 * [a, b, c, d] -> [a, e, i, m]
 * [e, f, g, h]    [b, f, j, n]
 * [i, j, k, l]    [c, g, k, o]
 * [m, n, o, p]    [d, h, l, p]
 */
export declare function transpose4x4(mat: ReadonlyMat4x4, out?: Mat4x4): Mat4x4;
/**
 * This makes a shear 2d matrix that shears parallel to the x-axis. The radians
 * should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and
 * beyond.
 */
export declare function shearX2x2(radians: number, out?: Mat2x2): Mat2x2;
/**
 * This makes a shear 2d matrix that shears parallel to the y-axis. The radians
 * should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and
 * beyond.
 */
export declare function shearY2x2(radians: number, out?: Mat2x2): Mat2x2;
/**
 * This makes a shear 3d matrix that shears parallel to the x-axis. The radians
 * should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and
 * beyond.
 */
export declare function shearX4x4(alongY: number, alongZ: number, out?: Mat4x4): Mat4x4;
/**
 * This makes a shear 3d matrix that shears parallel to the y-axis. The radians
 * should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and
 * beyond.
 */
export declare function shearY4x4(alongX: number, alongZ: number, out?: Mat4x4): Mat4x4;
/**
 * This makes a shear 3d matrix that shears parallel to the z-axis. The radians
 * should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and
 * beyond.
 */
export declare function shearZ4x4(alongX: number, alongY: number, out?: Mat4x4): Mat4x4;
/**
 * Transforms a Vec2 by a matrix
 */
export declare function transform2(m: ReadonlyMat2x2, v: Vec2, out?: Vec2): Vec2;
/**
 * Transforms a Vec3 by a matrix.
 */
export declare function transform3(m: ReadonlyMat3x3, v: Vec3, out?: Vec3): Vec3;
/**
 * Transforms a Vec3 by the provided matrix but treats the Vec3 as a
 * [x, y, z, 1] Vec4.
 */
export declare function transform3as4(m: ReadonlyMat4x4, v: Vec3, out?: Vec4): Vec4;
/**
 * Transforms a vector by the provided matrix
 */
export declare function transform4(m: ReadonlyMat4x4, v: Vec4, out?: Vec4): Vec4;
/**
 * Converts a 2x2 to a pretty print string
 */
export declare function toString2x2(mat: ReadonlyMat2x2): string;
/**
 * Converts a 3x3 to a pretty print string
 */
export declare function toString3x3(mat: ReadonlyMat3x3): string;
/**
 * Converts a 4x4 to a pretty print string
 */
export declare function toString4x4(mat: ReadonlyMat4x4): string;
/**
 * Makes a 2x2 rotation matrix based on a single rotational value. Good for
 * rotating 2 dimensional values with as little information and operations as
 * possible.
 */
export declare function rotation2x2(radians: number, out?: Mat2x2): Mat2x2;
/**
 * We only support Euler X then Y then Z rotations. Specify the rotation values
 * for each axis to receive a matrix that will perform rotations by that amount
 * in that order.
 *
 * All of these rotations follow the right hand rule. If you need a different
 * mixture of ordered rotations, then consider simply concatenating 3 rotations
 * like so (for a ZYZ example):
 *
 * multiply4x4(rotation4x4(0, 0, Z), multiply4x4(rotation4x4(0, Y, 0),
 *   rotation4x4(0, 0, Z),
 *   )
 * );
 *
 * This will create a ZYZ rotation (with the right handed rule). If you need the
 * operations to be left handed you will have to use the transpose and do a
 * little extra math to make it happen or hand craft your own method for
 * generating rotational matrices.
 */
export declare function rotation4x4(x: number, y: number, z: number, out?: Mat4x4): Mat4x4;
/**
 * We only support Euler X then Y then Z rotations. Specify the rotation values
 * for each axis to receive a matrix that will perform rotations by that amount
 * in that order.
 */
export declare function rotation4x4by3(v: Vec3, out?: Mat4x4): Mat4x4;
/**
 * Creates a scaling matrix from a vector
 */
export declare function scale4x4by3(p: Vec3Compat, out?: Mat4x4): Mat4x4;
/**
 * Creates a 4x4 scaling matrix
 */
export declare function scale4x4(x: number, y: number, z: number, out?: Mat4x4): Mat4x4;
/**
 * Creates a translation Matrix from a vector
 */
export declare function translation4x4by3(t: Vec3Compat, out?: Mat4x4): Mat4x4;
/**
 * Creates a translation Matrix
 */
export declare function translation4x4(x: number, y: number, z: number, out?: Mat4x4): Mat4x4;
/**
 * Produces a perspective matrix for a given frustum:
 * n: near,
 * f: far,
 * l: left,
 * r: right,
 * b: bottom,
 * t: top
 */
export declare function perspectiveFrustum4x4(n: number, f: number, l: number, r: number, t: number, b: number, out?: Mat4x4): Mat4x4;
/**
 * Generate a projection matrix with perspective.
 * The provided FOV is for the horizontal FOV.
 */
export declare function perspective4x4(fovRadians: number, width: number, height: number, near: number, far: number, out?: Mat4x4): Mat4x4;
/**
 * Generate a projection matrix with perspective.
 * The provided FOV is for the vertical FOV.
 */
export declare function perspectiveFOVY4x4(fovRadians: number, width: number, height: number, near: number, far: number, out?: Mat4x4): Mat4x4;
/**
 * Generate a projection matrix with no perspective. Useful for flat 2D or
 * isometric rendering or other similar special case renderings.
 */
export declare function orthographic4x4(left: number, right: number, bottom: number, top: number, near: number, far: number, out?: Mat4x4): Mat4x4;
/**
 * Performs the operations to project a Vec4 to screen coordinates using a
 * projection matrix. The x and y of the out Vec4 will be the final projection,
 * w should be resolved to 1, and the z coordinate will be in homogenous
 * coordinates where -1 <= z <= 1 iff z lies within frustum near and far planes.
 */
export declare function projectToScreen(proj: ReadonlyMat4x4, point: Vec4, width: number, height: number, out?: Vec4): Vec4;
/**
 * Performs the operations to project a Vec3 to screen coordinates as a Vec4
 * with a w of value 1. using a projection matrix. The x and y of the out Vec4
 * will be the final projection, w should be resolved to 1, and the z coordinate
 * will be in homogenous coordinates where -1 <= z <= 1 iff z lies within
 * frustum near and far planes.
 */
export declare function project3As4ToScreen(proj: ReadonlyMat4x4, point: Vec3Compat, width: number, height: number, out?: Vec4): Vec4;
/**
 * Determines equality of two 2x2 matrices
 */
export declare function compare2x2(m1: ReadonlyMat2x2, m2: ReadonlyMat2x2): boolean;
/**
 * Determines equality of two 3x3 matrices.
 */
export declare function compare3x3(m1: ReadonlyMat3x3, m2: ReadonlyMat3x3): boolean;
/**
 * Determines equality of two 4x4 matrices.
 */
export declare function compare4x4(m1: ReadonlyMat4x4, m2: ReadonlyMat4x4): boolean;
/**
 * Copies a Mat2x2 into a new storage object
 */
export declare function copy2x2(m: ReadonlyMat2x2): Mat2x2;
/**
 * Copies a Mat3x3 into a new storage object
 */
export declare function copy3x3(m: ReadonlyMat3x3): Mat3x3;
/**
 * Copies a Mat4x4 into a new storage object
 */
export declare function copy4x4(m: ReadonlyMat4x4, out?: Mat4x4): Mat4x4;
/**
 * This performs the order multiplication of SRT in reverse as TRS.
 * This is a MAX speed SRT Matrix generation method that optimizing the
 * computations needed to create an SRT from separate smaller components.
 *
 * NOTE: The rotation is injected
 *
 * This optimization was computed utilizing wolfram alpha:
 * a t                 | b u                 | c v                 | 0
 * d t                 | e u                 | f v                 | 0
 * g t                 | h u                 | i v                 | 0
 * t (a x + d y + g z) | u (b x + e y + h z) | v (c x + f y + i z) | 1
 */
export declare function TRS4x4(scale: Vec3, rotation: ReadonlyMat3x3, translation: Vec3, out?: Mat4x4): void;
/**
 * This is a MAX speed TRS Matrix generation method that optimizing the
 * computations needed to create an SRT from separate smaller components.
 *
 * NOTE: The rotation is injected
 *
 * This optimization was computed utilizing wolfram alpha:
 * a t | b t | c t | 0
 * d u | e u | f u | 0
 * g v | h v | i v | 0
 * x   | y   | z   | 1)
 */
export declare function SRT4x4(scale: ReadonlyVec3Compat, rotation: ReadonlyMat3x3, translation: ReadonlyVec3Compat, out?: Mat4x4): void;
/**
 * This performs the order multiplication of SRT in reverse as TRS.
 *
 * This is a MAX speed SRT Matrix generation method that optimizing the
 * computations needed to create an SRT from separate smaller components.
 *
 * NOTE: The rotation is injected
 *
 * This optimization was computed utilizing wolfram alpha:
 * a t           | b u           | 0 | 0
 * c t           | d u           | 0 | 0
 * 0             | 0             | 0 | 0
 * t (a x + c y) | u (b x + d y) | 0 | 1
 */
export declare function TRS4x4_2D(scale: ReadonlyVec2Compat, rotation: ReadonlyMat2x2, translation: ReadonlyVec2Compat, out?: Mat4x4): void;
/**
 * This performs the order multiplication of SRT in reverse as TRS.
 *
 * This is a MAX speed SRT Matrix generation method that optimizing the
 * computations needed to create an SRT from separate smaller components.
 *
 * This specifically creates a full transform for 3D computations by creating
 * the appropriate 4x4 that properly represents the complete transform to world
 * space.
 *
 * NOTE: The rotation is injected
 *
 * This optimization was computed utilizing wolfram alpha:
 * a t | b t | 0 | 0
 * c u | d u | 0 | 0
 * 0   | 0   | 1 | 0
 * x   | y   | 0 | 1
 */
export declare function SRT4x4_2D(scale: ReadonlyVec2Compat, rotation: ReadonlyMat2x2, translation: ReadonlyVec2Compat, out?: Mat4x4): void;
