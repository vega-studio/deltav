import { Instance } from "../../instance-provider/instance";
import {
  BaseShaderIOInjection,
  ShaderIOHeaderInjectionResult,
} from "../../shaders/processing/base-shader-io-injection";
import { MetricsProcessing } from "../../shaders/processing/metrics-processing";
import {
  IInstanceAttribute,
  IUniform,
  IVertexAttribute,
  ShaderInjectionTarget,
} from "../../types";
import { ILayerProps, Layer } from "../layer";

export type ShaderIOExpansion<T extends Instance> = {
  /** The additional instance attributes to add to the layer's Shader IO */
  instanceAttributes: IInstanceAttribute<T>[];
  /** The additional uniforms to add to the layer's Shader IO */
  uniforms: IUniform[];
  /** The additional vertex attributes to add to the layer's Shader IO */
  vertexAttributes: IVertexAttribute[];
};

/**
 * When processing attributes, uniforms, etc, it is a common event that special
 * ShaderIO types can be declared that requires additional ShaderIO
 * configuration to be added.
 *
 * This type of object can be added to the layer surface to provide a means to
 * process special attributes the current system or customized system will want
 * to handle.
 */
export abstract class BaseIOExpansion extends BaseShaderIOInjection {
  /**
   * This is called with the Layer's currently declared Shader IO configuration.
   * The returned IO configuration will be added to the existing IO. Each
   * BaseIOExpansion object will receive the expanded IO configuration of other
   * expansion objects if the object is processed after another expansion
   * object.
   *
   * NOTE: The inputs should NOT be modified in any way
   */
  expand<
    TInstance extends Instance = Instance,
    TProps extends ILayerProps<TInstance> = ILayerProps<TInstance>,
  >(
    _layer: Layer<TInstance, TProps>,
    _instanceAttributes: IInstanceAttribute<TInstance>[],
    _vertexAttributes: IVertexAttribute[],
    _uniforms: IUniform[]
  ): ShaderIOExpansion<TInstance> {
    return {
      instanceAttributes: [],
      uniforms: [],
      vertexAttributes: [],
    };
  }

  /**
   * Every expansion object will be given the opportunity to validate the IO
   * presented to it here, thus allowing unique IO configuration types to be
   * confirmed before getting  completely processed.
   *
   * It will be expected that a unique Expansion object will have special
   * requirements centered around the configuration object, thus it is expected
   * this be implemented in a meaningful way to make devlopment clearer by
   * making mistakes clearer to the developer.
   *
   * Messages should be logged within this method as warnings or errors when
   * validations fail and then this method should return false indicating the
   * validation failed.
   *
   * NOTE: The inputs should NOT be modified in any way
   */
  validate<
    TInstance extends Instance = Instance,
    TProps extends ILayerProps<TInstance> = ILayerProps<TInstance>,
  >(
    _layer: Layer<TInstance, TProps>,
    _instanceAttributes: IInstanceAttribute<TInstance>[],
    _vertexAttributes: IVertexAttribute[],
    _uniforms: IUniform[]
  ): boolean {
    return true;
  }

  /**
   * This allows for injection into the header of the shader.
   *
   * The order these controllers are injected into the system determines the
   * order the contents are written to the header. So dependent injections must
   * be sorted appropriately.
   *
   * @param target The targetted shader object to receive the header. This will
   *               be VERTEX or FRAGMENT but never ALL
   * @param layer The layer that is currently being processed
   * @param metrics Some metrics processed that are useful for making decisions
   *                about buffering strategies etc.
   */
  processHeaderInjection<
    TInstance extends Instance,
    TLayerProps extends ILayerProps<TInstance>,
  >(
    _target: ShaderInjectionTarget,
    _declarations: Map<string, string>,
    _layer: Layer<TInstance, TLayerProps>,
    _metrics: MetricsProcessing,
    _vertexAttributes: IVertexAttribute[],
    _instanceAttributes: IInstanceAttribute<TInstance>[],
    _uniforms: IUniform[]
  ): ShaderIOHeaderInjectionResult {
    return {
      injection: "",
    };
  }

  /**
   * This allows for injection into the shader AFTER attribute destructuring has
   * taken place.
   *
   * The order these controllers are injected into the system determines the
   * order the contents are written to the header. So dependent injections must
   * be sorted appropriately.
   *
   * @param layer The layer that is currently being processed
   * @param metrics Some metrics processed that are useful for making decisions
   *                about buffering strategies etc.
   */
  processAttributeDestructuring<
    TInstance extends Instance,
    TLayerProps extends ILayerProps<TInstance>,
  >(
    _layer: Layer<TInstance, TLayerProps>,
    _declarations: Map<string, string>,
    _metrics: MetricsProcessing,
    _vertexAttributes: IVertexAttribute[],
    _instanceAttributes: IInstanceAttribute<TInstance>[],
    _uniforms: IUniform[]
  ): string {
    return "";
  }
}
