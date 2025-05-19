import { Vec2 } from "../../../math";
import { IRectangleInstanceOptions, RectangleInstance } from "../rectangle/rectangle-instance.js";
export interface IBorderInstanceOptions extends IRectangleInstanceOptions {
    /** Sets the fontScale of textArea the border locates */
    fontScale?: number;
    /** Sets the textArea's origin where the border is in */
    textAreaOrigin?: Vec2;
    /** Set the textArea's anchor where the border is in */
    textAreaAnchor?: Vec2;
}
export declare class BorderInstance extends RectangleInstance {
    /** FontScale is used to help the scaling of border in a right amount */
    fontScale: number;
    /** TextArea's origin where the border is in */
    textAreaOrigin: Vec2;
    /** TextArea's anchor where the border is in */
    textAreaAnchor: Vec2;
    constructor(options: IBorderInstanceOptions);
}
