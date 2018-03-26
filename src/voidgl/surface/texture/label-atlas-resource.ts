import { Label } from '../../primitives/label';
import { BaseAtlasResource } from './base-atlas-resource';

export class LabelAtlasResource extends BaseAtlasResource {
  /** This is the label to be loaded into the atlas */
  label: Label;

  constructor(label: Label) {
    super();
    this.label = label;
  }
}
