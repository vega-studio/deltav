import { WebGLRenderer } from "../gl";
import { Instance } from "../instance-provider/instance";
import { ILayerProps, Layer } from "../surface/layer";
import { BaseIOExpansion } from "../surface/layer-processing/base-io-expansion";
import { InstanceIOValue, IResourceContext, IResourceType } from "../types";
import { BaseResourceManager } from "./base-resource-manager";
/**
 * This is the manager of all Resource Managers. This handles registering managers for various resource types
 * and delegates resource requests to the appropriate manager.
 */
export declare class ResourceRouter {
    /** This is the list of managers for handling resource requests */
    managers: Map<number, BaseResourceManager<any, any>>;
    /**
     * This tracks a resource's identifier to the type of resource it is. This allows for less information to be
     * required of Layer attributes by making the resource key the identifier of the resource.s
     */
    resourceKeyToType: Map<string, number>;
    /** This is the webgl renderer that is passed to the resource managers */
    webGLRenderer?: WebGLRenderer;
    /**
     * This is called by the system to cause the managers to dequeue their requests in an asynchronous fashion
     */
    dequeueRequests(): Promise<boolean>;
    /**
     * Destroys all managers managed by this manager.
     */
    destroy(): void;
    /**
     * This hands the destruction of a resource to the correct Resource Manager.
     */
    destroyResource<T extends IResourceType>(resource: T & {
        key: string;
    }): Promise<void>;
    /**
     * Retrieves the Shader IO Expansion controllers that may be provided by resource managers.
     */
    getIOExpansion(): BaseIOExpansion[];
    /**
     * Gets the manager for the provided resource type
     */
    getManager(resourceType: number): BaseResourceManager<any, any>;
    /**
     * Retrieves the resource type that a resource key is associated with. This is undefined if the key does
     * not exist.
     */
    getResourceType(resourceKey: string): number | undefined;
    /**
     * This hands the initialization of a resource to the correct Resource Manager.
     */
    initResource<T extends IResourceType>(resource: T & {
        key: string;
    }): Promise<void>;
    /**
     * This is called by layers to request resources being generated.
     */
    request<T extends Instance, U extends ILayerProps<T>, V extends IResourceType>(layer: Layer<T, U>, instance: Instance, resource: V, context?: IResourceContext): InstanceIOValue;
    /**
     * Triggers when the context we are rendering into has resized. This simply
     * passes the resize trigger down to the managers so they can adjust context
     * specific resources for the adjustment.
     */
    resize(): void;
    /**
     * Every resource type needs a manager associated with it so it can have requests processed. This
     * allows a manager to be set for a resource type.
     */
    setManager(resourceType: number, manager: BaseResourceManager<any, any>): void;
    /**
     * This sets the current gl renderer used for handling GL operations.
     */
    setWebGLRenderer(renderer: WebGLRenderer): void;
    /**
     * This hands the update of a resource to the correct Resource Manager.
     */
    updateResource<T extends IResourceType>(resource: T & {
        key: string;
    }): Promise<void>;
}
