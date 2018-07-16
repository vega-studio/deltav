import * as Three from 'three';
import { Instance } from '../../instance-provider/instance';
import { IVertexAttribute, IVertexAttributeInternal, ShaderIOValue } from '../../types';
import { Layer } from '../layer';
import { LayerBufferType } from './layer-buffer-type';

function isNumberCluster(val: ShaderIOValue): val is [number] | [number, number] | [number, number, number] | [number, number, number, number] {
  return !Array.isArray(val[0]);
}

export function generateLayerGeometry<T extends Instance>(layer: Layer<T, any>, maxInstancesPerBuffer: number, vertexAttributes: IVertexAttributeInternal[], vertexCount: number): Three.BufferGeometry {
  // Make the new buffers to be updated
  const vertexBuffers = [];

  if (layer.bufferType === LayerBufferType.INSTANCE_ATTRIBUTE) {
    maxInstancesPerBuffer = 1;
  }

  for (let i = 0, end = vertexAttributes.length; i < end; ++i) {
    const attribute = vertexAttributes[i];
    vertexBuffers.push(new Float32Array((attribute.size) * vertexCount * maxInstancesPerBuffer));
  }

  // Let's now fill in the baseline geometry with the instances we will be generating
  // First we ask the layer for a single instance's buffer setup
  const endk = vertexAttributes.length;
  let buffer: Float32Array;
  let attribute: IVertexAttribute;
  let value: ShaderIOValue;
  let formatError: boolean = false;

  for (let i = 0, end = vertexCount; i < end; ++i) {
    for (let k = 0; k < endk; ++k) {
      attribute = vertexAttributes[k];
      buffer = vertexBuffers[k];
      value = attribute.update(i);

      if (isNumberCluster(value)) {
        for (let j = i * attribute.size, endj = j + attribute.size, index = 0; j < endj; ++j, ++index) {
          buffer[j] = value[index];
        }
      }

      else {
        formatError = true;
      }
    }
  }

  if (formatError) {
    console.warn('A vertex buffer updating method should not use arrays of arrays of numbers.');
  }

  // After getting the geometry for a single instance, we can now copy paste
  // For subsequent instances using very fast FLoat32 methods
  // NOTE: This is ONLY for certain buffering strategies. This is essentially a noop when the
  // maxInstances is set to one.
  for (let i = 0, end = vertexAttributes.length; i < end; ++i) {
    const attribute = vertexAttributes[i];
    const instanceSize = (attribute.size) * vertexCount;

    // Copy the first buffer set into the rest of the buffer
    for (let k = 1, endk = maxInstancesPerBuffer; k < endk; ++k) {
      vertexBuffers[i].copyWithin(instanceSize * k,  0, instanceSize);
    }
  }

  // Lastly, we make the instance attribute reflect correctly so each instance
  // Can have varied information. This is only appropriate for the uniform buffer strategy
  if (layer.bufferType === LayerBufferType.UNIFORM) {
    const instancingBuffer = vertexBuffers[0];

    for (let i = 0, end = maxInstancesPerBuffer; i < end; ++i) {
      const instanceStartIndex = i * vertexCount;

      for (let k = 0; k < vertexCount; ++k) {
        instancingBuffer[k + instanceStartIndex] = i;
      }
    }
  }

  // Now we can generate the attributes and apply them to a geometry object
  const geometry = new Three.BufferGeometry();

  for (let i = 0, end = vertexAttributes.length; i < end; ++i) {
    const attribute = vertexAttributes[i];
    const materialAttribute = new Three.BufferAttribute(vertexBuffers[i], attribute.size);
    attribute.materialAttribute = materialAttribute;
    geometry.addAttribute(attribute.name, materialAttribute);
  }

  console.log('BUILD VERTEX ATTRIBUTES', geometry);

  return geometry;
}
