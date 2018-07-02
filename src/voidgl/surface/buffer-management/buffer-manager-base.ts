import { Instance } from '../../instance-provider/instance';
import { Vec2 } from '../../util';
import { Layer } from '../layer';
import { Scene } from '../scene';

export function isBufferLocation(val: any): val is IBufferLocation {
  return val && val.buffer && val.buffer.value;
}

/**
 * This defines a base information object that explains where in a buffer a value
 * is represented.
 */
export interface IBufferLocation {
  /**
   * This is the instance index indicative of the instance positioning within the buffer.
   * Keep in mind: This does NOT correlate to a lookup for an Instance object but rather for
   * the instancing concept designed for GL Buffers.
   */
  instanceIndex: number;
  /**
   * This is the generic buffer object interface for accessing the actual buffer.
   */
  buffer: {
    value: Float32Array | Uint8Array;
  };
  /**
   * This is the range within the buffer values should be injected for this location.
   */
  range: Vec2;
}

/**
 * Each instance that comes in can be associated with a group of buffer locations. A buffer location for each
 * instance attribute used in updates. So a grouping is several buffer locations that are keyed by
 * the instance's property's UIDs.
 */
export interface IBufferLocationGroup<T extends IBufferLocation> {
  instanceIndex: number;
  propertyToBufferLocation: Map<number, T>;
}

/**
 * Layers manage instances and those instances require a form of binding to their associated buffers.
 * The buffers have to be intelligently created and managed in this tieing to maximize performance.
 * One can not have a buffer for every instance in most cases, so the buffer manager has to get instances
 * to cooperate sharing a buffer in whatever strategy possible that best suits the hardware and it's limitations.
 *
 * This provides a uniform interface between instances and their corresponding buffer.
 */
export abstract class BufferManagerBase<T extends Instance, U extends IBufferLocation> {
  /** The layer this manager glues Instances to Buffers */
  layer: Layer<T, any>;
  /** The scene the layer is injecting elements into */
  scene: Scene;

  /**
   * Base constructor. A manager always needs to be associated with it's layer and it's scene.
   */
  constructor(layer: Layer<T, any>, scene: Scene) {
    this.layer = layer;
    this.scene = scene;
  }

  /**
   * Destroy all elements that consume GPU resources or consumes otherwise unreleaseable resources.
   */
  abstract destroy(): void;

  /**
   * This adds an instance to the manager and thus ties the instance to an IBuffer location
   */
  add: (instance: T) => U | IBufferLocationGroup<U> | null;

  /**
   * Disassociates an instance with it's buffer location and makes the instance
   * in the buffer no longer drawable.
   */
  remove: (instance: T) => T;
}
