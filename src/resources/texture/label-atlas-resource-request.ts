import { Label } from "../../primitives/label";
import { BaseAtlasResourceRequest } from "./base-atlas-resource-request";

export class LabelAtlasResourceRequest extends BaseAtlasResourceRequest {
  /** This is the label to be loaded into the atlas */
  label: Label;
  /** If the label renders */
  truncatedText: string;

  constructor(label: Label) {
    super();
    this.label = label;
  }
}
