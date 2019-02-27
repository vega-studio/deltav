import { Attribute } from "./attribute";
import { Geometry } from "./geometry";
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
  wrapMode
} from "./gl-decode";
import { GLSettings } from "./gl-settings";
import { GLState } from "./gl-state";
import { Material } from "./material";
import { Model } from "./model";
import { RenderTarget } from "./render-target";
import { Texture } from "./texture";
import { GLContext, IExtensions } from "./types";

const debug = require("debug")("performance");

/**
 * Type guard to see if a textire object's data is a buffer.
 */
function isDataBuffer(
  val: any
): val is { width: number; height: number; buffer: ArrayBufferView | null } {
  return (
    val &&
    val.buffer &&
    val.buffer.byteOffset !== undefined &&
    val.buffer.byteLength
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
function isTextureReady(
  texture: Texture
): texture is Texture & {
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
  static addExtensions(gl: GLContext) {
    const instancing = gl.getExtension("ANGLE_instanced_arrays");
    const drawBuffers = gl.getExtension("WEBGL_draw_buffers");

    if (!instancing || gl instanceof WebGL2RenderingContext) {
      debug(
        "This device does not have hardware instancing. All buffering strategies will be utilizing compatibility modes."
      );
    }

    if (!drawBuffers || gl instanceof WebGL2RenderingContext) {
      debug(
        "This device does not have hardware multi-render target capabilities. The system will have to fallback to multiple render passes to multiple FBOs to achieve the same result."
      );
    }

    return {
      instancing:
        (gl instanceof WebGL2RenderingContext ? gl : instancing) || undefined,
      drawBuffers:
        (gl instanceof WebGL2RenderingContext ? gl : drawBuffers) || undefined
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
   * Clears the color buffer only
   */
  clearColor() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  /**
   * Takes an Attribute object and ensures it's buffer is created and initialized.
   */
  compileAttribute(attribute: Attribute) {
    if (attribute.gl) return;

    const gl = this.gl;
    const buffer = gl.createBuffer();

    if (!buffer) {
      console.warn(
        "Could bot create WebGLBuffer. Printing any existing gl errors:"
      );
      this.printError();

      return;
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
      type: gl.ARRAY_BUFFER
    };

    return true;
  }

  /**
   * Takes a geometry object and ensures all of it's buffers are generated
   */
  compileGeometry(geometry: Geometry) {
    let success = true;

    // Loop through each attribute of the geometry
    geometry.attributes.forEach(attribute => {
      success = Boolean(this.compileAttribute(attribute) && success);
    });

    return success;
  }

  /**
   * This creates the shaders and programs needed to create a material.
   */
  compileMaterial(material: Material) {
    // If the gl object exists, then this is considered finished
    if (material.gl) return;

    // Check for existing shader programs for the fragment shader
    let fs = this.fragmentShaders.get(material.fragmentShader) || null;

    // If none exists, then we create and compile the fragments shader
    if (!fs) {
      fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);

      if (!fs) {
        console.warn(
          "Could not create a Fragment WebGLShader. Printing GL Errors:"
        );
        this.printError();
        return;
      }

      this.gl.shaderSource(fs, material.fragmentShader);
      this.gl.compileShader(fs);

      if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
        console.error("FRAGMENT SHADER COMPILER ERROR");
        console.warn(material.fragmentShader);
        console.warn(
          "Could not compile provided shader. Printing logs and errors:"
        );
        this.printError();
        console.warn(this.gl.getShaderInfoLog(fs));
        this.gl.deleteShader(fs);

        return;
      }
    }

    // Check for existingg vertex shader object
    let vs = this.vertexShaders.get(material.vertexShader) || null;

    // If none exists, then compile
    if (!vs) {
      vs = this.gl.createShader(this.gl.VERTEX_SHADER);

      if (!vs) {
        console.warn(
          "Could not create a Vertex WebGLShader. Printing GL Errors:"
        );
        this.printError();
        return;
      }

      this.gl.shaderSource(vs, material.vertexShader);
      this.gl.compileShader(vs);

      if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) {
        console.error("VERTEX SHADER COMPILER ERROR");
        console.warn(material.vertexShader);
        console.warn(
          "Could not compile provided shader. Printing logs and errors:"
        );
        this.printError();
        console.warn(this.gl.getShaderInfoLog(vs));
        this.gl.deleteShader(vs);

        return;
      }
    }

    let vertexPrograms = this.programs.get(vs);

    if (!vertexPrograms) {
      vertexPrograms = new Map();
      this.programs.set(vs, vertexPrograms);
    }

    let useMetrics = vertexPrograms.get(fs) || null;

    if (!useMetrics) {
      const program = this.gl.createProgram();

      if (!program) {
        console.warn("Could not create a WebGLProgram. Printing GL Errors:");
        this.printError();

        return;
      }

      useMetrics = {
        useCount: 1,
        program
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
        console.warn("Could not compile WebGL program. \n\n", info);
        this.gl.deleteProgram(program);

        return;
      }

      vertexPrograms.set(fs, useMetrics);
    } else {
      // Up the use count of the program for like programs that are found
      useMetrics.useCount++;
    }

    // Establish the gl context info that makes this material tick.
    material.gl = {
      fsId: fs,
      vsId: vs,
      programId: useMetrics.program,
      proxy: this
    };

    return true;
  }

  /**
   * This does what is needed to generate a GPU FBO that we can utilize as a render target
   * for subsequent draw calls.
   *
   * TODO: For MRT (using extensions or webgl 2) Our current set up is ok. However, we need
   * to change this to compile out split buffers for compatibility MRT.
   */
  compileRenderTarget(target: RenderTarget) {
    // If the gl target exists, then this is considered to be compiled already
    if (target.gl) return;

    // We will now create the frame buffer and render buffers and targets necessary
    // to make this render target work.
    const gl = this.gl;
    const fbo = gl.createFramebuffer();

    if (!fbo) {
      console.warn(
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
      proxy: this
    };

    // Color buffer
    if (Array.isArray(target.buffers.color)) {
      const buffers: (WebGLRenderbuffer | Texture)[] = [];
      glContext.colorBufferId = buffers;

      target.buffers.color.forEach((buffer, i) => {
        if (buffer instanceof Texture) {
          buffers.push(buffer);

          if (isTextureReady(buffer)) {
            gl.framebufferTexture2D(
              gl.FRAMEBUFFER,
              indexToColorAttachment(gl, this.extensions, i, true),
              gl.TEXTURE_2D,
              buffer.gl.textureId,
              0
            );
          }
        } else {
          const rboId = this.compileColorBuffer(
            buffer,
            target.width,
            target.height
          );

          if (rboId) {
            buffers.push(rboId);
            gl.framebufferRenderbuffer(
              gl.FRAMEBUFFER,
              indexToColorAttachment(gl, this.extensions, i, true),
              gl.RENDERBUFFER,
              rboId
            );
          }
        }
      });
    } else if (target.buffers.color) {
      const buffer = target.buffers.color;

      if (buffer instanceof Texture) {
        glContext.colorBufferId = buffer;

        if (isTextureReady(buffer)) {
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            indexToColorAttachment(gl, this.extensions, 0, false),
            gl.TEXTURE_2D,
            buffer.gl.textureId,
            0
          );
        }
      } else {
        const rboId = this.compileColorBuffer(
          buffer,
          target.width,
          target.height
        );

        if (rboId) {
          glContext.colorBufferId = rboId;
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            indexToColorAttachment(gl, this.extensions, 0, false),
            gl.RENDERBUFFER,
            rboId
          );
        }
      }
    }

    // Depth buffer
    if (target.buffers.depth) {
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
      } else {
        const rboId = this.compileDepthBuffer(
          buffer,
          target.width,
          target.height
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
    if (target.buffers.stencil) {
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
        /** no-op */ break;

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
        "A framebuffer check failed to return a known result. This FBO for render target will be assumed failed"
      );
      console.warn("Result:", frameBufferCheckResult, "Render Target:", target);
      message = "UNKNOWN";
    }

    if (message) {
      console.warn(
        "When creating a new FrameBuffer Object, the check on the framebuffer failed. Printing Errors:"
      );
      console.warn(message);
      delete target.gl;

      return false;
    }

    return true;
  }

  /**
   * Produces a render buffer object intended for a render target for the depth buffer attachment
   */
  private compileDepthBuffer(
    buffer: GLSettings.RenderTarget.DepthBufferFormat,
    width: number,
    height: number
  ) {
    const gl = this.gl;
    const rbo = gl.createRenderbuffer();

    if (!rbo) {
      console.warn(
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
      depthBufferFormat(gl, buffer),
      width,
      height
    );

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
   * Produces a render buffer object intended for a render target for the color buffer attachment
   */
  private compileColorBuffer(
    buffer: GLSettings.RenderTarget.ColorBufferFormat,
    width: number,
    height: number
  ) {
    const gl = this.gl;
    const rbo = gl.createRenderbuffer();

    if (!rbo) {
      console.warn(
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
      colorBufferFormat(gl, buffer),
      width,
      height
    );

    return rbo;
  }

  /**
   * This does what is needed to generate a GPU texture object and format it to the
   * Texture object specifications.
   */
  compileTexture(texture: Texture) {
    if (!texture.gl) return;
    // If the id is already established, this does noe need a compile but an update
    if (texture.gl.textureId) return;

    // The texture must have a unit established in order to be compiled
    if (texture.gl.textureUnit < 0) {
      console.warn(
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
        "Could not generate a texture object on the GPU. Printing any gl errors:"
      );
      this.printError();
      return;
    }

    // Establish the texture's generated gl context
    texture.gl.textureId = textureId;
    // No matter what, when compiled both data and settings should be updated immediately
    texture.needsDataUpload = true;
    texture.needsSettingsUpdate = true;

    // Upload the texture's data to the object
    this.updateTextureData(texture);
    // Make sure the settings for the texture are set correctly to match the texture object
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
        model.vertexDrawRange[1] - model.vertexDrawRange[0]
      ];
    } else {
      drawRange = [0, model.vertexCount];
    }

    // Only if this geomxetry has instances requested will it attempt to render instances
    if (model.geometry.maxInstancedCount >= 0) {
      instancing = this.extensions.instancing;
    }

    if (instancing && instancing instanceof WebGL2RenderingContext) {
      instancing.drawArraysInstanced(
        drawMode(this.gl, model.drawMode),
        drawRange[0],
        drawRange[1],
        model.geometry.maxInstancedCount
      );
    } else if (instancing) {
      instancing.drawArraysInstancedANGLE(
        drawMode(this.gl, model.drawMode),
        drawRange[0],
        drawRange[1],
        model.geometry.maxInstancedCount
      );
    } else {
      this.gl.drawArrays(
        drawMode(this.gl, model.drawMode),
        drawRange[0],
        drawRange[1]
      );
    }
  }

  /**
   * Destroys a material's resources from the GL Context.
   */
  disposeMaterial(material: Material) {
    if (material.gl) {
      const { vsId, fsId, programId } = material.gl;
      let fsLookup = this.programs.get(vsId);

      // If nothing is found we have something with odd state. Just delete the vertex
      // and fake the object to continue the program normally
      if (!fsLookup) {
        fsLookup = new Map();
        this.gl.deleteShader(vsId);
      }

      let useMetrics = fsLookup.get(fsId);

      // No use metrics means odd state, make a fake object to continue the process normally
      if (!useMetrics) {
        useMetrics = {
          useCount: 0,
          program: programId
        };
      }

      // We're removing a material from utilizing this program, thus reduce it's useage
      useMetrics.useCount--;

      // If the useage is at or drops below zero, the program is no longer valid and not in use
      if (useMetrics.useCount < 1) {
        this.gl.deleteProgram(useMetrics.program);
        fsLookup.delete(fsId);

        // If removing this fragment shader reference reduces the lookups to zero, then the
        // vertex shader is not paired with anything and has no programs. It is ready for
        // removal as well
        if (fsLookup.size <= 0) {
          this.gl.deleteShader(vsId);
        }
      }

      // The fragment shader is a bit trickier, we must go through all vertex shader lookups and see
      // if the fragment shader exists in any of them. If not: the fragment shader is ready for removal
      let found = false;
      this.programs.forEach(fsLookup => {
        if (fsLookup.has(fsId)) found = true;
      });

      // If no fragment shader references remain: delete it.
      if (!found) {
        this.gl.deleteShader(fsId);
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
        target.gl.colorBufferId.forEach(buffer => {
          if (buffer instanceof Texture) this.disposeTexture(buffer);
          else this.disposeRenderBuffer(buffer);
        });
      } else if (target.gl.colorBufferId instanceof Texture) {
        this.disposeTexture(target.gl.colorBufferId);
      } else if (target.gl.colorBufferId instanceof WebGLRenderbuffer) {
        this.disposeRenderBuffer(target.gl.colorBufferId);
      }

      // Dispose of depth buffer
      if (target.gl.depthBufferId instanceof Texture) {
        this.disposeTexture(target.gl.depthBufferId);
      } else if (target.gl.depthBufferId instanceof WebGLRenderbuffer) {
        this.disposeRenderBuffer(target.gl.depthBufferId);
      }

      // Dispose of stencil buffer
      if (target.gl.stencilBufferId instanceof Texture) {
        this.disposeTexture(target.gl.stencilBufferId);
      } else if (target.gl.stencilBufferId instanceof WebGLRenderbuffer) {
        this.disposeRenderBuffer(target.gl.stencilBufferId);
      }

      // Clean up the context generated for the render target
      delete target.gl;
    }
  }

  /**
   * Destroys a texture's resources from the GL context
   */
  disposeTexture(texture: Texture) {
    if (texture.gl) {
      this.gl.deleteTexture(texture.gl.textureId);
      this.state.freeTextureUnit(texture);
    }

    delete texture.gl;
  }

  /**
   * Retrieves the gl context from the canvas
   */
  static getContext(canvas: HTMLCanvasElement, options: {}) {
    // TODO: Let's make sure webgl works before we attempt any webgl 2 shenanigans
    const names = [/** "webgl2", */ "webgl", "experimental-webgl"];
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
        context = ctx;
        extensions = GLProxy.addExtensions(context);
        break;
      }
    }

    return {
      context,
      extensions
    };
  }

  /**
   * This decodes and prints any webgl context error in a  human readable manner.
   */
  printError() {
    const glError = this.gl.getError();

    switch (glError) {
      case this.gl.NO_ERROR:
        console.warn("No Error");
        break;

      case this.gl.INVALID_ENUM:
        console.warn("INVALID ENUM");
        break;

      case this.gl.INVALID_VALUE:
        console.warn("INVALID_VALUE");
        break;

      case this.gl.INVALID_OPERATION:
        console.warn("INVALID OPERATION");
        break;

      case this.gl.INVALID_FRAMEBUFFER_OPERATION:
        console.warn("INVALID FRAMEBUFFER OPERATION");
        break;

      case this.gl.OUT_OF_MEMORY:
        console.warn("OUT OF MEMORY");
        break;

      case this.gl.CONTEXT_LOST_WEBGL:
        console.warn("CONTEXT LOST WEBGL");
        break;

      default:
        console.warn("GL Context output an unrecognized error value:", glError);
        break;
    }
  }

  /**
   * Ensures a texture object is compiled and/or updated.
   */
  updateTexture(texture: Texture) {
    if (!texture.gl || texture.gl.textureUnit < 0) {
      console.warn(
        "Can not update or compile a texture that does not have an established texture unit.",
        texture
      );
      return;
    }

    this.compileTexture(texture);
    this.updateTextureData(texture);
    this.updateTextureSettings(texture);
  }

  /**
   * Ensures the texture object has it's data uploaded to the GPU
   */
  updateTextureData(texture: Texture) {
    // Check for upload flag
    if (!texture.needsDataUpload) return;
    // Check for gl context established
    if (!texture.gl) return;
    // This texture must have an establish texture id
    if (!texture.gl.textureId) return;

    // The texture must have a unit established in order to have it's data updated
    if (texture.gl.textureUnit < 0) {
      console.warn(
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

    // First set the data in the texture
    if (gl instanceof WebGLRenderingContext) {
      if (isDataBuffer(texture.data)) {
        if (
          !isPowerOf2(texture.data.width) ||
          !isPowerOf2(texture.data.height)
        ) {
          debug("Created a texture that is not using power of 2 dimensions.");
        }

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          texelFormat(gl, texture.format),
          texture.data.width,
          texture.data.height,
          0,
          texelFormat(gl, texture.format),
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
          texelFormat(gl, texture.format),
          texelFormat(gl, texture.format),
          inputImageFormat(gl, texture.type),
          texture.data
        );
      }

      if (texture.generateMipmaps) {
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    }

    // Clear the flag for updates
    texture.needsDataUpload = false;
  }

  /**
   * Modifies all settings needing modified on the provided texture object.
   */
  updateTextureSettings(texture: Texture) {
    // Check update flag
    if (!texture.needsSettingsUpdate) return;
    // Check for gl context
    if (!texture.gl) return;
    // This texture must have an establish texture id
    if (!texture.gl.textureId) return;

    // The texture must have a unit established in order to be compiled
    if (texture.gl.textureUnit < 0) {
      console.warn(
        "A Texture object attempted to update it's settings without an established Texture Unit.",
        texture
      );
      return;
    }

    const gl = this.gl;
    this.state.setActiveTextureUnit(texture.gl.textureUnit);
    this.state.bindTexture(
      texture,
      GLSettings.Texture.TextureBindingTarget.TEXTURE_2D
    );

    // Set filtering and other properties to the texture
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      magFilter(gl, texture.magFilter)
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      minFilter(gl, texture.minFilter)
    );
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

    if (texture.premultiplyAlpha) {
      // NOTE: The typescript definitions are wrong right now thus requiring some weird casting
      // voodoo. The correct value according to the webgl specs IS true right here.
      gl.pixelStorei(
        gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
        (true as unknown) as number
      );
    }

    // Clear the flag for updates
    texture.needsSettingsUpdate = false;
  }

  /**
   * This updates an attribute's buffer data
   */
  updateAttribute(attribute: Attribute) {
    if (!attribute.gl) return this.compileAttribute(attribute);
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
      const start = attribute.updateRange.offset * attribute.size;
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        start,
        attribute.data.subarray(
          start,
          start + attribute.updateRange.count * attribute.size
        )
      );
    }

    return true;
  }

  /**
   * This performs all necessary functions to use the attribute utilizing
   * the current program in use.
   */
  useAttribute(name: string, attribute: Attribute) {
    // We need a valid program in use.
    if (!this.state.currentProgram) return false;
    // Must have it's gl context established
    if (!attribute.gl) return false;

    // Ensure the attribute has established location information for this program
    attribute.gl.locations = attribute.gl.locations || new Map();
    // Find existing attribute location for the current program
    let location = attribute.gl.locations.get(this.state.currentProgram);

    // If no location is found for this attribute for this program we must query for it
    if (location === undefined) {
      location = this.gl.getAttribLocation(this.state.currentProgram, name);

      if (location === -1) {
        debug(
          "WARN: An attribute is not being used with the current material: %o",
          attribute
        );
      }

      attribute.gl.locations.set(this.state.currentProgram, location);
    }

    // Exit if our location is invalid for this attribute. It won't be used in next draw call.
    if (location === -1) return;

    // At this point we're ready to establish the attribute's state and stride
    this.state.bindVBO(attribute.gl.bufferId);
    // Enable the use of the vertex location
    this.gl.enableVertexAttribArray(location);
    // Now we establish the metrics of the buffer
    this.gl.vertexAttribPointer(
      location,
      attribute.size, // How many floats used for the attribute
      this.gl.FLOAT, // We are only sending over float data right now
      attribute.normalize,
      4 * attribute.size, // 4 bytes per float
      0
    );

    if (attribute.isInstanced && this.extensions.instancing) {
      if (this.extensions.instancing instanceof WebGL2RenderingContext) {
        this.extensions.instancing.vertexAttribDivisor(location, 1);
      } else {
        this.extensions.instancing.vertexAttribDivisorANGLE(location, 1);
      }
    }

    return true;
  }
}
