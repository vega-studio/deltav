import { Instance } from "../../instance-provider/instance";
import { BaseShaderIOInjection, ShaderIOHeaderInjectionResult } from "../../shaders/processing/base-shader-io-injection";
import { MetricsProcessing } from "../../shaders/processing/metrics-processing";
import { IInstanceAttribute, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../types";
import { ILayerProps, Layer } from "../layer";
export declare type ShaderIOExpansion<T extends Instance> = {
    /** The additional instance attributes to add to the layer's Shader IO */
    instanceAttributes: IInstanceAttribute<T>[];
    /** The additional uniforms to add to the layer's Shader IO */
    uniforms: IUniform[];
    /** The additional vertex attributes to add to the layer's Shader IO */
    vertexAttributes: IVertexAttribute[];
};
/**
 * When processing attributes, uniforms, etc, it is a common event that special ShaderIO types
 * can be declared that requires additional ShaderIO configuration to be added.
 *
 * This type of object can be added to the layer surface to provide a means to process special
 * attributes the current system or customized system will want to handle.
 */
export declare abstract class BaseIOExpansion extends BaseShaderIOInjection {
    /**
     * This is called with the Layer's currently declared Shader IO configuration.
     * The returned IO configuration will be added to the existing IO.
     * Each BaseIOExpansion object will receive the expanded IO configuration of other
     * expansion objects if the object is processed after another expansion object.
     *
     * NOTE: The inputs should NOT be modified in any way
     */
    expand<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, _instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): ShaderIOExpansion<T>;
    /**
     * Every expansion object will be given the opportunity to validate the IO presented to it
     * here, thus allowing unique IO configuration types to be confirmed before getting  completely processed.
     *
     * It will be expected that a unique Expansion object will have special requirements centered around the
     * configuration object, thus it is expected this be implemented in a meaningful way to make devlopment
     * clearer by making mistakes clearer to the developer.
     *
     * Messages should be logged within this method as warnings or errors when validations fail and
     * then this method should return false indicating the validation failed.
     *
     * NOTE: The inputs should NOT be modified in any way
     */
    validate<T extends Instance, U extends ILayerProps<T>>(_layer: Layer<T, U>, _instanceAttributes: IInstanceAttribute<T>[], _vertexAttributes: IVertexAttribute[], _uniforms: IUniform[]): boolean;
    /**
     * This allows for injection into the header of the shader.
     *
     * The order these controllers are injected
     * into the system determines the order the contents are written to the header. So dependent injections
     * must be sorted appropriately.
     *
     * @param target The targetted shader object to receive the header. This will be VERTEX or FRAGMENT but never ALL
     * @param layer The layer that is currently being processed
     * @param metrics Some metrics processed that are useful for making decisions about buffering strategies etc.
     */
    processHeaderInjection(_target: ShaderInjectionTarget, _declarations: Map<string, string>, _layer: Layer<Instance, ILayerProps<Instance>>, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], _instanceAttributes: IInstanceAttribute<Instance>[], _uniforms: IUniform[]): ShaderIOHeaderInjectionResult;
    /**
     * This allows for injection into the shader AFTER attribute destructuring has taken place.
     *
     * The order these controllers are injected
     * into the system determines the order the contents are written to the header. So dependent injections
     * must be sorted appropriately.
     *
     * @param layer The layer that is currently being processed
     * @param metrics Some metrics processed that are useful for making decisions about buffering strategies etc.
     */
    processAttributeDestructuring(_layer: Layer<Instance, ILayerProps<Instance>>, _declarations: Map<string, string>, _metrics: MetricsProcessing, _vertexAttributes: IVertexAttribute[], _instanceAttributes: IInstanceAttribute<Instance>[], _uniforms: IUniform[]): string;
}
