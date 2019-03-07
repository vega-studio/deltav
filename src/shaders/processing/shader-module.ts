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
  /** Error messages generated from analyzing the shaders */
  errors: string[];
  /** The generated shader from analyzing the module */
  shader: string | null;
  /** The shader module units discovered during the processing of the module */
  shaderModuleUnits: Set<ShaderModuleUnit>;
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
   * This gathers all of the dependents for the module as ids. This also causes the contents of the module to
   * be stripped of it's import statements.
   */
  static analyzeDependents(unit: ShaderModuleUnit) {
    // If the dependents are already established for this unit and it can not be modified further,
    // then we do not bother to analyze the dependents again.
    if (unit.dependents && unit.isLocked) {
      return [];
    }

    // Gathers error messages found while processing the module
    const errors: string[] = [];
    // Stores the dependents in the order they are found in the module
    const dependents: string[] = [];
    // Stores all of the unique dependents found for this module
    const dependentSet = new Set<string>();
    // Get then compatibility target of the module unit so we can properly see what modules are available
    // to the unit and what is not.
    const target = unit.compatibility;
    // This is the identifier of the module requesting it's dependents
    const id = unit.moduleId;

    // Here we process the module contents and look for additional import statements.
    const templateResults = shaderTemplate({
      // We do not want any direct replacement options, we will handle token analyzing
      // via our onToken callback so we can find our special "import:" case
      options: {},
      // Provide the shader to our template processor
      shader: unit.content,

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
            // Indicates if content was properly found for the requested ID
            let moduleContentFound = false;
            // At this point, ANYTHING after the colon is the module id being requested (with white space trimmed)
            // We allow comma delimited module ids to be specified
            const moduleIds = afterToken
              .substr(IMPORT_DELIMITER.length)
              .trim()
              .split(",");

            // Wealso  allow trailing comma
            if (moduleIds[moduleIds.length - 1].trim().length === 0) {
              moduleIds.pop();
            }

            // Loop through all discovered module ids after the import statement
            moduleIds.forEach(moduleId => {
              // Make sure whitespace is cleared
              moduleId = moduleId.trim();
              // Get the requested module
              const mod = ShaderModule.modules.get(moduleId);

              // If we found the module, great! We can store the identifier as a module associated with this shader
              // string thus reducing processing time needed for next processing.
              if (mod) {
                if (
                  target === ShaderInjectionTarget.FRAGMENT ||
                  target === ShaderInjectionTarget.ALL
                ) {
                  if (mod.fs) {
                    moduleContentFound = true;

                    if (!dependentSet.has(moduleId)) {
                      dependents.push(moduleId);
                    }
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
                    moduleContentFound = true;

                    if (!dependentSet.has(moduleId)) {
                      dependents.push(moduleId);
                    }
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

                if (!moduleContentFound) {
                  errors.push(
                    `Error Processing module Module ID: ${moduleId} requested by module: ${id}`
                  );
                }
              } else {
                errors.push(
                  `Could not find requested module: ${moduleId} requested by module: ${id}`
                );
              }
            });

            // Clear the import token from the body of the shader
            return "";
          }
        }

        // Leave any token not processed alone
        return `$\{${token}}`;
      }
    });

    // Update the content to be stripped of it's import statements
    unit.applyAnalyzedContent(templateResults.shader);
    // Update the dependents to include the modules found that this module requested
    unit.dependents = dependents;

    return errors;
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
    // The discovered shader module units during processing
    const shaderModuleUnits = new Set<ShaderModuleUnit>();
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

    // Internal checking method of the state of the process to find circular dependencies
    function checkCircularDependency(unit: ShaderModuleUnit) {
      // Get the id of the module being processed for quick reference
      const id = unit.moduleId;
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
        return false;
      }

      return true;
    }

    // We place this method as an internal recursive strategy to solving this issue due to the complexities of
    // the problem at hand. We have shaders that have tokens analyzed that MUST be immediately resolved
    // to a correct value. Thus we can not use a process queue to remove the need for the recursion. Also, as
    // this is a static method, this provides some needed properties within the context of the function that we
    // do not want exposed at all, which is impossible to hide within a static context (private static is not supported).
    function process(unit: ShaderModuleUnit): string | null {
      // This is the id of the module unit  currently being processed
      const id = unit.moduleId;

      // Do the circular dependency check for the module
      if (!checkCircularDependency(unit)) {
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

      // This will store all of the module content that should be injected as the header
      let includedModuleContent = "";
      // Make sure the dependents for the module are properly analyzed
      const dependentsErrors = ShaderModule.analyzeDependents(unit);
      // Add in any errors discovered during module analysis
      dependentsErrors.forEach(error => errors.push(error));
      // Get the dependents for the module for processing
      const dependents = unit.dependents;

      if (dependents && dependents.length > 0) {
        for (let i = 0, iMax = dependents.length; i < iMax; ++i) {
          // The dependent is the id of the module id dependency
          const moduleId = dependents[i];
          // Get the requested module
          const mod = ShaderModule.modules.get(moduleId);

          // If we found the module, great! We can see if the found module has a compatible target for this module.
          if (mod) {
            let moduleContent;

            if (
              target === ShaderInjectionTarget.FRAGMENT ||
              target === ShaderInjectionTarget.ALL
            ) {
              if (mod.fs) {
                shaderModuleUnits.add(mod.fs);
                moduleContent = process(mod.fs);
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
                shaderModuleUnits.add(mod.vs);
                moduleContent = process(mod.vs);
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
            includedModuleContent += moduleContent || "";
          } else {
            errors.push(
              `Could not find requested module: ${moduleId} requested by module: ${id}`
            );
          }
        }
      }

      // Remove the id being processed currently
      processing.shift();
      // Add the id to the list of items that have been included
      included.add(id || "");

      // Place the included module content at the top of the shader and return this module with it's necessary
      // inclusions
      return `${includedModuleContent.trim()}\n\n${unit.content.trim()}`;
    }

    // We throw in the additional imports  at the top of the shader being analyzed
    let modifedShader = shader;

    if (additionalModules) {
      let imports = "";

      additionalModules.forEach(
        moduleId => (imports += `$\{import: ${moduleId}}\n`)
      );

      modifedShader = imports + shader;
    }

    // Make our shader a temp module unit to make it compatible with the rest of the shader module processing
    const tempShaderModuleUnit = new ShaderModuleUnit({
      content: modifedShader,
      compatibility: target,
      moduleId: `Layer "${id}" ${
        target === ShaderInjectionTarget.ALL
          ? "fs vs"
          : target === ShaderInjectionTarget.VERTEX
            ? "vs"
            : "fs"
      }`
    });

    // Generate the results needed
    const results = {
      errors,
      shader: process(tempShaderModuleUnit),
      shaderModuleUnits
    };

    return results;
  }
}
