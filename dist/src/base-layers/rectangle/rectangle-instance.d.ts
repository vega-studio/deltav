import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Vec2 } from "../../util/vector";
import { Anchor, ScaleMode } from "../types";
export interface IRectangleInstanceOptions extends IInstanceOptions {
    anchor?: Anchor;
    depth?: number;
    scaling?: ScaleMode;
    color?: [number, number, number, number];
    position?: Vec2;
    size?: Vec2;
}
export declare class RectangleInstance extends Instance {
    color: [number, number, number, number];
    depth: number;
    maxScale: number;
    scale: number;
    scaling: ScaleMode;
    size: Vec2;
    position: Vec2;
    private _anchor;
    constructor(options: IRectangleInstanceOptions);
    readonly anchor: Anchor;
    setAnchor(anchor: Anchor): void;
}
