import * as Three from 'three';
import { InstanceIOValue } from '../../types';
import { Instance } from '../../util/instance';
import { Layer } from '../layer';
import { AtlasManager, AtlasResource } from './atlas-manager';
import { SubTexture } from './sub-texture';

export interface IAtlasResourceManagerOptions {
  /** This is the atlas manager that handles operations with our atlas' */
  atlasManager: AtlasManager;
}

function toInstanceIOValue(texture?: SubTexture): InstanceIOValue {
  // If the texture is not defined we just output an empty reference
  if (!texture) {
    return [0, 0, 0, 0];
  }

  // Otherwise, we return the atlas information of the texture
  return [
    texture.atlasTL.x,
    texture.atlasTL.y,
    texture.atlasBR.x,
    texture.atlasBR.y,
  ];
}

/**
 * This class is responsible for tracking resources requested to be placed on an Atlas.
 * This makes sure the resource is uploaded and then properly cached so similar requests
 * return already existing resources. This also manages instances waiting for the resource
 * to be made available.
 */
export class AtlasResourceManager {
  /** This is the atlas manager that handles operations with our atlas' */
  atlasManager: AtlasManager;
  /** This is the atlas currently targetted by requests */
  targetAtlas: string = '';
  /** This stores all of the requests awaiting dequeueing */
  private requestQueue = new Map<string, AtlasResource[]>();
  /**
   * This tracks if a resource is already in the request queue. This also stores ALL instances awaiting the resource.
   */
  private requestLookup = new Map<string, Map<AtlasResource, [Layer<any, any, any>, Instance][]>>();

  constructor(options: IAtlasResourceManagerOptions) {
    this.atlasManager = options.atlasManager;
  }

  /**
   * This dequeues all instance requests for a resource and processes the request which will
   * inevitably make the instance active
   */
  async dequeueRequests() {
    // This flag will be modified to reflect if a dequeue operation has occurred
    let didDequeue = false;

    for (const [targetAtlas, resources] of Array.from(this.requestQueue.entries())) {
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

            if (request) {
              request.forEach(waiting => {
                const layer = waiting[0];
                const instance = waiting[1];

                // If the instance is still associated with a cluster, then the instance can be activated. Having
                // A cluster is indicative the instance has not been deleted.
                if (layer.uniformManager.getUniforms(instance)) {
                  instance.active = true;
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
   * This retrieves the actual atlas texture that should be applied to a uniform's
   * value.
   */
  getAtlasTexture(key: string): Three.Texture | null {
    const atlas = this.atlasManager.getAtlasTexture(key);

    if (atlas) {
      return atlas.texture;
    }

    return null;
  }

  /**
   * This is a request for atlas texture resources. It will produce either the coordinates needed to
   * make valid texture lookups, or it will trigger a loading of resources to an atlas and cause an
   * automated deactivation and reactivation of the instance.
   */
  request(layer: Layer<any, any, any>, instance: Instance, resource: AtlasResource): InstanceIOValue {
    const texture: SubTexture = resource.texture;

    // If the texture is ready and available, then we simply return the IO values
    if (texture) {
      return toInstanceIOValue(texture);
    }

    // If a request is already made, then we must save the instance making the request for deactivation and
    // Reactivation but without any additional atlas loading
    let atlasRequests = this.requestLookup.get(this.targetAtlas);

    if (atlasRequests) {
      const existingRequests = atlasRequests.get(resource);

      if (existingRequests) {
        existingRequests.push([layer, instance]);
        instance.active = false;

        return toInstanceIOValue(texture);
      }
    }

    else {
      atlasRequests = new Map();
      this.requestLookup.set(this.targetAtlas, atlasRequests);
    }

    // If the texture is not available, then we must load the resource, deactivate the instance
    // And wait for the resource to become available. Once the resource is available, the system
    // Must activate the instance to render the resource.
    instance.active = false;
    let requests = this.requestQueue.get(this.targetAtlas);

    if (!requests) {
      requests = [];
      this.requestQueue.set(this.targetAtlas, requests);
    }

    requests.push(resource);
    atlasRequests.set(resource, [[layer, instance]]);

    // This returns essentially returns blank values for the resource lookup
    return toInstanceIOValue(texture);
  }

  /**
   * This is used by the system to target the correct atlas for subsequent requests to a resource.
   */
  setTargetAtlas(target: string) {
    this.targetAtlas = target;
  }
}
