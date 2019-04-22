import { WebGLRenderer } from "../gl";
import { Instance } from "../instance-provider/instance";
import { ILayerProps, Layer } from "../surface/layer";
import { BaseIOExpansion } from "../surface/layer-processing/base-io-expansion";
import {
  InstanceIOValue,
  IResourceContext,
  IResourceInstanceAttribute,
  IResourceType
} from "../types";

/**
 * The Base Options for initializing a resource.
 */
export type BaseResourceOptions = IResourceType & { key: string };

/**
 * The base needs for making a resource request.
 */
export type BaseResourceRequest = IResourceType;

/**
 * This represents a manager that is capable of handling requests for resources that come from Layers
 * that needs the resaource for updating it's Shader IO.
 */
export abstract class BaseResourceManager<
  T extends IResourceType,
  S extends BaseResourceRequest
> {
  /** Every resource manager will receive the utilized renderer so the manager can perform basic GL tasks if needed */
  webGLRenderer?: WebGLRenderer;

  /**
   * This is called to initialize a resource that the system has determined needs to be constructed.
   */
  abstract async initResource(resource: BaseResourceOptions): Promise<void>;

  /**
   * This is called by the system for the manager to dequeue it's requests in an asynchronous
   * manner, thus allowing the system to have it's resources changed and dequeued without hanging up
   * the system.
   */
  abstract async dequeueRequests(): Promise<boolean>;

  /**
   * This expects a resource manager to free all of it's resources it is hanging onto.
   */
  abstract destroy(): void;

  /**
   * Allows a resource manager to provide it's own IO Expansion to handle special attributes
   * the layer may have for handling.
   */
  getIOExpansion(): BaseIOExpansion[] {
    return [];
  }

  /**
   * The method to access a resource initialized by this resource manager.
   */
  abstract getResource(resourceKey: string): T | null;

  /**
   * This will trigger a request of a resource to be generated. It will immediately return either a
   * value refelecting the resource is in a Pending state (such as [0, 0, 0, 0]) or it will return
   * metrics indicative of expected resource's metrics, but will always be in InstanceIOValue format.
   */
  abstract request<U extends Instance, V extends ILayerProps<U>>(
    layer: Layer<U, V>,
    instance: Instance,
    resourceRequest: S,
    context?: IResourceContext
  ): InstanceIOValue;

  /**
   * This applies an attribute as the current context
   */
  setAttributeContext(_attribute: IResourceInstanceAttribute<Instance>) {
    // Implemented by sub classes if needed
  }
}

/**
 * This is a resource manager that implements all of the functionality but returns
 * invalid empty results. This allows the system to have requests for a manager but
 * prevent returning null or undefined states.
 */
export class InvalidResourceManager extends BaseResourceManager<
  IResourceType,
  IResourceType
> {
  resources = new Map<string, BaseResourceOptions>();

  async initResource(resource: BaseResourceOptions) {
    this.resources.set(resource.key, resource);
  }

  async dequeueRequests() {
    return false;
  }

  destroy() {
    return;
  }

  getResource(resourceKey: string) {
    return this.resources.get(resourceKey) || { key: "", type: -1 };
  }

  request<U extends Instance, V extends ILayerProps<U>>(
    _layer: Layer<U, V>,
    _instance: Instance,
    _resource: IResourceType
  ): InstanceIOValue {
    return [0, 0, 0, 0];
  }
}

export const INVALID_RESOURCE_MANAGER = new InvalidResourceManager();