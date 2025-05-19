import { Omit, ResourceType, Size } from "../../types.js";
import { BaseResourceOptions } from "../base-resource-manager.js";
import { FontMap, FontMapGlyphType } from "./font-map.js";
import { FontRenderer } from "./font-renderer.js";
import { IFontResourceRequest } from "./font-resource-request.js";
/**
 * Valid glyph rendering sizes that the system will use when rendering the glyphs to the font map's texture.
 */
export declare enum FontGlyphRenderSize {
    /** NOT RECOMMENDED: You lose a lot of quality with this size. Use only if you do not need your text larger than 16 ever. */
    _16 = 16,
    /** Ideal size for simple SDF technique that trades used memory for quality */
    _32 = 32,
    /** Better quality glyphs for rendering, but suffers from resource useasge */
    _64 = 64,
    /** NOT RECOMMENDED: This is very large and will not allow for many glyphs on a single texture */
    _128 = 128
}
export interface IFontMapEmbed {
    /** The font family that will be used to reference this font: "RedHatDisplay" */
    familyName: string;
    /** Define the type of font file being provided: woff ttf etc */
    fontType: string;
    /** Base64 encoded font source */
    source: string;
    /** Font weight provided: 400 or "200 400" */
    weight: `${number} ${number}` | number;
    /** Font style the source provides: normal or italic */
    style: "normal" | "italic";
}
/**
 * Metrics for a font map source specification.
 */
export interface IFontMapMetrics {
    /**
     * EXPERIMENTAL: When enabled, this allows the framework to cache the kerning pair calculations in the local storage.
     * This can greatly speed up reload times of this chart, but may come with consequences as well.
     */
    localKerningCache?: boolean;
    /** A type indicator to help identify which type of font resource is provided */
    type?: FontMapGlyphType;
    /** Size the font is rendered to the font map */
    size: number;
    /** Family of the font to be rendered to the font map */
    family: string;
    /**
     * If you pick a font that is not available to the system, you will need to
     * have the font source embedded here.
     */
    embed?: IFontMapEmbed[];
    /** Font weight of the font to be rendered to the font map */
    weight: string | number;
    /** Applies pre-computed strings to warm up kerning pairs and glyph renderings before any label is generated. */
    preload?: string;
}
export interface ISimpleFontMapMetrics extends IFontMapMetrics {
    type: undefined;
}
/**
 * Indicates a bitmap font source.
 */
export interface IBitmapFontSource extends IFontMapMetrics {
    /** This indicates a bitmap style of font rendering is required of the font. */
    type: FontMapGlyphType.BITMAP;
}
/**
 * The available properties of a prerendered font source
 */
export interface IPrerenderedFontSource extends IFontMapMetrics {
    /** This is the glyph renderings in Base64 encoding */
    glyphs: {
        [key: string]: string;
    };
    /** This is the glyph used when no glyph is available */
    errorGlyph: string;
}
/**
 * This is a provided pre-rendered SDF resource object format.
 */
export interface IPrerenderedSDFFontSource extends IPrerenderedFontSource {
    /** This is the indicator that this prerendered resource is SDF */
    type: FontMapGlyphType.SDF;
}
/**
 * This is a provided pre-rendered MSDF resource object format.
 */
export interface IPrerenderedMSDFFontSource extends IPrerenderedFontSource {
    /** This is the indicator that this prerendered resource is MlSDF */
    type: FontMapGlyphType.MSDF;
}
/**
 * These are the valid sources of a font from which the system will derive the glyphs and font metrics necessary
 * to render text to the screen.
 */
export type FontMapSource = IFontMapMetrics | IBitmapFontSource | IPrerenderedSDFFontSource | IPrerenderedMSDFFontSource;
/**
 * Options for creating a new Font Resource.
 */
export interface IFontResourceOptions extends BaseResourceOptions {
    /**
     * When this is provided ONLY these characters will be supplied by this
     * resource. This is simply a string with every character to allow. Filtering
     * glyphs can greatly speed up performance. When not provided, the system will
     * analyze strings as they stream in and will update the atlas with the needed
     * glyphs to render the text.
     */
    characterFilter?: string;
    /**
     * When this is set, the system will add glyphs to the font map from the font
     * source provided as the glyphs are needed. This performs not as well as
     * preset fonts. You can combine dynamic with characterFilter to have initial
     * glyphs be preloaded and work faster from the start. Or you can use the
     * character filter but NOT be dynamic and enforce strict character
     * allowances.
     */
    dynamic?: boolean;
    /** If the system has generated the font map for this resource, this will be
     * populated */
    fontMap?: FontMap;
    /**
     * This is the source the font information is derived from.
     *
     * A string will cause the system to use canvas rendering to attempt to best
     * calculate the font glyphs and metrics as best as possible. This is the
     * slowest possible method to render text.
     *
     * It is much better to used the pre-rendered formats.
     */
    fontSource: FontMapSource;
    /** Enforce the resource to be a FONT type */
    type: ResourceType.FONT;
    /** If provided will constrain the texture to the provided size */
    fontMapSize?: Size;
}
/**
 * Type guard for font resource options type
 */
export declare function isFontResource(val: BaseResourceOptions): val is IFontResourceOptions;
/**
 * Method for making typings and API feedback easier. Just a wrapper for building
 * an IFontResourceOptions object. Excludes the need to specify the type.
 */
export declare function createFont(options: Omit<IFontResourceOptions, "type" | "key"> & Partial<Pick<IFontResourceOptions, "key">>): IFontResourceOptions;
/**
 * This manager is responsible for handling the actual generation and updating
 * of Font textures.
 *
 * This manager handles consuming resource options and producing an appropriate
 * resource based on either generating the SDF at run time or loading up a
 * provided pre-rendered font resource.
 */
export declare class FontManager {
    /** The lookup for the font map resources by their key */
    fontMaps: Map<string, FontMap>;
    /**
     * Contains the methods needed to render glyphs and calculate kerning
     * when no precomputed resources are available.
     */
    fontRenderer: FontRenderer;
    /**
     * This takes all requests that want layout information included for a group
     * of text and populates the request with the appropriate information.
     */
    calculateMetrics(resourceKey: string, requests: IFontResourceRequest[]): Promise<void>;
    /**
     * Converts a character filter to a deduped list of single characters
     */
    private characterFilterToCharacters;
    /**
     * This generates a new font map object to work with. It will either be
     * pre-rendered or dynamically populated as requests are made.
     */
    createFontMap(resourceOptions: IFontResourceOptions): Promise<FontMap>;
    /**
     * Free all generated resources here.
     */
    destroy(): void;
    /**
     * Destroy a single font map
     */
    destroyFontMap(key: string): void;
    /**
     * This updates a font map with requests made. After the font map is updated,
     * the requests should be populated with the appropriate sub texture
     * information.
     */
    updateFontMap(resourceKey: string, requests: IFontResourceRequest[]): Promise<void>;
    /**
     * This updates the calculated kerning pairs for a given font map.
     */
    private updateKerningPairs;
    /**
     * This updates a specified font map with a list of characters expected within
     * it.
     */
    private updateFontMapCharacters;
    /**
     * TODO: We do not use this method yet as we do not have a format set for
     * prerendered fonts. Currently the system only uses the bitmap font dynamic
     * pattern.
     *
     * This renders the specified characters from a pre-rendered font source in
     * ImageData that can be used to composite a texture.
     */
    getPrerenderedImageData(source: IPrerenderedFontSource, glyphSize: FontGlyphRenderSize, characters: string[]): Promise<void[]>;
}
