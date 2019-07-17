import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { InstanceIOValue, IResourceContext, IResourceInstanceAttribute, Omit } from "../../types";
import { BaseResourceManager, BaseResourceOptions } from "../base-resource-manager";
import { IFontResourceOptions } from "./font-manager";
import { FontMap } from "./font-map";
import { IFontResourceRequest } from "./font-resource-request";
export interface IFontResourceRequestInternal extends IFontResourceRequest {
    isRequested?: boolean;
}
export declare function fontRequest(options: Omit<IFontResourceRequest, "type">): IFontResourceRequest;
export declare class FontResourceManager extends BaseResourceManager<IFontResourceOptions, IFontResourceRequest> {
    currentAttribute: IResourceInstanceAttribute<Instance>;
    private requestLookup;
    private requestQueue;
    private resourceLookup;
    private fontManager;
    dequeueRequests(): Promise<boolean>;
    destroy(): void;
    destroyResource(init: BaseResourceOptions): void;
    getResource(resourceKey: string): FontMap | null;
    getIOExpansion(): BaseIOExpansion[];
    initResource(options: BaseResourceOptions): Promise<void>;
    request<U extends Instance, V extends ILayerProps<U>>(layer: Layer<U, V>, instance: Instance, req: IFontResourceRequest, _context?: IResourceContext): InstanceIOValue;
    updateResource(options: BaseResourceOptions): void;
}
