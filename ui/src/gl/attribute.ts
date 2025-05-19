import { GLProxy } from "./gl-proxy.js";

/**
 * Defines an attribute applied to a geometry object. This keeps track of a
 * buffer associated with the attribute to bind to attributes within the shader
 * program.
 */
export class Attribute {
  /**
   * The data buffer that is applied to the GPU. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
   */
  data: Float32Array;

  /**
   * Anything specific to gl state is stored here for this object.
   * Modifying anything in here outside of the framework probably will
   * break everything.
   */
  gl?: {
    /** Stores the buffer id for the attribute */
    bufferId: WebGLBuffer;
    /**
     * Stores the locations of each attribute discovered for each program
     * identified
     */
    locations?: Map<WebGLProgram, number>;
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
   * The packing size of the vertex attribute (how many floats per attribute).
   * See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray
   */
  size: number;

  /**
   * This is the number of "size" elements in the buffer. Essentially the value
   * passed to the parameter of the "resize" method.
   */
  get count() {
    return this.data.length / this.size;
  }

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

  set updateRange(val: Attribute["_updateRange"]) {
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
    data: Float32Array,
    size: number,
    isDynamic = false,
    isInstanced = false
  ) {
    this.data = data;
    this.size = size;
    this._isDynamic = isDynamic;
    this._isInstanced = isInstanced;
  }

  /**
   * Destroys this resource and frees resources it consumes on the GPU.
   */
  destroy() {
    this.data = new Float32Array(0);

    if (this.gl) {
      this.gl.proxy.disposeAttribute(this);
    }
  }

  /**
   * Triggers a rebuild of the gl context for this attribute without destroying
   * any of the buffer data.
   */
  rebuild() {
    if (this.gl) {
      this.gl.proxy.disposeAttribute(this);
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
   * Resizes this attribute to a new number of elements. This will create a new
   * buffer and cause a full commit to the GPU.
   *
   * retainData specifies how much of the old buffer should be retained. 0
   * will completely destroy the buffer and replace it with the new one. Any
   * value above zero will retain that much "count" of the buffer. Excluding the
   * parameter causes a full copy of the buffer.
   */
  resize(count: number, retainData?: number) {
    // Establish how much of the previous buffer should be retained
    if (retainData === void 0) retainData = this.data.length;
    else retainData = retainData * this.size;
    // First create the new buffer and copy the contents of the old buffer over
    const newBuffer = new Float32Array(count * this.size);
    if (newBuffer.length >= retainData) {
      if (retainData === this.data.length) newBuffer.set(this.data);
      else newBuffer.set(this.data.subarray(0, retainData));
    } else newBuffer.set(this.data.subarray(0, newBuffer.length));
    // Destroy the old buffer and it's gl context
    this.destroy();
    // Store the new buffer and flag everything for complete update
    this.data = newBuffer;
    this._needsUpdate = true;
    this._fullUpdate = true;
  }

  /**
   * This repeats data in this buffer to simulate putting multiple instances of
   * the data in this same buffer. This uses the first instance of data (data
   * starting at index 0) as the template for what to copy to the new instances.
   *
   * If this operation would exceed the length of the buffer, it will simply
   * copy as far as it can then quit. You should use the resize operation to
   * match the size of the buffer correctly to the expected size before calling
   * this operation.
   *
   * @param instanceCount Number of instances to repeat in the buffer
   * @param instanceVertexCount The number of vertices in each instance
   * @param startInstance The first instance index that should be copied in the
   *                      buffer. This must be a value >= 1 where 1 represents
   *                      the second instance in the buffer. We can not use 0 as
   *                      it would override the source template instance data.
   */
  repeatInstances(
    instanceCount: number,
    instanceVertexCount: number,
    startInstance: number = 1
  ) {
    if (startInstance < 1) {
      throw new Error(
        "Can not use repeatInstance on attribute with a startInstance of less than 1"
      );
    }

    // Calculate how many data elements a single instance takes up
    const instanceSize = instanceVertexCount * this.size;

    // If the instance copy would exceed the buffer size, quit
    if (startInstance * instanceSize + instanceSize > this.data.length) {
      return;
    }

    // Calculate how many instances the buffer currently suppports
    const maxInstance = Math.floor(this.data.length / instanceSize);
    // Calculate the actual final instance index we should copy up to
    const finalInstance = Math.min(startInstance + instanceCount, maxInstance);
    // Compute the index where our first copied instance will reside
    const startIndex = startInstance * instanceSize;

    // Do the first instance copy in the buffer to give us our first of our
    // doubling copies. The first instance in the buffer is the source template
    // for all of our instances.
    this.data.copyWithin(startIndex, 0, instanceSize);
    // Let's keep track of how many instances have been copied, so we know how
    // many can be copied in a single batch per iteration.
    let copiedInstances = 1;
    // We will track how many instance copies are left to perform
    let toCopy = finalInstance - startInstance - 1;
    // Make a while loop limiter. This prevents an infinite loop BUT probably
    // will never matter as most Web systems will crash from the sheer memory
    // that would have to be used to perform this operation. We can try to
    // determine a sane value here someday in the future if we keep causing
    // crashes here.
    let limit = 36;

    // We are going to perform a copy doubling strategy where we copy 1
    // instance, then use that data to copy another, then we can copy 2
    // instances with that data, and then copy 4 instances with that data and so
    // on until the copy would exceed the number required to finish the
    // operation. Once it exceeds, we scale back the number of instances to copy
    // to the exact size needed for the final copy, then the operation will be
    // completed. This will help dramatically reduce copy operations when
    // needed.
    while (toCopy > 0 && --limit > 0) {
      this.data.copyWithin(
        startInstance + copiedInstances * instanceSize,
        startIndex,
        // We recopy the copied instances to our new destination, but we limit
        // this to the number of instances we have left to copy in this batch.
        // This effectively causes us to double the number of instances we copy
        // each iteration, thus making this operation siginificantly faster.
        Math.min(toCopy, copiedInstances) * instanceSize
      );
      toCopy -= copiedInstances;
      copiedInstances += copiedInstances;
    }
  }

  /**
   * Flags the buffer as dynamic. This is a performance optimization that some
   * GPUs can use for buffers that change their contents frequently. Toggling
   * this
   */
  setDynamic(isDynamic: boolean) {
    this._isDynamic = isDynamic;
    this._needsUpdate = true;
    this._fullUpdate = true;
  }
}
