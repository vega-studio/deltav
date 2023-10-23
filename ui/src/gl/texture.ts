import { Omit } from "../types";
import { uid } from "../util/uid";
import { GLProxy } from "./gl-proxy";
import { GLSettings } from "./gl-settings";

/**
 * This is the options to apply to a texture
 */
export type TextureOptions = Omit<
  Partial<Texture>,
  "destroy" | "update" | "updateRegions"
>;

/**
 * This represents a texture that is loaded into the GPU.
 */
export class Texture {
  /**
   * Empty texture object to help resolve ambiguous texture values.
   */
  static get emptyTexture() {
    return emptyTexture;
  }

  /** Unique identifier of the texture to aid in debugging and referencing */
  get uid() {
    return this._uid;
  }
  private _uid: number = uid();

  /**
   * Indicates this Texture has been disposed, meaning it is useless and invalid
   * to use within the application.
   */
  public get destroyed(): boolean {
    return this._destroyed;
  }
  private _destroyed: boolean = false;

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
  private _anisotropy?: number;

  /**
   * The data to apply to the GPU for the image. If no data is to be uploaded to
   * the texture, use width and height object. You would do this for render
   * target textures such as depth textures or color buffer textures where the
   * GPU writes the initial data into the texture. See:
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
    | ImageBitmap
    | ImageData
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement
    | OffscreenCanvas
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
  private _flipY: boolean = false;

  /**
   * Source format of the input data. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  get format() {
    return this._format;
  }
  set format(val: Texture["_format"]) {
    this.needsDataUpload = true;
    this._format = val;
  }
  private _format: GLSettings.Texture.TexelDataType =
    GLSettings.Texture.TexelDataType.RGBA;

  /**
   * Auto generates mipmaps. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap
   */
  get generateMipMaps() {
    return this._generateMipmaps;
  }
  set generateMipMaps(val: Texture["_generateMipmaps"]) {
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
   * Source format of the input data. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  get internalFormat() {
    return this._internalFormat;
  }
  set internalFormat(val: Texture["_internalFormat"]) {
    this.needsDataUpload = true;
    this._internalFormat = val;
  }
  private _internalFormat: GLSettings.Texture.TexelDataType =
    GLSettings.Texture.TexelDataType.RGBA;

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
  private _magFilter: GLSettings.Texture.TextureMagFilter =
    GLSettings.Texture.TextureMagFilter.Linear;

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
  private _minFilter: GLSettings.Texture.TextureMinFilter =
    GLSettings.Texture.TextureMinFilter.LinearMipMapLinear;

  /** Flag indicates if the texture object needs to have it's data modified */
  needsDataUpload: boolean = false;
  /** Flag indicates if the texture object has sub texture updates needed to be applied to it */
  needsPartialDataUpload: boolean = false;
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
  private _packAlignment: GLSettings.Texture.PackAlignment =
    GLSettings.Texture.PackAlignment.FOUR;

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
  private _unpackAlignment: GLSettings.Texture.UnpackAlignment =
    GLSettings.Texture.UnpackAlignment.FOUR;

  /**
   * These are the regions that have been requested to be applied to the Texture along
   * with the data that should be buffered into that region.
   */
  get updateRegions() {
    return this._updateRegions;
  }
  private _updateRegions: [
    Texture["data"],
    { x: number; y: number; width: number; height: number },
  ][] = [];

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
  private _wrapHorizontal: GLSettings.Texture.Wrapping =
    GLSettings.Texture.Wrapping.CLAMP_TO_EDGE;

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
  private _wrapVertical: GLSettings.Texture.Wrapping =
    GLSettings.Texture.Wrapping.CLAMP_TO_EDGE;

  /**
   * This checks if any formatting of this texture makes it a half float texture
   * or not.
   */
  get isHalfFloatTexture() {
    switch (this._internalFormat) {
      case GLSettings.Texture.TexelDataType.R16F:
      case GLSettings.Texture.TexelDataType.RG16F:
      case GLSettings.Texture.TexelDataType.RGB16F:
        return true;
    }

    switch (this._type) {
      case GLSettings.Texture.SourcePixelFormat.HalfFloat:
        return true;
    }

    return false;
  }

  /**
   * This checks if any formatting of this texture makes it a float texture
   * or not.
   */
  get isFloatTexture() {
    switch (this._internalFormat) {
      case GLSettings.Texture.TexelDataType.R11F_G11F_B10F:
      case GLSettings.Texture.TexelDataType.R16F:
      case GLSettings.Texture.TexelDataType.RG16F:
      case GLSettings.Texture.TexelDataType.R32F:
      case GLSettings.Texture.TexelDataType.RG32F:
      case GLSettings.Texture.TexelDataType.RGB16F:
      case GLSettings.Texture.TexelDataType.RGB32F:
        return true;
    }

    switch (this._type) {
      case GLSettings.Texture.SourcePixelFormat.Float:
      case GLSettings.Texture.SourcePixelFormat.HalfFloat:
        return true;
    }

    return false;
  }

  constructor(options: TextureOptions) {
    this.anisotropy = options.anisotropy || this.anisotropy;
    this.data = options.data || this.data;
    this.flipY = options.flipY || this.flipY;
    this.format = options.format || this.format;
    this.internalFormat = options.internalFormat || this.format;
    this.generateMipMaps = options.generateMipMaps || this.generateMipMaps;
    this.magFilter = options.magFilter || this.magFilter;
    this.minFilter = options.minFilter || this.minFilter;
    this.packAlignment = options.packAlignment || this.packAlignment;
    this.premultiplyAlpha = options.premultiplyAlpha || this.premultiplyAlpha;
    this.type = options.type || this.type;
    this.unpackAlignment = options.unpackAlignment || this.unpackAlignment;
    this.wrapHorizontal = options.wrapHorizontal || this.wrapHorizontal;
    this.wrapVertical = options.wrapVertical || this.wrapVertical;
  }

  /**
   * Frees resources associated with this texture.
   */
  destroy() {
    // Clear the gl context
    if (this.gl) {
      this.gl.proxy.disposeTexture(this);
    }

    // Flag this texture as no longer useable.
    this._destroyed = true;
    // Ensure the large data object for the texture is cleared
    delete this._data;
  }

  /**
   * Clears all update flags and clears out requested updates to the texture object.
   *
   * NOTE: Calling this does not perform any actions, but instead prevents actions from
   * being taken again. The system uses this to clear up any changes requested for the texture
   * after the texture has been updated with the GPU.
   */
  resolve() {
    this.needsDataUpload = false;
    this.needsPartialDataUpload = false;
    this.needsSettingsUpdate = false;
    this._updateRegions = [];
  }

  /**
   * This updates a portion of the texture object.
   */
  update(
    data: Texture["data"],
    region: { x: number; y: number; width: number; height: number }
  ) {
    this.needsPartialDataUpload = true;
    this._updateRegions.push([data, region]);
  }
}

/** Empty texture that will default to the zero texture and unit */
const emptyTexture = new Texture({
  data: {
    width: 2,
    height: 2,
    buffer: new Uint8Array(16),
  },
});
