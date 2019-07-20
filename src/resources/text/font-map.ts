import { GLSettings, Texture, TextureOptions } from "../../gl";
import { add2, scale2, Vec2 } from "../../math/vector";
import { isWhiteSpace, ResourceType, Size, TextureSize } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";
import { PackNode } from "../texture/pack-node";
import { SubTexture } from "../texture/sub-texture";
import {
  FontManager,
  FontMapSource,
  IFontResourceOptions
} from "./font-manager";
import { FontRenderer, KerningPairs } from "./font-renderer";

const debug = require("debug")("performance");

export enum FontMapGlyphType {
  /** Straight images for each glyph */
  BITMAP,
  /** Signed distance field glyphs */
  SDF,
  /** Multichannel signed distance fields */
  MSDF
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
export type KernedLayout = {
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
export class FontMap extends IdentifyByKey implements IFontResourceOptions {
  /** Makes a CSS font string from the font properties in the map */
  get fontString() {
    return `${this.fontSource.size}px ${this.fontSource.family}`;
  }
  /**
   * A dynamic font map renders single glyphs at a time into the resource rather than preloads.
   */
  dynamic: boolean = false;
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
  glyphMap: { [char: string]: SubTexture } = {};
  /**
   * These  are the calculated kerning pairs available for this font map. If a pair does not
   * exist here, then the map may not have the character or the pair may not have been calculated
   * for the font map yet.
   */
  kerning: KerningPairs = {};
  /** This is the manager storing the Font Map */
  manager: FontManager;
  /** Tracks how the glyphs are packed into the map */
  packing: PackNode<SubTexture>;
  /** This is the calculated width of a space for the font map */
  spaceWidth: number = 0;
  /** The base texture where the font map is stored */
  texture: Texture;
  /**
   * The settings applied to the texture object itself. This is managed by the type of glyph in use.
   */
  private textureSettings: TextureOptions;
  /**
   * This finishes establishing this font map as a resource that is a IFontMapResourceOptions
   */
  type: ResourceType.FONT = ResourceType.FONT;

  constructor(options: IFontMapOptions) {
    super(options);

    this.dynamic = options.dynamic || false;
    this.fontSource = options.fontSource;

    if (options.characters) {
      options.characters.forEach(pair => {
        this.doRegisterGlyph(pair[0], pair[1]);
      });
    }

    const fontMapSize: Size = options.fontMapSize
      ? options.fontMapSize
      : [TextureSize._1024, TextureSize._1024];

    this.makeGlyphTypeTextureSettings(options.glyphType);
    this.createTexture(fontMapSize);

    // Initialize the packing layout for the texture
    this.packing = new PackNode(0, 0, fontMapSize[0], fontMapSize[1]);
    // If allowed, load the cached kerning from the system
    this.addCachedKerning();
  }

  private getKerningCacheName() {
    return `__deltav_kerning_cache_${this.fontSource.family}__`;
  }

  /**
   * Loads the stored cached kerning if it's available.
   */
  private addCachedKerning() {
    if (this.fontSource.localKerningCache) {
      const cachedKerningStr = localStorage.getItem(this.getKerningCacheName());

      if (cachedKerningStr) {
        debug("Loading cached kerning items:", this.getKerningCacheName());

        try {
          const cachedKerning = JSON.parse(cachedKerningStr);
          let totalKernsLoaded = 0;

          for (const left in cachedKerning) {
            let isValid: boolean =
              typeof left === "string" && left.length === 1;
            if (!isValid) continue;

            const rights = cachedKerning[left];
            const rightKerning = this.kerning[left] || {};
            this.kerning[left] = rightKerning;

            for (const right in rights) {
              isValid = typeof left === "string" && left.length === 1;
              if (!isValid) continue;
              rightKerning[right] = rights[right];
              totalKernsLoaded++;
            }
          }

          debug(
            "Found kerning items in the cache!",
            "Count:",
            totalKernsLoaded
          );
        } catch (err) {
          /** do nothing as the kerning info is not valid */
        }
      }
    }
  }

  /**
   * Applies additional kerning pair information to the map.
   */
  addKerning(kerning: KerningPairs) {
    let hasNew = false;

    for (const left in kerning) {
      const rights = kerning[left];
      const rightKerning = this.kerning[left] || {};
      if (!this.kerning[left]) hasNew = true;
      this.kerning[left] = rightKerning;

      for (const right in rights) {
        if (!rightKerning[right]) hasNew = true;
        rightKerning[right] = rights[right];
      }
    }

    // If new kerning pairs applied, then we should update the cache
    if (hasNew && this.fontSource.localKerningCache) {
      try {
        debug("Storing kerning info in cache...");
        const kerningCache = JSON.stringify(this.kerning);
        localStorage.setItem(this.getKerningCacheName(), kerningCache);
      } catch (err) {
        // Failures just silently fail
        debug("Could not cache kerning info");
      }
    }
  }

  /**
   * Generates the texture for the font map which makes it ready for utilization and ready
   * for updates.
   */
  private createTexture(size: Size) {
    if (this.texture) return;

    // Establish the settings to be applied to the Texture
    let textureSettings;

    if (this.textureSettings) {
      textureSettings = {
        generateMipMaps: true,
        premultiplyAlpha: true,
        ...this.textureSettings
      };
    } else {
      textureSettings = {
        generateMipMaps: true,
        premultiplyAlpha: true
      };
    }

    // Generate the texture
    this.texture = new Texture({
      data: {
        width: size[0],
        height: size[1],
        buffer: null
      },
      ...textureSettings
    });
  }

  /**
   * Free resources for this manager
   */
  destroy() {
    this.texture.dispose();
  }

  /**
   * Performs the internal glyph registration.
   */
  private doRegisterGlyph(char: string, tex: SubTexture) {
    const oneChar = char[0];

    if (!this.glyphMap[oneChar]) {
      this.glyphMap[oneChar] = tex;
    } else {
      console.warn("A Glyph is already registered with a rendering");
    }
  }

  /**
   * This returns which characters are not included in this font map.
   */
  findMissingCharacters(newCharacters: string) {
    const missing = new Set<string>();
    let allMissing: string = "";

    for (let i = 0, iMax = newCharacters.length; i < iMax; ++i) {
      const char = newCharacters[i];

      if (!this.glyphMap[char] && !missing.has(char)) {
        missing.add(char);
        allMissing += char;
      }
    }

    return allMissing;
  }

  /**
   * This retrieves the glyph texture information from the FontMap.
   */
  getGlyphTexture(char: string): SubTexture | null {
    return this.glyphMap[char[0]] || null;
  }

  /**
   * This provides the expected vector from the top left corner of the left vector
   * to the top left corner of the right vector.
   */
  getGlyphKerning(leftChar: string, rightChar: string): Vec2 {
    const right = this.kerning[leftChar];
    // If not pairs for the provided left character, just provide 0
    if (!right) return [0, 0];

    // Produce the kerning value or zero if none exists
    return right[rightChar] || [0, 0];
  }

  /**
   * This looks at the glyphs directly from a layout and provides the width of the glyphs.
   *
   * This differs from getStringWidth as the indices reference GLYPHS (not white space) while
   * the parameters on the other reference the text.
   *
   * This method is a little less intuitive but can perform faster.
   */
  getGlyphWidth(stringLayout: KernedLayout, start: number, end: number) {
    const startOffset = stringLayout.positions[start];
    const endOffset = stringLayout.positions[end];
    // The indices must be valid to work
    if (!start || !end) return 0;
    // Get the width of the final glyph
    const image = this.glyphMap[stringLayout.glyphs[end]];
    if (!image) return 0;

    // Now we can output the rendered width
    return endOffset[0] + image.pixelWidth - startOffset[0];
  }

  /**
   * This looks at a string layout and provides a layout that reflects the layout bounded
   * by a max width. This accounts for including
   */
  async getTruncatedLayout(
    layout: KernedLayout,
    truncation: string,
    maxWidth: number,
    fontSize: number,
    letterSpacing: number,
    fontRenderer: FontRenderer
  ) {
    // If the label exceeds the specified maxWidth then truncation must take places
    if (layout.size[0] > maxWidth) {
      let truncatedText = "";
      let truncationWidth = 0;

      // We'll get a rough and dirty truncation character width estimate by simply adding the width of
      // all the glyphs
      for (let i = 0, iMax = truncation.length; i < iMax; ++i) {
        truncationWidth += this.glyphMap[truncation[i]].pixelWidth;
      }

      // Now find a width of glyphs + the width of the truncation that will fit within the maxWidth
      // If the truncation width is wider than the max width, then we truncate to no text at all.
      if (truncationWidth > maxWidth) {
        return {
          fontScale: 1,
          glyphs: "",
          positions: [],
          size: [0, 0],
          text: ""
        } as KernedLayout;
      }

      // Otherwise, let's do the search for the correct glyphs to show that will fit properly.
      // We will use a simple binary search to find the appropriate length to use.
      let left = 0;
      let right = layout.positions.length;
      let cursor = 0;
      let check = 0;
      let char = "";

      while (left !== right) {
        cursor = Math.floor((right - left) / 2) + left;
        char = layout.glyphs[cursor];
        check =
          layout.positions[cursor][0] +
          this.glyphMap[char].pixelWidth +
          truncationWidth;

        if (check > maxWidth) right = cursor;
        else if (check < maxWidth) left = cursor;
        else break;

        if (Math.abs(left - right) <= 1) {
          if (check < maxWidth) break;

          while (check > maxWidth && cursor >= 0) {
            cursor--;
            check =
              layout.positions[cursor][0] +
              this.glyphMap[char].pixelWidth +
              truncationWidth;
          }

          break;
        }
      }

      // Our cursor should now be pointing to the letter that will be our truncation point
      // We must make sure with the characters specified it does fit, if not, we only render
      // the truncation glyphs
      check =
        layout.positions[cursor][0] +
        this.glyphMap[char].pixelWidth +
        truncationWidth;

      if (check < maxWidth) {
        // Loop through the text and find the glyph matching to the actual text with glyphs
        let glyphIndex = 0;
        let charIndex = 0;

        for (
          let i = 0, iMax = layout.text.length;
          i < iMax && glyphIndex <= cursor;
          ++i
        ) {
          const char = layout.text[i];

          charIndex++;
          if (!isWhiteSpace(char)) glyphIndex++;
        }

        // Make sure the last character attached to the first truncated letter has kerning info
        const lastChar = layout.text[charIndex - 1];
        let firstTruncChar;

        for (let i = 0, iMax = truncation.length; i < iMax; ++i) {
          if (!isWhiteSpace(truncation[i])) {
            firstTruncChar = truncation[i];
            break;
          }
        }

        if (
          lastChar &&
          firstTruncChar &&
          !this.kerning[lastChar][firstTruncChar]
        ) {
          const kerning = await fontRenderer.estimateKerning(
            [lastChar + firstTruncChar],
            this.fontString,
            this.fontSource.size,
            this.kerning,
            false
          );

          this.addKerning(kerning.pairs);
        }

        truncatedText = `${layout.text.substr(0, charIndex)}${truncation}`;
      } else {
        truncatedText = truncation;
      }

      // Caculate the layout of the truncated text
      return this.getStringLayout(truncatedText, fontSize, letterSpacing);
    }

    return layout;
  }

  /**
   * Get the width of a set of characters within a string layout.
   *
   * To use this, first use the getStringLayout() method to get the KernedLayout then insert
   * the the range of characters the width should be calculated for.
   *
   * [start, end)
   */
  getStringWidth(
    stringLayout: KernedLayout,
    start: number,
    end: number
  ): number;
  /**
   * Get the width of a substring from a string layout.
   *
   * To use this, first use the getStringLayout() method to get the KernedLayout then insert
   * the substring of text desired for calculating the width.
   */
  getStringWidth(stringLayout: KernedLayout, substr: string): number;
  /**
   * Calculates the width of a chunk of characters within a calculated KernedLayout.
   * To use this, first use the getStringLayout() method to get the KernedLayout then insert
   * the substring of text desired for calculating the width.
   */
  getStringWidth(
    stringLayout: KernedLayout,
    param1: string | number,
    param2?: number
  ): number {
    const text = stringLayout.text;
    let firstChar = 0;
    let lastChar = text.length;

    // String param means we look for a substring
    if (typeof param1 === "string") {
      const index = text.indexOf(param1);
      // No found sub string means the examined text does not exist
      if (index < 0) return 0;
      // Now we have the letter within the text we begin with.
      firstChar = index;
      // Last character is the first + length of sub string
      lastChar = firstChar + param1.length;
    } else {
      firstChar = param1;
    }

    // Set the explicit last character to use
    if (param2 !== undefined) {
      lastChar = param2;
    }

    // We now trim out white space from our indices to get the actual glyph indices that match our search
    let i = 0;
    const endOfFirst = Math.min(text.length, firstChar);
    const endOfLast = Math.min(text.length, lastChar);

    for (; i < endOfFirst; ++i) {
      if (isWhiteSpace(text[i])) {
        firstChar--;
        lastChar--;
      }
    }

    for (; i < endOfLast; ++i) {
      if (isWhiteSpace(text[i])) lastChar--;
    }

    // We now have the indices of the first and last glyph's position information in our text.
    // We can use these two to determine the width of the text.
    const lastGlyph = this.glyphMap[stringLayout.text[lastChar] || ""];
    if (!lastGlyph) return 0;

    return (
      (stringLayout.positions[lastChar] || [0, 0])[0] -
      (stringLayout.positions[firstChar] || [0, 0])[0] +
      lastGlyph.pixelWidth
    );
  }

  /**
   * This processes a string and lays it out by the kerning rules available to this font map.
   *
   * NOTE: This ONLY processes a SINGLE LINE!! ALL whitespace characters will be considered a single
   * space.
   */
  getStringLayout(
    text: string,
    fontSize: number,
    letterSpacing: number
  ): KernedLayout {
    // The output positions for each letter in the text
    const positions: Vec2[] = [];
    // The output of each character found that is provided a position (the string without the whitespace)
    let glyphs: string = "";
    // Calculate the scaling of the font which would be the font map's rendered glyph size
    // as a ratio to the label's desired font size.
    const fontScale = fontSize / this.fontSource.size;

    // Start with the initial glyph dimensions as the min and max y the label will have
    let minY = Number.MAX_SAFE_INTEGER;
    let maxY = 0;
    let currentWidth = 0;
    // The current offset for the current letter to be rendered properly
    let offset: Vec2 = [0, 0];
    // The amount each white space moves the text forward
    const whiteSpacing = this.spaceWidth;
    // Number of found whitespace characters since last character
    let whiteSpaceCount = 0;
    // The current character found to the left of the current one being processed
    let leftChar = "";
    // Holder for the found kerning of the character pair
    let kern: Vec2;
    // The image of the glyph that was rendered
    let image: SubTexture;

    // Loop through the text and calculate the offsets of each non-whitespace character
    for (let i = 0, iMax = text.length; i < iMax; ++i) {
      const char = text[i];

      // White space merely moves the offset forward by the amount of a space
      if (isWhiteSpace(char)) {
        whiteSpaceCount++;
        continue;
      }

      kern = [0, 0];

      if (leftChar) {
        kern = this.kerning[leftChar][char] || [0, 0];
      }

      offset = add2(add2(offset, scale2(kern, fontScale)), [
        whiteSpaceCount * whiteSpacing * fontScale +
          (i === 0 ? 0 : letterSpacing),
        0
      ]);

      // Copy the offset to our output positions for the character
      positions.push([offset[0], offset[1]]);
      glyphs += char;

      // Get the glyph rendering from the font map
      image = this.glyphMap[char];
      // Use the offset and the rendering height to determine the top and bottom of the glyph
      minY = Math.min(offset[1], minY);
      maxY = Math.max(offset[1] + image.pixelHeight * fontScale, maxY);
      // Make this processed glyph the next glyph that is 'to the left' for the next glyph
      leftChar = char;
      // Calculate the width of the label as we lay out
      currentWidth = offset[0] + image.pixelWidth * fontScale;
      // Reset the whitespace count so we can see whitespaces to next character
      whiteSpaceCount = 0;
    }

    // Now we have positioned all of our glyphs with relative kerning.
    // We can now get a width and height of the total label
    const height = maxY - minY;
    // Update the instance with the calculated width of the label
    const size: Size = [currentWidth, height];

    // Move all of the glyphs by -minY. This will effectively frame the label where the
    // top left is 0,0 relative to all of the contents of the label.
    // We also apply the calculated anchor at this time for the label
    for (let i = 0, iMax = positions.length; i < iMax; ++i) {
      offset = positions[i];
      offset[1] -= minY;
    }

    return {
      fontScale,
      glyphs,
      positions,
      size,
      text
    };
  }

  /**
   * This generates the necessary texture settings for the font map based on it's glyph type.
   */
  private makeGlyphTypeTextureSettings(type: FontMapGlyphType) {
    switch (type) {
      // Simple bitmap glyphs. Just need luminance and alpha value for the glyph
      case FontMapGlyphType.BITMAP:
        this.textureSettings = {
          magFilter: GLSettings.Texture.TextureMagFilter.Linear,
          minFilter: GLSettings.Texture.TextureMinFilter.LinearMipMapLinear,
          format: GLSettings.Texture.TexelDataType.LuminanceAlpha
        };
        break;

      // Only a single channel is needed for SDF
      case FontMapGlyphType.SDF:
        this.textureSettings = {
          magFilter: GLSettings.Texture.TextureMagFilter.Linear,
          minFilter: GLSettings.Texture.TextureMinFilter.Linear,
          format: GLSettings.Texture.TexelDataType.Luminance
        };
        break;

      // The MSDF strategy uses all RGB channels for the algorithm. Heavier data use
      // better quality results.
      case FontMapGlyphType.MSDF:
        this.textureSettings = {
          magFilter: GLSettings.Texture.TextureMagFilter.Linear,
          minFilter: GLSettings.Texture.TextureMinFilter.Linear,
          format: GLSettings.Texture.TexelDataType.RGB
        };
        break;
    }
  }

  /**
   * Registers a glyph with it's location on the map.
   */
  registerGlyph(char: string, tex: SubTexture) {
    if (this.dynamic) {
      this.doRegisterGlyph(char, tex);
    } else {
      console.warn(
        "Attempted to register a new glyph with a non-dynamic FontMap"
      );
    }
  }

  /**
   * Validates if all the kerning specified is ready for the text
   */
  supportsKerning(text: string) {
    // Loop through the characters in the text and see if all pairs of glyphs
    // have their kerning determined and calculated.
    for (let i = 1, iMax = text.length; i < iMax; ++i) {
      const char = text[i];
      const leftChar = text[i - 1];

      // If the left or the right character is not found properly, then this text is not supported
      // by the font map kerning yet.
      if (this.kerning[leftChar]) {
        if (!this.kerning[leftChar][char]) {
          return false;
        }
      } else return false;
    }

    return true;
  }
}
