import { Label } from '../../primitives/label';
import { SubTexture } from './sub-texture';

export class LabelAtlasResource {
  /** This is the label to be loaded into the atlas */
  label: Label;
  /** Once loaded into the texture, this will be populated */
  texture: SubTexture;

  constructor(label: Label) {
    this.label = label;
  }
}
