import { IResourceType, ResourceType } from "../../types";
import { BaseResourceRequest } from "../base-resource-manager";
import { SubTexture } from "./sub-texture";

/**
 * Validates a resource option or object is indeed an atlas resource
 */
export function isAtlasResource(
  val: IResourceType
): val is BaseAtlasResourceRequest {
  return val && val.type === ResourceType.ATLAS;
}

/**
 * Base information an atlas resource can provide
 */
export class BaseAtlasResourceRequest implements BaseResourceRequest {
  /** Set the type of this resource for categorization by resource managers */
  type: number = ResourceType.ATLAS;
  /** The rasterization metrics of the label */
  rasterization: {
    /**
     * WARNING: This will ONLY SOMETIMES be populated. The system can choose
     * when to consume this as it chooses as it can be a major memory eater if
     * permanently left in place. DO NOT RELY on this being available.
     */
    canvas?: HTMLCanvasElement;
    image?: HTMLImageElement;
    /** The rasterization dimensions as it is rendered to texture space on an atlas */
    texture: {
      height: number;
      width: number;
    };
    /** The rasterization dimensions as it would be rendered in world space */
    world: {
      height: number;
      width: number;
    };
  };
  /**
   * This sets the ratserization to be a larger value on the texture than is rendered within
   * the world space. This allows for techniques to be applied in the shaders to incorporate super sampling
   * or other processes which require higher levels of resolution.
   *
   * The default is 1 for a 1 to 1 sample scaling to world space rendering
   */
  sampleScale: number = 1;
  /** Once loaded into the texture, this will be populated */
  texture: SubTexture;
}
