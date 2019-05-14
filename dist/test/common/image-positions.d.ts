import { Bounds, Vec2, Vec4 } from "src";
export declare type ImagePosition = [Vec2, Vec4];
export declare function imagePositions(bounds: Bounds<any>, image: string): Promise<[[number, number], [number, number, number, number]][]>;
