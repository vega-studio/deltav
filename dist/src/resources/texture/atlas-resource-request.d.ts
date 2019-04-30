import { Omit, ResourceType } from "../../types";
import { BaseResourceRequest } from "../base-resource-manager";
import { SubTexture } from "./sub-texture";
export interface IAtlasResourceRequest extends BaseResourceRequest {
    disposeResource?: boolean;
    rasterizationScale?: number;
    source: string | TexImageSource;
    texture?: SubTexture;
    type: ResourceType.ATLAS;
}
export declare function atlasRequest(options: Omit<Partial<IAtlasResourceRequest>, "type">): IAtlasResourceRequest;
