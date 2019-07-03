import { Omit, ResourceType } from "../../types";
import { BaseResourceRequest } from "../base-resource-manager";
import { SubTexture } from "./sub-texture";
export declare type AtlasVideoResource = {
    videoSrc: string;
};
export declare type AtlasResource = string | TexImageSource;
export interface IAtlasResourceRequest extends BaseResourceRequest {
    disposeResource?: boolean;
    key: string;
    rasterizationScale?: number;
    source: AtlasResource;
    texture?: SubTexture;
    type: ResourceType.ATLAS;
}
export declare function atlasRequest(options: Omit<Partial<IAtlasResourceRequest>, "type"> & Pick<IAtlasResourceRequest, "key">): IAtlasResourceRequest;
