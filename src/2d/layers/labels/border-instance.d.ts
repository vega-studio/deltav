import { Vec2 } from "../../../util";
import { IRectangleInstanceOptions, RectangleInstance } from "../rectangle/rectangle-instance";
export interface IBorderInstanceOptions extends IRectangleInstanceOptions {
    fontScale?: number;
    textAreaOrigin?: Vec2;
    textAreaAnchor?: Vec2;
}
export declare class BorderInstance extends RectangleInstance {
    fontScale: number;
    textAreaOrigin: Vec2;
    textAreaAnchor: Vec2;
    constructor(options: IBorderInstanceOptions);
}
