import * as Three from 'three';
import { IInstanceAttribute, IInstancingUniform, InstanceAttributeSize } from '../../types';
import { makeInstanceUniformNameArray } from '../../util/make-instance-uniform-name';
import { shaderTemplate } from '../../util/shader-templating';
import { templateVars } from '../fragments/template-vars';

const instanceRetrievalArrayFragment = require('../fragments/instance-retrieval-array.vs');

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
  /** This is the special case for instance attributes that want an atlas resource */
  99: 'vec4',
};

export function makeUniformArrayDeclaration(totalBlocks: number) {
  return {
    fragment: `uniform vec4 ${makeInstanceUniformNameArray()}[${totalBlocks}];`,
    materialUniforms: [
      {
        name: makeInstanceUniformNameArray(),
        type: '4fv',
        value: new Array(totalBlocks)
          .fill(0)
          .map(() => new Three.Vector4(0, 0, 0, 0)),
      },
    ] as IInstancingUniform[],
  };
}

export function makeInstanceRetrievalArray(blocksPerInstance: number) {
  const templateOptions: {[key: string]: string} = {};
  templateOptions[templateVars.instanceBlockCount] = `${blocksPerInstance}`;

  const required = {
    name: 'makeInstanceRetrievalArray',
    values: [
      templateVars.instanceBlockCount,
    ],
  };

  const results = shaderTemplate(instanceRetrievalArrayFragment, templateOptions, required);

  return results.shader;
}

export function makeInstanceDestructuringArray(instanceAttributes: IInstanceAttribute<any>[], blocksPerInstance: number) {
  let out = '';

  // Generate the blocks
  for (let i = 0; i < blocksPerInstance; ++i) {
    out += `  vec4 block${i} = getBlock(${i}, instanceIndex);\n`;
  }

  instanceAttributes.forEach(attribute => {
    const block = attribute.block;

    if (attribute.size === InstanceAttributeSize.FOUR) {
      out += `  ${sizeToType[attribute.size]} ${attribute.name} = block${block};\n`;
    }

    else if (attribute.size === InstanceAttributeSize.ATLAS) {
      out += `  ${sizeToType[attribute.size]} ${attribute.name} = block${block};\n`;
    }

    else {
      out += `  ${sizeToType[attribute.size]} ${attribute.name} = block${block}.${makeVectorSwizzle(attribute.blockIndex, attribute.size)};\n`;
    }
  });

  return out;
}

function makeVectorSwizzle(start: number, size: number) {
  return VECTOR_COMPONENTS.slice(start, start + size).join('');
}
