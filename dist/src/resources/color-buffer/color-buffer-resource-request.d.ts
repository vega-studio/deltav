import { ColorBuffer } from "../../gl/color-buffer";
import { Omit, ResourceType } from "../../types";
import { BaseResourceRequest } from "../base-resource-manager";
/**
 * Base information an RenderTexture resource can provide.
 */
export interface IColorBufferResourceRequest extends BaseResourceRequest {
    /**
     * This is the key of the resource to be used for the request. Resources are
     * defined in the pipeline.
     */
    key: string;
    /**
     * Once loaded into the texture, this will be populated revealing the
     * informaion needed to sample the image from the RenderTexture.
     */
    colorBuffer?: ColorBuffer;
    /** Set the type of this resource for categorization by resource managers */
    type: ResourceType.COLOR_BUFFER;
}
/**
 * Simple wrapper to make autocomplete easier for making an RenderTexture
 * request.
 */
export declare function colorBufferRequest(options: Omit<Partial<IColorBufferResourceRequest>, "type"> & Pick<IColorBufferResourceRequest, "key">): IColorBufferResourceRequest;
