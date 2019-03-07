import { Omit, TypeVec } from "../types";
import { GLProxy } from "./gl-proxy";
import { GLSettings } from "./gl-settings";
import { IMaterialUniform, MaterialUniformType } from "./types";
export declare type MaterialOptions = Omit<Partial<Material>, "clone" | "dispose" | "gl">;
export declare class Material {
    blending: {
        blendDst: GLSettings.Material.BlendingDstFactor;
        blendEquation: GLSettings.Material.BlendingEquations;
        blendSrc: GLSettings.Material.BlendingSrcFactor;
    } | null;
    colorWrite: TypeVec<boolean>;
    culling: GLSettings.Material.CullSide;
    depthFunc: GLSettings.Material.DepthFunctions;
    depthTest: boolean;
    depthWrite: boolean;
    dithering: boolean;
    fragmentShader: string;
    gl?: {
        fsId: WebGLShader;
        vsId: WebGLShader;
        programId: WebGLProgram;
        proxy: GLProxy;
    };
    polygonOffset?: {
        polygonOffsetFactor?: number;
        polygonOffsetUnits?: number;
    };
    uniforms: {
        [key: string]: IMaterialUniform<MaterialUniformType>;
    };
    vertexShader: string;
    constructor(options: MaterialOptions);
    clone(): Material;
    dispose(): void;
}
