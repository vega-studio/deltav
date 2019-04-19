import { Instance } from "../../../instance-provider";
import { ShaderDeclarationStatements, ShaderIOHeaderInjectionResult } from "../../../shaders/processing/base-shader-io-injection";
import { MetricsProcessing } from "../../../shaders/processing/metrics-processing";
import { ILayerProps, Layer } from "../../../surface/layer";
import { IInstanceAttribute, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../../types";
import { BaseIOExpansion, ShaderIOExpansion } from "../base-io-expansion";
export declare class EasingIOExpansion extends BaseIOExpansion {
    private baseAttributeName;
    expand<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): ShaderIOExpansion<T>;
    validate<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): boolean;
    processAttributeDestructuring(_layer: Layer<Instance, ILayerProps<Instance>>, declarations: ShaderDeclarationStatements, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<Instance>[], _uniforms: IUniform[]): string;
    processHeaderInjection(target: ShaderInjectionTarget, declarations: ShaderDeclarationStatements, _layer: Layer<Instance, ILayerProps<Instance>>, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<Instance>[], _uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
}
