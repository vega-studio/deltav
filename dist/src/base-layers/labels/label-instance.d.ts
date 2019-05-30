import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Size } from "../../types";
import { Vec2 } from "../../util";
import { Anchor } from "../types";
import { GlyphInstance } from "./glyph-instance";
import { TextAreaInstance } from "./text-area-instance";
export interface ILabelInstanceOptions extends IInstanceOptions {
    anchor?: Anchor;
    color: [number, number, number, number];
    depth?: number;
    fontSize?: number;
    maxWidth?: number;
    maxScale?: number;
    scale?: number;
    text: string;
    origin: Vec2;
    preload?: boolean;
    letterSpacing?: number;
    onReady?(instance: LabelInstance): void;
}
export declare class LabelInstance extends Instance {
    color: [number, number, number, number];
    depth: number;
    fontSize: number;
    maxScale: number;
    maxWidth: number;
    origin: Vec2;
    scale: number;
    text: string;
    letterSpacing: number;
    onReady?: (label: LabelInstance) => void;
    parentTextArea?: TextAreaInstance;
    preload: boolean;
    glyphs: GlyphInstance[];
    size: Size;
    truncatedText: string;
    anchor: Anchor;
    constructor(options: ILabelInstanceOptions);
    getWidth(): number;
    setAnchor(anchor: Anchor): void;
    subTextGlyphs(text: string): GlyphInstance[];
    resourceTrigger(): void;
}
