import { Instance } from "../../instance-provider/instance";
import { BaseShaderIOInjection, ShaderIOHeaderInjectionResult } from "../../shaders/processing/base-shader-io-injection";
import { MetricsProcessing } from "../../shaders/processing/metrics-processing";
import { IInstanceAttribute, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../types";
import { ILayerProps, Layer } from "../layer";
export declare type ShaderIOExpansion<T extends Instance> = {
    instanceAttributes: IInstanceAttribute<T>[];
    uniforms: IUniform[];
    vertexAttributes: IVertexAttribute[];
};
export declare abstract class BaseIOExpansion extends BaseShaderIOInjection {
    expand<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, _instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): ShaderIOExpansion<T>;
    validate<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, _instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): boolean;
    processHeaderInjection(_target: ShaderInjectionTarget, _declarations: Map<string, string>, _layer: Layer<Instance, ILayerProps<Instance>>, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], _instanceAttributes: IInstanceAttribute<Instance>[], _uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
    processAttributeDestructuring(_layer: Layer<Instance, ILayerProps<Instance>>, _declarations: Map<string, string>, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], _instanceAttributes: IInstanceAttribute<Instance>[], _uniforms: IUniform[]): string;
}
