import { GLSettings } from "./gl-settings";
import { GLContext, IExtensions } from "./types";

/**
 * This file contains all method used to decode/encode GLSettings to GL types
 */

/**
 * Decodes a DrawMode to a GL setting
 */
export function drawMode(gl: GLContext, mode: GLSettings.Model.DrawMode) {
  switch (mode) {
    case GLSettings.Model.DrawMode.LINES:
      return gl.LINES;
    case GLSettings.Model.DrawMode.LINE_LOOP:
      return gl.LINE_LOOP;
    case GLSettings.Model.DrawMode.LINE_STRIP:
      return gl.LINE_STRIP;
    case GLSettings.Model.DrawMode.POINTS:
      return gl.POINTS;
    case GLSettings.Model.DrawMode.TRIANGLES:
      return gl.TRIANGLES;
    case GLSettings.Model.DrawMode.TRIANGLE_FAN:
      return gl.TRIANGLE_FAN;
    case GLSettings.Model.DrawMode.TRIANGLE_STRIP:
      return gl.TRIANGLE_STRIP;

    default:
      return gl.TRIANGLES;
  }
}

/**
 * Decodes the TexelDataType to a GL setting
 */
export function texelFormat(gl: GLContext, format: GLSettings.Texture.TexelDataType) {
  switch (format) {
    case GLSettings.Texture.TexelDataType.Alpha:
      return gl.ALPHA;
    case GLSettings.Texture.TexelDataType.DepthComponent:
      return gl.DEPTH_COMPONENT;
    case GLSettings.Texture.TexelDataType.DepthStencil:
      return gl.DEPTH_STENCIL;
    case GLSettings.Texture.TexelDataType.Luminance:
      return gl.LUMINANCE;
    case GLSettings.Texture.TexelDataType.LuminanceAlpha:
      return gl.LUMINANCE_ALPHA;
    case GLSettings.Texture.TexelDataType.RGB:
      return gl.RGB;
    case GLSettings.Texture.TexelDataType.RGBA:
      return gl.RGBA;

    default:
      console.warn("An Unsupported texel format was provided", format);
      return gl.RGBA;
  }
}

/**
 * Decodes the SourcePixelFormat to a GL setting
 */
export function inputImageFormat(
  gl: GLContext,
  format: GLSettings.Texture.SourcePixelFormat
) {
  switch (format) {
    case GLSettings.Texture.SourcePixelFormat.Byte:
      return gl.BYTE;
    case GLSettings.Texture.SourcePixelFormat.Float:
      return gl.FLOAT;
    case GLSettings.Texture.SourcePixelFormat.HalfFloat:
      console.warn("Unsupported HALF_FLOAT");
      return gl.BYTE;
    case GLSettings.Texture.SourcePixelFormat.Int:
      return gl.INT;
    case GLSettings.Texture.SourcePixelFormat.Short:
      return gl.SHORT;
    case GLSettings.Texture.SourcePixelFormat.UnsignedByte:
      return gl.UNSIGNED_BYTE;
    case GLSettings.Texture.SourcePixelFormat.UnsignedInt:
      return gl.UNSIGNED_INT;
    case GLSettings.Texture.SourcePixelFormat.UnsignedShort:
      return gl.UNSIGNED_SHORT;
    case GLSettings.Texture.SourcePixelFormat.UnsignedShort_4_4_4_4:
      return gl.UNSIGNED_SHORT_4_4_4_4;
    case GLSettings.Texture.SourcePixelFormat.UnsignedShort_5_5_5_1:
      return gl.UNSIGNED_SHORT_5_5_5_1;
    case GLSettings.Texture.SourcePixelFormat.UnsignedShort_5_6_5:
      return gl.UNSIGNED_SHORT_5_6_5;

    default:
      console.warn("An Unsupported input image format was provided", format);
      return gl.BYTE;
  }
}

/**
 * Decodes TextureMagFilter to a GL setting
 */
export function magFilter(gl: GLContext, filter: GLSettings.Texture.TextureMagFilter) {
  switch (filter) {
    case GLSettings.Texture.TextureMagFilter.Linear:
      return gl.LINEAR;
    case GLSettings.Texture.TextureMagFilter.Nearest:
      return gl.NEAREST;
  }
}

/**
 * Decodes TextureMinFilter to a GL setting
 */
export function minFilter(gl: GLContext, filter: GLSettings.Texture.TextureMinFilter) {
  switch (filter) {
    case GLSettings.Texture.TextureMinFilter.Linear:
      return gl.LINEAR;
    case GLSettings.Texture.TextureMinFilter.Nearest:
      return gl.NEAREST;
    case GLSettings.Texture.TextureMinFilter.LinearMipMapLinear:
      return gl.LINEAR_MIPMAP_LINEAR;
    case GLSettings.Texture.TextureMinFilter.LinearMipMapNearest:
      return gl.LINEAR_MIPMAP_NEAREST;
    case GLSettings.Texture.TextureMinFilter.NearestMipMapLinear:
      return gl.NEAREST_MIPMAP_LINEAR;
    case GLSettings.Texture.TextureMinFilter.NearestMipMapNearest:
      return gl.NEAREST_MIPMAP_NEAREST;

    default:
      return gl.LINEAR;
  }
}

/**
 * Decodes a ColorBufferFormat to valid color render buffer storage formats
 */
export function colorBufferFormat(
  gl: GLContext,
  format: GLSettings.RenderTarget.ColorBufferFormat
) {
  switch (format) {
    case GLSettings.RenderTarget.ColorBufferFormat.RGB565:
      return gl.RGB565;
    case GLSettings.RenderTarget.ColorBufferFormat.RGB5_A1:
      return gl.RGB5_A1;
    case GLSettings.RenderTarget.ColorBufferFormat.RGBA4:
      return gl.RGBA4;

    default:
      return gl.RGBA4;
  }
}

/**
 * Decodes a DepthBufferFormat to valid color depth buffer storage formats
 */
export function depthBufferFormat(
  gl: GLContext,
  format: GLSettings.RenderTarget.DepthBufferFormat
) {
  switch (format) {
    case GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16:
      return gl.DEPTH_COMPONENT16;
    case GLSettings.RenderTarget.DepthBufferFormat.DEPTH_STENCIL:
      return gl.DEPTH_STENCIL;

    default:
      return gl.DEPTH_COMPONENT16;
  }
}

/**
 * Decodes a StencilBufferFormat to valid stencil render buffer storage formats
 */
export function stencilBufferFormat(
  gl: GLContext,
  format: GLSettings.RenderTarget.StencilBufferFormat
) {
  switch (format) {
    case GLSettings.RenderTarget.StencilBufferFormat.STENCIL_INDEX8:
      return gl.STENCIL_INDEX8;

    default:
      return gl.STENCIL_INDEX8;
  }
}

/**
 * Decodes Wrapping to a GL setting
 */
export function wrapMode(gl: GLContext, mode: GLSettings.Texture.Wrapping) {
  switch (mode) {
    case GLSettings.Texture.Wrapping.CLAMP_TO_EDGE:
      return gl.CLAMP_TO_EDGE;
    case GLSettings.Texture.Wrapping.MIRRORED_REPEAT:
      return gl.MIRRORED_REPEAT;
    case GLSettings.Texture.Wrapping.REPEAT:
      return gl.REPEAT;
  }
}

/**
 * Decodes an index to an appropriate color attachment for a frame buffer
 */
export function indexToColorAttachment(
  gl: GLContext,
  extensions: IExtensions,
  index: number,
  isSingleBuffer: boolean
) {
  if (isSingleBuffer) {
    return gl.COLOR_ATTACHMENT0;
  }

  const glExt = extensions.drawBuffers;

  if (glExt instanceof WebGL2RenderingContext) {
    switch (index) {
      case 0:
        return glExt.COLOR_ATTACHMENT0;
      case 1:
        return glExt.COLOR_ATTACHMENT1;
      case 2:
        return glExt.COLOR_ATTACHMENT2;
      case 3:
        return glExt.COLOR_ATTACHMENT3;
      case 4:
        return glExt.COLOR_ATTACHMENT4;
      case 5:
        return glExt.COLOR_ATTACHMENT5;
      case 6:
        return glExt.COLOR_ATTACHMENT6;
      case 7:
        return glExt.COLOR_ATTACHMENT7;
      case 8:
        return glExt.COLOR_ATTACHMENT8;
      case 9:
        return glExt.COLOR_ATTACHMENT9;
      case 10:
        return glExt.COLOR_ATTACHMENT10;
      case 11:
        return glExt.COLOR_ATTACHMENT11;
      case 12:
        return glExt.COLOR_ATTACHMENT12;
      case 13:
        return glExt.COLOR_ATTACHMENT13;
      case 14:
        return glExt.COLOR_ATTACHMENT14;
      case 15:
        return glExt.COLOR_ATTACHMENT15;
    }
  } else if (glExt) {
    switch (index) {
      case 0:
        return glExt.COLOR_ATTACHMENT10_WEBGL;
      case 1:
        return glExt.COLOR_ATTACHMENT1_WEBGL;
      case 2:
        return glExt.COLOR_ATTACHMENT2_WEBGL;
      case 3:
        return glExt.COLOR_ATTACHMENT3_WEBGL;
      case 4:
        return glExt.COLOR_ATTACHMENT4_WEBGL;
      case 5:
        return glExt.COLOR_ATTACHMENT5_WEBGL;
      case 6:
        return glExt.COLOR_ATTACHMENT6_WEBGL;
      case 7:
        return glExt.COLOR_ATTACHMENT7_WEBGL;
      case 8:
        return glExt.COLOR_ATTACHMENT8_WEBGL;
      case 9:
        return glExt.COLOR_ATTACHMENT9_WEBGL;
      case 10:
        return glExt.COLOR_ATTACHMENT10_WEBGL;
      case 11:
        return glExt.COLOR_ATTACHMENT11_WEBGL;
      case 12:
        return glExt.COLOR_ATTACHMENT12_WEBGL;
      case 13:
        return glExt.COLOR_ATTACHMENT13_WEBGL;
      case 14:
        return glExt.COLOR_ATTACHMENT14_WEBGL;
      case 15:
        return glExt.COLOR_ATTACHMENT15_WEBGL;
    }
  }

  return gl.COLOR_ATTACHMENT0;
}

/**
 * Maps an index to a texture units Enum key to use on a WebGLRenderingContext object
 */
export function indexToTextureUnit(gl: GLContext, index: number) {
  // This is the proper conversion instead of unsing the built in enums. The indices
  // are controlled via gl.max_texture_image_units. This number can be higher than
  // the enums indicate.
  return gl.TEXTURE0 + index;
}

/**
 * Maps a texture unit to an index that can be used for a uniform.
 */
export function textureUnitToIndex(gl: GLContext, unit: number) {
  // This is the proper conversion instead of unsing the built in enums. The indices
  // are controlled via gl.max_texture_image_units. This number can be higher than
  // the enums indicate.
  return unit - gl.TEXTURE0;
}
