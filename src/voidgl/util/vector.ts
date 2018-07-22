const { sqrt } = Math;

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

/** This type defines any possible explicit vector */
export type IVec = IVec1 | IVec2 | IVec3 | IVec4;
/** This type defines any possible vector */
export type Vec = Vec1 | Vec2 | Vec3 | Vec4;

export function add1(left: Vec1, right: Vec1): Vec1 {
  return [left[0] + right[0]];
}

export function scale1(vec: Vec1, scale: number): Vec1 {
  return [vec[0] * scale];
}

export function subtract1(left: Vec1, right: Vec1): Vec1 {
  return [left[0] - right[0]];
}

export function multiply1(left: Vec1, right: Vec1): Vec1 {
  return [left[0] * right[0]];
}

export function dot1(left: Vec1, right: Vec1): number {
  return left[0] * right[0];
}

export function linear1(start: Vec1, end: Vec1, t: number): Vec1 {
  return scale1(add1(subtract1(end, start), start), t);
}

export function length1(start: Vec1): number {
  return sqrt(dot1(start, start));
}

export function add2(left: Vec2, right: Vec2): Vec2 {
  return [left[0] + right[0], left[1] + right[1]];
}

export function scale2(left: Vec2, scale: number): Vec2 {
  return [left[0] * scale, left[1] * scale];
}

export function subtract2(left: Vec2, right: Vec2): Vec2 {
  return [left[0] - right[0], left[1] - right[1]];
}

export function multiply2(left: Vec2, right: Vec2): Vec2 {
  return [left[0] * right[0], left[1] * right[1]];
}

export function dot2(left: Vec2, right: Vec2): number {
  return left[0] * right[0] + left[1] * right[1];
}

export function linear2(start: Vec2, end: Vec2, t: number): Vec2 {
  return scale2(add2(subtract2(end, start), start), t);
}

export function length2(start: Vec2): number {
  return sqrt(dot2(start, start));
}

export function add3(left: Vec3, right: Vec3): Vec3 {
  return [left[0] + right[0], left[1] + right[1], left[2] + right[2]];
}

export function scale3(left: Vec3, scale: number): Vec3 {
  return [left[0] * scale, left[1] * scale, left[2] * scale];
}

export function subtract3(left: Vec3, right: Vec3): Vec3 {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

export function multiply3(left: Vec3, right: Vec3): Vec3 {
  return [left[0] * right[0], left[1] * right[1], left[2] * right[2]];
}

export function linear3(start: Vec3, end: Vec3, t: number): Vec3 {
  return scale3(add3(subtract3(end, start), start), t);
}

export function length3(start: Vec3): number {
  return sqrt(dot3(start, start));
}

export function dot3(left: Vec3, right: Vec3): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

export function add4(left: Vec4, right: Vec4): Vec4 {
  return [
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2],
    left[3] + right[3]
  ];
}

export function scale4(left: Vec4, scale: number): Vec4 {
  return [left[0] * scale, left[1] * scale, left[2] * scale, left[3] * scale];
}

export function subtract4(left: Vec4, right: Vec4): Vec4 {
  return [
    left[0] - right[0],
    left[1] - right[1],
    left[2] - right[2],
    left[3] - right[3]
  ];
}

export function multiply4(left: Vec4, right: Vec4): Vec4 {
  return [
    left[0] * right[0],
    left[1] * right[1],
    left[2] * right[2],
    left[3] * right[3]
  ];
}

export function dot4(left: Vec4, right: Vec4): number {
  return (
    left[0] * right[0] +
    left[1] * right[1] +
    left[2] * right[2] +
    left[3] * right[3]
  );
}

export function linear4(start: Vec4, end: Vec4, t: number): Vec4 {
  return scale4(add4(subtract4(end, start), start), t);
}

export function length4(start: Vec4): number {
  return sqrt(dot4(start, start));
}

export type VecMethods<T extends Vec> = {
  add(left: T, right: T): T;
  scale(vec: T, scale: number): T;
  subtract(left: T, right: T): T;
  multiply(left: T, right: T): T;
  dot(left: T, right: T): number;
  linear(start: T, end: T, t: number): T;
  length(vec: T): number;
};

export const vec1Methods: VecMethods<Vec1> = {
  add: add1,
  dot: dot1,
  length: length1,
  linear: linear1,
  multiply: multiply1,
  scale: scale1,
  subtract: subtract1
};

export const vec2Methods: VecMethods<Vec2> = {
  add: add2,
  dot: dot2,
  length: length2,
  linear: linear2,
  multiply: multiply2,
  scale: scale2,
  subtract: subtract2
};

export const vec3Methods: VecMethods<Vec3> = {
  add: add3,
  dot: dot3,
  length: length3,
  linear: linear3,
  multiply: multiply3,
  scale: scale3,
  subtract: subtract3
};

export const vec4Methods: VecMethods<Vec4> = {
  add: add4,
  dot: dot4,
  length: length4,
  linear: linear4,
  multiply: multiply4,
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
