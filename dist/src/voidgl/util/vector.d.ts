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
export declare type IVec = IVec1 | IVec2 | IVec3 | IVec4;
export declare type Vec = Vec1 | Vec2 | Vec3 | Vec4;
export declare function add1(left: Vec1, right: Vec1): Vec1;
export declare function copy1(vec: Vec1): Vec1;
export declare function scale1(vec: Vec1, scale: number): Vec1;
export declare function subtract1(left: Vec1, right: Vec1): Vec1;
export declare function multiply1(left: Vec1, right: Vec1): Vec1;
export declare function dot1(left: Vec1, right: Vec1): number;
export declare function linear1(start: Vec1, end: Vec1, t: number): Vec1;
export declare function length1(start: Vec1): number;
export declare function add2(left: Vec2, right: Vec2): Vec2;
export declare function copy2(vec: Vec2): Vec2;
export declare function scale2(left: Vec2, scale: number): Vec2;
export declare function subtract2(left: Vec2, right: Vec2): Vec2;
export declare function multiply2(left: Vec2, right: Vec2): Vec2;
export declare function dot2(left: Vec2, right: Vec2): number;
export declare function linear2(start: Vec2, end: Vec2, t: number): Vec2;
export declare function length2(start: Vec2): number;
export declare function add3(left: Vec3, right: Vec3): Vec3;
export declare function copy3(vec: Vec3): Vec3;
export declare function scale3(left: Vec3, scale: number): Vec3;
export declare function subtract3(left: Vec3, right: Vec3): Vec3;
export declare function multiply3(left: Vec3, right: Vec3): Vec3;
export declare function linear3(start: Vec3, end: Vec3, t: number): Vec3;
export declare function length3(start: Vec3): number;
export declare function dot3(left: Vec3, right: Vec3): number;
export declare function add4(left: Vec4, right: Vec4): Vec4;
export declare function copy4(vec: Vec4): Vec4;
export declare function scale4(left: Vec4, scale: number): Vec4;
export declare function subtract4(left: Vec4, right: Vec4): Vec4;
export declare function multiply4(left: Vec4, right: Vec4): Vec4;
export declare function dot4(left: Vec4, right: Vec4): number;
export declare function linear4(start: Vec4, end: Vec4, t: number): Vec4;
export declare function length4(start: Vec4): number;
export declare type VecMethods<T extends Vec> = {
    add(left: T, right: T): T;
    copy(vec: T): T;
    scale(vec: T, scale: number): T;
    subtract(left: T, right: T): T;
    multiply(left: T, right: T): T;
    dot(left: T, right: T): number;
    linear(start: T, end: T, t: number): T;
    length(vec: T): number;
};
export declare const vec1Methods: VecMethods<Vec1>;
export declare const vec2Methods: VecMethods<Vec2>;
export declare const vec3Methods: VecMethods<Vec3>;
export declare const vec4Methods: VecMethods<Vec4>;
export declare function VecMath<T extends IVec>(vec: T): VecMethods<T>;
