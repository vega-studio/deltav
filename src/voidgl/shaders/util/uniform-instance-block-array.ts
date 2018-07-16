import * as Three from 'three';
import { Layer } from '../../surface/layer';
import { LayerBufferType } from '../../surface/layer-processing/layer-buffer-type';
import {
  IInstanceAttribute,
  IInstancingUniform,
  InstanceAttributeSize,
} from '../../types';
import { Instance } from '../../util';
import { AutoEasingLoopStyle } from '../../util/auto-easing-method';
import { shaderTemplate } from '../../util/shader-templating';
import { templateVars } from '../fragments/template-vars';
import { makeInstanceUniformNameArray } from './make-instance-uniform-name';

const instanceRetrievalArrayFragment = require('../fragments/instance-retrieval-array.vs');

/** Defines the elements for destructuring out of a vector */
const VECTOR_COMPONENTS = ['x', 'y', 'z', 'w'];

/** Converts a size to a shader type */
const sizeToType: { [key: number]: string } = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4',
  9: 'mat3',
  16: 'mat4',
  /** This is the special case for instance attributes that want an atlas resource */
  99: 'vec4',
};

/**
 * This sorts attributes specific to how they need to be destructured. For example:
 * easing attributes MUST appear AFTER all of the specially integrated attributes that were generated
 * such as start times and durations.
 */
function orderByPriority(
  a: IInstanceAttribute<any>,
  b: IInstanceAttribute<any>,
) {
  if (a.easing && !b.easing) return 1;
  return -1;
}

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
  const templateOptions: { [key: string]: string } = {};
  templateOptions[templateVars.instanceBlockCount] = `${blocksPerInstance}`;

  const required = {
    name: 'makeInstanceRetrievalArray',
    values: [templateVars.instanceBlockCount],
  };

  const results = shaderTemplate(
    instanceRetrievalArrayFragment,
    templateOptions,
    required,
  );

  return results.shader;
}

export function makeInstanceDestructuringArray<T extends Instance>(
  layer: Layer<T, any>,
  instanceAttributes: IInstanceAttribute<T>[],
  blocksPerInstance: number,
) {
  let out = '';

  const orderedAttributes = instanceAttributes.slice(0).sort(orderByPriority);

  if (layer.bufferType === LayerBufferType.INSTANCE_ATTRIBUTE) {
    out = instanceAttributeDestructuring(orderedAttributes);
  } else {
    out = uniformInstancingDestructuring(orderedAttributes, blocksPerInstance);
  }

  return out;
}

function instanceAttributeDestructuring<T extends Instance>(
  orderedAttributes: IInstanceAttribute<T>[],
) {
  let out = '';

  orderedAttributes.forEach(attribute => {
    // If this is the source easing attribute, we must add it in as an eased method along with a calculation for the
    // Easing interpolation time value based on the current time and the injected start time of the change.
    if (attribute.easing && attribute.size) {
      switch (attribute.easing.loop) {
        // Repeat means going from 0 to 1 then 0 to 1 etc etc
        case AutoEasingLoopStyle.REPEAT:
          out += `  float _${
            attribute.name
          }_time = clamp(fract((currentTime - _${
            attribute.name
          }_start_time) / _${attribute.name}_duration), 0.0, 1.0);\n`;
          break;

        // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
        case AutoEasingLoopStyle.REFLECT:
          // Get the time passed in a linear fashion
          out += `  float _${attribute.name}_timePassed = (currentTime - _${
            attribute.name
          }_start_time) / _${attribute.name}_duration;\n`;
          // Make a triangle wave from the time passed to ping pong the value
          out += `  float _${attribute.name}_pingPong = abs((fract(_${
            attribute.name
          }_timePassed / 2.0)) - 0.5) * 2.0;\n`;
          // Ensure we're clamped to the right values
          out += `  float _${attribute.name}_time = clamp(_${
            attribute.name
          }_pingPong, 0.0, 1.0);\n`;
          break;

        // No loop means just linear time
        case AutoEasingLoopStyle.NONE:
        default:
          out += `  float _${attribute.name}_time = clamp((currentTime - _${
            attribute.name
          }_start_time) / _${attribute.name}_duration, 0.0, 1.0);\n`;
          break;
      }

      out += `  ${sizeToType[attribute.size]} ${attribute.name} = ${
        attribute.easing.methodName
      }(_${attribute.name}_start, _${attribute.name}_end, _${
        attribute.name
      }_time);\n`;
    }
  });

  return out;
}

function uniformInstancingDestructuring<T extends Instance>(
  orderedAttributes: IInstanceAttribute<T>[],
  blocksPerInstance: number,
) {
  let out = 'int instanceIndex = int(instance);';

  // Generate the blocks
  for (let i = 0; i < blocksPerInstance; ++i) {
    out += `  vec4 block${i} = getBlock(${i}, instanceIndex);\n`;
  }

  orderedAttributes.forEach(attribute => {
    const block = attribute.block;

    // If this is the source easing attribute, we must add it in as an eased method along with a calculation for the
    // Easing interpolation time value based on the current time and the injected start time of the change.
    if (attribute.easing && attribute.size) {
      if (attribute.size === InstanceAttributeSize.FOUR) {
        out += `  ${sizeToType[attribute.size]} _${
          attribute.name
        }_end = block${block};\n`;
      } else {
        out += `  ${sizeToType[attribute.size || 1]} _${
          attribute.name
        }_end = block${block}.${makeVectorSwizzle(
          attribute.blockIndex || 0,
          attribute.size || 1,
        )};\n`;
      }

      switch (attribute.easing.loop) {
        // Repeat means going from 0 to 1 then 0 to 1 etc etc
        case AutoEasingLoopStyle.REPEAT:
          out += `  float _${
            attribute.name
          }_time = clamp(fract((currentTime - _${
            attribute.name
          }_start_time) / _${attribute.name}_duration), 0.0, 1.0);\n`;
          break;

        // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
        case AutoEasingLoopStyle.REFLECT:
          // Get the time passed in a linear fashion
          out += `  float _${attribute.name}_timePassed = (currentTime - _${
            attribute.name
          }_start_time) / _${attribute.name}_duration;\n`;
          // Make a triangle wave from the time passed to ping pong the value
          out += `  float _${attribute.name}_pingPong = abs((fract(_${
            attribute.name
          }_timePassed / 2.0)) - 0.5) * 2.0;\n`;
          // Ensure we're clamped to the right values
          out += `  float _${attribute.name}_time = clamp(_${
            attribute.name
          }_pingPong, 0.0, 1.0);\n`;
          break;

        // No loop means just linear time
        case AutoEasingLoopStyle.NONE:
        default:
          out += `  float _${attribute.name}_time = clamp((currentTime - _${
            attribute.name
          }_start_time) / _${attribute.name}_duration, 0.0, 1.0);\n`;
          break;
      }

      out += `  ${sizeToType[attribute.size]} ${attribute.name} = ${
        attribute.easing.methodName
      }(_${attribute.name}_start, _${attribute.name}_end, _${
        attribute.name
      }_time);\n`;
    }

    // If we have a size the size of a block, then don't swizzle the vector
    else if (attribute.size === InstanceAttributeSize.FOUR) {
      out += `  ${sizeToType[attribute.size]} ${
        attribute.name
      } = block${block};\n`;
    }

    // If the attribute is an atlas, then we use the special ATLAS size and don't swizzle the vector
    else if (attribute.atlas) {
      out += `  ${sizeToType[InstanceAttributeSize.ATLAS]} ${
        attribute.name
      } = block${block};\n`;
    }

    // Do normal destructuring with any other size and type
    else {
      out += `  ${sizeToType[attribute.size || 1]} ${
        attribute.name
      } = block${block}.${makeVectorSwizzle(
        attribute.blockIndex || 0,
        attribute.size || 1,
      )};\n`;
    }
  });

  return out;
}

function makeVectorSwizzle(start: number, size: number) {
  return VECTOR_COMPONENTS.slice(start, start + size).join('');
}
