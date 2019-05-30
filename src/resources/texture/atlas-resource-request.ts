import { Omit, ResourceType } from "../../types";
import { BaseResourceRequest } from "../base-resource-manager";
import { SubTexture } from "./sub-texture";

/**
 * Base information an atlas resource can provide
 */
export interface IAtlasResourceRequest extends BaseResourceRequest {
  /**
   * When this is set in conjunction with the resource requested, this will cause the resource to be
   * removed from the resource manager, thus allowing the resource's space to be used at a later
   * time.
   */
  disposeResource?: boolean;
  /**
   * This is the key of the resource to be used for the request. Resources are defined in the pipeline.
   */
  key: string;
  /**
   * This scales the image to be rendered to the texture. A value of 1 means the image will be
   * rendered full size to the texture. A value of .5 means it will be rendered half size to
   * the texture.
   */
  rasterizationScale?: number;
  /** This is the requested resource to be loaded into the manager system */
  source: string | TexImageSource;
  /**
   * Once loaded into the texture, this will be populated revealing the informaion needed to sample the image
   * from the atlas.
   */
  texture?: SubTexture;
  /** Set the type of this resource for categorization by resource managers */
  type: ResourceType.ATLAS;
}

/**
 * Simple wrapper to make autocomplete easier for making an atlas request.
 */
export function atlasRequest(
  options: Omit<Partial<IAtlasResourceRequest>, "type"> &
    Pick<IAtlasResourceRequest, "key">
): IAtlasResourceRequest {
  return {
    type: ResourceType.ATLAS,
    source: "",
    ...options
  };
}
