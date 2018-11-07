import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  IInstanceAttribute,
  IInstancingUniform,
  IShaders,
  IUniform,
  IVertexAttribute,
  PickType,
  ShaderInjectionTarget
} from "../../types";
import { shaderTemplate } from "../../util/shader-templating";
import { templateVars } from "../template-vars";
import { AttributeProcessing } from "./attribute-processing";
import { EasingProcessing } from "./easing-processing";
import { MetricsProcessing } from "./metrics-processing";
import { ShaderModule } from "./shader-module";
import { UniformProcessing } from "./uniform-processing";

/**
 * This is the expected results from processing the shader and it's layer's attributes.
 */
export interface IShaderProcessingResults {
  fs: string;
  materialUniforms: IInstancingUniform[];
  maxInstancesPerBuffer: number;
  vs: string;
}

/**
 * The intent of this processor is to analyze a layer's Shader IO elements and produce a functional
 * shader from those elements. This includes supporting a layer's capabilties with the client systems
 * capabilities and matching compatibilities.
 *
 * This inlcudes:
 *
 * Injecting needed module imports based on the layers specifications
 * Resolving Module imports and handling errors
 * Utilizing layer information to create attributes and uniforms based on attribute packing strategies
 * Destructuring attributes based on easing requirements or if attributes were packed
 * Swapping out miscellaneous template variables
 */
export class ShaderProcessor {
  /** The processor that defines easing methods that are to be injected into the shaders */
  easingProcessing: EasingProcessing = new EasingProcessing();
  /** Processor that calculates shared metrics across all processors */
  metricsProcessing: MetricsProcessing = new MetricsProcessing();
  /** The processor that defines how uniforms are written into the shader */
  uniformProcessing: UniformProcessing = new UniformProcessing(
    this.metricsProcessing
  );
  /** The processor that defines how attributes are packed into the shader */
  attributeProcessing: AttributeProcessing = new AttributeProcessing(
    this.uniformProcessing,
    this.metricsProcessing
  );

  /**
   * This processes a layer, it's Shader IO requirements, and it's shaders to produce a fully functional
   * shader that is compatible with the client's system.
   */
  process<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>,
    shaders: IShaders,
    vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<T>[],
    uniforms: IUniform[]
  ): IShaderProcessingResults | null {
    try {
      // Reset anything state that needs revertting
      this.uniformProcessing.materialUniforms = [];
      // Calculate needed metrics that may be used by any of the processors
      this.metricsProcessing.process(instanceAttributes, uniforms);

      // First process imports to create a shader complete with the necessary
      const shadersWithImports = this.processImports(layer, shaders);
      if (!shadersWithImports) return null;

      // Next generate the attribute packing strategy for the layer. The layer will define how it expects
      // attributes (instance and vertex) to be handled. This will be written as the input to the shader at
      // the top of the vertex shader file.
      const attributeDeclarations = this.attributeProcessing.process(
        layer,
        vertexAttributes,
        instanceAttributes
      );
      if (attributeDeclarations === null) return null;

      // Next generate any uniform declarations necessary for the vertex shader
      const vertexUniformDeclarations = this.uniformProcessing.process(
        uniforms,
        ShaderInjectionTarget.VERTEX
      );
      if (vertexUniformDeclarations === null) return null;

      // Generate uniform declarations for the fragment shader
      const fragmentUniformDeclarations = this.uniformProcessing.process(
        uniforms,
        ShaderInjectionTarget.FRAGMENT
      );
      if (fragmentUniformDeclarations === null) return null;

      // Generate the easing methods the layer specified
      const easingMethodDeclarations = this.easingProcessing.process(
        instanceAttributes
      );
      if (easingMethodDeclarations === null) return null;

      // Create a default precision modifier for now
      const precision = "precision highp float;\n\n";

      // Now we concatenate the shader pieces into one glorious shader of compatibility and happiness
      const fullShaderVS =
        precision +
        attributeDeclarations.declarations +
        vertexUniformDeclarations +
        easingMethodDeclarations +
        shadersWithImports.vs;

      const fullShaderFS =
        precision + fragmentUniformDeclarations + shadersWithImports.fs;

      // Last we replace any templating variables with their relevant values
      let templateOptions: { [key: string]: string } = {
        [templateVars.attributes]: attributeDeclarations.destructuring
      };

      const processedShaderVS = shaderTemplate({
        options: templateOptions,
        required: undefined,
        shader: fullShaderVS
      });

      // We process the Fragment shader as well, currently with nothing to replace
      // aside from removing any superfluous template requests
      templateOptions = {};

      const processShaderFS = shaderTemplate({
        options: templateOptions,
        required: undefined,
        shader: fullShaderFS
      });

      const results = {
        fs: processShaderFS.shader.trim(),
        materialUniforms: this.uniformProcessing.materialUniforms,
        maxInstancesPerBuffer: this.metricsProcessing.maxInstancesPerBuffer,
        vs: processedShaderVS.shader.trim()
      };

      return results;
    } catch (err) {
      console.warn(
        "An unknown error occurred while processing the shaders for layer:",
        layer.id
      );
      console.warn("Error:");
      console.warn(err && (err.stack || err.message));
      return null;
    }
  }

  /**
   * This applies the imports for the specified layer and generates the appropriate shaders from the output.
   * Upon failure, this will just return null.
   *
   * This also does some additional work to add in some modules based on the layer's preferences
   */
  private processImports<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>,
    shaders: IShaders
  ): IShaders | null {
    const additionalImports = [];

    if (layer.picking.type === PickType.SINGLE) {
      additionalImports.push("picking");
    } else {
      additionalImports.push("no-picking");
    }

    // Process imports for the vertex shader
    const vs = ShaderModule.process(
      layer.id,
      shaders.vs,
      ShaderInjectionTarget.VERTEX,
      additionalImports
    );

    if (vs.errors.length > 0) {
      console.warn(
        "Error processing imports for the vertex shader of layer:",
        layer.id,
        "Errors",
        ...vs.errors.reverse()
      );

      return null;
    }

    // Process imports for the fragment shader
    const fs = ShaderModule.process(
      layer.id,
      shaders.fs,
      ShaderInjectionTarget.FRAGMENT,
      additionalImports
    );

    if (fs.errors.length > 0) {
      console.warn(
        "Error processing imports for the fragment shader of layer:",
        layer.id,
        "Errors",
        ...fs.errors.reverse()
      );

      return null;
    }

    return {
      fs: fs.shader || "",
      vs: vs.shader || ""
    };
  }
}
