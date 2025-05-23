const { sqrt, max, min, floor, ceil, abs, acos, sin } = Math;

/** Explicit Vec1 */
export interface IVec1 extends Array<number> {
  0: number;
  length: 1;
}

/** Explicit Vec2 */
export interface IVec2 extends Array<number> {
  0: number;
  1: number;
  length: 2;
}

/** Explicit Vec3 */
export interface IVec3 extends Array<number> {
  0: number;
  1: number;
  2: number;
  length: 3;
}

/** Explicit Vec4 */
export interface IVec4 extends Array<number> {
  0: number;
  1: number;
  2: number;
  3: number;
  length: 4;
}

/** Vector of 1 components */
export type Vec1 = [number];
/** Vector of 2 components */
export type Vec2 = [number, number];
/** Vector of 3 components */
export type Vec3 = [number, number, number];
/** Vector of 4 components */
export type Vec4 = [number, number, number, number];

/** Compatible types with Vec1 for operations (just not iterating) */
export type Vec1Compat = Vec1 | Vec2 | Vec3 | Vec4;
/** Compatible types with Vec2 for operations (just not iterating) */
export type Vec2Compat = Vec2 | Vec3 | Vec4;
/** Compatible types with Vec3 for operations (just not iterating) */
export type Vec3Compat = Vec3 | Vec4;
/** Compatible types with Vec4 for operations (just not iterating) */
export type Vec4Compat = Vec4;

/** Readonly Compatible types with Vec1 for operations (just not iterating) */
export type ReadonlyVec1Compat = Readonly<Vec1Compat>;
/** Readonly Compatible types with Vec2 for operations (just not iterating) */
export type ReadonlyVec2Compat = Readonly<Vec2Compat>;
/** Readonly Compatible types with Vec3 for operations (just not iterating) */
export type ReadonlyVec3Compat = Readonly<Vec3Compat>;
/** Readonly Compatible types with Vec4 for operations (just not iterating) */
export type ReadonlyVec4Compat = Readonly<Vec4Compat>;

/** This type defines any possible explicit vector */
export type IVec = IVec1 | IVec2 | IVec3 | IVec4;
/** This type defines any possible vector */
export type Vec = Vec1 | Vec2 | Vec3 | Vec4;

/**
 * Temp Vec3 registers. Can be used for intermediate operations. These
 * are EXTREMELY temporary and volatile for use. Use with EXTREME caution and
 * don't expect them to retain any expected value.
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
export const V3R: Vec3[] = new Array(20).fill(0).map((_) => [0, 0, 0]);

/**
 * Temp Vec4 registers. Can be used for intermediate operations. These
 * are EXTREMELY temporary and volatile for use. Use with EXTREME caution and
 * don't expect them to retain any expected value.
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
export const V4R: Vec4[] = new Array(20).fill(0).map((_) => [0, 0, 0, 0]);

// Type guards for Vecs

export function isVec1(val: any): val is Vec1 {
  return val && Array.isArray(val) && val.length === 1;
}

export function isVec2(val: any): val is Vec2 {
  return val && Array.isArray(val) && val.length === 2;
}

export function isVec3(val: any): val is Vec3 {
  return val && Array.isArray(val) && val.length === 3;
}

export function isVec4(val: any): val is Vec4 {
  return val && Array.isArray(val) && val.length === 4;
}

// Vec1 methods

export function apply1(v: Vec1Compat | undefined, v0: number): Vec1 {
  v = v || ([] as any as Vec1);
  v[0] = v0;

  return v as Vec1;
}

export function add1(
  left: ReadonlyVec1Compat,
  right: ReadonlyVec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, left[0] + right[0]);
}

export function ceil1(vec: ReadonlyVec1Compat, out?: Vec1Compat): Vec1 {
  return apply1(out, ceil(vec[0]));
}

export function compare1(
  left: ReadonlyVec1Compat,
  right: ReadonlyVec1Compat
): boolean {
  return left[0] === right[0];
}

export function fuzzyCompare1(
  left: ReadonlyVec1Compat,
  right: ReadonlyVec1Compat,
  epsilon: number
): boolean {
  return abs(left[0] - right[0]) <= epsilon;
}

export function copy1(vec: ReadonlyVec1Compat, out?: Vec1Compat): Vec1 {
  return apply1(out, vec[0]);
}

export function forward1(): Vec1 {
  return [0];
}

/**
 * Cross product of 1 dimensional vectors could be easiest to visualize as two
 * parallel or anti-parallel vectors that are in the 2D plane. This would result in a vector that is of zero magnitude
 * going into the Z direction. Or essentially [0, 0, 0]. Thus for consistency of <vec method><vec component length>()
 * We will take the one dimension inference of this result and provide [0]
 */
export function cross1(
  _left: ReadonlyVec1Compat,
  _right: ReadonlyVec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, 0);
}

export function divide1(
  top: ReadonlyVec1Compat,
  bottom: ReadonlyVec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, top[0] / bottom[0]);
}

export function empty1(out?: Vec1) {
  return apply1(out, 0);
}

export function flatten1(list: ReadonlyVec1Compat[], out?: number[]): number[] {
  out = out || [];

  for (let i = 0, iMax = list.length; i < iMax; ++i) {
    out.push(list[i][0]);
  }

  return out;
}

export function floor1(vec: ReadonlyVec1Compat, out?: Vec1Compat): Vec1 {
  return apply1(out, floor(vec[0]));
}

export function inverse1(vec: ReadonlyVec1Compat, out?: Vec1Compat): Vec1 {
  return apply1(out, 1 / vec[0]);
}

export function scale1(
  vec: ReadonlyVec1Compat,
  scale: number,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, vec[0] * scale);
}

export function subtract1(
  left: ReadonlyVec1Compat,
  right: ReadonlyVec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, left[0] - right[0]);
}

export function max1(
  left: ReadonlyVec1Compat,
  right: ReadonlyVec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, max(left[0], right[0]));
}

export function min1(
  left: ReadonlyVec1Compat,
  right: ReadonlyVec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, min(left[0], right[0]));
}

export function multiply1(
  left: ReadonlyVec1Compat,
  right: ReadonlyVec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, left[0] * right[0]);
}

export function normalize1(_left: ReadonlyVec1Compat, out?: Vec1Compat): Vec1 {
  return apply1(out, 1);
}

export function dot1(
  left: ReadonlyVec1Compat,
  right: ReadonlyVec1Compat
): number {
  return left[0] * right[0];
}

/**
 * This is a sort of modified dot production where the components are subtracted
 * together instead of added together. It's a bit backwards so we called it tod
 * which is reverse of dot.
 */
export function tod1(
  left: ReadonlyVec1Compat,
  right: ReadonlyVec1Compat
): number {
  return left[0] * right[0];
}

export function linear1(
  start: ReadonlyVec1Compat,
  end: ReadonlyVec1Compat,
  t: number,
  out?: Vec1Compat
): Vec1 {
  return add1(scale1(subtract1(end, start), t), start, out);
}

export function length1(start: ReadonlyVec1Compat): number {
  return start[0];
}

export function length1Components(x: number): number {
  return x;
}

export function vec1(
  values: Readonly<number[] | number>,
  ...args: readonly (number | number[])[]
): Vec1 {
  let out: number[];
  args = args || [];

  if (Array.isArray(values)) {
    out = values.slice(0, 1) as Vec1;
  } else {
    out = [values as Readonly<number>];
  }

  if (out.length < 1) {
    for (let i = 0, iMax = args.length; i < iMax && out.length < 1; ++i) {
      const next = args[i];
      if (Array.isArray(next)) {
        out.push(...next.slice(0, 1 - out.length));
      } else {
        out.push(next);
      }
    }
  }

  while (out.length < 1) out.push(0);

  return out as Vec1;
}

// Vec2 methods

export function apply2(
  v: Vec2Compat | undefined,
  v0: number,
  v1: number
): Vec2 {
  v = v || (new Array(2) as any as Vec2);
  v[0] = v0;
  v[1] = v1;

  return v as Vec2;
}

export function add2(
  left: ReadonlyVec2Compat,
  right: ReadonlyVec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, left[0] + right[0], left[1] + right[1]);
}

export function ceil2(vec: ReadonlyVec2Compat, out?: Vec2Compat): Vec2 {
  return apply2(out, ceil(vec[0]), ceil(vec[1]));
}

export function copy2(vec: ReadonlyVec2Compat, out?: Vec2Compat): Vec2 {
  return apply2(out, vec[0], vec[1]);
}

export function forward2(out?: Vec2Compat) {
  return apply2(out, 1, 0);
}

/**
 * Cross product of a 2D vector would result in [0, 0, <magnitude>] within the
 * 2D plane. In keeping with the format of vector methods in this document
 * <method name><vector component length>() we return only the 2D result of the
 * product [0, 0]. In order to get the results of the actual 2D vectors in a 3D
 * world, you must use cross3() to retrieve the Z result.
 */
export function cross2(
  _left: ReadonlyVec2Compat,
  _right: ReadonlyVec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, 0, 0);
}

export function compare2(
  left: ReadonlyVec2Compat,
  right: ReadonlyVec2Compat
): boolean {
  return left[0] === right[0] && left[1] === right[1];
}

export function fuzzyCompare2(
  left: ReadonlyVec2Compat,
  right: ReadonlyVec2Compat,
  epsilon: number
): boolean {
  return (
    abs(left[0] - right[0]) <= epsilon && abs(left[1] - right[1]) <= epsilon
  );
}

export function divide2(
  top: ReadonlyVec2Compat,
  bottom: ReadonlyVec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, top[0] / bottom[0], top[1] / bottom[1]);
}

export function empty2(out?: Vec2) {
  return apply2(out, 0, 0);
}

export function flatten2(list: ReadonlyVec2Compat[], out?: number[]): number[] {
  out = out || new Array(list.length * 2);

  for (let i = 0, index = 0, iMax = list.length; i < iMax; ++i, index += 2) {
    const v = list[i];
    out[index] = v[0];
    out[index + 1] = v[1];
  }

  return out;
}

export function floor2(vec: ReadonlyVec2Compat, out?: Vec2Compat): Vec2 {
  return apply2(out, floor(vec[0]), floor(vec[1]));
}

export function inverse2(vec: ReadonlyVec2Compat, out?: Vec2Compat): Vec2 {
  return apply2(out, 1 / vec[0], 1 / vec[1]);
}

export function max2(
  left: ReadonlyVec2Compat,
  right: ReadonlyVec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, max(left[0], right[0]), max(left[1], right[1]));
}

export function min2(
  left: ReadonlyVec2Compat,
  right: ReadonlyVec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, min(left[0], right[0]), min(left[1], right[1]));
}

export function scale2(
  left: ReadonlyVec2Compat,
  scale: number,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, left[0] * scale, left[1] * scale);
}

export function subtract2(
  left: ReadonlyVec2Compat,
  right: ReadonlyVec2Compat,
  out?: Vec2Compat
): Vec2 {
  const v: Vec2 = (out as Vec2) || (new Array(2) as any as Vec2);
  v[0] = left[0] - right[0];
  v[1] = left[1] - right[1];
  return v;
}

export function multiply2(
  left: ReadonlyVec2Compat,
  right: ReadonlyVec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, left[0] * right[0], left[1] * right[1]);
}

export function normalize2(left: ReadonlyVec2Compat, out?: Vec2Compat): Vec2 {
  const length = length2(left);
  return apply2(out, left[0] / length, left[1] / length);
}

export function dot2(
  left: ReadonlyVec2Compat,
  right: ReadonlyVec2Compat
): number {
  return left[0] * right[0] + left[1] * right[1];
}

/**
 * This is a sort of modified dot production where the components are subtracted
 * together instead of added together. It's a bit backwards so we called it tod
 * which is reverse of dot.
 */
export function tod2(
  left: ReadonlyVec2Compat,
  right: ReadonlyVec2Compat
): number {
  return left[0] * right[0] - left[1] * right[1];
}

/**
 * This is a sort of modified dot production where the components are subtracted
 * together instead of added together AND the components are flipped on one of
 * the vectors.
 *
 * x1 * y2 - y1 * x2
 */
export function tod_flip2(
  left: ReadonlyVec2Compat,
  right: ReadonlyVec2Compat
): number {
  return left[0] * right[1] - left[1] * right[0];
}

/**
 * Swaps component direction [x, y] -> [y, x]
 */
export function reverse2(vec: ReadonlyVec2Compat, out?: Vec2Compat): Vec2 {
  return apply2(out, vec[1], vec[0]);
}

export function linear2(
  start: ReadonlyVec2Compat,
  end: ReadonlyVec2Compat,
  t: number,
  out?: Vec2Compat
): Vec2 {
  return add2(scale2(subtract2(end, start), t), start, out);
}

export function length2(start: ReadonlyVec2Compat): number {
  return length2Components(start[0], start[1]);
}

export function length2Components(x: number, y: number): number {
  return sqrt(x * x + y * y);
}

export function vec2(
  values: number[] | number,
  ...args: (number | number[])[]
): Vec2 {
  let out: number[];
  args = args || [];

  if (Array.isArray(values)) {
    out = values.slice(0, 2) as Vec2;
  } else {
    out = [values];
  }

  if (out.length < 2) {
    for (let i = 0, iMax = args.length; i < iMax && out.length < 2; ++i) {
      const next = args[i];
      if (Array.isArray(next)) {
        out.push(...next.slice(0, 2 - out.length));
      } else {
        out.push(next);
      }
    }
  }

  while (out.length < 2) out.push(0);

  return out as Vec2;
}

// Vec3 methods

export function apply3(
  v: Vec3Compat | undefined,
  v0: number,
  v1: number,
  v2: number
): Vec3 {
  v = v || (new Array(3) as any as Vec3);
  v[0] = v0;
  v[1] = v1;
  v[2] = v2;

  return v as Vec3;
}

export function add3(
  left: ReadonlyVec3Compat,
  right: ReadonlyVec3Compat,
  out?: Vec3Compat
): Vec3 {
  return apply3(
    out,
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2]
  );
}

export function ceil3(vec: ReadonlyVec3Compat, out?: Vec3Compat): Vec3 {
  return apply3(out, ceil(vec[0]), ceil(vec[1]), ceil(vec[2]));
}

export function copy3(vec: ReadonlyVec3Compat, out?: Vec3Compat): Vec3 {
  return apply3(out, vec[0], vec[1], vec[2]);
}

export function compare3(
  left: ReadonlyVec3Compat,
  right: ReadonlyVec3Compat
): boolean {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2];
}

export function fuzzyCompare3(
  left: ReadonlyVec3Compat,
  right: ReadonlyVec3Compat,
  epsilon: number
): boolean {
  return (
    abs(left[0] - right[0]) <= epsilon &&
    abs(left[1] - right[1]) <= epsilon &&
    abs(left[2] - right[2]) <= epsilon
  );
}

export function forward3(out?: Vec3Compat): Vec3 {
  return apply3(out, 0, 0, -1);
}

export function cross3(
  left: ReadonlyVec3Compat,
  right: ReadonlyVec3Compat,
  out?: Vec3Compat
): Vec3 {
  out = out || (new Array(3) as any as Vec3);
  out[0] = left[1] * right[2] - left[2] * right[1];
  out[1] = left[2] * right[0] - left[0] * right[2];
  out[2] = left[0] * right[1] - left[1] * right[0];

  return out as Vec3;
}

export function divide3(
  top: ReadonlyVec3Compat,
  bottom: ReadonlyVec3Compat,
  out?: Vec3Compat
): Vec3 {
  return apply3(
    out,
    top[0] / bottom[0],
    top[1] / bottom[1],
    top[2] / bottom[2]
  );
}

export function empty3(out?: Vec3) {
  return apply3(out, 0, 0, 0);
}

export function flatten3(list: ReadonlyVec3Compat[], out?: number[]): number[] {
  out = out || new Array(list.length * 3);

  for (let i = 0, index = 0, iMax = list.length; i < iMax; ++i, index += 3) {
    const v = list[i];
    out[index] = v[0];
    out[index + 1] = v[1];
    out[index + 2] = v[2];
  }

  return out;
}

export function floor3(vec: ReadonlyVec3Compat, out?: Vec3Compat): Vec3 {
  return apply3(out, floor(vec[0]), floor(vec[1]), floor(vec[2]));
}

export function inverse3(vec: ReadonlyVec3Compat, out?: Vec3Compat): Vec3 {
  return apply3(out, 1 / vec[0], 1 / vec[1], 1 / vec[2]);
}

export function scale3(
  left: ReadonlyVec3Compat,
  scale: number,
  out?: Vec3Compat
): Vec3 {
  return apply3(out, left[0] * scale, left[1] * scale, left[2] * scale);
}

export function subtract3(
  left: ReadonlyVec3Compat,
  right: ReadonlyVec3Compat,
  out?: Vec3Compat
): Vec3 {
  return apply3(
    out,
    left[0] - right[0],
    left[1] - right[1],
    left[2] - right[2]
  );
}

export function multiply3(
  left: ReadonlyVec3Compat,
  right: ReadonlyVec3Compat,
  out?: Vec3Compat
): Vec3 {
  return apply3(
    out,
    left[0] * right[0],
    left[1] * right[1],
    left[2] * right[2]
  );
}

export function linear3(
  start: ReadonlyVec3Compat,
  end: ReadonlyVec3Compat,
  t: number,
  out?: Vec3Compat
): Vec3 {
  return add3(scale3(subtract3(end, start), t), start, out);
}

export function length3(start: ReadonlyVec3Compat): number {
  return length3Components(start[0], start[1], start[2]);
}

export function length3Components(x: number, y: number, z: number): number {
  return sqrt(x * x + y * y + z * z);
}

export function max3(
  left: ReadonlyVec3Compat,
  right: ReadonlyVec3Compat,
  out?: Vec3Compat
): Vec3 {
  return apply3(
    out,
    max(left[0], right[0]),
    max(left[1], right[1]),
    max(left[2], right[2])
  );
}

export function min3(
  left: ReadonlyVec3Compat,
  right: ReadonlyVec3Compat,
  out?: Vec3Compat
): Vec3 {
  return apply3(
    out,
    min(left[0], right[0]),
    min(left[1], right[1]),
    min(left[2], right[2])
  );
}

export function normalize3(left: ReadonlyVec3Compat, out?: Vec3Compat): Vec3 {
  out = out || (new Array(3) as any as Vec3);
  const length = length3(left);
  out[0] = left[0] / length;
  out[1] = left[1] / length;
  out[2] = left[2] / length;

  return out as Vec3;
}

export function dot3(
  left: ReadonlyVec3Compat,
  right: ReadonlyVec3Compat
): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

/**
 * This is a sort of modified dot production where the components are subtracted
 * together instead of added together. It's a bit backwards so we called it tod
 * which is reverse of dot.
 */
export function tod3(
  left: ReadonlyVec3Compat,
  right: ReadonlyVec3Compat
): number {
  return left[0] * right[0] - left[1] * right[1] - left[2] * right[2];
}

/**
 * Swaps component direction [x, y, z] -> [z, y, x]
 */
export function reverse3(vec: ReadonlyVec3Compat, out?: Vec3Compat): Vec3 {
  return apply3(out, vec[2], vec[1], vec[0]);
}

export function vec3(
  values: Readonly<number[] | number>,
  ...args: readonly (number | number[])[]
): Vec3 {
  let out: number[];
  args = args || [];

  if (Array.isArray(values)) {
    out = values.slice(0, 3) as Vec3;
  } else {
    out = [values as Readonly<number>];
  }

  if (out.length < 3) {
    for (let i = 0, iMax = args.length; i < iMax && out.length < 3; ++i) {
      const next = args[i];
      if (Array.isArray(next)) {
        out.push(...next.slice(0, 3 - out.length));
      } else {
        out.push(next);
      }
    }
  }

  while (out.length < 3) out.push(0);

  return out as Vec3;
}

/**
 * Produces a directional vector that is straight up from the provided reference vectors (90 degress elevated from
 * the forward vector)
 */
export function up3(
  forward: ReadonlyVec3Compat,
  up: ReadonlyVec3Compat,
  out?: Vec3Compat
) {
  out = out || [0, 0, 0];
  return normalize3(cross3(cross3(forward, up), forward), out);
}

/**
 * Produces a directional vector that is directly to the right of the reference vectors (90 degress rotated from the
 * forrward vector)
 */
export function right3(
  forward: ReadonlyVec3Compat,
  up: ReadonlyVec3Compat,
  out?: Vec3Compat
) {
  out = out || [0, 0, 0];
  return normalize3(cross3(forward, up), out);
}

/**
 * Produces a directional vector that is directly to the left of the reference vectors (90 degress rotated from the
 * forrward vector)
 */
export function left3(
  forward: ReadonlyVec3Compat,
  up: ReadonlyVec3Compat,
  out?: Vec3Compat
) {
  out = out || [0, 0, 0];
  return normalize3(cross3(up, forward), out);
}

/**
 * Produces a directional vector that is straight down from the provided reference vectors (90 degress declined from
 * the forward vector)
 */
export function down3(
  forward: ReadonlyVec3Compat,
  up: ReadonlyVec3Compat,
  out?: Vec3Compat
) {
  out = out || [0, 0, 0];
  return normalize3(cross3(forward, cross3(forward, up)), out);
}

// Vec4 methods
export function apply4(
  v: Vec4Compat | undefined,
  v0: number,
  v1: number,
  v2: number,
  v3: number
): Vec4 {
  v = v || (new Array(4) as any as Vec4);
  v[0] = v0;
  v[1] = v1;
  v[2] = v2;
  v[3] = v3;

  return v as Vec4;
}

export function add4(
  left: ReadonlyVec4Compat,
  right: ReadonlyVec4Compat,
  out?: Vec4Compat
): Vec4 {
  return apply4(
    out,
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2],
    left[3] + right[3]
  );
}

export function add4by3(
  left: ReadonlyVec4Compat,
  right: ReadonlyVec3Compat,
  out?: Vec4Compat
): Vec4 {
  return apply4(
    out,
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2],
    left[3]
  );
}

export function ceil4(vec: ReadonlyVec4Compat, out?: Vec4Compat): Vec4 {
  return apply4(out, ceil(vec[0]), ceil(vec[1]), ceil(vec[2]), ceil(vec[3]));
}

export function copy4(vec: ReadonlyVec4Compat, out?: Vec4Compat): Vec4 {
  return apply4(out, vec[0], vec[1], vec[2], vec[3]);
}

export function compare4(
  left: ReadonlyVec4Compat,
  right: ReadonlyVec4Compat
): boolean {
  return (
    left[0] === right[0] &&
    left[1] === right[1] &&
    left[2] === right[2] &&
    left[3] === right[3]
  );
}

export function fuzzyCompare4(
  left: ReadonlyVec4Compat,
  right: ReadonlyVec4Compat,
  epsilon: number
): boolean {
  return (
    abs(left[0] - right[0]) <= epsilon &&
    abs(left[1] - right[1]) <= epsilon &&
    abs(left[2] - right[2]) <= epsilon &&
    abs(left[3] - right[3]) <= epsilon
  );
}

export function forward4(out?: Vec4Compat): Vec4 {
  return apply4(out, 0, 0, -1, 0);
}

/**
 * 4D cross product? Lots of issues here. If you need a proper cross product for
 * 3D, please use cross3. What this method should do is up for debate for now
 * and will return a unit 4D vector.
 */
export function cross4(
  _left: ReadonlyVec4Compat,
  _right: ReadonlyVec4Compat,
  out?: Vec4Compat
): Vec4 {
  return apply4(out, 0, 0, 0, 1);
}

export function divide4(
  top: ReadonlyVec4Compat,
  bottom: ReadonlyVec4Compat,
  out?: Vec4Compat
): Vec4 {
  return apply4(
    out,
    top[0] / bottom[0],
    top[1] / bottom[1],
    top[2] / bottom[2],
    top[3] / bottom[3]
  );
}

export function empty4(out?: Vec4) {
  return apply4(out, 0, 0, 0, 0);
}

export function flatten4(list: ReadonlyVec4Compat[], out?: number[]): number[] {
  out = out || new Array(4);

  for (let i = 0, index = 0, iMax = list.length; i < iMax; ++i, index += 4) {
    const v = list[i];
    out[index] = v[0];
    out[index + 1] = v[1];
    out[index + 2] = v[2];
    out[index + 3] = v[3];
  }

  return out;
}

export function floor4(vec: ReadonlyVec4Compat, out?: Vec4Compat): Vec4 {
  return apply4(
    out,
    floor(vec[0]),
    floor(vec[1]),
    floor(vec[2]),
    floor(vec[3])
  );
}

export function inverse4(vec: ReadonlyVec4Compat, out?: Vec4Compat): Vec4 {
  return apply4(out, 1 / vec[0], 1 / vec[1], 1 / vec[2], 1 / vec[3]);
}

export function scale4(
  left: ReadonlyVec4Compat,
  scale: number,
  out?: Vec4Compat
): Vec4 {
  return apply4(
    out,
    left[0] * scale,
    left[1] * scale,
    left[2] * scale,
    left[3] * scale
  );
}

export function subtract4(
  left: ReadonlyVec4Compat,
  right: ReadonlyVec4Compat,
  out?: Vec4Compat
): Vec4 {
  return apply4(
    out,
    left[0] - right[0],
    left[1] - right[1],
    left[2] - right[2],
    left[3] - right[3]
  );
}

export function multiply4(
  left: ReadonlyVec4Compat,
  right: ReadonlyVec4Compat,
  out?: Vec4Compat
): Vec4 {
  return apply4(
    out,
    left[0] * right[0],
    left[1] * right[1],
    left[2] * right[2],
    left[3] * right[3]
  );
}

export function dot4(
  left: ReadonlyVec4Compat,
  right: ReadonlyVec4Compat
): number {
  return (
    left[0] * right[0] +
    left[1] * right[1] +
    left[2] * right[2] +
    left[3] * right[3]
  );
}

/**
 * This is a sort of modified dot production where the components are subtracted
 * together instead of added together. It's a bit backwards so we called it tod
 * which is reverse of dot.
 */
export function tod4(
  left: ReadonlyVec4Compat,
  right: ReadonlyVec4Compat
): number {
  return (
    left[0] * right[0] -
    left[1] * right[1] -
    left[2] * right[2] -
    left[3] * right[3]
  );
}

/**
 * Swaps component direction [x, y, z] -> [z, y, x]
 */
export function reverse4(vec: ReadonlyVec4Compat, out?: Vec4Compat): Vec4 {
  return apply4(out, vec[3], vec[2], vec[1], vec[0]);
}

export function linear4(
  start: Vec4,
  end: Vec4,
  t: number,
  out?: Vec4Compat
): Vec4 {
  return add4(scale4(subtract4(end, start), t), start, out);
}

export function length4(start: ReadonlyVec4Compat): number {
  return length4Components(start[0], start[1], start[2], start[3]);
}

export function length4Components(
  x: number,
  y: number,
  z: number,
  w: number
): number {
  return sqrt(x * x + y * y + z * z + w * w);
}

export function max4(
  left: ReadonlyVec4Compat,
  right: ReadonlyVec4Compat,
  out?: Vec4Compat
): Vec4 {
  return apply4(
    out,
    max(left[0], right[0]),
    max(left[1], right[1]),
    max(left[2], right[2]),
    max(left[3], right[3])
  );
}

export function min4(
  left: ReadonlyVec4Compat,
  right: ReadonlyVec4Compat,
  out?: Vec4Compat
): Vec4 {
  return apply4(
    out,
    min(left[0], right[0]),
    min(left[1], right[1]),
    min(left[2], right[2]),
    min(left[3], right[3])
  );
}

export function normalize4(left: ReadonlyVec4Compat, out?: Vec4Compat): Vec4 {
  const length = length4(left);
  return apply4(
    out,
    left[0] / length,
    left[1] / length,
    left[2] / length,
    left[3] / length
  );
}

export function vec4(
  values: number[] | number,
  ...args: (number | number[])[]
): Vec4 {
  let out: number[];
  args = args || [];

  if (Array.isArray(values)) {
    out = values.slice(0, 4) as Vec4;
  } else {
    out = [values];
  }

  if (out.length < 4) {
    for (let i = 0, iMax = args.length; i < iMax && out.length < 4; ++i) {
      const next = args[i];
      if (Array.isArray(next)) {
        out.push(...next.slice(0, 4 - out.length));
      } else {
        out.push(next);
      }
    }
  }

  while (out.length < 4) out.push(0);

  return out as Vec4;
}

/**
 * Generates a Vec4/Color (rgb) from a hex value with 3 components 0xFFFFFF
 */
export function color4FromHex3(hex: number, out?: Vec4) {
  out = out || [0, 0, 0, 0];

  return apply4(
    out,
    ((hex & 0xff0000) >> 16) / 255,
    ((hex & 0xff00) >> 8) / 255,
    (hex & 0xff) / 255,
    1
  );
}

/**
 * Generates a Vec4/Color (rgba) from a hex value with 4 components 0xFFFFFFFF
 */
export function color4FromHex4(hex: number, out?: Vec4) {
  out = out || [0, 0, 0, 0];

  return apply4(
    out,
    ((hex & 0xff000000) >> 24) / 255,
    ((hex & 0xff0000) >> 16) / 255,
    ((hex & 0xff00) >> 8) / 255,
    (hex & 0xff) / 255
  );
}

export function slerpQuat(from: Vec4, to: Vec4, t: number, out?: Vec4): Vec4 {
  out = out || [0, 0, 0, 0];
  const to1: Vec4 = [0, 0, 0, 0];
  let omega, cosom, sinom, scale0, scale1;
  cosom = from[1] * to[1] + from[2] * to[2] + from[3] * to[3] + from[0] * to[0];

  if (cosom < 0.0) {
    cosom = -cosom;
    to1[0] = -to[0];
    to1[1] = -to[1];
    to1[2] = -to[2];
    to1[3] = -to[3];
  } else {
    to1[0] = to[0];
    to1[1] = to[1];
    to1[2] = to[2];
    to1[3] = to[3];
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
  out[1] = scale0 * from[1] + scale1 * to1[1];
  out[2] = scale0 * from[2] + scale1 * to1[2];
  out[3] = scale0 * from[3] + scale1 * to1[3];
  out[0] = scale0 * from[0] + scale1 * to1[0];

  return out;
}

// Vec method aggregations
export type VecMethods<T extends Vec> = {
  add(left: T, right: T, out?: T): T;
  ceil(vec: T, out?: T): T;
  copy(vec: T, out?: T): T;
  compare(left: T, right: T): boolean;
  cross(left: T, right: T, out?: T): T;
  divide(top: T, bottom: T, out?: T): T;
  dot(left: T, right: T): number;
  empty(out?: T): T;
  flatten(list: T[], out?: number[]): number[];
  floor(vec: T, out?: T): T;
  forward(vec: T, out?: T): T;
  inverse(vec: T, out?: T): T;
  length(vec: T): number;
  linear(start: T, end: T, t: number, out?: T): T;
  max(left: T, right: T, out?: T): T;
  min(left: T, right: T, out?: T): T;
  multiply(left: T, right: T, out?: T): T;
  normalize(vec: T, out?: T): T;
  scale(vec: T, scale: number, out?: T): T;
  subtract(left: T, right: T, out?: T): T;
  vec(values: number[] | number, ...args: (number | number[])[]): T;
  slerpQuat?(start: T, end: T, t: number, out?: T): T;
};

export const vec1Methods: VecMethods<Vec1> = {
  add: add1,
  ceil: ceil1,
  copy: copy1,
  compare: compare1,
  cross: cross1,
  divide: divide1,
  dot: dot1,
  empty: empty1,
  flatten: flatten1,
  floor: floor1,
  forward: forward1,
  inverse: inverse1,
  length: length1,
  linear: linear1,
  max: max1,
  min: min1,
  multiply: multiply1,
  normalize: normalize1,
  scale: scale1,
  subtract: subtract1,
  vec: vec1,
};

export const vec2Methods: VecMethods<Vec2> = {
  add: add2,
  ceil: ceil2,
  copy: copy2,
  compare: compare2,
  cross: cross2,
  divide: divide2,
  dot: dot2,
  empty: empty2,
  flatten: flatten2,
  floor: floor2,
  forward: forward2,
  inverse: inverse2,
  length: length2,
  linear: linear2,
  max: max2,
  min: min2,
  multiply: multiply2,
  normalize: normalize2,
  scale: scale2,
  subtract: subtract2,
  vec: vec2,
};

export const vec3Methods: VecMethods<Vec3> = {
  add: add3,
  ceil: ceil3,
  copy: copy3,
  compare: compare3,
  cross: cross3,
  divide: divide3,
  dot: dot3,
  empty: empty3,
  flatten: flatten3,
  floor: floor3,
  forward: forward3,
  inverse: inverse3,
  length: length3,
  linear: linear3,
  max: max3,
  min: min3,
  multiply: multiply3,
  normalize: normalize3,
  scale: scale3,
  subtract: subtract3,
  vec: vec3,
};

export const vec4Methods: VecMethods<Vec4> = {
  add: add4,
  ceil: ceil4,
  copy: copy4,
  compare: compare4,
  cross: cross4,
  divide: divide4,
  dot: dot4,
  empty: empty4,
  flatten: flatten4,
  floor: floor4,
  forward: forward4,
  inverse: inverse4,
  length: length4,
  linear: linear4,
  max: max4,
  min: min4,
  multiply: multiply4,
  normalize: normalize4,
  scale: scale4,
  subtract: subtract4,
  vec: vec4,
  slerpQuat: slerpQuat,
};

export function VecMath<T extends IVec>(vec: T): VecMethods<T> {
  let methods: VecMethods<T>;

  if (vec.length === 1) {
    methods = vec1Methods as VecMethods<T>;
    return methods;
  } else if (vec.length === 2) {
    methods = vec2Methods as VecMethods<T>;
    return methods;
  } else if (vec.length === 3) {
    methods = vec3Methods as VecMethods<T>;
    return methods;
  }

  methods = vec4Methods as VecMethods<T>;

  return methods;
}

export function toString1(v: ReadonlyVec1Compat): string {
  return `[${v[0]}]`;
}

export function toString2(v: ReadonlyVec2Compat): string {
  return `[${v[0]}, ${v[1]}]`;
}

export function toString3(v: ReadonlyVec3Compat): string {
  return `[${v[0]}, ${v[1]}, ${v[2]}]`;
}

export function toString4(v: ReadonlyVec4Compat): string {
  return `[${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}]`;
}
