import { GLSettings } from './gl-settings';
import { IMaterialUniform } from './types';

/**
 * This represents a Shader configuration and a state for the configuration to be applied
 * when a model is rendered.
 */
export class Material {
  /** Set a preset blend mode or insert a custom blending euqation state */
  blending?: GLSettings.Material.Blending | {
    blendDst?: GLSettings.Material.BlendingDstFactor;
    blendEquation?: GLSettings.Material.BlendingEquations;
    blendSrc?: GLSettings.Material.BlendingSrcFactor;
  };
  /**
   * The write mask to the color buffer. Each channel can be toggled on or off as the color buffer is written to. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
   */
  colorWrite?: [boolean, boolean, boolean, boolean];
  /** Sets the cull mode of GL for the polygons */
  culling?: GLSettings.Material.CullSide;
  /** The comparator used to classify when a fragment will be rendered vs discarded when tested against the depth buffer */
  depthFunc?: GLSettings.Material.DepthFunctions;
  /**
   * Enable / disable depth test (determines if the fragment depth is compared to the depth buffer before writing). See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
   */
  depthTest?: boolean;
  /**
   * Enable / disable depth mask (determines if fragments write to the depth buffer). See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthMask
   */
  depthWrite?: boolean;
  /**
   * Sets whether or not GL should use it's dithering routine. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
   */
  dithering?: boolean;
  /** The fragment shader in raw text format that will be compiled to run as the program to use when this material is used */
  fragmentShader?: string;
  /** Stores any gl state associated with this object */
  gl = {

  };
  /**
   * GL Polygon offset settings. When set, enables polygon offset modes within the gl state. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/polygonOffset
   */
  // polygonOffset?: {
  //   polygonOffsetFactor?: number;
  //   polygonOffsetUnits?: number;
  // };
  /** Uniforms that will be pushed to the GPU when this is rendered */
  uniforms?: { [key: string]: IMaterialUniform };
  /** The vertex shader that will be compiled to run as the program to use when this material is used */
  vertexShader?: string;
}
