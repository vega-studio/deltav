import { GLSettings, WebGLStat } from "src/gl";
import { Texture, TextureOptions } from "src/gl/texture";
import { KerningPairs } from "src/resources/text/font-renderer";
import { PackNode } from "src/resources/texture/pack-node";
import { ResourceType } from "src/types";
import { Vec2 } from "src/util/vector";
import { IdentifyByKey } from "../../util/identify-by-key";
import { SubTexture } from "../texture/sub-texture";
import {
  FontManager,
  FontMapSource,
  IFontResourceOptions
} from "./font-manager";

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

    this.makeGlyphTypeTextureSettings(options.glyphType);
    this.createTexture();

    // Initialize the packing layout for the texture
    this.packing = new PackNode(
      0,
      0,
      WebGLStat.MAX_TEXTURE_SIZE,
      WebGLStat.MAX_TEXTURE_SIZE
    );
  }

  /**
   * Applies additional kerning pair information to the map.
   */
  addKerning(kerning: KerningPairs) {
    for (const left in kerning) {
      const rights = kerning[left];

      for (const right in rights) {
        const rightKerning = (this.kerning[left] = this.kerning[left] || {});
        rightKerning[right] = rights[right];
      }
    }
  }

  /**
   * Generates the texture for the font map which makes it ready for utilization and ready
   * for updates.
   */
  private createTexture() {
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
        width: WebGLStat.MAX_TEXTURE_SIZE,
        height: WebGLStat.MAX_TEXTURE_SIZE,
        buffer: null
      },
      ...textureSettings
    });
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
    for (let i = 0, iMax = text.length; i < iMax; ++i) {
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
