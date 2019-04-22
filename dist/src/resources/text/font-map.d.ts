import { Texture } from "../../gl";
import { ResourceType, Size } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";
import { Vec2 } from "../../util/vector";
import { PackNode } from "../texture/pack-node";
import { SubTexture } from "../texture/sub-texture";
import { FontManager, FontMapSource, IFontResourceOptions } from "./font-manager";
import { FontRenderer, KerningPairs } from "./font-renderer";
export declare enum FontMapGlyphType {
    BITMAP = 0,
    SDF = 1,
    MSDF = 2
}
export interface IFontMapOptions extends IFontResourceOptions {
    characters?: [string, SubTexture][];
    glyphType: FontMapGlyphType;
}
export declare type KernedLayout = {
    fontScale: number;
    glyphs: string;
    positions: Vec2[];
    size: Size;
    text: string;
};
export declare class FontMap extends IdentifyByKey implements IFontResourceOptions {
    readonly fontString: string;
    dynamic: boolean;
    fontSource: FontMapSource;
    glyphCount: number;
    glyphMap: {
        [char: string]: SubTexture;
    };
    kerning: KerningPairs;
    manager: FontManager;
    packing: PackNode<SubTexture>;
    spaceWidth: number;
    texture: Texture;
    private textureSettings;
    type: ResourceType.FONT;
    constructor(options: IFontMapOptions);
    addKerning(kerning: KerningPairs): void;
    private createTexture;
    destroy(): void;
    private doRegisterGlyph;
    findMissingCharacters(newCharacters: string): string;
    getGlyphTexture(char: string): SubTexture | null;
    getGlyphKerning(leftChar: string, rightChar: string): Vec2;
    getGlyphWidth(stringLayout: KernedLayout, start: number, end: number): number;
    getTruncatedLayout(layout: KernedLayout, truncation: string, maxWidth: number, fontSize: number, fontRenderer: FontRenderer): Promise<KernedLayout>;
    getStringWidth(stringLayout: KernedLayout, start: number, end: number): number;
    getStringWidth(stringLayout: KernedLayout, substr: string): number;
    getStringLayout(text: string, fontSize: number): KernedLayout;
    private makeGlyphTypeTextureSettings;
    registerGlyph(char: string, tex: SubTexture): void;
    supportsKerning(text: string): boolean;
}
