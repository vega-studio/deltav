import { ShaderInjectionTarget } from "../../types";
import { ShaderModuleUnit, ShaderModuleUnitOptions } from "./shader-module-unit";
export interface IShaderCompileResults {
    errors: string[];
    shader: string | null;
    shaderModuleUnits: Set<ShaderModuleUnit>;
}
export declare class ShaderModule {
    static modules: Map<string, {
        fs?: ShaderModuleUnit | undefined;
        vs?: ShaderModuleUnit | undefined;
    }>;
    static register(unit: ShaderModuleUnit | ShaderModuleUnitOptions | ShaderModuleUnitOptions[]): string | null;
    static analyzeDependents(unit: ShaderModuleUnit): string[];
    static process(id: string, shader: string, target: ShaderInjectionTarget, additionalModules?: string[]): IShaderCompileResults;
}
