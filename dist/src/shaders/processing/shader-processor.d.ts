import { Instance } from "../../instance-provider/instance";
import { BaseIOSorting } from "../../surface/base-io-sorting";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { IInstanceAttribute, IInstancingUniform, IShaderInitialization, IShaders, IUniformInternal, IVertexAttributeInternal } from "../../types";
import { MetricsProcessing } from "./metrics-processing";
import { ShaderModuleUnit } from "./shader-module-unit";
/**
 * This is the expected results from processing the shader and it's layer's attributes.
 */
export interface IShaderProcessingResults<T extends Instance> {
    /** The resulting fragment shader from processing the module */
    fs: string;
    /** Any additional system uniforms that arose from the processing */
    materialUniforms: IInstancingUniform[];
    /** Calculated max instances per buffer (mostly for uniform packing procedures) */
    maxInstancesPerBuffer: number;
    /** The modules that were included within the module processing */
    modules: ShaderModuleUnit[];
    /** The resulting vertex shader from processing the module */
    vs: string;
    /** All instance attributes that arise from module processing */
    instanceAttributes: IInstanceAttribute<T>[];
    /** All vertex attributes that arise from module processing */
    vertexAttributes: IVertexAttributeInternal[];
    /** All uniform attributes that arise from module processing */
    uniforms: IUniformInternal[];
}
/** Expected results from processing shader imports */
export declare type ProcessShaderImportResults = (IShaders & {
    shaderModuleUnits: Set<ShaderModuleUnit>;
}) | null;
/**
 * The intent of this processor is to analyze a layer's Shader IO elements and produce a functional
 * shader from those elements. This includes supporting a layer's capabilties with the client systems
 * capabilities and matching compatibilities.
 *
 * This inlcudes:
 *
 * Injecting needed module imports based on the layers specifications
 * Resolving Module imports and handling errors
 * Utilizing layer information to create attributes and uniforms based on attribute packing strategies
 * Destructuring attributes based on easing requirements or if attributes were packed
 * Swapping out miscellaneous template variables
 */
export declare class ShaderProcessor {
    /** Processor that calculates shared metrics across all processors */
    metricsProcessing: MetricsProcessing;
    /**
     * This processes a layer, it's Shader IO requirements, and it's shaders to produce a fully functional
     * shader that is compatible with the client's system.
     */
    process<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, shaderIO: IShaderInitialization<T>, ioExpansion: BaseIOExpansion[], sortIO: BaseIOSorting): IShaderProcessingResults<T> | null;
    /**
     * This applies the imports for the specified layer and generates the appropriate shaders from the output.
     * Upon failure, this will just return null.
     *
     * This also does some additional work to add in some modules based on the layer's preferences
     */
    private processImports;
}
