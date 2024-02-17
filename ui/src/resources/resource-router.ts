import { BaseIOExpansion } from "../surface/layer-processing/base-io-expansion";
import {
  BaseResourceManager,
  INVALID_RESOURCE_MANAGER,
} from "./base-resource-manager";
import { ILayerProps, Layer } from "../surface/layer";
import { Instance } from "../instance-provider/instance";
import { InstanceIOValue, IResourceContext, IResourceType } from "../types";
import { WebGLRenderer } from "../gl";

import Debug from "debug";

const debug = Debug("performance");

/**
 * This is the manager of all Resource Managers. This handles registering managers for various resource types
 * and delegates resource requests to the appropriate manager.
 */
export class ResourceRouter {
  /** This is the list of managers for handling resource requests */
  managers = new Map<number, BaseResourceManager<any, any>>();
  /**
   * This tracks a resource's identifier to the type of resource it is. This allows for less information to be
   * required of Layer attributes by making the resource key the identifier of the resource.s
   */
  resourceKeyToType = new Map<string, number>();
  /** This is the webgl renderer that is passed to the resource managers */
  webGLRenderer?: WebGLRenderer;

  /**
   * This is called by the system to cause the managers to dequeue their requests in an asynchronous fashion
   */
  async dequeueRequests() {
    let didUpdate = false;
    const managers = Array.from(this.managers.values());

    for (let i = 0, iMax = managers.length; i < iMax; ++i) {
      const manager = managers[i];
      const update = await manager.dequeueRequests();
      didUpdate = didUpdate || update;
    }

    return didUpdate;
  }

  /**
   * Destroys all managers managed by this manager.
   */
  destroy() {
    this.managers.forEach((manager) => manager.destroy());
    this.resourceKeyToType.clear();
    this.managers.clear();
    delete this.webGLRenderer;
  }

  /**
   * This hands the destruction of a resource to the correct Resource Manager.
   */
  async destroyResource<T extends IResourceType>(
    resource: T & { key: string }
  ) {
    const manager = this.managers.get(resource.type);

    if (!manager) {
      console.warn(
        `A Resource is trying to be destroyed but has no manager to facilitate the operation: ${resource.type}`
      );

      return;
    }

    // Clear the key of the resource from it's registered type
    this.resourceKeyToType.delete(resource.key);

    return await manager.destroyResource(resource);
  }

  /**
   * Retrieves the Shader IO Expansion controllers that may be provided by resource managers.
   */
  getIOExpansion() {
    let all: BaseIOExpansion[] = [];

    this.managers.forEach((manager) => {
      all = all.concat(manager.getIOExpansion());
    });

    return all;
  }

  /**
   * Gets the manager for the provided resource type
   */
  getManager(resourceType: number): BaseResourceManager<any, any> {
    const manager = this.managers.get(resourceType);

    if (!manager) {
      console.warn(
        `A manager was requested that does not exist for type ${resourceType}`
      );
      return INVALID_RESOURCE_MANAGER;
    }

    return manager;
  }

  /**
   * Retrieves the resource type that a resource key is associated with. This is undefined if the key does
   * not exist.
   */
  getResourceType(resourceKey: string): number | undefined {
    return this.resourceKeyToType.get(resourceKey);
  }

  /**
   * This hands the initialization of a resource to the correct Resource Manager.
   */
  async initResource<T extends IResourceType>(resource: T & { key: string }) {
    const manager = this.managers.get(resource.type);

    if (!manager) {
      console.warn(
        `A Resource is trying to be created but has no manager to facilitate the operation: ${resource.type}`
      );

      return;
    }

    if (this.resourceKeyToType.has(resource.key)) {
      console.warn(
        "Detected two resources with identical keys. The duplicate resource will not be generated:",
        resource.key
      );

      return;
    }

    // Store the key of the resource to the type it is.
    this.resourceKeyToType.set(resource.key, resource.type);

    return await manager.initResource(resource);
  }

  /**
   * This is called by layers to request resources being generated.
   */
  request<
    TInstance extends Instance,
    TLayer extends Layer<TInstance, TLayerProps>,
    TLayerProps extends ILayerProps<TInstance> = TLayer["props"],
    TResourceType extends IResourceType = IResourceType,
  >(
    layer: TLayer,
    instance: TInstance,
    resource: TResourceType,
    context?: IResourceContext
  ): InstanceIOValue {
    const manager = this.managers.get(resource.type);

    if (!manager) {
      console.warn(
        `A Layer is requesting a resource for which there is no manager set. Please make sure a Resource Manager is set for resource of type: ${resource.type}`
      );
      return [-1, -1, -1, -1];
    }

    return manager.request(layer, instance, resource, context);
  }

  /**
   * Triggers when the context we are rendering into has resized. This simply
   * passes the resize trigger down to the managers so they can adjust context
   * specific resources for the adjustment.
   */
  resize() {
    this.managers.forEach((manager) => manager.resize());
  }

  /**
   * Every resource type needs a manager associated with it so it can have requests processed. This
   * allows a manager to be set for a resource type.
   */
  setManager(resourceType: number, manager: BaseResourceManager<any, any>) {
    const currentManager = this.managers.get(resourceType);

    if (currentManager) {
      debug(
        `A manager was assigned to a resource type: ${resourceType} that overrides another manager already set to that type.`
      );
    }

    manager.router = this;
    this.managers.set(resourceType, manager);
    manager.webGLRenderer = this.webGLRenderer;
  }

  /**
   * This sets the current gl renderer used for handling GL operations.
   */
  setWebGLRenderer(renderer: WebGLRenderer) {
    this.webGLRenderer = renderer;
    this.managers.forEach((manager) => (manager.webGLRenderer = renderer));
  }

  /**
   * This hands the update of a resource to the correct Resource Manager.
   */
  async updateResource<T extends IResourceType>(resource: T & { key: string }) {
    const manager = this.managers.get(resource.type);

    if (!manager) {
      console.warn(
        `A Resource is trying to be updated but has no manager to facilitate the operation: ${resource.type}`
      );

      return;
    }

    return await manager.updateResource(resource);
  }
}

/** This is a base resource router that is not actually managed in any way */
export const DEFAULT_RESOURCE_ROUTER = new ResourceRouter();
