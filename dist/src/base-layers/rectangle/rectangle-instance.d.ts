import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Anchor, ScaleMode } from "../types";
export interface IRectangleInstanceOptions extends IInstanceOptions {
    anchor?: Anchor;
    depth?: number;
    height?: number;
    scaling?: ScaleMode;
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
    scaling: ScaleMode;
    width: number;
    x: number;
    y: number;
    private _anchor;
    constructor(options: IRectangleInstanceOptions);
    readonly anchor: Anchor;
    setAnchor(anchor: Anchor): void;
}
