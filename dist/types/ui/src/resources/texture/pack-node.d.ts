import { Bounds } from "../../math/primitives/bounds.js";
import { SubTexture } from "./sub-texture.js";
/**
 * Helps us track the bounds of the image being loaded in tied in with the
 * texture it represents
 */
export interface IPackNodeDimensions<T> {
    data: T;
    bounds: Bounds<any>;
}
/**
 * This is used specifically by the atlas manager to aid in packing
 * in textures within an area. This will guarantee boundaries of textures are
 * not violated and provide proper feedback for where to draw a given image
 */
export declare class PackNode<T> {
    child: [PackNode<T> | null, PackNode<T> | null];
    isLeaf: boolean;
    bounds: Bounds<any>;
    data: T | null;
    constructor(x: number, y: number, width: number, height: number);
    /**
     * Deletes all of the sub nodes in this Mapping, thus clearing up memory usage
     */
    destroy(): void;
    /**
     * Indicates if there is a child
     */
    hasChild(): boolean;
    /**
     * Inserts images into our mapping, fitting them appropriately
     */
    insert(image: IPackNodeDimensions<T>): PackNode<T> | null;
    /**
     * Removes the image from the mapping and tries to open up as much space as possible.
     *
     * @param {AtlasTexture} data The image to insert into the
     */
    remove(data: T): boolean;
    /**
     * Applies a node's bounds to SubTexture.
     */
    static applyToSubTexture<T>(root: PackNode<T>, node: PackNode<T> | Bounds<T>, texture?: SubTexture, padding?: {
        top: number;
        left: number;
        right: number;
        bottom: number;
    }, flipY?: boolean): void;
}
