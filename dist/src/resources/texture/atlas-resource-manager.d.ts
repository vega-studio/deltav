import { Texture } from "../../gl/texture";
import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { InstanceIOValue, IResourceContext } from "../../types";
import { BaseResourceManager, BaseResourceOptions } from "../base-resource-manager";
import { Atlas, IAtlasResource } from "./atlas";
import { AtlasManager } from "./atlas-manager";
import { IAtlasResourceRequest } from "./atlas-resource-request";
export interface IAtlasResourceManagerOptions {
    atlasManager?: AtlasManager;
}
export declare class AtlasResourceManager extends BaseResourceManager<IAtlasResource, IAtlasResourceRequest> {
    resources: Map<string, Atlas>;
    atlasManager: AtlasManager;
    private requestQueue;
    private requestLookup;
    constructor(options?: IAtlasResourceManagerOptions);
    dequeueRequests(): Promise<boolean>;
    destroy(): void;
    destroyResource(init: BaseResourceOptions): void;
    getAtlasTexture(key: string): Texture | null;
    getResource(resourceKey: string): Atlas | null;
    getIOExpansion(): BaseIOExpansion[];
    initResource(resource: BaseResourceOptions): Promise<void>;
    request<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, instance: Instance, request: IAtlasResourceRequest, _context?: IResourceContext): InstanceIOValue;
    updateResource(options: BaseResourceOptions): void;
}
