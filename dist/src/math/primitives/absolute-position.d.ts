import { Bounds } from "./bounds";
export declare type AbsolutePosition = {
    bottom?: number | string;
    height?: number | string;
    left?: number | string;
    right?: number | string;
    top?: number | string;
    width?: number | string;
};
export declare function getAbsolutePositionBounds<T>(item: AbsolutePosition, reference: Bounds<any>, scaleRatio: number): Bounds<T>;
