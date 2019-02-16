/**
 * These are all of the settings that can be used to configure the GL state of the system
 */
export namespace GLSettings {
  export namespace Material {
    /**
     * Sets the blending function to be either a preset blending function or enables the
     * use of a Custom blending equation. WHen custom is set, the Dst, Src factors, and blending
     * equation settings come into play
     */
    export enum Blending {
      NoBlending = 0,
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
      Zero = 0,
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
      Zero = 0,
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
      Add = 0,
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
      NEVER = 0,
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
     */
    export enum CullSide {
      NONE = 0,
      FRONT = 1,
      BACK = 2,
      BOTH = 3,
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
      CUBE_MAP
    }

    /**
     * The wrap mode when reading values outside of 0 - 1 when sampling the texture. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    export enum Wrapping {
      REPEAT = 0,
      CLAMP_TO_EDGE = 1,
      MIRRORED_REPEAT = 2
    }

    /**
     * The interpolation method to use when sampling between texels when the render space is smaller than the texture. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    export enum TextureMinFilter {
      Nearest = 0,
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
      Nearest = 0,
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
      UnsignedByte = 0,
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
      Float32UnsignedInt_24_8_REV = 15
    }

    /**
     * This is the data format the texels in the texture will take on. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     */
    export enum TexelDataType {
      /**
       * Discards the red, green and blue components and reads the alpha component.
       * Pairs with: UNSIGNED_BYTE
       */
      Alpha = 0,
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
}
