/**
 * Defines an attribute applied to a geometry object. This keeps track of a buffer associated
 * with the attribute to bind to attributes within the shader program.
 */
export class Attribute {
  /** The data buffer that is applied to the GPU */
  data: Float32Array;
  /** Anything specific to gl state is stored here for this object */
  gl = {
    id: -1,
  };
  /** The optimization state for frequently changing buffers */
  get isDynamic() { return this._isDynamic; }
  private _isDynamic: boolean;
  /** This flags the attribute as needing to commit updates to it's buffer */
  needsUpdate: boolean;
  /** The packing size of the vertex attribute (how many floats per attribute) */
  size: number;
  /** Defines a range to update for the buffer object */
  updateRange = {
    count: -1,
    offset: -1
  };

  /**
   * The data provided is the array that holds all of the information that should be pushed to
   * the GPU. The size defines how large the vertex attribute is defined in the shader.
   */
  constructor(data: Float32Array, size: number) {
    this.data = data;
    this.size = size;
  }

  /**
   * Flags the buffer as dynamic. This is a performance optimization that some GPUs can use for
   * buffers that change their contents frequently.
   */
  setDynamic(isDynmaic: boolean) {
    this._isDynamic = isDynmaic;
  }
}
