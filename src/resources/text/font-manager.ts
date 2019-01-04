import { BaseResourceOptions } from "src/resources/base-resource-manager";
import { FontMap, FontMapGlyphType } from "src/resources/text/font-map";
import { IFontResourceRequest } from "src/resources/text/font-resource-manager";
import { SubTexture } from "src/resources/texture/sub-texture";
import { ResourceType } from "src/types";
import { WebGLStat } from "src/util";
import * as TinySDF from "tiny-sdf";

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
  _128 = 128
}

/**
 * The available properties of a prerendered font source
 */
export interface IPrerenderedFontSource {
  /** This is the glyph renderings in Base64 encoding */
  glyphs: { [key: string]: string };
  /** This is the glyph used when no glyph is available */
  errorGlyph: string;
}

/**
 * This is a provided pre-rendered SDF resource object format.
 */
export interface IPrerenderedSDFFontSource {
  /** This is the indicator that this prerendered resource is SDF */
  type: "SDF";
}

/**
 * This is a provided pre-rendered MSDF resource object format.
 */
export interface IPrerenderedMSDFFontSource {
  /** This is the indicator that this prerendered resource is MlSDF */
  type: "MSDF";
}

/**
 * These are the valid sources of a font from which the system will derive the glyphs and font metrics necessary
 * to render text to the screen.
 */
export type FontMapSource =
  | string
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
function isStringFontSource(val: any): val is string {
  return typeof val === "string";
}

/**
 * Type guard for any source that is pre-rendered
 */
function isPrerenderedSource(val: any): val is IPrerenderedFontSource {
  return val && val.glyphs;
}

/**
 * This is the pre-rendered SDF source type guard
 */
function isPrerenderedSDFSource(val: any): val is IPrerenderedSDFFontSource {
  return val && val.type === "SDF";
}

/**
 * This is the pre-rendered MSDF source type guard
 */
function isPrerenderedMSDFSource(val: any): val is IPrerenderedMSDFFontSource {
  return val && val.type === "MSDF";
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
   * Converts a character filter to a deduped list of single characters
   */
  private characterFilterToCharacters(filter: string): string[] {
    const characters = new Set<string>();

    for (let i = 0, iMax = filter.length; i < iMax; ++i) {
      const char = filter[i];
      characters.add(char);
    }

    return Array.from(characters.values());
  }

  /**
   * This generates a new font map object to work with. It will either be pre-rendered or dynamically
   * populated as requests are made.
   */
  async createFontMap(resourceOptions: IFontResourceOptions) {
    // This will contain all of the characters that the map initially starts with
    const characters: string[] = this.characterFilterToCharacters(
      resourceOptions.characterFilter || ""
    );
    // This is the generated font map specified by the resource options
    let fontMap: FontMap | undefined;
    // This is the source information of the font which the system will utilize to produce the map
    const fontSource = resourceOptions.fontSource;
    // This is the determined glyph type of the resource
    let glyphType: FontMapGlyphType = FontMapGlyphType.SDF;

    // We now determine what type of font source the options provide and set our font map
    // up properly for it.
    if (isStringFontSource(fontSource)) {
      glyphType = FontMapGlyphType.SDF;
    } else if (isPrerenderedSDFSource(fontSource)) {
      glyphType = FontMapGlyphType.SDF;
    } else if (isPrerenderedMSDFSource(fontSource)) {
      glyphType = FontMapGlyphType.MSDF;
    }

    // Create our new font map resource
    fontMap = new FontMap({
      key: resourceOptions.key,
      glyphType,
      isDynamic: resourceOptions.dynamic
    });

    // Apply initial characters to the fontMap
    await this.updateFontMapCharacters(fontMap, characters || []);

    // Keep the generated font map as our resource
    this.fontMaps.set(resourceOptions.key, fontMap);

    return fontMap;
  }

  /**
   * This updates a font map with requests made. After the font map is updated, the
   * requests should be populated with the appropriate sub texture information.
   */
  async updateFontMap(resourceKey: string, requests: IFontResourceRequest[]) {
    await this.updateFontMapCharacters(
      this.fontMaps.get(resourceKey),
      requests.map(req => req.character)
    );
  }

  /**
   * This updates a specified font map with a list of characters expected within it.
   */
  private async updateFontMapCharacters(
    fontMap: FontMap | undefined,
    characters: string[]
  ) {
    if (!fontMap) return;
  }

  /**
   * This generates the character texture information and subtexture information for the characters.
   */
  private async createSDFFontMapCharacters(
    source: FontMapSource,
    startCharacterIndex: number,
    glyphSize: FontGlyphRenderSize,
    characters: string[]
  ): Promise<[string, SubTexture][]> {
    // Valid start character required
    if (startCharacterIndex < 0) return [];
    // Font map width is the max width texture allowance
    const width = WebGLStat.MAX_TEXTURE_SIZE;
    // This is the number of columns the font map can have
    const columnsWide = Math.floor(width / glyphSize);
    // This is the column the character index applies to
    const column = startCharacterIndex % columnsWide;
    // This is the row the character index applies to
    const row = Math.floor(startCharacterIndex / columnsWide);

    // If a prerendered source is provided, we derive the glyphs from the provided source item
    if (isPrerenderedSource(source)) {
      const glyphImageData = this.getPrerenderedImageData(
        source,
        glyphSize,
        characters
      );
    } else if (isStringFontSource(source)) {
      // Otherwise, we generate the glyph as an SDF glyph
      const sdf: TinySDF.ITinyGenerator = new TinySDF(
        glyphSize - 6,
        6,
        8,
        0.25,
        source
      );
      sdf.generate("c");
    }

    return [];
  }

  /**
   * This renders the specified characters from a pre-rendered font source in ImageData that can be used to composite
   * a texture.
   */
  private async getPrerenderedImageData(
    source: IPrerenderedFontSource,
    glyphSize: FontGlyphRenderSize,
    characters: string[]
  ) {
    const promises: Promise<void>[] = [];

    // Loop through all of the characters to be loaded from the source
    characters.forEach(char => {
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

      // Set up the waiting mechnaisms and the resources to render our glyphs from Base64
      const image = new Image();
      let resolve: Function;
      const promise = new Promise<void>(resolver => (resolve = resolver));

      // Wait for the image to finish loading
      image.onload = function() {
        // Make our canvas context to render the glyph data to.
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return;
        // Get the aspect ratio of the glyp data being rendered
        const aspect = image.height / image.width;
        const renderWidth = aspect < 1 ? glyphSize : glyphSize * aspect;
        const renderHeight = aspect > 1 ? glyphSize : glyphSize * aspect;
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
      image.onerror = function() {
        console.warn(
          "There was an issue with loading the glyph data for character:",
          char
        );
        resolve(null);
      };

      // Begin loading the glyph data into the image
      image.src = source.glyphs[char];
      promises.push(promise);
    });

    // This will contain all of the glyph render information
    const allGlyphData = await Promise.all(promises);
  }
}

window.sdf = TinySDF;
