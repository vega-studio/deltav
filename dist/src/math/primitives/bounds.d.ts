import { Vec2 } from "../vector";
export interface IBoundsOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
}
export declare class Bounds<T> {
    x: number;
    y: number;
    width: number;
    height: number;
    d?: T;
    readonly area: number;
    readonly bottom: number;
    readonly left: number;
    readonly mid: Vec2;
    readonly right: number;
    readonly top: number;
    static emptyBounds<T>(): Bounds<T>;
    constructor(options: IBoundsOptions);
    containsPoint(point: Vec2): boolean;
    encapsulate(item: Bounds<any> | Vec2): boolean;
    encapsulateAll(all: Bounds<any>[] | Vec2[]): void;
    fits(bounds: Bounds<T>): 0 | 1 | 2;
    hitBounds(bounds: Bounds<any>): boolean;
    isInside(bounds: Bounds<any>): boolean;
    readonly location: Vec2;
    toString(): string;
}
