import { GLSettings } from "./gl-settings";

/**
 * This class represents all of the current state and settings that the gl context is in currently. This
 * helps to decide when to make gl calls to alter the state and not do so unecessarily.
 */
export class GLState {
  /** Stores the gl context this is watching the state over */
  private gl: WebGLRenderingContext;

  private _blendingEnabled = true;
  /** Indicates if blending is enabled */
  get blendingEnabled() { return this._blendingEnabled; }

  private _blendDstFactor = GLSettings.Material.BlendingDstFactor.OneFactor;
  /** The current destination factor used in the blending equation */
  get blendDstFactor() { return this._blendDstFactor; }

  private _blendSrcFactor: GLSettings.Material.BlendingSrcFactor | GLSettings.Material.BlendingDstFactor = GLSettings.Material.BlendingDstFactor.OneFactor;
  /** The current destination factor used in the blending equation */
  get blendSrcFactor() { return this._blendSrcFactor; }

  private _blendEquation = GLSettings.Material.BlendingEquations.Add;
  /** The current equation used in the blend mode */
  get blendEquation() { return this._blendEquation; }

  private _cullFace: GLSettings.Material.CullSide = GLSettings.Material.CullSide.NONE;
  /** Indicates which faces will be culled */
  get cullFace() { return this._cullFace; }

  private _colorMask: [boolean, boolean, boolean, boolean] = [true, true, true, true];
  /** The channels in the color buffer a fragment is allowed to write to */
  get colorMask() { return this._colorMask; }

  private _depthFunc = GLSettings.Material.DepthFunctions;
  /** Comparator used when testing a fragment against the depth buffer */
  get depthFunc() { return this._depthFunc; }

  private _depthTestEnabled = true;
  /** Indicates if fragments are tested against the depth buffer or not */
  get depthTest() { return this._depthTestEnabled; }

  private _depthMask = true;
  /** Indicates if the fragment will write to the depth buffer or not */
  get depthMask() { return this._depthMask; }

  private _ditheringEnabled = true;
  /** Indicates if dithering is enabled */
  get dithering() { return this._ditheringEnabled; }

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  /**
   * This method applies ALL of the state elements monitored and force sets them with WebGL calls
   * to make sure the GPU is in the same state as this state object.
   */
  syncState() {
    const gl = this.gl;

    this._blendingEnabled ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND);
    this._ditheringEnabled ? gl.enable(gl.DITHER) : gl.disable(gl.DITHER);
    this._depthTestEnabled ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
    this.applyCullFace();
    this._blendDstFactor;
  }

  applyBlendFactors() {
    const gl = this.gl;
    let dst, src;

    switch (this._blendDstFactor) {
      case GLSettings.Material.BlendingDstFactor.DstAlphaFactor: dst = gl.BLEND_DST_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.DstColorFactor: dst = gl.BLEND_DST_RGB; break;
      case GLSettings.Material.BlendingDstFactor.OneFactor: dst = gl.ONE; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstAlphaFactor: dst = gl.ONE_MINUS_DST_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstColorFactor: dst = gl.ONE_MINUS_DST_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcAlphaFactor: dst = gl.ONE_MINUS_SRC_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcColorFactor: dst = gl.ONE_MINUS_SRC_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.SrcAlphaFactor: dst = gl.SRC_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.SrcColorFactor: dst = gl.SRC_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.ZeroFactor: dst = gl.ZERO; break;

      default:
        dst = gl.ONE;
        break;
    }

    switch (this._blendSrcFactor) {
      case GLSettings.Material.BlendingDstFactor.DstAlphaFactor: src = gl.BLEND_DST_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.DstColorFactor: src = gl.BLEND_DST_RGB; break;
      case GLSettings.Material.BlendingDstFactor.OneFactor: src = gl.ONE; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstAlphaFactor: src = gl.ONE_MINUS_DST_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstColorFactor: src = gl.ONE_MINUS_DST_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcAlphaFactor: src = gl.ONE_MINUS_SRC_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcColorFactor: src = gl.ONE_MINUS_SRC_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.SrcAlphaFactor: src = gl.SRC_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.SrcColorFactor: src = gl.SRC_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.ZeroFactor: src = gl.ZERO; break;
      case GLSettings.Material.BlendingSrcFactor.SrcAlphaSaturateFactor: src = gl.SRC_ALPHA_SATURATE; break;

      default:
        src = gl.ONE;
        break;
    }

    gl.blendFunc(src, dst);
  }

  applyCullFace() {
    const gl = this.gl;

    if (this._cullFace !== GLSettings.Material.CullSide.NONE) {
      gl.enable(gl.CULL_FACE);
    }

    switch (this._cullFace) {
      case GLSettings.Material.CullSide.BACK: gl.cullFace(gl.BACK); break;
      case GLSettings.Material.CullSide.FRONT: gl.cullFace(gl.FRONT); break;
      case GLSettings.Material.CullSide.BOTH: gl.cullFace(gl.FRONT_AND_BACK); break;

      default:
        gl.disable(gl.CULL_FACE);
    }
  }
}
