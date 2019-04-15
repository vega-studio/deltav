import { Color } from "../../primitives/color";
import { BaseAtlasResourceRequest } from "./base-atlas-resource-request";

export class ColorAtlasResourceRequest extends BaseAtlasResourceRequest {
  /** This is the color to be loaded into the atlas */
  color: Color;

  constructor(color: Color) {
    super();
    this.color = color;
  }
}
