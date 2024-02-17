import { BaseResourceRequest } from "../base-resource-manager";
import { Omit, ResourceType } from "../../types";
import { Texture } from "../../gl/texture";
/**
 * Base information an RenderTexture resource can provide.
 */
export interface IRenderTextureResourceRequest extends BaseResourceRequest {
    /**
     * This is the key of the resource to be used for the request. Resources are
     * defined in the pipeline.
     */
    key: string;
    /**
     * Once loaded into the texture, this will be populated revealing the
     * informaion needed to sample the image from the RenderTexture.
     */
    texture?: Texture;
    /** Set the type of this resource for categorization by resource managers */
    type: ResourceType.TEXTURE;
}
/**
 * Simple wrapper to make autocomplete easier for making an RenderTexture
 * request.
 */
export declare function textureRequest(options: Omit<Partial<IRenderTextureResourceRequest>, "type"> & Pick<IRenderTextureResourceRequest, "key">): IRenderTextureResourceRequest;
