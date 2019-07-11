import { EulerOrder, EulerRotation } from "../types";
import {
  identity4,
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
  Mat4x4
} from "./matrix";
import { cross3, dot4, normalize3, Vec, Vec3, Vec3Compat, Vec4 } from "./vector";

const { cos, sin, sqrt, exp, acos, asin, atan2, PI } = Math;

/** Expresses a quaternion [scalar, i, j, k] */
export type Quaternion = Vec4;

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
  q1: Quaternion,
  q2: Quaternion,
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
  q1: Quaternion,
  q2: Quaternion,
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
  q1: Quaternion,
  q2: Quaternion,
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
export function exponentQuat(q: Quaternion, out?: Quaternion): Quaternion {
  out = out || zeroQuat();

  const a = q[0],
    b = q[1],
    c = q[2],
    d = q[3];

  const norm = sqrt(b * b + c * c + d * d);
  const wExp = exp(a);
  const scale = wExp / norm * sin(norm);

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
  q: Quaternion,
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
 * Computes the conjugate of a quaternion.
 */
export function conjugateQuat(q: Quaternion, out?: Quaternion): Quaternion {
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
export function inverseQuat(q: Quaternion, out?: Quaternion): Quaternion {
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
export function lengthQuat(q: Quaternion): number {
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
export function normalizeQuat(q: Quaternion, out?: Quaternion): Quaternion {
  out = out || zeroQuat();
  const len = lengthQuat(q);
  if (len === 0) return [0, 0, 0, 0];
  const rlen = 1 / lengthQuat(q);

  return scaleQuat(q, rlen, out);
}

/**
 * Provides the real part of the quaternion.
 */
export function realQuat(q: Quaternion): number {
  return q[0];
}

/**
 * Provides the vector part of the quaternion.
 */
export function imaginaryQuat(q: Quaternion): Vec3 {
  return [q[1], q[2], q[3]];
}

/**
 * Dot product of two quaternions
 */
export function dotQuat(q1: Quaternion, q2: Quaternion): number {
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
  angles: Vec3,
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
      break;

    case EulerOrder.yxz:
      out[1] = s1 * c2 * c3 + c1 * s2 * s3;
      out[2] = c1 * s2 * c3 - s1 * c2 * s3;
      out[3] = c1 * c2 * s3 - s1 * s2 * c3;
      out[0] = c1 * c2 * c3 + s1 * s2 * s3;
      break;

    case EulerOrder.zxy:
      out[1] = s1 * c2 * c3 - c1 * s2 * s3;
      out[2] = c1 * s2 * c3 + s1 * c2 * s3;
      out[3] = c1 * c2 * s3 + s1 * s2 * c3;
      out[0] = c1 * c2 * c3 - s1 * s2 * s3;
      break;

    case EulerOrder.zyx:
      out[1] = s1 * c2 * c3 - c1 * s2 * s3;
      out[2] = c1 * s2 * c3 + s1 * c2 * s3;
      out[3] = c1 * c2 * s3 - s1 * s2 * c3;
      out[0] = c1 * c2 * c3 + s1 * s2 * s3;
      break;

    case EulerOrder.yzx:
      out[1] = s1 * c2 * c3 + c1 * s2 * s3;
      out[2] = c1 * s2 * c3 + s1 * c2 * s3;
      out[3] = c1 * c2 * s3 - s1 * s2 * c3;
      out[0] = c1 * c2 * c3 - s1 * s2 * s3;
      break;

    case EulerOrder.xzy:
      out[1] = s1 * c2 * c3 - c1 * s2 * s3;
      out[2] = c1 * s2 * c3 - s1 * c2 * s3;
      out[3] = c1 * c2 * s3 + s1 * s2 * c3;
      out[0] = c1 * c2 * c3 + s1 * s2 * s3;
      break;
  }

  return out;
}

/**
 * This converts a euler angle of any ordering and turns it into an euler of XYZ orientation which is the expected
 * rotation of most elements in this framework.
 */
export function toEulerXYZfromOrderedEuler(
  euler: Vec3,
  order: EulerOrder,
  out?: EulerRotation
): EulerRotation {
  out = out || [0, 0, 0];
  const q = fromOrderedEulerToQuat(euler, order);
  toOrderedEulerFromQuat(q, EulerOrder.xyz, out);

  return out;
}

/**
 * Helper method for toEulerQuat
 */
function twoAxisRotation(
  r11: number,
  r12: number,
  r21: number,
  r31: number,
  r32: number,
  out: number[]
) {
  out[0] = atan2(r11, r12);
  out[1] = acos(r21);
  out[2] = atan2(r31, r32);
}

/**
 * Helper method for toEulerQuat
 */
function threeAxisRotation(
  r11: number,
  r12: number,
  r21: number,
  r31: number,
  r32: number,
  out: number[]
) {
  out[0] = atan2(r31, r32);
  out[1] = asin(r21);
  out[2] = atan2(r11, r12);
}

/**
 * Produces a XYZ Euler angle from the provided Quaternion.
 */
export function toEulerFromQuat(q: Quaternion, out?: EulerRotation) {
  return toOrderedEulerFromQuat(q, EulerOrder.xyz, out);
}

/**
 * Converts a quaternion to an ordered Euler angle.
 *
 * NOTE: It is best to convert to XYZ ordering if using with this framework's 3D system, or simply use toEulerFromQuat
 * if this is desired. Only use this if you specifically need an Euler angle for a known purpose.
 */
export function toOrderedEulerFromQuat(
  q: Quaternion,
  order: EulerOrder,
  out?: Vec3
): Vec3 {
  out = out || [0, 0, 0];

  switch (order) {
    case EulerOrder.zyx:
      threeAxisRotation(
        2 * (q[1] * q[2] + q[0] * q[3]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        -2 * (q[1] * q[3] - q[0] * q[2]),
        2 * (q[2] * q[3] + q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        out
      );
      break;

    case EulerOrder.zyz:
      twoAxisRotation(
        2 * (q[2] * q[3] - q[0] * q[1]),
        2 * (q[1] * q[3] + q[0] * q[2]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        2 * (q[2] * q[3] + q[0] * q[1]),
        -2 * (q[1] * q[3] - q[0] * q[2]),
        out
      );
      break;

    case EulerOrder.zxy:
      threeAxisRotation(
        -2 * (q[1] * q[2] - q[0] * q[3]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        2 * (q[2] * q[3] + q[0] * q[1]),
        -2 * (q[1] * q[3] - q[0] * q[2]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        out
      );
      break;

    case EulerOrder.zxz:
      twoAxisRotation(
        2 * (q[1] * q[3] + q[0] * q[2]),
        -2 * (q[2] * q[3] - q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        2 * (q[1] * q[3] - q[0] * q[2]),
        2 * (q[2] * q[3] + q[0] * q[1]),
        out
      );
      break;

    case EulerOrder.yxz:
      threeAxisRotation(
        2 * (q[1] * q[3] + q[0] * q[2]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        -2 * (q[2] * q[3] - q[0] * q[1]),
        2 * (q[1] * q[2] + q[0] * q[3]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        out
      );
      break;

    case EulerOrder.yxy:
      twoAxisRotation(
        2 * (q[1] * q[2] - q[0] * q[3]),
        2 * (q[2] * q[3] + q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        2 * (q[1] * q[2] + q[0] * q[3]),
        -2 * (q[2] * q[3] - q[0] * q[1]),
        out
      );
      break;

    case EulerOrder.yzx:
      threeAxisRotation(
        -2 * (q[1] * q[3] - q[0] * q[2]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        2 * (q[1] * q[2] + q[0] * q[3]),
        -2 * (q[2] * q[3] - q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        out
      );
      break;

    case EulerOrder.yzy:
      twoAxisRotation(
        2 * (q[2] * q[3] + q[0] * q[1]),
        -2 * (q[1] * q[2] - q[0] * q[3]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        2 * (q[2] * q[3] - q[0] * q[1]),
        2 * (q[1] * q[2] + q[0] * q[3]),
        out
      );
      break;

    case EulerOrder.xyz:
      threeAxisRotation(
        -2 * (q[2] * q[3] - q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] - q[2] * q[2] + q[3] * q[3],
        2 * (q[1] * q[3] + q[0] * q[2]),
        -2 * (q[1] * q[2] - q[0] * q[3]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        out
      );
      break;

    case EulerOrder.xyx:
      twoAxisRotation(
        2 * (q[1] * q[2] + q[0] * q[3]),
        -2 * (q[1] * q[3] - q[0] * q[2]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        2 * (q[1] * q[2] - q[0] * q[3]),
        2 * (q[1] * q[3] + q[0] * q[2]),
        out
      );
      break;

    case EulerOrder.xzy:
      threeAxisRotation(
        2 * (q[2] * q[3] + q[0] * q[1]),
        q[0] * q[0] - q[1] * q[1] + q[2] * q[2] - q[3] * q[3],
        -2 * (q[1] * q[2] - q[0] * q[3]),
        2 * (q[1] * q[3] + q[0] * q[2]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        out
      );
      break;

    case EulerOrder.xzx:
      twoAxisRotation(
        2 * (q[1] * q[3] - q[0] * q[2]),
        2 * (q[1] * q[2] + q[0] * q[3]),
        q[0] * q[0] + q[1] * q[1] - q[2] * q[2] - q[3] * q[3],
        2 * (q[1] * q[3] + q[0] * q[2]),
        -2 * (q[1] * q[2] - q[0] * q[3]),
        out
      );
      break;

    default:
      console.warn("Invalid Euler rotation order.");
      break;
  }

  return out;
}

/**
 * Extracts the angle part, in radians, of a rotation quaternion.
 */
export function angleQuat(quat: Quaternion): number {
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
export function axisQuat(quat: Quaternion): Vec3 {
  const x = quat[1],
    y = quat[2],
    z = quat[3];
  const r = 1 / sqrt(x * x + y * y + z * z);

  return [x * r, y * r, z * r];
}

/**
 * Produces a transform matrix from a returned unit quaternion
 */
export function matrix4x4FromUnitQuat(q: Quaternion, m?: Mat4x4): Mat4x4 {
  let wx, wy, wz, xx, yy, yz, xy, xz, zz, x2, y2, z2;
  m = m || identity4();

  // calculate coefficients
  x2 = q[1] + q[1];
  y2 = q[2] + q[2];
  z2 = q[3] + q[3];
  xx = q[1] * x2;
  xy = q[1] * y2;
  xz = q[1] * z2;
  yy = q[2] * y2;
  yz = q[2] * z2;
  zz = q[3] * z2;
  wx = q[0] * x2;
  wy = q[0] * y2;
  wz = q[0] * z2;

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
 * Converts Euler angles [roll, pitch, yaw]
 */
export function eulerToQuat(
  angles: EulerRotation,
  out?: Quaternion
): Quaternion {
  out = out || zeroQuat();
  let cr, cp, cy, sr, sp, sy, cpcy, spsy;
  const [roll, pitch, yaw] = angles;

  // calculate trig identities
  cr = cos(roll / 2);
  cp = cos(pitch / 2);
  cy = cos(yaw / 2);
  sr = sin(roll / 2);
  sp = sin(pitch / 2);
  sy = sin(yaw / 2);
  cpcy = cp * cy;
  spsy = sp * sy;
  out[0] = cr * cpcy + sr * spsy;
  out[1] = sr * cpcy - cr * spsy;
  out[2] = cr * sp * cy + sr * cp * sy;
  out[3] = cr * cp * sy - sr * sp * cy;

  return out;
}

/**
 * This produces a quaternion that creates an orientation that will look in the direction specified.
 */
export function lookAtQuat(
  forward: Vec3Compat,
  up: Vec3Compat,
  q?: Quaternion
): Quaternion {
  q = q || zeroQuat();
  forward = normalize3(forward);

  const f: Vec3 = [-forward[0], -forward[1], -forward[2]];
  // const f = forward;
  const l = normalize3(cross3(up, f));
  const u = normalize3(cross3(f, l));

  const m00 = l[0];
  const m01 = l[1];
  const m02 = l[2];
  const m10 = u[0];
  const m11 = u[1];
  const m12 = u[2];
  const m20 = f[0];
  const m21 = f[1];
  const m22 = f[2];

  const tr = m00 + m11 + m22;

  if (tr > 0.0) {
    const s = sqrt(tr + 1.0) * 2;
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

export function lookAtMatrix(
  forward: Vec3Compat,
  up: Vec3Compat,
  m?: Mat4x4
): Mat4x4 {
  m = m || identity4();

  forward = normalize3(forward);

  const f: Vec3 = [-forward[0], -forward[1], -forward[2]];
  const l = normalize3(cross3(up, f));
  const u = normalize3(cross3(f, l));

  m[0] = l[0];
  m[1] = u[0];
  m[2] = f[0];
  m[3] = 0.0;
  m[4] = l[1];
  m[5] = u[1];
  m[6] = f[1];
  m[7] = 0.0;
  m[8] = l[2];
  m[9] = u[2];
  m[10] = f[2];
  m[11] = 0.0;
  m[12] = 0.0;
  m[13] = 0.0;
  m[14] = 0.0;
  m[15] = 1.0;

  return m;
}

/**
 * SLERP interpolation between two quaternion orientations. The Quaternions MUST be unit quats for this to be valid.
 * If the quat has gotten out of normalization from precision errors, consider renormalizing the quaternion.
 */
export function slerpUnitQuat(
  from: Quaternion,
  to: Quaternion,
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

  // Calculate coefficients for final values. We use SLERP if the difference between the two angles isn't too big.
  if (1.0 - cosom > 0.001) {
    omega = acos(cosom);
    sinom = sin(omega);
    scale0 = sin((1.0 - t) * omega) / sinom;
    scale1 = sin(t * omega) / sinom;
  }

  // We linear interpolate for quaternions that are very close together in angle.
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
