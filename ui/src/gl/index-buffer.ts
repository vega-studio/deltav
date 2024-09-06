import { GLProxy } from "./gl-proxy";

/**
 * Defines an index buffer applied to a geometry object. This keeps track of a
 * buffer filled with the indices that defines the vertex ordering within the
 * attribute buffers provided
 */
export class IndexBuffer {
  /**
   * The data buffer that is applied to the GPU. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
   */
  data: Uint8Array | Uint16Array | Uint32Array;

  /**
   * Anything specific to gl state is stored here for this object.
   * Modifying anything in here outside of the framework probably will
   * break everything.
   */
  gl?: {
    /** Stores the buffer id for the attribute */
    bufferId: WebGLBuffer;
    /**
     * Stores the buffer size type typically gl.UNSIGNED_INT or
     * gl.UNSIGNED_SHORT or gl.UNSIGNED_BYTE
     */
    indexType: number;
    /** Proxy communication with the GL context */
    proxy: GLProxy;
  };
  /**
   * The optimization state for frequently changing buffers. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
   */
  get isDynamic() {
    return this._isDynamic;
  }
  private _isDynamic: boolean;
  /**
   * Indicates the data in this attribute is structured per instance rather than
   * per vertex.
   */
  get isInstanced() {
    return this._isInstanced;
  }
  private _isInstanced = false;
  /**
   * Indicates a full update of the buffer will happen. This is managed
   * internally to determine when needed
   */
  get fullUpdate() {
    return this._fullUpdate;
  }
  private _fullUpdate = false;
  /** Indicates if the data should be normalized when provided to the shader. */
  normalize = false;
  /** This flags the attribute as needing to commit updates to it's buffer */
  get needsUpdate() {
    return this._needsUpdate;
  }
  private _needsUpdate = false;

  /**
   * Defines a range to update for the buffer object. Getting the range object
   * is a copy of the object. Setting the updateRange triggers an update.
   *
   * Although these properties represent vertex indicies it directly ties to all
   * implications of:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
   */
  get updateRange() {
    return this._updateRange;
  }

  set updateRange(val: IndexBuffer["_updateRange"]) {
    this._updateRange = val;
    this._needsUpdate = true;
  }

  private _updateRange = {
    /** Number of vertices to update */
    count: -1,
    /** Offset to the first vertex to begin updating */
    offset: -1,
  };

  /**
   * The data provided is the array that holds all of the information that
   * should be pushed to the GPU. The size defines how large the vertex
   * attribute is defined in the shader.
   */
  constructor(
    data: Uint8Array | Uint16Array | Uint32Array,
    isDynamic = false,
    isInstanced = false
  ) {
    this.data = data;
    this._isDynamic = isDynamic;
    this._isInstanced = isInstanced;
  }

  /**
   * Destroys this resource and frees resources it consumes on the GPU.
   */
  destroy() {
    this.data = new Uint8Array(0);

    if (this.gl) {
      this.gl.proxy.disposeIndexBuffer(this);
    }
  }

  /**
   * Triggers a rebuild of the gl context for this index buffer without
   * destroying any of the buffer data.
   */
  rebuild() {
    if (this.gl) {
      this.gl.proxy.disposeIndexBuffer(this);
    }
  }

  /**
   * Resizes this buffer to accomodate a different number of indicies.
   *
   * This requires the number of vertices this buffer will be referencing to
   * best optimize the buffer type for optimal memeory usage.
   */
  resize(count: number, vertexCount: number) {
    // If vertex count over 4 billion, we error as indices can not support that
    if (vertexCount > 4294967295) {
      throw new Error("Vertex count too high for index buffer");
    }

    let newBuffer: Uint8Array | Uint16Array | Uint32Array;

    if (vertexCount > 65535) newBuffer = new Uint32Array(count);
    else if (vertexCount > 256) newBuffer = new Uint16Array(count);
    else newBuffer = new Uint8Array(count);

    // When our int buffer is using the same data structure as the current data,
    // we can use a quick set to copy the data
    if (newBuffer.constructor === this.data.constructor) {
      if (newBuffer.length >= this.data.length) newBuffer.set(this.data);
      else newBuffer.set(this.data.subarray(0, newBuffer.length));
    }

    // Otherwise, the number value has to be cast to a different data type
    else {
      for (let i = 0, iMax = Math.min(count, this.data.length); i < iMax; i++) {
        newBuffer[i] = this.data[i];
      }
    }

    // Clear out the current backing buffers if they exist
    this.destroy();
    // Apply our new buffer
    this.data = newBuffer;
    // Ensure the data gets updated when submitted for rendering
    this._needsUpdate = true;
    this._fullUpdate = true;
  }

  /**
   * This is ONLY used when there are vertices that are copied in a vertex
   * buffer for the sake of creating a new identical instance in the vertex
   * buffer.
   *
   * This will repeat the indices in this buffer for a given number of indices
   * within the buffer and will apply an offset to each index to shift the
   * indices to the next instance of vertices possibly located within the vertex
   * buffer.
   *
   * If the index buffer is not big enough to support the number of instances,
   * it will just copy as far as it can then will stop copying. This operation
   * will NOT attempt to resize the buffer.
   *
   * @param instanceCount The number of instances to repeat the data for.
   * @param instanceVertexCount The number of vertices in each instance.
   * @param indexVertexCount The number of vertices in the index buffer that
   *                         creates a single instance.
   * @param startInstance The instance index to start the repeat operation. A
   *                      value of 1 will copy all instances that need to be
   *                      copied.
   */
  repeatInstances(
    instanceCount: number,
    instanceVertexCount: number,
    indexVertexCount: number,
    startInstance: number = 1
  ) {
    // Validate the start instance. Anything lower than 1 would be invalid as it
    // would write outside of bounds OR override the base instance that
    // describes the mesh.
    if (startInstance < 1) {
      throw new Error(
        "Can not use repeatInstance on indexBuffer with a startInstance of less than 1"
      );
    }

    // Calculate the max index that can be referenced by this index buffer.
    const maxIndex = instanceVertexCount * instanceCount;

    // We are introducing higher index values that will be placed into the index
    // buffer using this method. So we have to see if the current index buffer
    // data type can support those indices.
    if (maxIndex > 4294967296) {
      throw new Error("Vertex count too high for index buffer");
    }

    // Get the maximum index the current data type of the index buffer can
    const supportedIndex =
      this.data.constructor === Uint32Array
        ? 4294967296
        : this.data.constructor === Uint16Array
        ? 65536
        : 256;

    // If our buffer data type does not support the number of vertices needed
    // for the instancing, we need to cast the data type upward. As this should
    // generally only happen after a resize operation, it should be unlikely
    // this actually happens.
    if (maxIndex > supportedIndex) {
      this.resize(this.data.length, maxIndex);
    }

    // We loop for every instance that needs to be repeated in the data. We
    // start at 1 because the first instance is the starting instance in the
    // buffer.
    for (
      let i = startInstance,
        o = indexVertexCount * (startInstance - 1),
        offset = instanceVertexCount * startInstance,
        oMax = this.data.length;
      i < instanceCount && o < oMax;
      ++i, offset += instanceVertexCount
    ) {
      for (let k = 0; k < indexVertexCount && o < oMax; ++k, ++o) {
        this.data[o] = this.data[k] + offset;
      }
    }
  }

  /**
   * Flags this attribute as completely resolved in it's needs for updates
   */
  resolve() {
    this._needsUpdate = false;
    this._fullUpdate = false;
  }

  /**
   * Flags the buffer as dynamic. This is a performance optimization that some
   * GPUs can use for buffers that change their contents frequently. Toggling
   * this triggers a full update of the Buffer with the GPU. So this is best set
   * in the constructor one time and never changed again.
   */
  setDynamic(isDynamic: boolean) {
    this._isDynamic = isDynamic;
    this._needsUpdate = true;
    this._fullUpdate = true;
  }
}
