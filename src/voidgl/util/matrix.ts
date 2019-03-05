import { Vec2Compat, Vec3Compat } from "./vector";

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

export function determinant2x2(mat: Mat2x2) {
  return mat[3] * mat[0] - mat[1] * mat[2];
}

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

export function determinant4x4(mat: Mat4x4): number {
  const m0: Mat3x3 = [
    mat[5],
    mat[6],
    mat[7],
    mat[9],
    mat[10],
    mat[11],
    mat[13],
    mat[14],
    mat[15]
  ];
  const m1: Mat3x3 = [
    mat[4],
    mat[6],
    mat[7],
    mat[8],
    mat[10],
    mat[11],
    mat[12],
    mat[14],
    mat[15]
  ];
  const m2: Mat3x3 = [
    mat[4],
    mat[5],
    mat[7],
    mat[8],
    mat[9],
    mat[11],
    mat[12],
    mat[13],
    mat[15]
  ];
  const m3: Mat3x3 = [
    mat[4],
    mat[5],
    mat[6],
    mat[8],
    mat[9],
    mat[10],
    mat[12],
    mat[13],
    mat[14]
  ];

  return (
    mat[0] * determinant3x3(m0) -
    mat[1] * determinant3x3(m1) +
    mat[2] * determinant3x3(m2) -
    mat[3] * determinant3x3(m3)
  );
}

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
    m7 / determiant,
    m2 / determiant,
    -m5 / determiant,
    m8 / determiant
  ];
}

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
    (mat[12] * s5 - mat[13] * s4 + mat[14] * s3) / determiant,
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

export function multiplyScalar2x2(mat: Mat2x2, scale: number): Mat2x2 {
  return [mat[0] * scale, mat[1] * scale, mat[2] * scale, mat[3] * scale];
}

export function multiplyScalar3x3(mat: Mat3x3, scale: number): Mat3x3 {
  return [
    mat[0] * scale,
    mat[1] * scale,
    mat[2] * scale,
    mat[3] * scale,
    mat[4] * scale,
    mat[5] * scale,
    mat[6] * scale,
    mat[7] * scale,
    mat[8] * scale
  ];
}

export function multiplyScalar4x4(mat: Mat4x4, scale: number): Mat4x4 {
  return [
    mat[0] * scale,
    mat[1] * scale,
    mat[2] * scale,
    mat[3] * scale,
    mat[4] * scale,
    mat[5] * scale,
    mat[6] * scale,
    mat[7] * scale,
    mat[8] * scale,
    mat[9] * scale,
    mat[10] * scale,
    mat[11] * scale,
    mat[12] * scale,
    mat[13] * scale,
    mat[14] * scale,
    mat[15] * scale
  ];
}

export function scale3x3by2(p: Vec2Compat): Mat3x3 { return scale3x3(p[0], p[1]); }

export function scale3x3(x: number, y: number): Mat3x3 {
  return [
    x, 0, 0,
    0, y, 0,
    0, 0, 1
  ];
}
/**
 * Creates a scaling matrix from a vector
 */
export function scale4x4by3(p: Vec3Compat): Mat4x4 { return scale4x4(p[0], p[1], p[2]); }

/**
 * Creates a scaling matrix
 */
export function scale4x4(x: number, y: number, z: number): Mat4x4 {
  return [
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1
  ];
}

export function translation3x3by2(t: Vec2Compat): Mat3x3 { return translation3x3(t[0], t[1]); }

export function translation3x3(x: number, y: number): Mat3x3 {
  return [
    1, 0, 0,
    0, 1, 0,
    x, y, 1
  ];
}

/**
 * Creates a translation Matrix from a vector
 */
export function translation4x4by3(t: Vec3Compat): Mat4x4 { return translation4x4(t[0], t[1], t[2]); }

/**
 * Creates a translation Matrix
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
 * Generates a projection matrix with perspective
 */
export function perspective4x4(fovRadian: number, aspectRatio: number, near: number, far: number): Mat4x4 {
  const f = 1.0 / Math.tan(fovRadian / 2.0);
  const rangeInv = 1.0 / (near - far);

  return [
    f / aspectRatio, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0
  ];
}

/**
 * Generates a projection matrix with no perspective. Useful for flat 2D or isometric rendering.
 */
export function orthographic4x4(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4x4 {
  return [
    2 / (right - left), 0, 0, 0,
    0, 2 / (top - bottom), 0, 0,
    0, 0, 2 / (near - far), 0,
    (left + right) / (left - right), (top + bottom) / (bottom - top), (near + far) / (near - far), 1
  ];
}

export function rotationAxis3x3(x: number, y: number, z: number, radian: number): Mat3x3 {
  const r = Math.sqrt(x * x + y * y + z * z);
  const u = x / r;
  const v = y / r;
  const w = z / r;

  return [
    // r00
    u * u + (1 - u * u) * Math.cos(radian),
    // r01
    u * v * (1 - Math.cos(radian)) + w * Math.sin(radian),
    // r02
    u * w * (1 - Math.cos(radian)) - v * Math.sin(radian),
    // r10
    u * v * (1 - Math.cos(radian)) - w * Math.sin(radian),
    // r11
    v * v + (1 - v * v) * Math.cos(radian),
    // r12
    v * w + (1 - Math.cos(radian)) + u * Math.sin(radian),
    // r20
    u * w * (1 - Math.cos(radian)) + v * Math.sin(radian),
    // r21
    v * w * (1 - Math.cos(radian)) - u * Math.sin(radian),
    // r22
    w * w + (1 - w * w) * Math.cos(radian)
  ];
}

export function rotationAxis4x4(x: number, y: number, z: number, radian: number): Mat4x4 {
  const r = Math.sqrt(x * x + y * y + z * z);
  const u = x / r;
  const v = y / r;
  const w = z / r;

  return [
    // r00
    u * u + (1 - u * u) * Math.cos(radian),
    // r01
    u * v * (1 - Math.cos(radian)) + w * Math.sin(radian),
    // r02
    u * w * (1 - Math.cos(radian)) - v * Math.sin(radian),
    // r03
    0,
    // r10
    u * v * (1 - Math.cos(radian)) - w * Math.sin(radian),
    // r11
    v * v + (1 - v * v) * Math.cos(radian),
    // r12
    v * w + (1 - Math.cos(radian)) + u * Math.sin(radian),
    // r13
    0,
    // r20
    u * w * (1 - Math.cos(radian)) + v * Math.sin(radian),
    // r21
    v * w * (1 - Math.cos(radian)) - u * Math.sin(radian),
    // r22
    w * w + (1 - w * w) * Math.cos(radian),
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

export function rotationEuler3x3(xRadian: number, yRadian: number, zRadian: number): Mat3x3 {
  return  multiply3x3(
    multiply3x3(rotationAxis3x3(1, 0 , 0, xRadian), rotationAxis3x3(0, 1, 0, yRadian)),
    rotationAxis3x3(0, 0, 1, zRadian)
  );
}

export function rotationEuler4x4(xRadian: number, yRadian: number, zRadian: number): Mat4x4 {
  return  multiply4x4(
    multiply4x4(rotationAxis4x4(1, 0 , 0, xRadian), rotationAxis4x4(0, 1, 0, yRadian)),
    rotationAxis4x4(0, 0, 1, zRadian)
  );
}

export function identity2(): Mat2x2 {
  return [1, 0, 0, 1];
}

export function identity3(): Mat3x3 {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

export function identity4(): Mat4x4 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function multiply2x2(left: Mat2x2, right: Mat2x2): Mat2x2 {
  return [
    // r0
    left[0] * right[0] + left[1] * right[2],
    // r1
    left[0] * right[1] + left[1] * right[3],
    // r2
    left[2] * right[0] + left[3] * right[2],
    // r3
    left[2] * right[1] + left[1] * right[3]
  ];
}

export function multiply3x3(left: Mat3x3, right: Mat3x3): Mat3x3 {
  return [
    // r0
    left[0] * right[0] + left[1] * right[3] + left[2] * right[6],
    // r1
    left[0] * right[1] + left[1] * right[4] + left[2] * right[7],
    // r2
    left[0] * right[2] + left[1] * right[5] + left[2] * right[8],
    // r3
    left[3] * right[0] + left[4] * right[3] + left[5] * right[6],
    // r4
    left[3] * right[1] + left[4] * right[4] + left[5] * right[7],
    // r5
    left[3] * right[2] + left[4] * right[5] + left[5] * right[8],
    // r6
    left[6] * right[0] + left[7] * right[3] + left[8] * right[6],
    // r7
    left[6] * right[1] + left[7] * right[4] + left[8] * right[7],
    // r8
    left[6] * right[2] + left[7] * right[5] + left[8] * right[8]
  ];
}

export function multiply4x4(left: Mat4x4, right: Mat4x4): Mat4x4 {
  return [
    // r0
    left[0] * right[0] +
      left[1] * right[4] +
      left[2] * right[8] +
      left[3] * right[12],
    // r1
    left[0] * right[1] +
      left[1] * right[5] +
      left[2] * right[9] +
      left[3] * right[13],
    // r2
    left[0] * right[2] +
      left[1] * right[6] +
      left[2] * right[10] +
      left[3] * right[14],
    // r3
    left[0] * right[3] +
      left[1] * right[7] +
      left[2] * right[11] +
      left[3] * right[15],
    // r4
    left[4] * right[0] +
      left[5] * right[4] +
      left[6] * right[8] +
      left[7] * right[12],
    // r5
    left[4] * right[1] +
      left[5] * right[5] +
      left[6] * right[9] +
      left[7] * right[13],
    // r6
    left[4] * right[2] +
      left[5] * right[6] +
      left[6] * right[10] +
      left[7] * right[14],
    // r7
    left[4] * right[3] +
      left[5] * right[7] +
      left[6] * right[11] +
      left[7] * right[15],
    // r8
    left[8] * right[0] +
      left[9] * right[4] +
      left[10] * right[8] +
      left[11] * right[12],
    // r9
    left[8] * right[1] +
      left[9] * right[5] +
      left[10] * right[9] +
      left[11] * right[13],
    // r10
    left[8] * right[2] +
      left[9] * right[6] +
      left[10] * right[10] +
      left[11] * right[14],
    // r11
    left[8] * right[3] +
      left[9] * right[7] +
      left[10] * right[11] +
      left[11] * right[15],
    // r12
    left[12] * right[0] +
      left[13] * right[4] +
      left[14] * right[8] +
      left[15] * right[12],
    // r13
    left[12] * right[1] +
      left[13] * right[5] +
      left[14] * right[9] +
      left[15] * right[13],
    // r14
    left[12] * right[2] +
      left[13] * right[6] +
      left[14] * right[10] +
      left[15] * right[14],
    // r15
    left[12] * right[3] +
      left[13] * right[7] +
      left[14] * right[11] +
      left[15] * right[15]
  ];
}

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

export function subtract2x2(left: Mat2x2, right: Mat2x2): Mat2x2 {
  return [
    // r0
    left[0] - right[0],
    // r1
    left[1] - right[1],
    // r2
    left[2] - right[2],
    // r3
    left[3] - right[3]
  ];
}

export function subtract3x3(left: Mat3x3, right: Mat3x3): Mat3x3 {
  return [
    // r0
    left[0] - right[0],
    // r1
    left[1] - right[1],
    // r2
    left[2] - right[2],
    // r3
    left[3] - right[3],
    // r4
    left[4] - right[4],
    // r5
    left[5] - right[5],
    // r6,
    left[6] - right[6],
    // r7,
    left[7] - right[7],
    // r8,
    left[8] - right[8]
  ];
}

export function subtract4x4(left: Mat4x4, right: Mat4x4): Mat4x4 {
  return [
    // r0
    left[0] - right[0],
    // r1
    left[1] - right[1],
    // r2
    left[2] - right[2],
    // r3
    left[3] - right[3],
    // r4
    left[4] - right[4],
    // r5
    left[5] - right[5],
    // r6,
    left[6] - right[6],
    // r7,
    left[7] - right[7],
    // r8,
    left[8] - right[8],
    // r9,
    left[9] - right[9],
    // r10,
    left[10] - right[10],
    // r11,
    left[11] - right[11],
    // r12,
    left[12] - right[12],
    // r13,
    left[13] - right[13],
    // r14,
    left[14] - right[14],
    // r15
    left[15] - right[15]
  ];
}

export function Hadamard2x2(left: Mat2x2, right: Mat2x2): Mat2x2 {
  return [
    // r0
    left[0] * right[0],
    // r1
    left[1] * right[1],
    // r2
    left[2] * right[2],
    // r3
    left[3] * right[3]
  ];
}

export function Hadamard3x3(left: Mat3x3, right: Mat3x3): Mat3x3 {
  return [
    // r0
    left[0] * right[0],
    // r1
    left[1] * right[1],
    // r2
    left[2] * right[2],
    // r3
    left[3] * right[3],
    // r4
    left[4] * right[4],
    // r5
    left[5] * right[5],
    // r6,
    left[6] * right[6],
    // r7,
    left[7] * right[7],
    // r8,
    left[8] * right[8]
  ];
}

export function Hadamard4x4(left: Mat4x4, right: Mat4x4): Mat4x4 {
  return [
    // r0
    left[0] * right[0],
    // r1
    left[1] * right[1],
    // r2
    left[2] * right[2],
    // r3
    left[3] * right[3],
    // r4
    left[4] * right[4],
    // r5
    left[5] * right[5],
    // r6,
    left[6] * right[6],
    // r7,
    left[7] * right[7],
    // r8,
    left[8] * right[8],
    // r9,
    left[9] * right[9],
    // r10,
    left[10] * right[10],
    // r11,
    left[11] * right[11],
    // r12,
    left[12] * right[12],
    // r13,
    left[13] * right[13],
    // r14,
    left[14] * right[14],
    // r15
    left[15] * right[15]
  ];
}

export function transpose2x2(mat: Mat2x2): Mat2x2 {
  return [mat[0], mat[2], mat[1], mat[3]];
}

export function transpose3x3(mat: Mat3x3): Mat3x3 {
  return [
    mat[0],
    mat[3],
    mat[6],
    mat[1],
    mat[4],
    mat[7],
    mat[2],
    mat[5],
    mat[8]
  ];
}

export function transpose4x4(mat: Mat4x4): Mat4x4 {
  return [
    mat[0],
    mat[4],
    mat[8],
    mat[12],
    mat[1],
    mat[5],
    mat[9],
    mat[13],
    mat[2],
    mat[6],
    mat[10],
    mat[14],
    mat[3],
    mat[7],
    mat[11],
    mat[15]
  ];
}
