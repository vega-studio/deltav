import * as Three from "three";
import { InstanceIOValue } from "../../types";
import { Vec2 } from "../../util/vector";

/**
 * Converts a SubTexture reference to a valid Instance IO value where:
 * [top left x, top left y, bottom right x, bottom right y]
 *
 * This also handles falsey texture values where invalid is a zero vector
 */
export function subTextureIOValue(texture?: SubTexture): InstanceIOValue {
  // If the texture is not defined we just output an empty reference
  if (!texture) {
    return [0, 0, 0, 0];
  }

  // Otherwise, we return the atlas information of the texture
  return [
    texture.atlasTL[0],
    texture.atlasTL[1],
    texture.atlasBR[0],
    texture.atlasBR[1]
  ];
}

/**
 * Defines a texture that is located on an atlas
 */
export class SubTexture {
  /** Stores the aspect ratio of the image for quick reference */
  aspectRatio: number = 1.0;
  /** The id of the atlas this texture is located on */
  atlasReferenceID: string = "";
  /** This is the actual texture of the atlas this resource is located on */
  atlasTexture: Three.Texture | null = null;
  /** This is the top left UV coordinate of the sub texture on the atlas */
  atlasTL: Vec2 = [0, 0];
  /** This is the top right UV coordinate of the sub texture on the atlas */
  atlasTR: Vec2 = [0, 0];
  /** This is the bottom left UV coordinate of the sub texture on the atlas */
  atlasBL: Vec2 = [0, 0];
  /** This is the bottom right UV coordinate of the sub texture on the atlas */
  atlasBR: Vec2 = [0, 0];
  /** This is the normalized width of the sub texture on the atlas */
  widthOnAtlas: number = 0;
  /** This is the normalized height of the sub texture on the atlas */
  heightOnAtlas: number = 0;
  /** This flag is set to false when the underlying texture is no longer valid */
  isValid: boolean = false;
  /** Width in pixels of the image on the atlas */
  pixelWidth: number = 0;
  /** Height in pixels of the image on the atlas */
  pixelHeight: number = 0;
}
