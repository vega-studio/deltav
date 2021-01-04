import { WebGLStat } from "../../gl";
import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import {
  IInstanceAttribute,
  IInstancingUniform,
  IShaderInitialization,
  IShaders,
  isString,
  IUniformInternal,
  IVertexAttributeInternal,
  OutputFragmentShader,
  OutputFragmentShaderSource,
  OutputFragmentShaderTarget,
  ShaderInjectionTarget,
  ViewOutputInformationType
} from "../../types";
import { isDefined } from "../../util";
import { shaderTemplate } from "../../util/shader-templating";
import { templateVars } from "../template-vars";
import { BaseIOSorting } from "./base-io-sorting";
import { ShaderIOHeaderInjectionResult } from "./base-shader-io-injection";
import { BaseShaderTransform } from "./base-shader-transform";
import { injectShaderIO } from "./inject-shader-io";
import { MetricsProcessing } from "./metrics-processing";
import { ShaderModule } from "./shader-module";
import { ShaderModuleUnit } from "./shader-module-unit";

/**
 * This is the expected results from processing the shader and it's layer's attributes.
 */
export interface IShaderProcessingResults<T extends Instance> {
  /** The resulting fragment shaders from processing the module */
  fs: OutputFragmentShader;
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
 * This is the expected token to be found within the shader content to indicate
 * a fragment output.
 */
const OUT_TOKEN: string = "out";
/**
 * Seperator token between an out token and the variable name it's supposed to
 * become.
 */
const OUT_DELIMITER: string = ":";

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
   * This takes in multiple fragment shaders and merges them together based on
   * their main() methods. All elements outside of the main() method will be
   * merged as header information in the order they are discovered.
   *
   * All contents of the main's will be merged together as well in the order
   * they are discovered.
   *
   * Additionally, this discovers outputs declared in the shader in the form of
   * ${out: <name>} tokens. These will be used to aid in making a shader that
   * will be compatible with ES 3.0 AND 2.0 shaders.
   */
  static mergeFragmentOutputs(
    shaders: { source: string; outputType: number }[],
    targetOutputs: number[],
    typeFilter?: number[],
    singleOutput?: boolean
  ) {
    console.log("Merging fragment outputs:", shaders);

    let headers = "";
    let bodies = "";
    let fragmentOutput = "";
    const outputNames = new Set<string>();
    const outputTypes: number[] = [];
    const usedTypes = new Set<number>();
    const typeToName = new Map<number, string>();

    // When MRT isn't enabled at all, then our fragment output simply writes
    // directly to gl_FragColor (Our ES 3.0 converter will properly handle
    // gl_FragColor later)
    if (!WebGLStat.MRT) {
      fragmentOutput = " = gl_FragColor";
    }

    // This aggregates all declarations that needed to be generated for the
    // header so the
    let outputDeclarations = "";

    shaders.forEach((s, i) => {
      // If output is not allowed, then the found output in the shader will
      // simply map to a locally scoped variable instead of a specialized output
      // variable.
      let allowOutput = true;
      // We can only have one token per each shader. Declaring multiple ${out}
      // tokens will be considered an error and unsupported.
      let foundOutputToken = false;
      // The correct output index will be the index found in the target outputs.
      // If a match isn't made, then this particular shader is not going to be
      // an output to the target.
      const outputLayoutLocation = targetOutputs.indexOf(s.outputType);

      if (typeFilter && typeFilter.indexOf(s.outputType) < 0) {
        allowOutput = false;
      }

      if (singleOutput && i < shaders.length - 1) {
        allowOutput = false;
      }

      if (!singleOutput && outputLayoutLocation < 0) {
        allowOutput = false;
      }

      console.log(
        `Output type ${s.outputType} is flagged for output?`,
        allowOutput
      );

      usedTypes.add(s.outputType);

      shaderTemplate({
        shader: s.source,

        /**
         * Analyze each token for "out" tokens indicating output
         */
        onToken(token) {
          const trimmedToken = token.trim();

          if (trimmedToken.indexOf(OUT_TOKEN) === 0) {
            if (foundOutputToken) {
              console.error(
                "Found multiple ${out} tokens in a single fragments shader. This is not supported nor logical",
                "If you need to use the declared output multiple times, use the assigned name",
                "and don't wrap it repeatedly in the shader.",
                "eg-",
                "void main() {",
                "  ${out: myOutput} = value;",
                "  vec4 somethingElse = myOutput;",
                "}"
              );
              throw new Error("Invalid Shader Format");
            }

            // Flag the token as discovered so we can make sure we don't have
            // too many tokens show up.
            foundOutputToken = true;
            // Analyze the remainder of the token to find the necessary colon to
            // be the NEXT Non-whitespace character
            const afterToken = trimmedToken.substr(OUT_TOKEN.length).trim();

            // Make sure the character IS a colon
            if (afterToken[0] === OUT_DELIMITER) {
              // At this point, ANYTHING after the colon is the output property
              // being requested (with white space trimmed). If the name isn't
              // valid, that's not our fault.
              const outputName = afterToken.substr(OUT_DELIMITER.length).trim();
              // Keep track of the name to the
              typeToName.set(s.outputType, outputName);

              if (!outputName) {
                throw new Error(
                  "Output in a shader requires an identifier ${out: <name required>}"
                );
              }

              if (outputNames.has(outputName)) {
                throw new Error(
                  "You can not declare the same output name in subsequent fragment shader outputs"
                );
              }

              // Check our type filter. If the current outputType of the shader
              // is NOT in the filter, then we have to exclude the name from the
              // output names AND we have to ensure the name specified has a
              // declaration as it will never be declared in the header.
              let declare = "";
              if (allowOutput) {
                // We now have the output name this output will utilize
                outputNames.add(outputName);
                outputTypes.push(s.outputType);

                // Handle the special case of the MRT extension where we output
                // to the special case of gl_FragData
                if (WebGLStat.MRT_EXTENSION) {
                  fragmentOutput = ` = gl_FragData[${outputLayoutLocation}]`;
                }

                // Handle the MRT extension case where we have to create an
                // 'out' declaration for the decalred output name.
                else if (WebGLStat.MRT && WebGLStat.SHADERS_3_0) {
                  // We don't handle the special case of glFragColor as that is
                  // handled in the ES 3.0 transform.
                  if (outputName !== "gl_FragColor") {
                    outputDeclarations += `layout(location=${outputLayoutLocation}) out vec4 ${outputName};\n`;
                  }
                } else {
                  throw new Error(
                    `Could not generate a proper output declaration for the fragmnet shader output: ${outputName}`
                  );
                }
              } else {
                declare = "vec4 ";
              }

              // Replace the token with just the name of the variable being
              // declared with the proper type sizing.
              return `${declare}${outputName}${fragmentOutput}`;
            } else {
              throw new Error(
                "Output in a shader requires an identifier ${out: <name required>}"
              );
            }
          }

          // Leave unprocessed tokens alone
          return `$\{${token}}`;
        },

        /**
         * We use this to aggregate all of our main bodies and headers together
         */
        onMain(body, header) {
          headers += `\n${(header || "").trim()}`;
          bodies += `\n  ${(body || "").trim()}`;
          return (body || "").trim();
        }
      });
    });

    // We match our output names to keep in line with the used output types

    // The output types we return needs to match up to the target types. If we
    // didn't have an output for a type it needs to be NONE. The used target
    // types need to line up to the order that appears in targetTypes and NOT
    // lined up with how they appear in the shader.
    const usedOutputTypes = targetOutputs.map(targetType => {
      if (usedTypes.has(targetType)) return targetType;
      return ViewOutputInformationType.NONE;
    });

    console.log("Merged Outputs", outputNames, outputTypes);

    return {
      output: `${outputDeclarations}${headers}\nvoid main() {\n${bodies}\n}`,
      outputNames: Array.from(outputNames.values()),
      outputTypes: usedOutputTypes
    };
  }

  /**
   * This analyzes desired target outputs and available outputs that output to
   * certain output types. This will match the targets with the available
   * outputs and produce shaders that reflect the capabilities
   * available of both target and provided outputs.
   *
   * This also takes into account the capabilities of the hardware. If MRT is
   * supported, the generated shaders will be combined as best as possible. If
   * MRT is NOT supported, this will generate MULTIPLE SHADERS, a shader for
   * each output capable of delivering the targetted output specified.
   */
  static makeOutputFragmentShader(
    targetOutputs?: OutputFragmentShaderTarget,
    outputs?: OutputFragmentShaderSource
  ): OutputFragmentShader | null {
    console.log("Processing layer fragment outputs", {
      targetOutputs: JSON.parse(JSON.stringify(targetOutputs)),
      outputs
    });
    // If the view only is a simple string, then we assume the COLOR output of
    // the layer. If the layer does not specify a specific COLOR output, then
    // we assume the culminated output of all outputs of the layer is the
    // target.
    // NOTE: All results under this branch will be for SINGLE TARGET outputs, so
    // we don't need to worry about MRT here. The final fragment output IS the
    // only output.
    if (!targetOutputs || isString(targetOutputs)) {
      // View expects a color output, layer only outputs a color, we are good
      // to simply output the layer to the view.
      if (isString(outputs)) {
        const processed = this.mergeFragmentOutputs(
          [
            {
              source: outputs,
              outputType: ViewOutputInformationType.COLOR
            }
          ],
          [ViewOutputInformationType.COLOR]
        );

        return [
          {
            source: processed.output,
            outputTypes: [ViewOutputInformationType.COLOR],
            outputNames: processed.outputNames
          }
        ];
      }

      // Look through the layer's fragment outputs for something that is
      // labeled as a color. We prioritize that.
      else if (Array.isArray(outputs)) {
        const colorOutput = outputs.find(
          s => s.outputType === ViewOutputInformationType.COLOR
        );

        let outputIndex = -1;

        // If our layer outputs a color, this is the output element that will
        // output for our COLOR target.
        if (colorOutput) {
          outputIndex = outputs.indexOf(colorOutput);
        }

        // With no specified color, we render the final output of the layer as
        // the output to the view but we dub it as a COLOR anyways.
        else {
          outputIndex = outputs.length - 1;
        }

        // We take the found index of the output we need to output for our COLOR
        // target and aggregate all of the preceding outputs as the dependencies
        // needed for this output to work properly.
        const processed = this.mergeFragmentOutputs(
          outputs.slice(0, outputIndex + 1),
          [ViewOutputInformationType.COLOR],
          undefined,
          true
        );

        return [
          {
            source: processed.output,
            outputNames: processed.outputNames,
            outputTypes: [ViewOutputInformationType.COLOR]
          }
        ];
      }

      // It's invalid to not have output sources so we just return a null object
      // to indicate there is no fragment shader that can be inferred for the
      // targets specified.
      else {
        return null;
      }
    }

    // If the targets SPECIFIES any EXPECTED output types, then the outputs will
    // be filtered based on ONLY outputting IFF they have outputs that match the
    // target outputs.
    // NOTE: The outputs for this branch are expected to be MRT related. So,
    // this will produce a merged output if MRT is supported or it will produce
    // multiple shader outputs to support each individual target output if MRT
    // is not available.
    else if (Array.isArray(targetOutputs)) {
      // Gather all of the actual output types in a list so we know the ordering
      // and the mapping of types to specific outputs.
      const targetTypes = targetOutputs.map(target => target.outputType);

      // If we have multiple outputs, let's find indices of each output that
      // matches a target and create our shader(s) with that
      if (Array.isArray(outputs)) {
        const typeToIndex = new Map<number, number>();

        for (let i = 0, iMax = targetOutputs.length; i < iMax; ++i) {
          const target = targetOutputs[i];

          // Find the index of an output that supports this target
          for (let k = 0, kMax = outputs.length; k < kMax; ++k) {
            const output = outputs[k];

            if (output.outputType === target.outputType) {
              typeToIndex.set(target.outputType, k);
              break;
            }
          }
        }

        // After we have discovered an index for types. We see which combination
        // method we are allowed to do based on our system's hardware.
        // For MRT capable hardware, we take in the largest index we found and
        // combine all dependencies before it and declare that shader output as
        // capable of handling all target outputs
        if (WebGLStat.MRT) {
          let maxIndex = -1;
          const types: number[] = [];
          typeToIndex.forEach((index, type) => {
            types.push(type);
            maxIndex = Math.max(index, maxIndex);
          });

          // No valid index found is considered an error
          if (maxIndex === -1) return null;

          const processed = this.mergeFragmentOutputs(
            outputs.slice(0, maxIndex + 1),
            targetTypes,
            types
          );

          return [
            {
              source: processed.output,
              outputNames: processed.outputNames,
              outputTypes: processed.outputTypes
            }
          ];
        }

        // For non-MRT capable hardware, we need to generate a shader per each
        // output type we matched on
        else {
          const generated: OutputFragmentShader = [];
          typeToIndex.forEach((index, type) => {
            // Merge in the shaders to one shader, but only mark a single type
            // as the output.
            const processed = this.mergeFragmentOutputs(
              outputs.slice(0, index + 1),
              [type],
              undefined,
              true
            );

            generated.push({
              source: processed.output,
              outputNames: processed.outputNames,
              outputTypes: processed.outputTypes
            });
          });

          return generated;
        }
      }

      // If we have a single output, then we only look for a target that wants
      // COLOR and map it to that. If no target wants COLOR, then we don't need
      // any shaders for this configuration.
      else {
        const targetColor = targetOutputs.find(
          t => t.outputType === ViewOutputInformationType.COLOR
        );

        if (targetColor && outputs) {
          const processed = this.mergeFragmentOutputs(
            [
              {
                source: outputs,
                outputType: ViewOutputInformationType.COLOR
              }
            ],
            targetTypes
          );

          return [
            {
              source: processed.output,
              outputNames: processed.outputNames,
              outputTypes: processed.outputTypes
            }
          ];
        }
      }
    }

    // If this is reached, nothing was a valid output for the
    return null;
  }

  /**
   * This processes a layer, it's Shader IO requirements, and it's shaders to
   * produce a fully functional shader that is compatible with the client's
   * system.
   */
  process<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>,
    shaderIO: IShaderInitialization<T>,
    fragmentShaders: OutputFragmentShader,
    ioExpansion: BaseIOExpansion[],
    transforms: BaseShaderTransform[],
    sortIO: BaseIOSorting
  ): IShaderProcessingResults<T> | null {
    try {
      // Process imports to retrieve the requested IO the shader modules would
      // be requiring
      const shadersWithImports = this.processImports(
        layer,
        shaderIO,
        fragmentShaders
      );
      if (!shadersWithImports) return null;

      // After processing our imports, we can now fully aggregate the needed
      // shader IO to make our layer operate properly. Process all of the
      // attributes and apply IO expansion to all of the discovered shader IO
      // the layer will need to execute.
      const { vertexAttributes, instanceAttributes, uniforms } = injectShaderIO(
        layer.surface.gl,
        layer,
        shaderIO,
        ioExpansion,
        sortIO,
        shadersWithImports
      );
      // After all of the shader IO is established, let's calculate the
      // appropriate buffering strategy For the layer.
      layer.getLayerBufferType(
        layer.surface.gl,
        vertexAttributes,
        instanceAttributes
      );

      // Calculate needed metrics that may be used by any of the processors
      // These metrics include information regarding block allotments reltive to
      // each instance.
      this.metricsProcessing.process(instanceAttributes, uniforms);

      // We are going to gather headers for both vertex and fragment from our
      // processors
      let vsHeader = "";
      let fsHeader = "";
      // We will also gather the destructuring structure for the attributes from
      // our processor
      let destructuring = "";
      // In processing, this may generate changes to the Material to accommodate
      // features required
      const materialChanges: ShaderIOHeaderInjectionResult["material"] = {
        uniforms: []
      };

      const vsHeaderDeclarations = new Map();
      const fsHeaderDeclarations = new Map();
      const destructureDeclarations = new Map();

      // Loop through all of our processors that handle expanding all IO into
      // headers for the shader
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

      console.log({ vsHeaderDeclarations });

      // After we have aggregated all of our declarations, we now piece them
      // together
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

      // Establish all extensions to be applied to the shader. Extensions are
      // essentially any directive that looks like:
      // ```#directive and stuff```
      const extensions = this.processExtensions();
      // Create a default precision modifier for now
      const precision = "precision highp float;\n\n";
      // Now we concatenate the shader pieces into one glorious shader of
      // compatibility and happiness
      const fullShaderVS =
        extensions + precision + vsHeader + shadersWithImports.vs;

      // Last we replace any templating variables with their relevant values
      let templateOptions: { [key: string]: string } = {
        [templateVars.attributes]: destructuring
      };

      // This flag will determine if the attributes are manually placed in the
      // shader. If this is not true, then the attributes will get injected into
      // the main() method.
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

      // We process the Fragment shader as well, currently with nothing to
      // replace aside from removing any superfluous template requests
      templateOptions = {};

      // Loop through all of the fragment shaders and perform the final
      // aggregation of changes on all the fragments involved.
      shadersWithImports.fs.forEach(shader => {
        const fullShaderFS = extensions + precision + fsHeader + shader.source;

        const processShaderFS = shaderTemplate({
          options: templateOptions,
          required: undefined,
          shader: fullShaderFS
        });

        shader.source = processShaderFS.shader.trim();
      });

      // The final step: apply all shader transforms to the content
      for (let i = 0, iMax = transforms.length; i < iMax; ++i) {
        const transform = transforms[i];
        processedShaderVS.shader = transform.vertex(processedShaderVS.shader);

        for (let k = 0, kMax = shadersWithImports.fs.length; k < kMax; ++k) {
          const fs = shadersWithImports.fs[k];
          fs.source = transform.fragment(fs.source);
        }
      }

      const results = {
        fs: shadersWithImports.fs,
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
   * This processes all information available about the shader to determine
   * which extensions must be available for the shader to work.
   */
  private processExtensions(): string {
    let extensions = "";

    // This MUST be the absolute FIRST item in the shader for it to work
    if (WebGLStat.SHADERS_3_0) {
      extensions += "#version 300 es";
    }

    // When MRT is implemented as an extension, we need the extension header in
    // the shader, and the outputs are mapped to gl_FragData[]
    if (WebGLStat.MRT_EXTENSION) {
      extensions += "#extension GL_EXT_draw_buffers : require";
    }

    // Add some buffer for readability
    if (extensions) extensions += "\n\n";

    return extensions;
  }

  /**
   * This applies the imports for the specified layer and generates the
   * appropriate shaders from the output. Upon failure, this will just return
   * null.
   *
   * This also does some additional work to add in some modules based on the
   * layer's preferences
   */
  private processImports<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>,
    shaders: IShaderInitialization<T>,
    fragmentShaders: OutputFragmentShader
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
    const fs = fragmentShaders
      .map(shader => {
        const result = ShaderModule.process(
          layer.id,
          shader.source,
          ShaderInjectionTarget.FRAGMENT,
          baseModules.fs
        );

        if (result.errors.length > 0) {
          console.warn(
            "Error processing imports for the fragment shader of layer:",
            layer.id,
            "Errors",
            ...result.errors.reverse()
          );

          return null;
        }

        result.shaderModuleUnits.forEach(moduleUnit =>
          shaderModuleUnits.add(moduleUnit)
        );

        return {
          source: result.shader || "",
          outputTypes: shader.outputTypes,
          outputNames: shader.outputNames
        };
      })
      .filter(isDefined);

    // Gather all discovered Shader Module Units
    vs.shaderModuleUnits.forEach(moduleUnit =>
      shaderModuleUnits.add(moduleUnit)
    );

    return {
      fs,
      vs: vs.shader || "",
      shaderModuleUnits
    };
  }
}
