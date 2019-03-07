/**
 * This file is dedicted to the all important step of processing desired inputs from the layer
 * and coming up with automated generated uniforms and attributes that the shader's will need
 * in order to operate with the conveniences the library offers. This includes things such as
 * injecting camera projection uniforms, resource uniforms, animation adjustments etc etc.
 */
import { Instance } from "../../instance-provider/instance";
import { ProcessShaderImportResults } from "../../shaders/processing/shader-processor";
import {
  IInstanceAttribute,
  InstanceAttributeSize,
  IShaderInitialization,
  IUniform,
  IUniformInternal,
  IVertexAttribute,
  IVertexAttributeInternal
} from "../../types";
import { Vec } from "../../util";
import { ILayerProps, Layer } from "../layer";
import { generateAtlasResourceUniforms } from "./expand-atlas-attributes";
import { generateEasingAttributes } from "./expand-easing-attributes";
import { getLayerBufferType } from "./layer-buffer-type";
import { packAttributes } from "./pack-attributes";

/**
 * This is a lookup for a test vector for the provided size
 */
const testStartVector: { [key: number]: Vec } = {
  [InstanceAttributeSize.ONE]: [1],
  [InstanceAttributeSize.TWO]: [1, 2],
  [InstanceAttributeSize.THREE]: [1, 2, 3],
  [InstanceAttributeSize.FOUR]: [1, 2, 3, 4]
};

/**
 * This is a lookup for a test vector for the provided size
 */
const testEndVector: { [key: number]: Vec } = {
  [InstanceAttributeSize.ONE]: [4],
  [InstanceAttributeSize.TWO]: [4, 3],
  [InstanceAttributeSize.THREE]: [4, 3, 2],
  [InstanceAttributeSize.FOUR]: [4, 3, 2, 1]
};

function isInstanceAttribute<T extends Instance>(
  attr: any
): attr is IInstanceAttribute<T> {
  return Boolean(attr);
}

function isVertexAttribute(attr: any): attr is IVertexAttribute {
  return Boolean(attr);
}

function isUniform(attr: any): attr is IUniform {
  return Boolean(attr);
}

function toVertexAttributeInternal(
  attribute: IVertexAttribute
): IVertexAttributeInternal {
  return Object.assign({}, attribute, { materialAttribute: null });
}

function toUniformInternal(uniform: IUniform): IUniformInternal {
  return Object.assign({}, uniform, { materialUniforms: [] });
}

/**
 * This sorts the attributes such that the attributes that MUST be updated first are put to the top.
 * This is necessary for complex attributes like atlas and easing attributes who have other attributes
 * that have dependent behaviors based on their source attribute.
 */
function sortNeedsUpdateFirstToTop<T extends Instance>(
  a: IInstanceAttribute<T>,
  b: IInstanceAttribute<T>
) {
  if (a.resource && !b.resource) return -1;
  if (a.easing && !b.easing) return -1;
  return 1;
}

function compareVec(a: Vec, b: Vec) {
  if (a.length !== b.length) return false;

  for (let i = 0, end = a.length; i < end; ++i) {
    if (Math.round(a[i] * 100) / 100 !== Math.round(b[i] * 100) / 100) {
      return false;
    }
  }

  return true;
}

/**
 * This processes instance attributes and performs some basic validation on them to ensure their
 * properties are sane and expected for rendering.
 */
function validateInstanceAttributes<T extends Instance>(
  layer: Layer<T, any>,
  instanceAttributes: IInstanceAttribute<T>[],
  vertexAttributes: IVertexAttribute[]
) {
  instanceAttributes.forEach(attribute => {
    if (attribute.name === undefined) {
      console.warn(
        "All instance attributes MUST have a name on Layer:",
        layer.id
      );
    }

    if (
      instanceAttributes.find(
        attr => attr !== attribute && attr.name === attribute.name
      )
    ) {
      console.warn(
        "An instance attribute can not have the same name used more than once:",
        attribute.name
      );
    }

    if (vertexAttributes.find(attr => attr.name === attribute.name)) {
      console.warn(
        "An instance attribute and a vertex attribute in a layer can not share the same name:",
        attribute.name
      );
    }

    if (attribute.easing && attribute.resource) {
      console.warn(
        "An instance attribute can not have both easing and resource properties. Undefined behavior will occur."
      );
      console.warn(attribute);
    }

    if (!attribute.resource) {
      if (attribute.size === undefined) {
        console.warn("An instance attribute requires the size to be defined.");
        console.warn(attribute);
      }
    }

    if (attribute.easing) {
      if (attribute.size !== undefined) {
        const testStart = testStartVector[attribute.size];
        const testEnd = testEndVector[attribute.size];
        const validationRules = attribute.easing.validation || {};

        let test = attribute.easing.cpu(testStart, testEnd, 0);
        if (!compareVec(test, testStart)) {
          console.warn(
            "Auto Easing Validation Failed: using a time of 0 does not produce the start value"
          );
          console.warn("Start:", testStart, "End:", testEnd, "Result:", test);
          console.warn(attribute);
        }

        test = attribute.easing.cpu(testStart, testEnd, 1);
        if (
          !validationRules.ignoreEndValueCheck &&
          !compareVec(test, testEnd)
        ) {
          console.warn(
            "Auto Easing Validation Failed: using a time of 1 does not produce the end value"
          );
          console.warn("Start:", testStart, "End:", testEnd, "Result:", test);
          console.warn(attribute);
        }

        test = attribute.easing.cpu(testStart, testEnd, -1);
        if (!compareVec(test, testStart)) {
          console.warn(
            "Auto Easing Validation Failed: using a time of -1 does not produce the start value"
          );
          console.warn("Start:", testStart, "End:", testEnd, "Result:", test);
          console.warn(attribute);
        }

        test = attribute.easing.cpu(testStart, testEnd, 2);
        if (
          !validationRules.ignoreOverTimeCheck &&
          !compareVec(test, testEnd)
        ) {
          console.warn(
            "Auto Easing Validation Failed: using a time of 2 does not produce the end value"
          );
          console.warn("Start:", testStart, "End:", testEnd, "Result:", test);
          console.warn(attribute);
        }
      } else {
        console.warn(
          "An Instance Attribute with easing MUST have a size declared"
        );
      }
    }
  });
}

/**
 * This processes the results of shaders importing modules by gathering the attributes
 * and uniforms that arose from them.
 */
function gatherIOFromShaderModules<
  T extends Instance,
  U extends ILayerProps<T>
>(
  layer: Layer<T, U>,
  shaderIO: IShaderInitialization<T>,
  importResults: ProcessShaderImportResults
) {
  if (!importResults) return;

  // Get the existing items from the IO
  let moduleInstanceAttributes = shaderIO.instanceAttributes || [];
  let moduleUniforms = shaderIO.uniforms || [];
  let moduleVertexAttributes = shaderIO.vertexAttributes || [];

  // Add in the module requested items
  importResults.shaderModuleUnits.forEach(unit => {
    if (unit.instanceAttributes) {
      moduleInstanceAttributes = moduleInstanceAttributes.concat(
        unit.instanceAttributes(layer)
      );
    }

    if (unit.uniforms) {
      moduleUniforms = moduleUniforms.concat(unit.uniforms(layer));
    }

    if (unit.vertexAttributes) {
      moduleVertexAttributes = moduleVertexAttributes.concat(
        unit.vertexAttributes(layer)
      );
    }
  });

  // Dedup any element by name and show warnings when any item is overridden
  const uniformNames = new Set<string>();
  const instanceAttributeNames = new Set<string>();
  const vertexAttributeNames = new Set<string>();

  moduleUniforms.filter(uniform => {
    if (uniform) {
      if (uniformNames.has(uniform.name)) {
        console.warn(
          "Included shader modules has introduced duplicate uniform names:",
          uniform.name,
          "One will be overridden thus causing a potential crash of the shader."
        );
        return false;
      }

      uniformNames.add(uniform.name);

      return true;
    }

    return false;
  });

  moduleInstanceAttributes.filter(attribute => {
    if (attribute) {
      if (instanceAttributeNames.has(attribute.name)) {
        console.warn(
          "Included shader modules has introduced duplicate Instance Attribute names:",
          attribute.name,
          "One will be overridden thus causing a potential crash of the shader."
        );
        return false;
      }

      instanceAttributeNames.add(attribute.name);

      return true;
    }

    return false;
  });

  moduleVertexAttributes.filter(attribute => {
    if (attribute) {
      if (vertexAttributeNames.has(attribute.name)) {
        console.warn(
          "Included shader modules has introduced duplicate Vertex Attribute names:",
          attribute.name,
          "One will be overridden thus causing a potential crash of the shader."
        );
        return false;
      }

      vertexAttributeNames.add(attribute.name);

      return true;
    }

    return false;
  });

  // Apply any changes to the IO object
  shaderIO.instanceAttributes = moduleInstanceAttributes;
  shaderIO.uniforms = moduleUniforms;
  shaderIO.vertexAttributes = moduleVertexAttributes;
}

/**
 * This is the primary method that analyzes all shader IO and determines which elements needs to be automatically injected
 * into the shader.
 */
export function injectShaderIO<T extends Instance, U extends ILayerProps<T>>(
  gl: WebGLRenderingContext,
  layer: Layer<T, U>,
  shaderIO: IShaderInitialization<T>,
  importResults: ProcessShaderImportResults
) {
  // After processing imports, we can now include any uniforms, or attributes the shader modules requested to be included in the
  // layer so that the modules can operate properly. This mostly includes items such as times, projection matrices etc
  // that the system should be providing rather than the layer
  gatherIOFromShaderModules(layer, shaderIO, importResults);

  // All of the instance attributes with nulls filtered out
  const instanceAttributes = (shaderIO.instanceAttributes || []).filter(
    isInstanceAttribute
  );
  // All of the vertex attributes with nulls filtered out
  const vertexAttributes = (shaderIO.vertexAttributes || []).filter(
    isVertexAttribute
  );
  // All of the uniforms with nulls filtered out
  const uniforms = (shaderIO.uniforms || []).filter(isUniform);
  // Do a validation pass of the attributes injected so we can provide feedback as to why things behave odd
  validateInstanceAttributes(layer, instanceAttributes, vertexAttributes);
  // Generates all of the attributes needed to make attributes automagically be eased when changed
  generateEasingAttributes(layer, instanceAttributes);
  // Get the uniforms needed to facilitate atlas resource requests if any exists
  const addedUniforms: IUniform[] = uniforms.concat(
    generateAtlasResourceUniforms(layer, instanceAttributes)
  );
  // Create the base instance attributes that must be present
  const addedInstanceAttributes = instanceAttributes.slice(0);
  // Convert our uniforms to the internal structure they need to be
  const allUniforms = addedUniforms.map(toUniformInternal);

  const allInstanceAttributes = addedInstanceAttributes.sort(
    sortNeedsUpdateFirstToTop
  );

  // Let's pack in our attributes automagically so we can determine block and block indices.
  packAttributes(allInstanceAttributes);
  // Before we make the vertex attributes, we must determine the buffering strategy our layer will utilize
  getLayerBufferType(gl, layer, vertexAttributes, allInstanceAttributes);

  // Create the base vertex attributes that must be present
  const addedVertexAttributes: IVertexAttribute[] = [];

  // Aggregate all of the injected shaderIO with the layer's shaderIO
  const allVertexAttributes: IVertexAttributeInternal[] = addedVertexAttributes
    .concat(vertexAttributes || [])
    .map(toVertexAttributeInternal);

  return {
    instanceAttributes: allInstanceAttributes,
    uniforms: allUniforms,
    vertexAttributes: allVertexAttributes
  };
}
