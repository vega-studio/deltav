import { GlyphInstance } from "./glyph-instance";
import { LabelInstance } from "./label-instance";
export declare enum TextAlignment {
    LEFT = 0,
    RIGHT = 1,
    CENTERED = 2
}
export declare class TextAreaInstance extends LabelInstance {
    maxHeight: number;
    lineHeight: number;
    lineWrap: boolean;
    alignment: TextAlignment;
    labels: LabelInstance[];
    readonly glyphs: GlyphInstance[];
}
