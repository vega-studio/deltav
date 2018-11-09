import { ShaderInjectionTarget } from "../../types";
import { shaderTemplate } from "../../util";
import {
  ShaderModuleUnit,
  ShaderModuleUnitOptions
} from "./shader-module-unit";

const debug = require("debug")("performance");
const debugModuleVS = require("debug")("shader-module-vs");
const debugModuleFS = require("debug")("shader-module-fs");

/**
 * This is the results expected from a compile() operation from the ShaderModule.
 */
export interface IShaderCompileResults {
  errors: string[];
  shader: string | null;
}

/**
 * The partial token that must be matched to indicate an import statement.
 * (Must be the first non-whitespace word found in the token)
 */
const IMPORT_TOKEN = "import";
/**
 * This is a delimiter between the import token and the identifying import id value
 * provided. This must be the next non-whitespace character found after the import token.
 *
 * We allow whitespace between the token and it's delimiter to allow for style preference
 *
 * import: id
 * import:id
 * import : id
 *
 * etc.
 */
const IMPORT_DELIMITER = ":";

/**
 * Tests to see if a ShaderModuleUnit is compatible with a provided Shader Target
 */
function isUnitCompatible(
  unit: ShaderModuleUnit,
  target: ShaderInjectionTarget
) {
  return (
    Boolean(unit) &&
    (unit.compatibility === target ||
      unit.compatibility === ShaderInjectionTarget.ALL)
  );
}

/**
 * This file defines modules for shaders. Shader modules are global to the window context.
 */
export class ShaderModule {
  /** These are all of the currently registered modules for the Shader Modules */
  static modules = new Map<
    string,
    { fs?: ShaderModuleUnit; vs?: ShaderModuleUnit }
  >();

  /**
   * This registers a new ShaderModuleUnit. It makes the module available by it's importId within shaders
   * using this framework.
   *
   * If the module is registered with no returned output, the registration was a success. Any returned output
   * indicates issues encountered while registering the module.
   */
  static register(
    unit: ShaderModuleUnit | ShaderModuleUnitOptions | ShaderModuleUnitOptions[]
  ): string | null {
    // If the input is just Shader Module Unit options injected, then we simply handle wrapping
    // the options into a ShaderModuleUnit and do a registration.
    if (!(unit instanceof ShaderModuleUnit)) {
      if (Array.isArray(unit)) {
        let out = "";

        unit.forEach(options => {
          const output = ShaderModule.register(options);
          if (output) out += `${output}\n`;
        });

        // If there was no output at any time, let's be sure to return a simple null
        if (!out) {
          return null;
        }

        return out;
      }

      return ShaderModule.register(new ShaderModuleUnit(unit));
    }

    let current = ShaderModule.modules.get(unit.moduleId);

    if (!current) {
      current = {};
      ShaderModule.modules.set(unit.moduleId, current);
    }

    const fs = current.fs;
    const vs = current.vs;
    const isFSCompatible = isUnitCompatible(
      unit,
      ShaderInjectionTarget.FRAGMENT
    );
    const isVSCompatible = isUnitCompatible(unit, ShaderInjectionTarget.VERTEX);

    if (fs && isFSCompatible) {
      if (fs.isFinal) {
        return `Module ID: ${
          unit.moduleId
        } Can not override the module's existing Fragment registration as the exisitng module is marked as final`;
      }

      debug(
        "A Shader Module Unit has overridden an existing module for the Fragment Shader Module ID: %o",
        unit.moduleId
      );
    }

    if (vs && isVSCompatible) {
      if (vs.isFinal) {
        return `Module ID: ${
          unit.moduleId
        } Can not override the module's existing Vertex registration as the exisitng module is marked as final`;
      }

      debug(
        "A Shader Module Unit has overridden an existing module for the Vertex Shader Module ID: %o",
        unit.moduleId
      );
    }

    // Register the module as it passed all scrutiny by this point
    if (isFSCompatible) {
      current.fs = unit;
    }

    if (isVSCompatible) {
      current.vs = unit;
    }

    // Lock the unit down indicating it can no longer be modified ever again.
    unit.lock();

    return null;
  }

  /**
   * This examines a shader string and replaces all import statements with any existing registered modules.
   * This will also output any issues such as requested modules that don't exist and detect circular dependencies
   * and such ilk.
   *
   * @param shader The content of the shader to analyze for import statements
   * @param target The shader target type to consider
   * @param additionalModules Additional modules to include in the shader regardless if the shader requested it or not
   */
  static process(
    id: string,
    shader: string,
    target: ShaderInjectionTarget,
    additionalModules?: string[]
  ): IShaderCompileResults {
    // This stores the module id's that have already been included in the shader
    const included = new Set<string>();
    // This stores the import stack that is currently being processed
    const processing: (string | null)[] = [];
    // This is all of the processed errors discovered while resolving imports
    const errors: string[] = [];
    // Pick a debugging target based on shader target
    const debugTarget =
      target === ShaderInjectionTarget.VERTEX ? debugModuleVS : debugModuleFS;
    debugTarget("Processing Shader for id %o:", id);

    // We place this method as an internal recursive strategy to solving this issue due to the complexities of
    // the problem at hand. We have shaders that have tokens analyzed that MUST be immediately resolved
    // to a correct value. Thus we can not use a process queue to remove the need for the recursion. Also, as
    // this is a static method, this provides some needed properties within the context of the function that we
    // do not want exposed at all, which is impossible to hide within a static context (private static is not supported).
    function process(shader: string, id: string | null) {
      // Debugging for the import id's found along with the current stack
      debugTarget(
        "%o: %o",
        id,
        processing
          .slice(0)
          .reverse()
          .join(" -> ")
      );
      // First look to see if the identifier is already in the processing queue. If it is, we
      // have a heinous circular dependency.
      const queueIndex = processing.indexOf(id);
      // Queue up this id as being processed
      processing.unshift(id);

      // See if the circular dependency is found.
      if (queueIndex > -1) {
        // Since we have a queue of our processing path, we can show the circular dependency path
        const circularPath = processing.slice(0, queueIndex + 2).reverse();
        // Spew the blood
        errors.push(
          `A Shader has detected a Circular dependency in import requests: ${circularPath.join(
            " -> "
          )}`
        );
        // Remove the id from the queue
        processing.shift();

        // Return a null flag indicating the process failed.
        return null;
      }

      // At this point we need to determine if the id has already been included in the module imports
      // Each import should only be included once so we prevent duplicate items from showing up
      if (id && included.has(id)) {
        // Remove the id from the queue
        processing.shift();

        // Return empty, but not errored
        return "";
      }

      // All included modules should appear at the top of the current module so we store included module
      // output here to be added later.
      let includedModuleOutput = "";

      // Here we process the module contents and look for additional import statements.
      const template = shaderTemplate({
        // We do not want any direct replacement options, we will handle token analyzing
        // via our onToken callback so we can find our special "import:" case
        options: {},
        // Provide the shader to our template processor
        shader,

        // We do not want to remove any template macros that do not deal with extension
        onToken: token => {
          const trimmedToken = token.trim();

          // See if the token is the first thing to appear
          if (trimmedToken.indexOf(IMPORT_TOKEN) === 0) {
            // Analyze the remainder of the token to find the necessary colon to be the NEXT
            // Non-whitespace character
            const afterToken = trimmedToken.substr(IMPORT_TOKEN.length).trim();

            // Make sure the character IS a colon
            if (afterToken[0] === IMPORT_DELIMITER) {
              // At this point, ANYTHING after the colon is the module id being requested (with white space trimmed)
              const moduleId = afterToken
                .substr(IMPORT_DELIMITER.length)
                .trim();

              // Get the requested module
              const mod = ShaderModule.modules.get(moduleId);

              // If we found the module, great! We can store the identifier as a module associated with this shader
              // string thus reducing processing time needed for next processing.
              if (mod) {
                let moduleContent;

                if (
                  target === ShaderInjectionTarget.FRAGMENT ||
                  target === ShaderInjectionTarget.ALL
                ) {
                  if (mod.fs) {
                    moduleContent = process(mod.fs.content, moduleId);
                  } else {
                    errors.push(
                      `Could not find requested target fragment module for Module ID: ${moduleId} requested by module: ${id}`
                    );
                  }
                }

                if (
                  target === ShaderInjectionTarget.VERTEX ||
                  target === ShaderInjectionTarget.ALL
                ) {
                  if (mod.vs) {
                    moduleContent = process(mod.vs.content, moduleId);
                  } else {
                    errors.push(
                      `Could not find requested target vertex module for Module ID: ${moduleId} requested by module: ${id}`
                    );
                  }
                }

                if (!mod.vs && !mod.fs) {
                  errors.push(
                    "Could not find a vertex or fragment shader within exisitng module"
                  );
                }

                if (moduleContent === null) {
                  errors.push(
                    `Error Processing module Module ID: ${moduleId} requested by module: ${id}`
                  );
                }

                // Include the discovered content in the module content output
                includedModuleOutput += moduleContent || "";
              } else {
                errors.push(
                  `Could not find requested module: ${moduleId} requested by module: ${id}`
                );
              }

              // Clear the import token from the body of the shader
              return "";
            }
          }

          // Leave any token not processed alone
          return `$\{${token}}`;
        }
      });

      // Remove the id being processed currently
      processing.shift();
      // Add the id to the list of items that have been included
      included.add(id || "");

      // If the shader had no module content, let's just return the shader and reduce empty whitespace
      if (!includedModuleOutput || includedModuleOutput.length === 0) {
        return template.shader.trim();
      }

      // Return the generated shader chunk with it's included module content at the top of the file
      return `${includedModuleOutput.trim()}\n\n${template.shader.trim()}`;
    }

    // We throw in the additional imports  at the top of the shader being analyzed
    let modifedShader = shader;

    if (additionalModules) {
      const imports = additionalModules.map(
        moduleId => `$\{import: ${moduleId}}\n`
      );
      modifedShader = imports + shader;
    }

    // generate the results needed
    const results = {
      errors,
      shader: process(modifedShader, null)
    };

    return results;
  }
}
