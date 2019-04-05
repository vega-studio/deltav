import { Texture } from "../../gl/texture";
import { Bounds } from "../../primitives/bounds";
import { InstanceIOValue } from "../../types";
import { Vec2 } from "../../util/vector";

/**
 * Converts a SubTexture reference to a valid Instance IO value where:
 * [top left x, top left y, bottom right x, bottom right y]
 *
 * This also handles falsey texture values where invalid is a zero vector
 */
export function subTextureIOValue(
  texture?: SubTexture | null
): InstanceIOValue {
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
  /** The id of the texture this resource is located within */
  textureReferenceID: string = "";
  /** This is the actual texture this resource is located within */
  texture: Texture | null = null;
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

  /**
   * Generates a SubTexture object based on the texture and region provided.
   */
  static fromRegion(source: Texture, region: Bounds) {
    if (!source.data) return null;

    const ux = region.x / source.data.width;
    const uy = region.y / source.data.height;
    const uw = region.width / source.data.width;
    const uh = region.height / source.data.height;

    const atlasDimensions: Bounds = new Bounds({
      bottom: uy + uh,
      left: ux,
      right: ux + uw,
      top: uy
    });

    const bottom = atlasDimensions.bottom;
    const top = atlasDimensions.y;
    const left = atlasDimensions.x;
    const right = atlasDimensions.x + atlasDimensions.width;

    const sub = new SubTexture();
    sub.atlasTL = [left, top];
    sub.atlasBR = [right, bottom];
    sub.atlasBL = [left, bottom];
    sub.atlasTR = [right, top];

    return sub;
  }
}
