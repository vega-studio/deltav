import { GLProxy } from "./gl-proxy.js";
/**
 * Defines an attribute applied to a geometry object. This keeps track of a
 * buffer associated with the attribute to bind to attributes within the shader
 * program.
 */
export declare class Attribute {
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
     * The packing size of the vertex attribute (how many floats per attribute).
     * See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray
     */
    size: number;
    /**
     * This is the number of "size" elements in the buffer. Essentially the value
     * passed to the parameter of the "resize" method.
     */
    get count(): number;
    /**
     * Defines a range to update for the buffer object. Getting the range object
     * is a copy of the object. Setting the updateRange triggers an update.
     *
     * Although these properties represent vertex indicies it directly ties to all
     * implications of:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
     */
    get updateRange(): Attribute["_updateRange"];
    set updateRange(val: Attribute["_updateRange"]);
    private _updateRange;
    /**
     * The data provided is the array that holds all of the information that
     * should be pushed to the GPU. The size defines how large the vertex
     * attribute is defined in the shader.
     */
    constructor(data: Float32Array, size: number, isDynamic?: boolean, isInstanced?: boolean);
    /**
     * Destroys this resource and frees resources it consumes on the GPU.
     */
    destroy(): void;
    /**
     * Triggers a rebuild of the gl context for this attribute without destroying
     * any of the buffer data.
     */
    rebuild(): void;
    /**
     * Flags this attribute as completely resolved in it's needs for updates
     */
    resolve(): void;
    /**
     * Resizes this attribute to a new number of elements. This will create a new
     * buffer and cause a full commit to the GPU.
     *
     * retainData specifies how much of the old buffer should be retained. 0
     * will completely destroy the buffer and replace it with the new one. Any
     * value above zero will retain that much "count" of the buffer. Excluding the
     * parameter causes a full copy of the buffer.
     */
    resize(count: number, retainData?: number): void;
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
    repeatInstances(instanceCount: number, instanceVertexCount: number, startInstance?: number): void;
    /**
     * Flags the buffer as dynamic. This is a performance optimization that some
     * GPUs can use for buffers that change their contents frequently. Toggling
     * this
     */
    setDynamic(isDynamic: boolean): void;
}
