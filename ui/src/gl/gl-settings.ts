/* eslint-disable @typescript-eslint/no-namespace */
/**
 * These are all of the settings that can be used to configure the GL state of the system
 */
export namespace GLSettings {
  /**
   * Settings used when defining render target parameters
   */
  export namespace RenderTarget {
    /**
     * Specifies the internal format of the color buffer for a render target
     * when not using a Texture. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
     */
    export enum ColorBufferFormat {
      RGBA4,
      RGB565,
      RGB5_A1,

      /** WebGL 2 Format */
      R8,
      /** WebGL 2 Format */
      R8UI,
      /** WebGL 2 Format */
      R8I,
      /** WebGL 2 Format */
      R16UI,
      /** WebGL 2 Format */
      R16I,
      /** WebGL 2 Format */
      R32UI,
      /** WebGL 2 Format */
      R32I,
      /** WebGL 2 Format */
      RG8,
      /** WebGL 2 Format */
      RG8UI,
      /** WebGL 2 Format */
      RG8I,
      /** WebGL 2 Format */
      RG16UI,
      /** WebGL 2 Format */
      RG16I,
      /** WebGL 2 Format */
      RG32UI,
      /** WebGL 2 Format */
      RG32I,
      /** WebGL 2 Format */
      RGB8,
      /** WebGL 2 Format */
      RGBA8,
      /** WebGL 2 Format */
      SRGB8_ALPHA8,
      /** WebGL 2 Format */
      RGB10_A2,
      /** WebGL 2 Format */
      RGBA8UI,
      /** WebGL 2 Format */
      RGBA8I,
      /** WebGL 2 Format */
      RGB10_A2UI,
      /** WebGL 2 Format */
      RGBA16UI,
      /** WebGL 2 Format */
      RGBA16I,
      /** WebGL 2 Format */
      RGBA32I,
      /** WebGL 2 Format */
      RGBA32UI,

      /** WebGL 2 Format WITH extension */
      R16F,
      /** WebGL 2 Format WITH extension */
      R32F,
      /** WebGL 2 Format WITH extension */
      RG16F,
      /** WebGL 2 Format WITH extension */
      RG32F,
      /** WebGL 2 Format WITH extension */
      RGB16F,
      /** WebGL 2 Format WITH extension */
      RGB32F,
      /** WebGL 2 Format WITH extension */
      RGBA16F,
      /** WebGL 2 Format WITH extension */
      RGBA32F,
      /** WebGL 2 Format WITH extension */
      R11F_G11F_B10F,
    }

    /**
     * Specifies the internal format of the depth buffer for a render target
     * when not using a Texture. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
     */
    export enum DepthBufferFormat {
      DEPTH_COMPONENT16,
      DEPTH_STENCIL,

      /** WebGL 2 Format */
      DEPTH_COMPONENT24,
      /** WebGL 2 Format */
      DEPTH_COMPONENT32F,
      /** WebGL 2 Format */
      DEPTH24_STENCIL8,
      /** WebGL 2 Format */
      DEPTH32F_STENCIL8,
    }

    /**
     * Specifies the internal format of the stencil buffer for a render target
     * when not using a Texture. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
     */
    export enum StencilBufferFormat {
      STENCIL_INDEX8,
    }
  }

  export namespace Material {
    /**
     * Sets the blending function to be either a preset blending function or enables the
     * use of a Custom blending equation. WHen custom is set, the Dst, Src factors, and blending
     * equation settings come into play
     */
    export enum Blending {
      NoBlending = -1,
      NormalBlending = 1,
      AdditiveBlending = 2,
      SubtractiveBlending = 3,
      MultiplyBlending = 4,
    }

    /**
     * Specifies the Destination factor for the blending equation see:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
     */
    export enum BlendingDstFactor {
      Zero = -1,
      One = 1,
      SrcColor = 2,
      OneMinusSrcColor = 3,
      SrcAlpha = 4,
      OneMinusSrcAlpha = 5,
      DstAlpha = 6,
      OneMinusDstAlpha = 7,
      DstColor = 8,
      OneMinusDstColor = 9,
    }

    /**
     * Specifies the Source factor for the blending equation see:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
     */
    export enum BlendingSrcFactor {
      Zero = -1,
      One = 1,
      SrcColor = 2,
      OneMinusSrcColor = 3,
      SrcAlpha = 4,
      OneMinusSrcAlpha = 5,
      DstAlpha = 6,
      OneMinusDstAlpha = 7,
      DstColor = 8,
      OneMinusDstColor = 9,
      SrcAlphaSaturate = 10,
    }

    /**
     * Specifies the blending equation see:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
     */
    export enum BlendingEquations {
      Add = -1,
      Subtract = 1,
      ReverseSubtract = 2,
      /** Requires extension for Webgl 1.0 */
      // Min = 3,
      // Max = 4
    }

    /**
     * Specifies the Depth comparison function for determining if a fragment should be drawn when it's
     * depth is compared against the depth buffer see:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
     */
    export enum DepthFunctions {
      NEVER = -1,
      LESS = 1,
      EQUAL = 2,
      LESS_OR_EQUAL = 3,
      GREATER = 4,
      NOTEQUAL = 5,
      GREATER_OR_EQUAL = 6,
      ALWAYS = 7,
    }

    /**
     * Specifies which side of the polygon should be culled or not. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
     */
    export enum CullSide {
      NONE = -1,
      CW = 1,
      CCW = 2,
      BOTH = 3,
    }
  }

  /**
   * These are settings applied to a model
   */
  export namespace Model {
    export enum DrawMode {
      LINE_LOOP,
      LINE_STRIP,
      LINES,
      POINTS,
      TRIANGLE_FAN,
      TRIANGLE_STRIP,
      TRIANGLES,
    }
  }

  /**
   * Settings that are applied to textures
   */
  export namespace Texture {
    /**
     * Specifies which target to bind the texture to. 2D or a cubemap.
     */
    export enum TextureBindingTarget {
      TEXTURE_2D,
      CUBE_MAP,
    }

    /**
     * The wrap mode when reading values outside of 0 - 1 when sampling the texture. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    export enum Wrapping {
      REPEAT = -1,
      CLAMP_TO_EDGE = 1,
      MIRRORED_REPEAT = 2,
    }

    /**
     * The interpolation method to use when sampling between texels when the render space is smaller than the texture. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    export enum TextureMinFilter {
      Nearest = -1,
      NearestMipMapNearest = 1,
      NearestMipMapLinear = 2,
      Linear = 3,
      LinearMipMapNearest = 4,
      LinearMipMapLinear = 5,
    }

    /**
     * The interpolation method to use when sampling between texels when the render space is larger than the texture. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    export enum TextureMagFilter {
      Nearest = -1,
      Linear = 1,
    }

    /**
     * This is the format of the input texture. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     */
    export enum SourcePixelFormat {
      /**
       * Highly supported webgl 1
       * Pairs with: TexelDataType.RGBA, RGB, LuminanceAlpha, Luminance, Alpha
       */
      UnsignedByte = -1,
      /**
       * Highly supported webgl 1
       * Pairs with: TexelDataType.RGB
       */
      UnsignedShort_5_6_5 = 1,
      /**
       * Highly supported webgl 1
       * Pairs with: TexelDataType.RGBA
       */
      UnsignedShort_4_4_4_4 = 2,
      /**
       * Highly supported webgl 1
       * Pairs with: TexelDataType.RGBA
       */
      UnsignedShort_5_5_5_1 = 3,
      /** Depth texture or Webgl 2 */
      UnsignedShort = 4,
      /** Depth texture or Webgl 2 */
      UnsignedInt = 5,
      /** Depth texture extension or Webgl 2 */
      UnsignedInt_24_8 = 6,
      /** Webgl 2 */
      Byte = 7,
      /** Webgl 2 */
      Short = 8,
      /** Webgl 2 */
      Int = 9,
      /** Webgl 2 */
      Float = 10,
      /** Webgl 2 */
      HalfFloat = 11,
      /** Webgl 2 */
      UnsignedInt_2_10_10_10_REV = 12,
      /** Webgl 2 */
      UnsignedInt_10F_11F_11F_REV = 13,
      /** Webgl 2 */
      UnsignedInt_5_9_9_9_REV = 14,
      /** Webgl 2 */
      Float32UnsignedInt_24_8_REV = 15,
    }

    /**
     * This is the data format the texels in the texture will take on. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     *
     * For valid combinations in WebGL 2 visit:
     * https://www.khronos.org/registry/webgl/specs/latest/2.0/
     *
     * Search for [throws] void texImage2D to reach the table that shows all
     * cobinations.
     */
    export enum TexelDataType {
      /**
       * Discards the red, green and blue components and reads the alpha component.
       * Pairs with: UNSIGNED_BYTE
       */
      Alpha = -1,
      /**
       * Requires Depth extension or webgl2
       */
      DepthComponent = 1,
      /**
       * Requires Depth extension or webgl2
       */
      DepthStencil = 2,
      /**
       * Each color component is a luminance component, alpha is 1.0.
       * Pairs with:
       */
      Luminance = 3,
      /**
       * Each component is a luminance/alpha component.
       */
      LuminanceAlpha = 4,
      /**
       * Discards the alpha components and reads the red, green and blue components.
       * Pairs with:
       */
      RGB = 5,
      /**
       * Red, green, blue and alpha components are read from the color buffer.
       */
      RGBA = 6,
      RGBE = 7,

      /** WebGL 2 texel format */
      R8 = 8,
      /** WebGL 2 texel format */
      R16F = 9,
      /** WebGL 2 texel format */
      R32F = 10,
      /** WebGL 2 texel format */
      R8UI = 11,
      /** WebGL 2 texel format */
      RG8 = 12,
      /** WebGL 2 texel format */
      RG16F = 13,
      /** WebGL 2 texel format */
      RG32F = 14,
      /** WebGL 2 texel format */
      RG8UI = 15,
      /** WebGL 2 texel format */
      RG16UI = 16,
      /** WebGL 2 texel format */
      RG32UI = 17,
      /** WebGL 2 texel format */
      RGB8 = 18,
      /** WebGL 2 texel format */
      SRGB8 = 19,
      /** WebGL 2 texel format */
      RGB565 = 20,
      /** WebGL 2 texel format */
      R11F_G11F_B10F = 21,
      /** WebGL 2 texel format */
      RGB9_E5 = 22,
      /** WebGL 2 texel format */
      RGB16F = 23,
      /** WebGL 2 texel format */
      RGB32F = 24,
      /** WebGL 2 texel format */
      RGB8UI = 25,
      /** WebGL 2 texel format */
      RGBA8 = 26,
      /** WebGL 2 texel format */
      SRGB8_ALPHA8 = 27,
      /** WebGL 2 texel format */
      RGB5_A1 = 28,
      /** WebGL 2 texel format */
      RGB10_A2 = 29,
      /** WebGL 2 texel format */
      RGBA4 = 30,
      /** WebGL 2 texel format */
      RGBA16F = 31,
      /** WebGL 2 texel format */
      RGBA32F = 32,
      /** WebGL 2 texel format */
      RGBA8UI = 33,
      /** WebGL 2 texel format */
      DEPTH_COMPONENT16 = 34,
      /** WebGL 2 texel format */
      DEPTH_COMPONENT24 = 35,
      /** WebGL 2 texel format */
      DEPTH_COMPONENT32F = 36,
      /** WebGL 2 texel format */
      RGBA32UI = 37,
      /** WebGL 2 texel format */
      RGB32UI = 38,
      /** WebGL 2 texel format */
      RGBA16UI = 39,
      /** WebGL 2 texel format */
      RGB16UI = 40,
      /** WebGL 2 texel format */
      RGBA32I = 41,
      /** WebGL 2 texel format */
      RGB32I = 42,
      /** WebGL 2 texel format */
      RGBA16I = 43,
      /** WebGL 2 texel format */
      RGB16I = 44,
      /** WebGL 2 texel format */
      RGBA8I = 45,
      /** WebGL 2 texel format */
      RGB8I = 46,

      /** WebGL 2 texel format */
      RED_INTEGER = 47,
      /** WebGL 2 texel format */
      RG_INTEGER = 48,
      /** WebGL 2 texel format */
      RGB_INTEGER = 49,
      /** WebGL 2 texel format */
      RGBA_INTEGER = 50,

      /** WebGL 2 texel format */
      RED = 51,
      /** WebGL 2 texel format */
      RG = 52,

      /** WebGL 2 texel format */
      R8_SNORM = 53,
      /** WebGL 2 texel format */
      R16_SNORM = 54,
      /** WebGL 2 texel format */
      R32_SNORM = 55,
      /** WebGL 2 texel format */
      R8I = 56,
      /** WebGL 2 texel format */
      R16I = 57,
      /** WebGL 2 texel format */
      R32I = 58,
      /** WebGL 2 texel format */
      R16UI = 59,
      /** WebGL 2 texel format */
      R32UI = 60,
      /** WebGL 2 texel format */
      RG8_SNORM = 61,
      /** WebGL 2 texel format */
      RG8I = 62,
      /** WebGL 2 texel format */
      RG16I = 64,
      /** WebGL 2 texel format */
      RG32I = 65,
      /** WebGL 2 texel format */
      RGB8_SNORM = 66,
      // /** WebGL 2 texel format */
      // RGB16_SNORM = 67,
      // /** WebGL 2 texel format */
      // RGB32_SNORM = 68,
      /** WebGL 2 texel format */
      RGBA8_SNORM = 69,
      // /** WebGL 2 texel format */
      // RGBA16_SNORM = 70,
      // /** WebGL 2 texel format */
      // RGBA32_SNORM = 71,
      /** WebGL 2 texel format */
      RGB10_A2UI = 72,

      /** WebGL 2 texel format */
      DEPTH24_STENCIL8 = 73,
      /** WebGL 2 texel format */
      DEPTH32F_STENCIL8 = 74,
    }

    /**
     * This specifies hwo the texture data is unpacked when using gl.readPixels. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     * https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glPixelStorei.xml
     */
    export enum PackAlignment {
      /** Byte-alignment */
      ONE = 1,
      /** Rows aligned to even-numbered bytes */
      TWO = 2,
      /** Word-alignment */
      FOUR = 4,
      /** Rows start on double-word boundaries */
      EIGHT = 8,
    }

    /**
     * This specifies how the texture data is packed into memory (for gl.texImage2D and gl.texSubImage2D) See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     * https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glPixelStorei.xml
     */
    export enum UnpackAlignment {
      /** Byte-alignment */
      ONE = 1,
      /** Rows aligned to even-numbered bytes */
      TWO = 2,
      /** Word-alignment */
      FOUR = 4,
      /** Rows start on double-word boundaries */
      EIGHT = 8,
    }
  }

  /**
   * Settings associated with the Renderer
   */
  export namespace Renderer {
    /**
     * This specifies what data is read out and how
     */
    export enum ReadFilter {
      ALPHA,
      RGB,
      RGBA,
    }

    /**
     * Specifies the data format of the array buffer the data is read into
     */
    export enum ReadTargetArrayFormat {
      UNSIGNED_BYTE,
      UNSIGNED_SHORT_5_6_5,
      UNSIGNED_SHORT_4_4_4_4,
      UNSIGNED_SHORT_5_5_5_1,
      FLOAT,
    }
  }
}
