import { GLProxy } from "./gl-proxy";
import { GLSettings } from "./gl-settings";

/**
 * This represents a texture that is loaded into the GPU.
 */
export class Texture {
  /**
   * Anisotropic filtering level. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   * https://blog.tojicode.com/2012/03/anisotropic-filtering-in-webgl.html
   */
  get anisotropy() {
    return this._anisotropy;
  }
  set anisotropy(val: Texture["_anisotropy"]) {
    this.needsSettingsUpdate = true;
    this._anisotropy = val;
  }
  private _anisotropy: number;

  /**
   * The data to apply to the GPU for the image. If no data is to be uploaded to the texture,
   * use width and height object. You would do this for render target textures such as depth textures
   * or color buffer textures where the GPU writes the initial data into the texture. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  get data() {
    return this._data;
  }
  set data(val: Texture["_data"]) {
    this.needsDataUpload = true;
    this._data = val;
  }
  private _data?:
    | TexImageSource
    | {
        width: number;
        height: number;
        buffer: ArrayBufferView | null;
      };

  /**
   * Indicates the data gets flipped vertically when uploaded to the GPU.
   */
  get flipY() {
    return this._flipY;
  }
  set flipY(val: boolean) {
    this.needsDataUpload = true;
    this._flipY = val;
  }
  private _flipY: boolean = true;

  /**
   * Source format of the input. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  get format() {
    return this._format;
  }
  set format(val: Texture["_format"]) {
    this.needsDataUpload = true;
    this._format = val;
  }
  private _format: GLSettings.Texture.TexelDataType = GLSettings.Texture
    .TexelDataType.RGBA;

  /**
   * Auto generates mipmaps. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap
   */
  get generateMipmaps() {
    return this._generateMipmaps;
  }
  set generateMipmaps(val: Texture["_generateMipmaps"]) {
    this.needsSettingsUpdate = true;
    this._generateMipmaps = val;
  }
  private _generateMipmaps: boolean = false;

  /**
   * This stores any gl state associated with this object. Modifying this object will cause the system to get out
   * of sync with the GPU; however, the values inside this object can be read and used for custom WebGL calls as needed.
   */
  gl?: {
    /** The identifier used by gl to target this texture. */
    textureId: WebGLTexture | null;
    /** The texture unit this texture is assocviated with. This is -1 if no unit is currently associated */
    textureUnit: number;
    /** This is the proxy communicator with the context that generates and destroys Textures */
    proxy: GLProxy;
  };

  /**
   * Filter used when sampling has to magnify the image see:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  get magFilter() {
    return this._magFilter;
  }
  set magFilter(val: Texture["_magFilter"]) {
    this.needsSettingsUpdate = true;
    this._magFilter = val;
  }
  private _magFilter: GLSettings.Texture.TextureMagFilter = GLSettings.Texture
    .TextureMagFilter.Linear;

  /**
   * Filter used when sampling has to shrink the image. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  get minFilter() {
    return this._minFilter;
  }
  set minFilter(val: Texture["_minFilter"]) {
    this.needsSettingsUpdate = true;
    this._minFilter = val;
  }
  private _minFilter: GLSettings.Texture.TextureMinFilter = GLSettings.Texture
    .TextureMinFilter.LinearMipMapLinear;

  /** Flag indicates if the texture object needs to have it's data modified */
  needsDataUpload: boolean = false;
  /** Flag indicates if the texture object needs it's settings modified */
  needsSettingsUpdate: boolean = false;

  /**
   * Sets the readPixels data alignment. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   * https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glPixelStorei.xml
   */
  get packAlignment() {
    return this._packAlignment;
  }
  set packAlignment(val: Texture["_packAlignment"]) {
    this.needsSettingsUpdate = true;
    this._packAlignment = val;
  }
  private _packAlignment: GLSettings.Texture.PackAlignment = GLSettings.Texture
    .PackAlignment.FOUR;

  /**
   * Tells the input packing to premultiply the alpha values with the other channels as the texture is generated. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   */
  get premultiplyAlpha() {
    return this._premultiplyAlpha;
  }
  set premultiplyAlpha(val: Texture["_premultiplyAlpha"]) {
    this.needsSettingsUpdate = true;
    this._premultiplyAlpha = val;
  }
  private _premultiplyAlpha: boolean = false;

  /**
   * The source pixel data type.
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  get type() {
    return this._type;
  }
  set type(val: Texture["_type"]) {
    this.needsDataUpload = true;
    this._type = val;
  }
  private _type = GLSettings.Texture.SourcePixelFormat.UnsignedByte;

  /**
   * Sets the data alignment for packing the pixels. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   * https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glPixelStorei.xml
   */
  get unpackAlignment() {
    return this._unpackAlignment;
  }
  set unpackAlignment(val: Texture["_unpackAlignment"]) {
    this.needsSettingsUpdate = true;
    this._unpackAlignment = val;
  }
  private _unpackAlignment: GLSettings.Texture.UnpackAlignment = GLSettings
    .Texture.UnpackAlignment.FOUR;

  /**
   * Specifies sample wrapping for when samples fall outside the 0 - 1 range See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  get wrapHorizontal() {
    return this._wrapHorizontal;
  }
  set wrapHorizontal(val: Texture["_wrapHorizontal"]) {
    this.needsSettingsUpdate = true;
    this._wrapHorizontal = val;
  }
  private _wrapHorizontal: GLSettings.Texture.Wrapping = GLSettings.Texture
    .Wrapping.CLAMP_TO_EDGE;

  /**
   * Specifies sample wrapping for when samples fall outside the 0 - 1 range. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  get wrapVertical() {
    return this._wrapVertical;
  }
  set wrapVertical(val: Texture["_wrapVertical"]) {
    this.needsSettingsUpdate = true;
    this._wrapVertical = val;
  }
  private _wrapVertical: GLSettings.Texture.Wrapping = GLSettings.Texture
    .Wrapping.CLAMP_TO_EDGE;

  constructor(options: Partial<Texture>) {
    Object.assign(this, options);
  }

  /**
   * Frees resources associated with this texture
   */
  dispose() {
    // Clear the gl context
    if (this.gl) {
      this.gl.proxy.disposeTexture(this);
    }

    // Ensure the large data object for the texture is cleared
    delete this._data;
  }
}