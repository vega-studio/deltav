import { Instance } from "../../../instance-provider";
import { AutoEasingMethod } from "../../../math/auto-easing-method";
import { Vec } from "../../../math/vector";
import { ShaderDeclarationStatements, ShaderIOHeaderInjectionResult } from "../../../shaders/processing/base-shader-io-injection";
import { MetricsProcessing } from "../../../shaders/processing/metrics-processing";
import { ILayerProps, Layer } from "../../../surface/layer";
import { IInstanceAttribute, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../../types";
import { BaseIOExpansion, ShaderIOExpansion } from "../base-io-expansion";
/**
 * Make a utility method to make easing attributes easier to understand how to
 * construct.
 */
export declare function createEasingAttribute<T extends Instance>(attr: Omit<IInstanceAttribute<T>, "resource" | "childAttributes" | "parentAttribute" | "block" | "blockIndex"> & {
    easing: AutoEasingMethod<Vec>;
}): Omit<IInstanceAttribute<T>, "block" | "resource" | "childAttributes" | "parentAttribute" | "blockIndex"> & {
    easing: AutoEasingMethod<Vec>;
};
/**
 * This is an expansion handler for easing attributes.
 */
export declare class EasingIOExpansion extends BaseIOExpansion {
    /** This is used to make it easy to remember an easing attribute's original name */
    private baseAttributeName;
    /**
     * Provides expanded IO for attributes with easing properties.
     *
     * Most of this process is hijacking the existing easing attribute to inject it's own
     * update method to handle calculating current position to animate to a new position
     * when a value is changed.
     *
     * This also provides new child attributes that must be changed when the original attributes
     * value is changed.
     */
    expand<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): ShaderIOExpansion<T>;
    /**
     * Validates the IO about to be expanded.
     */
    validate<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): boolean;
    /**
     * Easing provides some unique destructuring for the packed in vertex
     * information.
     */
    processAttributeDestructuring(_layer: Layer<Instance, ILayerProps<Instance>>, declarations: ShaderDeclarationStatements, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<Instance>[], _uniforms: IUniform[]): string;
    /**
     * For easing, the header must be populated with the easing method
     */
    processHeaderInjection(target: ShaderInjectionTarget, declarations: ShaderDeclarationStatements, _layer: Layer<Instance, ILayerProps<Instance>>, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<Instance>[], _uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
}
