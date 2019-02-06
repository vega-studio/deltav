import { GLSettings } from "src/gl/gl-settings";
import { Omit } from "../types";

/**
 * This represents a texture that is loaded into the GPU.
 */
export class Texture {
  /**
   * Anisotropic filtering level. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   * https://blog.tojicode.com/2012/03/anisotropic-filtering-in-webgl.html
   */
  anisotropy: number;
  /** Source format of the input. */
  format: GLSettings.Texture.SourcePixelFormat;
  /**
   * Auto generates mipmaps. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap
   */
  generateMipmaps: boolean;
  /**
   * This stores any gl state associated with this object. Modifying this object will cause the system to get out
   * of sync with the GPU; however, the values inside this object can be read and used for custom WebGL calls as needed.
   */
  gl = {

  };
  /** Filter used when sampling has to magnify the image */
  magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture.TextureMagFilter.Linear;
  /** Filter used when sampling has to shrink the image */
  minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture.TextureMinFilter.LinearMipMapLinear;
  /**
   * Sets the readPixels data alignment
   */
  packAlignment: GLSettings.Texture.PackAlignment = GLSettings.Texture.PackAlignment.FOUR;
  /**
   * Tells the input packing to premultiply the alpha values with the other channels as the texture is generated. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   */
  premultiplyAlpha: boolean;
  /**
   * In webgl 1 this must be the same as the format. In webgl 2 see:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  type: GLSettings.Texture.TexelDataType;
  /**
   * Sets the data alignment for packing the pixels
   */
  unpackAlignment: GLSettings.Texture.UnpackAlignment = GLSettings.Texture.UnpackAlignment.FOUR;

  constructor(options: Omit<Partial<Texture>, 'gl'>) {
    Object.assign(this, options);
  }
}
