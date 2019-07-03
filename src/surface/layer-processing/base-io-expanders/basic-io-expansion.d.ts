import { Instance } from "../../../instance-provider/instance";
import { ShaderDeclarationStatements, ShaderIOHeaderInjectionResult } from "../../../shaders/processing/base-shader-io-injection";
import { MetricsProcessing } from "../../../shaders/processing/metrics-processing";
import { ILayerProps, Layer } from "../../../surface/layer";
import { BaseIOExpansion } from "../../../surface/layer-processing/base-io-expansion";
import { IInstanceAttribute, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../../types";
export declare class BasicIOExpansion extends BaseIOExpansion {
    private generateUniformAttributePacking;
    processAttributeDestructuring(layer: Layer<Instance, ILayerProps<Instance>>, declarations: ShaderDeclarationStatements, metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<Instance>[], _uniforms: IUniform[]): string;
    private processDestructuringInstanceAttribute;
    private processDestructuringInstanceAttributePacking;
    private processDestructuringUniformBuffer;
    private processDestructureBlocks;
    processHeaderInjection(target: ShaderInjectionTarget, declarations: ShaderDeclarationStatements, layer: Layer<Instance, ILayerProps<Instance>>, metrics: MetricsProcessing, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<Instance>[], uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
    private processAttributeHeader;
    private processUniformHeader;
    private processInstanceAttributeBufferStrategy;
    private processInstanceAttributePackingBufferStrategy;
    private processVertexAttributes;
}
