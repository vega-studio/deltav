import { Texture } from "../../gl";
import { Vec2 } from "../../math/vector";
import { ResourceType, Size } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";
import { PackNode } from "../texture/pack-node";
import { SubTexture } from "../texture/sub-texture";
import { FontManager, FontMapSource, IFontResourceOptions } from "./font-manager";
import { FontRenderer, KerningPairs } from "./font-renderer";
export declare enum FontMapGlyphType {
    /** Straight images for each glyph */
    BITMAP = 0,
    /** Signed distance field glyphs */
    SDF = 1,
    /** Multichannel signed distance fields */
    MSDF = 2
}
export interface IFontMapOptions extends IFontResourceOptions {
    /**
     * This is the initial characters registered with this font map. If this is not Dynamic,
     * these are the only characters this map can provide.
     */
    characters?: [string, SubTexture][];
    /**
     * This is the glyph type for the font.
     */
    glyphType: FontMapGlyphType;
}
/**
 * This describes a string's individual letter offsets when properly kerned relative to each other.
 */
export declare type KernedLayout = {
    /** The scaling of the font relative to the desired font size vs the rendered size of the font on the font map */
    fontScale: number;
    /** This is the glyphs given positions. This is essentially the text minus the whitespace. */
    glyphs: string;
    /**
     * This provides the kerning of each letter. The order of the positions provided is in
     * the order the letters appear in the text measured. This is all relative to placing the
     * top left of the rendering at [0, 0]
     */
    positions: Vec2[];
    /** The width and height of the entire rendered string */
    size: Size;
    /** The text used in calculating this layout */
    text: string;
};
/**
 * This represents the actual font map resource. It contains the raw texture object for manipulating.
 */
export declare class FontMap extends IdentifyByKey implements IFontResourceOptions {
    /** Makes a CSS font string from the font properties in the map */
    get fontString(): string;
    /**
     * A dynamic font map renders single glyphs at a time into the resource rather than preloads.
     */
    dynamic: boolean;
    /** The metrics of the font rendered to this font map */
    fontSource: FontMapSource;
    /**
     * The number of glyphs successfully registered with this font map. This is used to determine the
     * position of the next glyph for the font map.
     */
    glyphCount: number;
    /**
     * This maps all of the glyphs this resource provides for to the SubTexture where the glyph is rendered
     * on the resource.
     */
    glyphMap: {
        [char: string]: SubTexture;
    };
    /**
     * These  are the calculated kerning pairs available for this font map. If a pair does not
     * exist here, then the map may not have the character or the pair may not have been calculated
     * for the font map yet.
     */
    kerning: KerningPairs;
    /** This is the manager storing the Font Map */
    manager: FontManager;
    /** Tracks how the glyphs are packed into the map */
    packing: PackNode<SubTexture>;
    /** This is the calculated width of a space for the font map */
    spaceWidth: number;
    /** The base texture where the font map is stored */
    texture: Texture;
    /**
     * The settings applied to the texture object itself. This is managed by the type of glyph in use.
     */
    private textureSettings;
    /**
     * This finishes establishing this font map as a resource that is a IFontMapResourceOptions
     */
    type: ResourceType.FONT;
    constructor(options: IFontMapOptions);
    private getKerningCacheName;
    /**
     * Loads the stored cached kerning if it's available.
     */
    private addCachedKerning;
    /**
     * Applies additional kerning pair information to the map.
     */
    addKerning(kerning: KerningPairs): void;
    /**
     * Generates the texture for the font map which makes it ready for utilization and ready
     * for updates.
     */
    private createTexture;
    /**
     * Free resources for this manager
     */
    destroy(): void;
    /**
     * Performs the internal glyph registration.
     */
    private doRegisterGlyph;
    /**
     * This returns which characters are not included in this font map.
     */
    findMissingCharacters(newCharacters: string): string;
    /**
     * This retrieves the glyph texture information from the FontMap.
     */
    getGlyphTexture(char: string): SubTexture | null;
    /**
     * This provides the expected vector from the top left corner of the left vector
     * to the top left corner of the right vector.
     */
    getGlyphKerning(leftChar: string, rightChar: string): Vec2;
    /**
     * This looks at the glyphs directly from a layout and provides the width of the glyphs.
     *
     * This differs from getStringWidth as the indices reference GLYPHS (not white space) while
     * the parameters on the other reference the text.
     *
     * This method is a little less intuitive but can perform faster.
     */
    getGlyphWidth(stringLayout: KernedLayout, start: number, end: number): number;
    /**
     * This looks at a string layout and provides a layout that reflects the layout bounded
     * by a max width. This accounts for including
     */
    getTruncatedLayout(layout: KernedLayout, truncation: string, maxWidth: number, fontSize: number, letterSpacing: number, fontRenderer: FontRenderer): Promise<KernedLayout>;
    /**
     * Get the width of a set of characters within a string layout.
     *
     * To use this, first use the getStringLayout() method to get the KernedLayout then insert
     * the the range of characters the width should be calculated for.
     *
     * [start, end)
     */
    getStringWidth(stringLayout: KernedLayout, start: number, end: number): number;
    /**
     * Get the width of a substring from a string layout.
     *
     * To use this, first use the getStringLayout() method to get the KernedLayout then insert
     * the substring of text desired for calculating the width.
     */
    getStringWidth(stringLayout: KernedLayout, substr: string): number;
    /**
     * This processes a string and lays it out by the kerning rules available to this font map.
     *
     * NOTE: This ONLY processes a SINGLE LINE!! ALL whitespace characters will be considered a single
     * space.
     */
    getStringLayout(text: string, fontSize: number, letterSpacing: number): KernedLayout;
    /**
     * This generates the necessary texture settings for the font map based on it's glyph type.
     */
    private makeGlyphTypeTextureSettings;
    /**
     * Registers a glyph with it's location on the map.
     */
    registerGlyph(char: string, tex: SubTexture): void;
    /**
     * Validates if all the kerning specified is ready for the text
     */
    supportsKerning(text: string): boolean;
}
