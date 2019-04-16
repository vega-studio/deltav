import { Attribute, IMaterialUniform, MaterialUniformType } from "../../gl";
import { Instance } from "../../instance-provider/instance";
import { MetricsProcessing } from "../../shaders/processing/metrics-processing";
import { ILayerProps, Layer } from "../../surface/layer";
import { IInstanceAttribute, IUniform, IVertexAttribute, ShaderInjectionTarget } from "../../types";

/**
 * The result of an injection into the header of a shader. Allows for injection content into the header
 * and provide extra Shader IO such as uniforms and attributes.
 */
export type ShaderIOHeaderInjectionResult = {
  /** The content to inject into the shader */
  injection: string;
  /** Additional material changes possibly caused by the header injection changes */
  material?: {
    uniforms: { [key: string]: IMaterialUniform<MaterialUniformType> };
  };
  /** Additional geometry changes possibly caused by the header injection */
  geometry?: {
    attributes: { [key: string]: Attribute };
  };
};

/**
 * This is the basis to allow the system to have additional shader injection capabilities.
 * This will cover an object or manager that wishes to inject elements into the header of the
 * shader and inject elements after attribute destructuring.
 */
export abstract class BaseShaderIOInjection {
  /**
   * This allows for injection into the header of the shader.
   *
   * The order these controllers are injected
   * into the system determines the order the contents are written to the header. So dependent injections
   * must be sorted appropriately.
   *
   * @param target Specifies which shader type we should be writing the header for. Will be FS OR VS not ALL.
   * @param layer The layer that is currently being processed
   * @param metrics Some metrics processed that are useful for making decisions about buffering strategies etc.
   */
  abstract processHeaderInjection(
    target: ShaderInjectionTarget,
    layer: Layer<Instance, ILayerProps<Instance>>,
    metrics: MetricsProcessing,
    vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
    uniforms: IUniform[]
  ): ShaderIOHeaderInjectionResult;

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
  abstract processAttributeDestructuring(
    layer: Layer<Instance, ILayerProps<Instance>>,
    metrics: MetricsProcessing,
    vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
    uniforms: IUniform[]
  ): string;
}
