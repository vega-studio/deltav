import { Vec2 } from "../math";
import { uid } from "../util/uid.js";
import { GLProxy } from "./gl-proxy.js";
import { GLSettings } from "./gl-settings.js";
import { WebGLStat } from "./webgl-stat.js";

/**
 * This is the options to apply to a texture
 */
export type ColorBufferOptions = Omit<Partial<ColorBuffer>, "destroy">;

/**
 * This is a buffer that is essentially the same as a Texture resource; however,
 * is different in that it can not be used as a texture in render processes. In
 * some rare cases, this is a faster render target on some hardware than others.
 */
export class ColorBuffer {
  /**
   * A unique identifier of this object.
   */
  get uid() {
    return this._uid;
  }
  private _uid = uid();
  /**
   * Indicates this ColorBuffer has been destroyed, meaning it is useless and
   * invalid to use within the application.
   */
  public get destroyed(): boolean {
    return this._destroyed;
  }
  private _destroyed = false;

  /**
   * This stores any gl state associated with this object. Modifying this object
   * will cause the system to get out of sync with the GPU; however, the values
   * inside this object can be read and used for custom WebGL calls as needed.
   */
  gl?: {
    /** The identifier used by gl to target this color buffer. */
    bufferId: WebGLRenderbuffer | null;
    /**
     * This is the proxy communicator with the context that generates and
     * destroys Color Buffers.
     */
    proxy: GLProxy;
  };

  /**
   * Tells the input packing to premultiply the alpha values with the other
   * channels as the texture is generated. See:
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   */
  get internalFormat() {
    return this._internalFormat;
  }
  set internalFormat(val: ColorBuffer["_internalFormat"]) {
    this.needsSettingsUpdate = true;
    this._internalFormat = val;
  }
  private _internalFormat:
    | GLSettings.RenderTarget.ColorBufferFormat
    | GLSettings.RenderTarget.DepthBufferFormat
    | GLSettings.RenderTarget.StencilBufferFormat =
    GLSettings.RenderTarget.ColorBufferFormat.RGBA8;

  /** Flag indicates if the Render Buffer needs it's settings modified */
  needsSettingsUpdate = false;

  /**
   * The dimensions of this color buffer object.
   */
  get size() {
    return this._size;
  }
  set size(val: ColorBuffer["_size"]) {
    this.needsSettingsUpdate = true;
    this._size = val;
  }
  private _size: Vec2 = [0, 0];

  get multiSample() {
    return this._multiSample;
  }
  set multiSample(val: ColorBuffer["_multiSample"]) {
    this.needsSettingsUpdate = true;
    this._multiSample = Math.min(WebGLStat.MSAA_MAX_SAMPLES, val);
  }
  private _multiSample: number = 0;

  /**
   * Default ctor
   */
  constructor(options: ColorBufferOptions) {
    this.size = options.size || this.size;
    this.internalFormat = options.internalFormat ?? this.internalFormat;
    this.multiSample = options.multiSample ?? this.multiSample;
  }

  /**
   * Destroys and frees the resources this buffer utilizes in the gl context.
   * This also invalidates this as a viable resource permanently.
   */
  destroy() {
    if (this.gl) {
      this.gl.proxy.disposeColorBuffer(this);
    }

    this._destroyed = true;
  }
}
