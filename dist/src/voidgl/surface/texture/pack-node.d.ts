import { Bounds } from '../../primitives/bounds';
import { SubTexture } from './sub-texture';
/**
 * Helps us track the bounds of the image being loaded in tied in with the
 * texture it represents
 */
export interface ImageDimensions {
    first: SubTexture;
    second: Bounds;
}
/**
 * This is used specifically by the atlas manager to aid in packing
 * in textures within an area. This will guarantee boundaries of textures are
 * not violated and provide proper feedback for where to draw a given image
 */
export declare class PackNode {
    child: [PackNode, PackNode];
    isLeaf: boolean;
    nodeDimensions: Bounds;
    nodeImage: SubTexture;
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
    insert(image: ImageDimensions): PackNode;
    /**
     * Removes the image from the mapping and tries to open up as much space as possible.
     *
     * @param {AtlasTexture} image The image to insert into the
     */
    remove(image: SubTexture): boolean;
}
