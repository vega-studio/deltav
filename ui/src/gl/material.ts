import { MapValueType, Omit, OutputFragmentShader, TypeVec } from "../types.js";
import { GLProxy } from "./gl-proxy.js";
import { GLSettings } from "./gl-settings.js";
import { RenderTarget } from "./render-target.js";
import { IMaterialUniform, MaterialUniformType } from "./types.js";
import type { UniformBuffer } from "./uniform-buffer.js";

/**
 * All configuration options for seting a material.
 */
export type MaterialOptions = Omit<
  Partial<Material>,
  "clone" | "dispose" | "gl"
>;

/**
 * Material settings that changes gl state but not gl object model.
 */
export type MaterialSettings = Omit<
  Partial<Material>,
  "clone" | "dispose" | "gl" | "name" | "vertexShader" | "fragmentShader"
>;

/**
 * For materials, we narrow the definition of a fragment shader mapping. It
 * specifically maps RenderTargets (provided from the view) to the output
 * fragment shader. This helps decouple our GL layer from the deltav constructs.
 */
export type MaterialFragmentShader = Map<
  RenderTarget | null,
  MapValueType<OutputFragmentShader>
>;

/**
 * This represents a Shader configuration and a state for the configuration to
 * be applied when a model is rendered.
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
   * The write mask to the color buffer. Each channel can be toggled on or off
   * as the color buffer is written to. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
   */
  colorWrite: TypeVec<boolean> = [true, true, true, true];
  /** Sets the cull mode of GL for the polygons */
  culling: GLSettings.Material.CullSide = GLSettings.Material.CullSide.CCW;
  /** The comparator used to classify when a fragment will be rendered vs
   * discarded when tested against the depth buffer */
  depthFunc: GLSettings.Material.DepthFunctions =
    GLSettings.Material.DepthFunctions.LESS_OR_EQUAL;
  /**
   * Enable / disable depth test (determines if the fragment depth is compared
   * to the depth buffer before writing). See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
   */
  depthTest = true;
  /**
   * Enable / disable depth mask (determines if fragments write to the depth
   * buffer). See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthMask
   */
  depthWrite = true;
  /**
   * Sets whether or not GL should use it's dithering routine. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
   */
  dithering = true;
  /**
   * The fragment shader in raw text format that will be compiled to run as the
   * program to use when this material is used.
   *
   * This is more complex than just a simple raw text format. Fragment shaders
   * can output to multiple targets or be divided into multiple fragments for
   * the sake of outputting to multiple targets.
   *
   * Thus, each fragment is asociated with one or more outputTypes to indicate
   * the type of information the fragments can offer. This works in conjunction
   * with RenderTargets who have expected information types to be written to
   * them.
   *
   * The system will examine the current render target (which can be a custom
   * target OR can be the SCREEN) and look at these fragment shader style
   * outputs and determine which shader is most efficient and appropriate for
   * rendering to the current RenderTarget.
   */
  fragmentShader?: MaterialFragmentShader;
  /**
   * Stores any gl state associated with this object. Modifying this outside the
   * framework is almost guaranteed to break something.
   */
  gl?: {
    fsId: { id: WebGLShader; outputTypes: number[] }[];
    vsId: WebGLShader;
    /**
     * We create a program PER vertex + fragment shader combo. Thus a program is
     * tied to output capabilities just as much as a fragment shader.
     */
    programId: { id: WebGLProgram; outputTypes: number[] }[];
    /**
     * This is a lookup reference for finding a program that best matches a
     * render target. This is a weak reference so it will only help speed up
     * lookups but won't require any additional clean up.
     */
    programByTarget: WeakMap<RenderTarget, WebGLProgram>;
    /**
     * Easy lookup to find the output types of a given program. Used to help
     * quickly determine our drawBuffers to utilize for MRT.
     */
    outputsByProgram: WeakMap<WebGLProgram, number[]>;
    /**
     * Reference to the glProxy so this object can properly call the correct
     * context to manage this resource.
     */
    proxy: GLProxy;
  };
  /**
   * A name for the material. Helps with identifying the material and aids in
   * debugging
   */
  name = "";
  /**
   * TODO: This is NOT IN USE YET
   *
   * GL Polygon offset settings. When set, enables polygon offset modes within
   * the gl state. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/polygonOffset
   */
  polygonOffset?: {
    polygonOffsetFactor?: number;
    polygonOffsetUnits?: number;
  };

  /** Uniforms that will be synced with the GPU when this material is used */
  uniforms: { [key: string]: IMaterialUniform<MaterialUniformType> } = {};

  /** Uniform buffers that will be synced with the GPU when this material is used */
  uniformBuffers: { [key: string]: UniformBuffer } = {};

  /**
   * The vertex shader that will be compiled to run as the program to use when
   * this material is used.
   */
  vertexShader = "";

  constructor(options: MaterialOptions) {
    // Take in the properties
    Object.assign(this, options);
    // Ensure the gl property did not get copied in if using the copy
    // constructor new Material(Material)
    delete this.gl;
  }

  /**
   * Makes a duplicate material with identical settings as this material. It
   * provides the benefit of being able to adjust uniform values for the new
   * material while sharing the same programs and shaders.
   */
  clone() {
    // Make a new copy material container and copy over the properties (shallow
    // copy)
    const copy = new Material(this);
    // Now we deeper copy any sub objects
    copy.blending = Object.assign({}, this.blending);
    copy.polygonOffset = Object.assign({}, this.polygonOffset);
    // And last we need a deep copy of uniforms, such that we get new uniform
    // objects
    copy.uniforms = Object.assign({}, this.uniforms);

    // Deeper copy objects We DO NOT copy the data object as it is expected to
    // be able to share data buffers between uniforms.
    for (const name in copy.uniforms) {
      const uniform: IMaterialUniform<MaterialUniformType> =
        copy.uniforms[name];

      // Make sure the gl references are the same but their own object
      if (uniform.gl) {
        const newLocations = new Map();
        uniform.gl.forEach((location, program) => {
          newLocations.set(program, Object.assign({}, location));
        });
      }
    }

    copy.uniformBuffers = Object.assign({}, this.uniformBuffers);

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
