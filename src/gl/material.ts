import { Omit, TypeVec } from '../types';
import { GLProxy } from './gl-proxy';
import { GLSettings } from './gl-settings';
import { IMaterialUniform, MaterialUniformType } from './types';

export type MaterialOptions = Omit<Partial<Material>, "clone" | "dispose" | "gl">;

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
    blendDst: GLSettings.Material.BlendingDstFactor.OneMinusSrcAlpha,
    blendEquation: GLSettings.Material.BlendingEquations.Add,
    blendSrc: GLSettings.Material.BlendingSrcFactor.SrcAlpha,
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
    proxy: GLProxy;
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

  constructor(options: MaterialOptions) {
    // Take in the properties
    Object.assign(this, options);
    // Ensure the gl property did not get copied in if using the copy constructor new Material(Material)
    delete this.gl;
  }

  /**
   * Makes a duplicate material with identical settings as this material. It provides the
   * benefit of being able to adjust uniform values for the new material while sharing the same
   * programs and shaders.
   */
  clone() {
    // Make a new copy material container and copy over the properties (shallow copy)
    const copy = new Material(this);
    // Now we deeper copy any sub objects
    copy.blending = Object.assign({}, this.blending);
    copy.polygonOffset = Object.assign({}, this.polygonOffset);
    // And last we need a deep copy of uniforms, such that we get new uniform objects
    copy.uniforms = Object.assign({}, this.uniforms);

    // Deeper copy objects
    // We DO NOT copy the data object as it is expected to be able to share data buffers
    // between uniforms.
    for (const name in copy.uniforms) {
      const uniform: IMaterialUniform<MaterialUniformType> = copy.uniforms[name];

      // Make sure the gl references are the same but their own object
      if (uniform.gl) {
        const newLocations = new Map();
        uniform.gl.forEach((location, program) => {
          newLocations.set(program, Object.assign({}, location));
        });
      }
    }

    return copy;
  }

  /**
   * This frees up all GL resources utilized by this material.
   */
  dispose() {
    if (this.gl) {
      this.gl.proxy.disposeMaterial(this);
    }
  }
}
