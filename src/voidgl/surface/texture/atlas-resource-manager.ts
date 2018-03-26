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
  /** This stores all of the requests awaiting queue */
  requestQueue: [Layer<any, any, any>, Instance, AtlasResource][] = [];

  constructor(options: IAtlasResourceManagerOptions) {
    this.atlasManager = options.atlasManager;
  }

  /**
   * This dequeues all instance requests for a resource and processes the request which will
   * inevitably make the instance active
   */
  async dequeueRequests() {
    if (this.requestQueue.length) {
      // Pull out all of the requests into a new array and empty the existing queue to allow the queue to register
      // New requests while this dequeue is being processed
      const requests = this.requestQueue.slice(0);
      // Empty the queue to begin taking in new requests as needed
      this.requestQueue = [];

      // Tell the atlas manager to update with all of the requested resources
      await this.atlasManager.updateAtlas(this.targetAtlas, requests.map(request => request[2]));

      // Once the manager has been updated, we can now flag all of the instances waiting for the resources
      // As active, which should thus trigger an update to the layers to perform a diff for each instance
      requests.forEach(request => {
        const layer = request[0];
        const instance = request[1];

        // If the instance is still associated with a cluster, then the instance can be activated. Having
        // A cluster is indicative the instance has not been deleted.
        if (layer.uniformManager.getUniforms(instance)) {
          request[1].active = true;
        }
      });
    }
  }

  /**
   * This retrieves the actual atlas texture that should be applied to a uniform's
   * value.
   */
  getAtlasTexture(key: string): Three.Texture {
    const atlas = this.atlasManager.getAtlasTexture(key);

    if (atlas) {
      return atlas.texture;
    }

    return null;
  }

  /**
   * This is a request for resources
   */
  request(layer: Layer<any, any, any>, instance: Instance, resource: AtlasResource): InstanceIOValue {
    const texture: SubTexture = resource.texture;

    // If the texture is ready and available, then we return the needed IO values
    if (texture) {
      return toInstanceIOValue(texture);
    }

    // If the texture is not available, then we must load the resource, deactivate the instance
    // And wait for the resource to become available. Once the resource is available, the system
    // Must activate the instance to render the resource.
    instance.active = false;
    this.requestQueue.push([layer, instance, resource]);

    return toInstanceIOValue(texture);
  }

  /**
   * This is used by the system to target the correct atlas for subsequent requests to a resource.
   */
  setTargetAtlas(target: string) {
    this.targetAtlas = target;
  }
}
