import { Instance } from "../../../instance-provider/instance";
import { ShaderDeclarationStatements } from "../../../shaders/processing/base-shader-io-injection";
import { MetricsProcessing } from "../../../shaders/processing/metrics-processing";
import { ILayerProps, Layer } from "../../../surface/layer";
import { BaseIOExpansion } from "../../../surface/layer-processing/base-io-expansion";
import { IInstanceAttribute, IUniform, IVertexAttribute } from "../../../types";
export declare class ActiveIOExpansion extends BaseIOExpansion {
    processAttributeDestructuring(_layer: Layer<Instance, ILayerProps<Instance>>, declarations: ShaderDeclarationStatements, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<Instance>[], _uniforms: IUniform[]): string;
}
