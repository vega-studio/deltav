import { Texture } from "../../gl/texture";
import { Vec2 } from "../../util/vector";

/**
 * Defines a texture that is located on an atlas
 */
export class SubTexture {
  /** Stores the aspect ratio of the image for quick reference */
  aspectRatio: number = 1.0;
  /** The id of the atlas this texture is located on */
  atlasReferenceID: string = "";
  /** This is the actual texture of the atlas this resource is located on */
  atlasTexture: Texture | null = null;
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
