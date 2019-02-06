import { TypeVec } from "src/types";
import { GLSettings } from "./gl-settings";
import { Material } from "./material";

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

  private _blendDstFactor = GLSettings.Material.BlendingDstFactor.One;
  /** The current destination factor used in the blending equation */
  get blendDstFactor() { return this._blendDstFactor; }

  private _blendSrcFactor: GLSettings.Material.BlendingSrcFactor | GLSettings.Material.BlendingDstFactor = GLSettings.Material.BlendingDstFactor.One;
  /** The current destination factor used in the blending equation */
  get blendSrcFactor() { return this._blendSrcFactor; }

  private _blendEquation = GLSettings.Material.BlendingEquations.Add;
  /** The current equation used in the blend mode */
  get blendEquation() { return this._blendEquation; }

  private _cullFace: GLSettings.Material.CullSide = GLSettings.Material.CullSide.NONE;
  /** Indicates which faces will be culled */
  get cullFace() { return this._cullFace; }

  private _colorMask: TypeVec<boolean> = [true, true, true, true];
  /** The channels in the color buffer a fragment is allowed to write to */
  get colorMask() { return this._colorMask; }

  private _depthFunc = GLSettings.Material.DepthFunctions.ALWAYS;
  /** Comparator used when testing a fragment against the depth buffer */
  get depthFunc() { return this._depthFunc; }

  private _depthTestEnabled = true;
  /** Indicates if fragments are tested against the depth buffer or not */
  get depthTestEnabled() { return this._depthTestEnabled; }

  private _depthMask = true;
  /** Indicates if the fragment will write to the depth buffer or not */
  get depthMask() { return this._depthMask; }

  private _ditheringEnabled = true;
  /** Indicates if dithering is enabled */
  get ditheringEnabled() { return this._ditheringEnabled; }

  private _boundFBO: WebGLFramebuffer | null = null;
  /** The currently bound frame buffer object. null if nothing bound. */
  get boundFBO() { return this._boundFBO; }

  private _boundRBO: WebGLRenderbuffer | null = null;
  /** The currently bound render buffer object. null if nothing bound. */
  get boundRBO() { return this._boundRBO; }

  private _boundVBO: WebGLBuffer | null = null;
  /** The current id of the current bound vbo. If null, nothing is bound */
  get boundVBO() { return this._boundVBO; }

  private _boundTexture: WebGLTexture | null = null;
  /** The current texture object bound. If null, nothing is bound */
  get boundTexture() { return this._boundTexture; }

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  /**
   * Sets the provided buffer identifier as the current bound item.
   */
  bindVBO(id: WebGLBuffer | null) {
    if (this._boundVBO !== id) {
      this._boundVBO = id;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, id);
    }
  }

  /**
   * Sets the provided buffer identifier as the current bound item
   */
  bindRBO(id: WebGLRenderbuffer) {
    if (this._boundRBO !== id) {
      this._boundRBO = id;
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, id);
    }
  }

  /**
   * Sets the provided buffer identifier as the current bound item
   */
  bindFBO(id: WebGLFramebuffer) {
    if (this._boundFBO !== id) {
      this._boundFBO = id;
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, id);
    }
  }

  /**
   * Sets the provided buffer identifier as the current bound item
   */
  bindTexture(id: WebGLTexture, target: GLSettings.Texture.TextureBindingTarget) {
    if (this._boundTexture !== id) {
      this._boundTexture = id;

      switch (target) {
        case GLSettings.Texture.TextureBindingTarget.TEXTURE_2D:
          this.gl.bindTexture(this.gl.TEXTURE_2D, id);
          break;

        case GLSettings.Texture.TextureBindingTarget.TEXTURE_2D:
          this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, id);
          break;
      }
    }
  }

  /**
   * This syncs the state of the GL context with the requested state of a material
   */
  syncMaterial(material: Material) {
    const gl = this.gl;
    const depthWrite = Boolean(material.depthWrite);

    // Depth mode changes
    if (this._depthMask !== depthWrite) {
      this._depthMask = depthWrite;
      gl.depthMask(this._depthMask);
    }

    if (this._depthTestEnabled !== material.depthTest) {
      this._depthTestEnabled = material.depthTest;
      this._depthTestEnabled ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
    }

    if (this._depthFunc !== material.depthFunc) {
      this._depthFunc = material.depthFunc;
      this.applyDepthFunc();
    }

    // Blending changes
    if (material.blending) {
      if (!this._blendingEnabled) {
        gl.enable(gl.BLEND);
      }

      if (
        this._blendDstFactor !== material.blending.blendDst ||
        this._blendSrcFactor !== material.blending.blendSrc ||
        this._blendEquation !== material.blending.blendEquation
      ) {
        this._blendDstFactor = material.blending.blendDst || this._blendDstFactor;
        this._blendSrcFactor = material.blending.blendSrc || this._blendSrcFactor;
        this._blendEquation = material.blending.blendEquation || this._blendEquation;
        this.applyBlendFactors();
      }
    }

    else {
      if (this._blendingEnabled) {
        gl.disable(gl.BLEND);
      }
    }

    // Cull mode
    if (this._cullFace !== material.culling) {
      this._cullFace = material.culling;
      this.applyCullFace();
    }

    // Color mode
    if (
      this._colorMask[0] !== material.colorWrite[0] ||
      this._colorMask[1] !== material.colorWrite[1] ||
      this._colorMask[2] !== material.colorWrite[2] ||
      this._colorMask[3] !== material.colorWrite[3]
    ) {
      this._colorMask = material.colorWrite;
      this.applyColorMask();
    }

    // Dithering
    if (this._ditheringEnabled !== material.dithering) {
      this._ditheringEnabled = material.dithering;
      this._ditheringEnabled ? gl.enable(gl.DITHER) : gl.disable(gl.DITHER);
    }
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
    this.applyBlendFactors();
    this.applyBlendEquation();
    this.applyColorMask();
    this.applyDepthFunc();
    gl.depthMask(this._depthMask);
  }

  /**
   * Applies the current depth function to the gl state
   */
  private applyDepthFunc() {
    const gl = this.gl;

    switch (this._depthFunc) {
      case GLSettings.Material.DepthFunctions.ALWAYS: gl.depthFunc(gl.ALWAYS); break;
      case GLSettings.Material.DepthFunctions.EQUAL: gl.depthFunc(gl.EQUAL); break;
      case GLSettings.Material.DepthFunctions.GREATER: gl.depthFunc(gl.GREATER); break;
      case GLSettings.Material.DepthFunctions.GREATER_OR_EQUAL: gl.depthFunc(gl.GEQUAL); break;
      case GLSettings.Material.DepthFunctions.LESS: gl.depthFunc(gl.LESS); break;
      case GLSettings.Material.DepthFunctions.LESS_OR_EQUAL: gl.depthFunc(gl.LEQUAL); break;
      case GLSettings.Material.DepthFunctions.NEVER: gl.depthFunc(gl.NEVER); break;
      case GLSettings.Material.DepthFunctions.NOTEQUAL: gl.depthFunc(gl.NOTEQUAL); break;

      default:
        gl.depthFunc(gl.ALWAYS);
        break;
    }
  }

  /**
   * Applies the writing mask to the color buffer to the gl state.
   */
  private applyColorMask() {
    this.gl.colorMask(
      this.colorMask[0] || false,
      this.colorMask[1] || false,
      this.colorMask[2] || false,
      this.colorMask[3] || false,
    );
  }

  /**
   * Applies the blending equations to the gl state
   */
  private applyBlendEquation() {
    const gl = this.gl;

    switch (this._blendEquation) {
      case GLSettings.Material.BlendingEquations.Add: gl.blendEquation(gl.FUNC_ADD); break;
      case GLSettings.Material.BlendingEquations.Subtract: gl.blendEquation(gl.FUNC_SUBTRACT); break;
      case GLSettings.Material.BlendingEquations.ReverseSubtract: gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT); break;
      // case GLSettings.Material.BlendingEquations.Min: /** Requires extension for Webgl 1 */ break;
      // case GLSettings.Material.BlendingEquations.Max: /** Requires extension for Webgl 1 */ break;
    }
  }

  /**
   * Applies the blending factors to the gl state
   */
  private applyBlendFactors() {
    const gl = this.gl;
    let dst, src;

    switch (this._blendDstFactor) {
      case GLSettings.Material.BlendingDstFactor.DstAlpha: dst = gl.BLEND_DST_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.DstColor: dst = gl.BLEND_DST_RGB; break;
      case GLSettings.Material.BlendingDstFactor.One: dst = gl.ONE; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstAlpha: dst = gl.ONE_MINUS_DST_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstColor: dst = gl.ONE_MINUS_DST_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcAlpha: dst = gl.ONE_MINUS_SRC_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcColor: dst = gl.ONE_MINUS_SRC_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.SrcAlpha: dst = gl.SRC_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.SrcColor: dst = gl.SRC_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.Zero: dst = gl.ZERO; break;

      default:
        dst = gl.ONE;
        break;
    }

    switch (this._blendSrcFactor) {
      case GLSettings.Material.BlendingDstFactor.DstAlpha: src = gl.BLEND_DST_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.DstColor: src = gl.BLEND_DST_RGB; break;
      case GLSettings.Material.BlendingDstFactor.One: src = gl.ONE; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstAlpha: src = gl.ONE_MINUS_DST_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstColor: src = gl.ONE_MINUS_DST_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcAlpha: src = gl.ONE_MINUS_SRC_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcColor: src = gl.ONE_MINUS_SRC_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.SrcAlpha: src = gl.SRC_ALPHA; break;
      case GLSettings.Material.BlendingDstFactor.SrcColor: src = gl.SRC_COLOR; break;
      case GLSettings.Material.BlendingDstFactor.Zero: src = gl.ZERO; break;
      case GLSettings.Material.BlendingSrcFactor.SrcAlphaSaturate: src = gl.SRC_ALPHA_SATURATE; break;

      default:
        src = gl.ONE;
        break;
    }

    gl.blendFunc(src, dst);
  }

  /**
   * Applies the cull face property to the gl state
   */
  private applyCullFace() {
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
