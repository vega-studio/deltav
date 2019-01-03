import * as Three from "three";
import {
  IdentifyByKey,
  IdentifyByKeyOptions
} from "../../util/identify-by-key";
import { SubTexture } from "../texture/sub-texture";
import { FontManager } from "./font-manager";

export enum FontMapGlyphType {
  /** Signed distance field glyphs */
  SDF,
  /** Multichannel signed distance fields */
  MSDF
}

export interface IFontMapOptions extends IdentifyByKeyOptions {
  /**
   * This is the initial characters registered with this font map. If this is not Dynamic,
   * these are the only characters this map can provide.
   */
  characters?: [string, SubTexture][];
  /** When set to true, this let's the font map add characters over time instead of a predefined list */
  isDynamic?: boolean;
  /**
   * This is the glyph type for the font.
   */
  glyphType: FontMapGlyphType;
}

/**
 * This represents the actual font map resource. It contains the raw texture object for manipulating.
 */
export class FontMap extends IdentifyByKey {
  /**
   * The number of glyphs successfully registered with this font map. This is used to determine the
   * position of the next glyph for the font map.
   */
  glyphCount: number;
  /**
   * This maps all of the glyphs this resource provides for to the SubTexture where the glyph is rendered
   * on the resource.
   */
  glyphMap: { [key: string]: SubTexture } = {};
  /**
   * A dynamic font map renders single glyphs at a time into the resource rather than preloads.
   */
  isDynamic: boolean = false;
  /** This is the manager storing the Font Map */
  manager: FontManager;
  /** The base texture where the font map is stored */
  texture: Three.Texture;
  /**
   * The settings applied to the texture object itself. This is managed by the type of glyph in use.
   */
  private textureSettings: Partial<Three.Texture>;

  constructor(options: IFontMapOptions) {
    super(options);

    this.isDynamic = options.isDynamic || false;

    if (options.characters) {
      options.characters.forEach(pair => {
        this.doRegisterGlyph(pair[0], pair[1]);
      });
    }

    this.makeGlyphTypeTextureSettings(options.glyphType);
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
   * This retrieves the glyph texture information from the FontMap's
   */
  getGlyphTexture(char: string): SubTexture | null {
    return this.glyphMap[char[0]] || null;
  }

  /**
   * This generates the necessary texture settings for the font map based on it's glyph type.
   */
  private makeGlyphTypeTextureSettings(type: FontMapGlyphType) {
    switch (type) {
      // Only a single channel is needed for SDF
      case FontMapGlyphType.SDF:
        this.textureSettings = {
          magFilter: Three.LinearFilter,
          minFilter: Three.LinearFilter,
          format: Three.LuminanceFormat
        } as Partial<Three.Texture>;
        break;

      // The MSDF strategy uses all RGB channels for the algorithm. Heavier data use
      // better quality results.
      case FontMapGlyphType.MSDF:
        this.textureSettings = {
          magFilter: Three.LinearFilter,
          minFilter: Three.LinearFilter,
          format: Three.RGBFormat
        } as Partial<Three.Texture>;
        break;
    }
  }

  /**
   * Registers a glyph with it's location on the map.
   */
  registerGlyph(char: string, tex: SubTexture) {
    if (this.isDynamic) {
      this.doRegisterGlyph(char, tex);
    } else {
      console.warn(
        "Attempted to register a new glyph with a non-dynamic FontMap"
      );
    }
  }

  /**
   * TODO:
   * This performs the currently best known way to update a texture.
   *
   * This is the current best attempt at updating the atlas which is junk as it destroys the old texture
   * And makes a new one. We REALLY should be just subTexture2D updating the texture, but Three makes that really
   * Difficult
   */
  updateTexture(canvas?: HTMLCanvasElement) {
    if (this.texture) {
      const redoneCanvas: HTMLCanvasElement = this.texture.image;
      this.texture.dispose();
      this.texture = new Three.Texture(redoneCanvas);
    } else {
      this.texture = new Three.Texture(canvas);
    }

    const subTextures = Object.values(this.glyphMap);
    subTextures.forEach(tex => {
      if (tex) {
        tex.atlasTexture = this.texture;
      }
    });

    // Apply any relevant options to the texture desired to be set
    this.texture.generateMipmaps = true;
    this.texture.premultiplyAlpha = true;
    this.textureSettings && Object.assign(this.texture, this.textureSettings);
    this.texture.needsUpdate = true;
  }
}
