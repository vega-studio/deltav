import { BaseResourceOptions } from "src/resources/base-resource-manager";
import { FontMap } from "src/resources/text/font-map";
import { IFontResourceRequest } from "src/resources/text/font-resource-manager";
import { ResourceType } from "src/types";

/**
 * Valid glyph rendering sizes that
 */
export enum FontSDFRenderSize {
  /** NOT RECOMMENDED: You lose a lot of quality with this size. Use only if you do not need your text larger than 16 ever. */
  _16 = 16,
  /** Ideal size for simple SDF technique that trades used memory for quality */
  _32 = 32,
  /** Better quality glyphs for rendering, but suffers from resource useasge */
  _64 = 64,
  /** NOT RECOMMENDED: This is very large and will not allow for many glyphs on a single texture */
  _128 = 128
}

/**
 * Options for creating a new Font Resource.
 */
export interface IFontResourceOptions extends BaseResourceOptions {
  /** Enforce the resource to be a FONT type */
  type: ResourceType.FONT;

  /**
   * When this is set, the system will render the font at runtime utilizing canvas techniques to acquire font
   * metrics. This option can have considerable start up performance costs. It is better to have pre-rendered
   * resources utilized.
   */
  dynamic?: {
    /**
     * When this is provided ONLY these characters will be supplied by this resource.
     * This is simply a string with every character to allow. Filtering glyphs can greatly
     * speed up performance. When not provided, the system will analyze strings as they stream in
     * and will update the atlas with the needed glyphs to render the text.
     */
    characterFilter?: string;
    /** The font family desired */
    fontFamily: string;
    /** The underlying rendering size which affects how much texture space the glyphs will consume. */
    glyphBaseSize: FontSDFRenderSize;
  };
}

/**
 * Type guard for font resource options type
 */
export function isFontResource(
  val: BaseResourceOptions
): val is IFontResourceOptions {
  return val && val.type === ResourceType.FONT;
}

/**
 * This manager is responsible for handling the actual generation and updating of Font textures.
 *
 * This manager handles consuming resource options and producing an appropriate resource based on
 * either generating the SDF at run time or loading up a provided pre-rendered font resource.
 */
export class FontManager {
  /** The lookup for the font map resources by their key */
  fontMaps = new Map<string, FontMap>();

  /**
   * This generates a new font map object to work with. It will either be pre-rendered or dynamically
   * populated as requests are made.
   */
  async createFontMap(resourceOptions: IFontResourceOptions) {
    // Dynamic resources will load a blank font map as it's initial state
    if (resourceOptions.dynamic) {
      // Get the dynamic configuration for the font map
      const dynamic = resourceOptions.dynamic;
      // Create our new font map resource
      const blankFontMap = new FontMap({ key: resourceOptions.key });
      // Keep the generated font map as our resource
      this.fontMaps.set(resourceOptions.key, blankFontMap);
    }
  }

  /**
   * This updates a font map with requests made. After the font map is updated, the
   * requests should be populated with the appropriate sub texture information.
   */
  async updateFontMap(resourceKey: string, requests: IFontResourceRequest[]) {}
}
