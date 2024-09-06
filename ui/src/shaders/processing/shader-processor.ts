import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { BaseIOSorting } from "./base-io-sorting";
import { BaseShaderTransform } from "./base-shader-transform";
import {
  FragmentOutputType,
  type IIndexBufferInternal,
  IInstanceAttribute,
  IInstancingUniform,
  IShaderInitialization,
  isString,
  IUniformInternal,
  IVertexAttributeInternal,
  MapValueType,
  OutputFragmentShader,
  OutputFragmentShaderSource,
  OutputFragmentShaderTarget,
  ShaderInjectionTarget,
} from "../../types";
import { ILayerProps, Layer } from "../../surface/layer";
import { injectShaderIO } from "./inject-shader-io";
import { Instance } from "../../instance-provider/instance";
import { MetricsProcessing } from "./metrics-processing";
import { removeComments } from "../../util/remove-comments";
import {
  ShaderDeclarationStatementLookup,
  ShaderDeclarationStatements,
  ShaderIOHeaderInjectionResult,
} from "./base-shader-io-injection";
import { ShaderModule } from "./shader-module";
import { ShaderModuleUnit } from "./shader-module-unit";
import { shaderTemplate } from "../../util/shader-templating";
import { templateVars } from "../template-vars";
import { WebGLStat } from "../../gl";

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
  /** The index buffer that arises after module processing */
  indexBuffer?: IIndexBufferInternal;
}

/** Expected results from processing shader imports */
export type ProcessShaderImportResults = {
  fs: OutputFragmentShader;
  vs: string;
  shaderModuleUnits: Set<ShaderModuleUnit>;
} | null;

/**
 * This is the expected token to be found within the shader content to indicate
 * a fragment output.
 */
const OUT_TOKEN = "out";
/**
 * Seperator token between an out token and the variable name it's supposed to
 * become.
 */
const OUT_DELIMITER = ":";

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
  static mergeFragmentOutputsForMRT(
    _declarationsVS: ShaderDeclarationStatements,
    declarationsFS: ShaderDeclarationStatements,
    layerOutputs: { source: string; outputType: number }[],
    viewOutputs: number[],
    typeFilter?: number[],
    singleOutput?: boolean
  ) {
    let headers = "";
    let bodies = "";
    let fragmentOutput = "";
    const outputNames = new Set<string>();
    const outputTypes: number[] = [];
    const usedTypes = new Set<number>();

    // When MRT isn't enabled at all, then our fragment output simply writes
    // directly to gl_FragColor (Our ES 3.0 converter will properly handle
    // gl_FragColor later)
    if (!WebGLStat.MRT) {
      fragmentOutput = " = gl_FragColor";
    }

    layerOutputs.forEach((layerOutput, i) => {
      // If output is not allowed, then the found output in the shader will
      // simply map to a locally scoped variable instead of a specialized output
      // variable.
      let allowOutput = true;
      // We can only have one token per each shader. Declaring multiple ${out}
      // tokens will be considered an error and unsupported.
      let foundOutputToken = false;

      if (typeFilter && typeFilter.indexOf(layerOutput.outputType) < 0) {
        allowOutput = false;
      }

      if (singleOutput && i < layerOutputs.length - 1) {
        allowOutput = false;
      }

      if (!singleOutput && viewOutputs.indexOf(layerOutput.outputType) < 0) {
        allowOutput = false;
      }

      if (usedTypes.has(layerOutput.outputType)) {
        throw new Error(
          "Can not use the same Output Fragment type multiple times"
        );
      }

      usedTypes.add(layerOutput.outputType);

      // The view is going to only have a single render target to render against
      // so we will only output against that given render target which will have
      // a specific layout
      // [COLOR_ATTACHMENT0, COLOR_ATTACHMENT1, ..., COLOR_ATTACHMENTN]
      // And this will be in alignment with 'viewOutputs' so we need to make the
      // layout target according to this.
      const layoutOutputIndex = viewOutputs.indexOf(layerOutput.outputType);

      shaderTemplate({
        shader: removeComments(layerOutput.source),

        /**
         * Analyze each token for "out" tokens indicating output
         */
        onToken(token) {
          const trimmedToken = token.trim();

          if (trimmedToken.indexOf(OUT_TOKEN) === 0) {
            if (foundOutputToken) {
              console.error(
                "Found multiple ${out} tokens in a single fragment shader. This is not supported nor logical",
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

              if (outputName === "gl_FragColor") {
                throw new Error(
                  "DO not use gl_FragColor as an identifier for an out. Choose something not used by the WebGL spec."
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
                outputTypes.push(layerOutput.outputType);

                // Handle the special case of the MRT extension where we output
                // to the special case of gl_FragData
                if (WebGLStat.MRT_EXTENSION) {
                  fragmentOutput = ` = gl_FragData[${layoutOutputIndex}]`;
                  declare = "vec4 ";
                }

                // Handle the MRT extension case where we have to create an
                // 'out' declaration for the decalred output name.
                else if (WebGLStat.MRT && WebGLStat.SHADERS_3_0) {
                  declarationsFS.set(
                    outputName,
                    `layout(location = ${layoutOutputIndex}) out vec4 ${outputName};\n`
                  );
                } else {
                  throw new Error(
                    `Could not generate a proper output declaration for the fragment shader output: ${outputName}`
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
          // In the event no output token was discovered, we look for
          // gl_FragColor from our es 1.0 style shaders. If that is present,
          // that is the output and it is mapped to FragmentOutputType.COLOR
          if (!foundOutputToken && body) {
            const findFragColor = body.match("gl_FragColor");

            if (findFragColor) {
              outputTypes.push(layerOutput.outputType);

              if (WebGLStat.MRT) {
                if (WebGLStat.SHADERS_3_0) {
                  declarationsFS.set(
                    "_FragColor",
                    `layout(location = ${layoutOutputIndex}) out vec4 _FragColor;\n`
                  );

                  body = body.replace(/gl_FragColor/g, `_FragColor`);
                } else {
                  // Do first replacement with declaration
                  body = body.replace(
                    /gl_FragColor\s+=/,
                    `vec4 _FragColor = gl_FragData[${layoutOutputIndex}] =`
                  );

                  // Do subsequent replacements without declaration
                  body = body.replace(
                    /gl_FragColor\s+=/g,
                    `_FragColor = gl_FragData[${layoutOutputIndex}] =`
                  );

                  // Replace any useage of gl_FragColor that does not assign to
                  // it
                  body = body.replace(/gl_FragColor/g, `_FragColor`);
                }
              }

              outputNames.add("_FragColor");
            } else {
              outputTypes.push(FragmentOutputType.NONE);
            }
          }

          headers += `\n${(header || "").trim()}`;
          bodies += `\n  ${(body || "").trim()}`;
          return (body || "").trim();
        },
      });
    });

    return {
      output: `${headers}\nvoid main() {\n${bodies}\n}`,
      outputNames: Array.from(outputNames.values()),
      outputTypes: outputTypes,
    };
  }

  /**
   * This merges output for the fragment shader when we are simply outputting to
   * a single COLOR target the view specifies. This means we look for an output
   * from the layer that is a COLOR output and merge all fragments up to that
   * output, we clear out any templating variables, and for WebGL1 we make it
   * output to gl_FragColor and for WebGL2 we output to _FragColor and make an
   * out declarartion for it.
   */
  static mergeOutputFragmentShaderForColor(
    layerOutputs: OutputFragmentShaderSource,
    viewOutputs: number[]
  ) {
    // Our view output MUST only be a string or a single color target for this
    // to be valid.
    if (viewOutputs.length > 1 || viewOutputs[0] !== FragmentOutputType.COLOR) {
      throw new Error(
        "Merging fragment shaders for only COLOR output is only valid when the view has a single COLOR output target."
      );
    }

    // If this output is just a string, we have our simple COLOR output.
    if (isString(layerOutputs)) {
      layerOutputs = [
        {
          outputType: FragmentOutputType.COLOR,
          source: layerOutputs,
        },
      ];
    }

    let bodies = "";
    let headers = "";
    const outputNames = new Set<string>();
    const outputTypes: number[] = [];

    layerOutputs.some((layerOutput) => {
      const isColor = layerOutput.outputType === FragmentOutputType.COLOR;
      let foundOutputToken = false;

      if (isColor) {
        outputTypes.push(FragmentOutputType.COLOR);
      }

      shaderTemplate({
        shader: removeComments(layerOutput.source),

        /**
         * Analyze each token for "out" tokens indicating output
         */
        onToken(token) {
          const trimmedToken = token.trim();

          if (trimmedToken.indexOf(OUT_TOKEN) === 0) {
            if (foundOutputToken) {
              console.error(
                "Found multiple ${out} tokens in a single fragment shader. This is not supported nor logical",
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

              if (outputName === "gl_FragColor") {
                throw new Error(
                  "DO not use gl_FragColor as an identifier for an out. Choose something not used by the WebGL spec."
                );
              }

              // If this is the color output of the layer, then we take the
              // output token and simply map it to the proper ES version
              // fragment output. Since we have an ES 3 transform later in the
              // process we can ALWAYS set this to gl_FragColor, BUT we must
              // make sure the token specified is properly declared so it is
              // available in the rest of the exisitng program.
              if (isColor) {
                outputNames.add("gl_FragColor");

                if (outputName !== "gl_FragColor") {
                  return `vec4 ${outputName} = gl_FragColor`;
                }

                return "gl_FragColor";
              }

              // Replace the token with just the name of the variable being
              // declared with the proper type sizing.
              return `vec4 ${outputName}`;
            }
          }

          // Leave unprocessed tokens alone
          return `$\{${token}}`;
        },

        onMain(body, header) {
          headers += `\n${(header || "").trim()}`;
          bodies += `\n  ${(body || "").trim()}`;
          return (body || "").trim();
        },
      });

      // Stop when we find a COLOR output
      if (isColor) return true;
      return false;
    });

    return {
      output: `${headers}\nvoid main() {\n${bodies}\n}`,
      outputNames: Array.from(outputNames.values()),
      outputTypes: outputTypes,
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
    declarationsVS: ShaderDeclarationStatements,
    declarationsFS: ShaderDeclarationStatements,
    viewOutputs?: OutputFragmentShaderTarget | null,
    layerOutputs?: OutputFragmentShaderSource
  ): MapValueType<OutputFragmentShader> | null {
    // If the layer output only is a simple string, then we assume the COLOR
    // output of the layer. If the layer does not specify a specific COLOR
    // output, then we assume the culminated output of all outputs of the layer
    // is the target.
    //
    // NOTE: All results under this branch will be for SINGLE
    // TARGET outputs, so we don't need to worry about MRT here. The final
    // fragment output IS the only output.
    if (!viewOutputs || isString(viewOutputs)) {
      // View expects a color output, layer only outputs a color, we are good
      // to simply output the layer to the view.
      if (isString(layerOutputs)) {
        const processed = this.mergeOutputFragmentShaderForColor(
          [
            {
              source: layerOutputs,
              outputType: FragmentOutputType.COLOR,
            },
          ],
          [FragmentOutputType.COLOR]
        );

        return {
          source: processed.output,
          outputTypes: [FragmentOutputType.COLOR],
          outputNames: processed.outputNames,
        };
      }

      // Look through the layer's fragment outputs for something that is
      // labeled as a color. We prioritize that.
      else if (Array.isArray(layerOutputs)) {
        const colorOutput = layerOutputs.find(
          (s) => s.outputType === FragmentOutputType.COLOR
        );

        let outputIndex = -1;

        // If our layer outputs a color, this is the output element that will
        // output for our COLOR target.
        if (colorOutput) {
          outputIndex = layerOutputs.indexOf(colorOutput);
        }

        // With no specified color, we render the final output of the layer as
        // the output to the view but we dub it as a COLOR anyways.
        else {
          outputIndex = layerOutputs.length - 1;
        }

        // We take the found index of the output we need to output for our COLOR
        // target and aggregate all of the preceding outputs as the dependencies
        // needed for this output to work properly.
        const processed = this.mergeOutputFragmentShaderForColor(
          layerOutputs.slice(0, outputIndex + 1),
          [FragmentOutputType.COLOR]
        );

        return {
          source: processed.output,
          outputNames: processed.outputNames,
          outputTypes: [FragmentOutputType.COLOR],
        };
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
    else if (Array.isArray(viewOutputs)) {
      if (!WebGLStat.MRT) {
        throw new Error(
          "Multiple Render Targets were specified, but are not natively supported by user's hardware! MRT also does not have a fallback in deltav yet!"
        );
      }

      // Gather all of the actual output types in a list so we know the ordering
      // and the mapping of types to specific outputs.
      const viewOutputTypes = viewOutputs.map((target) => target.outputType);

      // If we have multiple outputs, let's find indices of each output that
      // matches a target and create our shader(s) with that
      if (Array.isArray(layerOutputs)) {
        const typeToIndex = new Map<number, number>();

        for (let i = 0, iMax = viewOutputs.length; i < iMax; ++i) {
          const target = viewOutputs[i];

          // Find the index of an output that supports this target
          for (let k = 0, kMax = layerOutputs.length; k < kMax; ++k) {
            const output = layerOutputs[k];

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

          const processed = this.mergeFragmentOutputsForMRT(
            declarationsVS,
            declarationsFS,
            layerOutputs.slice(0, maxIndex + 1),
            viewOutputTypes,
            types
          );

          return {
            source: processed.output,
            outputNames: processed.outputNames,
            outputTypes: processed.outputTypes,
          };
        }

        // For non-MRT capable hardware, we need to generate a shader per each
        // output type we matched on
        else {
          throw new Error(
            "Fragment shader generation not supported for MRT systems on non MRT hardware...yet"
          );
          // const generated: MapValueType<OutputFragmentShader> = [];
          // typeToIndex.forEach((index, type) => {
          //   // Merge in the shaders to one shader, but only mark a single type
          //   // as the output.
          //   const processed = this.mergeFragmentOutputsForMRT(
          //     declarations,
          //     layerOutputs.slice(0, index + 1),
          //     [type],
          //     undefined,
          //     true
          //   );

          //   generated.push({
          //     source: processed.output,
          //     outputNames: processed.outputNames,
          //     outputTypes: processed.outputTypes
          //   });
          // });

          // return generated;
        }
      }

      // If we have a single output, then we only look for a target that wants
      // COLOR and map it to that. If no target wants COLOR, then we don't need
      // any shaders for this configuration.
      else {
        const targetColor = viewOutputs.find(
          (t) => t.outputType === FragmentOutputType.COLOR
        );

        if (targetColor && layerOutputs) {
          const processed = this.mergeFragmentOutputsForMRT(
            declarationsVS,
            declarationsFS,
            [
              {
                source: layerOutputs,
                outputType: FragmentOutputType.COLOR,
              },
            ],
            viewOutputTypes
          );

          return {
            source: processed.output,
            outputNames: processed.outputNames,
            outputTypes: processed.outputTypes,
          };
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
  process<TInstance extends Instance, TProps extends ILayerProps<TInstance>>(
    layer: Layer<TInstance, TProps>,
    shaderIO: IShaderInitialization<TInstance>,
    fragmentShaders: OutputFragmentShader,
    shaderDeclarations: ShaderDeclarationStatementLookup,
    ioExpansion: BaseIOExpansion[],
    transforms: BaseShaderTransform[],
    sortIO: BaseIOSorting
  ): IShaderProcessingResults<TInstance> | null {
    try {
      if (!layer.surface.gl) {
        console.warn("No WebGL context available for layer!");
        return null;
      }

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
      const { vertexAttributes, instanceAttributes, indexBuffer, uniforms } =
        injectShaderIO(
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
        shaderIO,
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
        uniforms: [],
      };

      const vsHeaderDeclarations: ShaderDeclarationStatements =
        shaderDeclarations.vs || new Map();
      const fsHeaderDeclarations: ShaderDeclarationStatementLookup["fs"] =
        shaderDeclarations.fs || new Map();
      const destructureDeclarations: ShaderDeclarationStatements =
        shaderDeclarations.destructure || new Map();

      // Loop through all of our processors that handle expanding all IO into
      // headers for the shader
      for (let i = 0, iMax = ioExpansion.length; i < iMax; ++i) {
        const processor = ioExpansion[i];

        // Generate vertex header declarations
        const vsHeaderInfo = processor.processHeaderInjection<
          TInstance,
          TProps
        >(
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

        // Destructure the elements
        destructuring += processor.processAttributeDestructuring<
          TInstance,
          TProps
        >(
          layer,
          destructureDeclarations,
          this.metricsProcessing,
          vertexAttributes,
          instanceAttributes,
          uniforms
        );
      }

      // After we have aggregated all of our declarations, we now piece them
      // together
      let declarations = "";

      vsHeaderDeclarations.forEach((declaration) => {
        declarations += declaration;
      });

      vsHeader = declarations + vsHeader;
      declarations = "";

      destructureDeclarations.forEach((declaration) => {
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
        [templateVars.attributes]: destructuring,
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
        },
      });

      // We process the Fragment shader as well, currently with nothing to
      // replace aside from removing any superfluous template requests
      shadersWithImports.fs.forEach((fsShader, view) => {
        templateOptions = {};
        fsHeader = "";
        declarations = "";
        const fsDeclarations: ShaderDeclarationStatements =
          fsHeaderDeclarations.get(view) || new Map();

        for (let i = 0, iMax = ioExpansion.length; i < iMax; ++i) {
          const processor = ioExpansion[i];
          // Generate fragment header declarations
          const fsHeaderInfo = processor.processHeaderInjection<
            TInstance,
            TProps
          >(
            ShaderInjectionTarget.FRAGMENT,
            fsDeclarations,
            layer,
            this.metricsProcessing,
            vertexAttributes,
            instanceAttributes,
            uniforms
          );

          fsHeader += fsHeaderInfo.injection;

          if (fsHeaderInfo.material) {
            const currentUniformNames = new Set();
            materialChanges.uniforms.forEach((uniform) =>
              currentUniformNames.add(uniform.name)
            );
            materialChanges.uniforms.forEach((uniform) => {
              if (!currentUniformNames.has(uniform.name)) {
                materialChanges.uniforms.push(uniform);
              }
            });
          }
        }

        fsDeclarations.forEach((declaration) => {
          declarations += declaration;
        });

        fsHeader = declarations + fsHeader;

        // Loop through all of the fragment shaders and perform the final
        // aggregation of changes on all the fragments involved.
        const fullShaderFS =
          extensions + precision + fsHeader + fsShader.source;

        const processShaderFS = shaderTemplate({
          options: templateOptions,
          required: undefined,
          shader: fullShaderFS,
        });

        fsShader.source = processShaderFS.shader.trim();

        // The final step: apply all shader transforms to the content
        for (let i = 0, iMax = transforms.length; i < iMax; ++i) {
          const transform = transforms[i];
          processedShaderVS.shader = transform.vertex(processedShaderVS.shader);
          fsShader.source = transform.fragment(fsShader.source);
        }
      });

      const results = {
        fs: shadersWithImports.fs,
        materialUniforms: materialChanges.uniforms,
        maxInstancesPerBuffer:
          this.metricsProcessing.maxInstancesPerUniformBuffer,
        modules: Array.from(shadersWithImports.shaderModuleUnits),
        vs: processedShaderVS.shader.trim(),
        vertexAttributes,
        instanceAttributes,
        uniforms,
        indexBuffer,
      };

      return results;
    } catch (err) {
      if (err instanceof Error) {
        console.warn(
          "An unknown error occurred while processing the shaders for layer:",
          layer.id
        );
        console.warn("Error:");
        console.warn(err && (err.stack || err.message));
      }

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
    const vsResult = ShaderModule.process(
      layer.id,
      shaders.vs,
      ShaderInjectionTarget.VERTEX,
      baseModules.vs
    );

    if (vsResult.errors.length > 0) {
      console.warn(
        "Error processing imports for the vertex shader of layer:",
        layer.id,
        "Errors",
        ...vsResult.errors.reverse()
      );

      return null;
    }

    const processedFragmentShaders: OutputFragmentShader = new Map();

    // Process imports for the fragment shaders
    fragmentShaders.forEach((shader, view) => {
      const fsResult = ShaderModule.process(
        layer.id,
        shader.source,
        ShaderInjectionTarget.FRAGMENT,
        baseModules.fs
      );

      if (fsResult.errors.length > 0) {
        console.warn(
          "Error processing imports for the fragment shader of layer:",
          layer.id,
          "Errors",
          ...fsResult.errors.reverse()
        );

        return;
      }

      fsResult.shaderModuleUnits.forEach((moduleUnit) =>
        shaderModuleUnits.add(moduleUnit)
      );

      const fs = {
        source: fsResult.shader || "",
        outputTypes: shader.outputTypes,
        outputNames: shader.outputNames,
      };

      processedFragmentShaders.set(view, fs);
    });

    // Gather all discovered Shader Module Units
    vsResult.shaderModuleUnits.forEach((moduleUnit) =>
      shaderModuleUnits.add(moduleUnit)
    );

    return {
      fs: processedFragmentShaders,
      vs: vsResult.shader || "",
      shaderModuleUnits,
    };
  }
}
