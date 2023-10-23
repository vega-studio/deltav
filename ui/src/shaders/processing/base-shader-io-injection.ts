import { Attribute } from "../../gl";
import { Instance } from "../../instance-provider/instance";
import { MetricsProcessing } from "../../shaders/processing/metrics-processing";
import { ILayerProps, Layer } from "../../surface/layer";
import { IViewProps, View } from "../../surface/view";
import {
  IInstanceAttribute,
  IInstancingUniform,
  IUniform,
  IVertexAttribute,
  ShaderInjectionTarget
} from "../../types";

import Debug from "debug";

const debug = Debug("performance");

/**
 * The result of an injection into the header of a shader. Allows for injection content into the header
 * and provide extra Shader IO such as uniforms and attributes.
 */
export type ShaderIOHeaderInjectionResult = {
  /** The content to inject into the shader */
  injection: string;
  /** Additional geometry changes possibly caused by the header injection */
  geometry?: {
    attributes: { [key: string]: Attribute };
  };
  /** Additional material changes possibly caused by the header injection changes */
  material?: {
    uniforms: IInstancingUniform[];
  };
};

export type ShaderDeclarationStatements = Map<string, string>;

export type ShaderDeclarationStatementLookup = {
  fs: Map<View<IViewProps>, ShaderDeclarationStatements>;
  vs: ShaderDeclarationStatements;
  destructure: ShaderDeclarationStatements;
};

/**
 * This is the basis to allow the system to have additional shader injection capabilities.
 * This will cover an object or manager that wishes to inject elements into the header of the
 * shader and inject elements after attribute destructuring.
 */
export abstract class BaseShaderIOInjection {
  /**
   * This is a helper to apply declarations to the input declaration object. This will automatically use the
   * performance debug output to provide useful information when overrides occur.
   */
  setDeclaration(
    declarations: ShaderDeclarationStatements,
    key: string,
    value: string,
    debugMessageCtx?: string
  ) {
    if (declarations.has(key)) {
      debug(
        "%s: Overriding declaration %s\nSetting new value: %s",
        debugMessageCtx || "Expand IO Declarations",
        key,
        value
      );
    }

    declarations.set(key, value);
  }

  /**
   * This allows for injection into the header of the shader.
   *
   * The order these controllers are injected
   * into the system determines the order the contents are written to the header. So dependent injections
   * must be sorted appropriately.
   *
   * @param target Specifies which shader type we should be writing the header for. Will be FS OR VS not ALL.
   * @param declarations This is where the output should register declarations so the system can composite them together.
   *                     This allows for IO Injections to override each other on declared names and help them set up expectations
   *                     amongst each other for shader output.
   * @param layer The layer that is currently being processed
   * @param metrics Some metrics processed that are useful for making decisions about buffering strategies etc.
   */
  abstract processHeaderInjection(
    target: ShaderInjectionTarget,
    declarations: ShaderDeclarationStatements,
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
   * @param declarations This is where the output should register declarations so the system can composite them together.
   *                     This allows for IO Injections to override each other on declared names and help them set up expectations
   *                     amongst each other for shader output.
   * @param metrics Some metrics processed that are useful for making decisions about buffering strategies etc.
   */
  abstract processAttributeDestructuring(
    layer: Layer<Instance, ILayerProps<Instance>>,
    declarations: ShaderDeclarationStatements,
    metrics: MetricsProcessing,
    vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
    uniforms: IUniform[]
  ): string;
}
