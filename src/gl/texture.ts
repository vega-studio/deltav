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
  /**
   * The data to apply to the GPU for the image. If no data is to be uploaded to the texture
   * exclude this. You would do this for render target textures such as depth textures or color buffer
   * textures where the GPU writes the initial data into the texture. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  data?: HTMLImageElement | HTMLCanvasElement | ImageData | ImageBitmap;
  /**
   * Source format of the input. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
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
  gl?: {
    /** The identifier used by gl to target this texture. */
    textureId: WebGLTexture,
    /** The texture unit this texture */
    textureUnit: -1,
  };
  /**
   * Filter used when sampling has to magnify the image see:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture.TextureMagFilter.Linear;
  /**
   * Filter used when sampling has to shrink the image. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture.TextureMinFilter.LinearMipMapLinear;
  /**
   * Sets the readPixels data alignment. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   * https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glPixelStorei.xml
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
   * Sets the data alignment for packing the pixels. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   * https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glPixelStorei.xml
   */
  unpackAlignment: GLSettings.Texture.UnpackAlignment = GLSettings.Texture.UnpackAlignment.FOUR;

  constructor(options: Omit<Partial<Texture>, 'gl'>) {
    Object.assign(this, options);
  }
}
