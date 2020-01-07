import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { IInstanceAttribute, IUniform, IVertexAttribute, Omit, ShaderInjectionTarget } from "../../types";
/** Options for the constructor for a new ShaderModuleUnit */
export declare type ShaderModuleUnitOptions = Omit<Partial<ShaderModuleUnit>, "lock">;
/**
 * This is a module unit that can be registered as a ShaderModule which the system will use to resolve
 * imports within a shader.
 */
export declare class ShaderModuleUnit {
    private _isLocked;
    private _content;
    private _compatibility;
    private _moduleId;
    private _dependents;
    /**
     * This is the content that replaces shader imports
     */
    content: string;
    /**
     * This defines which shader type the content is compatible with. You can only have one content assigned
     * per each ShaderInjectionTarget type. Thus you can have a module such as 'picking' with two unique implementations
     * one for Fragment and one for Vertex shaders. Or you can assign it to both.
     */
    compatibility: ShaderInjectionTarget;
    /**
     * This is the list of module id dependents this unit will need. We store
     * this here so the module can be analyzed once. Import statements will be stripped and the sub module contents will
     * be added to the top of the contents of the shader. This only stores ids, as the ids will still need to be analyzed
     * so duplication can be prevented.
     */
    dependents: string[] | null;
    /**
     * Method for the unit to provide instance attributes for the module
     */
    instanceAttributes?<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>): IInstanceAttribute<T>[];
    /**
     * Indicates this unit cannot be modified anymore.
     */
    isLocked(): boolean;
    /**
     * Allows a module to prevent overrides by another module using the same moduleId.
     * Attempted overrides will throw warnings.
     */
    isFinal?: boolean;
    /** This is the string ID a shader must use to include the provided content. */
    moduleId: string;
    /**
     * Method so the unit can provide uniforms for the module.
     */
    uniforms?<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>): IUniform[];
    /**
     * Method so the unit can provide vertex attributes for the module.
     */
    vertexAttributes?<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>): IVertexAttribute[];
    /**
     * Default ctor for creating a new Shader Module Unit to be registered with the system.
     */
    constructor(options: ShaderModuleUnitOptions);
    /**
     * Applies the content after it's been processed for import statements. You can not set the content this way
     * again after processing has happened.
     */
    applyAnalyzedContent(content: string): void;
    /**
     * Makes this unit unable to be modified in anyway
     */
    lock(): void;
}
