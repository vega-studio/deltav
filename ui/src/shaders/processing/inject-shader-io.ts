/**
 * This file is dedicted to the all important step of processing desired inputs
 * from the layer and coming up with automated generated uniforms and attributes
 * that the shaders will need in order to operate with the conveniences the
 * library offers. This includes things such as injecting camera projection
 * uniforms, resource uniforms, animation adjustments etc etc.
 */
import { Instance } from "../../instance-provider/instance.js";
import { ILayerProps, Layer } from "../../surface/layer.js";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion.js";
import {
  type IIndexBuffer,
  type IIndexBufferInternal,
  IInstanceAttribute,
  IShaderInitialization,
  IUniform,
  IUniformInternal,
  IVertexAttribute,
  IVertexAttributeInternal,
} from "../../types.js";
import { isDefined } from "../../util";
import { BaseIOSorting } from "./base-io-sorting.js";
import { packAttributes } from "./pack-attributes.js";
import { ProcessShaderImportResults } from "./shader-processor.js";

/**
 * Instance attribute typeguard
 */
function isInstanceAttribute<T extends Instance>(
  attr: any
): attr is IInstanceAttribute<T> {
  return Boolean(attr);
}

/**
 * Vertex attribute typeguard
 */
function isVertexAttribute(attr: any): attr is IVertexAttribute {
  return Boolean(attr);
}

/**
 * Uniform typeguard
 */
function isUniform(attr: any): attr is IUniform {
  return Boolean(attr);
}

/**
 * Converts a layer's vertex to the internal vertex structure used by the
 * framework.
 */
function toVertexAttributeInternal(
  attribute: IVertexAttribute
): IVertexAttributeInternal {
  return Object.assign({}, attribute, { materialAttribute: null });
}

/**
 * Converts a layer's index buffer to the internal index buffer structure used
 * by the framework.
 */
function toIndexBufferInternal(
  indexBuffer: IIndexBuffer
): IIndexBufferInternal {
  return Object.assign({}, indexBuffer, { materialIndexBuffer: null });
}

/**
 * Converts a layer's uniform to the internal uniform structure used by the
 * framework.
 */
function toUniformInternal(uniform: IUniform): IUniformInternal {
  return Object.assign({}, uniform, { materialUniforms: [] });
}

/**
 * This processes instance attributes and performs some basic validation on them
 * to ensure their properties are sane and expected for rendering.
 */
function validateInstanceAttributes<
  TInstance extends Instance = Instance,
  TProps extends ILayerProps<TInstance> = ILayerProps<TInstance>,
>(
  layer: Layer<TInstance, TProps>,
  instanceAttributes: IInstanceAttribute<TInstance>[],
  vertexAttributes: IVertexAttribute[],
  _uniforms: IUniform[]
) {
  instanceAttributes.forEach((attribute) => {
    if (attribute.name === undefined) {
      console.warn(
        "All instance attributes MUST have a name on Layer:",
        layer.id
      );
    }

    if (
      instanceAttributes.find(
        (attr) => attr !== attribute && attr.name === attribute.name
      )
    ) {
      console.warn(
        "An instance attribute can not have the same name used more than once:",
        attribute.name
      );
    }

    if (vertexAttributes.find((attr) => attr.name === attribute.name)) {
      console.warn(
        "An instance attribute and a vertex attribute in a layer can not share the same name:",
        attribute.name
      );
    }

    if (!attribute.resource) {
      if (attribute.size === undefined) {
        console.warn("An instance attribute requires the size to be defined.");
        console.warn(attribute);
      }
    }
  });
}

/**
 * This processes the results of shaders importing modules by gathering the
 * attributes and uniforms that arose from them.
 */
function gatherIOFromShaderModules<
  T extends Instance,
  U extends ILayerProps<T>,
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
  importResults.shaderModuleUnits.forEach((unit) => {
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

  moduleUniforms.filter((uniform) => {
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

  moduleInstanceAttributes.filter((attribute) => {
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

  moduleVertexAttributes.filter((attribute) => {
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
 * This is the primary method that analyzes all shader IO and determines which
 * elements needs to be automatically injected into the shader.
 *
 * @param gl The WebGL context this is being utilized on behalf of.
 * @param layer The layer who's ShaderIO we're analyzing and developing.
 * @param shaderIO The initial ShaderIO the layer has provided.
 * @param ioExpansion The list of BaseIOExpansion objects we will use to expand
 *                    and process the layer's initial Shader IO
 * @param sortIO  The methods to sort the IO configurations
 * @param importResults The Shader IO object provided by the layer after it's
 *                      had it's imports analyzed from the provided shader.
 */
export function injectShaderIO<
  TInstance extends Instance = Instance,
  TProps extends ILayerProps<TInstance> = ILayerProps<TInstance>,
>(
  gl: WebGLRenderingContext,
  layer: Layer<TInstance, TProps>,
  shaderIO: IShaderInitialization<TInstance>,
  ioExpansion: BaseIOExpansion[],
  sortIO: BaseIOSorting,
  importResults: ProcessShaderImportResults
) {
  // After processing imports, we can now include any uniforms, or attributes
  // the shader modules requested to be included in the layer so that the
  // modules can operate properly. This mostly includes items such as times,
  // projection matrices etc that the system should be providing rather than the
  // layer
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
  // The index buffer if it exists
  let indexBuffer = isDefined(shaderIO.indexBuffer)
    ? shaderIO.indexBuffer
    : void 0;

  // Now we process all of the custom attribute expansion specified by the
  // surface to process the layer's IO to make special features with the
  // attributes operate correctly.
  for (let i = 0, iMax = ioExpansion.length; i < iMax; ++i) {
    const expansion = ioExpansion[i];

    // Do special expansion validation for attributes that may meet the criteria
    // of the expander. If the validation fails, then we skip performing the
    // expansion as it would result in invalid or undefined behavior. This
    // validation method should provide all of the logged output necessary to
    // determine why the configuration was wrong.
    if (
      expansion.validate<TInstance, TProps>(
        layer,
        instanceAttributes,
        vertexAttributes,
        uniforms
      )
    ) {
      // Perform the expansion
      const extraIO = expansion.expand<TInstance, TProps>(
        layer,
        instanceAttributes,
        vertexAttributes,
        uniforms
      );
      // Now we add in the extra IO discovered
      extraIO.instanceAttributes
        .filter(isInstanceAttribute)
        .forEach((attr) => instanceAttributes.push(attr));
      extraIO.vertexAttributes
        .filter(isVertexAttribute)
        .forEach((attr) => vertexAttributes.push(attr));
      extraIO.uniforms.filter(isUniform).forEach((attr) => uniforms.push(attr));

      if (isDefined(extraIO.indexBuffer)) {
        indexBuffer = extraIO.indexBuffer;
      }
    }
  }

  // Do a final validation pass of the attributes injected so we can provide
  // feedback as to why things behave odd
  validateInstanceAttributes<TInstance, TProps>(
    layer,
    instanceAttributes,
    vertexAttributes,
    uniforms
  );

  // Gather instance attributes in such a way to not be mutated
  const allInstanceAttributes = instanceAttributes.slice(0);
  // Make sure the vertex attributes are internal attributes at this point
  const allVertexAttributes = (vertexAttributes || []).map(
    toVertexAttributeInternal
  );
  // Convert our uniforms to the internal structure they need to be
  const allUniforms = uniforms.map(toUniformInternal);

  const theIndexBuffer = isDefined(indexBuffer)
    ? toIndexBufferInternal(indexBuffer)
    : void 0;

  // Apply the sorting
  allInstanceAttributes.sort(sortIO.sortInstanceAttributes);
  allUniforms.sort(sortIO.sortUniforms);
  allVertexAttributes.sort(sortIO.sortVertexAttributes);

  // Let's pack in our attributes automagically so we can determine block and
  // block indices.
  packAttributes(allInstanceAttributes);
  // Before we make the vertex attributes, we must determine the buffering
  // strategy our layer will utilize
  layer.getLayerBufferType(
    gl,
    shaderIO,
    vertexAttributes,
    allInstanceAttributes
  );

  return {
    instanceAttributes: allInstanceAttributes,
    uniforms: allUniforms,
    vertexAttributes: allVertexAttributes,
    indexBuffer: theIndexBuffer,
  };
}
