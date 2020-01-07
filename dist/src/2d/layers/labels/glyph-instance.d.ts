import { IInstanceOptions, Instance } from "../../../instance-provider";
import { Vec2, Vec4 } from "../../../math/vector";
import { IFontResourceRequest } from "../../../resources";
import { Omit } from "../../../types";
import { LabelInstance } from "./label-instance";
export declare type GlyphInstanceOptions = Omit<Partial<GlyphInstance>, "resourceTrigger" | keyof Instance | "parentLabel" | "request"> & IInstanceOptions;
/**
 * Instance representing a single glyph being rendered.
 */
export declare class GlyphInstance extends Instance {
    /** Adjustment to position the glyph relative to an anchor location on an overrarching label */
    anchor: Vec2;
    /** This is the character the glyph will render. */
    character: string;
    /** The color to tint the glyph */
    color: Vec4;
    /** Z distance of the glyph */
    depth: number;
    /**
     * This is the scale of the glyph compared to the font resource's rendering. If the font resource
     * is rendered at 32px, then this needs to be 20 / 32 to render the glyph at a font size of 20.
     */
    fontScale: number;
    /** When in BOUND_MAX mode, this controls how much scaling is allowed up to the base font size */
    maxScale: number;
    /** The top left location of this glyph's offset from it's origin */
    offset: Vec2;
    /** This is the anchor point of the glyph to which the glyph scales and rotates about and is positioned */
    origin: Vec2;
    /** This is the amount of padding from the origin position to the anchor position */
    padding: Vec2;
    /** The label this glyph is associated with (may NOT be associated at all) */
    parentLabel?: LabelInstance;
    /** Fires when this instance is ready for rendering */
    onReady?: (glyph: GlyphInstance) => void;
    /** This is populated as a result of character updates */
    request: IFontResourceRequest;
    constructor(options: GlyphInstanceOptions);
    /**
     * Make a duplicate of this glyph
     */
    clone(): void;
    /**
     * This will trigger when the resource nmanager is ready to render this glyph.
     */
    resourceTrigger(): void;
}
