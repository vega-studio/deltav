import { ShaderInjectionTarget } from "../../types.js";
import { ShaderModuleUnit, ShaderModuleUnitOptions } from "./shader-module-unit.js";
/**
 * This is the results expected from a compile() operation from the
 * ShaderModule.
 */
export interface IShaderCompileResults {
    /** Error messages generated from analyzing the shaders */
    errors: string[];
    /** The generated shader from analyzing the module */
    shader: string | null;
    /** The shader module units discovered during the processing of the module */
    shaderModuleUnits: Set<ShaderModuleUnit>;
}
/**
 * This file defines modules for shaders. Shader modules are global to the
 * window context.
 */
export declare class ShaderModule {
    /**
     * These are all of the currently registered modules for the Shader Modules
     */
    static modules: Map<string, {
        fs?: ShaderModuleUnit;
        vs?: ShaderModuleUnit;
    }>;
    /**
     * This registers a new ShaderModuleUnit. It makes the module available by
     * it's importId within shaders using this framework.
     *
     * If the module is registered with no returned output, the registration was a
     * success. Any returned output indicates issues encountered while registering
     * the module.
     */
    static register(unit: ShaderModuleUnit | ShaderModuleUnitOptions | ShaderModuleUnitOptions[]): string | null;
    /**
     * This gathers all of the dependents for the module as ids. This also causes
     * the contents of the module to be stripped of it's import statements.
     */
    static analyzeDependents(unit: ShaderModuleUnit): string[];
    /**
     * This examines a shader string and replaces all import statements with any
     * existing registered modules. This will also output any issues such as
     * requested modules that don't exist and detect circular dependencies and
     * such ilk.
     *
     * @param shader The content of the shader to analyze for import statements
     * @param target The shader target type to consider
     * @param additionalModules Additional modules to include in the shader
     *                          regardless if the shader requested it or not
     */
    static process(id: string, shader: string, target: ShaderInjectionTarget, additionalModules?: string[]): IShaderCompileResults;
}
