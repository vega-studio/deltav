import * as Three from 'three';
import { IPoint } from '../../primitives/point';

/**
 * Defines a texture that is located on an atlas
 */
export class SubTexture {
  /** Stores the aspect ratio of the image for quick reference */
  aspectRatio: number = 1.0;
  /** Width in pixels of the image on the atlas */
  pixelWidth: number;
  /** Height in pixels of the image on the atlas */
  pixelHeight: number;
  /** The id of the atlas this texture is located on */
  atlasReferenceID: [string, number];
  /** This is the actual texture of the atlas this resource is located on */
  atlasTexture: Three.Texture;
  /** This is the top left UV coordinate of the sub texture on the atlas */
  atlasTL: IPoint;
  /** This is the top right UV coordinate of the sub texture on the atlas */
  atlasTR: IPoint;
  /** This is the bottom left UV coordinate of the sub texture on the atlas */
  atlasBL: IPoint;
  /** This is the bottom right UV coordinate of the sub texture on the atlas */
  atlasBR: IPoint;
}
