import { IInstanceAttribute, IInstancingUniform, InstanceAttributeSize } from '../../types';
import { makeInstanceUniformName } from '../../util/make-instance-uniform-name';
import { shaderTemplate } from '../../util/shader-templating';
import { templateVars } from '../fragments/template-vars';

const instanceRetrievalSearchTreeFragment = require('../fragments/instance-retrieval-search-tree.vs');

/** Defines the elements for destructuring out of a vector */
const VECTOR_COMPONENTS = ['x', 'y', 'z', 'w'];

/** Converts a size to a shader type */
const sizeToType: {[key: number]: string} = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4',
  9: 'mat3',
  16: 'mat4',
};

/**
 * Generates the instancing uniform declarations specifically for decision tree instancing.
 *
 * This is specific to instancing using a very large uniform declaration list combo'ed with a
 * decision tree to retrieve uniforms for a given instance.
 */
export function makeUniformDecisionTreeDeclarations(instanceUniformBlockCount: number, blockCount: number, blockQualifiers: Map<number, string>, materialUniforms: IInstancingUniform[]) {
  let out = '';

  for (let i = 0; i < instanceUniformBlockCount; ++i) {
    const instanceBlock = i % blockCount;
    const qualifiers = blockQualifiers.get(instanceBlock);
    out += `uniform ${qualifiers || ''}vec4 ${makeInstanceUniformName(i)};`;

    materialUniforms.push({
      name: `${makeInstanceUniformName(i)}`,
      type: `v4`,
      value: [0, 0, 0, 0],
    });
  }

  return out;
}

/**
 * Generates the data retrieval method for decision tree instancing
 */
export function makeInstanceRetrievalDecisionTree(blocksPerInstance: number, instances: number[], perNode: number) {
  const templateOptions: {[key: string]: string} = {};
  templateOptions[templateVars.instanceBlockCount] = `${blocksPerInstance}`;
  templateOptions[templateVars.instanceDataBinaryTree] = makeDecisionTreeNode(instances, blocksPerInstance, perNode);

  const required = {
    name: 'makeInstanceRetrievalDecisionTree',
    values: [
      templateVars.instanceBlockCount,
      templateVars.instanceDataBinaryTree,
    ],
  };

  const results = shaderTemplate(instanceRetrievalSearchTreeFragment, templateOptions, required);

  return results.shader;
}

/**
 * Shaders do not have the following:
 * 1: switch statements
 * 2: large chained if else statements
 * 3: deeply nested if statements
 *
 * So we spread out array lookups into the uniform registers with a search tree to find the appropiate
 * instance dataset. We try to avoid too deep nests and we avoid too long of if else chains
 */
export function makeDecisionTreeNode(instances: number[], blocksPerInstance: number, perNode: number, depth?: number) {
  let out: string = '';
  depth = depth || 0;

  // If we have instances as the same number of leaves per node then we write the instances out.
  if (instances.length <= perNode) {
    let nodesToWrite = Math.min(perNode, instances.length);

    // Perform the first iteration for the if statement
    nodesToWrite--;
    let instance = instances[nodesToWrite];

    if (nodesToWrite === 0) {
      out += `${makeInstanceOutValue(instance, blocksPerInstance)}`;
    }

    else {
      out += `if(i>=${instance}.){${makeInstanceOutValue(instance, blocksPerInstance)}}`;

      // Perform the remaining iterations for the else if statements
      while (nodesToWrite > 0) {
        nodesToWrite--;
        instance = instances[nodesToWrite];
        out += `else if(i>=${instance}.){${makeInstanceOutValue(instance, blocksPerInstance)}}`;
      }
    }
  }

  // Otherwise, we write if else nesting
  else {
    // We don't want to mutate the parent iteration's list
    const instanceList = [].concat(instances);
    const divisions = [];
    const divisionLength = Math.floor(instanceList.length / perNode);

    for (let i = 0; i < perNode; ++i) {
      divisions.push(i * divisionLength);
    }

    let branchesToWrite = perNode;

    // Perform the first iteration for the if statement
    branchesToWrite--;
    let divideAt = divisions[branchesToWrite];
    let instance = instanceList[divideAt];
    out += `if(i>=${instance}.){${makeDecisionTreeNode(instanceList.splice(divideAt), blocksPerInstance, perNode, depth + 1)}}`;

    // Perform the remaining iterations for the else if statements
    while (branchesToWrite > 0) {
      branchesToWrite--;
      divideAt = divisions[branchesToWrite];
      instance = instanceList[divideAt];
      out += `else if(i>=${instance}.){${makeDecisionTreeNode(instanceList.splice(divideAt), blocksPerInstance, perNode, depth + 1)}}`;
    }
  }

  return out;
}

/**
 * This writes out the instance's data into the out array of the getInstanceData method.
 */
function makeInstanceOutValue(instance: number, blocksPerInstance: number) {
  let block = 0;
  let out = '';
  const startBlock = instance * blocksPerInstance;

  while (block < blocksPerInstance) {
    out += `d[${block}]=${makeInstanceUniformName(startBlock + block)};`;
    block++;
  }

  return out;
}

export function makeInstanceDestructuringDecisionTree(instanceAttributes: IInstanceAttribute<any>[], blocksPerInstance: number) {
  let out = '';

  instanceAttributes.forEach(attribute => {
    const block = attribute.block;
    if (attribute.size === InstanceAttributeSize.FOUR) {
      out += `  ${sizeToType[attribute.size]} ${attribute.name} = d[${block}];\n`;
    }

    else {
      out += `  ${sizeToType[attribute.size]} ${attribute.name} = d[${block}].${makeVectorSwizzle(attribute.blockIndex, attribute.size)};\n`;
    }
  });

  return out;
}

function makeVectorSwizzle(start: number, size: number) {
  return VECTOR_COMPONENTS.slice(start, start + size).join('');
}
