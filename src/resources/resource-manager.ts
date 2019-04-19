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
import {
  BaseResourceManager,
  INVALID_RESOURCE_MANAGER
} from "./base-resource-manager";

const debug = require("debug")("performance");

/**
 * This is the manager of all Resource Managers. This handles registering managers for various resource types
 * and delegates resource requests to the appropriate manager.
 */
export class ResourceManager {
  /** This is the list of managers for handling resource requests */
  managers = new Map<number, BaseResourceManager<any, any>>();
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
    this.managers.forEach(manager => manager.destroy());
  }

  /**
   * Retrieves the Shader IO Expansion controllers that may be provided by resource managers.
   */
  getIOExpansion() {
    let all: BaseIOExpansion[] = [];

    this.managers.forEach(manager => {
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
   * This hands the initialization of a resource to the correct Resource Manager.
   */
  async initResource<T extends IResourceType>(resource: T & { key: string }) {
    const manager = this.managers.get(resource.type);

    if (!manager) {
      console.warn(
        `A Resource is trying to be created but has no manager to facilitate the operation: ${
          resource.type
        }`
      );

      return;
    }

    return await manager.initResource(resource);
  }

  /**
   * This is called by layers to request resources being generated.
   */
  request<
    T extends Instance,
    U extends ILayerProps<T>,
    V extends IResourceType
  >(
    layer: Layer<T, U>,
    instance: Instance,
    resource: V,
    context?: IResourceContext
  ): InstanceIOValue {
    const manager = this.managers.get(resource.type);

    if (!manager) {
      console.warn(
        `A Layer is requesting a resource for which there is no manager set. Please make sure a Resource Manager is set for resource of type: ${
          resource.type
        }`
      );
      return [-1, -1, -1, -1];
    }

    return manager.request(layer, instance, resource, context);
  }

  /**
   * This places an attribute as the current context for the managers to operate within.
   * This will cause the attributes requested resource (if existing) to set the attribute
   * as it's current context while performing tasks.
   */
  setAttributeContext(
    attribute: IResourceInstanceAttribute<Instance>,
    resourceType: number
  ) {
    (
      this.managers.get(resourceType) || INVALID_RESOURCE_MANAGER
    ).setAttributeContext(attribute);
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

    this.managers.set(resourceType, manager);
    manager.webGLRenderer = this.webGLRenderer;
  }

  /**
   * This sets the current gl renderer used for handling GL operations.
   */
  setWebGLRenderer(renderer: WebGLRenderer) {
    this.webGLRenderer = renderer;
    this.managers.forEach(manager => (manager.webGLRenderer = renderer));
  }
}
