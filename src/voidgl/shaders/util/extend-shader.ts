import { Instance } from "../../instance-provider/instance";
import { IShaderExtension, IShaderInitialization } from "../../types";
import {
  IShaderTemplateRequirements,
  shaderTemplate
} from "../../util/shader-templating";
import { templateVars } from "../template-vars";

export function extendShader<T extends Instance>(
  shaderIO: IShaderInitialization<T>,
  vs?: IShaderExtension,
  fs?: IShaderExtension
) {
  const baseVS = shaderIO.vs;
  const baseFS = shaderIO.fs;

  let extendedVS = { shader: baseVS };
  let extendedFS = { shader: baseFS };

  // Set the replacements for the extension locations, but also retain the extension modifier to allow for
  // Further extensions if desired.
  if (vs) {
    const options: { [key: string]: string } = {};

    options[templateVars.extendHeader] = vs.header
      ? `${vs.header}\n$\{${templateVars.extendHeader}}`
      : "";
    options[templateVars.extend] = vs.body
      ? `${vs.body}\n$\{${templateVars.extend}}`
      : "";

    // It is REQUIRED to have both header and body extensions to be a valid extendible shader
    const required: IShaderTemplateRequirements = {
      name: "Extend VS Shader",
      values: [templateVars.extendHeader, templateVars.extend]
    };

    // Generated the extended shader
    extendedVS = shaderTemplate({
      options,
      required,
      shader: baseVS,

      // We do not want to remove any template macros that do not deal with extension
      onToken: (token, replace) => {
        if (
          token === templateVars.extendHeader ||
          token === templateVars.extend
        ) {
          return replace;
        }

        return `$\{${token}}`;
      }
    });
  }

  // Next, extend the fragment shader

  // Set the replacements for the extension locations, but also retain the extension modifier to allow for
  // Further extensions if desired.
  if (fs) {
    const options: { [key: string]: string } = {};

    options[templateVars.extendHeader] = fs.header
      ? `${fs.header}\n$\{${templateVars.extendHeader}}`
      : "";
    options[templateVars.extend] = fs.body
      ? `${fs.body}\n$\{${templateVars.extend}}`
      : "";

    // It is REQUIRED to have both header and body extensions to be a valid extendible shader
    const required = {
      name: "Extend FS Shader",
      values: [templateVars.extendHeader, templateVars.extend]
    };

    // Generate the extended shader
    extendedFS = shaderTemplate({
      options,
      required,
      shader: baseFS,

      // We do not want to remove any template macros that do not deal with extension
      onToken: (token, replace) => {
        if (
          token === templateVars.extendHeader ||
          token === templateVars.extend
        ) {
          return replace;
        }

        return `$\{${token}}`;
      }
    });
  }

  // Apply the extension to the shader io program
  return {
    fs: extendedFS.shader,
    vs: extendedVS.shader
  };
}
