import Debug from "debug";

import { isString } from "../types.js";
import { isDefined } from "../util/common-filters.js";
import { Attribute } from "./attribute.js";
import { ColorBuffer } from "./color-buffer.js";
import { Geometry } from "./geometry.js";
import {
  colorBufferFormat,
  depthBufferFormat,
  drawMode,
  indexToColorAttachment,
  inputImageFormat,
  magFilter,
  minFilter,
  stencilBufferFormat,
  texelFormat,
  wrapMode,
} from "./gl-decode.js";
import { GLSettings } from "./gl-settings.js";
import { GLState } from "./gl-state.js";
import type { IndexBuffer } from "./index-buffer.js";
import { Material } from "./material.js";
import { Model } from "./model.js";
import { RenderTarget } from "./render-target.js";
import { Texture } from "./texture.js";
import { GLContext, IExtensions } from "./types.js";
import type { UniformBuffer } from "./uniform-buffer.js";
import { WebGLStat } from "./webgl-stat.js";

const debug = Debug("performance");

/**
 * Type guard to see if a textire object's data is a buffer.
 */
function isDataBuffer(
  val: any
): val is { width: number; height: number; buffer: ArrayBufferView | null } {
  return (
    (val &&
      val.buffer &&
      val.buffer.byteOffset !== undefined &&
      val.buffer.byteLength) ||
    val.buffer === null
  );
}

/**
 * Tests if a value is a power of 2
 */
function isPowerOf2(val: number) {
  return (val & (val - 1)) === 0;
}

/**
 * This determines if a texture object is ready for use meaning
 * it's compiled and has a current active texture unit.
 */
function isTextureReady(texture: Texture): texture is Texture & {
  gl: { textureId: WebGLTexture; textureUnit: number };
} {
  return Boolean(
    texture.gl && texture.gl.textureId && texture.gl.textureUnit > -1
  );
}

/**
 * This is where all objects go to be processed and updated with webgl calls. Such as textures, geometries, etc
 */
export class GLProxy {
  /** Message to include with debugging statements, warnings and errors */
  debugContext = "";
  /** This is the gl context we're manipulating. */
  gl: GLContext;
  /** This is the state tracker of the GL context */
  state: GLState;
  /** These are the extensions established for the context */
  extensions: IExtensions;

  /**
   * Store all of the compiled shaders based on the string text of the
   * shader so we never duplicate a shader program.
   */
  private fragmentShaders = new Map<string, WebGLShader>();
  /**
   * Store all of the compiled shaders based on the string text of the
   * shader so we never duplicate a shader program.
   */
  private vertexShaders = new Map<string, WebGLShader>();
  /**
   * Make a look up for existing programs based on shader objects.
   */
  private programs = new Map<
    WebGLShader,
    Map<WebGLShader, { useCount: number; program: WebGLProgram }>
  >();

  constructor(gl: GLContext, state: GLState, extensions: IExtensions) {
    this.gl = gl;
    this.state = state;
    this.extensions = extensions;
  }

  /**
   * This enables the desired and supported extensions this framework utilizes.
   */
  static addExtensions(gl: GLContext): IExtensions {
    const instancing = gl.getExtension("ANGLE_instanced_arrays");
    const mrt = gl.getExtension("WEBGL_draw_buffers");
    const floatTex = gl.getExtension("OES_texture_float");
    const floatTexFilterLinear = gl.getExtension("OES_texture_float_linear");
    const halfFloatTex = gl.getExtension("OES_texture_half_float");
    const halfFloatTexFilterLinear = gl.getExtension(
      "OES_texture_half_float_linear"
    );
    const anisotropicFiltering = gl.getExtension(
      "EXT_texture_filter_anisotropic"
    );
    const renderFloatTexture = gl.getExtension("EXT_color_buffer_float");
    const vao = gl.getExtension("OES_vertex_array_object");
    const floatRenderTarget = gl.getExtension("EXT_color_buffer_float");
    const halfFloatRenderTarget = gl.getExtension(
      "EXT_color_buffer_half_float"
    );

    const anisotropicStats = {
      maxAnistropicFilter: 0,
    };

    // This exists as an extension or as a webgl2 context
    if (!instancing && !(gl instanceof WebGL2RenderingContext)) {
      debug(
        "This device does not have hardware instancing. All buffering strategies will be utilizing compatibility modes."
      );
    }

    // This exists as an extension or as a webgl2 context
    if (!mrt && !(gl instanceof WebGL2RenderingContext)) {
      debug(
        "This device does not have hardware multi-render target capabilities. The system will have to fallback to multiple render passes to multiple FBOs to achieve the same result."
      );
    }

    // This only exists as an extension
    if (!anisotropicFiltering) {
      debug(
        "This device does not have hardware anisotropic filtering for textures. This property will be ignored when setting texture settings."
      );
    } else {
      anisotropicStats.maxAnistropicFilter = gl.getParameter(
        anisotropicFiltering.MAX_TEXTURE_MAX_ANISOTROPY_EXT
      );
    }

    if (!vao && !(gl instanceof WebGL2RenderingContext)) {
      debug(
        "This device does not support Vertex Array Objects. This could cause performance issues for high numbers of draw calls."
      );
    }

    return {
      instancing:
        (gl instanceof WebGL2RenderingContext ? gl : instancing) ?? void 0,
      drawBuffers: (gl instanceof WebGL2RenderingContext ? gl : mrt) ?? void 0,
      anisotropicFiltering: anisotropicFiltering
        ? {
            ext: anisotropicFiltering,
            stat: anisotropicStats,
          }
        : void 0,
      renderFloatTexture: renderFloatTexture ?? void 0,
      floatTex:
        (gl instanceof WebGL2RenderingContext ? gl : floatTex) ?? void 0,
      floatTexFilterLinear:
        (gl instanceof WebGL2RenderingContext ? gl : floatTexFilterLinear) ??
        void 0,
      halfFloatTex:
        (gl instanceof WebGL2RenderingContext ? gl : halfFloatTex) ?? void 0,
      halfFloatTexFilterLinear:
        (gl instanceof WebGL2RenderingContext
          ? gl
          : halfFloatTexFilterLinear) ?? void 0,
      vao: (gl instanceof WebGL2RenderingContext ? gl : vao) ?? void 0,
      floatRenderTarget: floatRenderTarget ?? void 0,
      halfFloatRenderTarget: halfFloatRenderTarget ?? void 0,
    };
  }
  /**
   * Clears the specified buffers
   */
  clear(color?: boolean, depth?: boolean, stencil?: boolean) {
    let mask = 0;

    if (color) mask = mask | this.gl.COLOR_BUFFER_BIT;
    if (depth) mask = mask | this.gl.DEPTH_BUFFER_BIT;
    if (stencil) mask = mask | this.gl.STENCIL_BUFFER_BIT;

    this.gl.clear(mask);
  }

  /**
   * Takes an Attribute object and ensures it's buffer is created and
   * initialized.
   */
  compileAttribute(attribute: Attribute) {
    if (attribute.gl) return true;

    const gl = this.gl;
    const buffer = gl.createBuffer();

    if (!buffer) {
      console.warn(
        this.debugContext,
        "Could bot create WebGLBuffer. Printing any existing gl errors:"
      );
      this.printError();

      return false;
    }

    // State change
    this.state.bindVBO(buffer);

    // Upload the data to the GPU
    gl.bufferData(
      gl.ARRAY_BUFFER,
      attribute.data,
      attribute.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
    );

    attribute.gl = {
      bufferId: buffer,
      proxy: this,
    };

    // Indicate the attribute is updated to it's latest needs and concerns
    attribute.resolve();

    return true;
  }

  /**
   * Takes an IndexBuffer object and ensures it's buffer is created and
   * initialized.
   */
  compileIndexBuffer(indexBuffer: IndexBuffer) {
    if (indexBuffer.gl) return;

    const gl = this.gl;
    const buffer = gl.createBuffer();

    if (!buffer) {
      console.warn(
        this.debugContext,
        "Could not create WebGLBuffer. Printing any existing gl errors:"
      );
      this.printError();
      return;
    }

    // State change
    this.state.bindElementArrayBuffer(buffer);

    // Upload the data to the GPU
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      indexBuffer.data,
      indexBuffer.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
    );

    indexBuffer.gl = {
      bufferId: buffer,
      indexType:
        indexBuffer.data instanceof Uint8Array
          ? gl.UNSIGNED_BYTE
          : indexBuffer.data instanceof Uint16Array
          ? gl.UNSIGNED_SHORT
          : gl.UNSIGNED_INT,
      proxy: this,
    };

    // Ensure the buffer is resolved as it's for sure updated with the GPU at
    // this point.
    indexBuffer.resolve();

    return true;
  }

  /**
   * Takes a geometry object and ensures all of it's buffers are generated
   */
  compileGeometry(geometry: Geometry) {
    // If the geometry's gl context is made, it is already compiled.
    if (geometry.gl) return;
    let success = true;

    // Make our geometry gl context
    geometry.gl = {
      proxy: this,
    };

    // If we have the ability to have a vao, let's use this moment to fully
    // establish it for this geometry
    if (this.extensions.vao) {
      let vao: WebGLVertexArrayObject | null;

      if (this.extensions.vao instanceof WebGL2RenderingContext) {
        vao = this.extensions.vao.createVertexArray();
      } else {
        vao = this.extensions.vao.createVertexArrayOES();
      }

      // If the vao can not be created, let's just harmlessly skip making it
      // happen
      if (vao) {
        this.state.disableVertexAttributeArray();
        this.state.bindVAO(vao);

        // Bind and incclude all attributes
        geometry.attributes.forEach((attribute, name) => {
          if (this.updateAttribute(attribute)) {
            this.useAttribute(name, attribute, geometry);
          }
        });

        // Bind and include the index buffer
        if (geometry.indexBuffer) {
          if (this.updateIndexBuffer(geometry.indexBuffer)) {
            this.useIndexBuffer(geometry.indexBuffer);
          }
        }

        geometry.gl.vao = vao;
        this.state.bindVAO(null);
      } else {
        debug(
          "WARNING: Could not make VAO for Geometry. This is fine, but this could cause a hit on performance."
        );
      }
    } else {
      // Loop through each attribute of the geometry
      geometry.attributes.forEach((attribute) => {
        success = Boolean(this.compileAttribute(attribute) && success);
      });
    }

    return success;
  }

  /**
   * This creates the shaders and programs needed to create a material.
   */
  compileMaterial(material: Material) {
    // If the gl object exists, then this is considered finished
    if (material.gl) return;

    // Check for existing vertex shader object FIRST. Vertex shaders are common
    // across all fragment shader outputs for our MRT structure.
    let vs = this.vertexShaders.get(material.vertexShader) || null;

    // If none exists, then compile
    if (!vs) {
      vs = this.gl.createShader(this.gl.VERTEX_SHADER);

      if (!vs) {
        console.warn(
          this.debugContext,
          "Could not create a Vertex WebGLShader. Printing GL Errors:"
        );
        this.printError();
        return;
      }

      this.gl.shaderSource(vs, material.vertexShader);
      this.gl.compileShader(vs);

      if (this.gl.isContextLost()) {
        console.warn("Context was lost during compilation");
      }

      if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) {
        console.error(
          this.debugContext,
          "VERTEX SHADER COMPILER ERROR",
          material.name
        );
        console.warn(
          "Could not compile provided shader. Printing logs and errors:"
        );
        console.warn(this.lineFormatShader(material.vertexShader));
        console.warn("LOGS:");
        console.warn(this.gl.getShaderInfoLog(vs));
        this.printError();
        this.gl.deleteShader(vs);

        return;
      }
    }

    // Retrieve the Programs available for this vertex shader
    let vertexPrograms = this.programs.get(vs);

    if (!vertexPrograms) {
      vertexPrograms = new Map();
      this.programs.set(vs, vertexPrograms);
    }

    const materialGL: Material["gl"] = {
      vsId: vs,
      fsId: [],
      programId: [],
      proxy: this,
      programByTarget: new WeakMap(),
      outputsByProgram: new WeakMap(),
    };

    // We use this to aggregate all uniforms across all programs generated to
    // analyze if we are missing uniforms or need to strip out uniforms
    const usedUniforms = new Set<string>();

    if (!material.fragmentShader) {
      console.warn(
        "A material appears to not have it's fragment shader configuration set."
      );
      return false;
    }

    // We must loop through all of the fragment shaders the material can
    // provide. Each fragment shader is designed for specific outputs to match a
    // render target's configuration.
    material.fragmentShader.forEach((fragmentShader) => {
      if (!vertexPrograms || !vs) return;

      // Check for existing shader programs for the fragment shader
      let fs = this.fragmentShaders.get(fragmentShader.source) || null;

      // If none exists, then we create and compile the fragments shader
      if (!fs) {
        fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        if (!fs) {
          console.warn(
            this.debugContext,
            "Could not create a Fragment WebGLShader. Printing GL Errors:"
          );
          this.printError();
          return;
        }

        this.gl.shaderSource(fs, fragmentShader.source);
        this.gl.compileShader(fs);

        if (this.gl.isContextLost()) {
          console.warn("Context was lost during compilation");
        }

        if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
          console.error(
            this.debugContext,
            "FRAGMENT SHADER COMPILER ERROR:",
            material.name
          );
          console.warn(
            "Could not compile provided shader. Printing logs and errors:"
          );
          console.warn(this.lineFormatShader(fragmentShader.source));
          console.warn("LOGS:");
          console.warn(this.gl.getShaderInfoLog(fs));
          this.printError();
          this.gl.deleteShader(fs);

          return;
        }
      }

      // Get the use metrics for the program the vs and fs shader create
      let useMetrics = vertexPrograms.get(fs) || null;

      // No use metrics yet means we must generate the program
      if (!useMetrics) {
        const program = this.gl.createProgram();

        if (!program) {
          console.warn(
            this.debugContext,
            "Could not create a WebGLProgram. Printing GL Errors:"
          );
          this.printError();

          return;
        }

        useMetrics = {
          useCount: 1,
          program,
        };

        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);

        // Make the shaders operate together
        this.gl.linkProgram(program);
        this.gl.validateProgram(program);

        if (
          !this.gl.getProgramParameter(program, this.gl.LINK_STATUS) ||
          !this.gl.getProgramParameter(program, this.gl.VALIDATE_STATUS)
        ) {
          const info = this.gl.getProgramInfoLog(program);
          console.warn(
            this.debugContext,
            "Could not compile WebGL program. \n\n",
            info
          );
          this.printError();
          this.gl.deleteProgram(program);

          return;
        }

        vertexPrograms.set(fs, useMetrics);
      }

      // Existing use metrics simply means: we have a program for the vs and fs
      // shader combo, so simply incremenet it's use count.
      else {
        useMetrics.useCount++;
      }

      // Establish the gl context info that makes this material tick.
      materialGL.fsId?.push({
        id: fs,
        outputTypes: fragmentShader.outputTypes,
      });
      materialGL.programId?.push({
        id: useMetrics.program,
        outputTypes: fragmentShader.outputTypes,
      });
      materialGL.outputsByProgram.set(
        useMetrics.program,
        fragmentShader.outputTypes
      );

      // Switch to the program so we can aggregate all of the uniforms the
      // program will utilize.
      this.state.useProgram(useMetrics.program);
      // Get the current program applied to our state
      const program = this.state.currentProgram;
      if (!program) return false;

      // Get the total uniforms requested by the program so we can loop through them
      const totalProgramUniforms = this.gl.getProgramParameter(
        program,
        this.gl.ACTIVE_UNIFORMS
      );

      for (let i = 0; i < totalProgramUniforms; i++) {
        const uniformInfo = this.gl.getActiveUniform(program, i);

        if (uniformInfo) {
          // Special case for arrays where gl reports the name back with an
          // array index appended
          usedUniforms.add(uniformInfo.name.replace("[0]", ""));
        }
      }

      return;
    });

    // Set the generated GL identifiers to our material
    material.gl = materialGL;

    // Let's get a list of all uniforms the shaders are demanding and make sure
    // the material is supplying them. If not, then the shader will not have all
    // of the information it may need and thus would be considered invalid
    // rendering.

    // We now delete any uniforms that are not matched between material and
    // program as they are not needed and will just be lingering unused clutter.
    const uniformToRemove = new Set<string>();

    Object.keys(material.uniforms).forEach((name) => {
      if (!usedUniforms.has(name)) {
        uniformToRemove.add(name);
      }
    });

    uniformToRemove.forEach((name) => {
      delete material.uniforms[name];
    });

    // Now we validate we have all of the uniforms the program requested
    if (Object.keys(material.uniforms).length !== usedUniforms.size) {
      console.warn(
        this.debugContext,
        "A program is requesting a set of uniforms:",
        Array.from(usedUniforms.values()),
        "but our material only provides",
        Object.keys(material.uniforms),
        "thus the expected rendering will be considered invalid."
      );

      return false;
    }

    return true;
  }

  /**
   * Generates and uploads a uniform buffer to the GPU
   */
  compileUniformBuffer(uniformBuffer: UniformBuffer) {
    if (uniformBuffer.gl) return true;

    // const gl = this.gl;
    // const buffer = gl.createBuffer();
  }

  /**
   * This does what is needed to generate a GPU FBO that we can utilize as a render target
   * for subsequent draw calls.
   */
  compileRenderTarget(target: RenderTarget) {
    // Do not attempt recompiles and spewing out errors.
    if (target.isInvalid) return false;
    // If the gl target exists, then this is considered to be compiled already
    if (target.gl) return true;

    // We will now create the frame buffer and render buffers and targets necessary
    // to make this render target work.
    const gl = this.gl;
    const fbo = gl.createFramebuffer();

    if (!fbo) {
      console.warn(
        this.debugContext,
        "Could not generate a frame buffer object. Printing GL errors:"
      );
      this.printError();
      return false;
    }

    // Change state
    this.state.bindFBO(fbo);

    // Generate the context to be attached to the render target
    const glContext: RenderTarget["gl"] = {
      fboId: fbo,
      proxy: this,
      fboByMaterial: new WeakMap(),
      outputTypeToAttachment: new Map(),
    };

    // Color buffer
    if (Array.isArray(target.buffers.color)) {
      // Ensure MRT is enabled for this hardware. If it is not, we should not
      // allow this branch to continue
      if (!this.extensions.drawBuffers) {
        console.warn(
          "Attempted to manage a render target with MRT but the hardware does not support MRT. Use multiple render targets instead."
        );
        return false;
      }

      const buffers: {
        data: WebGLRenderbuffer | Texture;
        outputType: number;
        attachment: number;
      }[] = [];
      let isReady = true;
      glContext.colorBufferId = buffers;
      const isSingleBuffer = target.buffers.color.length <= 1;

      target.buffers.color.forEach((buffer, i) => {
        if (!isReady) return;
        if (buffer.buffer instanceof Texture) {
          const bufferAttachment = indexToColorAttachment(
            gl,
            this.extensions,
            i,
            isSingleBuffer,
            false
          );
          buffers.push({
            data: buffer.buffer,
            outputType: buffer.outputType,
            attachment: bufferAttachment,
          });
          glContext.outputTypeToAttachment.set(
            buffer.outputType,
            bufferAttachment
          );

          if (isTextureReady(buffer.buffer)) {
            gl.framebufferTexture2D(
              gl.FRAMEBUFFER,
              bufferAttachment,
              gl.TEXTURE_2D,
              buffer.buffer.gl.textureId,
              0
            );
          } else {
            console.warn(
              this.debugContext,
              "Attempted to compile render target whose target texture was not ready for use."
            );
            isReady = false;
          }
        } else {
          const rboId =
            buffer.buffer.gl?.bufferId ??
            this.compileColorBuffer(
              buffer.buffer,
              target.width,
              target.height,
              buffer.buffer.multiSample
            );

          if (rboId) {
            const bufferAttachment = indexToColorAttachment(
              gl,
              this.extensions,
              i,
              isSingleBuffer,
              false
            );
            buffers.push({
              data: rboId,
              outputType: buffer.outputType,
              attachment: bufferAttachment,
            });
            glContext.outputTypeToAttachment.set(
              buffer.outputType,
              bufferAttachment
            );
            gl.framebufferRenderbuffer(
              gl.FRAMEBUFFER,
              bufferAttachment,
              gl.RENDERBUFFER,
              rboId
            );
          }
        }
      });

      if (!isReady) {
        return false;
      }
    } else if (target.buffers.color !== undefined) {
      const buffer = target.buffers.color;

      if (buffer.buffer instanceof Texture) {
        const bufferAttachment = indexToColorAttachment(
          gl,
          this.extensions,
          0,
          true,
          false
        );
        glContext.colorBufferId = {
          data: buffer.buffer,
          outputType: buffer.outputType,
          attachment: bufferAttachment,
        };
        glContext.outputTypeToAttachment.set(
          buffer.outputType,
          bufferAttachment
        );

        if (isTextureReady(buffer.buffer)) {
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            bufferAttachment,
            gl.TEXTURE_2D,
            buffer.buffer.gl.textureId,
            0
          );
        } else {
          console.warn(
            this.debugContext,
            "Attempted to compile render target whose target texture was not ready for use."
          );
          return false;
        }
      } else {
        const rboId =
          buffer.buffer.gl?.bufferId ??
          this.compileColorBuffer(
            buffer.buffer,
            target.width,
            target.height,
            buffer.buffer.multiSample
          );

        if (rboId) {
          const bufferAttachment = indexToColorAttachment(
            gl,
            this.extensions,
            0,
            true,
            false
          );
          glContext.colorBufferId = {
            data: rboId,
            outputType: buffer.outputType,
            attachment: bufferAttachment,
          };
          glContext.outputTypeToAttachment.set(
            buffer.outputType,
            bufferAttachment
          );
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            bufferAttachment,
            gl.RENDERBUFFER,
            rboId
          );
        }
      }
    }

    // Depth buffer
    if (target.buffers.depth !== undefined) {
      const buffer = target.buffers.depth;

      if (buffer instanceof Texture) {
        glContext.depthBufferId = buffer;

        if (isTextureReady(buffer)) {
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            buffer.gl.textureId,
            0
          );
        }
      } else if (buffer instanceof ColorBuffer) {
        const rboId = this.compileDepthBuffer(
          buffer,
          target.width,
          target.height,
          buffer.multiSample
        );

        if (rboId) {
          glContext.depthBufferId = rboId;
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            rboId
          );
        }
      } else {
        const rboId = this.compileDepthBuffer(
          buffer,
          target.width,
          target.height,
          0
        );

        if (rboId) {
          glContext.depthBufferId = rboId;
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            rboId
          );
        }
      }
    }

    // Stencil buffer
    if (target.buffers.stencil !== undefined) {
      const buffer = target.buffers.stencil;

      if (buffer instanceof Texture) {
        glContext.stencilBufferId = buffer;

        if (isTextureReady(buffer)) {
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.STENCIL_ATTACHMENT,
            gl.TEXTURE_2D,
            buffer.gl.textureId,
            0
          );
        }
      } else {
        const rboId = this.compileStencilBuffer(
          buffer,
          target.width,
          target.height
        );

        if (rboId) {
          glContext.stencilBufferId = rboId;
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.STENCIL_ATTACHMENT,
            gl.RENDERBUFFER,
            rboId
          );
        }
      }
    }

    // Store the generated information in the target
    target.gl = glContext;

    // Check framebuffer for success
    const frameBufferCheckResult = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    let unidentifiedResult = false;
    let stillUnidentifiedResult = false;
    let message = "";

    switch (frameBufferCheckResult) {
      case gl.FRAMEBUFFER_COMPLETE:
        target.setAsValid();
        break;

      case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        message = "FRAMEBUFFER_INCOMPLETE_ATTACHMENT";
        break;

      case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        message = "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";
        break;

      case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        message = "FRAMEBUFFER_INCOMPLETE_DIMENSIONS";
        break;

      case gl.FRAMEBUFFER_UNSUPPORTED:
        message = "FRAMEBUFFER_UNSUPPORTED";
        break;

      default:
        unidentifiedResult = true;
        break;
    }

    // WebGL 2 specific checks
    if (gl instanceof WebGL2RenderingContext) {
      switch (frameBufferCheckResult) {
        case gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
          message = "FRAMEBUFFER_INCOMPLETE_MULTISAMPLE";
          break;

        case gl.RENDERBUFFER_SAMPLES:
          message = "RENDERBUFFER_SAMPLES";
          break;

        default:
          stillUnidentifiedResult = true;
          break;
      }
    }

    if (unidentifiedResult && stillUnidentifiedResult) {
      console.warn(
        this.debugContext,
        "A framebuffer check failed to return a known result. This FBO for render target will be assumed failed"
      );
      console.warn("Result:", frameBufferCheckResult, "Render Target:", target);
      message = "UNKNOWN";
    }

    if (message) {
      console.warn(
        this.debugContext,
        "When creating a new FrameBuffer Object, the check on the framebuffer failed. Printing Errors:"
      );
      console.warn(message);
      this.printError();
      console.warn("FAILED RENDER TARGET:", target);
      delete target.gl;
      target.isInvalid = true;

      return false;
    }

    // Make sure any blitting requirements are compiled as well. We do this
    // AFTER complete verification of the RenderTarget as the blit buffer has an
    // FBO change that needs to be verified.
    if (!this.compileBlitTargets(target)) {
      return false;
    }

    return true;
  }

  /**
   * After the render targets have been compiled, we need to check to see if any
   * of those targets are flagged for blitting. If so, we need to make sure the
   * blit targets are prepared for use by establishing their own framebuffers as
   * necessary.
   */
  private compileBlitTargets(target: RenderTarget) {
    const gl = this.gl;
    // If there is no blit target, there is nothing to do
    if (!target.buffers.blit) return;
    // If the blit FBO already exists, there is nothing to do
    if (!target.gl || target.gl?.blitFboId) return;

    // Create the blit FBO
    const blitFboId = gl.createFramebuffer();
    // Get the blit buffer attachment points
    const outputTypeToAttachment = target.gl.outputTypeToAttachment;

    if (!blitFboId) {
      console.warn(this.debugContext, "Could not create blit FBO");
      return;
    }

    // Bind the blit FBO
    this.state.bindFBO(blitFboId);

    // Make sure the blit texture referenced is valid
    if (target.buffers.blit?.color) {
      if (Array.isArray(target.buffers.blit.color)) {
        target.buffers.blit.color.forEach((buffer) => {
          const attachment = outputTypeToAttachment.get(buffer.outputType);
          if (attachment === void 0) {
            console.warn(
              "A blit output could not be mapped to an attachment point."
            );
            return;
          }

          if (buffer.buffer instanceof Texture) {
            if (isTextureReady(buffer.buffer)) {
              gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                attachment,
                gl.TEXTURE_2D,
                buffer.buffer.gl.textureId,
                0
              );
            } else {
              console.warn(
                this.debugContext,
                "Attempted to compile render target whose target blit texture was not ready for use."
              );
              return false;
            }
          } else {
            const rboId = this.compileColorBuffer(
              buffer.buffer,
              target.width,
              target.height,
              0
            );

            if (rboId) {
              gl.framebufferRenderbuffer(
                gl.FRAMEBUFFER,
                attachment,
                gl.RENDERBUFFER,
                rboId
              );
            }
          }
        });
      } else {
        const buffer = target.buffers.blit.color;
        const attachment = outputTypeToAttachment.get(buffer.outputType);
        if (attachment === void 0) {
          console.warn(
            "A blit output could not be mapped to an attachment point."
          );
          return;
        }
        if (buffer.buffer instanceof Texture) {
          if (isTextureReady(buffer.buffer)) {
            gl.framebufferTexture2D(
              gl.FRAMEBUFFER,
              attachment,
              gl.TEXTURE_2D,
              buffer.buffer.gl.textureId,
              0
            );
          } else {
            console.warn(
              this.debugContext,
              "Attempted to compile render target whose target blit texture was not ready for use."
            );
            return false;
          }
        } else {
          const rboId = this.compileColorBuffer(
            buffer.buffer,
            target.width,
            target.height,
            0
          );

          if (rboId) {
            gl.framebufferRenderbuffer(
              gl.FRAMEBUFFER,
              attachment,
              gl.RENDERBUFFER,
              rboId
            );
          }
        }
      }
    }

    // Make sure the blit texture referenced is valid
    if (target.buffers.blit?.depth) {
      if (target.buffers.blit.depth instanceof Texture) {
        if (isTextureReady(target.buffers.blit.depth)) {
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            target.buffers.blit.depth.gl.textureId,
            0
          );
        } else {
          console.warn(
            this.debugContext,
            "Attempted to compile render target whose target depth blit texture was not ready for use."
          );
          return false;
        }
      } else {
        const rboId = this.compileDepthBuffer(
          target.buffers.blit.depth,
          target.width,
          target.height,
          0
        );

        if (rboId) {
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            rboId
          );
        }
      }
    }

    // Bind the previous fbo
    if (target.gl?.fboId) {
      this.state.bindFBO(target.gl?.fboId);
    }

    // Store the blit FBO id
    target.gl.blitFboId = blitFboId;

    return true;
  }

  /**
   * Produces a render buffer object intended for a render target for the depth buffer attachment
   */
  private compileDepthBuffer(
    buffer: ColorBuffer | GLSettings.RenderTarget.DepthBufferFormat,
    width: number,
    height: number,
    multiSample: number
  ) {
    let bufferFormat: GLSettings.RenderTarget.DepthBufferFormat;

    if (buffer instanceof ColorBuffer) {
      if (buffer.gl?.bufferId) {
        return buffer.gl.bufferId;
      }
      bufferFormat =
        buffer.internalFormat as GLSettings.RenderTarget.DepthBufferFormat;
    } else {
      bufferFormat = buffer;
    }

    const gl = this.gl;
    const rbo = gl.createRenderbuffer();

    if (!rbo) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      );
      this.printError();
      return;
    }

    // State change
    this.state.bindRBO(rbo);

    // Set the storage format of the RBO
    if (gl instanceof WebGL2RenderingContext && multiSample > 0) {
      gl.renderbufferStorageMultisample(
        gl.RENDERBUFFER,
        multiSample,
        depthBufferFormat(gl, bufferFormat),
        width,
        height
      );
    } else {
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        depthBufferFormat(gl, bufferFormat),
        width,
        height
      );
    }

    if (buffer instanceof ColorBuffer) {
      buffer.gl = {
        bufferId: rbo,
        proxy: this,
      };
    }

    return rbo;
  }

  /**
   * Produces a render buffer object intended for a render target for the stencil buffer attachment
   */
  private compileStencilBuffer(
    buffer: GLSettings.RenderTarget.StencilBufferFormat,
    width: number,
    height: number
  ) {
    const gl = this.gl;
    const rbo = gl.createRenderbuffer();

    if (!rbo) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      );
      this.printError();
      return;
    }

    // State change
    this.state.bindRBO(rbo);
    // Set the storage format of the RBO
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      stencilBufferFormat(gl, buffer),
      width,
      height
    );

    return rbo;
  }

  /**
   * Produces a render buffer object intended for a render target for the color
   * buffer attachment
   */
  private compileColorBuffer(
    buffer: ColorBuffer,
    width: number,
    height: number,
    multiSample: number
  ) {
    const gl = this.gl;
    const rbo = gl.createRenderbuffer();

    if (!rbo) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      );
      this.printError();
      return;
    }

    // State change
    this.state.bindRBO(rbo);

    // Set the storage format of the RBO
    if (gl instanceof WebGL2RenderingContext && multiSample > 0) {
      gl.renderbufferStorageMultisample(
        gl.RENDERBUFFER,
        buffer.multiSample,
        colorBufferFormat(gl, buffer.internalFormat),
        width,
        height
      );
    } else {
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        colorBufferFormat(gl, buffer.internalFormat),
        width,
        height
      );
    }

    buffer.gl = {
      bufferId: rbo,
      proxy: this,
    };

    return rbo;
  }

  /**
   * This does what is needed to generate a GPU texture object and format it to
   * the Texture object specifications.
   */
  compileTexture(texture: Texture) {
    if (!texture.gl) return;
    // If the id is already established, this does not need a compile but an
    // update
    if (texture.gl.textureId) return;

    // The texture must have a unit established in order to be compiled
    if (texture.gl.textureUnit < 0) {
      console.warn(
        this.debugContext,
        "A Texture object attempted to be compiled without an established Texture Unit.",
        texture
      );
      return;
    }

    // Set our unit to the unit allotted to the texture for this operation
    this.state.setActiveTextureUnit(texture.gl.textureUnit);

    const gl = this.gl;
    const textureId = gl.createTexture();

    if (!textureId) {
      console.warn(
        this.debugContext,
        "Could not generate a texture object on the GPU. Printing any gl errors:"
      );
      this.printError();
      return;
    }

    // Establish the texture's generated gl context
    texture.gl.textureId = textureId;
    // No matter what, when compiled both data and settings should be updated
    // immediately
    texture.needsDataUpload = true;
    texture.needsSettingsUpdate = true;

    // Upload the texture's data to the object
    this.updateTextureData(texture);
    // Make sure the settings for the texture are set correctly to match the
    // texture object
    this.updateTextureSettings(texture);

    return true;
  }

  /**
   * Executes the draw operation for a given model
   */
  draw(model: Model) {
    let instancing;
    let drawRange = [0, 0];

    // Get the appropriate draw range from the model
    if (
      model.vertexDrawRange &&
      model.vertexDrawRange[0] >= 0 &&
      model.vertexDrawRange[1] >= 0
    ) {
      drawRange = [
        model.vertexDrawRange[0],
        model.vertexDrawRange[1] - model.vertexDrawRange[0],
      ];
    } else {
      drawRange = [0, model.vertexCount];
    }

    // Only if this geometry has instances requested will it attempt to render
    // instances
    if (model.drawInstances >= 0 && model.geometry.isInstanced) {
      instancing = this.extensions.instancing;
    }

    // Optimization: Don't draw valid draw buffers when a render target is
    // established and MRT is enabled
    if (WebGLStat.MRT || WebGLStat.MRT_EXTENSION) {
      if (this.state.renderTarget) {
        if (!this.state.drawBuffers.find((target) => target !== this.gl.NONE)) {
          return;
        }
      }
    }

    if (instancing && instancing instanceof WebGL2RenderingContext) {
      if (model.geometry.indexBuffer) {
        instancing.drawElementsInstanced(
          drawMode(this.gl, model.drawMode),
          drawRange[1],
          model.geometry.indexBuffer.gl?.indexType ?? this.gl.UNSIGNED_INT,
          0,
          model.drawInstances
        );
      } else {
        instancing.drawArraysInstanced(
          drawMode(this.gl, model.drawMode),
          drawRange[0],
          drawRange[1],
          model.drawInstances
        );
      }
    } else if (instancing) {
      if (model.geometry.indexBuffer) {
        instancing.drawElementsInstancedANGLE(
          drawMode(this.gl, model.drawMode),
          drawRange[1],
          model.geometry.indexBuffer.gl?.indexType ?? this.gl.UNSIGNED_INT,
          0,
          model.drawInstances
        );
      } else {
        instancing.drawArraysInstancedANGLE(
          drawMode(this.gl, model.drawMode),
          drawRange[0],
          drawRange[1],
          model.drawInstances
        );
      }
    } else {
      if (model.geometry.indexBuffer) {
        this.gl.drawElements(
          drawMode(this.gl, model.drawMode),
          drawRange[1],
          model.geometry.indexBuffer.gl?.indexType ?? this.gl.UNSIGNED_INT,
          0
        );
      } else {
        this.gl.drawArrays(
          drawMode(this.gl, model.drawMode),
          drawRange[0],
          drawRange[1]
        );
      }
    }

    // Without committing to the GPU, we set the draw buffer to require a state
    // change again.
    this.state.setDrawBuffers([], true);
  }

  /**
   * Destroys an attribute's resources from the GL Context
   */
  disposeAttribute(attribute: Attribute) {
    if (attribute.gl) {
      this.gl.deleteBuffer(attribute.gl.bufferId);
      delete attribute.gl;
    }
  }

  /**
   * Destroys an index buffer's resources from the GL Context
   */
  disposeIndexBuffer(indexBuffer: IndexBuffer) {
    if (indexBuffer.gl) {
      this.gl.deleteBuffer(indexBuffer.gl?.bufferId);
      delete indexBuffer.gl;
    }
  }

  /**
   * Destroys a uniform buffer's resources from the GL Context.
   */
  disposeUniformBuffer(uniform: UniformBuffer) {
    if (uniform.gl) {
      this.gl.deleteBuffer(uniform.gl.bufferId);
      delete uniform.gl;
    }
  }

  /**
   * Destroys a color buffer's resources from the GL Context
   */
  disposeColorBuffer(colorBuffer: ColorBuffer) {
    if (colorBuffer.gl) {
      if (colorBuffer.gl.bufferId) {
        this.disposeRenderBuffer(colorBuffer.gl.bufferId);
      }

      delete colorBuffer.gl;
    }
  }

  /**
   * Destroys a geometry's resources from the GL Context
   */
  disposeGeometry(geometry: Geometry) {
    if (geometry.gl) {
      if (this.extensions.vao && geometry.gl.vao) {
        if (this.extensions.vao instanceof WebGL2RenderingContext) {
          this.extensions.vao.deleteVertexArray(geometry.gl.vao);
        } else {
          this.extensions.vao.deleteVertexArrayOES(geometry.gl.vao);
        }
      }

      delete geometry.gl;
    }
  }

  /**
   * Destroys a material's resources from the GL Context.
   */
  disposeMaterial(material: Material) {
    if (material.gl) {
      const { vsId, fsId: fsIds, programId } = material.gl;
      let fsLookup = this.programs.get(vsId);

      // If nothing is found we have something with odd state. Just delete the
      // vertex and fake the object to continue the program normally
      if (!fsLookup) {
        fsLookup = new Map();
        this.gl.deleteShader(vsId);
      }

      for (let i = 0, iMax = fsIds.length; i < iMax; ++i) {
        const fsId = fsIds[i];
        let useMetrics = fsLookup.get(fsId.id);

        // No use metrics means odd state, make a fake object to continue the
        // process normally
        if (!useMetrics) {
          useMetrics = {
            useCount: 0,
            program: programId[i].id,
          };
        }

        // We're removing a material from utilizing this program, thus reduce
        // it's useage
        useMetrics.useCount--;

        // If the useage is at or drops below zero, the program is no longer
        // valid and not in use
        if (useMetrics.useCount < 1) {
          this.gl.deleteProgram(useMetrics.program);
          fsLookup.delete(fsId.id);

          // If removing this fragment shader reference reduces the lookups to
          // zero, then the vertex shader is not paired with anything and has no
          // programs. It is ready for removal as well
          if (fsLookup.size <= 0) {
            this.gl.deleteShader(vsId);
          }
        }

        // The fragment shader is a bit trickier, we must go through all vertex
        // shader lookups and see if the fragment shader exists in any of them.
        // If not: the fragment shader is ready for removal
        let found = false;
        this.programs.forEach((fsLookup) => {
          if (fsLookup.has(fsId.id)) found = true;
        });

        // If no fragment shader references remain: delete it.
        if (!found) {
          this.gl.deleteShader(fsId.id);
        }
      }
    }

    delete material.gl;
  }

  /**
   * Destroy a render buffer (RBO)
   */
  disposeRenderBuffer(buffer: WebGLRenderbuffer) {
    this.gl.deleteRenderbuffer(buffer);
  }

  /**
   * Destroys a render target's resources from the GL context
   */
  disposeRenderTarget(target: RenderTarget) {
    if (target.gl) {
      // List of color buffers for MRT
      if (Array.isArray(target.gl.colorBufferId)) {
        target.gl.colorBufferId.forEach((buffer) => {
          if (buffer.data instanceof Texture && !target.retainTextureTargets) {
            this.disposeTexture(buffer.data);
          } else if (buffer.data instanceof WebGLRenderbuffer) {
            this.disposeRenderBuffer(buffer.data);
          }
        });
      } else if (
        target.gl.colorBufferId &&
        target.gl.colorBufferId.data instanceof Texture &&
        !target.retainTextureTargets
      ) {
        this.disposeTexture(target.gl.colorBufferId.data);
      } else if (target.gl.colorBufferId instanceof WebGLRenderbuffer) {
        this.disposeRenderBuffer(target.gl.colorBufferId.data);
      }

      // Dispose of depth buffer
      if (
        target.gl.depthBufferId instanceof Texture &&
        !target.retainTextureTargets
      ) {
        this.disposeTexture(target.gl.depthBufferId);
      } else if (target.gl.depthBufferId instanceof WebGLRenderbuffer) {
        this.disposeRenderBuffer(target.gl.depthBufferId);
      }

      // Dispose of stencil buffer
      if (
        target.gl.stencilBufferId instanceof Texture &&
        !target.retainTextureTargets
      ) {
        this.disposeTexture(target.gl.stencilBufferId);
      } else if (target.gl.stencilBufferId instanceof WebGLRenderbuffer) {
        this.disposeRenderBuffer(target.gl.stencilBufferId);
      }

      // Dispose of the blit texture
      if (target.buffers.blit && !target.retainTextureTargets) {
        if (target.buffers.blit.color) {
          if (Array.isArray(target.buffers.blit.color)) {
            target.buffers.blit.color.forEach((buffer) => {
              if (buffer.buffer instanceof Texture) {
                this.disposeTexture(buffer.buffer);
              } else if (buffer.buffer instanceof WebGLRenderbuffer) {
                this.disposeRenderBuffer(buffer.buffer);
              }
            });
          } else {
            const buffer = target.buffers.blit.color;
            if (buffer.buffer instanceof Texture) {
              this.disposeTexture(buffer.buffer);
            } else if (buffer.buffer instanceof WebGLRenderbuffer) {
              this.disposeRenderBuffer(buffer.buffer);
            }
          }
        }
        if (target.buffers.blit.depth) {
          if (target.buffers.blit.depth instanceof Texture) {
            this.disposeTexture(target.buffers.blit.depth);
          }
        }
      }

      // Delete the framebuffer object associated with this render target
      this.gl.deleteFramebuffer(target.gl.fboId);

      // Delete the FBO associated with the blit target
      if (target.gl.blitFboId) {
        this.gl.deleteFramebuffer(target.gl.blitFboId);
      }

      // Clean up the context generated for the render target
      delete target.gl;
    }
  }

  /**
   * Destroys a texture's resources from the GL context
   */
  disposeTexture(texture: Texture) {
    if (texture.gl && !texture.destroyed) {
      this.gl.deleteTexture(texture.gl.textureId);
      this.state.freeTextureUnit(texture);
    }

    delete texture.gl;
  }

  /**
   * Retrieves the gl context from the canvas
   */
  static getContext(canvas: HTMLCanvasElement, options: object) {
    // Attempt to fetch the same webgl as webgl stat reports, if it fails,
    // attempt to fetch in descending order a known version of webgl.
    const names = [
      WebGLStat.WEBGL_VERSION,
      "webgl",
      "webgl2",
      "experimental-webgl",
    ];
    let context: GLContext | null = null;
    let extensions: IExtensions = {};

    for (let i = 0; i < names.length; ++i) {
      const name = names[i];
      const ctx = canvas.getContext(name, options);

      if (
        ctx &&
        (ctx instanceof WebGLRenderingContext ||
          ctx instanceof WebGL2RenderingContext)
      ) {
        debug(
          "Generated GL Context of version with attributes:",
          name,
          options
        );
        context = ctx;
        extensions = GLProxy.addExtensions(context);
        break;
      }
    }

    // ENABLE DEBUG:
    // if (context) glDebug(context, true);

    return {
      context,
      extensions,
    };
  }

  /**
   * This decodes and prints any webgl context error in a  human readable manner.
   */
  printError() {
    const glError = this.gl.getError();

    switch (glError) {
      case this.gl.NO_ERROR:
        console.warn("GL Error: No Error");
        break;

      case this.gl.INVALID_ENUM:
        console.warn("GL Error: INVALID ENUM");
        break;

      case this.gl.INVALID_VALUE:
        console.warn("GL Error: INVALID_VALUE");
        break;

      case this.gl.INVALID_OPERATION:
        console.warn("GL Error: INVALID OPERATION");
        break;

      case this.gl.INVALID_FRAMEBUFFER_OPERATION:
        console.warn("GL Error: INVALID FRAMEBUFFER OPERATION");
        break;

      case this.gl.OUT_OF_MEMORY:
        console.warn("GL Error: OUT OF MEMORY");
        break;

      case this.gl.CONTEXT_LOST_WEBGL:
        console.warn("GL Error: CONTEXT LOST WEBGL");
        break;

      default:
        console.warn(
          "GL Error: GL Context output an unrecognized error value:",
          glError
        );
        break;
    }
  }

  /**
   * Breaks down a string into a multiline structure. Helps pretty print some
   * items.
   */
  lineFormat(str: string) {
    const lines = str.split("\n");
    const lineChars = String(lines.length).length + 1;

    return `\n${lines
      .map(
        (l, i) =>
          `${Array(lineChars - String(i + 1).length).join(" ")}${i + 1}: ${l}`
      )
      .join("\n")}`;
  }

  /**
   * Prints a shader broken down by lines
   */
  lineFormatShader(
    shader: Material["fragmentShader"] | Material["vertexShader"]
  ) {
    if (!shader) return "NO SHADER FOUND";
    if (isString(shader)) {
      return this.lineFormat(shader);
    } else {
      return shader.forEach(
        (s) =>
          `\nSHADER FOR OUTPUT TYPES: ${s.outputTypes} ${this.lineFormat(
            s.source
          )}`
      );
    }
  }

  /**
   * Ensures a texture object is compiled and/or updated.
   */
  updateTexture(texture: Texture) {
    if (!texture.gl || texture.gl.textureUnit < 0) {
      console.warn(
        this.debugContext,
        "Can not update or compile a texture that does not have an established texture unit.",
        texture
      );
      return;
    }

    // Perform any necessary compilation or settings changes requested of the texture
    this.compileTexture(texture);
    this.updateTextureData(texture);
    this.updateTexturePartialData(texture);
    this.updateTextureSettings(texture);

    // Indicate all updates required of the texture have been performed
    texture.resolve();
  }

  /**
   * Ensures the texture object has it's data uploaded to the GPU
   */
  private updateTextureData(texture: Texture) {
    // Check for upload flag
    if (!texture.needsDataUpload) return;
    // Check for gl context established
    if (!texture.gl) return;
    // This texture must have an establish texture id
    if (!texture.gl.textureId) return;

    // The texture must have a unit established in order to have it's data updated
    if (texture.gl.textureUnit < 0) {
      console.warn(
        this.debugContext,
        "A Texture object attempted to update it's data without an established Texture Unit.",
        texture
      );
      return;
    }

    const gl = this.gl;

    // Ensure we are operating on the correct active unit
    this.state.setActiveTextureUnit(texture.gl.textureUnit);
    // Ensure our texture is bound as the active texture unit
    this.state.bindTexture(
      texture,
      GLSettings.Texture.TextureBindingTarget.TEXTURE_2D
    );

    // Make sure the settings are properly set for the texture before performing the data upload
    texture.needsSettingsUpdate = true;
    this.updateTextureSettings(texture);

    // First set the data in the texture
    if (
      gl instanceof WebGLRenderingContext ||
      (gl as any) instanceof WebGL2RenderingContext
    ) {
      if (isDataBuffer(texture.data)) {
        if (
          !isPowerOf2(texture.data.width) ||
          !isPowerOf2(texture.data.height)
        ) {
          debug("Created a texture that is not using power of 2 dimensions.");
        }

        const texFormat = texelFormat(gl, texture.internalFormat);
        const dataFormat = texelFormat(gl, texture.format);

        if (gl instanceof WebGLRenderingContext) {
          if (texFormat !== dataFormat) {
            console.warn(
              "WebGL 1 requires format and data format to be identical"
            );
          }
        }

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          texFormat,
          texture.data.width,
          texture.data.height,
          0,
          dataFormat,
          inputImageFormat(gl, texture.type),
          texture.data.buffer
        );
      } else if (texture.data) {
        if (
          !isPowerOf2(texture.data.width) ||
          !isPowerOf2(texture.data.height)
        ) {
          debug(
            "Created a texture that is not using power of 2 dimensions. %o",
            texture
          );
        }

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          texelFormat(gl, texture.internalFormat),
          texelFormat(gl, texture.format),
          inputImageFormat(gl, texture.type),
          texture.data
        );
      }

      if (texture.generateMipMaps) {
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    }

    // Let's not hang onto large data buffers that are being uploaded to the gpu. Let's
    // delete the buffer but keep some simple metrics about it.
    if (texture.data) {
      texture.data = {
        width: texture.data.width,
        height: texture.data.height,
        buffer: null,
      };
    }

    // Clear the flag for updates
    texture.needsDataUpload = false;
  }

  /**
   * This consumes all of the partial texture updates applied to the texture.
   */
  private updateTexturePartialData(texture: Texture) {
    // Check for partial update flag
    if (!texture.needsPartialDataUpload) return;
    // Check for gl context established
    if (!texture.gl) return;
    // This texture must have an establish texture id
    if (!texture.gl.textureId) return;

    // The texture must have a unit established in order to have it's data updated
    if (texture.gl.textureUnit < 0) {
      console.warn(
        this.debugContext,
        "A Texture object attempted to update it's data without an established Texture Unit.",
        texture
      );
      return;
    }

    // Get gl context to work with
    const gl = this.gl;
    // Ensure we are operating on the correct active unit
    this.state.setActiveTextureUnit(texture.gl.textureUnit);
    // Ensure our texture is bound as the active texture unit
    this.state.bindTexture(
      texture,
      GLSettings.Texture.TextureBindingTarget.TEXTURE_2D
    );

    // Loop through all the necessary update regions and apply the changes
    texture.updateRegions.forEach((region) => {
      const buffer = region[0];
      const bounds = region[1];

      // First set the data in the texture
      if (
        gl instanceof WebGLRenderingContext ||
        (gl as any) instanceof WebGL2RenderingContext
      ) {
        if (isDataBuffer(buffer)) {
          gl.texSubImage2D(
            gl.TEXTURE_2D,
            0,
            bounds.x,
            bounds.y,
            buffer.width,
            buffer.height,
            texelFormat(gl, texture.format),
            inputImageFormat(gl, texture.type),
            buffer.buffer
          );
        } else if (buffer) {
          gl.texSubImage2D(
            gl.TEXTURE_2D,
            0,
            bounds.x,
            bounds.y,
            texelFormat(gl, texture.format),
            inputImageFormat(gl, texture.type),
            buffer
          );
        }

        if (texture.generateMipMaps) {
          gl.generateMipmap(gl.TEXTURE_2D);
        }
      }
    });

    // Flag the deed as done
    texture.needsPartialDataUpload = false;
  }

  /**
   * Modifies all settings needing modified on the provided texture object.
   */
  private updateTextureSettings(texture: Texture) {
    // Check update flag
    if (!texture.needsSettingsUpdate) return;
    // Check for gl context
    if (!texture.gl || !texture.data) return;
    // This texture must have an establish texture id
    if (!texture.gl.textureId) return;

    // The texture must have a unit established in order to be compiled
    if (texture.gl.textureUnit < 0) {
      console.warn(
        this.debugContext,
        "A Texture object attempted to update it's settings without an established Texture Unit.",
        texture
      );
      return;
    }

    const isPower2 =
      isPowerOf2(texture.data.width) && isPowerOf2(texture.data.height);
    const gl = this.gl;
    this.state.setActiveTextureUnit(texture.gl.textureUnit);
    this.state.bindTexture(
      texture,
      GLSettings.Texture.TextureBindingTarget.TEXTURE_2D
    );

    let texMagFilter;
    let texMinFilter;

    // Handle special cases for floating textures and performance
    if (texture.isHalfFloatTexture) {
      if (WebGLStat.FLOAT_TEXTURE_READ.halfLinearFilter) {
        texMagFilter = magFilter(gl, texture.magFilter);

        switch (texture.minFilter) {
          case GLSettings.Texture.TextureMinFilter.Nearest:
          case GLSettings.Texture.TextureMinFilter.NearestMipMapLinear:
          case GLSettings.Texture.TextureMinFilter.NearestMipMapNearest:
            texMinFilter = minFilter(
              gl,
              GLSettings.Texture.TextureMinFilter.Nearest,
              texture.generateMipMaps
            );
            break;

          case GLSettings.Texture.TextureMinFilter.Linear:
          case GLSettings.Texture.TextureMinFilter.LinearMipMapLinear:
          case GLSettings.Texture.TextureMinFilter.LinearMipMapNearest:
            texMinFilter = minFilter(
              gl,
              GLSettings.Texture.TextureMinFilter.Nearest,
              texture.generateMipMaps
            );
            break;
        }
      } else {
        texMagFilter = magFilter(
          gl,
          GLSettings.Texture.TextureMagFilter.Nearest
        );
        texMinFilter = minFilter(
          gl,
          GLSettings.Texture.TextureMinFilter.Nearest,
          texture.generateMipMaps
        );
      }
    } else if (texture.isFloatTexture) {
      if (WebGLStat.FLOAT_TEXTURE_READ.fullLinearFilter) {
        texMagFilter = magFilter(gl, texture.magFilter);

        switch (texture.minFilter) {
          case GLSettings.Texture.TextureMinFilter.Nearest:
          case GLSettings.Texture.TextureMinFilter.NearestMipMapLinear:
          case GLSettings.Texture.TextureMinFilter.NearestMipMapNearest:
            texMinFilter = minFilter(
              gl,
              GLSettings.Texture.TextureMinFilter.Nearest,
              texture.generateMipMaps
            );
            break;

          case GLSettings.Texture.TextureMinFilter.Linear:
          case GLSettings.Texture.TextureMinFilter.LinearMipMapLinear:
          case GLSettings.Texture.TextureMinFilter.LinearMipMapNearest:
            texMinFilter = minFilter(
              gl,
              GLSettings.Texture.TextureMinFilter.Nearest,
              texture.generateMipMaps
            );
            break;
        }
      } else {
        texMagFilter = magFilter(
          gl,
          GLSettings.Texture.TextureMagFilter.Nearest
        );
        texMinFilter = minFilter(
          gl,
          GLSettings.Texture.TextureMinFilter.Nearest,
          texture.generateMipMaps
        );
      }
    }

    // Handle special case for NPOT textures and WebGL 1
    else if (!isPower2 && gl instanceof WebGLRenderingContext) {
      texMagFilter = magFilter(gl, GLSettings.Texture.TextureMagFilter.Linear);
      texMinFilter = minFilter(
        gl,
        GLSettings.Texture.TextureMinFilter.Linear,
        texture.generateMipMaps
      );
    }

    // Otherwise, we should be good to use the settings specified!
    else {
      texMagFilter = magFilter(gl, texture.magFilter);
      texMinFilter = minFilter(gl, texture.minFilter, texture.generateMipMaps);
    }

    // Set filtering and other properties to the texture
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texMagFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texMinFilter);

    if (!texture.isFloatTexture) {
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        wrapMode(gl, texture.wrapHorizontal)
      );
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        wrapMode(gl, texture.wrapVertical)
      );
    }

    if (!texture.isFloatTexture) {
      gl.pixelStorei(
        gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
        texture.premultiplyAlpha
      );

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
    }

    // Apply the anisotropic extension (if available)
    if (this.extensions.anisotropicFiltering) {
      const { ext, stat } = this.extensions.anisotropicFiltering;
      const anisotropy = Math.min(
        stat.maxAnistropicFilter,
        Math.floor(texture.anisotropy || 0)
      );

      if (!isNaN(anisotropy) && !texture.isFloatTexture && anisotropy >= 1) {
        gl.texParameterf(
          gl.TEXTURE_2D,
          ext.TEXTURE_MAX_ANISOTROPY_EXT,
          anisotropy
        );
      }
    }

    // Clear the flag for updates
    texture.needsSettingsUpdate = false;
  }

  /**
   * This updates an attribute's buffer data
   */
  updateAttribute(attribute: Attribute) {
    if (!attribute.gl) return this.compileAttribute(attribute);

    // Make sure an update is even needed
    if (!attribute.fullUpdate && !attribute.needsUpdate) {
      return true;
    }

    const gl = this.gl;

    // Check to see if this should be a complete buffer update
    if (
      attribute.fullUpdate ||
      attribute.updateRange.count < 0 ||
      attribute.updateRange.offset < 0
    ) {
      // State change
      this.state.bindVBO(attribute.gl.bufferId);
      // Upload data
      gl.bufferData(
        gl.ARRAY_BUFFER,
        attribute.data,
        attribute.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
      );
    }

    // Otherwise, we work to upload only a partial update to the buffer
    else if (attribute.updateRange.count > 0) {
      // State change
      this.state.bindVBO(attribute.gl.bufferId);
      // Upload data
      const start = attribute.updateRange.offset;
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        // We start at the element index. We specify the offset in BYTES hence
        // the * 4 since attributes are always specified as Float32Arrays
        start * 4,
        attribute.data.subarray(start, start + attribute.updateRange.count)
      );
    }

    // Flag the attribute as updated to all of it's necessities
    attribute.resolve();

    return true;
  }

  /**
   * This updates an index buffer's buffer data
   */
  updateIndexBuffer(indexBuffer: IndexBuffer) {
    if (!indexBuffer.gl) return this.compileIndexBuffer(indexBuffer);

    // Make sure an update is even needed
    if (!indexBuffer.fullUpdate && !indexBuffer.needsUpdate) {
      return true;
    }

    const gl = this.gl;

    // Check to see if this should be a complete buffer update
    if (
      indexBuffer.fullUpdate ||
      indexBuffer.updateRange.count < 0 ||
      indexBuffer.updateRange.offset < 0
    ) {
      // State change
      this.state.bindVBO(indexBuffer.gl.bufferId);
      // Upload data
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        indexBuffer.data,
        indexBuffer.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
      );
    }

    // Otherwise, we work to upload only a partial update to the buffer
    else if (indexBuffer.updateRange.count > 0) {
      // State change
      this.state.bindVBO(indexBuffer.gl.bufferId);
      // Upload data
      const start = indexBuffer.updateRange.offset;
      gl.bufferSubData(
        gl.ELEMENT_ARRAY_BUFFER,
        start *
          (
            indexBuffer.data.constructor as
              | typeof Uint8Array
              | typeof Uint16Array
              | typeof Uint32Array
          ).BYTES_PER_ELEMENT,
        indexBuffer.data.subarray(start, start + indexBuffer.updateRange.count)
      );
    }

    // Flag the indexBuffer as updated to all of it's necessities
    indexBuffer.resolve();

    return true;
  }

  /**
   * This performs all necessary functions to use the index buffer utilizing
   * the current program in use. This is simpler than using an atribute as index
   * buffers don't have to align with attribute names or specifics of a program.
   */
  useIndexBuffer(indexBuffer: IndexBuffer) {
    // If the gl context is established for the index buffer, we can bind it
    // successfully.
    if (indexBuffer.gl) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer.gl.bufferId);
      return true;
    }

    return false;
  }

  /**
   * This performs all necessary functions to use the attribute utilizing
   * the current program in use.
   */
  useAttribute(name: string, attribute: Attribute, geometry: Geometry) {
    // We need a valid program in use.
    if (!this.state.currentProgram) return false;
    // Must have it's gl context established
    if (!attribute.gl) return false;

    // Ensure the attribute has established location information for this
    // program
    attribute.gl.locations = attribute.gl.locations || new Map();
    // Find existing attribute location for the current program
    let location = attribute.gl.locations.get(this.state.currentProgram);

    // If no location is found for this attribute for this program we must query
    // for it
    if (location === undefined) {
      location = this.gl.getAttribLocation(this.state.currentProgram, name);

      if (location === -1) {
        debug(
          "WARN: An attribute is not being used with the current material: %o",
          name,
          attribute
        );
      }

      attribute.gl.locations.set(this.state.currentProgram, location);
    }

    // Exit if our location is invalid for this attribute. It won't be used in
    // next draw call.
    if (location === -1) return;

    // At this point we're ready to establish the attribute's state and stride
    this.state.bindVBO(attribute.gl.bufferId);

    switch (attribute.size) {
      // For sizes that fit within a single vertex block, this is the simplest
      // way to establish the pointer
      case 1:
      case 2:
      case 3:
      case 4:
        // Enable the use of the vertex location
        this.state.willUseVertexAttributeArray(location);

        // Now we establish the metrics of the buffer
        this.gl.vertexAttribPointer(
          location,
          attribute.size, // How many floats used for the attribute
          this.gl.FLOAT, // We are only sending over float data right now
          attribute.normalize,
          0,
          0
        );

        if (
          geometry.isInstanced &&
          attribute.isInstanced &&
          this.extensions.instancing
        ) {
          this.state.setVertexAttributeArrayDivisor(location, 1);
        } else {
          this.state.setVertexAttributeArrayDivisor(location, 0);
        }
        break;

      // For sizes that exceed a single 'block' for a vertex attribute, one must
      // break up the attribute pointers as the max allowed size is 4 at a time.
      default: {
        const totalBlocks = Math.ceil(attribute.size / 4);

        for (let i = 0; i < totalBlocks; ++i) {
          // Enable the use of the vertex location
          this.state.willUseVertexAttributeArray(location + i);

          this.gl.vertexAttribPointer(
            location + i,
            4,
            this.gl.FLOAT,
            attribute.normalize,
            totalBlocks * 4 * 4,
            i * 16
          );

          if (
            geometry.isInstanced &&
            attribute.isInstanced &&
            this.extensions.instancing
          ) {
            this.state.setVertexAttributeArrayDivisor(location + i, 1);
          } else {
            this.state.setVertexAttributeArrayDivisor(location + i, 0);
          }
        }

        break;
      }
    }

    return true;
  }

  /**
   * Uses the configuration in the specified render target to perform a blit
   * from the current framebuffer to the target texture which should be bound to
   * an FBO.
   */
  blitFramebuffer(target: RenderTarget) {
    if (this.gl instanceof WebGL2RenderingContext && target.gl) {
      const outputTypeToAttachment = target.gl.outputTypeToAttachment;
      const source = target.gl.fboId;
      const destination = target.gl.blitFboId;

      if (!source || !destination) return;
      const blitColorBuffers = target.buffers.blit?.color;
      let buffers = [];
      if (!blitColorBuffers) return;

      if (Array.isArray(blitColorBuffers)) buffers = blitColorBuffers;
      else buffers = [blitColorBuffers];

      // Store original
      this.state.bindFBOTargets(source, destination);

      // Make our attachment list
      const attachments = buffers
        .map((buffer) => outputTypeToAttachment.get(buffer.outputType))
        .filter(isDefined);

      // Blit each attachment to the blit targets
      for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        const attachment = outputTypeToAttachment.get(buffer.outputType);

        if (attachment) {
          const drawBuffersAlignment = attachments
            .slice(0)
            .map((a) => (a === attachment ? attachment : this.gl.NONE));
          this.gl.readBuffer(attachment);
          this.state.setDrawBuffers(drawBuffersAlignment);
          this.gl.blitFramebuffer(
            0,
            0,
            target.width,
            target.height,
            0,
            0,
            target.width,
            target.height,
            this.gl.COLOR_BUFFER_BIT,
            this.gl.NEAREST
          );
        }
      }

      // Blit the depth buffer if it exists
      if (target.buffers.blit?.depth) {
        this.gl.blitFramebuffer(
          0,
          0,
          target.width,
          target.height,
          0,
          0,
          target.width,
          target.height,
          this.gl.DEPTH_BUFFER_BIT,
          this.gl.NEAREST
        );
      }
    }
  }
}
