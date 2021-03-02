import { Attribute } from "./attribute";
import { GLProxy } from "./gl-proxy";
/**
 * This represents a buffer of data that is expressed as attributes to be placed
 * within a scene. This is generally paired with a Material in a Model to
 * indicate the configuration for how the buffer should be rendered.
 */
export declare class Geometry {
    /** The attributes bound to this geometry.  */
    private _attributes;
    get attributes(): Map<string, Attribute>;
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
     * Removes any attributes associated with the specified identifying name.
     */
    removeAttribute(name: string): void;
    /**
     * Destroys this resource and frees resources it consumes on the GPU.
     */
    destroy(): void;
}
