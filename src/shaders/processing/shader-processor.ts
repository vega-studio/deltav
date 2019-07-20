import { Instance } from "../../instance-provider/instance";
import { BaseIOSorting } from "../../surface/base-io-sorting";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { injectShaderIO } from "../../surface/layer-processing/inject-shader-io";
import { getLayerBufferType } from "../../surface/layer-processing/layer-buffer-type";
import {
  IInstanceAttribute,
  IInstancingUniform,
  IShaderInitialization,
  IShaders,
  IUniformInternal,
  IVertexAttributeInternal,
  ShaderInjectionTarget
} from "../../types";
import { shaderTemplate } from "../../util/shader-templating";
import { templateVars } from "../template-vars";
import { ShaderIOHeaderInjectionResult } from "./base-shader-io-injection";
import { MetricsProcessing } from "./metrics-processing";
import { ShaderModule } from "./shader-module";
import { ShaderModuleUnit } from "./shader-module-unit";

/**
 * This is the expected results from processing the shader and it's layer's attributes.
 */
export interface IShaderProcessingResults<T extends Instance> {
  /** The resulting fragment shader from processing the module */
  fs: string;
  /** Any additional system uniforms that arose from the processing */
  materialUniforms: IInstancingUniform[];
  /** Calculated max instances per buffer (mostly for uniform packing procedures) */
  maxInstancesPerBuffer: number;
  /** The modules that were included within the module processing */
  modules: ShaderModuleUnit[];
  /** The resulting vertex shader from processing the module */
  vs: string;
  /** All instance attributes that arise from module processing */
  instanceAttributes: IInstanceAttribute<T>[];
  /** All vertex attributes that arise from module processing */
  vertexAttributes: IVertexAttributeInternal[];
  /** All uniform attributes that arise from module processing */
  uniforms: IUniformInternal[];
}

/** Expected results from processing shader imports */
export type ProcessShaderImportResults =
  | (IShaders & { shaderModuleUnits: Set<ShaderModuleUnit> })
  | null;

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
  /** Processor that calculates shared metrics across all processors */
  metricsProcessing: MetricsProcessing = new MetricsProcessing();

  /**
   * This processes a layer, it's Shader IO requirements, and it's shaders to produce a fully functional
   * shader that is compatible with the client's system.
   */
  process<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>,
    shaderIO: IShaderInitialization<T>,
    ioExpansion: BaseIOExpansion[],
    sortIO: BaseIOSorting
  ): IShaderProcessingResults<T> | null {
    try {
      // First process imports to retrieve the requested IO the shader modules would be requiring
      const shadersWithImports = this.processImports(layer, shaderIO);
      if (!shadersWithImports) return null;

      // After processing our imports, we can now fully aggregate the needed shader IO to make our layer
      // operate properly. Process all of the attributes and apply IO expansion to all of the discovered
      // shader IO the layer will need to execute.
      const { vertexAttributes, instanceAttributes, uniforms } = injectShaderIO(
        layer.surface.gl,
        layer,
        shaderIO,
        ioExpansion,
        sortIO,
        shadersWithImports
      );
      // After all of the shader IO is established, let's calculate the appropriate buffering strategy
      // For the layer.
      getLayerBufferType(
        layer.surface.gl,
        layer,
        vertexAttributes,
        instanceAttributes
      );

      // Calculate needed metrics that may be used by any of the processors
      this.metricsProcessing.process(instanceAttributes, uniforms);

      // We are going to gather headers for both vertex and fragment from our processors
      let vsHeader = "";
      let fsHeader = "";
      // We will also gather the destructuring structure for the attributes from our processor
      let destructuring = "";
      // In processing, this may generate changes to the Material to accommodate features required
      const materialChanges: ShaderIOHeaderInjectionResult["material"] = {
        uniforms: []
      };

      const vsHeaderDeclarations = new Map();
      const fsHeaderDeclarations = new Map();
      const destructureDeclarations = new Map();

      // Loop through all of our processors that handle expanding all IO into headers for the shader
      for (let i = 0, iMax = ioExpansion.length; i < iMax; ++i) {
        const processor = ioExpansion[i];

        // Generate vertex header declarations
        const vsHeaderInfo = processor.processHeaderInjection(
          ShaderInjectionTarget.VERTEX,
          vsHeaderDeclarations,
          layer,
          this.metricsProcessing,
          vertexAttributes,
          instanceAttributes,
          uniforms
        );

        vsHeader += vsHeaderInfo.injection;

        if (vsHeaderInfo.material) {
          materialChanges.uniforms = materialChanges.uniforms.concat(
            vsHeaderInfo.material.uniforms || []
          );
        }

        // Generate fragment header declarations
        const fsHeaderInfo = processor.processHeaderInjection(
          ShaderInjectionTarget.FRAGMENT,
          fsHeaderDeclarations,
          layer,
          this.metricsProcessing,
          vertexAttributes,
          instanceAttributes,
          uniforms
        );

        fsHeader += fsHeaderInfo.injection;

        if (fsHeaderInfo.material) {
          materialChanges.uniforms = materialChanges.uniforms.concat(
            fsHeaderInfo.material.uniforms || []
          );
        }

        // Destructure the elements
        destructuring += processor.processAttributeDestructuring(
          layer,
          destructureDeclarations,
          this.metricsProcessing,
          vertexAttributes,
          instanceAttributes,
          uniforms
        );
      }

      // After we have aggregated all of our declarations, we now piece them together
      let declarations = "";

      vsHeaderDeclarations.forEach(declaration => {
        declarations += declaration;
      });

      vsHeader = declarations + vsHeader;
      declarations = "";

      fsHeaderDeclarations.forEach(declaration => {
        declarations += declaration;
      });

      fsHeader = declarations + fsHeader;
      declarations = "";

      destructureDeclarations.forEach(declaration => {
        declarations += declaration;
      });

      destructuring = declarations + destructuring;

      // Create a default precision modifier for now
      const precision = "precision highp float;\n\n";
      // Now we concatenate the shader pieces into one glorious shader of compatibility and happiness
      const fullShaderVS = precision + vsHeader + shadersWithImports.vs;
      const fullShaderFS = precision + fsHeader + shadersWithImports.fs;

      // Last we replace any templating variables with their relevant values
      let templateOptions: { [key: string]: string } = {
        [templateVars.attributes]: destructuring
      };

      // This flag will determine if the attributes are manually placed in the shader. If this is not true, then the
      // attributes will get injected into the main() method.
      let hasAttributes = false;

      const processedShaderVS = shaderTemplate({
        options: templateOptions,
        required: undefined,
        shader: fullShaderVS,

        onToken(token: string, replace: string) {
          if (token === templateVars.attributes) {
            hasAttributes = true;
          }

          return replace;
        },

        onMain(body: string | null) {
          if (hasAttributes) return body || "";

          if (body === null) {
            console.warn("The body of void main() could not be determined.");
            return "";
          }

          return `${destructuring}\n${body}`;
        }
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
        materialUniforms: materialChanges.uniforms,
        maxInstancesPerBuffer: this.metricsProcessing
          .maxInstancesPerUniformBuffer,
        modules: Array.from(shadersWithImports.shaderModuleUnits),
        vs: processedShaderVS.shader.trim(),
        vertexAttributes,
        instanceAttributes,
        uniforms
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
    shaders: IShaderInitialization<T>
  ): ProcessShaderImportResults {
    const shaderModuleUnits = new Set<ShaderModuleUnit>();
    let baseModules = layer.baseShaderModules(shaders);

    if (layer.props.baseShaderModules) {
      baseModules = layer.props.baseShaderModules(shaders, baseModules);
    }

    // Process imports for the vertex shader
    const vs = ShaderModule.process(
      layer.id,
      shaders.vs,
      ShaderInjectionTarget.VERTEX,
      baseModules.vs
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
      baseModules.fs
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

    // Gather all discovered Shader Module Units
    vs.shaderModuleUnits.forEach(moduleUnit =>
      shaderModuleUnits.add(moduleUnit)
    );
    fs.shaderModuleUnits.forEach(moduleUnit =>
      shaderModuleUnits.add(moduleUnit)
    );

    return {
      fs: fs.shader || "",
      vs: vs.shader || "",
      shaderModuleUnits
    };
  }
}
