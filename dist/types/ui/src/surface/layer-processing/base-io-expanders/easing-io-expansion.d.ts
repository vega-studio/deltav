import { AutoEasingMethod } from "../../../math/auto-easing-method";
import { BaseIOExpansion, ShaderIOExpansion } from "../base-io-expansion";
import { IInstanceAttribute, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../../types";
import { ILayerProps, Layer } from "../../../surface/layer";
import { Instance } from "../../../instance-provider";
import { MetricsProcessing } from "../../../shaders/processing/metrics-processing";
import { ShaderDeclarationStatements, ShaderIOHeaderInjectionResult } from "../../../shaders/processing/base-shader-io-injection";
import { Vec } from "../../../math/vector";
/**
 * Make a utility method to make easing attributes easier to understand how to
 * construct.
 */
export declare function createEasingAttribute<T extends Instance>(attr: Omit<IInstanceAttribute<T>, "resource" | "childAttributes" | "parentAttribute" | "block" | "blockIndex"> & {
    easing: AutoEasingMethod<Vec>;
}): Omit<IInstanceAttribute<T>, "resource" | "childAttributes" | "parentAttribute" | "block" | "blockIndex"> & {
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
    processAttributeDestructuring<TInstance extends Instance, TProps extends ILayerProps<TInstance>>(_layer: Layer<TInstance, TProps>, declarations: ShaderDeclarationStatements, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<TInstance>[], _uniforms: IUniform[]): string;
    /**
     * For easing, the header must be populated with the easing method
     */
    processHeaderInjection<TInstance extends Instance, TProps extends ILayerProps<TInstance>>(target: ShaderInjectionTarget, declarations: ShaderDeclarationStatements, _layer: Layer<TInstance, TProps>, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<TInstance>[], _uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
}
