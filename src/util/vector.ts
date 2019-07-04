const { sqrt, max, min, floor, ceil, abs } = Math;

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

/** This type defines any possible explicit vector */
export type IVec = IVec1 | IVec2 | IVec3 | IVec4;
/** This type defines any possible vector */
export type Vec = Vec1 | Vec2 | Vec3 | Vec4;

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
  v = v || (([] as any) as Vec1);
  v[0] = v0;

  return v as Vec1;
}

export function add1(
  left: Vec1Compat,
  right: Vec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, left[0] + right[0]);
}

export function ceil1(vec: Vec1Compat, out?: Vec1Compat): Vec1 {
  return apply1(out, ceil(vec[0]));
}

export function compare1(left: Vec1Compat, right: Vec1Compat): boolean {
  return left[0] === right[0];
}

export function fuzzyCompare1(
  left: Vec1Compat,
  right: Vec1Compat,
  epsilon: number
): boolean {
  return abs(left[0] - right[0]) <= epsilon;
}

export function copy1(vec: Vec1Compat, out?: Vec1Compat): Vec1 {
  return apply1(out, vec[0]);
}

/**
 * Cross product of 1 dimensional vectors could be easiest to visualize as two
 * parallel or anti-parallel vectors that are in the 2D plane. This would result in a vector that is of zero magnitude
 * going into the Z direction. Or essentially [0, 0, 0]. Thus for consistency of <vec method><vec component length>()
 * We will take the one dimension inference of this result and provide [0]
 */
export function cross1(
  _left: Vec1Compat,
  _right: Vec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, 0);
}

export function divide1(
  top: Vec1Compat,
  bottom: Vec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, top[0] / bottom[0]);
}

export function empty1(out?: Vec1) {
  return apply1(out, 0);
}

export function flatten1(list: Vec1Compat[], out?: number[]): number[] {
  out = out || [];

  for (let i = 0, iMax = list.length; i < iMax; ++i) {
    out.push(list[i][0]);
  }

  return out;
}

export function floor1(vec: Vec1Compat, out?: Vec1Compat): Vec1 {
  return apply1(out, floor(vec[0]));
}

export function inverse1(vec: Vec1Compat, out?: Vec1Compat): Vec1 {
  return apply1(out, 1 / vec[0]);
}

export function scale1(vec: Vec1Compat, scale: number, out?: Vec1Compat): Vec1 {
  return apply1(out, vec[0] * scale);
}

export function subtract1(
  left: Vec1Compat,
  right: Vec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, left[0] - right[0]);
}

export function max1(
  left: Vec1Compat,
  right: Vec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, max(left[0], right[0]));
}

export function min1(
  left: Vec1Compat,
  right: Vec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, min(left[0], right[0]));
}

export function multiply1(
  left: Vec1Compat,
  right: Vec1Compat,
  out?: Vec1Compat
): Vec1 {
  return apply1(out, left[0] * right[0]);
}

export function normalize1(_left: Vec1Compat, out?: Vec1Compat): Vec1 {
  return apply1(out, 1);
}

export function dot1(left: Vec1Compat, right: Vec1Compat): number {
  return left[0] * right[0];
}

export function linear1(
  start: Vec1Compat,
  end: Vec1Compat,
  t: number,
  out?: Vec1Compat
): Vec1 {
  return scale1(add1(subtract1(end, start), start), t, out);
}

export function length1(start: Vec1Compat): number {
  return sqrt(dot1(start, start));
}

export function vec1(
  values: number[] | number,
  ...args: (number | number[])[]
): Vec1 {
  let out: number[];
  args = args || [];

  if (Array.isArray(values)) {
    out = values.slice(0, 1) as Vec1;
  } else {
    out = [values];
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
  v = v || (([] as any) as Vec2);
  v[0] = v0;
  v[1] = v1;

  return v as Vec2;
}

export function add2(
  left: Vec2Compat,
  right: Vec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, left[0] + right[0], left[1] + right[1]);
}

export function ceil2(vec: Vec2Compat, out?: Vec2Compat): Vec2 {
  return apply2(out, ceil(vec[0]), ceil(vec[1]));
}

export function copy2(vec: Vec2Compat, out?: Vec2Compat): Vec2 {
  return apply2(out, vec[0], vec[1]);
}

/**
 * Cross product of a 2D vector would result in [0, 0, <magnitude>] within the 2D plane. In keeping with the format of
 * vector methods in this document <method name><vector component length>() we return only the 2D result of the product
 * [0, 0].
 * In order to get the results of the actual 2D vectors in a 3D world, you must use cross3() to retrieve the Z result.
 */
export function cross2(
  _left: Vec2Compat,
  _right: Vec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, 0, 0);
}

export function compare2(left: Vec2Compat, right: Vec2Compat): boolean {
  return left[0] === right[0] && left[1] === right[1];
}

export function fuzzyCompare2(
  left: Vec2Compat,
  right: Vec2Compat,
  epsilon: number
): boolean {
  return (
    abs(left[0] - right[0]) <= epsilon && abs(left[1] - right[1]) <= epsilon
  );
}

export function divide2(
  top: Vec2Compat,
  bottom: Vec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, top[0] / bottom[0], top[1] / bottom[1]);
}

export function empty2(out?: Vec2) {
  return apply2(out, 0, 0);
}

export function flatten2(list: Vec2Compat[], out?: number[]): number[] {
  out = out || [];

  for (let i = 0, iMax = list.length; i < iMax; ++i) {
    const v = list[i];
    out.push(v[0]);
    out.push(v[1]);
  }

  return out;
}

export function floor2(vec: Vec2Compat, out?: Vec2Compat): Vec2 {
  return apply2(out, floor(vec[0]), floor(vec[1]));
}

export function inverse2(vec: Vec2Compat, out?: Vec2Compat): Vec2 {
  return apply2(out, 1 / vec[0], 1 / vec[1]);
}

export function max2(
  left: Vec2Compat,
  right: Vec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, max(left[0], right[0]), max(left[1], right[1]));
}

export function min2(
  left: Vec2Compat,
  right: Vec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, min(left[0], right[0]), min(left[1], right[1]));
}

export function scale2(
  left: Vec2Compat,
  scale: number,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, left[0] * scale, left[1] * scale);
}

export function subtract2(
  left: Vec2Compat,
  right: Vec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, left[0] - right[0], left[1] - right[1]);
}

export function multiply2(
  left: Vec2Compat,
  right: Vec2Compat,
  out?: Vec2Compat
): Vec2 {
  return apply2(out, left[0] * right[0], left[1] * right[1]);
}

export function normalize2(left: Vec2Compat, out?: Vec2Compat): Vec2 {
  const length = length2(left);
  return apply2(out, left[0] / length, left[1] / length);
}

export function dot2(left: Vec2Compat, right: Vec2Compat): number {
  return left[0] * right[0] + left[1] * right[1];
}

export function linear2(
  start: Vec2Compat,
  end: Vec2Compat,
  t: number,
  out?: Vec2Compat
): Vec2 {
  return scale2(add2(subtract2(end, start), start), t, out);
}

export function length2(start: Vec2Compat): number {
  return sqrt(dot2(start, start));
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
  v = v || (([] as any) as Vec3);
  v[0] = v0;
  v[1] = v1;
  v[2] = v2;

  return v as Vec3;
}

export function add3(
  left: Vec3Compat,
  right: Vec3Compat,
  out?: Vec3Compat
): Vec3 {
  return apply3(
    out,
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2]
  );
}

export function ceil3(vec: Vec3Compat, out?: Vec3Compat): Vec3 {
  return apply3(out, ceil(vec[0]), ceil(vec[1]), ceil(vec[2]));
}

export function copy3(vec: Vec3Compat, out?: Vec3Compat): Vec3 {
  return apply3(out, vec[0], vec[1], vec[2]);
}

export function compare3(left: Vec3Compat, right: Vec3Compat): boolean {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2];
}

export function fuzzyCompare3(
  left: Vec3Compat,
  right: Vec3Compat,
  epsilon: number
): boolean {
  return (
    abs(left[0] - right[0]) <= epsilon &&
    abs(left[1] - right[1]) <= epsilon &&
    abs(left[2] - right[2]) <= epsilon
  );
}

export function cross3(
  left: Vec3Compat,
  right: Vec3Compat,
  out?: Vec3Compat
): Vec3 {
  return apply3(
    out,
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0]
  );
}

export function divide3(
  top: Vec3Compat,
  bottom: Vec3Compat,
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

export function flatten3(list: Vec3Compat[], out?: number[]): number[] {
  out = out || [];

  for (let i = 0, iMax = list.length; i < iMax; ++i) {
    const v = list[i];
    out.push(v[0]);
    out.push(v[1]);
    out.push(v[2]);
  }

  return out;
}

export function floor3(vec: Vec3Compat, out?: Vec3Compat): Vec3 {
  return apply3(out, floor(vec[0]), floor(vec[1]), floor(vec[2]));
}

export function inverse3(vec: Vec3Compat, out?: Vec3Compat): Vec3 {
  return apply3(out, 1 / vec[0], 1 / vec[1], 1 / vec[2]);
}

export function scale3(
  left: Vec3Compat,
  scale: number,
  out?: Vec3Compat
): Vec3 {
  return apply3(out, left[0] * scale, left[1] * scale, left[2] * scale);
}

export function subtract3(
  left: Vec3Compat,
  right: Vec3Compat,
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
  left: Vec3Compat,
  right: Vec3Compat,
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
  start: Vec3Compat,
  end: Vec3Compat,
  t: number,
  out?: Vec3Compat
): Vec3 {
  return scale3(add3(subtract3(end, start), start), t, out);
}

export function length3(start: Vec3Compat): number {
  return sqrt(dot3(start, start));
}

export function max3(
  left: Vec3Compat,
  right: Vec3Compat,
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
  left: Vec3Compat,
  right: Vec3Compat,
  out?: Vec3Compat
): Vec3 {
  return apply3(
    out,
    min(left[0], right[0]),
    min(left[1], right[1]),
    min(left[2], right[2])
  );
}

export function normalize3(left: Vec3Compat, out?: Vec3Compat): Vec3 {
  const length = length3(left);
  return apply3(out, left[0] / length, left[1] / length, left[2] / length);
}

export function dot3(left: Vec3Compat, right: Vec3Compat): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

export function vec3(
  values: number[] | number,
  ...args: (number | number[])[]
): Vec3 {
  let out: number[];
  args = args || [];

  if (Array.isArray(values)) {
    out = values.slice(0, 3) as Vec3;
  } else {
    out = [values];
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

// Vec4 methods

export function apply4(
  v: Vec4Compat | undefined,
  v0: number,
  v1: number,
  v2: number,
  v3: number
): Vec4 {
  v = v || (([] as any) as Vec4);
  v[0] = v0;
  v[1] = v1;
  v[2] = v2;
  v[3] = v3;

  return v as Vec4;
}

export function add4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4 {
  return apply4(
    out,
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2],
    left[3] + right[3]
  );
}

export function ceil4(vec: Vec4Compat, out?: Vec4Compat): Vec4 {
  return apply4(out, ceil(vec[0]), ceil(vec[1]), ceil(vec[2]), ceil(vec[3]));
}

export function copy4(vec: Vec4, out?: Vec4Compat): Vec4 {
  return apply4(out, vec[0], vec[1], vec[2], vec[3]);
}

export function compare4(left: Vec4Compat, right: Vec4Compat): boolean {
  return (
    left[0] === right[0] &&
    left[1] === right[1] &&
    left[2] === right[2] &&
    left[3] === right[3]
  );
}

export function fuzzyCompare4(
  left: Vec4Compat,
  right: Vec4Compat,
  epsilon: number
): boolean {
  return (
    abs(left[0] - right[0]) <= epsilon &&
    abs(left[1] - right[1]) <= epsilon &&
    abs(left[2] - right[2]) <= epsilon &&
    abs(left[3] - right[3]) <= epsilon
  );
}

/**
 * 4D cross product? Lots of issues here. If you need a proper cross product for 3D, please use cross3. What
 * this method should do is up for debate for now and will return a unit 4D vector.
 */
export function cross4(_left: Vec4, _right: Vec4, out?: Vec4Compat): Vec4 {
  return apply4(out, 0, 0, 0, 1);
}

export function divide4(
  top: Vec4Compat,
  bottom: Vec4Compat,
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

export function flatten4(list: Vec4Compat[], out?: number[]): number[] {
  out = out || [];

  for (let i = 0, iMax = list.length; i < iMax; ++i) {
    const v = list[i];
    out.push(v[0]);
    out.push(v[1]);
    out.push(v[2]);
    out.push(v[3]);
  }

  return out;
}

export function floor4(vec: Vec4Compat, out?: Vec4Compat): Vec4 {
  return apply4(
    out,
    floor(vec[0]),
    floor(vec[1]),
    floor(vec[2]),
    floor(vec[3])
  );
}

export function inverse4(vec: Vec4, out?: Vec4Compat): Vec4 {
  return apply4(out, 1 / vec[0], 1 / vec[1], 1 / vec[2], 1 / vec[3]);
}

export function scale4(left: Vec4, scale: number, out?: Vec4Compat): Vec4 {
  return apply4(
    out,
    left[0] * scale,
    left[1] * scale,
    left[2] * scale,
    left[3] * scale
  );
}

export function subtract4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4 {
  return apply4(
    out,
    left[0] - right[0],
    left[1] - right[1],
    left[2] - right[2],
    left[3] - right[3]
  );
}

export function multiply4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4 {
  return apply4(
    out,
    left[0] * right[0],
    left[1] * right[1],
    left[2] * right[2],
    left[3] * right[3]
  );
}

export function dot4(left: Vec4, right: Vec4): number {
  return (
    left[0] * right[0] +
    left[1] * right[1] +
    left[2] * right[2] +
    left[3] * right[3]
  );
}

export function linear4(
  start: Vec4,
  end: Vec4,
  t: number,
  out?: Vec4Compat
): Vec4 {
  return scale4(add4(subtract4(end, start), start), t, out);
}

export function length4(start: Vec4): number {
  return sqrt(dot4(start, start));
}

export function max4(
  left: Vec4Compat,
  right: Vec4Compat,
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
  left: Vec4Compat,
  right: Vec4Compat,
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

export function normalize4(left: Vec4Compat, out?: Vec4Compat): Vec4 {
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
  inverse(vec: T, out?: T): T;
  length(vec: T): number;
  linear(start: T, end: T, t: number, out?: T): T;
  max(left: T, right: T, out?: T): T;
  min(left: T, right: T, out?: T): T;
  multiply(left: T, right: T, out?: T): T;
  normalize(vec: T, out?: T): T;
  scale(vec: T, scale: number, out?: T): T;
  subtract(left: T, right: T, out?: T): T;
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
  inverse: inverse1,
  length: length1,
  linear: linear1,
  max: max1,
  min: min1,
  multiply: multiply1,
  normalize: normalize1,
  scale: scale1,
  subtract: subtract1
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
  inverse: inverse2,
  length: length2,
  linear: linear2,
  max: max2,
  min: min2,
  multiply: multiply2,
  normalize: normalize2,
  scale: scale2,
  subtract: subtract2
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
  inverse: inverse3,
  length: length3,
  linear: linear3,
  max: max3,
  min: min3,
  multiply: multiply3,
  normalize: normalize3,
  scale: scale3,
  subtract: subtract3
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
  inverse: inverse4,
  length: length4,
  linear: linear4,
  max: max4,
  min: min4,
  multiply: multiply4,
  normalize: normalize4,
  scale: scale4,
  subtract: subtract4
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

export function toString1(v: Vec1Compat): string {
  return `[${v[0]}]`;
}

export function toString2(v: Vec2Compat): string {
  return `[${v[0]}, ${v[1]}]`;
}

export function toString3(v: Vec3Compat): string {
  return `[${v[0]}, ${v[1]}, ${v[2]}]`;
}

export function toString4(v: Vec4Compat): string {
  return `[${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}]`;
}
