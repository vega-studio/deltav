import { GLSettings } from "./gl-settings.js";
import { GLContext, IExtensions } from "./types.js";
import { WebGLStat } from "./webgl-stat.js";

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
export function texelFormat(
  gl: GLContext,
  format: GLSettings.Texture.TexelDataType
) {
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
      if (gl instanceof WebGL2RenderingContext) {
        switch (format) {
          case GLSettings.Texture.TexelDataType.R8:
            return gl.R8;
          case GLSettings.Texture.TexelDataType.R16F:
            return gl.R16F;
          case GLSettings.Texture.TexelDataType.R32F:
            return gl.R32F;
          case GLSettings.Texture.TexelDataType.R8UI:
            return gl.R8UI;
          case GLSettings.Texture.TexelDataType.RG8:
            return gl.RG8;
          case GLSettings.Texture.TexelDataType.RG16F:
            return gl.RG16F;
          case GLSettings.Texture.TexelDataType.RG32F:
            return gl.RG32F;
          case GLSettings.Texture.TexelDataType.RG8UI:
            return gl.RG8UI;
          case GLSettings.Texture.TexelDataType.RG16UI:
            return gl.RG16UI;
          case GLSettings.Texture.TexelDataType.RG32UI:
            return gl.RG32UI;
          case GLSettings.Texture.TexelDataType.RGB8:
            return gl.RGB8;
          case GLSettings.Texture.TexelDataType.SRGB8:
            return gl.SRGB8;
          case GLSettings.Texture.TexelDataType.RGB565:
            return gl.RGB565;
          case GLSettings.Texture.TexelDataType.R11F_G11F_B10F:
            return gl.R11F_G11F_B10F;
          case GLSettings.Texture.TexelDataType.RGB9_E5:
            return gl.RGB9_E5;
          case GLSettings.Texture.TexelDataType.RGB16F:
            return gl.RGB16F;
          case GLSettings.Texture.TexelDataType.RGB32F:
            return gl.RGB32F;
          case GLSettings.Texture.TexelDataType.RGB8UI:
            return gl.RGB8UI;
          case GLSettings.Texture.TexelDataType.RGBA8:
            return gl.RGBA8;
          case GLSettings.Texture.TexelDataType.SRGB8_ALPHA8:
            return gl.SRGB8_ALPHA8;
          case GLSettings.Texture.TexelDataType.RGB5_A1:
            return gl.RGB5_A1;
          case GLSettings.Texture.TexelDataType.RGB10_A2:
            return gl.RGB10_A2;
          case GLSettings.Texture.TexelDataType.RGBA4:
            return gl.RGBA4;
          case GLSettings.Texture.TexelDataType.RGBA16F:
            return gl.RGBA16F;
          case GLSettings.Texture.TexelDataType.RGBA32F:
            if (
              WebGLStat.FLOAT_TEXTURE_READ.full &&
              WebGLStat.FLOAT_TEXTURE_WRITE.full
            ) {
              return gl.RGBA32F;
            } else {
              return gl.RGBA16F;
            }
          case GLSettings.Texture.TexelDataType.RGBA8UI:
            return gl.RGBA8UI;

          case GLSettings.Texture.TexelDataType.DEPTH_COMPONENT16:
            return gl.DEPTH_COMPONENT16;
          case GLSettings.Texture.TexelDataType.DEPTH_COMPONENT24:
            return gl.DEPTH_COMPONENT24;
          case GLSettings.Texture.TexelDataType.DEPTH_COMPONENT32F:
            return gl.DEPTH_COMPONENT32F;

          case GLSettings.Texture.TexelDataType.RGBA32UI:
            return gl.RGBA32UI;
          case GLSettings.Texture.TexelDataType.RGB32UI:
            return gl.RGB32UI;
          case GLSettings.Texture.TexelDataType.RGBA16UI:
            return gl.RGBA16UI;
          case GLSettings.Texture.TexelDataType.RGB16UI:
            return gl.RGB16UI;
          case GLSettings.Texture.TexelDataType.RGBA32I:
            return gl.RGBA32I;
          case GLSettings.Texture.TexelDataType.RGB32I:
            return gl.RGB32I;
          case GLSettings.Texture.TexelDataType.RGBA16I:
            return gl.RGBA16I;
          case GLSettings.Texture.TexelDataType.RGB16I:
            return gl.RGB16I;
          case GLSettings.Texture.TexelDataType.RGBA8I:
            return gl.RGBA8I;
          case GLSettings.Texture.TexelDataType.RGB8I:
            return gl.RGB8I;

          default:
            console.warn(
              "An unsupported texel format was provided that is not supported in WebGL 1 or 2"
            );
            return gl.RGBA;
        }
      }

      console.warn(
        "An Unsupported texel format was provided. Some formats are only available in WebGL 2",
        format
      );
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
export function magFilter(
  gl: GLContext,
  filter: GLSettings.Texture.TextureMagFilter
) {
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
export function minFilter(
  gl: GLContext,
  filter: GLSettings.Texture.TextureMinFilter,
  hasMipMaps: boolean
) {
  switch (filter) {
    case GLSettings.Texture.TextureMinFilter.Linear:
      return gl.LINEAR;
    case GLSettings.Texture.TextureMinFilter.Nearest:
      return gl.NEAREST;
    case GLSettings.Texture.TextureMinFilter.LinearMipMapLinear:
      return hasMipMaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
    case GLSettings.Texture.TextureMinFilter.LinearMipMapNearest:
      return hasMipMaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR;
    case GLSettings.Texture.TextureMinFilter.NearestMipMapLinear:
      return hasMipMaps ? gl.NEAREST_MIPMAP_LINEAR : gl.NEAREST;
    case GLSettings.Texture.TextureMinFilter.NearestMipMapNearest:
      return hasMipMaps ? gl.NEAREST_MIPMAP_NEAREST : gl.NEAREST;

    default:
      return gl.LINEAR;
  }
}

/**
 * Decodes a ColorBufferFormat to valid color render buffer storage formats
 *
 * Takes in any of the render buffer formats, but will default invalid color
 * buffer formats to RGBA4
 */
export function colorBufferFormat(
  gl: GLContext,
  format:
    | GLSettings.RenderTarget.ColorBufferFormat
    | GLSettings.RenderTarget.DepthBufferFormat
    | GLSettings.RenderTarget.StencilBufferFormat
) {
  switch (format) {
    case GLSettings.RenderTarget.ColorBufferFormat.RGB565:
      return gl.RGB565;
    case GLSettings.RenderTarget.ColorBufferFormat.RGB5_A1:
      return gl.RGB5_A1;
    case GLSettings.RenderTarget.ColorBufferFormat.RGBA4:
      return gl.RGBA4;

    default:
      if (gl instanceof WebGL2RenderingContext) {
        switch (format) {
          case GLSettings.RenderTarget.ColorBufferFormat.R8:
            return gl.R8;
          case GLSettings.RenderTarget.ColorBufferFormat.R8UI:
            return gl.R8UI;
          case GLSettings.RenderTarget.ColorBufferFormat.R8I:
            return gl.R8I;
          case GLSettings.RenderTarget.ColorBufferFormat.R16UI:
            return gl.R16UI;
          case GLSettings.RenderTarget.ColorBufferFormat.R16I:
            return gl.R16I;
          case GLSettings.RenderTarget.ColorBufferFormat.R32UI:
            return gl.R32UI;
          case GLSettings.RenderTarget.ColorBufferFormat.R32I:
            return gl.R32I;
          case GLSettings.RenderTarget.ColorBufferFormat.RG8:
            return gl.RG8;
          case GLSettings.RenderTarget.ColorBufferFormat.RG8UI:
            return gl.RG8UI;
          case GLSettings.RenderTarget.ColorBufferFormat.RG8I:
            return gl.RG8I;
          case GLSettings.RenderTarget.ColorBufferFormat.RG16UI:
            return gl.RG16UI;
          case GLSettings.RenderTarget.ColorBufferFormat.RG16I:
            return gl.RG16I;
          case GLSettings.RenderTarget.ColorBufferFormat.RG32UI:
            return gl.RG32UI;
          case GLSettings.RenderTarget.ColorBufferFormat.RG32I:
            return gl.RG32I;
          case GLSettings.RenderTarget.ColorBufferFormat.RGB8:
            return gl.RGB8;
          case GLSettings.RenderTarget.ColorBufferFormat.RGBA8:
            return gl.RGBA8;
          case GLSettings.RenderTarget.ColorBufferFormat.SRGB8_ALPHA8:
            return gl.SRGB8_ALPHA8;
          case GLSettings.RenderTarget.ColorBufferFormat.RGB10_A2:
            return gl.RGB10_A2;
          case GLSettings.RenderTarget.ColorBufferFormat.RGBA8UI:
            return gl.RGBA8UI;
          case GLSettings.RenderTarget.ColorBufferFormat.RGBA8I:
            return gl.RGBA8I;
          case GLSettings.RenderTarget.ColorBufferFormat.RGB10_A2UI:
            return gl.RGB10_A2UI;
          case GLSettings.RenderTarget.ColorBufferFormat.RGBA16UI:
            return gl.RGBA16UI;
          case GLSettings.RenderTarget.ColorBufferFormat.RGBA16I:
            return gl.RGBA16I;
          case GLSettings.RenderTarget.ColorBufferFormat.RGBA32I:
            return gl.RGBA32I;
          case GLSettings.RenderTarget.ColorBufferFormat.RGBA32UI:
            return gl.RGBA32UI;
        }
      }

      return gl.RGBA4;
  }
}

/**
 * Decodes a DepthBufferFormat to valid color depth buffer storage formats.
 *
 * Takes in any of the render buffer formats, but will default invalid depth
 * buffer formats to DEPTH_COMPONENT16
 */
export function depthBufferFormat(
  gl: GLContext,
  format:
    | GLSettings.RenderTarget.DepthBufferFormat
    | GLSettings.RenderTarget.ColorBufferFormat
    | GLSettings.RenderTarget.StencilBufferFormat
) {
  switch (format) {
    case GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16:
      return gl.DEPTH_COMPONENT16;
    case GLSettings.RenderTarget.DepthBufferFormat.DEPTH_STENCIL:
      return gl.DEPTH_STENCIL;

    default:
      if (gl instanceof WebGL2RenderingContext) {
        switch (format) {
          case GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT24:
            return gl.DEPTH_COMPONENT24;
          case GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT32F:
            return gl.DEPTH_COMPONENT32F;
          case GLSettings.RenderTarget.DepthBufferFormat.DEPTH24_STENCIL8:
            return gl.DEPTH24_STENCIL8;
          case GLSettings.RenderTarget.DepthBufferFormat.DEPTH32F_STENCIL8:
            return gl.DEPTH32F_STENCIL8;
        }
      }

      return gl.DEPTH_COMPONENT16;
  }
}

/**
 * Decodes a StencilBufferFormat to valid stencil render buffer storage formats
 *
 * Takes in any of the render buffer formats, but will default invalid stencil
 * buffer formats to STENCIL_INDEX8
 */
export function stencilBufferFormat(
  gl: GLContext,
  format:
    | GLSettings.RenderTarget.ColorBufferFormat
    | GLSettings.RenderTarget.DepthBufferFormat
    | GLSettings.RenderTarget.StencilBufferFormat
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
  isSingleBuffer: boolean,
  isDrawBufferAttachment: boolean
) {
  if (isSingleBuffer) {
    return gl.COLOR_ATTACHMENT0;
  }

  const glExt = extensions.drawBuffers;

  if (isDrawBufferAttachment) {
    if (glExt instanceof WebGL2RenderingContext) {
      switch (index) {
        case -2:
          return gl.BACK;
        case -1:
          return gl.NONE;
        case 0:
          return glExt.DRAW_BUFFER0;
        case 1:
          return glExt.DRAW_BUFFER1;
        case 2:
          return glExt.DRAW_BUFFER2;
        case 3:
          return glExt.DRAW_BUFFER3;
        case 4:
          return glExt.DRAW_BUFFER4;
        case 5:
          return glExt.DRAW_BUFFER5;
        case 6:
          return glExt.DRAW_BUFFER6;
        case 7:
          return glExt.DRAW_BUFFER7;
        case 8:
          return glExt.DRAW_BUFFER8;
        case 9:
          return glExt.DRAW_BUFFER9;
        case 10:
          return glExt.DRAW_BUFFER10;
        case 11:
          return glExt.DRAW_BUFFER11;
        case 12:
          return glExt.DRAW_BUFFER12;
        case 13:
          return glExt.DRAW_BUFFER13;
        case 14:
          return glExt.DRAW_BUFFER14;
        case 15:
          return glExt.DRAW_BUFFER15;
        default:
          console.warn("Attachments are only available for -2 - 15");
      }
    } else if (glExt) {
      switch (index) {
        case -2:
          return gl.BACK;
        case -1:
          return gl.NONE;
        case 0:
          return glExt.DRAW_BUFFER0_WEBGL;
        case 1:
          return glExt.DRAW_BUFFER1_WEBGL;
        case 2:
          return glExt.DRAW_BUFFER2_WEBGL;
        case 3:
          return glExt.DRAW_BUFFER3_WEBGL;
        case 4:
          return glExt.DRAW_BUFFER4_WEBGL;
        case 5:
          return glExt.DRAW_BUFFER5_WEBGL;
        case 6:
          return glExt.DRAW_BUFFER6_WEBGL;
        case 7:
          return glExt.DRAW_BUFFER7_WEBGL;
        case 8:
          return glExt.DRAW_BUFFER8_WEBGL;
        case 9:
          return glExt.DRAW_BUFFER9_WEBGL;
        case 10:
          return glExt.DRAW_BUFFER10_WEBGL;
        case 11:
          return glExt.DRAW_BUFFER11_WEBGL;
        case 12:
          return glExt.DRAW_BUFFER12_WEBGL;
        case 13:
          return glExt.DRAW_BUFFER13_WEBGL;
        case 14:
          return glExt.DRAW_BUFFER14_WEBGL;
        case 15:
          return glExt.DRAW_BUFFER15_WEBGL;
        default:
          console.warn("Attachments are only available for 0 - 15");
      }
    }
  } else {
    if (glExt instanceof WebGL2RenderingContext) {
      switch (index) {
        case -2:
          return gl.BACK;
        case -1:
          return gl.NONE;
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
        default:
          console.warn("Attachments are only available for -2 - 15");
      }
    } else if (glExt) {
      switch (index) {
        case -2:
          return gl.BACK;
        case -1:
          return gl.NONE;
        case 0:
          return glExt.COLOR_ATTACHMENT0_WEBGL;
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
        default:
          console.warn("Attachments are only available for 0 - 15");
      }
    }
  }

  return gl.COLOR_ATTACHMENT0;
}

/**
 * Maps an index to a texture units Enum key to use on a WebGLRenderingContext object
 */
export function indexToTextureUnit(gl: GLContext, index: number) {
  // This is the proper conversion instead of unsing the built in enums. The
  // indices are controlled via gl.max_texture_image_units. This number can be
  // higher than the enums indicate.
  return gl.TEXTURE0 + index;
}

/**
 * Maps a texture unit to an index that can be used for a uniform.
 */
export function textureUnitToIndex(gl: GLContext, unit: number) {
  // This is the proper conversion instead of unsing the built in enums. The
  // indices are controlled via gl.max_texture_image_units. This number can be
  // higher than the enums indicate.
  return unit - gl.TEXTURE0;
}
