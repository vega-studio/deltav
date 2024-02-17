import { BaseResourceOptions } from "../base-resource-manager";
import { IdentifyByKey } from "../../util/identify-by-key";
import { ResourceType } from "../../types";
import { Texture, TextureOptions } from "../../gl/texture";
import { WebGLRenderer } from "../../gl";
/**
 * Options required for generating a RenderTexture.
 */
export interface IRenderTextureResource extends BaseResourceOptions {
    /** Set the type of the resource to explicitally be an atlas resource */
    type: ResourceType.TEXTURE;
    /** This is the height of the texture */
    height: number;
    /** This is the width of the texture */
    width: number;
    /**
     * This applies any desired settings to the Texture.
     * Some noteable defaults this system sets:
     *  - generateMipMaps is true and
     *  - premultiply alpha is true.
     */
    textureSettings?: TextureOptions;
}
/**
 * Use this to aid in creating a texture in the resources portion of configuring
 * your surface.
 */
export declare function createTexture(options: Omit<IRenderTextureResource, "type" | "key"> & Partial<Pick<IRenderTextureResource, "key">>): IRenderTextureResource;
/**
 * Type guard for the Render Texture resource type.
 */
export declare function isRenderTextureResource(val: any): val is IRenderTextureResource;
/**
 * This defines a general purpose texture that can be rendered into and be
 * rendered.
 */
export declare class RenderTexture extends IdentifyByKey implements IRenderTextureResource {
    /** Set the type of the resource to explicitally be an atlas resource */
    type: ResourceType.TEXTURE;
    /** This is the height of the texture */
    height: number;
    /** This is the width of the texture */
    width: number;
    /**
     * This applies any desired settings to the Texture.
     * Some noteable defaults this system sets:
     *  - generateMipMaps is true and
     *  - premultiply alpha is true.
     */
    textureSettings?: TextureOptions;
    /** The actual texture resource generated */
    texture: Texture;
    constructor(options: IRenderTextureResource, renderer?: WebGLRenderer);
    /**
     * Frees up resources associated with this object. This object is no longer
     * valid after this is called and will produce undefined results if attempted
     * to use again.
     */
    destroy(): void;
    /**
     * This generates the texture object needed for this atlas.
     */
    private createTexture;
}
