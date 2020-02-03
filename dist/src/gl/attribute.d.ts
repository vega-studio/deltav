/**
 * Defines an attribute applied to a geometry object. This keeps track of a buffer associated
 * with the attribute to bind to attributes within the shader program.
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
        /** Stores the buffer type (typically gl.ARRAY_BUFFER) */
        type: number;
        /** Stores the locations of each attribute discovered for each program identified */
        locations?: Map<WebGLProgram, number>;
    };
    /**
     * The optimization state for frequently changing buffers. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
     */
    readonly isDynamic: boolean;
    private _isDynamic;
    /**
     * Indicates the data in this attribute is structured per instance rather than per vertex.
     */
    readonly isInstanced: boolean;
    private _isInstanced;
    /** Indicates a full update of the buffer will happen. This is managed internally to determine when needed */
    readonly fullUpdate: boolean;
    private _fullUpdate;
    /** Indicates if the data should be normalized when provided to the shader. */
    normalize: boolean;
    /** This flags the attribute as needing to commit updates to it's buffer */
    readonly needsUpdate: boolean;
    private _needsUpdate;
    /**
     * The packing size of the vertex attribute (how many floats per attribute). See:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray
     */
    size: number;
    /**
     * Defines a range to update for the buffer object. Getting the range object is a copy of the object.
     * Setting the updateRange triggers an update.
     *
     * Although these properties represent vertex indicies it directly ties to all implications of:
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
     */
    updateRange: Attribute["_updateRange"];
    private _updateRange;
    /**
     * The data provided is the array that holds all of the information that should be pushed to
     * the GPU. The size defines how large the vertex attribute is defined in the shader.
     */
    constructor(data: Float32Array, size: number, isDynamic?: boolean, isInstanced?: boolean);
    /**
     * Flags this attribute as completely resolved in it's needs for updates
     */
    resolve(): void;
    /**
     * Flags the buffer as dynamic. This is a performance optimization that some GPUs can use for
     * buffers that change their contents frequently. Toggling this
     */
    setDynamic(isDynmaic: boolean): void;
}
