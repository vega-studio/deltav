import {
  EulerOrder,
  EulerRotation,
  type ReadonlyEulerRotation,
} from "../types.js";
import {
  identity3x3,
  identity4x4,
  M300,
  M301,
  M302,
  M310,
  M311,
  M312,
  M320,
  M321,
  M322,
  M400,
  M401,
  M402,
  M403,
  M410,
  M411,
  M412,
  M413,
  M420,
  M421,
  M422,
  M423,
  M430,
  M431,
  M432,
  M433,
  Mat3x3,
  Mat4x4,
  type ReadonlyMat3x3,
  type ReadonlyMat4x4,
} from "./matrix.js";
import {
  add3,
  cross3,
  dot3,
  dot4,
  normalize3,
  type ReadonlyVec3Compat,
  scale3,
  V3R,
  Vec3,
  vec3,
  Vec4,
} from "./vector.js";

const { cos, sin, sqrt, exp, acos, atan2, PI } = Math;

// We often need some variable registers that match matrix elements in a lot of
// our quaternion algorithms. We keep them in the module scope so we don't have
// to declare them in the scope of the method to reduce Garbage.
let m00: number;
let m01: number;
let m02: number;
// let m03: number;
// let m04: number;
let m10: number;
let m11: number;
let m12: number;
let m13: number;
// let m14: number;
let m20: number;
let m21: number;
let m22: number;
let m23: number;
// let m24: number;
// let m30: number;
let m31: number;
let m32: number;
let m33: number;
// let m34: number;

// Other common registers are the components of the quat
// let x: number;
// let y: number;
// let z: number;
let w: number;

// Vector registers for axes
let vx: Vec3;
let vy: Vec3;
let vz: Vec3;
// let vw: Vec3;

/** Expresses a quaternion [scalar, i, j, k] */
export type Quaternion = Vec4;
/** Expresses a readonly quaternion [scalar, i, j, k] */
export type ReadonlyQuaternion = Readonly<Vec4>;

/** Temp Quaternion register. Can be used for intermediate operations */
export const QR1 = zeroQuat();
/** Temp Quaternion register. Can be used for intermediate operations */
export const QR2 = zeroQuat();
/** Temp Quaternion register. Can be used for intermediate operations */
export const QR3 = zeroQuat();
/** Temp Quaternion register. Can be used for intermediate operations */
export const QR4 = zeroQuat();

/** Helper index to make index selection more readable if desired */
export const QX = 1;
/** Helper index to make index selection more readable if desired */
export const QY = 2;
/** Helper index to make index selection more readable if desired */
export const QZ = 3;
/** Helper index to make index selection more readable if desired */
export const QW = 0;

export function clamp(x: number, min: number, max: number) {
  if (x > max) return max;
  if (x < min) return min;
  return x;
}

/**
 * Generates a new zero quaternion
 */
export function zeroQuat(out?: Quaternion): Quaternion {
  if (out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    return out;
  }

  return [0, 0, 0, 0];
}

/**
 * Adds two quaternions.
 */
export function addQuat(
  q1: ReadonlyQuaternion,
  q2: ReadonlyQuaternion,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();
  out[0] = q1[0] + q2[0];
  out[1] = q1[1] + q2[1];
  out[2] = q1[2] + q2[2];
  out[3] = q1[3] + q2[3];

  return out;
}

/**
 * Multiplies two quaternions.
 * Note: Quaternion multiplication is noncommutative.
 */
export function multiplyQuat(
  q1: ReadonlyQuaternion,
  q2: ReadonlyQuaternion,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();

  const a1 = q1[0],
    a2 = q2[0],
    b1 = q1[1],
    b2 = q2[1],
    c1 = q1[2],
    c2 = q2[2],
    d1 = q1[3],
    d2 = q2[3];

  out[0] = a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2;
  out[1] = a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2;
  out[2] = a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2;
  out[3] = a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2;

  return out;
}

/**
 * Performs quaternion division:
 * q1 / q2 = q1 * q2^-1
 */
export function divideQuat(
  q1: ReadonlyQuaternion,
  q2: ReadonlyQuaternion,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();

  const a1 = q1[0],
    b1 = q1[1],
    c1 = q1[2],
    d1 = q1[3];

  const a2 = q2[0],
    b2 = q2[1],
    c2 = q2[2],
    d2 = q2[3];

  const norm = a2 * a2 + b2 * b2 + c2 * c2 + d2 * d2;

  if (norm === 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  } else {
    const r = 1 / norm;

    out[0] = (a1 * a2 + b1 * b2 + c1 * c2 + d1 * d2) * r;
    out[1] = (b1 * a2 - a1 * b2 - c1 * d2 + d1 * c2) * r;
    out[2] = (c1 * a2 - a1 * c2 - d1 * b2 + b1 * d2) * r;
    out[3] = (d1 * a2 - a1 * d2 - b1 * c2 + c1 * b2) * r;
  }

  return out;
}

/**
 * Calculates the exponentiation of a quaternion
 */
export function exponentQuat(
  q: ReadonlyQuaternion,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();

  const a = q[0],
    b = q[1],
    c = q[2],
    d = q[3];

  const norm = sqrt(b * b + c * c + d * d);
  const wExp = exp(a);
  const scale = (wExp / norm) * sin(norm);

  if (norm === 0) {
    out[0] = exp(a);
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  } else {
    out[0] = wExp * cos(norm);
    out[1] = b * scale;
    out[2] = c * scale;
    out[3] = d * scale;
  }

  return out;
}

/**
 * Multiplies a quaternion by a scalar.
 */
export function scaleQuat(
  q: ReadonlyQuaternion,
  scale: number,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();

  out[0] = q[0] * scale;
  out[1] = q[1] * scale;
  out[2] = q[2] * scale;
  out[3] = q[3] * scale;

  return out;
}

/**
 * This provides a sort of "directional" unit quaternion such that:
 * q2 - q1 = diff
 * where
 * diff * q1 = q2
 *
 * The math for this is:
 * diff = q2 * inverse(q1)
 *
 * Optimzied for Unit quats:
 * inverse(q1) = conjugate(q1) / abs(q1)
 * where
 * abs(q1) = 1 for unit quats
 */
export function diffUnitQuat(
  q1: ReadonlyQuaternion,
  q2: ReadonlyQuaternion,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();
  return multiplyQuat(q2, conjugateQuat(q1), out);
}

/**
 * Computes the conjugate of a quaternion.
 */
export function conjugateQuat(
  q: ReadonlyQuaternion,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();

  out[0] = q[0];
  out[1] = -q[1];
  out[2] = -q[2];
  out[3] = -q[3];

  return out;
}

/**
 * Computes the inverse, or reciprocal, of a quaternion.
 */
export function inverseQuat(
  q: ReadonlyQuaternion,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();

  const a = q[0],
    b = q[1],
    c = q[2],
    d = q[3];

  const norm = a * a + b * b + c * c + d * d;

  if (norm === 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  } else {
    const r = 1 / norm;

    out[0] = a * r;
    out[1] = -b * r;
    out[2] = -c * r;
    out[3] = -d * r;
  }

  return out;
}

/**
 * Computes the length of a quaternion: that is, the square root of
 * the product of the quaternion with its conjugate.  Also known as
 * the "norm".
 */
export function lengthQuat(q: ReadonlyQuaternion): number {
  const a = q[0],
    b = q[1],
    c = q[2],
    d = q[3];

  return sqrt(a * a + b * b + c * c + d * d);
}

/**
 * Normalizes a quaternion so its length is equal to 1.  The result of
 * normalizing a zero quaternion is undefined.
 */
export function normalizeQuat(
  q: ReadonlyQuaternion,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();
  const len = lengthQuat(q);
  if (len === 0) return [0, 0, 0, 0];
  const rlen = 1 / len;

  return scaleQuat(q, rlen, out);
}

/**
 * Provides the real part of the quaternion.
 */
export function realQuat(q: ReadonlyQuaternion): number {
  return q[0];
}

/**
 * Provides the vector part of the quaternion.
 */
export function imaginaryQuat(q: ReadonlyQuaternion): Vec3 {
  return [q[1], q[2], q[3]];
}

/**
 * Dot product of two quaternions
 */
export function dotQuat(
  q1: ReadonlyQuaternion,
  q2: ReadonlyQuaternion
): number {
  return dot4(q1, q2);
}

/**
 * Constructs a rotation quaternion from an axis (a normalized
 * Vec3) and an angle (in radians).
 */
export function fromEulerAxisAngleToQuat(
  axis: Vec3,
  angle: number,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();
  const x = axis[0],
    y = axis[1],
    z = axis[2];
  const r = 1 / sqrt(x * x + y * y + z * z);
  const s = sin(angle / 2);
  out[0] = cos(angle / 2);
  out[1] = s * x * r;
  out[2] = s * y * r;
  out[3] = s * z * r;

  return out;
}

/**
 * This converts a general euler angle of any rotation order into a quaternion
 */
export function fromOrderedEulerToQuat(
  angles: ReadonlyVec3Compat,
  order: EulerOrder,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();
  const x = angles[0],
    y = angles[1],
    z = angles[2];

  const cos = Math.cos;
  const sin = Math.sin;

  const c1 = cos(x / 2);
  const c2 = cos(y / 2);
  const c3 = cos(z / 2);

  const s1 = sin(x / 2);
  const s2 = sin(y / 2);
  const s3 = sin(z / 2);

  switch (order) {
    case EulerOrder.xyz:
      out[1] = s1 * c2 * c3 + c1 * s2 * s3;
      out[2] = c1 * s2 * c3 - s1 * c2 * s3;
      out[3] = c1 * c2 * s3 + s1 * s2 * c3;
      out[0] = c1 * c2 * c3 - s1 * s2 * s3;
      /*out[0] = c1 * c2 * c3 + s1 * s2 * s3;
      out[1] = s1 * c2 * c3 - c1 * s2 * s3;
      out[2] = c1 * s2 * c3 + s1 * c2 * s3;
      out[3] = c1 * c2 * s3 - s1 * s2 * c3;*/
      break;

    case EulerOrder.yxz:
      out[0] = c1 * c2 * c3 + s1 * s2 * s3;
      out[1] = s1 * c2 * c3 + c1 * s2 * s3;
      out[2] = c1 * s2 * c3 - s1 * c2 * s3;
      out[3] = c1 * c2 * s3 - s1 * s2 * c3;
      /*out[0] = c1 * c2 * c3 - s1 * s2 * s3;
      out[1] = c1 * s2 * c3 - s1 * c2 * s3;
      out[2] = c1 * s2 * s3 + s1 * c2 * c3 ;
      out[3] = c1 * c2 * s3 + s1 * s2 * c3;*/
      break;

    case EulerOrder.zxy:
      out[0] = c1 * c2 * c3 - s1 * s2 * s3;
      out[1] = s1 * c2 * c3 - c1 * s2 * s3;
      out[2] = c1 * s2 * c3 + s1 * c2 * s3;
      out[3] = c1 * c2 * s3 + s1 * s2 * c3;
      break;

    case EulerOrder.zyx:
      out[0] = c1 * c2 * c3 + s1 * s2 * s3;
      out[1] = s1 * c2 * c3 - c1 * s2 * s3;
      out[2] = c1 * s2 * c3 + s1 * c2 * s3;
      out[3] = c1 * c2 * s3 - s1 * s2 * c3;

      break;

    case EulerOrder.yzx:
      out[0] = c1 * c2 * c3 - s1 * s2 * s3;
      out[1] = s1 * c2 * c3 + c1 * s2 * s3;
      out[2] = c1 * s2 * c3 + s1 * c2 * s3;
      out[3] = c1 * c2 * s3 - s1 * s2 * c3;

      break;

    case EulerOrder.xzy:
      out[0] = c1 * c2 * c3 + s1 * s2 * s3;
      out[1] = s1 * c2 * c3 - c1 * s2 * s3;
      out[2] = c1 * s2 * c3 - s1 * c2 * s3;
      out[3] = c1 * c2 * s3 + s1 * s2 * c3;

      break;
  }

  return out;
}

/**
 * This converts a euler angle of any ordering and turns it into an euler of XYZ
 * orientation which is the expected rotation of most elements in this
 * framework.
 */
export function toEulerXYZfromOrderedEuler(
  euler: ReadonlyVec3Compat,
  order: EulerOrder,
  out?: EulerRotation
): EulerRotation {
  out = out || [0, 0, 0];
  const q = fromOrderedEulerToQuat(euler, order);
  toOrderedEulerFromQuat(q, EulerOrder.xyz, out);
  // toOrderedEulerFromQuat(q, EulerOrder.zyx, out);
  return out;
}

/**
 * Helper method for toEulerQuat
 */
function twoAxisRotation(
  r11: number,
  r12: number,
  r2: number,
  r31: number,
  r32: number,
  out: number[]
) {
  out[0] = atan2(r11, r12);
  out[1] = acos(r2);
  out[2] = atan2(r31, r32);
}

/**
 * Helper method for toEulerQuat
 * TODO: May not need this method anymore?
 */
// function threeAxisRotation(
//   r11: number,
//   r12: number,
//   r2: number,
//   r31: number,
//   r32: number,
//   out: number[]
// ) {
//   // out[0] = atan2(r31, r32);
//   out[0] = atan2(r11, r12);
//   out[1] = asin(r2);
//   // out[2] = atan2(r11, r12);
//   out[2] = atan2(r31, r32);
// }

/**
 * Produces a XYZ Euler angle from the provided Quaternion.
 */
export function toEulerFromQuat(q: ReadonlyQuaternion, out?: EulerRotation) {
  return toOrderedEulerFromQuat(q, EulerOrder.zyx, out);
}

/**
 * Converts a quaternion to an ordered Euler angle.
 *
 * NOTE: It is best to convert to XYZ ordering if using with this framework's 3D
 * system, or simply use toEulerFromQuat if this is desired. Only use this if
 * you specifically need an Euler angle for a known purpose.
 */
export function toOrderedEulerFromQuat(
  q: ReadonlyQuaternion,
  order: EulerOrder,
  out?: Vec3
): EulerRotation {
  out = out || [0, 0, 0];

  const q0 = q[0],
    q1 = q[1],
    q2 = q[2],
    q3 = q[3];

  const m = matrix4x4FromUnitQuatView(q);
  const m11 = m[0],
    m12 = m[4],
    m13 = m[8];
  const m21 = m[1],
    m22 = m[5],
    m23 = m[9];
  const m31 = m[2],
    m32 = m[6],
    m33 = m[10];

  switch (order) {
    case EulerOrder.zyx:
      /*threeAxisRotation(
        2 * (q[1] * q[2] + q[0] * q[3]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        -2 * (q[1] * q[3] - q[0] * q[2]),
        2 * (q[2] * q[3] + q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        out
      );
      threeAxisRotation(
        2 * q0 * q3 - 2 * q1 * q2,
        q1 * q1 + q0 * q0 - q3 * q3 - q2 * q2,
        2 * q1 * q3 + 2 * q0 * q2,
        2 * q0 * q1 - 2 * q2 * q3,
        q3 * q3 - q2 * q2 - q1 * q1 + q0 * q0,
        out
      )*/

      out[1] = Math.asin(-clamp(m31, -1, 1));

      if (Math.abs(m31) < 0.99999) {
        out[0] = Math.atan2(m32, m33);
        out[2] = Math.atan2(m21, m11);
      } else {
        out[0] = 0;
        out[2] = Math.atan2(-m12, m22);
      }
      break;

    case EulerOrder.zyz:
      /*twoAxisRotation(
        2 * (q[2] * q[3] - q[0] * q[1]),
        2 * (q[1] * q[3] + q[0] * q[2]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        2 * (q[2] * q[3] + q[0] * q[1]),
        -2 * (q[1] * q[3] - q[0] * q[2]),
        out
      );*/
      twoAxisRotation(
        2 * q2 * q3 + 2 * q0 * q1,
        2 * q0 * q2 - 2 * q1 * q3,
        q3 * q3 - q2 * q2 - q1 * q1 + q0 * q0,
        2 * q2 * q3 - 2 * q0 * q1,
        2 * q1 * q3 + 2 * q0 * q2,
        out
      );
      break;

    case EulerOrder.zxy:
      /*threeAxisRotation(
        -2 * (q[1] * q[2] - q[0] * q[3]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        2 * (q[2] * q[3] + q[0] * q[1]),
        -2 * (q[1] * q[3] - q[0] * q[2]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        out
      );
      threeAxisRotation(
        2 * q1 * q2 + 2 * q0 * q3,
        q2 * q2 - q3 * q3 + q0 * q0 - q1 * q1,
        2 * q0 * q1 - 2 * q2 * q3,
        2 * q1 * q3 + 2 * q0 * q2,
        q3 * q3 - q2 * q2 - q1 * q1 + q0 * q0,
        out
      )*/
      out[0] = Math.asin(clamp(m32, -1, 1));

      if (Math.abs(m32) < 0.99999) {
        out[1] = Math.atan2(-m31, m33);
        out[2] = Math.atan2(-m12, m22);
      } else {
        out[1] = 0;
        out[2] = Math.atan2(m21, m11);
      }

      break;

    case EulerOrder.zxz:
      /*twoAxisRotation(
        2 * (q[1] * q[3] + q[0] * q[2]),
        -2 * (q[2] * q[3] - q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        2 * (q[1] * q[3] - q[0] * q[2]),
        2 * (q[2] * q[3] + q[0] * q[1]),
        out
      );*/
      twoAxisRotation(
        2 * q1 * q3 - 2 * q0 * q2,
        2 * q2 * q3 + 2 * q0 * q1,
        q3 * q3 - q2 * q2 - q1 * q1 + q0 * q0,
        2 * q1 * q3 + 2 * q0 * q2,
        2 * q0 * q1 - 2 * q2 * q3,
        out
      );
      break;

    case EulerOrder.yxz:
      /*threeAxisRotation(
        2 * (q[1] * q[3] + q[0] * q[2]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        -2 * (q[2] * q[3] - q[0] * q[1]),
        2 * (q[1] * q[2] + q[0] * q[3]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        out
      );
      threeAxisRotation(
        2 * q0 * q2 - 2 * q1 * q3,
        q3 * q3 - q2 * q2 - q1 * q1 + q0 * q0,
        2 * q2 * q3 + 2 * q0 * q1,
        2 * q0 * q3 - 2 * q1 * q2,
        q2 * q2 - q3 * q3 + q0 * q0 - q1 * q1,
        out
      )*/

      out[0] = Math.asin(-clamp(m23, -1, 1));

      if (Math.abs(m23) < 0.9999) {
        out[1] = Math.atan2(m13, m33);
        out[2] = Math.atan2(m21, m22);
      } else {
        out[1] = Math.atan2(-m31, m11);
        out[2] = 0;
      }
      break;

    case EulerOrder.yxy:
      /*twoAxisRotation(
        2 * (q[1] * q[2] - q[0] * q[3]),
        2 * (q[2] * q[3] + q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        2 * (q[1] * q[2] + q[0] * q[3]),
        -2 * (q[2] * q[3] - q[0] * q[1]),
        out
      );*/
      twoAxisRotation(
        2 * q1 * q2 + 2 * q0 * q3,
        2 * q0 * q1 - 2 * q2 * q3,
        q2 * q2 - q3 * q3 + q0 * q0 - q1 * q1,
        2 * q1 * q2 - 2 * q0 * q3,
        2 * q2 * q3 + 2 * q0 * q1,
        out
      );
      break;

    case EulerOrder.yzx:
      /*threeAxisRotation(
        -2 * (q[1] * q[3] - q[0] * q[2]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        2 * (q[1] * q[2] + q[0] * q[3]),
        -2 * (q[2] * q[3] - q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        out
      );
      threeAxisRotation(
        2 * q1 * q3 + 2 * q0 * q2,
        q1 * q1 + q0 * q0 - q3 * q3 - q2 * q2,
        2 * q0 * q3 - 2 * q1 * q2,
        2 * q2 * q3 + 2 * q0 * q1,
        q2 * q2 - q3 * q3 + q0 * q0 - q1 * q1,
        out
      )*/

      out[2] = Math.asin(clamp(m21, -1, 1));

      if (Math.abs(m21) < 0.99999) {
        out[0] = Math.atan2(-m23, m22);
        out[1] = Math.atan2(-m31, m11);
      } else {
        out[0] = 0;
        out[1] = Math.atan2(m13, m33);
      }
      break;

    case EulerOrder.yzy:
      /*twoAxisRotation(
        2 * (q[2] * q[3] + q[0] * q[1]),
        -2 * (q[1] * q[2] - q[0] * q[3]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        2 * (q[2] * q[3] - q[0] * q[1]),
        2 * (q[1] * q[2] + q[0] * q[3]),
        out
      );*/
      twoAxisRotation(
        2 * q2 * q3 - 2 * q0 * q1,
        2 * q1 * q2 + 2 * q0 * q3,
        q2 * q2 - q3 * q3 + q0 * q0 - q1 * q1,
        2 * q2 * q3 + 2 * q0 * q1,
        2 * q0 * q3 - 2 * q1 * q2,
        out
      );
      break;

    case EulerOrder.xyz:
      /*threeAxisRotation(
        -2 * (q[2] * q[3] - q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        2 * (q[1] * q[3] + q[0] * q[2]),
        -2 * (q[1] * q[2] - q[0] * q[3]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        out
      );
      threeAxisRotation(
        2 * q2 * q3 + 2 * q0 * q1,
        q3 * q3 - q2 * q2 - q1 * q1 + q0 * q0,
        2 * q0 *q2 - 2 * q1 * q3,
        2 * q1 * q2 + 2 * q0 * q3,
        q1 * q1 + q0 * q0 - q3 * q3 - q2 * q2,
        out
      );*/

      out[1] = Math.asin(clamp(m13, -1, 1));

      if (Math.abs(m13) < 0.99999) {
        out[0] = Math.atan2(-m23, m33);
        out[2] = Math.atan2(-m12, m11);
      } else {
        out[0] = Math.atan2(m32, m22);
        out[2] = 0;
      }
      break;

    case EulerOrder.xyx:
      /*twoAxisRotation(
        2 * (q[1] * q[2] + q[0] * q[3]),
        -2 * (q[1] * q[3] - q[0] * q[2]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        2 * (q[1] * q[2] - q[0] * q[3]),
        2 * (q[1] * q[3] + q[0] * q[2]),
        out
      );*/
      twoAxisRotation(
        2 * q1 * q2 - 2 * q0 * q3,
        2 * q1 * q3 + 2 * q0 * q2,
        q1 * q1 + q0 * q0 - q3 * q3 - q2 * q2,
        2 * q1 * q2 + 2 * q0 * q3,
        2 * q0 * q2 - 2 * q1 * q3,
        out
      );
      break;

    case EulerOrder.xzy:
      /*threeAxisRotation(
        2 * (q[2] * q[3] + q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        -2 * (q[1] * q[2] - q[0] * q[3]),
        2 * (q[1] * q[3] + q[0] * q[2]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        out
      );
      threeAxisRotation(
        2 * q0 * q1 - 2 * q2 * q3,
        q2 * q2 - q3 * q3 + q0 * q0 - q1 * q1,
        2 * q1 * q2 + 2 * q0 * q3,
        2 * q0 * q2 - 2 * q1 * q3,
        q1 * q1 + q0 * q0 - q3 * q3 - q2 * q2,
        out
      )*/

      out[2] = Math.asin(-clamp(m12, -1, 1));

      if (Math.abs(m12) < 0.99999) {
        out[0] = Math.atan2(m32, m22);
        out[1] = Math.atan2(m13, m11);
      } else {
        out[0] = Math.atan2(-m23, m33);
        out[1] = 0;
      }

      break;

    case EulerOrder.xzx:
      /*twoAxisRotation(
        2 * (q[1] * q[3] - q[0] * q[2]),
        2 * (q[1] * q[2] + q[0] * q[3]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        2 * (q[1] * q[3] + q[0] * q[2]),
        -2 * (q[1] * q[2] - q[0] * q[3]),
        out
      );*/

      twoAxisRotation(
        2 * q1 * q3 + 2 * q0 * q2,
        2 * q0 * q3 - 2 * q1 * q2,
        q1 * q1 + q0 * q0 - q3 * q3 - q2 * q2,
        2 * q1 * q3 - 2 * q0 * q2,
        2 * q1 * q2 + 2 * q0 * q3,
        out
      );
      break;

    default:
      console.warn("Invalid Euler rotation order.");
      break;
  }

  return out;
}

export function toOrderedEulerFromQuat2(
  quat: ReadonlyQuaternion,
  order: EulerOrder,
  out?: Vec3
) {
  out = out || [0, 0, 0];

  const m = matrix4x4FromUnitQuatView(quat);
  const m11 = m[0],
    m12 = m[4],
    m13 = m[8];
  const m21 = m[1],
    m22 = m[5],
    m23 = m[9];
  const m31 = m[2],
    m32 = m[6],
    m33 = m[10];

  switch (order) {
    case EulerOrder.xyz:
      out[1] = Math.asin(clamp(m13, -1, 1));

      if (Math.abs(m13) < 0.99999) {
        out[0] = Math.atan2(-m23, m33);
        out[2] = Math.atan2(-m12, m11);
      } else {
        out[0] = Math.atan2(m32, m22);
        out[2] = 0;
      }

      break;
    case EulerOrder.yxz:
      out[0] = Math.asin(-clamp(m23, -1, 1));

      if (Math.abs(m23) < 0.9999) {
        out[1] = Math.atan2(m13, m33);
        out[2] = Math.atan2(m21, m22);
      } else {
        out[1] = Math.atan2(-m31, m11);
        out[2] = 0;
      }

      break;
    case EulerOrder.zxy:
      out[0] = Math.asin(clamp(m32, -1, 1));

      if (Math.abs(m32) < 0.99999) {
        out[1] = Math.atan2(-m31, m33);
        out[2] = Math.atan2(-m12, m22);
      } else {
        out[1] = 0;
        out[2] = Math.atan2(m21, m11);
      }

      break;
    case EulerOrder.zyx:
      out[1] = Math.asin(-clamp(m31, -1, 1));

      if (Math.abs(m31) < 0.99999) {
        out[0] = Math.atan2(m32, m33);
        out[2] = Math.atan2(m21, m11);
      } else {
        out[0] = 0;
        out[2] = Math.atan2(-m12, m22);
      }

      break;
    case EulerOrder.yzx:
      out[2] = Math.asin(clamp(m21, -1, 1));

      if (Math.abs(m21) < 0.99999) {
        out[0] = Math.atan2(-m23, m22);
        out[1] = Math.atan2(-m31, m11);
      } else {
        out[0] = 0;
        out[1] = Math.atan2(m13, m33);
      }

      break;
    case EulerOrder.xzy:
      out[2] = Math.asin(-clamp(m12, -1, 1));

      if (Math.abs(m12) < 0.99999) {
        out[0] = Math.atan2(m32, m22);
        out[1] = Math.atan2(m13, m11);
      } else {
        out[0] = Math.atan2(-m23, m33);
        out[1] = 0;
      }

      break;
  }
}

/**
 * Extracts the angle part, in radians, of a rotation quaternion.
 */
export function angleQuat(quat: ReadonlyQuaternion): number {
  const a = quat[0];

  if (a < -1.0 || a > 1.0) {
    return 0.0;
  }

  const angle = 2 * acos(a);

  if (angle > PI) {
    return angle - 2 * PI;
  }

  return angle;
}

/**
 * Extracts the axis part, as a Vec3, of a rotation quaternion.
 */
export function axisQuat(quat: ReadonlyQuaternion): Vec3 {
  const x = quat[1],
    y = quat[2],
    z = quat[3];

  const length = sqrt(x * x + y * y + z * z);

  if (length === 0) return [0, 0, 0];

  const r = 1 / sqrt(x * x + y * y + z * z);

  return [x * r, y * r, z * r];
}

/**
 * Produces a transform matrix from a returned unit quaternion. This is a matrix
 * that is from a 'models' perspective where the model orients itself to match
 * the orientation.
 */
export function matrix3x3FromUnitQuatModel(
  q: ReadonlyQuaternion,
  m?: Mat3x3
): Mat3x3 {
  m = m || identity3x3();

  // Calculate coefficients
  const x2 = q[1] + q[1];
  const y2 = q[2] + q[2];
  const z2 = q[3] + q[3];
  const xx = q[1] * x2;
  const xy = q[1] * y2;
  const xz = q[1] * z2;
  const yy = q[2] * y2;
  const yz = q[2] * z2;
  const zz = q[3] * z2;
  const wx = q[0] * x2;
  const wy = q[0] * y2;
  const wz = q[0] * z2;

  m[M300] = 1.0 - (yy + zz);
  m[M301] = xy - wz;
  m[M302] = xz + wy;

  m[M310] = xy + wz;
  m[M311] = 1.0 - (xx + zz);
  m[M312] = yz - wx;

  m[M320] = xz - wy;
  m[M321] = yz + wx;
  m[M322] = 1.0 - (xx + yy);

  return m;
}

/**
 * Produces a transform matrix from a returned unit quaternion. This is a matrix
 * that is from a 'models' perspective where the model orients itself to match
 * the orientation.
 */
export function matrix4x4FromUnitQuatModel(
  q: ReadonlyQuaternion,
  m?: Mat4x4
): Mat4x4 {
  m = m || identity4x4();

  // calculate coefficients
  const x2 = q[1] + q[1];
  const y2 = q[2] + q[2];
  const z2 = q[3] + q[3];
  const xx = q[1] * x2;
  const xy = q[1] * y2;
  const xz = q[1] * z2;
  const yy = q[2] * y2;
  const yz = q[2] * z2;
  const zz = q[3] * z2;
  const wx = q[0] * x2;
  const wy = q[0] * y2;
  const wz = q[0] * z2;

  m[M400] = 1.0 - (yy + zz);
  m[M401] = xy - wz;
  m[M402] = xz + wy;
  m[M403] = 0.0;

  m[M410] = xy + wz;
  m[M411] = 1.0 - (xx + zz);
  m[M412] = yz - wx;
  m[M413] = 0.0;

  m[M420] = xz - wy;
  m[M421] = yz + wx;
  m[M422] = 1.0 - (xx + yy);
  m[M423] = 0.0;

  m[M430] = 0;
  m[M431] = 0;
  m[M432] = 0;
  m[M433] = 1;

  return m;
}

/**
 * Produces a transform matrix from a returned unit quaternion. This is a matrix
 * that is from a 'views' perspective where the world orients to match the view.
 */
export function matrix3x3FromUnitQuatView(
  q: ReadonlyQuaternion,
  m?: Mat3x3
): Mat3x3 {
  m = m || identity3x3();

  // calculate coefficients
  const x2 = q[1] + q[1];
  const y2 = q[2] + q[2];
  const z2 = q[3] + q[3];
  const xx = q[1] * x2;
  const xy = q[1] * y2;
  const xz = q[1] * z2;
  const yy = q[2] * y2;
  const yz = q[2] * z2;
  const zz = q[3] * z2;
  const wx = q[0] * x2;
  const wy = q[0] * y2;
  const wz = q[0] * z2;

  m[M300] = 1.0 - (yy + zz);
  m[M310] = xy - wz;
  m[M320] = xz + wy;

  m[M301] = xy + wz;
  m[M311] = 1.0 - (xx + zz);
  m[M321] = yz - wx;

  m[M302] = xz - wy;
  m[M312] = yz + wx;
  m[M322] = 1.0 - (xx + yy);

  return m;
}

/**
 * Produces a transform matrix from a returned unit quaternion. This is a matrix
 * that is from a 'views' perspective where the world orients to match the view.
 */
export function matrix4x4FromUnitQuatView(
  q: ReadonlyQuaternion,
  m?: Mat4x4
): Mat4x4 {
  m = m || identity4x4();

  // calculate coefficients
  const x2 = q[1] + q[1];
  const y2 = q[2] + q[2];
  const z2 = q[3] + q[3];
  const xx = q[1] * x2;
  const xy = q[1] * y2;
  const xz = q[1] * z2;
  const yy = q[2] * y2;
  const yz = q[2] * z2;
  const zz = q[3] * z2;
  const wx = q[0] * x2;
  const wy = q[0] * y2;
  const wz = q[0] * z2;

  m[M400] = 1.0 - (yy + zz);
  m[M410] = xy - wz;
  m[M420] = xz + wy;
  m[M430] = 0.0;

  m[M401] = xy + wz;
  m[M411] = 1.0 - (xx + zz);
  m[M421] = yz - wx;
  m[M431] = 0.0;

  m[M402] = xz - wy;
  m[M412] = yz + wx;
  m[M422] = 1.0 - (xx + yy);
  m[M432] = 0.0;

  m[M403] = 0;
  m[M413] = 0;
  m[M423] = 0;
  m[M433] = 1;

  return m;
}

/**
 * Converts Euler angles [roll(X), pitch(Y), yaw(Z)]
 */
export function eulerToQuat(
  angles: ReadonlyEulerRotation,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();
  const [roll, pitch, yaw] = angles;

  // calculate trig identities
  const cr = cos(roll / 2);
  const cp = cos(pitch / 2);
  const cy = cos(yaw / 2);
  const sr = sin(roll / 2);
  const sp = sin(pitch / 2);
  const sy = sin(yaw / 2);
  const cpcy = cp * cy;
  const spsy = sp * sy;
  const cpsy = cp * sy;
  const spcy = sp * cy;
  out[0] = cr * cpcy + sr * spsy;
  out[1] = sr * cpcy - cr * spsy;
  out[2] = cr * spcy + sr * cpsy;
  out[3] = cr * cpsy - sr * spcy;

  return out;
}

/**
 * This produces a quaternion that creates an orientation that will look in the
 * direction specified.
 */
export function lookAtQuat(
  forward: ReadonlyVec3Compat,
  up: ReadonlyVec3Compat,
  q?: Quaternion
): Quaternion {
  q = q || zeroQuat();
  vz = normalize3([-forward[0], -forward[1], -forward[2]], V3R[V3R.length - 1]);
  vx = normalize3(cross3(up, vz, V3R[V3R.length - 2]));
  vy = cross3(vz, vx, V3R[V3R.length - 3]);

  m11 = vx[0];
  m12 = vy[0];
  m13 = vz[0];
  m21 = vx[1];
  m22 = vy[1];
  m23 = vz[1];
  m31 = vx[2];
  m32 = vy[2];
  m33 = vz[2];

  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  w = (1 + m11 + m22 + m33) * 0.25; // w^2

  if (w > 0.0) {
    w = Math.sqrt(w);
    q[0] = w;
    w = 1 / (4 * w);
    q[1] = (m23 - m32) * w;
    q[2] = (m31 - m13) * w;
    q[3] = (m12 - m21) * w;
  } else {
    q[0] = 0;
    w = -0.5 * (m22 + m33); // x^2

    if (w > 0) {
      w = Math.sqrt(w);
      q[1] = w;
      w *= 2;
      q[2] = m12 / w;
      q[3] = m13 / w;
    } else {
      q[1] = 0;
      w = 0.5 * (1 - m33); // y^2

      if (w > 0) {
        w = Math.sqrt(w);
        q[2] = w;
        q[3] = m23 / (2 * w);
      } else {
        q[2] = 0;
        q[3] = 1;
      }
    }
  }

  return q;
}

export function matrix3x3ToQuaternion(
  mat: ReadonlyMat3x3,
  q?: Quaternion
): Quaternion {
  q = q || zeroQuat();

  m00 = mat[0];
  m01 = mat[3];
  m02 = mat[6];
  m10 = mat[1];
  m11 = mat[4];
  m12 = mat[7];
  m20 = mat[2];
  m21 = mat[5];
  m22 = mat[8];

  w = m00 + m11 + m22;

  if (w > 0.0) {
    const s = sqrt(w + 1.0) * 2;
    q[0] = 0.25 * s;
    q[1] = (m21 - m12) / s;
    q[2] = (m02 - m20) / s;
    q[3] = (m10 - m01) / s;

    return q;
  }

  if (m00 > m11 && m00 > m22) {
    const s = sqrt(1.0 + m00 - m11 - m22) * 2;
    q[0] = (m21 - m12) / s;
    q[1] = 0.25 * s;
    q[2] = (m01 + m10) / s;
    q[3] = (m02 + m20) / s;

    return q;
  }

  if (m11 > m22) {
    const s = sqrt(1.0 + m11 - m00 - m22) * 2;

    q[0] = (m02 - m20) / s;
    q[1] = (m10 + m01) / s;
    q[2] = 0.25 * s;
    q[3] = (m21 + m12) / s;

    return q;
  }

  const s = sqrt(1.0 + m22 - m00 - m11) * 2;
  q[0] = (m10 - m01) / s;
  q[1] = (m20 + m02) / s;
  q[2] = (m21 + m12) / s;
  q[3] = 0.25 * s;

  return q;
}

export function matrix4x4ToQuaternion(
  mat: ReadonlyMat4x4,
  q?: Quaternion
): Quaternion {
  q = q || zeroQuat();

  m00 = mat[0];
  m01 = mat[4];
  m02 = mat[8];
  m10 = mat[1];
  m11 = mat[5];
  m12 = mat[9];
  m20 = mat[2];
  m21 = mat[6];
  m22 = mat[10];

  w = m00 + m11 + m22;

  if (w > 0.0) {
    const s = sqrt(w + 1.0) * 2;
    q[0] = 0.25 * s;
    // num = 0.5 / num;
    q[1] = (m21 - m12) / s;
    q[2] = (m02 - m20) / s;
    q[3] = (m10 - m01) / s;

    return q;
  }

  if (m00 > m11 && m00 > m22) {
    // const num7 = sqrt(1.0 + m00 - m11 - m22);
    // const num4 = 0.5 / num7;
    const s = sqrt(1.0 + m00 - m11 - m22) * 2;
    q[0] = (m21 - m12) / s;
    q[1] = 0.25 * s;
    q[2] = (m01 + m10) / s;
    q[3] = (m02 + m20) / s;

    return q;
  }

  if (m11 > m22) {
    // const num6 = sqrt(1.0 + m11 - m00 - m22);
    // const num3 = 0.5 / num6;
    const s = sqrt(1.0 + m11 - m00 - m22) * 2;

    q[0] = (m02 - m20) / s;
    q[1] = (m10 + m01) / s;
    q[2] = 0.25 * s;
    q[3] = (m21 + m12) / s;

    return q;
  }

  // const num5 = sqrt(1.0 + m22 - m00 - m11);
  // const num2 = 0.5 / num5;
  const s = sqrt(1.0 + m22 - m00 - m11) * 2;
  q[0] = (m10 - m01) / s;
  q[1] = (m20 + m02) / s;
  q[2] = (m21 + m12) / s;
  q[3] = 0.25 * s;

  return q;
}

/**
 * This decomposes the rotational component of a matrix into a quaternion.
 * You must provide the scale magnitudes of the matrix for the operation to
 * work. This means getting:
 * sx = length4(row0);
 * sy = length4(row1);
 * sz = length4(row2);
 */
export function decomposeRotation(
  mat: ReadonlyMat4x4,
  sx: number,
  sy: number,
  sz: number,
  q?: Quaternion
) {
  q = q || zeroQuat();

  m11 = mat[0] / sx;
  m12 = mat[4] / sy;
  m13 = mat[8] / sz;
  m21 = mat[1] / sx;
  m22 = mat[5] / sy;
  m23 = mat[9] / sz;
  m31 = mat[2] / sx;
  m32 = mat[6] / sy;
  m33 = mat[10] / sz;

  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  w = (1 + m11 + m22 + m33) * 0.25; // w^2

  if (w > 0.0) {
    w = Math.sqrt(w);
    q[0] = w;
    w = 1 / (4 * w);
    q[1] = (m23 - m32) * w;
    q[2] = (m31 - m13) * w;
    q[3] = (m12 - m21) * w;
  } else {
    q[0] = 0;
    w = -0.5 * (m22 + m33); // x^2

    if (w > 0) {
      w = Math.sqrt(w);
      q[1] = w;
      w *= 2;
      q[2] = m12 / w;
      q[3] = m13 / w;
    } else {
      q[1] = 0;
      w = 0.5 * (1 - m33); // y^2

      if (w > 0) {
        w = Math.sqrt(w);
        q[2] = w;
        q[3] = m23 / (2 * w);
      } else {
        q[2] = 0;
        q[3] = 1;
      }
    }
  }

  return q;
}

export function lookAtMatrix(
  forward: ReadonlyVec3Compat,
  up: ReadonlyVec3Compat,
  m?: Mat4x4
): Mat4x4 {
  m = m || identity4x4();

  const z = normalize3([-forward[0], -forward[1], -forward[2]]);
  const x = normalize3(cross3(up, z));
  // No need to normalize the cross product as z and x are unit vectors at this
  // point
  const y = cross3(z, x);

  m[0] = x[0];
  m[1] = y[0];
  m[2] = z[0];
  m[3] = 0.0;
  m[4] = x[1];
  m[5] = y[1];
  m[6] = z[1];
  m[7] = 0.0;
  m[8] = x[2];
  m[9] = y[2];
  m[10] = z[2];
  m[11] = 0.0;
  m[12] = 0.0;
  m[13] = 0.0;
  m[14] = 0.0;
  m[15] = 1.0;

  return m;
}

/**
 * Rotates a vector using some nice tricks with a quaternion's value.
 */
export function rotateVectorByUnitQuat(
  v: ReadonlyVec3Compat,
  q: ReadonlyQuaternion,
  out?: Vec3
) {
  vx = vec3(q[1], q[2], q[3]);
  w = q[0];

  return add3(
    add3(scale3(vx, 2 * dot3(vx, v)), scale3(v, w * w - dot3(vx, vx))),
    scale3(cross3(vx, v), 2 * w),
    out
  );
}

/**
 * SLERP interpolation between two quaternion orientations. The Quaternions MUST
 * be unit quats for this to be valid. If the quat has gotten out of
 * normalization from precision errors, consider renormalizing the quaternion.
 */
export function slerpUnitQuat(
  from: ReadonlyQuaternion,
  to: ReadonlyQuaternion,
  t: number,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();
  const to1: Vec4 = [0, 0, 0, 0];
  let omega, cosom, sinom, scale0, scale1;
  cosom = from[1] * to[1] + from[2] * to[2] + from[3] * to[3] + from[0] * to[0];

  if (cosom < 0.0) {
    cosom = -cosom;
    to1[0] = -to[1];
    to1[1] = -to[2];
    to1[2] = -to[3];
    to1[3] = -to[0];
  } else {
    to1[0] = to[1];
    to1[1] = to[2];
    to1[2] = to[3];
    to1[3] = to[0];
  }

  // Calculate coefficients for final values. We use SLERP if the difference
  // between the two angles isn't too big.
  if (1.0 - cosom > 0.0000001) {
    omega = acos(cosom);
    sinom = sin(omega);
    scale0 = sin((1.0 - t) * omega) / sinom;
    scale1 = sin(t * omega) / sinom;
  }

  // We linear interpolate for quaternions that are very close together in
  // angle.
  else {
    scale0 = 1.0 - t;
    scale1 = t;
  }

  // calculate final values
  out[1] = scale0 * from[1] + scale1 * to1[0];
  out[2] = scale0 * from[2] + scale1 * to1[1];
  out[3] = scale0 * from[3] + scale1 * to1[2];
  out[0] = scale0 * from[0] + scale1 * to1[3];

  return out;
}

/**
 * One basis quaternion
 */
export function oneQuat(): Quaternion {
  return [1, 0, 0, 0];
}

/**
 * i basis quaternion
 */
export function iQuat(): Quaternion {
  return [0, 1, 0, 0];
}

/**
 * j basis quaternion
 */
export function jQuat(): Quaternion {
  return [0, 0, 1, 0];
}

/**
 * i basis quaternion
 */
export function kQuat(): Quaternion {
  return [0, 0, 0, 1];
}
