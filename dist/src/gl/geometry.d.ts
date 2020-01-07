import { Attribute } from "./attribute";
/**
 * This represents a buffer of data that is expressed as attributes to be placed
 * within a scene. This is generally paired with a Material in a Model to indicate
 * the configuration for how the buffer should be rendered.
 */
export declare class Geometry {
    /** The attributes bound to this geometry.  */
    private _attributes;
    readonly attributes: Map<string, Attribute>;
    /** This contains any gl specific state associated with this object */
    gl: {};
    /** Number of instances this geometry covers */
    maxInstancedCount: number;
    /** If all attributes added are instanced or not instanced, then this geometry is not instanced */
    isInstanced: boolean;
    /**
     * Adds an attribute to this geometry. This will associate the attribute's buffer to an attribute
     * with the same name used within the shader program.
     */
    addAttribute(name: string, attribute: Attribute): void;
    /**
     * Removes any attributes associated with the specified identifying name.
     */
    removeAttribute(name: string): void;
    dispose(): void;
}
