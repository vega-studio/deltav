import { IResourceType, ResourceType } from "../../types";
import { Vec2 } from "../../util";
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
    type: ResourceType.FONT;
}
export declare class FontRenderer {
    makeBitmapGlyphs(glyphs: string, fontString: string, fontSize: number): IGlyphRenderMetrics;
    estimateKerning(str: string, fontString: string, fontSize: number, existing: KerningPairs, includeSpace: boolean): Promise<KerningInfo>;
}
export {};
