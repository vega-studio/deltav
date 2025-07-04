import Debug from "debug";

import { compare4, copy4, flatten4, Vec4 } from "../math/vector.js";
import { FragmentOutputType, TypeVec } from "../types.js";
import { indexToTextureUnit, textureUnitToIndex } from "./gl-decode.js";
import { GLProxy } from "./gl-proxy.js";
import { GLSettings } from "./gl-settings.js";
import { Material, type MaterialSettings } from "./material.js";
import { RenderTarget } from "./render-target.js";
import { Texture } from "./texture.js";
import {
  IExtensions,
  IMaterialUniform,
  MaterialUniformType,
  MaterialUniformValue,
  UseMaterialStatus,
} from "./types.js";
import type { UniformBuffer } from "./uniform-buffer.js";
import { WebGLStat } from "./webgl-stat.js";

const debug = Debug("performance");

/**
 * This class represents all of the current state and settings that the gl context is in currently. This
 * helps to decide when to make gl calls to alter the state and not do so unecessarily.
 *
 * This state focuses on global state settings like bound objects and gl settings. Other state
 * for the GL context is stored within objects that are generated, such as Texture and Attribute.
 */
export class GLState {
  /** Message to include with debug, warns, and errors */
  debugContext = "";
  /** The extensions enabled for the context */
  private extensions!: IExtensions;
  /** Stores the gl context this is watching the state over */
  private gl!: WebGLRenderingContext;
  /** This is a proxy to execute commands that do not change global gl state */
  private glProxy!: GLProxy;

  /** Lookup a texture unit to it's current assigned texture. */
  private _textureUnitToTexture = new Map<number, Texture | null>();
  /** This holds which texture units are free for use and have no Texture assigned to them */
  private _freeTextureUnits: number[] = [];

  /** Lookup a uniform buffer to it's current assigned binding point. */
  // private _uniformBufferToBinding = new Map<number, UniformBuffer | null>();
  /** This holds which uniform buffer binding points are free for use and have no UniformBuffer assigned to them */
  private _freeUniformBufferBindings: number[] = [];

  /** Indicates if blending is enabled */
  get blendingEnabled() {
    return this._blendingEnabled;
  }
  private _blendingEnabled = true;

  /** The current destination factor used in the blending equation */
  get blendDstFactor() {
    return this._blendDstFactor;
  }
  private _blendDstFactor = GLSettings.Material.BlendingDstFactor.One;

  /** The current destination factor used in the blending equation */
  get blendSrcFactor() {
    return this._blendSrcFactor;
  }
  private _blendSrcFactor:
    | GLSettings.Material.BlendingSrcFactor
    | GLSettings.Material.BlendingDstFactor =
    GLSettings.Material.BlendingDstFactor.One;

  /** The current equation used in the blend mode */
  get blendEquation() {
    return this._blendEquation;
  }
  private _blendEquation = GLSettings.Material.BlendingEquations.Add;

  /** Indicates which faces will be culled */
  get cullFace() {
    return this._cullFace;
  }
  private _cullFace: GLSettings.Material.CullSide =
    GLSettings.Material.CullSide.NONE;

  /** Indicates if culling is enabled */
  get cullEnabled() {
    return this._cullEnabled;
  }
  private _cullEnabled = true;

  /** The channels in the color buffer a fragment is allowed to write to */
  get colorMask() {
    return this._colorMask;
  }
  private _colorMask: TypeVec<boolean> = [true, true, true, true];

  /** The current color the context will clear when clear with the color buffer bit is called */
  get clearColor() {
    return this._clearColor;
  }
  private _clearColor: Vec4 = [0.0, 0.0, 0.0, 1.0];

  /** Comparator used when testing a fragment against the depth buffer */
  get depthFunc() {
    return this._depthFunc;
  }
  private _depthFunc = GLSettings.Material.DepthFunctions.ALWAYS;

  /** Indicates if fragments are tested against the depth buffer or not */
  get depthTestEnabled() {
    return this._depthTestEnabled;
  }
  private _depthTestEnabled = true;

  /** Indicates if the fragment will write to the depth buffer or not */
  get depthMask() {
    return this._depthMask;
  }
  private _depthMask = true;

  /** Indicates if dithering is enabled */
  get ditheringEnabled() {
    return this._ditheringEnabled;
  }
  private _ditheringEnabled = true;

  /** The currently bound frame buffer object. null if nothing bound. */
  get boundFBO() {
    return this._boundFBO;
  }
  private _boundFBO: {
    read: WebGLFramebuffer | null;
    draw: WebGLFramebuffer | null;
  } = { read: null, draw: null };

  /**
   * This is the current render target who's FBO is bound. A null render target
   * indicates the target is the screen.
   */
  get renderTarget() {
    return this._renderTarget;
  }
  private _renderTarget: RenderTarget | null = null;

  /** The currently bound render buffer object. null if nothing bound. */
  get boundRBO() {
    return this._boundRBO;
  }
  private _boundRBO: WebGLRenderbuffer | null = null;

  /** The current id of the current bound vao. If null, nothing is bound */
  get boundVAO() {
    return this._boundVAO;
  }
  private _boundVAO: WebGLVertexArrayObject | null = null;

  /** The current id of the current bound vbo. If null, nothing is bound */
  get boundVBO() {
    return this._boundVBO;
  }
  private _boundVBO: WebGLBuffer | null = null;

  /**
   * The current id of the current bound element array buffer. If null, nothing
   * is bound
   */
  get boundElementArrayBuffer() {
    return this._boundElementArrayBuffer;
  }
  private _boundElementArrayBuffer: WebGLBuffer | null = null;

  /**
   * The current texture object bound. If null, nothing is bound. This also tracks
   * the texture unit to which it was bound. The unit and the texture object must match for
   * a binding call to be skipped.
   */
  get boundTexture() {
    return this._boundTexture;
  }
  private _boundTexture: { id: WebGLTexture | null; unit: number } = {
    id: null,
    unit: -1,
  };

  /** The current program in use */
  get currentProgram() {
    return this._currentProgram;
  }
  private _currentProgram: WebGLProgram | null = null;

  /** Indicates if the scissor test is enabled in the context */
  get scissorTestEnabled() {
    return this._scissorTestEnabled;
  }
  private _scissorTestEnabled = false;

  /** The current bounds of the scissor test */
  get scissorBounds() {
    return this._scissorBounds;
  }
  private _scissorBounds = { x: 0, y: 0, width: 1, height: 1 };

  /** These are the current uniforms uploaded to the GPU */
  get currentUniforms() {
    return this._currentUniforms;
  }
  private _currentUniforms: {
    [name: string]: IMaterialUniform<MaterialUniformType>;
  } = {};

  /** This is the texture unit currently active */
  get activeTextureUnit() {
    return this._activeTextureUnit;
  }
  private _activeTextureUnit = -1;

  /** This is the buffer state set and activated for the drawBuffers call */
  get drawBuffers() {
    return this._drawBuffers;
  }
  private _drawBuffers: number[] = [];

  /**
   * This contains all of the textures that are are needing to be utilized for
   * next draw. Textures are used by either uniforms or by RenderTargets in a
   * single draw call. Thus we track the uniforms or the render targets awaiting
   * use of the texture.
   */
  get textureWillBeUsed() {
    return this._textureWillBeUsed;
  }
  private _textureWillBeUsed = new Map<
    Texture,
    Set<WebGLUniformLocation> | RenderTarget
  >();

  /** The current viewport gl is using */
  get viewport() {
    return this._viewport;
  }
  private _viewport = { x: 0, y: 0, width: 100, height: 100 };

  /** This contains all of the currently enabled vertex attribute pointers */
  get enabledVertexAttributeArray() {
    return this._enabledVertexAttributeArray
      .slice(0)
      .filter((n) => n !== undefined);
  }
  private _enabledVertexAttributeArray: number[] = [];
  private _willUseVertexAttributeArray: number[] = [];

  /** Tracks the current divisor set to a given vertex array location. */
  private _vertexAttributeArrayDivisor = new Map<number, number>();

  /**
   * Generate a new state manager and establish some initial state settings by
   * querying the context.
   */
  constructor(gl: WebGLRenderingContext, extensions: IExtensions) {
    this.gl = gl;
    this.extensions = extensions;

    // Retrieve how many units are allowed at the same time to be assiged so we
    // can initialize our free units array
    const totalUnits = this.gl.getParameter(
      gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS
    );

    for (let i = 0; i < totalUnits; ++i) {
      this._freeTextureUnits.push(indexToTextureUnit(gl, i));
    }

    // Retrieve how many uniform buffers are allowed to be bound at the same
    // time. We will create a pool of binding points that are free for use.
    const totalUniformBuffers = WebGLStat.MAX_UNIFORM_BUFFER_BINDINGS;

    for (let i = 0; i < totalUniformBuffers; ++i) {
      this._freeUniformBufferBindings.push(i);
    }

    // Initialize state to valid value
    this._activeTextureUnit = gl.TEXTURE0;
    // Query cull state
    this._cullEnabled = true;
    gl.enable(gl.CULL_FACE);
    // Query depth test state
    this._depthTestEnabled = true;
    gl.enable(gl.DEPTH_TEST);
    // Query blending state
    this._blendingEnabled = true;
    gl.enable(gl.BLEND);
  }

  /**
   * Sets the provided vertex array as the current bound item.
   */
  bindVAO(id: WebGLVertexArrayObject | null) {
    // If the VAO is changing, we need to bind it, otherwise skip this step.
    if (this._boundVAO !== id) {
      this._boundVAO = id;

      if (this.extensions.vao) {
        if (this.extensions.vao instanceof WebGL2RenderingContext) {
          this.extensions.vao.bindVertexArray(id);
        } else {
          this.extensions.vao.bindVertexArrayOES(id);
        }
      }
    }
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
   * Sets the provided buffer identifier as the current bound
   * ELEMENT_ARRAY_BUFFER.
   */
  bindElementArrayBuffer(id: WebGLBuffer | null) {
    if (this._boundElementArrayBuffer !== id) {
      this._boundElementArrayBuffer = id;
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, id);
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
  bindFBO(id: WebGLFramebuffer | null) {
    if (this._boundFBO.draw !== id || this._boundFBO.read !== id) {
      this._boundFBO.draw = id;
      this._boundFBO.read = id;
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, id);
    }
  }

  /**
   * Binds the read and draw framebuffers for READ and DRAW framebuffer targets.
   */
  bindFBOTargets(
    source: WebGLFramebuffer | null,
    target: WebGLFramebuffer | null
  ) {
    if (!(this.gl instanceof WebGL2RenderingContext)) return;

    // if (this._boundFBO.draw !== target) {
    this._boundFBO.draw = target;
    this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, target);
    // }

    // if (this._boundFBO.read !== source) {
    this._boundFBO.read = source;
    this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, source);
    // }
  }

  /**
   * Sets the provided buffer identifier as the current bound item. This
   * automatically updates all stateful information to track that a texture is
   * now utilizing a texture unit.
   */
  bindTexture(
    texture: Texture,
    target: GLSettings.Texture.TextureBindingTarget
  ) {
    if (!texture.gl || !texture.gl.textureId) return;

    if (
      !texture ||
      this._boundTexture.id !== texture.gl.textureId ||
      this._boundTexture.unit !== this._activeTextureUnit
    ) {
      this._boundTexture = {
        id: texture.gl.textureId,
        unit: this._activeTextureUnit,
      };

      switch (target) {
        case GLSettings.Texture.TextureBindingTarget.TEXTURE_2D:
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture.gl.textureId);
          break;

        case GLSettings.Texture.TextureBindingTarget.CUBE_MAP:
          this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture.gl.textureId);
          break;
      }

      // Since the binding happened, we HAVE to track that this texture is now
      // the texture for the current active unit. We must also remove the unit
      // from any texture previously utilizing the unit
      const previous = this._textureUnitToTexture.get(this._activeTextureUnit);

      if (previous) {
        if (previous.gl) previous.gl.textureUnit = -1;
      }

      this._textureUnitToTexture.set(this._activeTextureUnit, texture);
      texture.gl.textureUnit = this._activeTextureUnit;
    }
  }

  /**
   * Disables all vertex attribute array indices enabled
   */
  disableVertexAttributeArray() {
    for (
      let i = 0, iMax = this._enabledVertexAttributeArray.length;
      i < iMax;
      ++i
    ) {
      const index = this._enabledVertexAttributeArray[i];
      this.gl.disableVertexAttribArray(index);
    }

    this._enabledVertexAttributeArray = [];
    this._willUseVertexAttributeArray = [];
    this._vertexAttributeArrayDivisor.clear();
  }

  /**
   * Flags an attribute array as going to be used. Any attribute array location
   * no longer in use will be disabled when applyVertexAttributeArrays is
   * called.
   */
  willUseVertexAttributeArray(index: number) {
    // Flag the index as will be used
    this._willUseVertexAttributeArray[index] = index;
    // If already enabled we're done
    if (this._enabledVertexAttributeArray[index] !== void 0) return;
    // Flag the index as enabled
    this._enabledVertexAttributeArray[index] = index;
    // Otherwise, get this location enabled right away
    this.gl.enableVertexAttribArray(index);
  }

  /**
   * This enables the necessary vertex attribute arrays.
   */
  applyVertexAttributeArrays() {
    // All locations that should be enabled are now enabled
    // Disable any locations that will not be used
    for (
      let i = 0, iMax = this._enabledVertexAttributeArray.length;
      i < iMax;
      ++i
    ) {
      const index = this._enabledVertexAttributeArray[i];

      if (index !== void 0) {
        if (this._willUseVertexAttributeArray[index] !== void 0) return;
        this.gl.disableVertexAttribArray(index);
        delete this._enabledVertexAttributeArray[index];
      }
    }

    // Reset the use array for next draw
    this._willUseVertexAttributeArray = [];
  }

  /**
   * Applies (if necessary) the divisor for a given array. This only works if
   * the array location is enabled.
   */
  setVertexAttributeArrayDivisor(index: number, divisor: number) {
    if (!this.extensions.instancing) return;

    if (this._enabledVertexAttributeArray[index] !== undefined) {
      if (this._vertexAttributeArrayDivisor.get(index) !== divisor) {
        if (this.extensions.instancing instanceof WebGL2RenderingContext) {
          this.extensions.instancing.vertexAttribDivisor(index, divisor);
        } else {
          this.extensions.instancing.vertexAttribDivisorANGLE(index, divisor);
        }

        this._vertexAttributeArrayDivisor.set(index, divisor);
      }
    }
  }

  /**
   * This takes a texture and flags it's texture unit as freed if the texture
   * has a used unit
   */
  freeTextureUnit(texture: Texture) {
    if (texture.gl) {
      if (texture.gl.textureUnit > -1) {
        // Detach the texture from the unit before going forward
        this.setActiveTextureUnit(texture.gl.textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this._boundTexture.id = null;
        this._boundTexture.unit = -1;
        this._textureUnitToTexture.set(texture.gl.textureUnit, null);
        // Add the unit back to the free units
        this._freeTextureUnits.unshift(texture.gl.textureUnit);
        texture.gl.textureUnit = -1;
      }
    }
  }

  /**
   * Changes the active texture unit to the provided unit.
   */
  setActiveTextureUnit(unit: number) {
    if (this._activeTextureUnit !== unit) {
      this._activeTextureUnit = unit;
      this.gl.activeTexture(unit);
    }
  }

  /**
   * Changes the gl clear color state
   */
  setClearColor(color: Vec4) {
    if (!compare4(color, this._clearColor)) {
      this._clearColor = copy4(color);
      this.applyClearColor();
    }
  }

  /**
   * Change the drawBuffer state, if it's available
   *
   * 0 - n specifies COLOR_ATTACHMENT
   * -1 specifies NONE
   * -2 specifies BACK
   */
  setDrawBuffers(attachments: number[], preventCommit?: boolean) {
    // See if a state change really is necessary
    let different = attachments.length !== this._drawBuffers.length;

    if (!different) {
      for (let i = 0, iMax = attachments.length; i < iMax; ++i) {
        if (this._drawBuffers[i] !== attachments[i]) {
          different = true;
          break;
        }
      }
    }

    if (!different) return;

    if (this.glProxy.extensions.drawBuffers instanceof WebGL2RenderingContext) {
      if (!preventCommit) {
        this.glProxy.extensions.drawBuffers.drawBuffers(attachments);
      }
    } else if (this.glProxy.extensions.drawBuffers) {
      if (!preventCommit) {
        this.glProxy.extensions.drawBuffers.drawBuffersWEBGL(attachments);
      }
    } else {
      console.warn(
        "Attempted to use drawBuffers for MRT, but MRT is NOT supported by this hardware. Use multiple render targets instead"
      );
      return;
    }

    this._drawBuffers = attachments;
  }

  /**
   * Sets the GPU proxy to be used to handle commands that call to the GPU but
   * don't alter global GL state.
   */
  setProxy(proxy: GLProxy) {
    this.glProxy = proxy;
  }

  /**
   * Enables or disables the scissor test
   */
  setScissor(
    bounds: { x: number; y: number; width: number; height: number } | null
  ) {
    if (bounds) {
      if (!this._scissorTestEnabled) {
        this._scissorTestEnabled = true;
        this.gl.enable(this.gl.SCISSOR_TEST);
      }

      if (
        bounds.x !== this._scissorBounds.x ||
        bounds.y !== this._scissorBounds.y ||
        bounds.width !== this._scissorBounds.width ||
        bounds.height !== this._scissorBounds.height
      ) {
        this._scissorBounds = bounds;
        this.applyScissorBounds();
      }
    } else {
      if (this._scissorTestEnabled) {
        this._scissorTestEnabled = false;
        this.gl.disable(this.gl.SCISSOR_TEST);
      }
    }
  }

  /**
   * Applies a viewport to the given state
   */
  setViewport(x: number, y: number, width: number, height: number) {
    if (
      x !== this._viewport.x ||
      y !== this._viewport.y ||
      width !== this._viewport.width ||
      height !== this._viewport.height
    ) {
      this._viewport = { x, y, width, height };
      this.applyViewport();
    }
  }

  /**
   * Uses the program indicated
   */
  useProgram(program: WebGLProgram) {
    if (this._currentProgram !== program) {
      this._currentProgram = program;
      this.gl.useProgram(this._currentProgram);
    }
  }

  /**
   * Sets all current gl state to match the materials settings.
   */
  useMaterial(material: Material): UseMaterialStatus {
    // Make sure the material is compiled
    if (!material.gl) {
      if (!this.glProxy.compileMaterial(material)) {
        return UseMaterialStatus.INVALID;
      }

      if (!material.gl) {
        return UseMaterialStatus.INVALID;
      }
    }

    if (!material.gl.programId || material.gl.programId.length === 0) {
      return UseMaterialStatus.INVALID;
    }

    // After determining we have a material that is capable of rendering, we now
    // look to match the material's program to the current output target output
    // types as best as possible
    const programId = this.findMaterialProgram(material);

    // Last check to make sure our process did find a program to run from the
    // material.
    if (programId === void 0) {
      console.warn(
        "Could NOT determine a program for the given material that would appropriately match with the current RenderTarget"
      );
      return UseMaterialStatus.NO_RENDER_TARGET_MATCHES;
    }

    // If we have a render target, we should set up a few elements such as draw
    // buffer arrangement.
    if (this._renderTarget) {
      material.gl.programByTarget.set(this._renderTarget, programId);

      // Next we check to see if multi render targets is enabled. If it is, we
      // need to make sure our draw buffer state is set correctly.
      if (this.glProxy.extensions.drawBuffers) {
        // Look at each output the material is writing to. These outputs will be
        // in the order of location[0] - location[n]
        const fragOutputs = material.gl.outputsByProgram.get(programId);
        const renderOutputs = this._renderTarget.getGLBuffers();

        if (!fragOutputs || !renderOutputs) {
          console.warn(
            "Could not establish the buffers to utilize for the render target"
          );
          return UseMaterialStatus.NO_RENDER_TARGET_MATCHES;
        }

        const attachments: number[] = [];

        // For each fragment output we must find the index of the corresponding
        // target output
        for (let i = 0, iMax = renderOutputs.length; i < iMax; ++i) {
          const renderOutput = renderOutputs[i];
          const target = fragOutputs.find(
            (output) => renderOutput?.outputType === output
          );

          // The output type does not exist in the target outputs, thus we bind
          // nothing. If a fragment has an output that does not exist, then no
          // binding specification is needed (not even gl.NONE). If a render
          // output exists, but the fragment has no output THEN we need a
          // gl.NONE for that buffer.
          if (target === void 0) {
            attachments.push(this.gl.NONE);
          }

          // If our render target has specified the output target be disabled,
          // then tell the buffer to render to nothing
          else if (
            this._renderTarget.disabledTargets.has(
              renderOutput?.outputType || 0
            )
          ) {
            attachments.push(this.gl.NONE);
          }

          // The output type exists so we use the index as the attachment
          // location
          else {
            attachments.push(renderOutput?.attachment ?? this.gl.NONE);
          }
        }

        // Apply our draw buffers in the appropriate manner.
        this.setDrawBuffers(attachments);
      }
    }

    // Use the material's program
    this.useProgram(programId);
    // Synchronize the material's settings to the gl state
    this.syncMaterial(material);

    return UseMaterialStatus.VALID;
  }

  /**
   * This examines a given material to find the most appropriate program to run
   * based on the current RenderTarget
   */
  private findMaterialProgram(material: Material): WebGLProgram | void {
    if (!material.gl) return;

    // If we are rendering to the screen, then the material should render it's
    // COLOR output to the screen. We find the program that has the LEAST number
    // of targets AND outputs a COLOR target.
    if (!this._renderTarget || this._renderTarget.isColorTarget()) {
      let programId: WebGLProgram | undefined;

      // If the program is defined already, then we simply return that program as
      // the program to use
      if (this._renderTarget) {
        programId = material.gl.programByTarget.get(this._renderTarget);
        if (programId !== void 0) return programId;
      }

      let targetCount = Number.MAX_SAFE_INTEGER;

      for (let i = 0, iMax = material.gl.programId.length; i < iMax; ++i) {
        const program = material.gl.programId[i];
        if (program.outputTypes.length < targetCount) {
          if (program.outputTypes.indexOf(FragmentOutputType.COLOR) >= 0) {
            programId = program.id;
            targetCount = program.outputTypes.length;
          }
        }
      }

      // If no color output is found we just use the furthest out render target
      if (!programId) {
        programId = material.gl.programId[material.gl.programId.length - 1];
      }

      return programId;
    }

    // If the program is defined already, then we simply return that program as
    // the program to use
    let programId: WebGLProgram | void = material.gl.programByTarget.get(
      this._renderTarget
    );
    if (programId !== void 0) return programId;

    // If we have not determined the most appropriate program for the provided
    // render target to material combination, then we need to analyze and figure
    // that out. The best match will be a program that has the most output types
    // that matches the current render target's output types.
    const allOutputs = new Set<number>();
    const buffers = this._renderTarget.getBuffers();

    for (let i = 0, iMax = buffers.length; i < iMax; ++i) {
      const buffer = buffers[i];
      if (!buffer) continue;
      allOutputs.add(buffer.outputType);
    }

    // With all of our render target's outputs established we now look through
    // the material for the best match to the potential output. A best match
    // will be material outputs closest to the number of outputs of the render
    // target. If there are multiple material outputs that match the render
    // target outputs, then the best match is the material with the least number
    // of outputs.
    let maxMatches = 0;
    let pick: { id: WebGLProgram; outputTypes: number[] }[] = [];

    for (let i = 0, iMax = material.gl.programId.length; i < iMax; ++i) {
      const fragment = material.gl.programId[i];
      let matchCount = 0;

      for (let k = 0, kMax = fragment.outputTypes.length; k < kMax; ++k) {
        const outputType = fragment.outputTypes[k];
        if (allOutputs.has(outputType)) matchCount++;
      }

      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        pick = [fragment];
      } else if (matchCount === maxMatches) {
        pick.push(fragment);
      }
    }

    if (pick.length === 0) return;
    else if (pick.length === 1) programId = pick[0].id;
    else if (pick.length > 1) {
      programId = pick.reduce((p, n) =>
        n.outputTypes.length < p.outputTypes.length ? n : p
      );
    }

    return programId;
  }

  /**
   * Sets all current gl state to match the render target specified
   */
  useRenderTarget(target: RenderTarget | null) {
    if (!target) {
      this.bindFBO(null);
      this._renderTarget = null;
      return true;
    }

    // We must examine the render target to see if it has any textures that will
    // be utilized as a target. Those textures MUST be unbound fram any texture
    // units to prevent webgl feedback loop errors
    const textures = target.getTextures();
    for (let i = 0, iMax = textures.length; i < iMax; ++i) {
      const texture = textures[i];
      if (texture) this.freeTextureUnit(texture);
    }

    // The gl context must be specified for the target in order to use it
    if (!target.gl) return false;
    // Bind the FBO of the target as the current item we are rendering into
    this.bindFBO(target.gl.fboId);
    // Set the render target as our current render target that we are outputting
    // to.
    this._renderTarget = target;

    return true;
  }

  /**
   * This syncs the state of the GL context with the requested state of a
   * material
   */
  syncMaterial(material: MaterialSettings) {
    // Depth mode changes
    if (material.depthWrite !== void 0) this.setDepthMask(material.depthWrite);
    // Depth test enabled or no
    if (material.depthTest !== void 0) this.setDepthTest(material.depthTest);
    // Depth Func
    if (material.depthFunc !== void 0) this.setDepthFunc(material.depthFunc);
    // Blending changes
    if (material.blending !== void 0) this.setBlending(material.blending);
    // Cull mode
    if (material.culling !== void 0) this.setCullFace(material.culling);
    // Color mode
    if (material.colorWrite !== void 0) this.setColorMask(material.colorWrite);
    // Dithering
    if (material.dithering !== void 0) this.setDithering(material.dithering);

    // Uniforms
    if (material.uniforms) {
      this._currentUniforms = material.uniforms;

      if (!this._currentProgram) {
        return false;
      }

      // Now we can update and retrieve the locations for each uniform in the
      // program
      Object.entries(material.uniforms).forEach((entry) => {
        const { 0: name, 1: uniform } = entry;
        if (!this._currentProgram) return;
        if (!uniform.gl) uniform.gl = new Map();
        let glSettings = uniform.gl.get(this._currentProgram);

        // If no settings for the given program are present, then we must
        // query the program for the uniform's locations and what not.
        if (!glSettings) {
          const location = this.gl.getUniformLocation(
            this._currentProgram,
            name
          );

          if (!location) {
            glSettings = {
              location: void 0,
            };

            debug(
              this.debugContext,
              `A Material specified a uniform ${name}, but none was found in the current program.`
            );

            return;
          }

          glSettings = {
            location,
          };

          // Store the found location for the uniform
          uniform.gl.set(this._currentProgram, glSettings);
        }

        // After locations for the uniforms are established, we must now copy the
        // uniform info into the GPU
        if (glSettings.location) {
          this.uploadUniform(glSettings.location, uniform);
        }
      });
    }

    // Uniform buffers. This procedure is more complex than uniforms as they
    // will contain steps similar to attribute buffers for updates, then there
    // will be a step binding the program to the uniform buffer binding point.
    if (material.uniformBuffers) {
      Object.entries(material.uniformBuffers).forEach((entry) => {
        const { 0: _name, 1: uniformBuffer } = entry;
        if (!this._currentProgram) return;
        this.useUniformBuffer(uniformBuffer);
      });
    }

    // Textures
    if (this._textureWillBeUsed.size > 0) {
      if (!this.applyUsedTextures()) {
        return false;
      }
    }

    return true;
  }

  /**
   * Ensures the uniform buffer is bound to a binding point and ensures the
   * program in use links it's declared uniform structures to the binding point
   * as well.
   */
  useUniformBuffer(uniformBuffer: UniformBuffer) {
    if (!uniformBuffer.gl) return false;

    // this.bindUniformBuffer(uniformBuffer.gl.bufferId);

    return true;
  }

  /**
   * Set masking for the depth
   */
  setDepthMask(depthWrite: boolean) {
    if (this._depthMask !== depthWrite) {
      this._depthMask = depthWrite;
      this.gl.depthMask(this._depthMask);
    }
  }

  /**
   * Set the depth test enablement
   */
  setDepthTest(depthTest: boolean) {
    if (this._depthTestEnabled !== depthTest) {
      this._depthTestEnabled = depthTest;

      if (depthTest) {
        this.gl.enable(this.gl.DEPTH_TEST);
      } else {
        this.gl.disable(this.gl.DEPTH_TEST);
      }
    }
  }

  /**
   * Set the depth function
   */
  setDepthFunc(depthFunc: Material["depthFunc"]) {
    if (this._depthFunc !== depthFunc) {
      this._depthFunc = depthFunc;
      this.applyDepthFunc();
    }
  }

  /**
   * Set the blend mode and settings.
   */
  setBlending(blending: Material["blending"]) {
    if (blending) {
      if (!this._blendingEnabled) {
        this.gl.enable(this.gl.BLEND);
        this._blendingEnabled = true;
      }

      if (
        this._blendDstFactor !== blending.blendDst ||
        this._blendSrcFactor !== blending.blendSrc ||
        this._blendEquation !== blending.blendEquation
      ) {
        this._blendDstFactor = blending.blendDst || this._blendDstFactor;
        this._blendSrcFactor = blending.blendSrc || this._blendSrcFactor;
        this._blendEquation = blending.blendEquation || this._blendEquation;
        this.applyBlendFactors();
      }
    } else {
      if (this._blendingEnabled) {
        this.gl.disable(this.gl.BLEND);
        this._blendingEnabled = false;
      }
    }
  }

  /**
   * Set whether or not dithering is enabled.
   */
  setDithering(dithering: boolean) {
    if (this._ditheringEnabled !== dithering) {
      this._ditheringEnabled = dithering;

      if (this._ditheringEnabled) {
        this.gl.enable(this.gl.DITHER);
      } else {
        this.gl.disable(this.gl.DITHER);
      }
    }
  }

  /**
   * Change the bit mask for color channels allowed to be written into.
   */
  setColorMask(colorMask: TypeVec<boolean>) {
    if (
      this._colorMask[0] !== colorMask[0] ||
      this._colorMask[1] !== colorMask[1] ||
      this._colorMask[2] !== colorMask[2] ||
      this._colorMask[3] !== colorMask[3]
    ) {
      this._colorMask = colorMask;
      this.applyColorMask();
    }
  }

  /**
   * Change the cull face state
   */
  setCullFace(cullFace: GLState["_cullFace"]) {
    if (this._cullFace !== cullFace) {
      this._cullFace = cullFace;
      this.applyCullFace();
    }
  }

  /**
   * Performs the upload operation of a uniform to the GL context
   */
  private uploadUniform(
    location: WebGLUniformLocation,
    uniform: IMaterialUniform<MaterialUniformType>
  ) {
    let v;

    switch (uniform.type) {
      case MaterialUniformType.FLOAT:
        v = uniform.data as MaterialUniformValue<MaterialUniformType.FLOAT>;
        this.gl.uniform1f(location, v);
        break;

      case MaterialUniformType.VEC2:
        v = uniform.data as MaterialUniformValue<MaterialUniformType.VEC2>;
        this.gl.uniform2f(location, v[0], v[1]);
        break;

      case MaterialUniformType.VEC3:
        v = uniform.data as MaterialUniformValue<MaterialUniformType.VEC3>;
        this.gl.uniform3f(location, v[0], v[1], v[2]);
        break;

      case MaterialUniformType.VEC4:
        v = uniform.data as MaterialUniformValue<MaterialUniformType.VEC4>;
        this.gl.uniform4f(location, v[0], v[1], v[2], v[3]);
        break;

      case MaterialUniformType.VEC4_ARRAY:
        v =
          uniform.data as MaterialUniformValue<MaterialUniformType.VEC4_ARRAY>;
        this.gl.uniform4fv(location, flatten4(v));
        break;

      case MaterialUniformType.MATRIX3x3:
        v = uniform.data as MaterialUniformValue<MaterialUniformType.MATRIX3x3>;
        this.gl.uniformMatrix3fv(location, false, v);
        break;

      case MaterialUniformType.MATRIX4x4:
        v = uniform.data as MaterialUniformValue<MaterialUniformType.MATRIX4x4>;
        this.gl.uniformMatrix4fv(location, false, v);
        break;

      case MaterialUniformType.FLOAT_ARRAY:
        v =
          uniform.data as MaterialUniformValue<MaterialUniformType.FLOAT_ARRAY>;
        this.gl.uniform1fv(location, v);
        break;

      case MaterialUniformType.TEXTURE:
        v = uniform.data as MaterialUniformValue<MaterialUniformType.TEXTURE>;
        this.willUseTextureUnit(v, location);
        break;

      default:
        console.warn(
          this.debugContext,
          "A uniform specified an unrecognized type. It will not sync with the GPU:",
          uniform
        );
    }
  }

  /**
   * This will consume the values aggregated within willUseTextureUnit. All
   * Texture objects consumed will be assigned an active texture unit (if one
   * was not already applied), then the Texture will be compiled / updated as
   * necessary and applied to all uniforms requiring a Sampler unit.
   */
  applyUsedTextures() {
    // Assign texture units to the textures that will be used
    const failedTextures = this.assignTextureUnits(
      Array.from(this._textureWillBeUsed.keys())
    );

    // We apply the default unit to each texture that failed. Output will be
    // made from the previous method, so at this point, let's just try to make
    // lemonade out of lemons (set sane defaults)
    failedTextures.forEach((texture) => {
      if (texture.gl) {
        texture.gl.textureUnit = this.gl.TEXTURE0;
      } else {
        texture.gl = {
          textureId: null,
          textureUnit: this.gl.TEXTURE0,
          proxy: this.glProxy,
        };
      }
    });

    // Let's sort out which textures are affiliated with a RenderTarget or with
    // a uniform set.
    const textureToUniforms = new Map<Texture, Set<WebGLUniformLocation>>();
    const renderTargets = new Set<RenderTarget>();

    this._textureWillBeUsed.forEach((targets, texture) => {
      if (targets instanceof RenderTarget) {
        renderTargets.add(targets);
      } else {
        textureToUniforms.set(texture, targets);
      }
    });

    // Now our list of render targets is guaranteed to have their textures set
    // with an active texture unit, so we can now officially ensure the render
    // target is compiled.
    renderTargets.forEach((target) => {
      const textures = target.getTextures();
      const failed = textures.some((texture) => {
        // Only compile and process successful texture units
        if (failedTextures.indexOf(texture) < 0) {
          this.glProxy.updateTexture(texture);
        } else return true;

        return false;
      });

      if (!failed) {
        this.glProxy.compileRenderTarget(target);
      } else {
        console.warn(
          this.debugContext,
          "A RenderTarget can not be used because all of it's textures could not be compiled."
        );
      }
    });

    // Now that all of our textures have units, we loop through each texture and
    // have them compiled and/or updated then upload the unit to the appropriate
    // uniforms indicated.
    textureToUniforms.forEach((uniforms, texture) => {
      // Only compile and process successful texture units
      if (failedTextures.length === 0 || failedTextures.indexOf(texture) < 0) {
        this.glProxy.updateTexture(texture);

        uniforms.forEach((uniform) => {
          this.uploadTextureToUniform(uniform, texture);
        });
      }

      // Failed textures get their uniforms filled with the default 0 texture
      // unit
      else {
        uniforms.forEach((uniform) => {
          this.gl.uniform1i(uniform, textureUnitToIndex(this.gl, 0));
        });
      }
    });

    // We used the textures! This is no longer needed
    this._textureWillBeUsed.clear();

    return true;
  }

  /**
   * Attempts to assign free or freed texture units to the provided texture
   * objects. This will return a list of textures that could not be assigned an
   * available unit.
   *
   * NOTE: This DOES NOT CHANGE THE Active unit texture state NOR does it bind
   * the textures yet. This is merely for figuring out which texture units the
   * texture SHOULD be assigned to.
   */
  private assignTextureUnits(textures: Texture[]) {
    const needsUnit: Texture[] = [];
    const hasUnit: Texture[] = [];

    // First establish all textures that need a unit
    textures.forEach((texture) => {
      if (!texture.gl || texture.gl.textureUnit < 0) {
        needsUnit.push(texture);
      } else {
        hasUnit.push(texture);
      }
    });

    // We now first see if we have free units to statisfy the needs
    while (this._freeTextureUnits.length > 0 && needsUnit.length > 0) {
      const texture = needsUnit.shift();
      if (!texture) continue;

      const freeUnit = this._freeTextureUnits.shift();

      if (freeUnit === undefined) {
        needsUnit.unshift(texture);
        continue;
      }

      if (!texture.gl) {
        texture.gl = {
          textureId: null,
          textureUnit: freeUnit,
          proxy: this.glProxy,
        };
      } else {
        texture.gl.textureUnit = freeUnit;
      }

      hasUnit.push(texture);
    }

    // If nothing needs a unit still, then we can just exit now
    if (needsUnit.length <= 0) {
      return needsUnit;
    }

    // We now get any remaining texture that still needs a unit. We will claim
    // the unit of a texture using a unit but is NOT going to be used for the
    // next call. If there are no units available in this manner, then we are
    // officially using too many textures for the next draw call.
    debug(
      "WARNING: Too many textures in use are causing texture units to be swapped. Doing this occasionally is fine, but handling this on a frame loop can have serious performance concerns."
    );

    // Get a list of texture units in use but are not required for next draw
    // call
    const inUse = new Map<Texture, boolean>();

    this._textureUnitToTexture.forEach((texture) => {
      if (texture) {
        inUse.set(texture, false);
      }
    });

    hasUnit.forEach((texture) => {
      inUse.set(texture, true);
    });

    const canGiveUpUnit: Texture[] = [];

    inUse.forEach((isUsed, texture) => {
      if (!isUsed) canGiveUpUnit.push(texture);
    });

    // We should now have all textures able to give up their unit for the next
    // draw call
    if (canGiveUpUnit.length === 0) {
      console.warn(
        this.debugContext,
        "There are too many textures being used for a single draw call. These textures will not be utilized on the GPU",
        needsUnit
      );
      console.warn("Current GL State:", this);
      return needsUnit;
    }

    while (canGiveUpUnit.length > 0 && needsUnit.length > 0) {
      const texture = needsUnit.shift();
      if (!texture) continue;

      const freeUnit = canGiveUpUnit.shift();

      if (
        freeUnit === undefined ||
        !freeUnit.gl ||
        freeUnit.gl.textureUnit < 0
      ) {
        needsUnit.unshift(texture);
        continue;
      }

      if (!texture.gl) {
        texture.gl = {
          textureId: null,
          textureUnit: freeUnit.gl.textureUnit,
          proxy: this.glProxy,
        };
      } else {
        texture.gl.textureUnit = freeUnit.gl.textureUnit;
      }

      hasUnit.push(texture);
    }

    // If by some voodoo we still have not provided a unit for a texture needing
    // it, then we have a problem
    if (needsUnit.length > 0) {
      console.error(
        this.debugContext,
        "There are too many textures being used for a single draw call. These textures will not be utilized on the GPU",
        needsUnit
      );
      console.warn("Current GL State:", this);
    }

    return needsUnit;
  }

  /**
   * Applies the necessary value for a texture to be applied to a sampler
   * uniform.
   */
  private uploadTextureToUniform(
    location: WebGLUniformLocation,
    texture: Texture
  ) {
    if (texture.gl && texture.gl.textureUnit >= -1) {
      // Ensure the texture unit has this particular texture assigned to it
      if (this._textureUnitToTexture.get(texture.gl.textureUnit) !== texture) {
        this.setActiveTextureUnit(texture.gl.textureUnit);
        this.bindTexture(
          texture,
          GLSettings.Texture.TextureBindingTarget.TEXTURE_2D
        );
      }

      this.gl.uniform1i(
        location,
        textureUnitToIndex(this.gl, texture.gl.textureUnit)
      );
    } else {
      console.warn(
        this.debugContext,
        "Attempted to set a Texture Object to a uniform, but the Texture object did not have a valid texture unit.",
        texture
      );
    }
  }

  /**
   * This flags a texture as going to be used within the next upcoming draw call
   */
  willUseTextureUnit(
    texture: Texture,
    target: WebGLUniformLocation | RenderTarget
  ) {
    const textureTargets = this._textureWillBeUsed.get(texture);

    if (target instanceof RenderTarget) {
      if (!textureTargets) {
        this._textureWillBeUsed.set(texture, target);
      } else if (textureTargets instanceof RenderTarget) {
        if (textureTargets !== target) {
          console.warn(
            this.debugContext,
            "A Texture is attempting to be used by two different render targets in a single draw."
          );
        }
      }
    } else {
      if (!textureTargets) {
        this._textureWillBeUsed.set(texture, new Set([target]));
      } else {
        if (textureTargets instanceof RenderTarget) {
          console.warn(
            this.debugContext,
            "A texture in a single draw is attempting to attach to a uniform AND a render target which is invalid."
          );
        } else {
          textureTargets.add(target);
        }
      }
    }
  }

  /**
   * This method applies ALL of the state elements monitored and force sets them with WebGL calls
   * to make sure the GPU is in the same state as this state object.
   */
  syncState() {
    const gl = this.gl;

    if (this._blendingEnabled) {
      gl.enable(gl.BLEND);
    } else {
      gl.disable(gl.BLEND);
    }

    if (this._ditheringEnabled) {
      gl.enable(gl.DITHER);
    } else {
      gl.disable(gl.DITHER);
    }

    if (this._depthTestEnabled) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    if (this._scissorTestEnabled) {
      gl.enable(gl.SCISSOR_TEST);
    } else {
      gl.disable(gl.SCISSOR_TEST);
    }

    this.setActiveTextureUnit(this._activeTextureUnit);
    this.applyClearColor();
    this.applyCullFace();
    this.applyBlendFactors();
    this.applyBlendEquation();
    this.applyColorMask();
    this.applyDepthFunc();
    this.applyScissorBounds();
    this.applyViewport();
    gl.depthMask(this._depthMask);
  }

  /**
   * Applies the current clearColor to the gl state
   */
  private applyClearColor() {
    const gl = this.gl;

    gl.clearColor(
      this._clearColor[0],
      this._clearColor[1],
      this._clearColor[2],
      this._clearColor[3]
    );
  }

  /**
   * Applies the current depth function to the gl state
   */
  private applyDepthFunc() {
    const gl = this.gl;

    switch (this._depthFunc) {
      case GLSettings.Material.DepthFunctions.ALWAYS:
        gl.depthFunc(gl.ALWAYS);
        break;
      case GLSettings.Material.DepthFunctions.EQUAL:
        gl.depthFunc(gl.EQUAL);
        break;
      case GLSettings.Material.DepthFunctions.GREATER:
        gl.depthFunc(gl.GREATER);
        break;
      case GLSettings.Material.DepthFunctions.GREATER_OR_EQUAL:
        gl.depthFunc(gl.GEQUAL);
        break;
      case GLSettings.Material.DepthFunctions.LESS:
        gl.depthFunc(gl.LESS);
        break;
      case GLSettings.Material.DepthFunctions.LESS_OR_EQUAL:
        gl.depthFunc(gl.LEQUAL);
        break;
      case GLSettings.Material.DepthFunctions.NEVER:
        gl.depthFunc(gl.NEVER);
        break;
      case GLSettings.Material.DepthFunctions.NOTEQUAL:
        gl.depthFunc(gl.NOTEQUAL);
        break;

      default:
        gl.depthFunc(gl.ALWAYS);
        break;
    }
  }

  /**
   * Applies the current scissor bounds to the gl state
   */
  private applyScissorBounds() {
    this.gl.scissor(
      this._scissorBounds.x,
      this._scissorBounds.y,
      this._scissorBounds.width,
      this._scissorBounds.height
    );
  }

  /**
   * Applies the writing mask to the color buffer to the gl state.
   */
  private applyColorMask() {
    this.gl.colorMask(
      this.colorMask[0] || false,
      this.colorMask[1] || false,
      this.colorMask[2] || false,
      this.colorMask[3] || false
    );
  }

  /**
   * Applies the blending equations to the gl state
   */
  private applyBlendEquation() {
    const gl = this.gl;

    switch (this._blendEquation) {
      case GLSettings.Material.BlendingEquations.Add:
        gl.blendEquation(gl.FUNC_ADD);
        break;
      case GLSettings.Material.BlendingEquations.Subtract:
        gl.blendEquation(gl.FUNC_SUBTRACT);
        break;
      case GLSettings.Material.BlendingEquations.ReverseSubtract:
        gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);
        break;
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
      case GLSettings.Material.BlendingDstFactor.DstAlpha:
        dst = gl.BLEND_DST_ALPHA;
        break;
      case GLSettings.Material.BlendingDstFactor.DstColor:
        dst = gl.BLEND_DST_RGB;
        break;
      case GLSettings.Material.BlendingDstFactor.One:
        dst = gl.ONE;
        break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstAlpha:
        dst = gl.ONE_MINUS_DST_ALPHA;
        break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstColor:
        dst = gl.ONE_MINUS_DST_COLOR;
        break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcAlpha:
        dst = gl.ONE_MINUS_SRC_ALPHA;
        break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcColor:
        dst = gl.ONE_MINUS_SRC_COLOR;
        break;
      case GLSettings.Material.BlendingDstFactor.SrcAlpha:
        dst = gl.SRC_ALPHA;
        break;
      case GLSettings.Material.BlendingDstFactor.SrcColor:
        dst = gl.SRC_COLOR;
        break;
      case GLSettings.Material.BlendingDstFactor.Zero:
        dst = gl.ZERO;
        break;

      default:
        dst = gl.ONE;
        break;
    }

    switch (this._blendSrcFactor) {
      case GLSettings.Material.BlendingDstFactor.DstAlpha:
        src = gl.BLEND_DST_ALPHA;
        break;
      case GLSettings.Material.BlendingDstFactor.DstColor:
        src = gl.BLEND_DST_RGB;
        break;
      case GLSettings.Material.BlendingDstFactor.One:
        src = gl.ONE;
        break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstAlpha:
        src = gl.ONE_MINUS_DST_ALPHA;
        break;
      case GLSettings.Material.BlendingDstFactor.OneMinusDstColor:
        src = gl.ONE_MINUS_DST_COLOR;
        break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcAlpha:
        src = gl.ONE_MINUS_SRC_ALPHA;
        break;
      case GLSettings.Material.BlendingDstFactor.OneMinusSrcColor:
        src = gl.ONE_MINUS_SRC_COLOR;
        break;
      case GLSettings.Material.BlendingDstFactor.SrcAlpha:
        src = gl.SRC_ALPHA;
        break;
      case GLSettings.Material.BlendingDstFactor.SrcColor:
        src = gl.SRC_COLOR;
        break;
      case GLSettings.Material.BlendingDstFactor.Zero:
        src = gl.ZERO;
        break;
      case GLSettings.Material.BlendingSrcFactor.SrcAlphaSaturate:
        src = gl.SRC_ALPHA_SATURATE;
        break;

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

    if (this._cullFace === GLSettings.Material.CullSide.NONE) {
      gl.disable(gl.CULL_FACE);
      this._cullEnabled = false;
    } else {
      gl.enable(gl.CULL_FACE);
      this._cullEnabled = true;
    }

    switch (this._cullFace) {
      case GLSettings.Material.CullSide.CW:
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        break;
      case GLSettings.Material.CullSide.CCW:
        gl.frontFace(gl.CW);
        gl.cullFace(gl.BACK);
        break;
      case GLSettings.Material.CullSide.BOTH:
        gl.frontFace(gl.CW);
        gl.cullFace(gl.FRONT_AND_BACK);
        break;

      default:
        gl.disable(gl.CULL_FACE);
    }
  }

  /**
   * This applies the current viewport property to the gl context
   */
  private applyViewport() {
    this.gl.viewport(
      this._viewport.x,
      this._viewport.y,
      this._viewport.width,
      this._viewport.height
    );
  }
}
