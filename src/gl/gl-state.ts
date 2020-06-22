import { compare4, copy4, flatten4, Vec4 } from "../math/vector";
import { TypeVec } from "../types";
import { indexToTextureUnit, textureUnitToIndex } from "./gl-decode";
import { GLProxy } from "./gl-proxy";
import { GLSettings } from "./gl-settings";
import { Material } from "./material";
import { RenderTarget } from "./render-target";
import { Texture } from "./texture";
import {
  IExtensions,
  IMaterialUniform,
  MaterialUniformType,
  MaterialUniformValue,
  UseMaterialStatus
} from "./types";

const debug = require("debug")("performance");

/**
 * This class represents all of the current state and settings that the gl context is in currently. This
 * helps to decide when to make gl calls to alter the state and not do so unecessarily.
 *
 * This state focuses on global state settings like bound objects and gl settings. Other state
 * for the GL context is stored within objects that are generated, such as Texture and Attribute.
 */
export class GLState {
  /** Message to include with debug, warns, and errors */
  debugContext: string = "";
  /** The extensions enabled for the context */
  private extensions: IExtensions;
  /** Stores the gl context this is watching the state over */
  private gl: WebGLRenderingContext;
  /** This is a proxy to execute commands that do not change global gl state */
  private glProxy: GLProxy;
  /** Lookup a texture unit to it's current assigned texture. */
  private _textureUnitToTexture = new Map<number, Texture | null>();
  /** This holds which texture units are free for use and have no Texture assigned to them */
  private _freeUnits: number[] = [];

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
  private _boundFBO: WebGLFramebuffer | null = null;

  /**
   * This is the current render target who's FBO is bound. A null render target
   * indicates the target is the screen.
   */
  get renderTarget() {
    return this._renderTarget;
  }
  private _renderTarget: RenderTarget | null;

  /** The currently bound render buffer object. null if nothing bound. */
  get boundRBO() {
    return this._boundRBO;
  }
  private _boundRBO: WebGLRenderbuffer | null = null;

  /** The current id of the current bound vbo. If null, nothing is bound */
  get boundVBO() {
    return this._boundVBO;
  }
  private _boundVBO: WebGLBuffer | null = null;

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
    unit: -1
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
  private _scissorTestEnabled: boolean = false;

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
  };

  /** This is the texture unit currently active */
  get activeTextureUnit() {
    return this._activeTextureUnit;
  }
  private _activeTextureUnit: number = -1;

  /**
   * This contains all of the textures that are are needing to be utilized for next draw.
   * Textures are used by either uniforms or by RenderTargets in a single draw call. Thus
   * we track the uniforms or the render targets awaiting use of the texture.
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
      .filter(n => n !== undefined);
  }
  private _enabledVertexAttributeArray: number[] = [];
  private _willUseVertexAttributeArray: number[] = [];

  /** Tracks the current divisor set to a given vertex array location. */
  private _vertexAttributeArrayDivisor = new Map<number, number>();

  /**
   * Generate a new state manager and establish some initial state settings by querying the context.
   */
  constructor(gl: WebGLRenderingContext, extensions: IExtensions) {
    this.gl = gl;
    this.extensions = extensions;
    // Retrieve how many units are allowed at the same time to be assiged so we can initialize our free units array
    const totalUnits = this.gl.getParameter(
      gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS
    );

    for (let i = 0; i < totalUnits; ++i) {
      this._freeUnits.push(indexToTextureUnit(gl, i));
    }

    // Initialize state to valid value
    this._activeTextureUnit = gl.TEXTURE0;
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
  bindFBO(id: WebGLFramebuffer | null) {
    if (this._boundFBO !== id) {
      this._boundFBO = id;
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, id);
    }
  }

  /**
   * Sets the provided buffer identifier as the current bound item. This automatically
   * updates all stateful information to track that a texture is now utilizing a texture unit.
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
        unit: this._activeTextureUnit
      };

      switch (target) {
        case GLSettings.Texture.TextureBindingTarget.TEXTURE_2D:
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture.gl.textureId);
          break;

        case GLSettings.Texture.TextureBindingTarget.TEXTURE_2D:
          this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture.gl.textureId);
          break;
      }

      // Since the binding happened, we HAVE to track that this texture is now the texture
      // for the current active unit. We must also remove the unit from any texture previously
      // utilizing the unit
      const previous = this._textureUnitToTexture.get(this._activeTextureUnit);

      if (previous) {
        if (previous.gl) previous.gl.textureUnit = -1;
      }

      this._textureUnitToTexture.set(this._activeTextureUnit, texture);
      texture.gl.textureUnit = this._activeTextureUnit;
    }
  }

  /**
   * Flags an attribute array as going to be used. Any attribute array location
   * no longer in use will be disabled when applyVertexAttributeArrays is called.
   */
  willUseVertexAttributeArray(index: number) {
    // Flag the index as will be used
    this._willUseVertexAttributeArray[index] = index;
    // If already enabled we're done
    if (this._enabledVertexAttributeArray[index] !== undefined) return;
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

      if (index !== undefined) {
        if (this._willUseVertexAttributeArray[index] !== undefined) return;
        this.gl.disableVertexAttribArray(index);
        delete this._enabledVertexAttributeArray[index];
      }
    }

    // Reset the use array for next draw
    this._willUseVertexAttributeArray = [];
  }

  /**
   * Applies (if necessary) the divisor for a given array. This only works if the array location
   * is enabled.
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
   * This takes a texture and flags it's texture unit as freed if the texture has a used unit
   */
  freeTextureUnit(texture: Texture) {
    if (texture.gl) {
      if (texture.gl.textureUnit > -1) {
        this._freeUnits.unshift(texture.gl.textureUnit);
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
   * Sets the GPU proxy to be used to handle commands that call to the GPU but don't alter
   * global GL state.
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
    // We do the same for finding an ideal FBO to work with based on the current
    // render target
    const fbo = this.findMaterialFBO(material);

    // Last check to ensure we have determined the proper FBO to target for
    // rendering.
    if (fbo === void 0) {
      console.warn('Could NOT determine a FBO for the given material that would appropriately match with the current RenderTarget');
      return UseMaterialStatus.NO_RENDER_TARGET_MATCHES;
    }

    // Last check to make sure our process did find a program to run from the
    // material.
    if (programId === void 0) {
      console.warn('Could NOT determine a program for the given material that would appropriately match with the current RenderTarget');
      return UseMaterialStatus.NO_RENDER_TARGET_MATCHES;
    }

    // Use the appropriate FBO
    this.bindFBO(fbo);
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
    if (!this._renderTarget.gl) return;

    // If the program is defined already, then we simply return that program as
    // the program to use
    let programId: WebGLProgram | void = material.gl.programByTarget.get(this._renderTarget);
    if (programId !== void 0) return programId;

    // If we have not determined the most appropriate program for the provided
    // render target to material combination, then we need to analyze and figure
    // that out. The best match will be a program that has the most output types
    // that matches the current render target's output types.
    const allOutputs = new Set<number>();

    if (this._renderTarget) {

    }


    if (material.fragmentShader.length === 1 && ) {

    }

    if (Array.isArray(this._renderTarget.gl.colorBufferId)) {
      for (let i = 0, iMax = this._renderTarget.gl.colorBufferId.length; i < iMax; ++i) {
        const buffer = this._renderTarget.gl.colorBufferId[i];
        allOutputs.add(buffer.outputType);
      }


    }

    else {

    }

    return programId;
  }

  /**
   * This examines a given material to find the most appropriate FBO to bind
   * based on the current RenderTarget. This may resolve to the current render
   * target just fine, or it may discover a more streamlined FBO to utilize.
   */
  private findMaterialFBO(material: Material): WebGLFramebuffer | null | void {

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
      this._depthTestEnabled
        ? gl.enable(gl.DEPTH_TEST)
        : gl.disable(gl.DEPTH_TEST);
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
        this._blendDstFactor =
          material.blending.blendDst || this._blendDstFactor;
        this._blendSrcFactor =
          material.blending.blendSrc || this._blendSrcFactor;
        this._blendEquation =
          material.blending.blendEquation || this._blendEquation;
        this.applyBlendFactors();
      }
    } else {
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

    // Uniforms
    this._currentUniforms = material.uniforms;
    let success = true;

    if (!this._currentProgram) {
      return false;
    }

    // Now we can update and retrieve the locations for each uniform in the program
    Object.entries(material.uniforms).forEach(([name, uniform]) => {
      if (!this._currentProgram) return;
      if (!uniform.gl) uniform.gl = new Map();
      let glSettings = uniform.gl.get(this._currentProgram);

      // If no settings for the given program are present, then we must
      // query the program for the uniform's locations and what not.
      if (!glSettings) {
        const location = this.gl.getUniformLocation(this._currentProgram, name);

        if (!location) {
          console.warn(
            this.debugContext,
            `A Material specified a uniform ${name}, but none was found in the current program.`
          );
          success = false;
          return;
        }

        glSettings = {
          location
        };

        // Store the found location for the uniform
        uniform.gl.set(this._currentProgram, glSettings);
      }

      // After locations for the uniforms are established, we must now copy the uniform
      // info into the GPU
      this.uploadUniform(glSettings.location, uniform);
    });

    if (!success) {
      console.warn(material.vertexShader);
      console.warn(material.fragmentShader);
      return false;
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
   * Performs the upload operation of a uniform to the GL context
   */
  private uploadUniform(
    location: WebGLUniformLocation,
    uniform: IMaterialUniform<MaterialUniformType>
  ) {
    let v;

    switch (uniform.type) {
      case MaterialUniformType.FLOAT:
        v = uniform.value as MaterialUniformValue<MaterialUniformType.FLOAT>;
        this.gl.uniform1f(location, v);
        break;

      case MaterialUniformType.VEC2:
        v = uniform.value as MaterialUniformValue<MaterialUniformType.VEC2>;
        this.gl.uniform2f(location, v[0], v[1]);
        break;

      case MaterialUniformType.VEC3:
        v = uniform.value as MaterialUniformValue<MaterialUniformType.VEC3>;
        this.gl.uniform3f(location, v[0], v[1], v[2]);
        break;

      case MaterialUniformType.VEC4:
        v = uniform.value as MaterialUniformValue<MaterialUniformType.VEC4>;
        this.gl.uniform4f(location, v[0], v[1], v[2], v[3]);
        break;

      case MaterialUniformType.VEC4_ARRAY:
        v = uniform.value as MaterialUniformValue<
          MaterialUniformType.VEC4_ARRAY
        >;
        this.gl.uniform4fv(location, flatten4(v));
        break;

      case MaterialUniformType.MATRIX3x3:
        v = uniform.value as MaterialUniformValue<
          MaterialUniformType.MATRIX3x3
        >;
        this.gl.uniformMatrix3fv(location, false, v);
        break;

      case MaterialUniformType.MATRIX4x4:
        v = uniform.value as MaterialUniformValue<
          MaterialUniformType.MATRIX4x4
        >;
        this.gl.uniformMatrix4fv(location, false, v);
        break;

      case MaterialUniformType.TEXTURE:
        v = uniform.value as MaterialUniformValue<MaterialUniformType.TEXTURE>;
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
   * This will consume the values aggregated within willUseTextureUnit. All Texture objects
   * consumed will be assigned an active texture unit (if one was not already applied), then
   * the Texture will be compiled / updated as necessary and applied to all uniforms requiring
   * a Sampler unit.
   */
  applyUsedTextures() {
    // Assign texture units to the textures that will be used
    const failedTextures = this.assignTextureUnits(
      Array.from(this._textureWillBeUsed.keys())
    );

    // We apply the default unit to each texture that failed. Output will be made from the
    // previous method, so at this point, let's just try to make lemonade out of lemons (set
    // sane defaults)
    failedTextures.forEach(texture => {
      if (texture.gl) {
        texture.gl.textureUnit = this.gl.TEXTURE0;
      } else {
        texture.gl = {
          textureId: null,
          textureUnit: this.gl.TEXTURE0,
          proxy: this.glProxy
        };
      }
    });

    // Let's sort out which textures are affiliated with a RenderTarget or with a uniform set.
    const textureToUniforms = new Map<Texture, Set<WebGLUniformLocation>>();
    const renderTargets = new Set<RenderTarget>();

    this._textureWillBeUsed.forEach((targets, texture) => {
      if (targets instanceof RenderTarget) {
        renderTargets.add(targets);
      } else {
        textureToUniforms.set(texture, targets);
      }
    });

    // Now our list of render targets is guaranteed to have their textures set with an active texture unit,
    // so we can now officially ensure the render target is compiled.
    renderTargets.forEach(target => {
      const textures = target.getTextures();
      const failed = textures.some(texture => {
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

    // Now that all of our textures have units, we loop through each texture and have them
    // compiled and/or updated then upload the unit to the appropriate uniforms indicated.
    textureToUniforms.forEach((uniforms, texture) => {
      // Only compile and process successful texture units
      if (failedTextures.indexOf(texture) < 0) {
        this.glProxy.updateTexture(texture);

        uniforms.forEach(uniform => {
          this.uploadTextureToUniform(uniform, texture);
        });
      }

      // Failed textures get their uniforms filled with the default 0 texture unit
      else {
        uniforms.forEach(uniform => {
          this.gl.uniform1i(uniform, textureUnitToIndex(this.gl, 0));
        });
      }
    });

    // We used the textures! This is no longer needed
    this._textureWillBeUsed.clear();

    return true;
  }

  /**
   * Attempts to assign free or freed texture units to the provided texture objects.
   * This will return a list of textures
   */
  private assignTextureUnits(textures: Texture[]) {
    const needsUnit: Texture[] = [];
    const hasUnit: Texture[] = [];

    // First establish all textures that need a unit
    textures.forEach(texture => {
      if (!texture.gl || texture.gl.textureUnit < 0) {
        needsUnit.push(texture);
      } else {
        hasUnit.push(texture);
      }
    });

    // We now first see if we have free units to statisfy the needs
    while (this._freeUnits.length > 0 && needsUnit.length > 0) {
      const texture = needsUnit.shift();
      if (!texture) continue;

      const freeUnit = this._freeUnits.shift();

      if (freeUnit === undefined) {
        needsUnit.unshift(texture);
        continue;
      }

      if (!texture.gl) {
        texture.gl = {
          textureId: null,
          textureUnit: freeUnit,
          proxy: this.glProxy
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

    // We now get any remaining texture that still needs a unit. We will claim the unit
    // of a texture using a unit but is NOT going to be used for the next call.
    // If there are no units available in this manner, then we are officially using too many
    // textures for the next draw call.
    debug(
      "WARNING: Too many textures in use are causing texture units to be swapped. Doing this occasionally is fine, but handling this on a frame loop can have serious performance concerns."
    );

    // Get a list of texture units in use but are not required for next draw call
    const inUse = new Map<Texture, boolean>();

    this._textureUnitToTexture.forEach(texture => {
      if (texture) {
        inUse.set(texture, false);
      }
    });

    hasUnit.forEach(texture => {
      inUse.set(texture, true);
    });

    const canGiveUpUnit: Texture[] = [];

    inUse.forEach((isUsed, texture) => {
      if (!isUsed) canGiveUpUnit.push(texture);
    });

    // We should now have all textures able to give up their unit for the next draw call
    if (canGiveUpUnit.length === 0) {
      console.warn(
        this.debugContext,
        "There are too many textures being used for a single draw call. These textures will not be utilized on the GPU",
        needsUnit
      );
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
          proxy: this.glProxy
        };
      } else {
        texture.gl.textureUnit = freeUnit.gl.textureUnit;
      }

      hasUnit.push(texture);
    }

    // If by some voodoo we still have not provided a unit for a texture needing it, then we have a problem
    if (needsUnit.length > 0) {
      console.warn(
        this.debugContext,
        "There are too many textures being used for a single draw call. These textures will not be utilized on the GPU",
        needsUnit
      );
    }

    return needsUnit;
  }

  /**
   * Applies the necessary value for a texture to be applied to a sampler uniform.
   */
  private uploadTextureToUniform(
    location: WebGLUniformLocation,
    texture: Texture
  ) {
    if (texture.gl && texture.gl.textureUnit >= 0) {
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
    const uniforms = this._textureWillBeUsed.get(texture);

    if (target instanceof RenderTarget) {
      if (!uniforms) {
        this._textureWillBeUsed.set(texture, target);
      } else if (uniforms instanceof RenderTarget) {
        if (uniforms !== target) {
          console.warn(
            this.debugContext,
            "A Texture is attempting to be used by two different render targets in a single draw."
          );
        }
      }
    } else {
      if (!uniforms) {
        this._textureWillBeUsed.set(texture, new Set([target]));
      } else {
        if (uniforms instanceof RenderTarget) {
          console.warn(
            this.debugContext,
            "A texture in a single draw is attempting to attach to a uniform AND a render target which is invalid."
          );
        } else {
          uniforms.add(target);
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

    this._blendingEnabled ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND);
    this._ditheringEnabled ? gl.enable(gl.DITHER) : gl.disable(gl.DITHER);
    this._depthTestEnabled
      ? gl.enable(gl.DEPTH_TEST)
      : gl.disable(gl.DEPTH_TEST);
    this._scissorTestEnabled
      ? gl.enable(gl.SCISSOR_TEST)
      : gl.disable(gl.SCISSOR_TEST);
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

    if (this._cullFace !== GLSettings.Material.CullSide.NONE) {
      gl.enable(gl.CULL_FACE);
    }

    switch (this._cullFace) {
      case GLSettings.Material.CullSide.CW:
        gl.frontFace(gl.CW);
        gl.cullFace(gl.FRONT);
        break;
      case GLSettings.Material.CullSide.CCW:
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.FRONT);
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
