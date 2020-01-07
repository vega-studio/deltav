import { Texture, TextureOptions } from "../../gl/texture";
import { Omit, ResourceType, TextureSize } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";
import { BaseResourceOptions } from "../base-resource-manager";
import { IAtlasResourceRequest } from "./atlas-resource-request";
import { PackNode } from "./pack-node";
import { SubTexture } from "./sub-texture";
import { VideoTextureMonitor } from "./video-texture-monitor";
/**
 * Options required for generating an atlas.
 */
export interface IAtlasResource extends BaseResourceOptions {
    /** Set the type of the resource to explicitally be an atlas resource */
    type: ResourceType.ATLAS;
    /** This is the height of the texture */
    height: TextureSize;
    /** This is the width of the atlas */
    width: TextureSize;
    /**
     * This applies any desired settings to the Texture.
     * Some noteable defaults this system sets:
     *  - generateMipMaps is true and
     *  - premultiply alpha is true.
     */
    textureSettings?: TextureOptions;
}
/**
 * Use this in the property creation of atlas'.
 */
export declare function createAtlas(options: Omit<IAtlasResource, "type" | "key"> & Partial<Pick<IAtlasResource, "key">>): IAtlasResource;
/**
 * Type guard for the atlas resource type.
 */
export declare function isAtlasResource(val: BaseResourceOptions): val is Atlas;
declare type ResourceReference = {
    subtexture: SubTexture;
    count: number;
    videoMonitor?: VideoTextureMonitor;
};
/**
 * This represents a single Texture on the gpu that is composed of several smaller textures
 * as a 'look up'.
 */
export declare class Atlas extends IdentifyByKey implements IAtlasResource {
    /** Stores the size of the atlas texture */
    height: TextureSize;
    /** This is the packing of the atlas with images */
    packing: PackNode<SubTexture>;
    /**
     * This is storage for handling resource reference counting. When a resource's reference drops below
     * a count of 1, then the resource is disposed and it's space on the atlas is flagged for freeing up
     * should the atlas need to consolidate resources.
     */
    resourceReferences: Map<import("./atlas-resource-request").AtlasResource, ResourceReference>;
    /** This is the actual texture object that represents the atlas on the GPU */
    texture: Texture;
    /** These are the applied settings to our texture */
    textureSettings?: TextureOptions;
    /** The resource type for resource management */
    type: number;
    /** Stores the size of the atlas texture */
    width: TextureSize;
    constructor(options: IAtlasResource);
    /**
     * This generates the texture object needed for this atlas.
     */
    private createTexture;
    /**
     * This frees up all the resources down to the GPU related to this atlas. It also
     * loops through every resource and invalidates the texturing information within
     * them so subsequent accidental renders will appear as a single color rather than
     * an artifacted element.
     */
    destroy(): void;
    /**
     * This invalidates the SubTexture of an atlas resource.
     */
    private invalidateTexture;
    /**
     * This will look through all resources in this atlas and will determine if the resource
     * should be removed or not.
     */
    resolveResources(): void;
    /**
     * This flags a resource no longeer used and decrements it's reference count.
     * If the use of the resource drops low enough, this will clear out the resurce
     * completely.
     */
    stopUsingResource(request: IAtlasResourceRequest): void;
    /**
     * This flags a resource for use and increments it's reference count.
     */
    useResource(request: IAtlasResourceRequest): void;
}
export {};
