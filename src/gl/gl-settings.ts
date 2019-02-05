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
      ZeroFactor = 0,
      OneFactor = 1,
      SrcColorFactor = 2,
      OneMinusSrcColorFactor = 3,
      SrcAlphaFactor = 4,
      OneMinusSrcAlphaFactor = 5,
      DstAlphaFactor = 6,
      OneMinusDstAlphaFactor = 7,
      DstColorFactor = 8,
      OneMinusDstColorFactor = 9,
    }

    /**
     * Specifies the Source factor for the blending equation see:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
     */
    export enum BlendingSrcFactor {
      SrcAlphaSaturateFactor = 10,
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
}
