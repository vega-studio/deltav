import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute, IUniform, IVertexAttribute } from "../../types";
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
 * When processing attributes, uniforms, etc, it is a common event that special ShaderIO types
 * can be declared that requires additional ShaderIO configuration to be added.
 *
 * This type of object can be added to the layer surface to provide a means to process special
 * attributes the current system or customized system will want to handle.
 */
export abstract class BaseIOExpansion {
  /**
   * This is called with the Layer's currently declared Shader IO configuration.
   * The returned IO configuration will be added to the existing IO.
   * Each BaseIOExpansion object will receive the expanded IO configuration of other
   * expansion objects if the object is processed after another expansion object.
   *
   * NOTE: The inputs should NOT be modified in any way
   */
  abstract expand<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>,
    instanceAttributes: IInstanceAttribute<T>[],
    vertexAttributes: IVertexAttribute[],
    uniforms: IUniform[]
  ): ShaderIOExpansion<T>;

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
  abstract validate<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>,
    instanceAttributes: IInstanceAttribute<T>[],
    vertexAttributes: IVertexAttribute[],
    uniforms: IUniform[]
  ): boolean;
}
