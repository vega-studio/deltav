import { IPoint } from "./point";
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
export declare class Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
    readonly area: number;
    readonly bottom: number;
    readonly left: number;
    readonly mid: {
        x: number;
        y: number;
    };
    readonly right: number;
    readonly top: number;
    static emptyBounds(): Bounds;
    constructor(options: IBoundsOptions);
    containsPoint(point: IPoint): boolean;
    encapsulate(item: Bounds | IPoint): boolean;
    fits(bounds: Bounds): 0 | 1 | 2;
    hitBounds(bounds: Bounds): boolean;
    isInside(bounds: Bounds): boolean;
    toString(): string;
}
