import { Instance } from "../../instance-provider/instance";
import { BaseIOSorting } from "../../surface/base-io-sorting";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { IInstanceAttribute, IInstancingUniform, IShaderInitialization, IShaders, IUniformInternal, IVertexAttributeInternal } from "../../types";
import { MetricsProcessing } from "./metrics-processing";
import { ShaderModuleUnit } from "./shader-module-unit";
export interface IShaderProcessingResults<T extends Instance> {
    fs: string;
    materialUniforms: IInstancingUniform[];
    maxInstancesPerBuffer: number;
    modules: ShaderModuleUnit[];
    vs: string;
    instanceAttributes: IInstanceAttribute<T>[];
    vertexAttributes: IVertexAttributeInternal[];
    uniforms: IUniformInternal[];
}
export declare type ProcessShaderImportResults = (IShaders & {
    shaderModuleUnits: Set<ShaderModuleUnit>;
}) | null;
export declare class ShaderProcessor {
    metricsProcessing: MetricsProcessing;
    process<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, shaderIO: IShaderInitialization<T>, ioExpansion: BaseIOExpansion[], sortIO: BaseIOSorting): IShaderProcessingResults<T> | null;
    private processImports;
}
