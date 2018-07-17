import { Instance } from '../../instance-provider/instance';
import {
  IInstanceAttribute,
  instanceAttributeSizeFloatCount,
  IVertexAttribute,
} from '../../types';
import { WebGLStat } from '../../util';
import {
  InstanceAttributeBufferManager,
  UniformBufferManager,
} from '../buffer-management';
import { Layer } from '../layer';
import { Scene } from '../scene';

export enum LayerBufferType {
  // This is a compatibility mode for instance attributes. This is used when:
  // 1. It would perform better
  // 2. When instance attributes are not available for the gl context (ANGLE draw instanced arrays)
  // 3. When the instance attributes + vertex attributes exceeds the max Vertex Attributes for the hardware
  UNIFORM,
  // This is a fast and zippy buffering strategy used when the hardware supports it for a provided layer!
  INSTANCE_ATTRIBUTE,
}

/**
 * This analyzes a layer and determines if it should use a compatibility instancing mode or use hardware
 * instancing.
 */
export function getLayerBufferType<T extends Instance>(
  gl: WebGLRenderingContext,
  layer: Layer<T, any>,
  vertexAttributes: IVertexAttribute[],
  instanceAttributes: IInstanceAttribute<T>[],
) {
  let type;

  // The layer only gets it's buffer type calculated once
  if (layer.bufferType !== undefined) {
    return layer.bufferType;
  }

  if (WebGLStat.HARDWARE_INSTANCING) {
    let attributesUsed = 0;

    for (let i = 0, end = vertexAttributes.length; i < end; ++i) {
      const attribute = vertexAttributes[i];
      attributesUsed += Math.ceil(attribute.size / 4);
    }

    for (let i = 0, end = instanceAttributes.length; i < end; ++i) {
      const attribute = instanceAttributes[i];
      attributesUsed += Math.ceil(
        instanceAttributeSizeFloatCount[attribute.size || 1] / 4,
      );
    }

    // Too many attributes. We must use the uniform compatibility mode
    if (attributesUsed > WebGLStat.MAX_VERTEX_ATTRIBUTES) {
      type = LayerBufferType.UNIFORM;
    }

    // If we make it here, we are good to go using hardware instancing! Hooray performance!
    else {
      type = LayerBufferType.INSTANCE_ATTRIBUTE;
    }
  }

  // No other faster mode supported: use uniform instancing
  if (!type) type = LayerBufferType.UNIFORM;
  // Apply the type to the layer
  layer.setBufferType(type);

  return type;
}

/**
 * Builds the proper buffer manager for the provided layer
 */
export function makeLayerBufferManager<T extends Instance>(
  gl: WebGLRenderingContext,
  layer: Layer<T, any>,
  scene: Scene,
) {
  // Esnure the buffering type has been calculated for the layer
  const type = getLayerBufferType(
    gl,
    layer,
    layer.vertexAttributes,
    layer.instanceAttributes,
  );

  switch (type) {
    // This is the Instance Attribute buffering strategy, which means the system
    case LayerBufferType.INSTANCE_ATTRIBUTE: {
      layer.setBufferManager(new InstanceAttributeBufferManager(layer, scene));
      break;
    }

    // Anything not utiliziing a specialized buffering strategy will use the uniform compatibility mode
    default: {
      layer.setBufferManager(new UniformBufferManager(layer, scene));
      break;
    }
  }
}
