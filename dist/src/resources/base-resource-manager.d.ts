import { WebGLRenderer } from "../gl";
import { Instance } from "../instance-provider/instance";
import { ILayerProps, Layer } from "../surface/layer";
import { BaseIOExpansion } from "../surface/layer-processing/base-io-expansion";
import { InstanceIOValue, IResourceContext, IResourceInstanceAttribute, IResourceType } from "../types";
import { ResourceRouter } from "./resource-router";
export declare type BaseResourceOptions = IResourceType & {
    key: string;
};
export declare type BaseResourceRequest = IResourceType & {
    key: string;
};
export declare abstract class BaseResourceManager<T extends IResourceType, S extends BaseResourceRequest> {
    router: ResourceRouter;
    webGLRenderer?: WebGLRenderer;
    abstract dequeueRequests(): Promise<boolean>;
    abstract destroy(): void;
    abstract destroyResource(resource: BaseResourceOptions): void;
    getIOExpansion(): BaseIOExpansion[];
    abstract getResource(resourceKey: string): T | null;
    abstract initResource(resource: BaseResourceOptions): Promise<void>;
    abstract request<U extends Instance, V extends ILayerProps<U>>(layer: Layer<U, V>, instance: Instance, resourceRequest: S, context?: IResourceContext): InstanceIOValue;
    setAttributeContext(_attribute: IResourceInstanceAttribute<Instance>): void;
    abstract updateResource(resource: BaseResourceOptions): void;
}
export declare class InvalidResourceManager extends BaseResourceManager<IResourceType, BaseResourceRequest> {
    resources: Map<string, BaseResourceOptions>;
    dequeueRequests(): Promise<boolean>;
    destroy(): void;
    destroyResource(resourceKey: BaseResourceOptions): void;
    getResource(resourceKey: string): BaseResourceOptions;
    initResource(resource: BaseResourceOptions): Promise<void>;
    request<U extends Instance, V extends ILayerProps<U>>(_layer: Layer<U, V>, _instance: Instance, _resource: IResourceType): InstanceIOValue;
    updateResource(_resource: BaseResourceOptions): void;
}
export declare const INVALID_RESOURCE_MANAGER: InvalidResourceManager;
