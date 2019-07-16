import { WebGLRenderer } from "../gl";
import { Instance } from "../instance-provider/instance";
import { ILayerProps, Layer } from "../surface/layer";
import { BaseIOExpansion } from "../surface/layer-processing/base-io-expansion";
import { InstanceIOValue, IResourceContext, IResourceType } from "../types";
import { BaseResourceManager } from "./base-resource-manager";
export declare class ResourceRouter {
    managers: Map<number, BaseResourceManager<any, any>>;
    resourceKeyToType: Map<string, number>;
    webGLRenderer?: WebGLRenderer;
    dequeueRequests(): Promise<boolean>;
    destroy(): void;
    destroyResource<T extends IResourceType>(resource: T & {
        key: string;
    }): Promise<void>;
    getIOExpansion(): BaseIOExpansion[];
    getManager(resourceType: number): BaseResourceManager<any, any>;
    getResourceType(resourceKey: string): number | undefined;
    initResource<T extends IResourceType>(resource: T & {
        key: string;
    }): Promise<void>;
    request<T extends Instance, U extends ILayerProps<T>, V extends IResourceType>(layer: Layer<T, U>, instance: Instance, resource: V, context?: IResourceContext): InstanceIOValue;
    setManager(resourceType: number, manager: BaseResourceManager<any, any>): void;
    setWebGLRenderer(renderer: WebGLRenderer): void;
    updateResource<T extends IResourceType>(resource: T & {
        key: string;
    }): Promise<void>;
}
