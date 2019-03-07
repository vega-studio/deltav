import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Anchor, ScaleType } from "../types";
export interface IRectangleInstanceOptions extends IInstanceOptions {
    anchor?: Anchor;
    depth?: number;
    height?: number;
    scaling?: ScaleType;
    color: [number, number, number, number];
    width?: number;
    x?: number;
    y?: number;
}
export declare class RectangleInstance extends Instance {
    color: [number, number, number, number];
    depth: number;
    height: number;
    maxScale: number;
    scale: number;
    scaling: ScaleType;
    width: number;
    x: number;
    y: number;
    private _anchor;
    constructor(options: IRectangleInstanceOptions);
    readonly anchor: Anchor;
    setAnchor(anchor: Anchor): void;
}
