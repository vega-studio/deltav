import { Attribute } from "./attribute.js";
import { GLProxy } from "./gl-proxy.js";
import type { IndexBuffer } from "./index-buffer.js";
/**
 * This represents a buffer of data that is expressed as attributes to be placed
 * within a scene. This is generally paired with a Material in a Model to
 * indicate the configuration for how the buffer should be rendered.
 */
export declare class Geometry {
    /** The attributes bound to this geometry.  */
    private _attributes;
    private _attributeMap?;
    /** Get a Map representation of the attributes keyed by name */
    get attributes(): Map<string, Attribute>;
    /** The optional index buffer bound to this geometry. */
    private _indexBuffer?;
    get indexBuffer(): IndexBuffer | undefined;
    /** This contains any gl specific state associated with this object */
    gl?: {
        /**
         * Potentially generated VAO for the attributes beneath this geometry. If
         * available this can greatly speed up set up and rendering for each draw
         * call. Hardware must support it for WebGL 2 or via extension.
         */
        vao?: WebGLVertexArrayObject;
        /** Proxy communication with the GL context */
        proxy: GLProxy;
    };
    /** Number of instances this geometry covers */
    maxInstancedCount: number;
    /**
     * If all attributes added are instanced or not instanced, then this geometry
     * is not instanced
     */
    isInstanced: boolean;
    /**
     * Adds an attribute to this geometry. This will associate the attribute's
     * buffer to an attribute with the same name used within the shader program.
     */
    addAttribute(name: string, attribute: Attribute): void;
    /**
     * Applies an index buffer to this geometry which causes this geometry to
     * render with drawElements/drawElementsInstanced instead of
     * drawArrays/drawArraysInstanced.
     *
     * This allows for more efficient use of complex vertex data and reduces the
     * need for copies of the data in the buffers.
     */
    setIndexBuffer(indexBuffer: IndexBuffer): void;
    /**
     * Removes any attributes associated with the specified identifying name.
     */
    removeAttribute(name: string): void;
    /**
     * This loops through this geometry's attributes and index buffer and resizes
     * the buffers backing them to support the number of vertices specified.
     *
     * The index buffer is provided a different sizing option as it can represent
     * more vertices than the attributes represent.
     *
     * Resizing causes a full commit of all the buffers backing the geometry and
     * regenerates the VAO if available.
     */
    resizeVertexCount(vertexCount: number, indexCount?: number): void;
    /**
     * Destroys this resource and frees resources it consumes on the GPU.
     */
    destroy(): void;
    /**
     * Triggers a rebuild of the this geometry's backing gl context. This does NOT
     * affect the attributes or index buffer.
     */
    rebuild(): void;
}
