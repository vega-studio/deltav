import { Vec2Compat, Vec3, Vec3Compat, Vec4 } from "./vector";

export type Mat2x2 = [number, number, number, number];

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
 * Mat2x2 add operation
 */
export function add2x2(left: Mat2x2, right: Mat2x2): Mat2x2 {
  return [
    // r0
    left[0] + right[0],
    // r1
    left[1] + right[1],
    // r2
    left[2] + right[2],
    // r3
    left[3] + right[3]
  ];
}

/**
 * Mat3x3 add operation
 */
export function add3x3(left: Mat3x3, right: Mat3x3): Mat3x3 {
  return [
    // r0
    left[0] + right[0],
    // r1
    left[1] + right[1],
    // r2
    left[2] + right[2],
    // r3
    left[3] + right[3],
    // r4
    left[4] + right[4],
    // r5
    left[5] + right[5],
    // r6,
    left[6] + right[6],
    // r7,
    left[7] + right[7],
    // r8,
    left[8] + right[8]
  ];
}

/**
 * Mat4x4 add operation
 */
export function add4x4(left: Mat4x4, right: Mat4x4): Mat4x4 {
  return [
    // r0
    left[0] + right[0],
    // r1
    left[1] + right[1],
    // r2
    left[2] + right[2],
    // r3
    left[3] + right[3],
    // r4
    left[4] + right[4],
    // r5
    left[5] + right[5],
    // r6,
    left[6] + right[6],
    // r7,
    left[7] + right[7],
    // r8,
    left[8] + right[8],
    // r9,
    left[9] + right[9],
    // r10,
    left[10] + right[10],
    // r11,
    left[11] + right[11],
    // r12,
    left[12] + right[12],
    // r13,
    left[13] + right[13],
    // r14,
    left[14] + right[14],
    // r15
    left[15] + right[15]
  ];
}

/**
 * affineInverse of Mat2x2
 */
export function affineInverse2x2(mat: Mat2x2): Mat2x2 | null {
  const determinant = determinant2x2(mat);
  if (determinant === 0) return null;
  return [
    mat[3] / determinant,
    -mat[1] / determinant,
    -mat[2] / determinant,
    mat[0] / determinant
  ];
}

/**
 * affineInverse of Mat3x3
 */
export function affineInverse3x3(mat: Mat3x3): Mat3x3 | null {
  const determiant = determinant3x3(mat);
  if (determiant === 0) return null;
  const m0 = determinant2x2([mat[4], mat[5], mat[7], mat[8]]);
  const m1 = determinant2x2([mat[3], mat[5], mat[6], mat[8]]);
  const m2 = determinant2x2([mat[3], mat[4], mat[6], mat[7]]);
  const m3 = determinant2x2([mat[1], mat[2], mat[7], mat[8]]);
  const m4 = determinant2x2([mat[0], mat[2], mat[6], mat[8]]);
  const m5 = determinant2x2([mat[0], mat[1], mat[6], mat[7]]);
  const m6 = determinant2x2([mat[1], mat[2], mat[4], mat[5]]);
  const m7 = determinant2x2([mat[0], mat[2], mat[3], mat[5]]);
  const m8 = determinant2x2([mat[0], mat[1], mat[3], mat[4]]);

  return [
    m0 / determiant,
    -m3 / determiant,
    m6 / determiant,
    -m1 / determiant,
    m4 / determiant,
    -m7 / determiant,
    m2 / determiant,
    -m5 / determiant,
    m8 / determiant
  ];
}

/**
 * affineInverse of Mat3x3
 */
export function affineInverse4x4(mat: Mat4x4): Mat4x4 | null {
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

  return [
    // r00
    (mat[5] * c5 - mat[6] * c4 + mat[7] * c3) / determiant,
    // r01
    (-mat[1] * c5 + mat[2] * c4 - mat[3] * c3) / determiant,
    // r02
    (mat[13] * s5 - mat[14] * s4 + mat[15] * s3) / determiant,
    // r03
    (-mat[9] * s5 + mat[10] * s4 - mat[11] * s3) / determiant,
    // r10
    (-mat[4] * c5 + mat[6] * c2 - mat[7] * c1) / determiant,
    // r11
    (mat[0] * c5 - mat[2] * c2 + mat[3] * c1) / determiant,
    // r12
    (-mat[12] * s5 + mat[14] * s2 - mat[15] * s1) / determiant,
    // r13
    (mat[8] * s5 - mat[10] * s2 + mat[11] * s1) / determiant,
    // r20
    (mat[4] * c4 - mat[5] * c2 + mat[7] * c0) / determiant,
    // r21
    (-mat[0] * c4 + mat[1] * c2 - mat[3] * c0) / determiant,
    // r22
    (mat[12] * s4 - mat[13] * s2 + mat[15] * s0) / determiant,
    // r23
    (-mat[8] * s4 + mat[9] * s2 - mat[11] * s0) / determiant,
    // r30
    (-mat[4] * c3 + mat[5] * c1 - mat[6] * c0) / determiant,
    // r31
    (mat[0] * c3 - mat[1] * c1 + mat[2] * c0) / determiant,
    // r32
    (-mat[12] * s3 + mat[13] * s1 - mat[14] * s0) / determiant,
    // r33
    (mat[8] * s3 - mat[9] * s1 + mat[10] * s0) / determiant
  ];
}

/**
 * determinant of Mat2x2
 */
export function determinant2x2(mat: Mat2x2) {
  return mat[3] * mat[0] - mat[1] * mat[2];
}

/**
 * determinant of Mat3x3
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
 * determinant of Mat4x4
 */
export function determinant4x4(mat: Mat4x4): number {
  const m0: Mat3x3 = [
    mat[5], mat[6], mat[7],
    mat[9], mat[10], mat[11],
    mat[13], mat[14], mat[15]
  ];
  const m1: Mat3x3 = [
    mat[4], mat[6], mat[7],
    mat[8], mat[10], mat[11],
    mat[12], mat[14], mat[15]
  ];
  const m2: Mat3x3 = [
    mat[4], mat[5], mat[7],
    mat[8], mat[9], mat[11],
    mat[12], mat[13], mat[15]
  ];
  const m3: Mat3x3 = [
    mat[4], mat[5], mat[6],
    mat[8], mat[9], mat[10],
    mat[12], mat[13], mat[14]
  ];

  return (
    mat[0] * determinant3x3(m0) -
    mat[1] * determinant3x3(m1) +
    mat[2] * determinant3x3(m2) -
    mat[3] * determinant3x3(m3)
  );
}

/**
 * hadamard product of Mat2x2
 */
export function hadamard2x2(left: Mat2x2, right: Mat2x2): Mat2x2 {
  return [
    left[0] * right[0], left[1] * right[1],
    left[2] * right[2], left[3] * right[3]
  ];
}

/**
 * hadamard product of Mat3x3
 */
export function hadamard3x3(left: Mat3x3, right: Mat3x3): Mat3x3 {
  return [
    left[0] * right[0], left[1] * right[1], left[2] * right[2],
    left[3] * right[3], left[4] * right[4], left[5] * right[5],
    left[6] * right[6], left[7] * right[7], left[8] * right[8]
  ];
}

/**
 * hadamard product of Mat4x4
 */
export function hadamard4x4(left: Mat4x4, right: Mat4x4): Mat4x4 {
  return [
    left[0] * right[0], left[1] * right[1], left[2] * right[2], left[3] * right[3],
    left[4] * right[4], left[5] * right[5], left[6] * right[6], left[7] * right[7],
    left[8] * right[8], left[9] * right[9], left[10] * right[10], left[11] * right[11],
    left[12] * right[12], left[13] * right[13], left[14] * right[14], left[15] * right[15]
  ];
}

/**
 * return identity of Mat2x2
 */
export function identity2(): Mat2x2 {
  return [
    1, 0,
    0, 1
  ];
}

/**
 * return identity of Mat3x3
 */
export function identity3(): Mat3x3 {
  return [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ];
}

/**
 * return identity of Mat4x4
 */
export function identity4(): Mat4x4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

/**
 * scalar multiply of Mat2x2
 */
export function multiplyScalar2x2(mat: Mat2x2, scale: number): Mat2x2 {
  return [mat[0] * scale, mat[1] * scale, mat[2] * scale, mat[3] * scale];
}

/**
 * scalar multiply of Mat3x3
 */
export function multiplyScalar3x3(mat: Mat3x3, scale: number): Mat3x3 {
  return [
    mat[0] * scale, mat[1] * scale, mat[2] * scale,
    mat[3] * scale, mat[4] * scale, mat[5] * scale,
    mat[6] * scale, mat[7] * scale, mat[8] * scale
  ];
}

/**
 * scalar multiply of Mat4x4
 */
export function multiplyScalar4x4(mat: Mat4x4, scale: number): Mat4x4 {
  return [
    mat[0] * scale, mat[1] * scale, mat[2] * scale, mat[3] * scale,
    mat[4] * scale, mat[5] * scale, mat[6] * scale, mat[7] * scale,
    mat[8] * scale, mat[9] * scale, mat[10] * scale, mat[11] * scale,
    mat[12] * scale, mat[13] * scale, mat[14] * scale, mat[15] * scale
  ];
}

/**
 * Mat2x2 multiplies Mat2x2
 */
export function multiply2x2(left: Mat2x2, right: Mat2x2): Mat2x2 {
  return [
    left[0] * right[0] + left[2] * right[1], left[1] * right[0] + left[3] * right[1],
    left[0] * right[2] + left[2] * right[3], left[1] * right[2] + left[3] * right[3]
  ];
}

/**
 * Mat3x3 multiplies Mat2x2
 */
export function multiply3x3(left: Mat3x3, right: Mat3x3): Mat3x3 {
  return [
    // r0
    left[0] * right[0] + left[3] * right[1] + left[6] * right[2],
    // r1
    left[1] * right[0] + left[4] * right[1] + left[7] * right[2],
    // r2
    left[2] * right[0] + left[5] * right[1] + left[8] * right[2],
    // r3
    left[0] * right[3] + left[3] * right[4] + left[6] * right[5],
    // r4
    left[1] * right[3] + left[4] * right[4] + left[7] * right[5],
    // r5
    left[2] * right[3] + left[5] * right[4] + left[8] * right[5],
    // r6
    left[0] * right[6] + left[3] * right[7] + left[6] * right[8],
    // r7
    left[1] * right[6] + left[4] * right[7] + left[7] * right[8],
    // r8
    left[2] * right[6] + left[5] * right[7] + left[8] * right[8]
  ];
}

/**
 * Mat4x4 multiplies Matx4x4
 */
export function multiply4x4(left: Mat4x4, right: Mat4x4): Mat4x4 {
  return [
    // r0
    left[0] * right[0] + left[4] * right[1] + left[8] * right[2] + left[12] * right[3],
    // r1
    left[1] * right[0] + left[5] * right[1] + left[9] * right[2] + left[13] * right[3],
    // r2
    left[2] * right[0] + left[6] * right[1] + left[10] * right[2] + left[14] * right[3],
    // r3
    left[3] * right[0] + left[7] * right[1] + left[11] * right[2] + left[15] * right[3],
    // r4
    left[0] * right[4] + left[4] * right[5] + left[8] * right[6] + left[12] * right[7],
    // r5
    left[1] * right[4] + left[5] * right[5] + left[9] * right[6] + left[13] * right[7],
    // r6
    left[2] * right[4] + left[6] * right[5] + left[10] * right[6] + left[14] * right[7],
    // r7
    left[3] * right[4] + left[7] * right[5] + left[11] * right[6] + left[15] * right[7],
    // r8
    left[0] * right[8] + left[4] * right[9] + left[8] * right[10] + left[12] * right[11],
    // r9
    left[1] * right[8] + left[5] * right[9] + left[9] * right[10] + left[13] * right[11],
    // r10
    left[2] * right[8] + left[6] * right[9] + left[10] * right[10] + left[14] * right[11],
    // r11
    left[3] * right[8] + left[7] * right[9] + left[11] * right[10] + left[15] * right[11],
    // r12
    left[0] * right[12] + left[4] * right[13] + left[8] * right[14] + left[12] * right[15],
    // r13
    left[1] * right[12] + left[5] * right[13] + left[9] * right[14] + left[13] * right[15],
    // r14
    left[2] * right[12] + left[6] * right[13] + left[10] * right[14] + left[14] * right[15],
    // r15
    left[3] * right[12] + left[7] * right[13] + left[11] * right[14] + left[15] * right[15]
  ];
}

/**
 * Mat3x3 multiplies Vec3
 */
export function multiply3x3by3(mat: Mat3x3, vec: Vec3): Vec3 {
  return [
    mat[0] * vec[0] + mat[3] * vec[1] + mat[6] * vec[2],
    mat[1] * vec[0] + mat[4] * vec[1] + mat[7] * vec[2],
    mat[2] * vec[0] + mat[5] * vec[1] + mat[8] * vec[2]
  ];
}

/**
 * Mat4x4 multiplies Vec3 and w
 */
export function multiply4x4by3(
  mat: Mat4x4,
  vec: Vec3,
  isRotation: boolean
): Vec4 {
  const w = isRotation ? 0 : 1;
  return [
    mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2] + mat[12] * w,
    mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2] + mat[13] * w,
    mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14] * w,
    mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15] * w
  ];
}

/**
 * Mat4x4 multiplies Vec4
 */
export function multiply4x4by4(mat: Mat4x4, vec: Vec4): Vec4 {
  return [
    mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2] + mat[12] * vec[3],
    mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2] + mat[13] * vec[3],
    mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14] * vec[3],
    mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15] * vec[3]
  ];
}

/**
 * Generates a projection matrix with no perspective. Useful for flat 2D or isometric rendering.
 */
export function orthographic4x4(
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number
): Mat4x4 {
  return [
    2 / (right - left),              0,                               0,                           0,
    0,                               2 / (top - bottom),              0,                           0,
    0,                               0,                               2 / (near - far),            0,
    (left + right) / (left - right), (top + bottom) / (bottom - top), (near + far) / (near - far), 1
  ];
}

/**
 * Generates a projection matrix with perspective
 */
export function perspective4x4(
  fovRadian: number,
  aspectRatio: number,
  near: number,
  far: number
): Mat4x4 {
  const f = 1.0 / Math.tan(fovRadian / 2.0);
  const rangeInv = 1.0 / (near - far);

  return [
    f / aspectRatio, 0, 0,                         0,
    0,               f, 0,                         0,
    0,               0, (near + far) * rangeInv,   -1,
    0,               0, near * far * rangeInv * 2, 0
  ];
}

/**
 * Rotate radians around axis (x, y, z), return Mat3x3
 */
export function rotationAxis3x3(
  x: number,
  y: number,
  z: number,
  radians: number
): Mat3x3 {
  const r = Math.sqrt(x * x + y * y + z * z);
  const u = x / r;
  const v = y / r;
  const w = z / r;

  return [
    // r00
    u * u + (1 - u * u) * Math.cos(radians),
    // r01
    u * v * (1 - Math.cos(radians)) - w * Math.sin(radians),
    // r02
    u * w * (1 - Math.cos(radians)) + v * Math.sin(radians),
    // r10
    u * v * (1 - Math.cos(radians)) + w * Math.sin(radians),
    // r11
    v * v + (1 - v * v) * Math.cos(radians),
    // r12
    v * w * (1 - Math.cos(radians)) - u * Math.sin(radians),
    // r20
    u * w * (1 - Math.cos(radians)) - v * Math.sin(radians),
    // r21
    v * w * (1 - Math.cos(radians)) + u * Math.sin(radians),
    // r22
    w * w + (1 - w * w) * Math.cos(radians)
  ];
}

/**
 * Rotate radians around axis (x, y, z), return Mat4x4
 */
export function rotationAxis4x4(
  x: number,
  y: number,
  z: number,
  radians: number
): Mat4x4 {
  const r = Math.sqrt(x * x + y * y + z * z);
  const u = x / r;
  const v = y / r;
  const w = z / r;

  return [
    // r00
    u * u + (1 - u * u) * Math.cos(radians),
    // r01
    u * v * (1 - Math.cos(radians)) - w * Math.sin(radians),
    // r02
    u * w * (1 - Math.cos(radians)) + v * Math.sin(radians),
    // r03
    0,
    // r10
    u * v * (1 - Math.cos(radians)) + w * Math.sin(radians),
    // r11
    v * v + (1 - v * v) * Math.cos(radians),
    // r12
    v * w * (1 - Math.cos(radians)) - u * Math.sin(radians),
    // r13
    0,
    // r20
    u * w * (1 - Math.cos(radians)) - v * Math.sin(radians),
    // r21
    v * w * (1 - Math.cos(radians)) + u * Math.sin(radians),
    // r22
    w * w + (1 - w * w) * Math.cos(radians),
    // r23
    0,
    // r30
    0,
    // r31
    0,
    // r32
    0,
    // r33
    1
  ];
}

/**
 *        z
 *        |
 *        |
 *        | ______x
 *       /
 *      /
 *     /
 *    y
 *  Rotation uses right hand principle.
 *  This represents rotate by x, then by y and then by z.
 *  Return a Mat3x3
 */
// 2D rotation
export function rotationEuler3x3(zRadians: number): Mat3x3;
// 3D rotation
export function rotationEuler3x3(
  zRadians: number,
  yRadians: number,
  xRadians: number
): Mat3x3;
export function rotationEuler3x3(
  zRadians: number,
  yRadians?: number,
  xRadians?: number
): Mat3x3 {
  return multiply3x3(
    rotationAxis3x3(0, 0, 1, zRadians),
    multiply3x3(
      rotationAxis3x3(0, 1, 0, yRadians ? yRadians : 0),
      rotationAxis3x3(1, 0, 0, xRadians ? xRadians : 0)
    )
  );
}

/**
 *        z
 *        |
 *        |
 *        | ______x
 *       /
 *      /
 *     /
 *    y
 *  Rotation uses right hand principle.
 *  This represents rotate by x, then by y and then by z.
 *  Return a Mat4x4
 */
export function rotationEuler4x4(
  xRadians: number,
  yRadians: number,
  zRadians: number
): Mat4x4 {
  return multiply4x4(
    rotationAxis4x4(0, 0, 1, zRadians),
    multiply4x4(
      rotationAxis4x4(0, 1, 0, yRadians),
      rotationAxis4x4(1, 0, 0, xRadians)
    )
  );
}

/**
 * Substract of Mat2x2
 */
export function subtract2x2(left: Mat2x2, right: Mat2x2): Mat2x2 {
  return [
    left[0] - right[0], left[1] - right[1],
    left[2] - right[2], left[3] - right[3]
  ];
}

/**
 * Substract of Mat3x3
 */
export function subtract3x3(left: Mat3x3, right: Mat3x3): Mat3x3 {
  return [
    left[0] - right[0], left[1] - right[1], left[2] - right[2],
    left[3] - right[3], left[4] - right[4], left[5] - right[5],
    left[6] - right[6], left[7] - right[7], left[8] - right[8]
  ];
}

/**
 * Substract of Mat4x4
 */
export function subtract4x4(left: Mat4x4, right: Mat4x4): Mat4x4 {
  return [
    left[0] - right[0], left[1] - right[1], left[2] - right[2], left[3] - right[3],
    left[4] - right[4], left[5] - right[5], left[6] - right[6], left[7] - right[7],
    left[8] - right[8], left[9] - right[9], left[10] - right[10], left[11] - right[11],
    left[12] - right[12], left[13] - right[13], left[14] - right[14], left[15] - right[15]
  ];
}

/**
 * Creates a scaling matrix3x3 from a vector2
 */
export function scale3x3by2(p: Vec2Compat): Mat3x3 {
  return scale3x3(p[0], p[1]);
}

/**
 * Creates a scaling matrix3x3
 */
export function scale3x3(x: number, y: number): Mat3x3 {
  return [
    x, 0, 0,
    0, y, 0,
    0, 0, 1
  ];
}
/**
 * Creates a scaling matrix4x4 from a vector3
 */
export function scale4x4by3(p: Vec3Compat): Mat4x4 {
  return scale4x4(p[0], p[1], p[2]);
}

/**
 * Creates a scaling matrix4x4
 */
export function scale4x4(x: number, y: number, z: number): Mat4x4 {
  return [
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1
  ];
}

/**
 * Creates a skew matrix3x3
 */
export function skew3x3(
  xRadian: number,
  yRadian: number,
  zRadian: number
): Mat3x3 {
  return [0, -zRadian, yRadian, zRadian, 0, -xRadian, -yRadian, xRadian, 0];
}

/**
 * Creates a skew matrix4x4
 */
export function skew4x4(
  xRadian: number,
  yRadian: number,
  zRadian: number
): Mat4x4 {
  return [
    0,        -zRadian, yRadian,  0,
    zRadian,  0,        -xRadian, 0,
    -yRadian, xRadian,  0,        0,
    0,        0,        0,        1
  ];
}

/**
 * Creates a translation Matrix3x3 from a vector2
 */
export function translation3x3by2(t: Vec2Compat): Mat3x3 {
  return translation3x3(t[0], t[1]);
}

/**
 * Creates a translation Matrix3x3
 */
export function translation3x3(x: number, y: number): Mat3x3 {
  return [
    1, 0, 0,
    0, 1, 0,
    x, y, 1
  ];
}

/**
 * Creates a translation Matrix4x4 from a vector3
 */
export function translation4x4by3(t: Vec3Compat): Mat4x4 {
  return translation4x4(t[0], t[1], t[2]);
}

/**
 * Creates a translation Matrix4x4
 */
export function translation4x4(x: number, y: number, z: number): Mat4x4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1
  ];
}

/**
 * Creates a transpose Matrix2x2
 */
export function transpose2x2(mat: Mat2x2): Mat2x2 {
  return [
    mat[0], mat[2],
    mat[1], mat[3]
  ];
}

/**
 * Creates a transpose Matrix3x3
 */
export function transpose3x3(mat: Mat3x3): Mat3x3 {
  return [
    mat[0], mat[3], mat[6],
    mat[1], mat[4], mat[7],
    mat[2], mat[5], mat[8]
  ];
}

/**
 * Creates a transpose Matrix4x4
 */
export function transpose4x4(mat: Mat4x4): Mat4x4 {
  return [
    mat[0], mat[4], mat[8],  mat[12],
    mat[1], mat[5], mat[9],  mat[13],
    mat[2], mat[6], mat[10], mat[14],
    mat[3], mat[7], mat[11], mat[15]
  ];
}
