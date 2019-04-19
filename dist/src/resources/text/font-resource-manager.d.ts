import { Texture } from "../../gl";
import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { InstanceIOValue, IResourceContext, IResourceInstanceAttribute, Omit, ResourceType } from "../../types";
import { BaseResourceManager, BaseResourceOptions, BaseResourceRequest } from "../base-resource-manager";
import { IFontResourceOptions } from "./font-manager";
import { FontMap, KernedLayout } from "./font-map";
export declare enum FontResourceRequestFetch {
    TEXCOORDS = 0,
    IMAGE_SIZE = 1
}
export interface IFontResourceRequest extends BaseResourceRequest {
    character?: string;
    fetch?: FontResourceRequestFetch;
    fontMap?: FontMap;
    kerningPairs?: string;
    metrics?: {
        fontSize: number;
        layout?: KernedLayout;
        maxWidth?: number;
        text: string;
        truncation?: string;
        truncatedText?: string;
    };
    texture?: Texture;
    type: ResourceType.FONT;
}
export interface IFontResourceRequestInternal extends IFontResourceRequest {
    isRequested?: boolean;
}
export declare function fontRequest(options: Omit<IFontResourceRequest, "type">): IFontResourceRequest;
export declare class FontResourceManager extends BaseResourceManager<IFontResourceOptions, IFontResourceRequest> {
    private currentAttribute;
    private requestLookup;
    private requestQueue;
    private resourceLookup;
    private fontManager;
    dequeueRequests(): Promise<boolean>;
    destroy(): void;
    getResource(resourceKey: string): FontMap | null;
    getIOExpansion(): BaseIOExpansion[];
    initResource(options: BaseResourceOptions): Promise<void>;
    request<U extends Instance, V extends ILayerProps<U>>(layer: Layer<U, V>, instance: Instance, req: IFontResourceRequest, context?: IResourceContext): InstanceIOValue;
    setAttributeContext(attribute: IResourceInstanceAttribute<Instance>): void;
}
