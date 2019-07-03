export interface IVec1 extends Array<number> {
    0: number;
    length: 1;
}
export interface IVec2 extends Array<number> {
    0: number;
    1: number;
    length: 2;
}
export interface IVec3 extends Array<number> {
    0: number;
    1: number;
    2: number;
    length: 3;
}
export interface IVec4 extends Array<number> {
    0: number;
    1: number;
    2: number;
    3: number;
    length: 4;
}
export declare type Vec1 = [number];
export declare type Vec2 = [number, number];
export declare type Vec3 = [number, number, number];
export declare type Vec4 = [number, number, number, number];
export declare type Vec1Compat = Vec1 | Vec2 | Vec3 | Vec4;
export declare type Vec2Compat = Vec2 | Vec3 | Vec4;
export declare type Vec3Compat = Vec3 | Vec4;
export declare type Vec4Compat = Vec4;
export declare type IVec = IVec1 | IVec2 | IVec3 | IVec4;
export declare type Vec = Vec1 | Vec2 | Vec3 | Vec4;
export declare function isVec1(val: any): val is Vec1;
export declare function isVec2(val: any): val is Vec2;
export declare function isVec3(val: any): val is Vec3;
export declare function isVec4(val: any): val is Vec4;
export declare function apply1(v: Vec1Compat | undefined, v0: number): Vec1;
export declare function add1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function ceil1(vec: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function compare1(left: Vec1Compat, right: Vec1Compat): boolean;
export declare function copy1(vec: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function cross1(_left: Vec1Compat, _right: Vec1Compat, out?: Vec1Compat): Vec1;
export declare function divide1(top: Vec1Compat, bottom: Vec1Compat, out?: Vec1Compat): Vec1;
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
export declare function vec1(values: number[] | number, ...args: (number | number[])[]): Vec1;
export declare function apply2(v: Vec2Compat | undefined, v0: number, v1: number): Vec2;
export declare function add2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function ceil2(vec: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function copy2(vec: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function cross2(_left: Vec2Compat, _right: Vec2Compat, out?: Vec2Compat): Vec2;
export declare function compare2(left: Vec2Compat, right: Vec2Compat): boolean;
export declare function divide2(top: Vec2Compat, bottom: Vec2Compat, out?: Vec2Compat): Vec2;
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
export declare function vec2(values: number[] | number, ...args: (number | number[])[]): Vec2;
export declare function apply3(v: Vec3Compat | undefined, v0: number, v1: number, v2: number): Vec3;
export declare function add3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function ceil3(vec: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function copy3(vec: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function compare3(left: Vec3Compat, right: Vec3Compat): boolean;
export declare function cross3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function divide3(top: Vec3Compat, bottom: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function flatten3(list: Vec3Compat[], out?: number[]): number[];
export declare function floor3(vec: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function inverse3(vec: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function scale3(left: Vec3Compat, scale: number, out?: Vec3Compat): Vec3;
export declare function subtract3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function multiply3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function linear3(start: Vec3Compat, end: Vec3Compat, t: number, out?: Vec3Compat): Vec3;
export declare function length3(start: Vec3Compat): number;
export declare function max3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function min3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function normalize3(left: Vec3Compat, out?: Vec3Compat): Vec3;
export declare function dot3(left: Vec3Compat, right: Vec3Compat): number;
export declare function vec3(values: number[] | number, ...args: (number | number[])[]): Vec3;
export declare function apply4(v: Vec4Compat | undefined, v0: number, v1: number, v2: number, v3: number): Vec4;
export declare function add4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4;
export declare function ceil4(vec: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function copy4(vec: Vec4, out?: Vec4Compat): Vec4;
export declare function compare4(left: Vec4Compat, right: Vec4Compat): boolean;
export declare function cross4(_left: Vec4, _right: Vec4, out?: Vec4Compat): Vec4;
export declare function divide4(top: Vec4Compat, bottom: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function flatten4(list: Vec4Compat[], out?: number[]): number[];
export declare function floor4(vec: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function inverse4(vec: Vec4, out?: Vec4Compat): Vec4;
export declare function scale4(left: Vec4, scale: number, out?: Vec4Compat): Vec4;
export declare function subtract4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4;
export declare function multiply4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4;
export declare function dot4(left: Vec4, right: Vec4): number;
export declare function linear4(start: Vec4, end: Vec4, t: number, out?: Vec4Compat): Vec4;
export declare function length4(start: Vec4): number;
export declare function max4(left: Vec4Compat, right: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function min4(left: Vec4Compat, right: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function normalize4(left: Vec4Compat, out?: Vec4Compat): Vec4;
export declare function vec4(values: number[] | number, ...args: (number | number[])[]): Vec4;
export declare type VecMethods<T extends Vec> = {
    add(left: T, right: T, out?: T): T;
    ceil(vec: T, out?: T): T;
    copy(vec: T, out?: T): T;
    compare(left: T, right: T): boolean;
    cross(left: T, right: T, out?: T): T;
    divide(top: T, bottom: T, out?: T): T;
    dot(left: T, right: T): number;
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
export declare const vec1Methods: VecMethods<Vec1>;
export declare const vec2Methods: VecMethods<Vec2>;
export declare const vec3Methods: VecMethods<Vec3>;
export declare const vec4Methods: VecMethods<Vec4>;
export declare function VecMath<T extends IVec>(vec: T): VecMethods<T>;
