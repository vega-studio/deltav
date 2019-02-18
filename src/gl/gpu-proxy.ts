import { GLSettings } from "src/gl/gl-settings";
import { Attribute } from "./attribute";
import { Geometry } from "./geometry";
import { GLState } from "./gl-state";
import { Material } from "./material";
import { Texture } from "./texture";
import { GLContext } from "./types";

const debug = require('debug')('performance');

/**
 * Type guard to see if a textire object's data is a buffer.
 */
function isDataBuffer(val: any): val is { width: number, height: number, buffer: ArrayBufferView | null } {
  return val && val.buffer && val.buffer.byteOffset !== undefined && val.buffer.byteLength;
}

/**
 * Tests if a value is a power of 2
 */
function isPowerOf2(val: number) {
  return (val & (val - 1)) === 0;
}

/**
 * Decodes the TexelDataType to a GL setting
 */
function texelFormat(gl: WebGLRenderingContext, format: GLSettings.Texture.TexelDataType) {
  switch (format) {
    case GLSettings.Texture.TexelDataType.Alpha: return gl.ALPHA;
    case GLSettings.Texture.TexelDataType.DepthComponent: return gl.DEPTH_COMPONENT;
    case GLSettings.Texture.TexelDataType.DepthStencil: return gl.DEPTH_STENCIL;
    case GLSettings.Texture.TexelDataType.Luminance: return gl.LUMINANCE;
    case GLSettings.Texture.TexelDataType.LuminanceAlpha: return gl.LUMINANCE_ALPHA;
    case GLSettings.Texture.TexelDataType.RGB: return gl.RGB;
    case GLSettings.Texture.TexelDataType.RGBA: return gl.RGBA;

    default:
      console.warn('An Unsupported texel format was provided', format);
      return gl.RGBA;
  }
}

/**
 * Decodes the SourcePixelFormat to a GL setting
 */
function inputImageFormat(gl: WebGLRenderingContext, format: GLSettings.Texture.SourcePixelFormat) {
  switch (format) {
    case GLSettings.Texture.SourcePixelFormat.Byte: return gl.BYTE;
    case GLSettings.Texture.SourcePixelFormat.Float: return gl.FLOAT;
    case GLSettings.Texture.SourcePixelFormat.HalfFloat: console.warn('Unsupported HALF_FLOAT'); return gl.BYTE;
    case GLSettings.Texture.SourcePixelFormat.Int: return gl.INT;
    case GLSettings.Texture.SourcePixelFormat.Short: return gl.SHORT;
    case GLSettings.Texture.SourcePixelFormat.UnsignedByte: return gl.UNSIGNED_BYTE;
    case GLSettings.Texture.SourcePixelFormat.UnsignedInt: return gl.UNSIGNED_INT;
    case GLSettings.Texture.SourcePixelFormat.UnsignedShort: return gl.UNSIGNED_SHORT;
    case GLSettings.Texture.SourcePixelFormat.UnsignedShort_4_4_4_4: return gl.UNSIGNED_SHORT_4_4_4_4;
    case GLSettings.Texture.SourcePixelFormat.UnsignedShort_5_5_5_1: return gl.UNSIGNED_SHORT_5_5_5_1;
    case GLSettings.Texture.SourcePixelFormat.UnsignedShort_5_6_5: return gl.UNSIGNED_SHORT_5_6_5;

    default:
      console.warn('An Unsupported input image format was provided', format);
      return gl.BYTE;
  }
}

/**
 * Decodes TextureMagFilter to a GL setting
 */
function magFilter(gl: WebGLRenderingContext, filter: GLSettings.Texture.TextureMagFilter) {
  switch (filter) {
    case GLSettings.Texture.TextureMagFilter.Linear: return gl.LINEAR;
    case GLSettings.Texture.TextureMagFilter.Nearest: return gl.NEAREST;
  }
}

/**
 * Decodes TextureMinFilter to a GL setting
 */
function minFilter(gl: WebGLRenderingContext, filter: GLSettings.Texture.TextureMinFilter) {
  switch (filter) {
    case GLSettings.Texture.TextureMinFilter.Linear: return gl.LINEAR;
    case GLSettings.Texture.TextureMinFilter.Nearest: return gl.NEAREST;
    case GLSettings.Texture.TextureMinFilter.LinearMipMapLinear: return gl.LINEAR_MIPMAP_LINEAR;
    case GLSettings.Texture.TextureMinFilter.LinearMipMapNearest: return gl.LINEAR_MIPMAP_NEAREST;
    case GLSettings.Texture.TextureMinFilter.NearestMipMapLinear: return gl.NEAREST_MIPMAP_LINEAR;
    case GLSettings.Texture.TextureMinFilter.NearestMipMapNearest: return gl.NEAREST_MIPMAP_NEAREST;

    default: return gl.LINEAR;
  }
}

/**
 * Decodes Wrapping to a GL setting
 */
function wrapMode(gl: WebGLRenderingContext, mode: GLSettings.Texture.Wrapping) {
  switch (mode) {
    case GLSettings.Texture.Wrapping.CLAMP_TO_EDGE: return gl.CLAMP_TO_EDGE;
    case GLSettings.Texture.Wrapping.MIRRORED_REPEAT: return gl.MIRRORED_REPEAT;
    case GLSettings.Texture.Wrapping.REPEAT: return gl.REPEAT;
  }
}

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
    if (!texture.gl) return;
    // If the id is already established, this does noe need a compile but an update
    if (texture.gl.textureId) return;

    // The texture must have a unit established in order to be compiled
    if (texture.gl.textureUnit < 0) {
      console.warn('A Texture object attempted to be compiled without an established Texture Unit.', texture);
      return;
    }

    // Set our unit to the unit allotted to the texture for this operation
    this.state.setActiveTextureUnit(texture.gl.textureUnit);

    const gl = this.gl;
    const textureId = gl.createTexture();

    if (!textureId) {
      console.warn('Could not generate a texture object on the GPU. Printing any gl errors:');
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

    if (texture.generateMipmaps) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    return true;
  }

  /**
   * Ensures a texture object is compiled and/or updated.
   */
  updateTexture(texture: Texture) {
    if (!texture.gl || texture.gl.textureUnit < 0) {
      console.warn('Can not update or compile a texture that does not have an established texture unit.', texture);
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
      console.warn('A Texture object attempted to update it\'s data without an established Texture Unit.', texture);
      return;
    }

    const gl = this.gl;

    // Ensure we are operating on the correct active unit
    this.state.setActiveTextureUnit(texture.gl.textureUnit);
    // Ensure our texture is bound as the active texture unit
    this.state.bindTexture(texture, GLSettings.Texture.TextureBindingTarget.TEXTURE_2D);

    // First set the data in the texture
    if (isDataBuffer(texture.data)) {
      if (!isPowerOf2(texture.data.width) || !isPowerOf2(texture.data.height)) {
        debug('Created a texture that is not using power of 2 dimensions.');
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
    }
    else if (texture.data) {
      if (!isPowerOf2(texture.data.width) || !isPowerOf2(texture.data.height)) {
        debug('Created a texture that is not using power of 2 dimensions. %o', texture);
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
      console.warn('A Texture object attempted to update it\'s settings without an established Texture Unit.', texture);
      return;
    }

    const gl = this.gl;
    this.state.setActiveTextureUnit(texture.gl.textureUnit);
    this.state.bindTexture(texture, GLSettings.Texture.TextureBindingTarget.TEXTURE_2D);

    // Set filtering and other properties to the texture
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter(gl, texture.magFilter));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter(gl, texture.minFilter));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode(gl, texture.wrapHorizontal));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode(gl, texture.wrapVertical));
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
