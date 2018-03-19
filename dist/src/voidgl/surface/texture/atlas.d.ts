import * as Three from 'three';
import { IdentifyByKey, IdentifyByKeyOptions } from '../../util/identify-by-key';
import { AtlasManager, AtlasResource } from './atlas-manager';
import { PackNode } from './pack-node';
/**
 * These are valid atlas sizes available. We force a power of 2 to be utilized.
 * We do not allow crazy large sizes as browsers have very real caps on resources.
 * This helps implementations be a little smarter about what they are using. Future
 * versions may increase this number as GPUs improve and standards allow greater
 * flexibility.
 */
export declare enum AtlasSize {
    _2 = 2,
    _4 = 4,
    _8 = 8,
    _16 = 16,
    _32 = 32,
    _64 = 64,
    _128 = 128,
    _256 = 256,
    _512 = 512,
    _1024 = 1024,
    _2048 = 2048,
    _4096 = 4096,
}
export interface IAtlasOptions extends IdentifyByKeyOptions {
    /** This is the height of the texture */
    height: AtlasSize;
    /** This is the width of the atlas */
    width: AtlasSize;
    /**
     * This applies any desired settings to the Threejs texture as desired.
     * Some noteable defaults this system sets:
     *  - generateMipMaps is false and
     *  - premultiply alpha is true.
     */
    textureSettings?: Partial<Three.Texture>;
}
/**
 * This represents a single Texture on the gpu that is composed of several smaller textures
 * as a 'look up'.
 */
export declare class Atlas extends IdentifyByKey {
    /** Stores the size of the atlas texture */
    height: AtlasSize;
    /** This is the parent manager of the atlas */
    private manager;
    /** This is the packing of the  */
    packing: PackNode;
    /**
     * This is all of the resources associated with this atlas. The boolean flag indicates if the resource
     * is flagged for removal. When set to false, the resource is no longer valid and can be removed from
     * the atlas at any given moment.
     */
    validResources: Map<AtlasResource, boolean>;
    /** This is the actual texture object that represents the atlas on the GPU */
    texture: Three.Texture;
    /** Stores the size of the atlas texture */
    width: AtlasSize;
    constructor(options: IAtlasOptions);
    /**
     * This invalidates the SubTexture of an atlas resource.
     */
    private invalidateResource(resource);
    /**
     * Sets the parent manager of this atlas
     */
    setManager(manager: AtlasManager): void;
    /**
     * Adds a resource to this atlas AND ensures the resource is flagged valid for use.
     *
     * @return {boolean} True if the resource successfully registered
     */
    registerResource(resource: AtlasResource): boolean;
    /**
     * This flags a resource from removal from an atlas.
     *
     * NOTE: This does not immediately clear the resource fromt he atlas, nor does it even guarantee
     * the resource will be cleared from the atlas for a while. It merely suggests the resource be removed
     * and makes the SubTexture invalid. It could be a long while before the atlas gets regnerated and repacked
     * to actually reflect the resource not existing on the atlas.
     */
    removeResource(resource: AtlasResource): void;
    /**
     * This frees up all the resources down to the GPU related to this atlas. It also
     * loops through every resource and invalidates the texturing information within
     * them so subsequent accidental renders will appear as a single color rather than
     * an artifacted element.
     */
    destroy(): void;
}
