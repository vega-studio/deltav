import { GLProxy } from "./gl-proxy.js";
/**
 * Defines an index buffer applied to a geometry object. This keeps track of a
 * buffer filled with the indices that defines the vertex ordering within the
 * attribute buffers provided
 */
export declare class IndexBuffer {
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
    get isDynamic(): boolean;
    private _isDynamic;
    /**
     * Indicates the data in this attribute is structured per instance rather than
     * per vertex.
     */
    get isInstanced(): boolean;
    private _isInstanced;
    /**
     * Indicates a full update of the buffer will happen. This is managed
     * internally to determine when needed
     */
    get fullUpdate(): boolean;
    private _fullUpdate;
    /** Indicates if the data should be normalized when provided to the shader. */
    normalize: boolean;
    /** This flags the attribute as needing to commit updates to it's buffer */
    get needsUpdate(): boolean;
    private _needsUpdate;
    /**
     * Defines a range to update for the buffer object. Getting the range object
     * is a copy of the object. Setting the updateRange triggers an update.
     *
     * Although these properties represent vertex indicies it directly ties to all
     * implications of:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
     */
    get updateRange(): IndexBuffer["_updateRange"];
    set updateRange(val: IndexBuffer["_updateRange"]);
    private _updateRange;
    /**
     * The data provided is the array that holds all of the information that
     * should be pushed to the GPU. The size defines how large the vertex
     * attribute is defined in the shader.
     */
    constructor(data: Uint8Array | Uint16Array | Uint32Array, isDynamic?: boolean, isInstanced?: boolean);
    /**
     * Destroys this resource and frees resources it consumes on the GPU.
     */
    destroy(): void;
    /**
     * Triggers a rebuild of the gl context for this index buffer without
     * destroying any of the buffer data.
     */
    rebuild(): void;
    /**
     * Resizes this buffer to accomodate a different number of indicies.
     *
     * This requires the number of vertices this buffer will be referencing to
     * best optimize the buffer type for optimal memeory usage.
     */
    resize(count: number, vertexCount: number): void;
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
    repeatInstances(instanceCount: number, instanceVertexCount: number, indexVertexCount: number, startInstance?: number): void;
    /**
     * Flags this attribute as completely resolved in it's needs for updates
     */
    resolve(): void;
    /**
     * Flags the buffer as dynamic. This is a performance optimization that some
     * GPUs can use for buffers that change their contents frequently. Toggling
     * this triggers a full update of the Buffer with the GPU. So this is best set
     * in the constructor one time and never changed again.
     */
    setDynamic(isDynamic: boolean): void;
}
