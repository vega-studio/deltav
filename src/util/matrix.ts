import { apply2, apply3, apply4, Vec2, Vec3, Vec3Compat, Vec4 } from "./vector";

const { cos, sin, tan } = Math;

// prettier-ignore
export type Mat2x2 = [
  number, number,
  number, number
];

// prettier-ignore
export type Mat3x3 = [
  number, number, number,
  number, number, number,
  number, number, number
];

// prettier-ignore
export type Mat4x4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

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
 * It's often much faster to apply values to an existing matrix than to declare a new matrix inline. But it can be
 * annoying and bulky to write the complete array to value sequence to perform such an application. Thus, this method
 * exists to make the process a little more bearable.
 */
export function apply2x2(
  m: Mat2x2 | undefined,
  m00: number,
  m01: number,
  m10: number,
  m11: number
) {
  m = m || (([] as any) as Mat2x2);
  m[0] = m00;
  m[1] = m01;
  m[2] = m10;
  m[3] = m11;

  return m;
}

/**
 * It's often much faster to apply values to an existing matrix than to declare a new matrix inline. But it can be
 * annoying and bulky to write the complete array to value sequence to perform such an application. Thus, this method
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
  m = m || (([] as any) as Mat3x3);
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
 * It's often much faster to apply values to an existing matrix than to declare a new matrix inline. But it can be
 * annoying and bulky to write the complete array to value sequence to perform such an application. Thus, this method
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
  m = m || (([] as any) as Mat4x4);

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
 * In many of these methods, there are moments that temporary matrices are needed to store some results. Rather than
 * allot and consume memory for temp matrices and degrade performance, these will provide some containers to work with.
 * The values in these containers should never be assumed upon entry of a method, nor shall these be used to make two
 * methods operate together.
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
export function determinant2x2(mat: Mat2x2) {
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
 * Calculates the inverse of ONLY purely affine transforms. A general inverse is considered too
 * computationally expensive and alternative strategies should be considered.
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
 * Calculates the inverse of ONLY purely affine transforms. A general inverse is considered too
 * computationally expensive and alternative strategies should be considered.
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
 * Calculates the inverse of ONLY purely affine transforms. A general inverse is considered too
 * computationally expensive and alternative strategies should be considered.
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
  return apply4x4(out,
        right[0] * left[0] + right[1] * left[4] + right[2] * left[8] + right[3] * left[12],     right[0] * left[1] + right[1] * left[5] + right[2] * left[9] + right[3] * left[13],     right[0] * left[2] + right[1] * left[6] + right[2] * left[10] + right[3] * left[14],     right[0] * left[3] + right[1] * left[7] + right[2] * left[11] + right[3] * left[15],
        right[4] * left[0] + right[5] * left[4] + right[6] * left[8] + right[7] * left[12],     right[4] * left[1] + right[5] * left[5] + right[6] * left[9] + right[7] * left[13],     right[4] * left[2] + right[5] * left[6] + right[6] * left[10] + right[7] * left[14],     right[4] * left[3] + right[5] * left[7] + right[6] * left[11] + right[7] * left[15],
      right[8] * left[0] + right[9] * left[4] + right[10] * left[8] + right[11] * left[12],   right[8] * left[1] + right[9] * left[5] + right[10] * left[9] + right[11] * left[13],   right[8] * left[2] + right[9] * left[6] + right[10] * left[10] + right[11] * left[14],   right[8] * left[3] + right[9] * left[7] + right[10] * left[11] + right[11] * left[15],
    right[12] * left[0] + right[13] * left[4] + right[14] * left[8] + right[15] * left[12], right[12] * left[1] + right[13] * left[5] + right[14] * left[9] + right[15] * left[13], right[12] * left[2] + right[13] * left[6] + right[14] * left[10] + right[15] * left[14], right[12] * left[3] + right[13] * left[7] + right[14] * left[11] + right[15] * left[15]
  );
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
 * Hadamard product of two matrices. This is essentially multiplying each element by each element between the two.
 * 4 OPS
 */
export function Hadamard2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2 {
  // prettier-ignore
  return apply2x2(out,
    left[0] * right[0], left[1] * right[1],
    left[2] * right[2], left[3] * right[3]
  );
}

/**
 * Hadamard product of two matrices. This is essentially multiplying each element by each element between the two.
 * 9 OPS
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
 * Hadamard product of two matrices. This is essentially multiplying each element by each element between the two.
 * 16 OPS
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
 * This makes a shear 2d matrix that shears parallel to the x-axis.
 * The radians should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and beyond.
 */
export function shearX2x2(radians: number, out?: Mat2x2): Mat2x2 {
  if (radians >= Math.PI / 2 || radians <= Math.PI / 2) {
    console.warn("A shear matrix can not have radians >+ PI / 2 or <= -PI / 2");
  }

  out = out || identity2();

  return apply2x2(out, 1, 0, tan(radians), 1);
}

/**
 * This makes a shear 2d matrix that shears parallel to the y-axis.
 * The radians should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and beyond.
 */
export function shearY2x2(radians: number, out?: Mat2x2): Mat2x2 {
  if (radians >= Math.PI / 2 || radians <= Math.PI / 2) {
    console.warn("A shear matrix can not have radians >+ PI / 2 or <= -PI / 2");
  }

  out = out || identity2();

  return apply2x2(out, 1, 0, tan(radians), 1);
}

/**
 * This makes a shear 3d matrix that shears parallel to the x-axis.
 * The radians should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and beyond.
 */
export function shearX4x4(radians: number, out?: Mat4x4): Mat4x4 {
  if (radians >= Math.PI / 2 || radians <= Math.PI / 2) {
    console.warn("A shear matrix can not have radians >+ PI / 2 or <= -PI / 2");
  }

  out = out || identity4();
  const shear = tan(radians);

  // prettier-ignore
  return apply4x4(
    out,
    1, shear, shear, 0,
    shear, 1, 0, 0,
    shear, 0, 1, 0,
    0, 0, 0, 1
  );
}

/**
 * This makes a shear 3d matrix that shears parallel to the y-axis.
 * The radians should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and beyond.
 */
export function shearY4x4(radians: number, out?: Mat4x4): Mat4x4 {
  if (radians >= Math.PI / 2 || radians <= Math.PI / 2) {
    console.warn("A shear matrix can not have radians >+ PI / 2 or <= -PI / 2");
  }

  out = out || identity4();
  const shear = tan(radians);

  // prettier-ignore
  return apply4x4(
    out,
    1, shear, 0, 0,
    shear, 1, shear, 0,
    0, shear, 1, 0,
    0, 0, 0, 1
  );
}

/**
 * This makes a shear 3d matrix that shears parallel to the z-axis.
 * The radians should be input as a value between, non inclusive (-90 degrees, 90 degrees).
 * A shear >= 90 degrees is non-sensical as it would shear to infinity and beyond.
 */
export function shearZ4x4(radians: number, out?: Mat4x4): Mat4x4 {
  if (radians >= Math.PI / 2 || radians <= Math.PI / 2) {
    console.warn("A shear matrix can not have radians >+ PI / 2 or <= -PI / 2");
  }

  out = out || identity4();
  const shear = tan(radians);

  return apply4x4(
    out,
    1, 0, shear, 0,
    0, 1, shear, 0,
    shear, shear, 1, 0,
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
 * Transforms a Vec3 by the provided matrix but treats the Vec3 as a [x, y, z, 1] Vec4.
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
 * We only support Euler X then Y then Z rotations. Specify the rotation values for each axis to
 * receive a matrix that will perform rotations by that amount in that order.
 */
export function rotation4x4(x: number, y: number, z: number, out?: Mat4x4) {
  if (x) {
    if (y) {
      if (z) {
        // x, y, z
        const c0 = cos(x);
        const c1 = cos(y);
        const c2 = cos(z);
        const s0 = sin(x);
        const s1 = sin(y);
        const s2 = sin(z);

        // prettier-ignore
        return apply4x4(out,
          c1 * c2,  - c1 * s2, s1, 0,
          s0 * s1 * c2 + c0 * s2, -s0 * s1 * s2 + c0 * c2, -s0 * c1, 0,
          s0 * s2 - c0 * s1 * c2, s0 * c2 + c0 * s1 * s2, c0 * c1, 0,
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
          cy, 0, sy, 0,
        sx * sy, cx, -sx * cy, 0,
        -cx * sy, sx, cx * cy, 0,
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
          cz, -sz, 0, 0,
          cx * sz, cx * cz, -sx, 0,
          sx * sz, sx * cz, cx, 0,
          0, 0, 0, 1
        );
      } else {
        // x
        const cx = cos(x);
        const sx = sin(x);

        // prettier-ignore
        return apply4x4(out,
           1,  0,  0, 0,
           0,  cx, -sx, 0,
           0,  sx, cx, 0,
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
          cy * cz, -cy * sz, sy, 0,
          sz, cz, 0, 0,
          -sy * cz, sy * sz, cy, 0,
          0, 0, 0, 1
       );
      } else {
        // y
        const cy = cos(y);
        const sy = sin(y);

        // prettier-ignore
        return apply4x4(out,
          cy, 0, sy, 0,
           0, 1,   0, 0,
          -sy, 0,  cy, 0,
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
          cz, -sz, 0, 0,
         sz, cz, 0, 0,
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
 * We only support Euler X then Y then Z rotations. Specify the rotation values for each axis to
 * receive a matrix that will perform rotations by that amount in that order.
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
 * Generate a projection matrix with perspective
 */
export function perspective4x4(
  fovRadians: number,
  aspectRatio: number,
  near: number,
  far: number,
  out?: Mat4x4
): Mat4x4 {
  const f = 1.0 / Math.tan(fovRadians / 2);
  const rangeInv = 1 / (near - far);

  // prettier-ignore
  return apply4x4(out,
    f / aspectRatio, 0,                         0,  0,
    0,               f,                         0,  0,
    0,               0,   (near + far) * rangeInv, -1,
    0,               0, near * far * rangeInv * 2,  0
  );
}

/**
 * Generate a projection matrix with no perspective. Useful for flat 2D or isometric rendering or other similar special
 * case renderings.
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
