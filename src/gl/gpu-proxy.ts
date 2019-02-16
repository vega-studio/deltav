import { GLSettings } from "src/gl/gl-settings";
import { Attribute } from "./attribute";
import { Geometry } from "./geometry";
import { GLState } from "./gl-state";
import { Material } from "./material";
import { Texture } from "./texture";
import { GLContext } from "./types";

const debug = require('debug')('performance');

/**
 * This is where all objects go to be processed and updated with webgl calls. Such as textures, geometries, etc
 */
export class GPUProxy {
  /** This is the gl context we're manipulating. */
  gl: GLContext;
  /** This is the state tracker of the GL context */
  state: GLState;

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
  private programs = new Map<WebGLShader, Map<WebGLShader, WebGLProgram>>();

  constructor(gl: GLContext, state: GLState) {
    this.gl = gl;
    this.state = state;
  }

  /**
   * This enables the desired and supported extensions this framework utilizes.
   */
  private addExtensions(gl: GLContext) {
    const hasInstancing = gl instanceof WebGL2RenderingContext || gl.getExtension("ANGLE_instanced_arrays");

    if (!hasInstancing) {
      debug('This device does not have hardware instancing. All buffering strategies will be utilizing compatibility modes.');
    }
  }

  /**
   * Retrieves the gl context from the canvas
   */
  getContext(canvas: HTMLCanvasElement, options: {}) {
    const names = ["webgl2", "webgl", "experimental-webgl"];
    let context: WebGLRenderingContext | null = null;

    names.some(name => {
      const ctx = canvas.getContext(name, options);

      if (ctx && ctx instanceof WebGLRenderingContext) {
        context = ctx;
        this.gl = context;
        this.addExtensions(context);

        return true;
      }

      return false;
    });

    return context;
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
      console.warn('Could bot create WebGLBuffer. Printing any existing gl errors:');
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
      type: gl.ARRAY_BUFFER,
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
        console.warn('Could not create a Fragment WebGLShader. Printing GL Errors:');
        this.printError();
        return;
      }

      this.gl.shaderSource(fs, material.fragmentShader);
      this.gl.compileShader(fs);

      if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
        console.warn('Could not compile provided shader. Printing logs and errors:');
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
        console.warn('Could not create a Vertex WebGLShader. Printing GL Errors:');
        this.printError();
        return;
      }

      this.gl.shaderSource(vs, material.fragmentShader);
      this.gl.compileShader(vs);

      if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) {
        console.warn('Could not compile provided shader. Printing logs and errors:');
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

    let program = vertexPrograms.get(fs) || null;

    if (!program) {
      program = this.gl.createProgram();

      if (!program) {
        console.warn('Could not create a WebGLProgram. Printing GL Errors:');
        this.printError();

        return;
      }

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
        console.warn('Could not compile WebGL program. \n\n', info);
        this.gl.deleteProgram(program);

        return;
      }
    }

    // Establish the gl context info that makes this material tick.
    material.gl = {
      fsId: fs,
      vsId: vs,
      programId: program,
      proxy: this,
    };

    return true;
  }

  /**
   * This does what is needed to generate a GPU texture object and format it to the
   * Texture object specifications.
   */
  compileTexture(texture: Texture) {
    if (texture.gl) return;
    const gl = this.gl;
    const textureId = gl.createTexture();

    if (!textureId) {
      console.warn('Could not generate a texture object on the GPU. Printing any gl errors:');
      this.printError();
      return;
    }

    this.state.bindTexture(textureId, GLSettings.Texture.TextureBindingTarget.TEXTURE_2D);

    gl.texImage2D(gl.TEXTURE_2D, 0, );

    texture.gl = {
      textureId,
      textureUnit: -1
    };

    return true;
  }

  /**
   * Decodes the TexelDataType to a GL setting
   */
  private texelFormat(format: GLSettings.Texture.TexelDataType) {
    switch (format) {
      case GLSettings.Texture.TexelDataType.Byte: return this.gl.BYTE;
      case GLSettings.Texture.TexelDataType.Float: return this.gl.FLOAT;
      case GLSettings.Texture.TexelDataType.HalfFloat: return this.gl.FL;
      case GLSettings.Texture.TexelDataType.Int: return this.gl.BYTE;
      case GLSettings.Texture.TexelDataType.Short: return this.gl.BYTE;
      case GLSettings.Texture.TexelDataType.UnsignedByte: return this.gl.BYTE;
      case GLSettings.Texture.TexelDataType.UnsignedInt: return this.gl.BYTE;
      case GLSettings.Texture.TexelDataType.UnsignedShort: return this.gl.BYTE;
    }
  }

  /**
   * Decodes the SourcePixelFormat to a GL setting
   */
  private inputImageFormat(format: GLSettings.Texture.SourcePixelFormat) {

  }

  /**
   * This decodes and prints any webgl context error in a  human readable manner.
   */
  printError() {
    const glError = this.gl.getError();

    switch (glError) {
      case this.gl.NO_ERROR:
        console.warn('No Error');
        break;

      case this.gl.INVALID_ENUM:
        console.warn('INVALID ENUM');
        break;

      case this.gl.INVALID_VALUE:
        console.warn('INVALID_VALUE');
        break;

      case this.gl.INVALID_OPERATION:
        console.warn('INVALID OPERATION');
        break;

      case this.gl.INVALID_FRAMEBUFFER_OPERATION:
        console.warn('INVALID FRAMEBUFFER OPERATION');
        break;

      case this.gl.OUT_OF_MEMORY:
        console.warn('OUT OF MEMORY');
        break;

      case this.gl.CONTEXT_LOST_WEBGL:
        console.warn('CONTEXT LOST WEBGL');
        break;

      default:
        console.warn('GL Context output an unrecognized error value:', glError);
        break;
    }
  }

  /**
   * This updates an attribute's buffer data
   */
  updateAttribute(attribute: Attribute) {
    if (!attribute.gl) return this.compileAttribute(attribute);
    const gl = this.gl;

    // State change
    this.state.bindVBO(attribute.gl.bufferId);

    // Check to see if this should be a complete buffer update
    if (attribute.fullUpdate || attribute.updateRange.count < 0 || attribute.updateRange.offset < 0) {
      gl.bufferData(
        gl.ARRAY_BUFFER,
        attribute.data,
        attribute.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
      );
    }

    // Otherwise, we work to upload only a partial update to the buffer
    else if (attribute.updateRange.count > 0) {
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
}
