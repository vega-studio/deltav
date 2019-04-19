import { WebGLRenderer } from "../gl";
import { Instance } from "../instance-provider/instance";
import { ILayerProps, Layer } from "../surface/layer";
import { BaseIOExpansion } from "../surface/layer-processing/base-io-expansion";
import { InstanceIOValue, IResourceContext, IResourceInstanceAttribute, IResourceType } from "../types";
export declare type BaseResourceOptions = IResourceType & {
    key: string;
};
export declare type BaseResourceRequest = IResourceType;
export declare abstract class BaseResourceManager<T extends IResourceType, S extends BaseResourceRequest> {
    webGLRenderer?: WebGLRenderer;
    abstract initResource(resource: BaseResourceOptions): Promise<void>;
    abstract dequeueRequests(): Promise<boolean>;
    abstract destroy(): void;
    getIOExpansion(): BaseIOExpansion[];
    abstract getResource(resourceKey: string): T | null;
    abstract request<U extends Instance, V extends ILayerProps<U>>(layer: Layer<U, V>, instance: Instance, resourceRequest: S, context?: IResourceContext): InstanceIOValue;
    setAttributeContext(_attribute: IResourceInstanceAttribute<Instance>): void;
}
export declare class InvalidResourceManager extends BaseResourceManager<IResourceType, IResourceType> {
    resources: Map<string, BaseResourceOptions>;
    initResource(resource: BaseResourceOptions): Promise<void>;
    dequeueRequests(): Promise<boolean>;
    destroy(): void;
    getResource(resourceKey: string): BaseResourceOptions;
    request<U extends Instance, V extends ILayerProps<U>>(_layer: Layer<U, V>, _instance: Instance, _resource: IResourceType): InstanceIOValue;
}
export declare const INVALID_RESOURCE_MANAGER: InvalidResourceManager;
