import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { IInstanceAttribute, IInstancingUniform, IShaderInitialization, IShaders, IUniformInternal, IVertexAttributeInternal } from "../../types";
import { AttributeProcessing } from "./attribute-processing";
import { EasingProcessing } from "./easing-processing";
import { MetricsProcessing } from "./metrics-processing";
import { ShaderModuleUnit } from "./shader-module-unit";
import { UniformProcessing } from "./uniform-processing";
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
    easingProcessing: EasingProcessing;
    metricsProcessing: MetricsProcessing;
    uniformProcessing: UniformProcessing;
    attributeProcessing: AttributeProcessing;
    process<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, shaderIO: IShaderInitialization<T>): IShaderProcessingResults<T> | null;
    private processImports;
}
