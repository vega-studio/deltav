import type { Mat4x4 } from "./matrix.js";
import { type Plane } from "./plane.js";
import type { Vec3 } from "./vector.js";

/**
 * Minimal representation of a frustum.
 * The planes are ordered as follows:
 * - left
 * - right
 * - bottom
 * - top
 * - near
 */
export type Frustum = [Plane, Plane, Plane, Plane, Plane, Plane];

/**
 * Extracts the 6 planes of the frustum from the view projection matrix.
 * The planes are in world space.
 */
export function frustumFromViewProjection(m: number[], out?: Frustum): Frustum {
  if (!out) {
    out = [
      [[0, 0, 0], 0],
      [[0, 0, 0], 0],
      [[0, 0, 0], 0],
      [[0, 0, 0], 0],
      [[0, 0, 0], 0],
      [[0, 0, 0], 0],
    ];
  }

  const m0 = m[0],
    m1 = m[1],
    m2 = m[2],
    m3 = m[3];
  const m4 = m[4],
    m5 = m[5],
    m6 = m[6],
    m7 = m[7];
  const m8 = m[8],
    m9 = m[9],
    m10 = m[10],
    m11 = m[11];
  const m12 = m[12],
    m13 = m[13],
    m14 = m[14],
    m15 = m[15];

  // LEFT = m3 + m0
  {
    const a = m3 + m0;
    const b = m7 + m4;
    const c = m11 + m8;
    const d = m15 + m12;
    const len = Math.hypot(a, b, c);
    const p = out[0];
    const n = p[0];
    n[0] = a / len;
    n[1] = b / len;
    n[2] = c / len;
    p[1] = d / len;
  }

  // RIGHT = m3 - m0
  {
    const a = m3 - m0;
    const b = m7 - m4;
    const c = m11 - m8;
    const d = m15 - m12;
    const len = Math.hypot(a, b, c);
    const p = out[1];
    const n = p[0];
    n[0] = a / len;
    n[1] = b / len;
    n[2] = c / len;
    p[1] = d / len;
  }

  // BOTTOM = m3 + m1
  {
    const a = m3 + m1;
    const b = m7 + m5;
    const c = m11 + m9;
    const d = m15 + m13;
    const len = Math.hypot(a, b, c);
    const p = out[2];
    const n = p[0];
    n[0] = a / len;
    n[1] = b / len;
    n[2] = c / len;
    p[1] = d / len;
  }

  // TOP = m3 - m1
  {
    const a = m3 - m1;
    const b = m7 - m5;
    const c = m11 - m9;
    const d = m15 - m13;
    const len = Math.hypot(a, b, c);
    const p = out[3];
    const n = p[0];
    n[0] = a / len;
    n[1] = b / len;
    n[2] = c / len;
    p[1] = d / len;
  }

  // NEAR = m3 + m2
  {
    const a = m3 + m2;
    const b = m7 + m6;
    const c = m11 + m10;
    const d = m15 + m14;
    const len = Math.hypot(a, b, c);
    const p = out[4];
    const n = p[0];
    n[0] = a / len;
    n[1] = b / len;
    n[2] = c / len;
    p[1] = d / len;
  }

  // FAR = m3 - m2
  {
    const a = m3 - m2;
    const b = m7 - m6;
    const c = m11 - m10;
    const d = m15 - m14;
    const len = Math.hypot(a, b, c);
    const p = out[5];
    const n = p[0];
    n[0] = a / len;
    n[1] = b / len;
    n[2] = c / len;
    p[1] = d / len;
  }

  return out;
}

/**
 * Extracts the 8 points of the frustum from the inverse view projection matrix.
 * The points are in world space.
 */
export function frustumCornersFromInvViewProjection(
  invViewProj: Mat4x4,
  out?: Vec3[]
): Vec3[] {
  if (!out) {
    out = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
  }

  // Normalized device coordinates
  const ndc = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1], // near
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1], // far
  ];

  for (let i = 0; i < 8; i++) {
    const [x, y, z] = ndc[i];
    const ix = invViewProj;

    const clipX = x,
      clipY = y,
      clipZ = z,
      clipW = 1.0;

    const vx = clipX * ix[0] + clipY * ix[4] + clipZ * ix[8] + clipW * ix[12];
    const vy = clipX * ix[1] + clipY * ix[5] + clipZ * ix[9] + clipW * ix[13];
    const vz = clipX * ix[2] + clipY * ix[6] + clipZ * ix[10] + clipW * ix[14];
    const vw = clipX * ix[3] + clipY * ix[7] + clipZ * ix[11] + clipW * ix[15];

    const invW = 1.0 / vw;
    const outVec = out[i];
    outVec[0] = vx * invW;
    outVec[1] = vy * invW;
    outVec[2] = vz * invW;
  }

  return out;
}
