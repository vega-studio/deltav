/**
 * The goal of this file is to take in model attributes and instance attributes specified
 * and inject the proper attributes into the shaders so the implementor of the shader does
 * not worry about syncing attribute and uniform names between the JS
 */
import { IInstanceAttribute, IInstancingUniform, IShaders, IUniform, IVertexAttribute, ShaderInjectionTarget } from '../../types';
import { IShaderTemplateRequirements, shaderTemplate } from '../../util/shader-templating';
import { WebGLStat } from '../../util/webgl-stat';
import { templateVars } from '../fragments/template-vars';
import { makeInstanceDestructuringArray, makeInstanceRetrievalArray, makeUniformArrayDeclaration } from './uniform-instance-block-array';

// These are all of the necessary fragments that will comprise our shader that is generated
const vertexShaderComposition = require('../fragments/vertex-shader-composition.vs');
const fragmentShaderComposition = require('../fragments/fragment-shader-composition.fs');
const instanceDestructuringArray = require('../fragments/instance-destructuring-array.vs');
const shaderInput = require('../fragments/shader-input.vs');
const projectionMethods = require('../fragments/projection-methods.vs');

// Constants

/**
 * Defines how many floats are available in a uniform block
 * What is a uniform block you ask? Why let me tell you! It is how opengl stores and communicates uniforms
 * to the GPU. Whenever you declare a uniform, it will use a hunk of memory. You can see how many uniforms
 * a GPU can have via the paramter MAX_VERTEX_UNIFORM_VECTORS. The number returned is the number of blocks
 * we can use for uniforms in the vertex shader. A BLOCK is an entire vec4.
 *
 * When you declare a uniform in your shader, it will use an entire BLOCK at the MINIMUM.
 *
 * A uniform float uses 1 block. vec2 uses 1 block. vec3 uses one block. vec4 uses one block.
 * mat4 uses 4 blocks. mat3 uses 3 blocks.
 *
 * etc etc.
 */
const MAX_USE_PER_BLOCK = 4;

/** Converts a size to a shader type */
const sizeToType: {[key: number]: string} = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4',
  9: 'mat3',
  16: 'mat4',
  99: 'sampler2D',
};

function calculateUniformBlockUseage(uniforms: IUniform[]) {
  let count = 0;

  for (let i = 0, end = uniforms.length; i < end; ++i) {
    count += Math.ceil(uniforms[i].size / 4);
  }

  return count;
}

export interface IInjectionDetails {
  fs: string,
  materialUniforms: IInstancingUniform[],
  maxInstancesPerBuffer: number,
  vs: string,
}

/**
 * This method is the main algorithm for piecing together all of the attributes necessary
 * and injecting them into the shaders.
 *
 * @param shaders
 * @param vertexAttributes
 * @param instanceAttributes
 */
export function injectFragments(shaders: IShaders, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<any>[], uniforms: IUniform[]): IInjectionDetails {
  const shaderInputMetrics = generateShaderInputs(vertexAttributes, instanceAttributes, uniforms);

  let templateOptions: {[key: string]: string} = {
    [templateVars.projectionMethods]: generateProjectionMethods(),
    [templateVars.shaderInput]: shaderInputMetrics.fragment,
    [templateVars.shader]: generateVertexShader(
      shaders,
      instanceAttributes,
      shaderInputMetrics.metrics.maxInstancesPerBuffer,
      shaderInputMetrics.metrics.blocksPerInstance,
    ),
  };

  let required = {
    name: 'vertex shader composition',
    values: [
      templateVars.projectionMethods,
      templateVars.shaderInput,
      templateVars.shader,
    ],
  };

  const vertexShaderResults = shaderTemplate(vertexShaderComposition, templateOptions, required);

  templateOptions = {
    [templateVars.layerUniforms]: generateUniforms(uniforms, ShaderInjectionTarget.FRAGMENT),
    [templateVars.shader]: generateFragmentShader(shaders),
  };

  required = {
    name: 'fragment shader composition',
    values: [
      templateVars.layerUniforms,
      templateVars.shader,
    ],
  };

  const fragmentShaderResults = shaderTemplate(fragmentShaderComposition, templateOptions, required);

  return {
    fs: fragmentShaderResults.shader,
    materialUniforms: shaderInputMetrics.materialUniforms,
    maxInstancesPerBuffer: shaderInputMetrics.metrics.maxInstancesPerBuffer,
    vs: vertexShaderResults.shader,
  };
}

/**
 * Creates the projection method fragment
 */
function generateProjectionMethods() {
  const templateOptions: {[key: string]: string} = {};
  const required: IShaderTemplateRequirements = {
    name: 'projection methods',
    values: [],
  };

  const results = shaderTemplate(projectionMethods, templateOptions, required);

  return results.shader;
}

/**
 * Generates the fragments for shader IO such as vertex and instance attributes
 */
function generateShaderInputs(vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<any>[], uniforms: IUniform[]) {
  const templateOptions: {[key: string]: string} = {};
  const instancingInfo = generateInstanceDataLookupOptions(templateOptions, instanceAttributes, uniforms);

  const additionalOptions: {[key: string]: string} = {
    [templateVars.layerUniforms]: generateUniforms(uniforms, ShaderInjectionTarget.VERTEX),
    [templateVars.vertexAttributes]: generateVertexAttributes(vertexAttributes),
  };

  Object.assign(templateOptions, additionalOptions);

  const required: IShaderTemplateRequirements = {
    name: 'shader input',
    values: [
      templateVars.instanceDataRetrieval,
      templateVars.instanceUniformDeclarations,
      templateVars.layerUniforms,
      templateVars.vertexAttributes,
    ],
  };

  const results = shaderTemplate(shaderInput, templateOptions, required);

  return {
    fragment: results.shader,
    materialUniforms: instancingInfo.materialUniforms,
    metrics: instancingInfo.metrics,
  };
}

/**
 *
 * @param uniforms
 */
function generateUniforms(uniforms: IUniform[], injectionType: ShaderInjectionTarget) {
  let out = '';
  const injection = injectionType || ShaderInjectionTarget.VERTEX;

  uniforms.forEach(uniform => {
    uniform.shaderInjection = uniform.shaderInjection || ShaderInjectionTarget.VERTEX;

    if (uniform.shaderInjection === injection || uniform.shaderInjection === ShaderInjectionTarget.ALL) {
      out += `uniform ${uniform.qualifier || ''}${uniform.qualifier ? ' ' : ''}${sizeToType[uniform.size]} ${uniform.name};\n`;
    }
  });

  return out;
}

/**
 * This takes in the layer's vertex shader and transforms any required templating within the
 * shader.
 */
function generateVertexShader(shaders: IShaders, instanceAttributes: IInstanceAttribute<any>[], maxInstancesPerBuffer: number, blocksPerInstance: number) {
  const templateOptions: {[key: string]: string} = {
    [templateVars.attributes]: makeInstanceAttributeReferences(instanceAttributes, blocksPerInstance),
  };

  const required = {
    name: 'layer vertex shader',
    values: [
      templateVars.attributes,
    ],
  };

  const results = shaderTemplate(shaders.vs, templateOptions, required);

  return results.shader;
}

function generateFragmentShader(shaders: IShaders) {
  const templateOptions: {[key: string]: string} = {};

  const required: IShaderTemplateRequirements = {
    name: 'layer fragment shader',
    values: [],
  };

  const results = shaderTemplate(shaders.fs, templateOptions, required);

  return results.shader;
}

/**
 * This generates the inline attribute references needed to be able to reference instance attribute
 * vars.
 */
function makeInstanceAttributeReferences(instanceAttributes: IInstanceAttribute<any>[], blocksPerInstance: number) {
  const templateOptions: {[key: string]: string} = {};
  templateOptions[templateVars.blocksPerInstance] = `${blocksPerInstance}`;
  templateOptions[templateVars.instanceDestructuring] = makeInstanceDestructuring(instanceAttributes, blocksPerInstance);

  const required = {
    name: 'instance attributes fragment',
    values: [
      templateVars.instanceDestructuring,
    ],
  };

  const results = shaderTemplate(instanceDestructuringArray, templateOptions, required);

  return results.shader;
}

/**
 * This generates an in method destructuring pattern to make instance attributes available within a method.
 */
function makeInstanceDestructuring(instanceAttributes: IInstanceAttribute<any>[], blocksPerInstance: number) {
  return makeInstanceDestructuringArray(instanceAttributes, blocksPerInstance);
}

/**
 * This generates the model attribute declarations
 */
function generateVertexAttributes(vertexAttributes: IVertexAttribute[]) {
  let out = '';

  vertexAttributes.forEach(attribute => {
    out += `attribute ${sizeToType[attribute.size]} ${attribute.qualifier || ''}${(attribute.qualifier && ' ') || ''}${attribute.name};\n`;
  });

  return out;
}

/**
 * This method generates the chunk of shader that is responsible for providing
 */
function generateInstanceDataLookupOptions(templateOptions: {[key: string]: string}, instanceAttributes: IInstanceAttribute<any>[], uniforms: IUniform[]) {
  // This is how many uniform blocks the current device can utilize in a shader
  const maxUniforms = WebGLStat.MAX_VERTEX_UNIFORMS;
  // This reflects how many uniform blocks are available for instancing
  const instanceUniformBlockCount = maxUniforms - calculateUniformBlockUseage(uniforms);

  // Go through the attributes provided and calculate the number of blocks requested
  // Also sort the attributes by block and pack the block useage down.
  const sortedInstanceAttributes = instanceAttributes.slice(0).sort((a, b) => a.block - b.block);

  let currentBlock = sortedInstanceAttributes[0].block;
  let trueBlockIndex = 0;

  // This tracks how much a block is used
  const blockUseage = new Map<number, number>();
  const innerBlockUseage = new Map<number, Map<number, boolean>>();

  sortedInstanceAttributes.forEach(attribute => {
    if (attribute.block !== currentBlock) {
      currentBlock = attribute.block;
      trueBlockIndex++;
    }

    const attributeSize = attribute.size;
    const oldUseage = blockUseage.get(trueBlockIndex) || 0;
    const newUseage = oldUseage + attributeSize;

    // Make sure the block isn't over used thus losing attribute information
    if (newUseage > MAX_USE_PER_BLOCK) {
      console.error(
        `An instance attribute was specified that over fills the maximum allowed useage for a block.`,
        `\nMax Allowed per block ${MAX_USE_PER_BLOCK}`,
        `\nAttribute: ${attribute.name} Block Specified: ${attribute.block}`,
        `\nTotal blocks used with this attribute: ${newUseage}`,
      );
      return;
    }

    // Store how much of the block is utilized
    blockUseage.set(trueBlockIndex, newUseage);
    // We can now auto specify the inner index of where the attribute lines up within the block
    attribute.blockIndex = oldUseage;

    // Now we examine the attributes request of use inside the block and make sure there is no
    // Overlap
    const innerUseage = innerBlockUseage.get(trueBlockIndex) || new Map<number, boolean>();

    if (attribute.blockIndex + attributeSize > MAX_USE_PER_BLOCK) {
      console.error(
        `An instance attribute was specified that would fill indices greater than the block allows.`,
        `\nMax index per block ${MAX_USE_PER_BLOCK}`,
        `\nAttribute: ${attribute.name} Block Index: ${attribute.blockIndex} Size: ${attribute.size} Block Index + Size: ${attribute.blockIndex + attribute.size}`,
      );

      return;
    }

    for (let i = attribute.blockIndex; i < attribute.blockIndex + attributeSize; ++i) {
      if (innerUseage.get(i)) {
        console.error(
          `An instance attribute was specified who's block index overaps another attributes useage`,
          `\nMax index per block ${MAX_USE_PER_BLOCK}`,
          `\nAttribute: ${attribute.name} Block Index: ${attribute.blockIndex} Size: ${attribute.size} Block Index + Size: ${attribute.blockIndex + attribute.size}`,
        );

        return;
      }
    }

    // Adjust the attribute to reflect the actual bock it is using
    attribute.block = trueBlockIndex;
  });

  /**
   * We now must create a decision tree large enough to accomodate our instances.
   * Explanation:
   * Our shaders CANNOT do switch case statements, NOR can they handle large amounts of
   * chained if else statements (it will produce a memory exhausted error on many systems).
   * There is even limits on how deep if else statements can be nested within each other.
   * Lastly: We do NOT want to create an array in memory in the shader to create a lookup for our
   * instance data as it would need to be allocated EVERY vertex operation.
   *
   * So, our best workaround is to make a decision tree that balances how many decisions per
   * node it can make vs the depth of decisions. The more decisions per node, the less deep the
   * tree will be, but will suffer some performance cost. But the less deep the tree, the better
   * chance you will not get a 'memory exhausted' error.
   */

  const branchesPerLevel = 4;
  const blocksPerInstance = trueBlockIndex + 1;
  // This determines how many instances our allowed uniforms will allow for a single draw call
  const maxInstancesPerBuffer = Math.floor(instanceUniformBlockCount / blocksPerInstance);

  // Generate the decision tree and uniform declarations
  const instancingMetrics = makeUniformInstanceDataOptions(templateOptions, maxInstancesPerBuffer, branchesPerLevel, blocksPerInstance, sortedInstanceAttributes);

  return {
    materialUniforms: instancingMetrics.materialUniforms,
    metrics: {
      blocksPerInstance,
      maxInstancesPerBuffer,
    },
  };
}

/**
 * This generates all of the necessary templating information from uniform-instance-data
 * in order to provide an instance data getter for the application.
 */
function makeUniformInstanceDataOptions(templateOptions: {[key: string]: string}, maxInstancesPerBuffer: number, branchesPerLevel: number, blocksPerInstance: number, instanceAttributes: IInstanceAttribute<any>[]) {
  // Make a list containing all instance indicies that will be utilized and will be split
  // Out into the decision tree
  const instances = [];

  for (let i = 0; i < maxInstancesPerBuffer; ++i) {
    instances.push(i);
  }

  // Make the uniform declaration. Uniform declaration simultaneously gives us the material uniforms necessary
  // To apply to our three material.
  const uniformMetrics = makeInstanceUniformDeclaration(maxInstancesPerBuffer * blocksPerInstance, instanceAttributes);

  templateOptions[templateVars.instanceUniformDeclarations] = uniformMetrics.fragment;
  templateOptions[templateVars.instanceBlockCount] = `${blocksPerInstance}`;

  // This way produced the data retrieval method for decision tree instancing
  // *templateOptions[templateVars.instanceDataRetrieval] = makeInstanceRetrievalDecisionTree(blocksPerInstance, instances, branchesPerLevel);
  // This method produces the data retrieval method for array instancing
  templateOptions[templateVars.instanceDataRetrieval] = makeInstanceRetrievalArray(blocksPerInstance);

  return {
    materialUniforms: uniformMetrics.materialUniforms,
  };
}

/**
 * This generates the declaration of all of the individual uniform registers for instancing.
 */
function makeInstanceUniformDeclaration(instanceUniformBlockCount: number, attributes: IInstanceAttribute<any>[]) {
  let out = '';
  const blockQualifierDedup = new Map<number, Map<string, boolean>>();
  let maxBlock = 0;

  // Dedup the attributes specified for the
  attributes.forEach(attribute => {
    const qualifiers = blockQualifierDedup.get(attribute.block) || new Map<string, boolean>();
    // Make sure the qualifier is added for the block
    qualifiers.set(attribute.qualifier, true);
    // Get the max block in use
    maxBlock = Math.max(maxBlock, attribute.block);
  });

  // Generate the full string for the specified qualifiers
  const blockQualifiers = new Map<number, string>();

  blockQualifierDedup.forEach((qualifierList, block) => {
    const allQualifiers = Array.from(qualifierList.keys());
    blockQualifiers.set(block, `${allQualifiers.join(' ')} `);
  });

  // Generate our uniform declarations
  // Const blockCount = maxBlock + 1;

  // This method produces the instancing declaration for a search tree.
  // *out += makeUniformDecisionTreeDeclarations(instanceUniformBlockCount, blockCount, blockQualifiers, materialUniforms);
  // This method produces the instancing declaration for an instancing array
  const declaration = makeUniformArrayDeclaration(instanceUniformBlockCount);
  out += declaration.fragment;

  out += `\n`;

  return {
    fragment: out,
    materialUniforms: declaration.materialUniforms,
  };
}
