import { Texture, TextureOptions } from "../../gl/texture";
import { AtlasSize, Omit, ResourceType } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";
import { BaseResourceOptions } from "../base-resource-manager";
import { IAtlasResourceRequest } from "./atlas-resource-request";
import { PackNode } from "./pack-node";
import { SubTexture } from "./sub-texture";
export interface IAtlasResource extends BaseResourceOptions {
    type: ResourceType.ATLAS;
    height: AtlasSize;
    width: AtlasSize;
    textureSettings?: TextureOptions;
}
export declare function createAtlas(options: Omit<IAtlasResource, "type">): IAtlasResource;
export declare function isAtlasResource(val: BaseResourceOptions): val is Atlas;
declare type ResourceReference = {
    subtexture: SubTexture;
    count: number;
};
export declare class Atlas extends IdentifyByKey implements IAtlasResource {
    height: AtlasSize;
    packing: PackNode<SubTexture>;
    resourceReferences: Map<string | ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, ResourceReference>;
    texture: Texture;
    textureSettings?: TextureOptions;
    type: number;
    validResources: Set<IAtlasResourceRequest>;
    width: AtlasSize;
    constructor(options: IAtlasResource);
    private invalidateTexture;
    private createTexture;
    destroy(): void;
    useResource(request: IAtlasResourceRequest): void;
    stopUsingResource(request: IAtlasResourceRequest): void;
    resolveResources(): void;
}
export {};
