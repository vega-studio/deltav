import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { IInstanceAttribute, IInstancingUniform, IShaders, IUniform, IVertexAttribute } from "../../types";
import { AttributeProcessing } from "./attribute-processing";
import { EasingProcessing } from "./easing-processing";
import { MetricsProcessing } from "./metrics-processing";
import { UniformProcessing } from "./uniform-processing";
export interface IShaderProcessingResults {
    fs: string;
    materialUniforms: IInstancingUniform[];
    maxInstancesPerBuffer: number;
    vs: string;
}
export declare class ShaderProcessor {
    easingProcessing: EasingProcessing;
    metricsProcessing: MetricsProcessing;
    uniformProcessing: UniformProcessing;
    attributeProcessing: AttributeProcessing;
    process<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, shaders: IShaders, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<T>[], uniforms: IUniform[]): IShaderProcessingResults | null;
    private processImports;
}
