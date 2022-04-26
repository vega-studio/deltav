import { WebGLRenderer } from "../gl";
import { Instance } from "../instance-provider/instance";
import { ILayerProps, Layer } from "../surface/layer";
import { BaseIOExpansion } from "../surface/layer-processing/base-io-expansion";
import { InstanceIOValue, IResourceContext, IResourceInstanceAttribute, IResourceType } from "../types";
import { ResourceRouter } from "./resource-router";
/**
 * The Base Options for initializing a resource.
 */
export declare type BaseResourceOptions = IResourceType & {
    key: string;
};
/**
 * The base needs for making a resource request.
 */
export declare type BaseResourceRequest = IResourceType & {
    key: string;
};
/**
 * This represents a manager that is capable of handling requests for resources
 * that come from Layers that needs the resaource for updating it's Shader IO.
 */
export declare abstract class BaseResourceManager<T extends IResourceType, S extends BaseResourceRequest> {
    /**
     * Every resource manager will have access to the parent ResourceManager
     * system that pipes resources and requests to the proper location.
     */
    router: ResourceRouter;
    /**
     * Every resource manager will receive the utilized renderer so the manager
     * can perform basic GL tasks if needed
     */
    get webGLRenderer(): WebGLRenderer | undefined;
    set webGLRenderer(val: WebGLRenderer | undefined);
    _webGLRenderer?: WebGLRenderer;
    /**
     * This is called by the system for the manager to dequeue it's requests in an
     * asynchronous manner, thus allowing the system to have it's resources
     * changed and dequeued without hanging up the system.
     *
     * The manager will return true when resources have been dequeued and will
     * return false when nothing has been dequeued.
     *
     * If true was returned, this will trigger an additional draw operation to
     * immediately have the dequeue triggers take place and render to the screen.
     */
    abstract dequeueRequests(): Promise<boolean>;
    /**
     * This expects a resource manager to free all of it's resources it is hanging
     * onto.
     */
    abstract destroy(): void;
    /**
     * Indicates a resource needs to be freed or destroyed.
     */
    abstract destroyResource(resource: BaseResourceOptions): void;
    /**
     * Allows a resource manager to provide it's own IO Expansion to handle
     * special attributes the layer may have for handling.
     */
    getIOExpansion(): BaseIOExpansion[];
    /**
     * The method to access a resource initialized by this resource manager.
     */
    abstract getResource(resourceKey: string): T | null;
    /**
     * This is called to initialize a resource that the system has determined
     * needs to be constructed.
     */
    abstract initResource(resource: BaseResourceOptions): Promise<void>;
    /**
     * This will trigger a request of a resource to be generated. It will
     * immediately return either a value refelecting the resource is in a Pending
     * state (such as [0, 0, 0, 0]) or it will return metrics indicative of
     * expected resource's metrics, but will always be in InstanceIOValue format.
     */
    abstract request<U extends Instance, V extends ILayerProps<U>>(layer: Layer<U, V>, instance: Instance, resourceRequest: S, context?: IResourceContext): InstanceIOValue;
    /** This will be called when the system detects the renderer has been resized
     * */
    resize(): void;
    /**
     * This applies an attribute as the current context
     */
    setAttributeContext(_attribute: IResourceInstanceAttribute<Instance>): void;
    /**
     * This indicates the resource should be updated.
     */
    abstract updateResource(resource: BaseResourceOptions): void;
}
/**
 * This is a resource manager that implements all of the functionality but
 * returns invalid empty results. This allows the system to have requests for a
 * manager but prevent returning null or undefined states.
 */
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
