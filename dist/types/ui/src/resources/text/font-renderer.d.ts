/**
 * The purpose of this file is to provide a means to render glyphs to a grid and to provide
 * an approach to estimating kerning values for characters utilizing any custom embedded font
 * in a web page.
 */
import { IdentifyByKey } from "../../util/identify-by-key";
import { IResourceType, ResourceType } from "../../types";
import { Vec2 } from "../../math";
import type { IFontMapMetrics } from "./font-manager";
type IGlyphRenderMetrics = {
    [key: string]: {
        glyph: ImageData;
        glyphIndex: number;
    };
};
export type KerningPairs = {
    [leftLetter: string]: {
        [rightLtter: string]: Vec2;
    };
};
export type KerningInfo = {
    all: string[];
    pairs: KerningPairs;
    spaceWidth: number;
};
export interface IFontOptions extends IdentifyByKey, IResourceType {
    /** This resource must have it's type explcitly be set to a Font */
    type: ResourceType.FONT;
}
export declare class FontRenderer {
    /**
     * This function takes a sentence and grid info Returns a canvas with a list
     * of glyphs where each glyph fits cnetered within each grid cell
     */
    makeBitmapGlyphs(glyphs: string, fontString: string, fontSize: number): IGlyphRenderMetrics;
    /**
     * This performs a special rendering to guess kerning of letters of embedded
     * fonts (fonts we don't have access to their raw font files). This will
     * provide kerning information of a letter by providing the distance from a
     * 'left' letter's top left  corner to the 'right' letter's topleft corner.
     */
    estimateKerning(str: string[], fontString: string, fontSize: number, existing: KerningPairs, includeSpace: boolean, embed?: IFontMapMetrics["embed"]): Promise<KerningInfo>;
}
export {};
