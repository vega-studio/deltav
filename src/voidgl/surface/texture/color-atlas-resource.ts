import { Color } from '../../primitives/color';
import { SubTexture } from './sub-texture';

export class ColorAtlasResource {
  /** This is the label to be loaded into the atlas */
  color: Color;
  /** Once loaded into the texture, this will be populated */
  texture: SubTexture;

  constructor(color: Color) {
    this.color = color;
  }
}
