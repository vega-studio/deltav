import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { BaseIOSorting } from "./base-io-sorting";
import { BaseShaderTransform } from "./base-shader-transform";
import { type IIndexBufferInternal, IInstanceAttribute, IInstancingUniform, IShaderInitialization, IUniformInternal, IVertexAttributeInternal, MapValueType, OutputFragmentShader, OutputFragmentShaderSource, OutputFragmentShaderTarget } from "../../types";
import { ILayerProps, Layer } from "../../surface/layer";
import { Instance } from "../../instance-provider/instance";
import { MetricsProcessing } from "./metrics-processing";
import { ShaderDeclarationStatementLookup, ShaderDeclarationStatements } from "./base-shader-io-injection";
import { ShaderModuleUnit } from "./shader-module-unit";
/**
 * This is the expected results from processing the shader and it's layer's attributes.
 */
export interface IShaderProcessingResults<T extends Instance> {
    /** The resulting fragment shaders from processing the module */
    fs: OutputFragmentShader;
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
    /** The index buffer that arises after module processing */
    indexBuffer?: IIndexBufferInternal;
}
/** Expected results from processing shader imports */
export type ProcessShaderImportResults = {
    fs: OutputFragmentShader;
    vs: string;
    shaderModuleUnits: Set<ShaderModuleUnit>;
} | null;
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
     * This takes in multiple fragment shaders and merges them together based on
     * their main() methods. All elements outside of the main() method will be
     * merged as header information in the order they are discovered.
     *
     * All contents of the main's will be merged together as well in the order
     * they are discovered.
     *
     * Additionally, this discovers outputs declared in the shader in the form of
     * ${out: <name>} tokens. These will be used to aid in making a shader that
     * will be compatible with ES 3.0 AND 2.0 shaders.
     */
    static mergeFragmentOutputsForMRT(_declarationsVS: ShaderDeclarationStatements, declarationsFS: ShaderDeclarationStatements, layerOutputs: {
        source: string;
        outputType: number;
    }[], viewOutputs: number[], typeFilter?: number[], singleOutput?: boolean): {
        output: string;
        outputNames: string[];
        outputTypes: number[];
    };
    /**
     * This merges output for the fragment shader when we are simply outputting to
     * a single COLOR target the view specifies. This means we look for an output
     * from the layer that is a COLOR output and merge all fragments up to that
     * output, we clear out any templating variables, and for WebGL1 we make it
     * output to gl_FragColor and for WebGL2 we output to _FragColor and make an
     * out declarartion for it.
     */
    static mergeOutputFragmentShaderForColor(layerOutputs: OutputFragmentShaderSource, viewOutputs: number[]): {
        output: string;
        outputNames: string[];
        outputTypes: number[];
    };
    /**
     * This analyzes desired target outputs and available outputs that output to
     * certain output types. This will match the targets with the available
     * outputs and produce shaders that reflect the capabilities
     * available of both target and provided outputs.
     *
     * This also takes into account the capabilities of the hardware. If MRT is
     * supported, the generated shaders will be combined as best as possible. If
     * MRT is NOT supported, this will generate MULTIPLE SHADERS, a shader for
     * each output capable of delivering the targetted output specified.
     */
    static makeOutputFragmentShader(declarationsVS: ShaderDeclarationStatements, declarationsFS: ShaderDeclarationStatements, viewOutputs?: OutputFragmentShaderTarget | null, layerOutputs?: OutputFragmentShaderSource): MapValueType<OutputFragmentShader> | null;
    /**
     * This processes a layer, it's Shader IO requirements, and it's shaders to
     * produce a fully functional shader that is compatible with the client's
     * system.
     */
    process<TInstance extends Instance, TProps extends ILayerProps<TInstance>>(layer: Layer<TInstance, TProps>, shaderIO: IShaderInitialization<TInstance>, fragmentShaders: OutputFragmentShader, shaderDeclarations: ShaderDeclarationStatementLookup, ioExpansion: BaseIOExpansion[], transforms: BaseShaderTransform[], sortIO: BaseIOSorting): IShaderProcessingResults<TInstance> | null;
    /**
     * This processes all information available about the shader to determine
     * which extensions must be available for the shader to work.
     */
    private processExtensions;
    /**
     * This applies the imports for the specified layer and generates the
     * appropriate shaders from the output. Upon failure, this will just return
     * null.
     *
     * This also does some additional work to add in some modules based on the
     * layer's preferences
     */
    private processImports;
}
