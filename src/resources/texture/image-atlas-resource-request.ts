import { Image } from "../../primitives/image";
import { BaseAtlasResourceRequest } from "./base-atlas-resource-request";

export class ImageAtlasResourceRequest extends BaseAtlasResourceRequest {
  /** This is the image to be loaded into the atlas */
  image: Image;

  constructor(image: Image) {
    super();
    this.image = image;
  }
}
