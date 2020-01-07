import { Omit, TypeVec } from "../types";
import { GLProxy } from "./gl-proxy";
import { GLSettings } from "./gl-settings";
import { IMaterialUniform, MaterialUniformType } from "./types";
export declare type MaterialOptions = Omit<Partial<Material>, "clone" | "dispose" | "gl">;
/**
 * This represents a Shader configuration and a state for the configuration to be applied
 * when a model is rendered.
 */
export declare class Material {
    /** This is the computed blend mode state. Set to null to deactivate */
    blending: {
        blendDst: GLSettings.Material.BlendingDstFactor;
        blendEquation: GLSettings.Material.BlendingEquations;
        blendSrc: GLSettings.Material.BlendingSrcFactor;
    } | null;
    /**
     * The write mask to the color buffer. Each channel can be toggled on or off as the color buffer is written to. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
     */
    colorWrite: TypeVec<boolean>;
    /** Sets the cull mode of GL for the polygons */
    culling: GLSettings.Material.CullSide;
    /** The comparator used to classify when a fragment will be rendered vs discarded when tested against the depth buffer */
    depthFunc: GLSettings.Material.DepthFunctions;
    /**
     * Enable / disable depth test (determines if the fragment depth is compared to the depth buffer before writing). See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
     */
    depthTest: boolean;
    /**
     * Enable / disable depth mask (determines if fragments write to the depth buffer). See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthMask
     */
    depthWrite: boolean;
    /**
     * Sets whether or not GL should use it's dithering routine. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enable
     */
    dithering: boolean;
    /** The fragment shader in raw text format that will be compiled to run as the program to use when this material is used */
    fragmentShader: string;
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
    /** A name for the  */
    name: string;
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
    uniforms: {
        [key: string]: IMaterialUniform<MaterialUniformType>;
    };
    /** The vertex shader that will be compiled to run as the program to use when this material is used */
    vertexShader: string;
    constructor(options: MaterialOptions);
    /**
     * Makes a duplicate material with identical settings as this material. It provides the
     * benefit of being able to adjust uniform values for the new material while sharing the same
     * programs and shaders.
     */
    clone(): Material;
    /**
     * This frees up all GL resources utilized by this material.
     */
    dispose(): void;
}
