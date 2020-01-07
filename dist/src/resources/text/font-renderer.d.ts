import { Vec2 } from "../../math";
import { IResourceType, ResourceType } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";
declare type IGlyphRenderMetrics = {
    [key: string]: {
        glyph: ImageData;
        glyphIndex: number;
    };
};
export declare type KerningPairs = {
    [leftLetter: string]: {
        [rightLtter: string]: Vec2;
    };
};
export declare type KerningInfo = {
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
     * This function takes a sentence and grid info
     * Returns a canvas with a list of glyphs where each glyph fits cnetered within each grid cell
     */
    makeBitmapGlyphs(glyphs: string, fontString: string, fontSize: number): IGlyphRenderMetrics;
    /**
     * This performs a special rendering to guess kerning of letters of embedded fonts (fonts we don't
     * have access to their raw font files). This will provide kerning information of a letter by providing
     * the distance from a 'left' letter's top left  corner to the 'right' letter's topleft corner.
     */
    estimateKerning(str: string[], fontString: string, fontSize: number, existing: KerningPairs, includeSpace: boolean): Promise<KerningInfo>;
}
export {};
