import * as Three from 'three';
import { SubTexture } from '../texture/sub-texture';
import { FontManager } from './font-manager';

/**
 * This represents the actual font map resource. It contains the raw texture object for manipulating.
 */
export class FontMap {
  /**
   * A dynamic font map renders single glyphs at a time into the resource rather than preloads.
   */
  isDynamic: boolean = false;
  /**
   * This maps all of the glyphs this resource provides for to the SubTexture where the glyph is rendered
   * on the resource.
   */
  glyphMap: {[key: string]: SubTexture} = {};
  /** This is the manager storing the Font Map */
  manager: FontManager;
  /** The base texture where the font map is stored */
  texture: Three.Texture;
  /**
   * The settings applied to the texture
   */
  textureSettings: Partial<Three.Texture>;

  /**
   * Registers a glyph with it's location on the map.
   */
  registerGlyph(char: string, tex: SubTexture) {
    const oneChar = char[0];

    if (!this.glyphMap[oneChar]) {
      this.glyphMap[oneChar] = tex;
    }

    else {
      console.warn('A Glyph is already registered with a rendering');
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
