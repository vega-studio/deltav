import { Attribute } from "../../gl";
import { Instance } from "../../instance-provider/instance";
import { MetricsProcessing } from "../../shaders/processing/metrics-processing";
import { ILayerProps, Layer } from "../../surface/layer";
import { IInstanceAttribute, IInstancingUniform, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../types";
export declare type ShaderIOHeaderInjectionResult = {
    injection: string;
    geometry?: {
        attributes: {
            [key: string]: Attribute;
        };
    };
    material?: {
        uniforms: IInstancingUniform[];
    };
};
export declare type ShaderDeclarationStatements = Map<string, string>;
export declare abstract class BaseShaderIOInjection {
    setDeclaration(declarations: ShaderDeclarationStatements, key: string, value: string, debugMessageCtx?: string): void;
    abstract processHeaderInjection(target: ShaderInjectionTarget, declarations: ShaderDeclarationStatements, layer: Layer<Instance, ILayerProps<Instance>>, metrics: MetricsProcessing, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<Instance>[], uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
    abstract processAttributeDestructuring(layer: Layer<Instance, ILayerProps<Instance>>, declarations: ShaderDeclarationStatements, metrics: MetricsProcessing, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<Instance>[], uniforms: IUniform[]): string;
}
