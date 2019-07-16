import { Texture, TextureOptions } from "../../gl/texture";
import { Omit, ResourceType, TextureSize } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";
import { BaseResourceOptions } from "../base-resource-manager";
import { IAtlasResourceRequest } from "./atlas-resource-request";
import { PackNode } from "./pack-node";
import { SubTexture } from "./sub-texture";
import { VideoTextureMonitor } from "./video-texture-monitor";
export interface IAtlasResource extends BaseResourceOptions {
    type: ResourceType.ATLAS;
    height: TextureSize;
    width: TextureSize;
    textureSettings?: TextureOptions;
}
export declare function createAtlas(options: Omit<IAtlasResource, "type" | "key"> & Partial<Pick<IAtlasResource, "key">>): IAtlasResource;
export declare function isAtlasResource(val: BaseResourceOptions): val is Atlas;
declare type ResourceReference = {
    subtexture: SubTexture;
    count: number;
    videoMonitor?: VideoTextureMonitor;
};
export declare class Atlas extends IdentifyByKey implements IAtlasResource {
    height: TextureSize;
    packing: PackNode<SubTexture>;
    resourceReferences: Map<import("./atlas-resource-request").AtlasResource, ResourceReference>;
    texture: Texture;
    textureSettings?: TextureOptions;
    type: number;
    width: TextureSize;
    constructor(options: IAtlasResource);
    private createTexture;
    destroy(): void;
    private invalidateTexture;
    resolveResources(): void;
    stopUsingResource(request: IAtlasResourceRequest): void;
    useResource(request: IAtlasResourceRequest): void;
}
export {};
