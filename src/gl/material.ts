import { Omit, TypeVec } from '../types';
import { GLSettings } from './gl-settings';
import { GPUProxy } from './gpu-proxy';
import { IMaterialUniform, MaterialUniformType } from './types';

/**
 * This represents a Shader configuration and a state for the configuration to be applied
 * when a model is rendered.
 */
export class Material {
  /** This is the computed blend mode state. Set to null to deactivate */
  blending: {
    blendDst: GLSettings.Material.BlendingDstFactor;
    blendEquation: GLSettings.Material.BlendingEquations;
    blendSrc: GLSettings.Material.BlendingSrcFactor;
  } | null = {
    blendDst: GLSettings.Material.BlendingDstFactor.One,
    blendEquation: GLSettings.Material.BlendingEquations.Add,
    blendSrc: GLSettings.Material.BlendingSrcFactor.Zero,
  };
  /**
   * The write mask to the color buffer. Each channel can be toggled on or off as the color buffer is written to. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
   */
  colorWrite: TypeVec<boolean> = [true, true, true, true];
  /** Sets the cull mode of GL for the polygons */
  culling: GLSettings.Material.CullSide = GLSettings.Material.CullSide.BACK;
  /** The comparator used to classify when a fragment will be rendered vs discarded when tested against the depth buffer */
  depthFunc: GLSettings.Material.DepthFunctions = GLSettings.Material.DepthFunctions.LESS;
  /**
   * Enable / disable depth test (determines if the fragment depth is compared to the depth buffer before writing). See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
   */
  depthTest: boolean = true;
  /**
   * Enable / disable depth mask (determines if fragments write to the depth buffer). See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthMask
   */
  depthWrite: boolean = true;
  /**
   * Sets whether or not GL should use it's dithering routine. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
   */
  dithering: boolean = true;
  /** The fragment shader in raw text format that will be compiled to run as the program to use when this material is used */
  fragmentShader: string = '';
  /**
   * Stores any gl state associated with this object. Modifying this outside the framework
   * is almost guaranteed to break something.
   */
  gl?: {
    fsId: WebGLShader;
    vsId: WebGLShader;
    programId: WebGLProgram;
    proxy: GPUProxy;
  };
  /**
   * TODO: This is NOT IN USE YET
   * GL Polygon offset settings. When set, enables polygon offset modes within the gl state. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/polygonOffset
   */
  polygonOffset?: {
    polygonOffsetFactor?: number;
    polygonOffsetUnits?: number;
  };

  /** Uniforms that will be synced with the GPU when this material is used */
  uniforms: { [key: string]: IMaterialUniform<MaterialUniformType> } = {};
  /** The vertex shader that will be compiled to run as the program to use when this material is used */
  vertexShader: string = '';

  constructor(options: Omit<Partial<Material>, "applyBlendModePreset" | "gl">) {
    Object.assign(this, options);
  }

  /**
   * This grabs a blend mode preset and sets up a proper equation for it.
   */
  applyBlendModePreset(blending: GLSettings.Material.Blending) {
    // TODO
  }
}
