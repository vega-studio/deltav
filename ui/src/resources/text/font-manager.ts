import { BaseResourceOptions } from "../base-resource-manager";
import { Bounds } from "../../math/primitives";
import { FontMap, FontMapGlyphType } from "./font-map";
import { FontRenderer } from "./font-renderer";
import { fontRequest, IFontResourceRequest } from "./font-resource-request";
import { Omit, ResourceType, Size } from "../../types";
import { PackNode } from "../../resources/texture/pack-node";
import { SubTexture } from "../texture/sub-texture";

import Debug from "debug";

const debug = Debug("performance");

/**
 * Valid glyph rendering sizes that the system will use when rendering the glyphs to the font map's texture.
 */
export enum FontGlyphRenderSize {
  /** NOT RECOMMENDED: You lose a lot of quality with this size. Use only if you do not need your text larger than 16 ever. */
  _16 = 16,
  /** Ideal size for simple SDF technique that trades used memory for quality */
  _32 = 32,
  /** Better quality glyphs for rendering, but suffers from resource useasge */
  _64 = 64,
  /** NOT RECOMMENDED: This is very large and will not allow for many glyphs on a single texture */
  _128 = 128,
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
  glyphs: { [key: string]: string };
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
export type FontMapSource =
  | IFontMapMetrics
  | IBitmapFontSource
  | IPrerenderedSDFFontSource
  | IPrerenderedMSDFFontSource;

/**
 * Options for creating a new Font Resource.
 */
export interface IFontResourceOptions extends BaseResourceOptions {
  /**
   * When this is provided ONLY these characters will be supplied by this resource.
   * This is simply a string with every character to allow. Filtering glyphs can greatly
   * speed up performance. When not provided, the system will analyze strings as they stream in
   * and will update the atlas with the needed glyphs to render the text.
   */
  characterFilter?: string;
  /**
   * When this is set, the system will add glyphs to the font map from the font source provided as the glyphs
   * are needed. This performs not as well as preset fonts. You can combine dynamic with characterFilter to have
   * initial glyphs be preloaded and work faster from the start. Or you can use the character filter but NOT be dynamic
   * and enforce strict character allowances.
   */
  dynamic?: boolean;
  /** If the system has generated the font map for this resource, this will be populated */
  fontMap?: FontMap;
  /**
   * This is the source the font information is derived from.
   *
   * A string will cause the system to use canvas rendering to attempt to best calculate the font glyphs and metrics as best
   * as possible. This is the slowest possible method to render text.
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
export function isFontResource(
  val: BaseResourceOptions
): val is IFontResourceOptions {
  return val && val.type === ResourceType.FONT;
}

/**
 * This is the string font source type guard.
 */
function isSimpleFontMetrics(val: any): val is ISimpleFontMapMetrics {
  return val && val.type === undefined;
}

/**
 * Method for making typings and API feedback easier. Just a wrapper for building
 * an IFontResourceOptions object. Excludes the need to specify the type.
 */
export function createFont(
  options: Omit<IFontResourceOptions, "type" | "key"> &
    Partial<Pick<IFontResourceOptions, "key">>
): IFontResourceOptions {
  return {
    key: "",
    type: ResourceType.FONT,
    ...options,
  };
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
   * Contains the methods needed to render glyphs and calculate kerning
   * when no precomputed resources are available.
   */
  fontRenderer = new FontRenderer();

  /**
   * This takes all requests that want layout information included for a group of text
   * and populates the request with the appropriate information.
   */
  async calculateMetrics(
    resourceKey: string,
    requests: IFontResourceRequest[]
  ) {
    debug("Calculating metrics for requests");
    const fontMap = this.fontMaps.get(resourceKey);
    if (!fontMap) return;

    for (let i = 0, iMax = requests.length; i < iMax; ++i) {
      const request = requests[i];
      const metrics = request.metrics;

      // Only some requests will have metrics to be calculated
      if (metrics) {
        // Get the layout of the request
        metrics.layout = fontMap.getStringLayout(
          metrics.text,
          metrics.fontSize,
          metrics.letterSpacing
        );

        // If a max width is present, we need to calculate the truncation of the label
        if (metrics.maxWidth) {
          debug("Calculating truncation for", metrics.text, metrics.maxWidth);

          metrics.layout = await fontMap.getTruncatedLayout(
            metrics.layout,
            metrics.truncation || "",
            metrics.maxWidth,
            metrics.fontSize,
            metrics.letterSpacing,
            this.fontRenderer
          );

          // Show what the truncated text is
          metrics.truncatedText = metrics.layout.text;
        }
      }
    }
  }

  /**
   * Converts a character filter to a deduped list of single characters
   */
  private characterFilterToCharacters(filter: string): string {
    const characters = new Set<string>();
    let all = "";

    for (let i = 0, iMax = filter.length; i < iMax; ++i) {
      const char = filter[i];

      if (!characters.has(char)) {
        characters.add(char);
        all += char;
      }
    }

    return all;
  }

  /**
   * This generates a new font map object to work with. It will either be pre-rendered or dynamically
   * populated as requests are made.
   */
  async createFontMap(resourceOptions: IFontResourceOptions) {
    // This will contain all of the characters that the map initially starts with
    const characters: string = this.characterFilterToCharacters(
      resourceOptions.characterFilter || ""
    );
    // This is the source information of the font which the system will utilize to produce the map
    const fontSource = resourceOptions.fontSource;
    // This is the determined glyph type of the resource
    let glyphType: FontMapGlyphType = FontMapGlyphType.SDF;

    // We now determine what type of font source the options provide and set our font map
    // up properly for it.
    if (fontSource) {
      if (isSimpleFontMetrics(fontSource)) {
        glyphType = FontMapGlyphType.BITMAP;
      } else {
        glyphType = fontSource.type || glyphType;
      }
    }

    // This is the generated font map specified by the resource options
    // Create our new font map resource
    const fontMap = new FontMap({
      ...resourceOptions,
      glyphType,
    });

    // Apply initial characters to the fontMap
    await this.updateFontMapCharacters(characters, fontMap);
    // Keep the generated font map as our resource
    this.fontMaps.set(resourceOptions.key, fontMap);

    // Check if the font source has some preload characters needed to update the fontmap with to improve initial render
    // times of resources making requests
    if (resourceOptions.fontSource.preload) {
      this.updateFontMap(resourceOptions.key, [
        fontRequest({
          key: resourceOptions.key,
          character: "",
          kerningPairs: [resourceOptions.fontSource.preload],
          metrics: {
            fontSize: 12,
            text: resourceOptions.fontSource.preload,
            letterSpacing: 0,
          },
        }),
      ]);
    }

    return fontMap;
  }

  /**
   * Free all generated resources here.
   */
  destroy() {
    // Clears up resources
    this.fontMaps.forEach((font) => font.destroy());
  }

  /**
   * Destroy a single font map
   */
  destroyFontMap(key: string) {
    const fontMap = this.fontMaps.get(key);
    if (!fontMap) return;
    fontMap.destroy();
  }

  /**
   * This updates a font map with requests made. After the font map is updated, the
   * requests should be populated with the appropriate sub texture information.
   */
  async updateFontMap(resourceKey: string, requests: IFontResourceRequest[]) {
    const fontMap = this.fontMaps.get(resourceKey);
    if (!fontMap) return;

    let allPairs: string[] = [];
    const allCharacters = new Set<string>();

    // Aggregate all kerning and character requests and needs
    for (let i = 0, iMax = requests.length; i < iMax; ++i) {
      const req = requests[i];
      if (req.character) allCharacters.add(req.character);
      if (req.kerningPairs) allPairs = allPairs.concat(req.kerningPairs);

      // We add in truncation characters as well if provided
      if (req.metrics) {
        if (req.metrics.truncation) {
          const truncation = req.metrics.truncation.replace(/\s/g, "");
          allPairs.push(truncation);

          for (let i = 0, iMax = req.metrics.truncation.length; i < iMax; ++i) {
            allCharacters.add(truncation);
          }
        }
      }
    }

    // Kerning pairs are also candidates for being rendered to the font map
    for (let i = 0, iMax = allPairs.length; i < iMax; ++i) {
      allCharacters.add(allPairs[i]);
    }

    // Convert the characters to be rendered to a sinple string
    let uniqueCharacters = "";
    allCharacters.forEach((char) => (uniqueCharacters += char));

    // Perform the updates to the font map
    await this.updateFontMapCharacters(uniqueCharacters, fontMap);
    // Perform the updates to the kerning pairs
    await this.updateKerningPairs(allPairs, fontMap);

    // After all this is done, all the requests can be populated with the font map
    // signaling the request now has the resources to accomplish what it needs
    for (let i = 0, iMax = requests.length; i < iMax; ++i) {
      requests[i].fontMap = fontMap;
    }
  }

  /**
   * This updates the calculated kerning pairs for a given font map.
   */
  private async updateKerningPairs(pairs: string[], fontMap?: FontMap) {
    if (!fontMap) return;

    // Calculate the new kerning pair information
    const kerning = await this.fontRenderer.estimateKerning(
      pairs,
      fontMap.fontString,
      fontMap.fontSource.size,
      fontMap.kerning,
      !fontMap.spaceWidth
    );

    // Add the pairs to the font map
    fontMap.addKerning(kerning.pairs);
    // Set the calculated width of a space
    fontMap.spaceWidth = fontMap.spaceWidth || kerning.spaceWidth;
  }

  /**
   * This updates a specified font map with a list of characters expected within it.
   */
  private async updateFontMapCharacters(characters: string, fontMap?: FontMap) {
    if (!fontMap) return;
    const texture = fontMap.texture;

    // We must determine which characters are not supported by the font map first
    const toAdd = fontMap.findMissingCharacters(characters);
    // Nothing to add, then nothig to do!
    if (toAdd.length <= 0) return;

    // Get all the glyph data we need to update to the Font Map's texture
    const glyphs = this.fontRenderer.makeBitmapGlyphs(
      toAdd,
      fontMap.fontString,
      fontMap.fontSource.size
    );

    // Apply each newly rendered glyph into the font map
    for (const char in glyphs) {
      const metrics = glyphs[char];

      if (texture?.data) {
        const packBounds = new Bounds({
          x: 0,
          y: 0,
          width: metrics.glyph.width,
          height: metrics.glyph.height,
        });

        // Make the sub texture object our packing is going to associate with
        const subTexture = new SubTexture();

        // Pack the glyph information into the font map texture
        const packing = fontMap.packing.insert({
          data: subTexture,
          bounds: packBounds,
        });

        if (!packing) {
          console.warn(
            "Font map is full and could not pack in any more glyphs"
          );
          return;
        }

        // Now use the packing information to update our texture
        PackNode.applyToSubTexture(
          fontMap.packing,
          packing,
          subTexture,
          undefined,
          true
        );

        // Apply the image to the texture
        texture.update(metrics.glyph, {
          ...packing.bounds,
          y:
            fontMap.packing.bounds.height -
            packing.bounds.y -
            packing.bounds.height,
        });

        // Register the glyph with the font map
        if (subTexture) fontMap.registerGlyph(char, subTexture);
        else {
          console.warn(
            "Could not generate a subtexture for the font map registration."
          );
        }
      } else {
        console.warn(
          "Can not update font map as the maps texture data is not defined."
        );
      }
    }
  }

  /**
   * TODO:
   * We do not use this method yet as we do not have a format set for prerendered fonts.
   * Currently the system only uses the bitmap font dynamic pattern.
   *
   * This renders the specified characters from a pre-rendered font source in ImageData that can be used to composite
   * a texture.
   */
  async getPrerenderedImageData(
    source: IPrerenderedFontSource,
    glyphSize: FontGlyphRenderSize,
    characters: string[]
  ) {
    const promises: Promise<void>[] = [];

    // Loop through all of the characters to be loaded from the source
    characters.forEach((char) => {
      let glyphData = source.glyphs[char];

      // Make sure the character exists, if not, use the error glyph provided by the source
      if (!glyphData) {
        glyphData = source.errorGlyph;
      }

      // A valid error glyph MUST be present
      if (!source.errorGlyph) {
        console.warn(
          "The prerendered source provided did NOT provide a proper glyph for rendering when a glyph could not be located."
        );
        return [];
      }

      // Set up the waiting mechanisms and the resources to render our glyphs from Base64
      const image = new Image();
      let resolve: Function;
      const promise = new Promise<void>((resolver) => (resolve = resolver));

      // Wait for the image to finish loading
      image.onload = function () {
        // Make our canvas context to render the glyph data to.
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return;
        // Our canvas to render to will be the specified glyphSize block
        canvas.width = glyphSize;
        canvas.height = glyphSize;
        // We want to draw the glyph the size of the desired glyph rendering
        context.drawImage(image, 0, 0, glyphSize, glyphSize);
        // Retreieve the data rendered to the canvas as our glyph data
        const glyphData = context.getImageData(0, 0, glyphSize, glyphSize);
        // Resolve with the rendered portion
        resolve(glyphData);
      };

      // If an error occurrs
      image.onerror = function () {
        console.warn(
          "There was an issue with loading the glyph data for character:",
          char
        );
        resolve(null);
      };

      // Begin loading the glyph data into the image
      image.src = source.glyphs[char];
      promises.push(promise);

      return [];
    });

    // This will contain all of the glyph render information
    return await Promise.all(promises);
  }
}
