import {
  apply2,
  apply3,
  apply4,
  Vec2,
  Vec2Compat,
  Vec3,
  Vec3Compat,
  Vec4,
} from "./vector";

const { cos, sin, tan } = Math;
const PI_2 = Math.PI / 2;

/**
 * This represents a matrix with enough elements to define a 2x2 matrix. This is
 * specifically used to express a matrix in a linear buffer intentionally to
 * reduce allocations and indexing into the array.
 *
 * Use the indexing constant M2<row><column> or M2<Y><X> to access the elements
 * based on column and row. For example, M211 would be the value at row 1
 * (second row) and column 2 (third column).
 */
// prettier-ignore
export type Mat2x2 = [
  number, number,
  number, number
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
// prettier-ignore
export type Mat3x3 = [
  number, number, number,
  number, number, number,
  number, number, number
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
// prettier-ignore
export type Mat4x4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

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

/** Mat2x2 row column index for convenience M2<row><column> or M2<Y><X> */
export const M200 = 0;
/** Mat2x2 row column index for convenience M2<row><column> or M2<Y><X> */
export const M201 = 1;
/** Mat2x2 row column index for convenience M2<row><column> or M2<Y><X> */
export const M210 = 2;
/** Mat2x2 row column index for convenience M2<row><column> or M2<Y><X> */
export const M211 = 3;

/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export const M300 = 0;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export const M301 = 1;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export const M302 = 2;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export const M310 = 3;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export const M311 = 4;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export const M312 = 5;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export const M320 = 6;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export const M321 = 7;
/** Mat3x3 row column index for convenience M3<row><column> or M3<Y><X> */
export const M322 = 8;

/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M400 = 0;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M401 = 1;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M402 = 2;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M403 = 3;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M410 = 4;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M411 = 5;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M412 = 6;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M413 = 7;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M420 = 8;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M421 = 9;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M422 = 10;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M423 = 11;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M430 = 12;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M431 = 13;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M432 = 14;
/** Mat4x4 row column index for convenience M4<row><column> or M4<Y><X> */
export const M433 = 15;

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
export const M3R: Mat3x3[] = new Array(20).fill(0).map((_) => identity3());

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
export const M4R: Mat4x4[] = new Array(20).fill(0).map((_) => identity4());

/**
 * It's often much faster to apply values to an existing matrix than to declare
 * a new matrix inline. But it can be annoying and bulky to write the complete
 * array to value sequence to perform such an application. Thus, this method
 * exists to make the process a little more bearable.
 */
export function apply2x2(
  m: Mat2x2 | undefined,
  m00: number,
  m01: number,
  m10: number,
  m11: number
) {
  m = m || (new Array(4) as any as Mat2x2);
  m[0] = m00;
  m[1] = m01;
  m[2] = m10;
  m[3] = m11;

  return m;
}

/**
 * It's often much faster to apply values to an existing matrix than to declare
 * a new matrix inline. But it can be annoying and bulky to write the complete
 * array to value sequence to perform such an application. Thus, this method
 * exists to make the process a little more bearable.
 */
export function apply3x3(
  m: Mat3x3 | undefined,
  m00: number,
  m01: number,
  m02: number,
  m10: number,
  m11: number,
  m12: number,
  m20: number,
  m21: number,
  m22: number
) {
  m = m || (new Array(9) as any as Mat3x3);
  m[0] = m00;
  m[1] = m01;
  m[2] = m02;
  m[3] = m10;
  m[4] = m11;
  m[5] = m12;
  m[6] = m20;
  m[7] = m21;
  m[8] = m22;

  return m;
}

/**
 * It's often much faster to apply values to an existing matrix than to declare
 * a new matrix inline. But it can be annoying and bulky to write the complete
 * array to value sequence to perform such an application. Thus, this method
 * exists to make the process a little more bearable.
 */
export function apply4x4(
  m: Mat4x4 | undefined,
  m00: number,
  m01: number,
  m02: number,
  m03: number,
  m10: number,
  m11: number,
  m12: number,
  m13: number,
  m20: number,
  m21: number,
  m22: number,
  m23: number,
  m30: number,
  m31: number,
  m32: number,
  m33: number
) {
  m = m || (new Array(16) as any as Mat4x4);

  m[0] = m00;
  m[1] = m01;
  m[2] = m02;
  m[3] = m03;

  m[4] = m10;
  m[5] = m11;
  m[6] = m12;
  m[7] = m13;

  m[8] = m20;
  m[9] = m21;
  m[10] = m22;
  m[11] = m23;

  m[12] = m30;
  m[13] = m31;
  m[14] = m32;
  m[15] = m33;

  return m;
}

/**
 * In many of these methods, there are moments that temporary matrices are
 * needed to store some results. Rather than allot and consume memory for temp
 * matrices and degrade performance, these will provide some containers to work
 * with. The values in these containers should never be assumed upon entry of a
 * method, nor shall these be used to make two methods operate together.
 */

const TEMP_M30 = identity3();
const TEMP_M31 = identity3();
const TEMP_M32 = identity3();
const TEMP_M33 = identity3();

/**
 * Determinant value of a 2x2 matrix
 *
 * 3 OPS
 */
export function determinant2x2(mat: Mat2x2): number {
  return mat[3] * mat[0] - mat[1] * mat[2];
}

/**
 * Determinant value of a 3x3 matrix
 *
 * 17 OPS
 */
export function determinant3x3(mat: Mat3x3): number {
  return (
    mat[0] * mat[4] * mat[8] -
    mat[0] * mat[5] * mat[7] +
    mat[1] * mat[5] * mat[6] -
    mat[1] * mat[3] * mat[8] +
    mat[2] * mat[3] * mat[7] -
    mat[2] * mat[4] * mat[6]
  );
}

/**
 * Determinant value of a 4x4 matrix
 *
 * 75 OPS, 4 temp Mat3x3, 8 method calls
 */
export function determinant4x4(mat: Mat4x4): number {
  // prettier-ignore
  apply3x3(TEMP_M30,
     mat[5],  mat[6],  mat[7],
     mat[9], mat[10], mat[11],
    mat[13], mat[14], mat[15]
  );

  // prettier-ignore
  apply3x3(TEMP_M31,
     mat[4],  mat[6],  mat[7],
     mat[8], mat[10], mat[11],
    mat[12], mat[14], mat[15]
  );

  // prettier-ignore
  apply3x3(TEMP_M32,
     mat[4],  mat[5],  mat[7],
     mat[8],  mat[9], mat[11],
    mat[12], mat[13], mat[15]
  );

  // prettier-ignore
  apply3x3(TEMP_M32,
     mat[4],  mat[5],  mat[6],
     mat[8],  mat[9], mat[10],
    mat[12], mat[13], mat[14]
  );

  return (
    mat[0] * determinant3x3(TEMP_M30) -
    mat[1] * determinant3x3(TEMP_M31) +
    mat[2] * determinant3x3(TEMP_M32) -
    mat[3] * determinant3x3(TEMP_M33)
  );
}

/**
 * Calculates the inverse of ONLY purely affine transforms. A general inverse is
 * considered too computationally expensive and alternative strategies should be
 * considered.
 *
 * 9 OPS, 1 method call
 */
export function affineInverse2x2(mat: Mat2x2, out?: Mat2x2): Mat2x2 | null {
  const determinant = determinant2x2(mat);
  if (determinant === 0) return null;

  // prettier-ignore
  return apply2x2(out,
     mat[3] / determinant, -mat[1] / determinant,
    -mat[2] / determinant,  mat[0] / determinant
  );
}

/**
 * Calculates the inverse of ONLY purely affine transforms. A general inverse is
 * considered too computationally expensive and alternative strategies should be
 * considered.
 *
 * 56 OPS, 10 method calls
 */
export function affineInverse3x3(mat: Mat3x3, out?: Mat3x3): Mat3x3 | null {
  // 17 OPS
  const determiant = determinant3x3(mat);
  if (determiant === 0) return null;

  // 27 OPS 9 method calls
  const m0 = determinant2x2([mat[4], mat[5], mat[7], mat[8]]);
  const m1 = determinant2x2([mat[3], mat[5], mat[6], mat[8]]);
  const m2 = determinant2x2([mat[3], mat[4], mat[6], mat[7]]);
  const m3 = determinant2x2([mat[1], mat[2], mat[7], mat[8]]);
  const m4 = determinant2x2([mat[0], mat[2], mat[6], mat[8]]);
  const m5 = determinant2x2([mat[0], mat[1], mat[6], mat[7]]);
  const m6 = determinant2x2([mat[1], mat[2], mat[4], mat[5]]);
  const m7 = determinant2x2([mat[0], mat[2], mat[3], mat[5]]);
  const m8 = determinant2x2([mat[0], mat[1], mat[3], mat[4]]);

  // prettier-ignore
  return apply3x3(out,
     m0 / determiant, -m3 / determiant, m6 / determiant,
    -m1 / determiant,  m4 / determiant, m7 / determiant,
     m2 / determiant, -m5 / determiant, m8 / determiant
  );
}

/**
 * Calculates the inverse of ONLY purely affine transforms. A general inverse is
 * considered too computationally expensive and alternative strategies should be
 * considered.
 *
 * 164 OPS + 3 temp 3x3 uses + 13 method calls
 */
export function affineInverse4x4(mat: Mat4x4, out?: Mat4x4): Mat4x4 | null {
  const determiant = determinant4x4(mat);
  if (determiant === 0) return null;

  const s0 = determinant2x2([mat[0], mat[1], mat[4], mat[5]]);
  const s1 = determinant2x2([mat[0], mat[2], mat[4], mat[6]]);
  const s2 = determinant2x2([mat[0], mat[3], mat[4], mat[7]]);
  const s3 = determinant2x2([mat[1], mat[2], mat[5], mat[6]]);
  const s4 = determinant2x2([mat[1], mat[3], mat[5], mat[7]]);
  const s5 = determinant2x2([mat[2], mat[3], mat[6], mat[7]]);

  const c5 = determinant2x2([mat[10], mat[11], mat[14], mat[15]]);
  const c4 = determinant2x2([mat[9], mat[11], mat[13], mat[15]]);
  const c3 = determinant2x2([mat[9], mat[10], mat[13], mat[14]]);
  const c2 = determinant2x2([mat[8], mat[11], mat[12], mat[15]]);
  const c1 = determinant2x2([mat[8], mat[10], mat[12], mat[14]]);
  const c0 = determinant2x2([mat[8], mat[9], mat[12], mat[13]]);

  // prettier-ignore
  return apply4x4(out,
    //                                                     |                                                        |                                                           |
     (mat[5] * c5 - mat[6] * c4 + mat[7] * c3) / determiant, (-mat[1] * c5 + mat[2] * c4 - mat[3] * c3) / determiant,  (mat[12] * s5 - mat[13] * s4 + mat[14] * s3) / determiant, (-mat[9] * s5 + mat[10] * s4 - mat[11] * s3) / determiant,
    (-mat[4] * c5 + mat[6] * c2 - mat[7] * c1) / determiant,  (mat[0] * c5 - mat[2] * c2 + mat[3] * c1) / determiant, (-mat[12] * s5 + mat[14] * s2 - mat[15] * s1) / determiant,  (mat[8] * s5 - mat[10] * s2 + mat[11] * s1) / determiant,
     (mat[4] * c4 - mat[5] * c2 + mat[7] * c0) / determiant, (-mat[0] * c4 + mat[1] * c2 - mat[3] * c0) / determiant,  (mat[12] * s4 - mat[13] * s2 + mat[15] * s0) / determiant,  (-mat[8] * s4 + mat[9] * s2 - mat[11] * s0) / determiant,
    (-mat[4] * c3 + mat[5] * c1 - mat[6] * c0) / determiant,  (mat[0] * c3 - mat[1] * c1 + mat[2] * c0) / determiant, (-mat[12] * s3 + mat[13] * s1 - mat[14] * s0) / determiant,   (mat[8] * s3 - mat[9] * s1 + mat[10] * s0) / determiant
  );
}

/**
 * 4 OPS
 */
export function multiplyScalar2x2(
  mat: Mat2x2,
  scale: number,
  out?: Mat2x2
): Mat2x2 {
  // prettier-ignore
  return apply2x2(out,
    mat[0] * scale, mat[1] * scale,
    mat[2] * scale, mat[3] * scale
  );
}

/**
 * 9 OPS
 */
export function multiplyScalar3x3(
  mat: Mat3x3,
  scale: number,
  out?: Mat3x3
): Mat3x3 {
  // prettier-ignore
  return apply3x3(out,
    mat[0] * scale, mat[1] * scale, mat[2] * scale,
    mat[3] * scale, mat[4] * scale, mat[5] * scale,
    mat[6] * scale, mat[7] * scale, mat[8] * scale
  );
}

/**
 * 16 OPS
 */
export function multiplyScalar4x4(
  mat: Mat4x4,
  scale: number,
  out?: Mat4x4
): Mat4x4 {
  // prettier-ignore
  return apply4x4(out,
     mat[0] * scale,  mat[1] * scale,  mat[2] * scale,  mat[3] * scale,
     mat[4] * scale,  mat[5] * scale,  mat[6] * scale,  mat[7] * scale,
     mat[8] * scale,  mat[9] * scale, mat[10] * scale, mat[11] * scale,
    mat[12] * scale, mat[13] * scale, mat[14] * scale, mat[15] * scale
  );
}

/**
 * Convert or produce a 2x2 identity matrix
 */
export function identity2(out?: Mat2x2): Mat2x2 {
  // prettier-ignore
  return apply2x2(out,
    1, 0,
    0, 1
  );
}

/**
 * Convert or produce a 3x3 identity matrix
 */
export function identity3(out?: Mat3x3): Mat3x3 {
  // prettier-ignore
  return apply3x3(out,
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  );
}

/**
 * Convert or produce a 4x4 identity matrix
 */
export function identity4(out?: Mat4x4): Mat4x4 {
  // prettier-ignore
  return apply4x4(out,
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );
}

/**
 * Concat two 2x2 matrices. T = left x right
 * 12 OPS
 */
export function multiply2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2 {
  // prettier-ignore
  return apply2x2(out,
    right[M200] * left[M200] + right[M201] * left[M210], right[M200] * left[M201] + right[M201] * left[M211],
    right[M210] * left[M200] + right[M211] * left[M210], right[M210] * left[M201] + right[M211] * left[M211],
  );
}

/**
 * Concat two 3x3 matrices. T = left x right
 * 45 OPS
 */
export function multiply3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3 {
  // prettier-ignore
  return apply3x3(out,
    right[0] * left[0] + right[1] * left[3] + right[2] * left[6], right[0] * left[1] + right[1] * left[4] + right[2] * left[7], right[0] * left[2] + right[1] * left[5] + right[2] * left[8],
    right[3] * left[0] + right[4] * left[3] + right[5] * left[6], right[3] * left[1] + right[4] * left[4] + right[5] * left[7], right[3] * left[2] + right[4] * left[5] + right[5] * left[8],
    right[6] * left[0] + right[7] * left[3] + right[8] * left[6], right[6] * left[1] + right[7] * left[4] + right[8] * left[7], right[6] * left[2] + right[7] * left[5] + right[8] * left[8]
  );
}

/**
 * Concat two 4x4 matrices. T = left x right
 * 112 OPS
 */
export function multiply4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4 {
  // prettier-ignore
  out = out || ([] as any as Mat4x4);
  out[0] =
    right[0] * left[0] +
    right[1] * left[4] +
    right[2] * left[8] +
    right[3] * left[12];
  out[1] =
    right[0] * left[1] +
    right[1] * left[5] +
    right[2] * left[9] +
    right[3] * left[13];
  out[2] =
    right[0] * left[2] +
    right[1] * left[6] +
    right[2] * left[10] +
    right[3] * left[14];
  out[3] =
    right[0] * left[3] +
    right[1] * left[7] +
    right[2] * left[11] +
    right[3] * left[15];

  out[4] =
    right[4] * left[0] +
    right[5] * left[4] +
    right[6] * left[8] +
    right[7] * left[12];
  out[5] =
    right[4] * left[1] +
    right[5] * left[5] +
    right[6] * left[9] +
    right[7] * left[13];
  out[6] =
    right[4] * left[2] +
    right[5] * left[6] +
    right[6] * left[10] +
    right[7] * left[14];
  out[7] =
    right[4] * left[3] +
    right[5] * left[7] +
    right[6] * left[11] +
    right[7] * left[15];

  out[8] =
    right[8] * left[0] +
    right[9] * left[4] +
    right[10] * left[8] +
    right[11] * left[12];
  out[9] =
    right[8] * left[1] +
    right[9] * left[5] +
    right[10] * left[9] +
    right[11] * left[13];
  out[10] =
    right[8] * left[2] +
    right[9] * left[6] +
    right[10] * left[10] +
    right[11] * left[14];
  out[11] =
    right[8] * left[3] +
    right[9] * left[7] +
    right[10] * left[11] +
    right[11] * left[15];

  out[12] =
    right[12] * left[0] +
    right[13] * left[4] +
    right[14] * left[8] +
    right[15] * left[12];
  out[13] =
    right[12] * left[1] +
    right[13] * left[5] +
    right[14] * left[9] +
    right[15] * left[13];
  out[14] =
    right[12] * left[2] +
    right[13] * left[6] +
    right[14] * left[10] +
    right[15] * left[14];
  out[15] =
    right[12] * left[3] +
    right[13] * left[7] +
    right[14] * left[11] +
    right[15] * left[15];

  return out;
}

/**
 * Concat a list of matrices in this order:
 * concat4x4(A, B, C, D, E, ..., N);
 * T = A * B * C * E * ... * N
 */
export function concat4x4(out?: Mat4x4, ...m: Mat4x4[]): Mat4x4 {
  if (m.length <= 0) return identity4();
  out = out || identity4();
  if (m.length === 1) return copy4x4(m[0], out);

  // Get the first multiplication value for the left hand side of the operation
  let l = m[0];
  // We use a register to reduce allocations and overhead
  let register1 = M4R[M4R.length - 1];
  let register2 = M4R[M4R.length - 2];
  // Make sure our output doesn't clash with one of the registeres
  if (out === register1) register1 = M4R[M4R.length - 3];
  if (out === register2) register2 = M4R[M4R.length - 3];
  let register = register1;

  for (let i = 1, iMax = m.length - 1; i < iMax; ++i) {
    // Each new matrix will be the right hand side of the operation
    const r = m[i];
    // Do the multiplication storing the result into a register
    l = multiply4x4(l, r, register);
    // Toggle to a new register for the next operation so we don't output into
    // an input
    register = register === register1 ? register2 : register1;
  }

  // Do the final operation with the last matrix, but this time store in our
  // output value.
  return multiply4x4(l, m[m.length - 1], out);
}

/**
 * Add each element by each element in two matrices
 * 4 OPS
 */
export function add2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2 {
  // prettier-ignore
  return apply2x2(out,
    left[0] + right[0], left[1] + right[1],
    left[2] + right[2], left[3] + right[3]
  );
}

/**
 * Add each element by each element in two matrices
 * 9 OPS
 */
export function add3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3 {
  // prettier-ignore
  return apply3x3(out,
    left[0] + right[0], left[1] + right[1], left[2] + right[2],
    left[3] + right[3], left[4] + right[4], left[5] + right[5],
    left[6] + right[6], left[7] + right[7], left[8] + right[8]
  );
}

/**
 * Add each element by each element in two matrices
 * 16 OPS
 */
export function add4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4 {
  // prettier-ignore
  return apply4x4(out,
      left[0] + right[0],   left[1] + right[1],   left[2] + right[2],   left[3] + right[3],
      left[4] + right[4],   left[5] + right[5],   left[6] + right[6],   left[7] + right[7],
      left[8] + right[8],   left[9] + right[9], left[10] + right[10], left[11] + right[11],
    left[12] + right[12], left[13] + right[13], left[14] + right[14], left[15] + right[15]
  );
}

/**
 * Subtract each element by each element in two matrices
 * 4 OPS
 */
export function subtract2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2 {
  // prettier-ignore
  return apply2x2(out,
    left[0] - right[0], left[1] - right[1],
    left[2] - right[2], left[3] - right[3]
  );
}

/**
 * Subtract each element by each element in two matrices
 * 9 OPS
 */
export function subtract3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3 {
  // prettier-ignore
  return apply3x3(out,
    left[0] - right[0], left[1] - right[1], left[2] - right[2],
    left[3] - right[3], left[4] - right[4], left[5] - right[5],
    left[6] - right[6], left[7] - right[7], left[8] - right[8]
  );
}

/**
 * Subtract each element by each element in two matrices
 * 16 OPS
 */
export function subtract4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4 {
  // prettier-ignore
  return apply4x4(out,
      left[0] - right[0],   left[1] - right[1],   left[2] - right[2],   left[3] - right[3],
      left[4] - right[4],   left[5] - right[5],   left[6] - right[6],   left[7] - right[7],
      left[8] - right[8],   left[9] - right[9], left[10] - right[10], left[11] - right[11],
    left[12] - right[12], left[13] - right[13], left[14] - right[14], left[15] - right[15]
  );
}

/**
 * Hadamard product of two matrices. This is essentially multiplying each
 * element by each element between the two. 4 OPS
 */
export function Hadamard2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2 {
  // prettier-ignore
  return apply2x2(out,
    left[0] * right[0], left[1] * right[1],
    left[2] * right[2], left[3] * right[3]
  );
}

/**
 * Hadamard product of two matrices. This is essentially multiplying each
 * element by each element between the two. 9 OPS
 */
export function Hadamard3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3 {
  // prettier-ignore
  return apply3x3(out,
    left[0] * right[0], left[1] * right[1], left[2] * right[2],
    left[3] * right[3], left[4] * right[4], left[5] * right[5],
    left[6] * right[6], left[7] * right[7], left[8] * right[8]
  );
}

/**
 * Hadamard product of two matrices. This is essentially multiplying each
 * element by each element between the two. 16 OPS
 */
export function Hadamard4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4 {
  // prettier-ignore
  return apply4x4(out,
      left[0] * right[0],   left[1] * right[1],   left[2] * right[2],   left[3] * right[3],
      left[4] * right[4],   left[5] * right[5],   left[6] * right[6],   left[7] * right[7],
      left[8] * right[8],   left[9] * right[9], left[10] * right[10], left[11] * right[11],
    left[12] * right[12], left[13] * right[13], left[14] * right[14], left[15] * right[15]
  );
}

/**
 * Transposes a 2x2 matrix:
 * [a, b] -> [a, c]
 * [c, d]    [b, d]
 */
export function transpose2x2(mat: Mat2x2, out?: Mat2x2): Mat2x2 {
  // prettier-ignore
  return apply2x2(out,
    mat[0], mat[2],
    mat[1], mat[3]
  );
}

/**
 * Transposes a 3x3 matrix:
 * [a, b, c] -> [a, d, g]
 * [d, e, f]    [b, e, h]
 * [g, h, i]    [c, f, i]
 */
export function transpose3x3(mat: Mat3x3, out?: Mat3x3): Mat3x3 {
  // prettier-ignore
  return apply3x3(out,
    mat[0], mat[3], mat[6],
    mat[1], mat[4], mat[7],
    mat[2], mat[5], mat[8]
  );
}

/**
 * Transposes a 4x4 matrix:
 * [a, b, c, d] -> [a, e, i, m]
 * [e, f, g, h]    [b, f, j, n]
 * [i, j, k, l]    [c, g, k, o]
 * [m, n, o, p]    [d, h, l, p]
 */
export function transpose4x4(mat: Mat4x4, out?: Mat4x4): Mat4x4 {
  // prettier-ignore
  return apply4x4(out,
    mat[0], mat[4], mat[8],  mat[12],
    mat[1], mat[5], mat[9],  mat[13],
    mat[2], mat[6], mat[10], mat[14],
    mat[3], mat[7], mat[11], mat[15]
  );
}

/**
 * This makes a shear 2d matrix that shears parallel to the x-axis. The radians
 * should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and
 * beyond.
 */
export function shearX2x2(radians: number, out?: Mat2x2): Mat2x2 {
  if (radians >= Math.PI / 2 || radians <= -Math.PI / 2) {
    console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2");
  }

  out = out || identity2();

  // prettier-ignore
  return apply2x2(out,
    1, 0,
    tan(radians), 1
  );
}

/**
 * This makes a shear 2d matrix that shears parallel to the y-axis. The radians
 * should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and
 * beyond.
 */
export function shearY2x2(radians: number, out?: Mat2x2): Mat2x2 {
  if (radians >= Math.PI / 2 || radians <= -Math.PI / 2) {
    console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2");
  }

  out = out || identity2();

  // prettier-ignore
  return apply2x2(out,
    1, tan(radians),
    0, 1
  );
}

/**
 * This makes a shear 3d matrix that shears parallel to the x-axis. The radians
 * should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and
 * beyond.
 */
export function shearX4x4(
  alongY: number,
  alongZ: number,
  out?: Mat4x4
): Mat4x4 {
  if (alongZ >= PI_2 || alongZ <= -PI_2 || alongY >= PI_2 || alongY <= -PI_2) {
    console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2");
  }

  out = out || identity4();
  const shearZ = tan(alongZ);
  const shearY = tan(alongY);

  // prettier-ignore
  return apply4x4(
    out,
    1, 0, 0, 0,
    shearY, 1, 0, 0,
    shearZ, 0, 1, 0,
    0, 0, 0, 1
  );
}

/**
 * This makes a shear 3d matrix that shears parallel to the y-axis. The radians
 * should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and
 * beyond.
 */
export function shearY4x4(
  alongX: number,
  alongZ: number,
  out?: Mat4x4
): Mat4x4 {
  if (alongZ >= PI_2 || alongZ <= -PI_2 || alongX >= PI_2 || alongX <= -PI_2) {
    console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2");
  }

  out = out || identity4();
  const shearZ = tan(alongZ);
  const shearX = tan(alongX);

  // prettier-ignore
  return apply4x4(
    out,
    1, shearX, 0, 0,
    0, 1, 0, 0,
    0, shearZ, 1, 0,
    0, 0, 0, 1
  );
}

/**
 * This makes a shear 3d matrix that shears parallel to the z-axis. The radians
 * should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and
 * beyond.
 */
export function shearZ4x4(
  alongX: number,
  alongY: number,
  out?: Mat4x4
): Mat4x4 {
  if (alongY >= PI_2 || alongY <= -PI_2 || alongX >= PI_2 || alongX <= -PI_2) {
    console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2");
  }

  out = out || identity4();
  const shearY = tan(alongY);
  const shearX = tan(alongX);

  // prettier-ignore
  return apply4x4(
    out,
    1, 0, shearX, 0,
    0, 1, shearY, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );
}

/**
 * Transforms a Vec2 by a matrix
 */
export function transform2(m: Mat2x2, v: Vec2, out?: Vec2): Vec2 {
  return apply2(
    out,
    m[M200] * v[0] + m[M210] * v[1],
    m[M201] * v[0] + m[M211] * v[1]
  );
}

/**
 * Transforms a Vec3 by a matrix.
 */
export function transform3(m: Mat3x3, v: Vec3, out?: Vec3): Vec3 {
  return apply3(
    out,
    m[M300] * v[0] + m[M310] * v[1] + m[M320] * v[2],
    m[M301] * v[0] + m[M311] * v[1] + m[M321] * v[2],
    m[M302] * v[0] + m[M312] * v[1] + m[M322] * v[2]
  );
}

/**
 * Transforms a Vec3 by the provided matrix but treats the Vec3 as a
 * [x, y, z, 1] Vec4.
 */
export function transform3as4(m: Mat4x4, v: Vec3, out?: Vec4): Vec4 {
  return apply4(
    out,
    m[M400] * v[0] + m[M410] * v[1] + m[M420] * v[2] + m[M430] * 1,
    m[M401] * v[0] + m[M411] * v[1] + m[M421] * v[2] + m[M431] * 1,
    m[M402] * v[0] + m[M412] * v[1] + m[M422] * v[2] + m[M432] * 1,
    m[M403] * v[0] + m[M413] * v[1] + m[M423] * v[2] + m[M433] * 1
  );
}

/**
 * Transforms a vector by the provided matrix
 */
export function transform4(m: Mat4x4, v: Vec4, out?: Vec4): Vec4 {
  return apply4(
    out,
    m[M400] * v[0] + m[M410] * v[1] + m[M420] * v[2] + m[M430] * v[3],
    m[M401] * v[0] + m[M411] * v[1] + m[M421] * v[2] + m[M431] * v[3],
    m[M402] * v[0] + m[M412] * v[1] + m[M422] * v[2] + m[M432] * v[3],
    m[M403] * v[0] + m[M413] * v[1] + m[M423] * v[2] + m[M433] * v[3]
  );
}

/**
 * Converts a 2x2 to a pretty print string
 */
export function toString2x2(mat: Mat2x2): string {
  // prettier-ignore
  return `Matrix: [
  ${mat[0]}, ${mat[1]},
  ${mat[2]}, ${mat[3]},
]`;
}

/**
 * Converts a 3x3 to a pretty print string
 */
export function toString3x3(mat: Mat3x3): string {
  // prettier-ignore
  return `Matrix: [
  ${mat[0]}, ${mat[1]}, ${mat[2]},
  ${mat[3]}, ${mat[4]}, ${mat[5]},
  ${mat[6]}, ${mat[7]}, ${mat[8]},
]`;
}

/**
 * Converts a 4x4 to a pretty print string
 */
export function toString4x4(mat: Mat4x4): string {
  // prettier-ignore
  return `Matrix: [
  ${mat[0]}, ${mat[1]}, ${mat[2]}, ${mat[3]},
  ${mat[4]}, ${mat[5]}, ${mat[6]}, ${mat[7]},
  ${mat[8]}, ${mat[9]}, ${mat[10]}, ${mat[11]},
  ${mat[12]}, ${mat[13]}, ${mat[14]}, ${mat[15]},
]`;
}

/**
 * Makes a 2x2 rotation matrix based on a single rotational value. Good for
 * rotating 2 dimensional values with as little information and operations as
 * possible.
 */
export function rotation2x2(radians: number, out?: Mat2x2): Mat2x2 {
  out = out || (new Array(4) as Mat2x2);
  const c = Math.cos(radians);
  const s = Math.sin(radians);

  out[M200] = c;
  out[M201] = -s;
  out[M210] = s;
  out[M211] = c;

  return out;
}

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
export function rotation4x4(x: number, y: number, z: number, out?: Mat4x4) {
  if (x) {
    if (y) {
      if (z) {
        // x, y, z
        const cx = cos(x);
        const cy = cos(y);
        const cz = cos(z);
        const sx = sin(x);
        const sy = sin(y);
        const sz = sin(z);

        // prettier-ignore
        /*return apply4x4(out,
          c1 * c2,  - c1 * s2, s1, 0,
          s0 * s1 * c2 + c0 * s2, -s0 * s1 * s2 + c0 * c2, -s0 * c1, 0,
          s0 * s2 - c0 * s1 * c2, s0 * c2 + c0 * s1 * s2, c0 * c1, 0,
          0, 0, 0, 1
        );*/
        return apply4x4(out,
          cy * cz, cy * sz, -sy, 0,
          sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy, 0,
          cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy, 0,
          0, 0, 0, 1
        );
      } else {
        // x, y
        const cx = cos(x);
        const cy = cos(y);
        const sx = sin(x);
        const sy = sin(y);

        // prettier-ignore
        return apply4x4(out,
          cy, 0, -sy, 0,
          sx * sy, cx, sx * cy, 0,
          cx * sy, -sx, cx * cy, 0,
          0, 0, 0, 1
        );
      }
    } else {
      if (z) {
        // x, z
        const cx = cos(x);
        const cz = cos(z);
        const sx = sin(x);
        const sz = sin(z);

        // prettier-ignore
        return apply4x4(out,
          cz, sz, 0, 0,
          -cx * sz, cx * cz, sx, 0,
          sx * sz, -sx * cz, cx, 0,
          0, 0, 0, 1
        );
      } else {
        // x
        const cx = cos(x);
        const sx = sin(x);

        // prettier-ignore
        return apply4x4(out,
           1,  0,  0, 0,
           0,  cx, sx, 0,
           0,  -sx, cx, 0,
           0,  0,  0,  1
        );
      }
    }
  } else {
    if (y) {
      if (z) {
        // y, z
        const cy = cos(y);
        const cz = cos(z);
        const sy = sin(y);
        const sz = sin(z);

        // prettier-ignore
        return apply4x4(out,
          cy * cz, cy * sz, -sy, 0,
          -sz, cz, 0, 0,
          sy * cz, sy * sz, cy, 0,
          0, 0, 0, 1
       );
      } else {
        // y
        const cy = cos(y);
        const sy = sin(y);

        // prettier-ignore
        return apply4x4(out,
          cy, 0, -sy, 0,
           0, 1,   0, 0,
          sy, 0,  cy, 0,
           0, 0,   0, 1
        );
      }
    } else {
      if (z) {
        // z
        const cz = cos(z);
        const sz = sin(z);

        // prettier-ignore
        return apply4x4(out,
          cz, sz, 0, 0,
         -sz, cz, 0, 0,
           0,  0, 1, 0,
           0,  0, 0, 1
        );
      } else {
        // no x, y, z
        return identity4(out);
      }
    }
  }
}

/**
 * We only support Euler X then Y then Z rotations. Specify the rotation values
 * for each axis to receive a matrix that will perform rotations by that amount
 * in that order.
 */
export function rotation4x4by3(v: Vec3, out?: Mat4x4) {
  return rotation4x4(v[0], v[1], v[2], out);
}

/**
 * Creates a scaling matrix from a vector
 */
export function scale4x4by3(p: Vec3Compat, out?: Mat4x4): Mat4x4 {
  return scale4x4(p[0], p[1], p[2], out);
}

/**
 * Creates a 4x4 scaling matrix
 */
export function scale4x4(
  x: number,
  y: number,
  z: number,
  out?: Mat4x4
): Mat4x4 {
  // prettier-ignore
  return apply4x4(out,
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1
  );
}

/**
 * Creates a translation Matrix from a vector
 */
export function translation4x4by3(t: Vec3Compat, out?: Mat4x4): Mat4x4 {
  return translation4x4(t[0], t[1], t[2], out);
}

/**
 * Creates a translation Matrix
 */
export function translation4x4(
  x: number,
  y: number,
  z: number,
  out?: Mat4x4
): Mat4x4 {
  // prettier-ignore
  return apply4x4(out,
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1
  );
}

/**
 * Produces a perspective matrix for a given frustum:
 * n: near,
 * f: far,
 * l: left,
 * r: right,
 * b: bottom,
 * t: top
 */
export function perspectiveFrustum4x4(
  n: number,
  f: number,
  l: number,
  r: number,
  t: number,
  b: number,
  out?: Mat4x4
) {
  out = out || identity4();

  // This is a column major matrix that should homogenize coordinates to within
  // unit cube if the specified point is within the expressed frustum.
  // prettier-ignore
  return apply4x4(out,
      2 * n / (r - l),                 0,                      0,  0,
                    0,   2 * n / (t - b),                      0,  0,
    (r + l) / (r - l), (t + b) / (t - b),     -(f + n) / (f - n), -1,
                    0,                 0, -(2 * f * n) / (f - n),  0
  );
}

/**
 * Generate a projection matrix with perspective.
 * The provided FOV is for the horizontal FOV.
 */
export function perspective4x4(
  fovRadians: number,
  width: number,
  height: number,
  near: number,
  far: number,
  out?: Mat4x4
): Mat4x4 {
  const aspect = height / width;
  const r = tan(fovRadians / 2) * near;
  const l = -r;
  const t = aspect * r;
  const b = -t;

  return perspectiveFrustum4x4(near, far, l, r, t, b, out);
}

/**
 * Generate a projection matrix with perspective.
 * The provided FOV is for the vertical FOV.
 */
export function perspectiveFOVY4x4(
  fovRadians: number,
  width: number,
  height: number,
  near: number,
  far: number,
  out?: Mat4x4
): Mat4x4 {
  const aspect = width / height;
  const t = tan(fovRadians / 2) * near;
  const b = -t;
  const r = aspect * t;
  const l = -r;

  return perspectiveFrustum4x4(near, far, l, r, t, b, out);
}

/**
 * Generate a projection matrix with no perspective. Useful for flat 2D or
 * isometric rendering or other similar special case renderings.
 */
export function orthographic4x4(
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
  out?: Mat4x4
): Mat4x4 {
  // prettier-ignore
  return apply4x4(out,
                 2 / (right - left),                               0,                    0, 0,
                                  0,              2 / (top - bottom),                    0, 0,
                                  0,                               0,    -1 / (far - near), 0,
    (right + left) / (left - right), (top + bottom) / (bottom - top), -near / (near - far), 1
  );
}

/**
 * Performs the operations to project a Vec4 to screen coordinates using a
 * projection matrix. The x and y of the out Vec4 will be the final projection,
 * w should be resolved to 1, and the z coordinate will be in homogenous
 * coordinates where -1 <= z <= 1 iff z lies within frustum near and far planes.
 */
export function projectToScreen(
  proj: Mat4x4,
  point: Vec4,
  width: number,
  height: number,
  out?: Vec4
): Vec4 {
  out = out || [0, 0, 0, 0];
  transform4(proj, point, out);

  return apply4(
    out,
    (out[0] / out[3] + 1) * 0.5 * width,
    (out[1] / out[3] + 1) * 0.5 * height,
    out[2] / out[3],
    1
  );
}

/**
 * Performs the operations to project a Vec3 to screen coordinates as a Vec4
 * with a w of value 1. using a projection matrix. The x and y of the out Vec4
 * will be the final projection, w should be resolved to 1, and the z coordinate
 * will be in homogenous coordinates where -1 <= z <= 1 iff z lies within
 * frustum near and far planes.
 */
export function project3As4ToScreen(
  proj: Mat4x4,
  point: Vec3Compat,
  width: number,
  height: number,
  out?: Vec4
) {
  return projectToScreen(
    proj,
    [point[0], point[1], point[2], 1],
    width,
    height,
    out
  );
}

/**
 * Determines equality of two 2x2 matrices
 */
export function compare2x2(m1: Mat2x2, m2: Mat2x2): boolean {
  return (
    Math.abs(m1[0] - m2[0]) <= 1e-7 &&
    Math.abs(m1[1] - m2[1]) <= 1e-7 &&
    Math.abs(m1[2] - m2[2]) <= 1e-7 &&
    Math.abs(m1[3] - m2[3]) <= 1e-7
  );
}

/**
 * Determines equality of two 3x3 matrices.
 */
export function compare3x3(m1: Mat3x3, m2: Mat3x3): boolean {
  return (
    Math.abs(m1[0] - m2[0]) <= 1e-7 &&
    Math.abs(m1[1] - m2[1]) <= 1e-7 &&
    Math.abs(m1[2] - m2[2]) <= 1e-7 &&
    Math.abs(m1[3] - m2[3]) <= 1e-7 &&
    Math.abs(m1[4] - m2[4]) <= 1e-7 &&
    Math.abs(m1[5] - m2[5]) <= 1e-7 &&
    Math.abs(m1[6] - m2[6]) <= 1e-7 &&
    Math.abs(m1[7] - m2[7]) <= 1e-7 &&
    Math.abs(m1[8] - m2[8]) <= 1e-7
  );
}

/**
 * Determines equality of two 4x4 matrices.
 */
export function compare4x4(m1: Mat4x4, m2: Mat4x4): boolean {
  return (
    Math.abs(m1[0] - m2[0]) <= 1e-7 &&
    Math.abs(m1[1] - m2[1]) <= 1e-7 &&
    Math.abs(m1[2] - m2[2]) <= 1e-7 &&
    Math.abs(m1[3] - m2[3]) <= 1e-7 &&
    Math.abs(m1[4] - m2[4]) <= 1e-7 &&
    Math.abs(m1[5] - m2[5]) <= 1e-7 &&
    Math.abs(m1[6] - m2[6]) <= 1e-7 &&
    Math.abs(m1[7] - m2[7]) <= 1e-7 &&
    Math.abs(m1[8] - m2[8]) <= 1e-7 &&
    Math.abs(m1[9] - m2[9]) <= 1e-7 &&
    Math.abs(m1[10] - m2[10]) <= 1e-7 &&
    Math.abs(m1[11] - m2[11]) <= 1e-7 &&
    Math.abs(m1[12] - m2[12]) <= 1e-7 &&
    Math.abs(m1[13] - m2[13]) <= 1e-7 &&
    Math.abs(m1[14] - m2[14]) <= 1e-7 &&
    Math.abs(m1[15] - m2[15]) <= 1e-7
  );
}

/**
 * Copies a Mat2x2 into a new storage object
 */
export function copy2x2(m: Mat2x2): Mat2x2 {
  return [m[0], m[1], m[2], m[3]];
}

/**
 * Copies a Mat3x3 into a new storage object
 */
export function copy3x3(m: Mat3x3): Mat3x3 {
  return [m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]];
}

/**
 * Copies a Mat4x4 into a new storage object
 */
export function copy4x4(m: Mat4x4, out?: Mat4x4): Mat4x4 {
  if (out) {
    out[0] = m[0];
    out[1] = m[1];
    out[2] = m[2];
    out[3] = m[3];
    out[4] = m[4];
    out[5] = m[5];
    out[6] = m[6];
    out[7] = m[7];
    out[8] = m[8];
    out[9] = m[9];
    out[10] = m[10];
    out[11] = m[11];
    out[12] = m[12];
    out[13] = m[13];
    out[14] = m[14];
    out[15] = m[15];
    return out;
  }

  return [
    m[0],
    m[1],
    m[2],
    m[3],
    m[4],
    m[5],
    m[6],
    m[7],
    m[8],
    m[9],
    m[10],
    m[11],
    m[12],
    m[13],
    m[14],
    m[15],
  ];
}

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
export function TRS4x4(
  scale: Vec3,
  rotation: Mat3x3,
  translation: Vec3,
  out?: Mat4x4
) {
  out = out || ([] as any as Mat4x4);
  const [t, u, v] = scale;
  const [x, y, z] = translation;
  const [a, b, c, d, e, f, g, h, i] = rotation;

  out[M400] = a * t;
  out[M401] = b * u;
  out[M402] = c * v;
  out[M403] = 0;

  out[M410] = d * t;
  out[M411] = e * u;
  out[M412] = f * v;
  out[M413] = 0;

  out[M420] = g * t;
  out[M421] = h * u;
  out[M422] = i * v;
  out[M423] = 0;

  out[M430] = t * (a * x + d * y + g * z);
  out[M431] = u * (b * x + e * y + h * z);
  out[M432] = v * (c * x + f * y + i * z);
  out[M433] = 1;
}

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
export function SRT4x4(
  scale: Vec3,
  rotation: Mat3x3,
  translation: Vec3,
  out?: Mat4x4
) {
  out = out || ([] as any as Mat4x4);
  const [t, u, v] = scale;
  const [x, y, z] = translation;
  const [a, b, c, d, e, f, g, h, i] = rotation;

  out[M400] = a * t;
  out[M401] = b * t;
  out[M402] = c * t;
  out[M403] = 0;

  out[M410] = d * u;
  out[M411] = e * u;
  out[M412] = f * u;
  out[M413] = 0;

  out[M420] = g * v;
  out[M421] = h * v;
  out[M422] = i * v;
  out[M423] = 0;

  out[M430] = x;
  out[M431] = y;
  out[M432] = z;
  out[M433] = 1;
}

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
export function TRS4x4_2D(
  scale: Vec2,
  rotation: Mat2x2,
  translation: Vec2,
  out?: Mat4x4
) {
  out = out || ([] as any as Mat4x4);
  const [t, u] = scale;
  const [x, y] = translation;
  const [a, b, c, d] = rotation;

  out[M400] = a * t;
  out[M401] = b * u;
  out[M402] = 0;
  out[M403] = 0;

  out[M410] = c * t;
  out[M411] = d * u;
  out[M412] = 0;
  out[M413] = 0;

  out[M420] = 0;
  out[M421] = 0;
  out[M422] = 1;
  out[M423] = 0;

  out[M430] = t * (a * x + c * y);
  out[M431] = u * (b * x + d * y);
  out[M432] = 0;
  out[M433] = 1;
}

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
export function SRT4x4_2D(
  scale: Vec2Compat,
  rotation: Mat2x2,
  translation: Vec2Compat,
  out?: Mat4x4
) {
  out = out || ([] as any as Mat4x4);
  const [t, u] = scale;
  const [x, y] = translation;
  const [a, b, c, d] = rotation;

  out[M400] = a * t;
  out[M401] = b * t;
  out[M402] = 0;
  out[M403] = 0;

  out[M410] = c * u;
  out[M411] = d * u;
  out[M412] = 0;
  out[M413] = 0;

  out[M420] = 0;
  out[M421] = 0;
  out[M422] = 1;
  out[M423] = 0;

  out[M430] = x;
  out[M431] = y;
  out[M432] = 0;
  out[M433] = 1;
}
