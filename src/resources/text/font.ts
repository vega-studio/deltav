import { IResourceType, ResourceType } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";

export interface IFontOptions extends IdentifyByKey, IResourceType {
  /** This resource must have it's type explcitly be set to a Font */
  type: ResourceType.FONT;
}

export class Font {

}
