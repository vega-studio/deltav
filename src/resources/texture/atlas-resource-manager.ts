import { Texture } from "../../gl/texture";
import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import {
  InstanceIOValue,
  IResourceContext,
  IResourceInstanceAttribute,
  ResourceType
} from "../../types";
import {
  BaseResourceManager,
  BaseResourceOptions
} from "../base-resource-manager";
import { Atlas, IAtlasResource, isAtlasResource } from "./atlas";
import { AtlasManager } from "./atlas-manager";
import { IAtlasResourceRequest } from "./atlas-resource-request";
import { subTextureIOValue } from "./sub-texture";
import { TextureIOExpansion } from "./texture-io-expansion";

export interface IAtlasResourceManagerOptions {
  /** This is the atlas manager that handles operations with our atlas' */
  atlasManager?: AtlasManager;
}

/**
 * This class is responsible for tracking resources requested to be placed on an Atlas.
 * This makes sure the resource is uploaded and then properly cached so similar requests
 * return already existing resources. This also manages instances waiting for the resource
 * to be made available.
 */
export class AtlasResourceManager extends BaseResourceManager<
  IAtlasResource,
  IAtlasResourceRequest
> {
  /** This is the resources generated by this manager */
  resources = new Map<string, Atlas>();
  /** This is the atlas manager that handles operations with our atlas' */
  atlasManager: AtlasManager;
  /** This is the atlas currently targetted by requests */
  targetAtlas: string = "";
  /** This stores all of the requests awaiting dequeueing */
  private requestQueue = new Map<string, IAtlasResourceRequest[]>();
  /**
   * This tracks if a resource is already in the request queue. This also stores ALL instances awaiting the resource.
   */
  private requestLookup = new Map<
    string,
    Map<IAtlasResourceRequest, [Layer<any, any>, Instance][]>
  >();

  constructor(options?: IAtlasResourceManagerOptions) {
    super();
    this.atlasManager = (options && options.atlasManager) || new AtlasManager();
  }

  /**
   * This dequeues all instance requests for a resource and processes the request which will
   * inevitably make the instance active
   */
  async dequeueRequests() {
    // This flag will be modified to reflect if a dequeue operation has occurred
    let didDequeue = false;

    const resourceRequestsWithKey: [string, IAtlasResourceRequest[]][] = [];

    this.requestQueue.forEach((requests, resourceKey) => {
      resourceRequestsWithKey.push([resourceKey, requests]);
    });

    this.requestQueue.clear();

    for (let i = 0, iMax = resourceRequestsWithKey.length; i < iMax; ++i) {
      const [targetAtlas, resources] = resourceRequestsWithKey[i];

      if (resources.length > 0) {
        // We did dequeue
        didDequeue = true;
        // Pull out all of the requests into a new array and empty the existing queue to allow the queue to register
        // New requests while this dequeue is being processed
        const requests = resources.slice(0);
        // Empty the queue to begin taking in new requests as needed
        resources.length = 0;
        // Tell the atlas manager to update with all of the requested resources
        await this.atlasManager.updateAtlas(targetAtlas, requests);
        // Get the requests for the given atlas
        const atlasRequests = this.requestLookup.get(targetAtlas);

        if (atlasRequests) {
          // Once the manager has been updated, we can now flag all of the instances waiting for the resources
          // As active, which should thus trigger an update to the layers to perform a diff for each instance
          requests.forEach(resource => {
            const request = atlasRequests.get(resource);
            atlasRequests.delete(resource);

            if (request) {
              for (let i = 0, iMax = request.length; i < iMax; ++i) {
                const [layer, instance] = request[i];
                // If the instance is still associated with buffer locations, then the instance can be activated. Having
                // A buffer location is indicative the instance has not been deleted.
                if (layer.managesInstance(instance)) {
                  // Make sure the instance is active
                  instance.active = true;
                }
              }

              // Do a delay to next frame before we do our resource trigger so we can see any lingering updates get
              // applied to the instance's rendering
              requestAnimationFrame(() => {
                for (let i = 0, iMax = request.length; i < iMax; ++i) {
                  const instance = request[i][1];
                  instance.resourceTrigger();
                }
              });
            }
          });
        }
      }
    }

    return didDequeue;
  }

  /**
   * Free ALL resources managed under this resource manager
   */
  destroy() {
    this.atlasManager.destroy();
  }

  /**
   * This retrieves the actual atlas texture that should be applied to a uniform's
   * value.
   */
  getAtlasTexture(key: string): Texture | null {
    const atlas = this.atlasManager.getAtlasTexture(key);

    if (atlas) {
      return atlas.texture;
    }

    return null;
  }

  /**
   * Get generated resources from this manager
   */
  getResource(resourceKey: string) {
    return this.resources.get(resourceKey) || null;
  }

  /**
   * Return the IO Expander necessary to handle the resurce type this manager is attempting to provide for layers.
   */
  getIOExpansion(): BaseIOExpansion[] {
    return [new TextureIOExpansion(ResourceType.ATLAS, this)];
  }

  /**
   * Initialize the atlas resources requested for construction
   */
  async initResource(resource: BaseResourceOptions) {
    if (isAtlasResource(resource)) {
      const atlas = await this.atlasManager.createAtlas(resource);
      this.resources.set(resource.key, atlas);
    }
  }

  /**
   * This is a request for atlas texture resources. It will produce either the coordinates needed to
   * make valid texture lookups, or it will trigger a loading of resources to an atlas and cause an
   * automated deactivation and reactivation of the instance.
   */
  request<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>,
    instance: Instance,
    resource: IAtlasResourceRequest,
    context?: IResourceContext
  ): InstanceIOValue {
    const resourceContext =
      this.targetAtlas || (context && context.resource.key) || "";
    const texture = resource.texture;

    // If the texture is ready and available, then we simply return the IO values
    if (texture) {
      return subTextureIOValue(texture);
    }

    // If a request is already made, then we must save the instance making the request for deactivation and
    // Reactivation but without any additional atlas loading
    let atlasRequests = this.requestLookup.get(resourceContext);

    if (atlasRequests) {
      const existingRequests = atlasRequests.get(resource);

      if (existingRequests) {
        existingRequests.push([layer, instance]);
        instance.active = false;

        return subTextureIOValue(texture);
      }
    } else {
      atlasRequests = new Map();
      this.requestLookup.set(resourceContext, atlasRequests);
    }

    // If the texture is not available, then we must load the resource, deactivate the instance
    // And wait for the resource to become available. Once the resource is available, the system
    // Must activate the instance to render the resource.
    instance.active = false;
    let requests = this.requestQueue.get(resourceContext);

    if (!requests) {
      requests = [];
      this.requestQueue.set(resourceContext, requests);
    }

    requests.push(resource);
    atlasRequests.set(resource, [[layer, instance]]);

    // This returns essentially returns blank values for the resource lookup
    return subTextureIOValue(texture);
  }

  /**
   * Sets the context attribute during attribute updates from the layers
   */
  setAttributeContext(attribute: IResourceInstanceAttribute<Instance>) {
    this.targetAtlas = attribute.resource.key;
  }
}
