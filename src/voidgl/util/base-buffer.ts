import { ShaderMaterial } from 'three';
import { BufferUtil, IBufferItems } from '../util/buffer-util';

/**
 * This deinfes the minimal set of methods that should be implemented to create
 * a reusable buffer object that can be initialized and populated.
 */
export class BaseBuffer<T, U> {
  /** Will store the base default buffer items to work with */
  bufferItems: IBufferItems<T, U>;

  /**
   * This disposes the resources associated with a buffer.
   */
  dispose() {
    if (this.bufferItems) {
      BufferUtil.dispose([this.bufferItems]);
    }
  }

  /**
   * This initializes the buffer and generates the buffer items object.
   */
  init(material: ShaderMaterial, unitCount: number) {
    // To be implemented by a subclass
  }

  /**
   * This updates the buffer by providing the shape buffer needed to update
   * the internal buffer items
   *
   * @param {T[]} shapeBuffer The shape buffer containing all of the shape data
   *                          to be placed into the buffer.
   *
   * @return {boolean} Retrusn true if this pushed up any updates
   */
  update(shapeBuffer: T[]): boolean {
    // To be implemented by a subclass
    return false;
  }
}
