import { Instance } from "../../../instance-provider/instance.js";
import { ShaderDeclarationStatements } from "../../../shaders/processing/base-shader-io-injection.js";
import { MetricsProcessing } from "../../../shaders/processing/metrics-processing.js";
import { ILayerProps, Layer } from "../../../surface/layer.js";
import { BaseIOExpansion } from "../../../surface/layer-processing/base-io-expansion.js";
import { IInstanceAttribute, IUniform, IVertexAttribute } from "../../../types.js";
/**
 * This is a special case io expander that handles detecting the _active
 * attribute and properly injecting the _active handler in the destructuring
 * phase.
 *
 * Any IO expansion that writes destructuring logic will have it's destructuring
 * logic
 */
export declare class ActiveIOExpansion extends BaseIOExpansion {
    processAttributeDestructuring<TInstance extends Instance, TLayerProps extends ILayerProps<TInstance>>(_layer: Layer<TInstance, TLayerProps>, declarations: ShaderDeclarationStatements, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<TInstance>[], _uniforms: IUniform[]): string;
}
