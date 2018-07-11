import { Label } from "../../primitives/label";
import { BaseAtlasResource } from "./base-atlas-resource";
export declare class LabelAtlasResource extends BaseAtlasResource {
    label: Label;
    truncatedText: string;
    constructor(label: Label);
}
