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
export declare const V3R: Vec3[];
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
export declare const V4R: Vec4[];
export declare function isVec1(val: any): val is Vec1;
export declare function isVec2(val: any): val is Vec2;
export declare function isVec3(val: any): val is Vec3;
export declare function isVec4(val: any): val is Vec4;
export declare function apply1(v: Vec1Compat | undefined, v0: number): Vec1;
export declare function add1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function ceil1(vec: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function compare1(left: Vec1Compat, right: Vec1Compat): boolean;
export declare function fuzzyCompare1(left: Vec1Compat, right: Vec1Compat, epsilon: number): boolean;
export declare function copy1(vec: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function forward1(): Vec1;
/**
 * Cross product of 1 dimensional vectors could be easiest to visualize as two
 * parallel or anti-parallel vectors that are in the 2D plane. This would result in a vector that is of zero magnitude
 * going into the Z direction. Or essentially [0, 0, 0]. Thus for consistency of <vec method><vec component length>()
 * We will take the one dimension inference of this result and provide [0]
 */
export declare function cross1(_left: Vec1Compat, _right: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function divide1(top: Vec1Compat, bottom: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function empty1(out?: Vec1): Vec1;
export declare function flatten1(list: Vec1Compat[], out?: number[]): number[];
export declare function floor1(vec: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function inverse1(vec: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function scale1(vec: Vec1Compat, scale: number, out?: Vec1Compat): Vec1;
export declare function subtract1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function max1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function min1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function multiply1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function normalize1(_left: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function dot1(left: Vec1Compat, right: Vec1Compat): number;
export declare function linear1(start: Vec1Compat, end: Vec1Compat, t: number, out?: Vec1Compat): Vec1;
export declare function length1(start: Vec1Compat): number;
export declare function length1Components(x: number): number;
export declare function vec1(values: number[] | number, ...args: (number | number[])[]): Vec1;
export declare function apply2(v: Vec2Compat | undefined, v0: number, v1: number): Vec2;
export declare function add2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function ceil2(vec: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function copy2(vec: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function forward2(out?: Vec2Compat): Vec2;
/**
 * Cross product of a 2D vector would result in [0, 0, <magnitude>] within the 2D plane. In keeping with the format of
 * vector methods in this document <method name><vector component length>() we return only the 2D result of the product
 * [0, 0].
 * In order to get the results of the actual 2D vectors in a 3D world, you must use cross3() to retrieve the Z result.
 */
export declare function cross2(_left: Vec2Compat, _right: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function compare2(left: Vec2Compat, right: Vec2Compat): boolean;
export declare function fuzzyCompare2(left: Vec2Compat, right: Vec2Compat, epsilon: number): boolean;
export declare function divide2(top: Vec2Compat, bottom: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function empty2(out?: Vec2): Vec2;
export declare function flatten2(list: Vec2Compat[], out?: number[]): number[];
export declare function floor2(vec: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function inverse2(vec: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function max2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function min2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function scale2(left: Vec2Compat, scale: number, out?: Vec2Compat): Vec2;
export declare function subtract2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function multiply2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function normalize2(left: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function dot2(left: Vec2Compat, right: Vec2Compat): number;
export declare function linear2(start: Vec2Compat, end: Vec2Compat, t: number, out?: Vec2Compat): Vec2;
export declare function length2(start: Vec2Compat): number;
export declare function length2Components(x: number, y: number): number;
export declare function vec2(values: number[] | number, ...args: (number | number[])[]): Vec2;
export declare function apply3(v: Vec3Compat | undefined, v0: number, v1: number, v2: number): Vec3;
export declare function add3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function ceil3(vec: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function copy3(vec: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function compare3(left: Vec3Compat, right: Vec3Compat): boolean;
export declare function fuzzyCompare3(left: Vec3Compat, right: Vec3Compat, epsilon: number): boolean;
export declare function forward3(out?: Vec3Compat): Vec3;
export declare function cross3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function divide3(top: Vec3Compat, bottom: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function empty3(out?: Vec3): Vec3;
export declare function flatten3(list: Vec3Compat[], out?: number[]): number[];
export declare function floor3(vec: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function inverse3(vec: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function scale3(left: Vec3Compat, scale: number, out?: Vec3Compat): Vec3;
export declare function subtract3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function multiply3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function linear3(start: Vec3Compat, end: Vec3Compat, t: number, out?: Vec3Compat): Vec3;
export declare function length3(start: Vec3Compat): number;
export declare function length3Components(x: number, y: number, z: number): number;
export declare function max3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function min3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function normalize3(left: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function dot3(left: Vec3Compat, right: Vec3Compat): number;
export declare function vec3(values: number[] | number, ...args: (number | number[])[]): Vec3;
/**
 * Produces a directional vector that is straight up from the provided reference vectors (90 degress elevated from
 * the forward vector)
 */
export declare function up3(forward: Vec3Compat, up: Vec3Compat, out?: Vec3Compat): Vec3;
/**
 * Produces a directional vector that is directly to the right of the reference vectors (90 degress rotated from the
 * forrward vector)
 */
export declare function right3(forward: Vec3Compat, up: Vec3Compat, out?: Vec3Compat): Vec3;
/**
 * Produces a directional vector that is directly to the left of the reference vectors (90 degress rotated from the
 * forrward vector)
 */
export declare function left3(forward: Vec3Compat, up: Vec3Compat, out?: Vec3Compat): Vec3;
/**
 * Produces a directional vector that is straight down from the provided reference vectors (90 degress declined from
 * the forward vector)
 */
export declare function down3(forward: Vec3Compat, up: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function apply4(v: Vec4Compat | undefined, v0: number, v1: number, v2: number, v3: number): Vec4;
export declare function add4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4;
export declare function add4by3(left: Vec4, right: Vec3Compat, out?: Vec4Compat): Vec4;
export declare function ceil4(vec: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function copy4(vec: Vec4, out?: Vec4Compat): Vec4;
export declare function compare4(left: Vec4Compat, right: Vec4Compat): boolean;
export declare function fuzzyCompare4(left: Vec4Compat, right: Vec4Compat, epsilon: number): boolean;
export declare function forward4(out?: Vec4Compat): Vec4;
/**
 * 4D cross product? Lots of issues here. If you need a proper cross product for 3D, please use cross3. What
 * this method should do is up for debate for now and will return a unit 4D vector.
 */
export declare function cross4(_left: Vec4, _right: Vec4, out?: Vec4Compat): Vec4;
export declare function divide4(top: Vec4Compat, bottom: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function empty4(out?: Vec4): Vec4;
export declare function flatten4(list: Vec4Compat[], out?: number[]): number[];
export declare function floor4(vec: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function inverse4(vec: Vec4, out?: Vec4Compat): Vec4;
export declare function scale4(left: Vec4, scale: number, out?: Vec4Compat): Vec4;
export declare function subtract4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4;
export declare function multiply4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4;
export declare function dot4(left: Vec4, right: Vec4): number;
export declare function linear4(start: Vec4, end: Vec4, t: number, out?: Vec4Compat): Vec4;
export declare function length4(start: Vec4): number;
export declare function length4Components(x: number, y: number, z: number, w: number): number;
export declare function max4(left: Vec4Compat, right: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function min4(left: Vec4Compat, right: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function normalize4(left: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function vec4(values: number[] | number, ...args: (number | number[])[]): Vec4;
export declare function color4FromHex3(hex: number, out?: Vec4): Vec4;
export declare function color4FromHex4(hex: number, out?: Vec4): Vec4;
export declare function slerpQuat(from: Vec4, to: Vec4, t: number, out?: Vec4): Vec4;
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
export declare const vec1Methods: VecMethods<Vec1>;
export declare const vec2Methods: VecMethods<Vec2>;
export declare const vec3Methods: VecMethods<Vec3>;
export declare const vec4Methods: VecMethods<Vec4>;
export declare function VecMath<T extends IVec>(vec: T): VecMethods<T>;
export declare function toString1(v: Vec1Compat): string;
export declare function toString2(v: Vec2Compat): string;
export declare function toString3(v: Vec3Compat): string;
export declare function toString4(v: Vec4Compat): string;
