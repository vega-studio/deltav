import { Instance } from "../../instance-provider/instance";
import {
  SubTexture,
  subTextureIOValue
} from "../../resources/texture/sub-texture";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import {
  InstanceIOValue,
  IResourceContext,
  IResourceInstanceAttribute,
  Omit,
  ResourceType
} from "../../types";
import { nextFrame, shallowEqual } from "../../util";
import {
  BaseResourceManager,
  BaseResourceOptions
} from "../base-resource-manager";
import { TextureIOExpansion } from "../texture/texture-io-expansion";
import {
  FontManager,
  IFontResourceOptions,
  isFontResource
} from "./font-manager";
import { FontMap } from "./font-map";
import {
  FontResourceRequestFetch,
  IFontResourceRequest
} from "./font-resource-request";

const debug = require("debug")("performance");

export interface IFontResourceRequestInternal extends IFontResourceRequest {
  /**
   * This is used to flag a request object as requested so that the same request object can be used for
   * similar resources without generating two request lifecycles.
   */
  isRequested?: boolean;
}

/**
 * Wrapper method to create a font resource request to make typings and intellisense work better.
 */
export function fontRequest(
  options: Omit<IFontResourceRequest, "type">
): IFontResourceRequest {
  return {
    type: ResourceType.FONT,
    ...options
  };
}

/**
 * This manager controls and manages Font type resources that are requested for generation. This manager
 * will utilize the request given to it to provide the best possible solution in both load times and
 * run time performance available to the manager.
 *
 * This manager will have the ability to handle resources
 */
export class FontResourceManager extends BaseResourceManager<
  IFontResourceOptions,
  IFontResourceRequest
> {
  /** The current attribute that is making request calls */
  currentAttribute: IResourceInstanceAttribute<Instance>;
  /**
   * This tracks if a resource is already in the request queue. This also stores ALL instances awaiting the resource.
   */
  private requestLookup = new Map<
    string,
    Map<IFontResourceRequest, [Layer<any, any>, Instance][]>
  >();

  /** This stores all of the requests awaiting dequeueing */
  private requestQueue = new Map<string, IFontResourceRequest[]>();
  /** This is the lookup for generated font map resources */
  private resourceLookup = new Map<string, FontMap>();
  /** This is the manager that is used to create and update font resources */
  private fontManager = new FontManager();

  /**
   * This is so the system can control when requests are made so this manager has the opportunity
   * to verify and generate the resources the request requires.
   */
  async dequeueRequests(): Promise<boolean> {
    // This flag will be modified to reflect if a dequeue operation has occurred
    let didDequeue = false;
    const resourceRequestsWithKey: [string, IFontResourceRequest[]][] = [];

    this.requestQueue.forEach((requests, resourceKey) => {
      resourceRequestsWithKey.push([resourceKey, requests]);
    });

    this.requestQueue.clear();

    // Loop through all requests paired with their resource key context
    for (let i = 0, iMax = resourceRequestsWithKey.length; i < iMax; ++i) {
      const [fontResource, allRequests] = resourceRequestsWithKey[i];

      if (allRequests.length > 0) {
        // We did dequeue
        didDequeue = true;
        // Pull out all of the requests into a new array and empty the existing queue to allow the queue to register
        // New requests while this dequeue is being processed
        const requests = allRequests.slice(0);
        // Empty the queue to begin taking in new requests as needed
        allRequests.length = 0;

        debug("Processing requests for resource '%s'", fontResource);

        // Tell the font manager to update with all of the requested resources
        await this.fontManager.updateFontMap(fontResource, requests);
        // Tell the manager to process all of the metrics requests for the text
        await this.fontManager.calculateMetrics(fontResource, requests);
        // Get the requests for the given font
        const glyphRequests = this.requestLookup.get(fontResource);

        if (glyphRequests) {
          // Once the manager has been updated, we can now flag all of the instances waiting for the resources
          // As active, which should thus trigger an update to the layers to perform a diff for each instance
          requests.forEach(resource => {
            const request = glyphRequests.get(resource);
            glyphRequests.delete(resource);

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
              nextFrame(() => {
                const triggered = new Set();

                for (let i = 0, iMax = request.length; i < iMax; ++i) {
                  const instance = request[i][1];

                  if (!triggered.has(instance)) {
                    triggered.add(instance);
                    instance.resourceTrigger();
                  }
                }
              });
            }
          });

          debug("All requests for resource '%s' are processed", fontResource);
        } else {
          debug(
            "There were no Font requests waiting for completion for resource",
            fontResource
          );
        }
      }
    }

    return didDequeue;
  }

  /**
   * This will force this manager to free all of it's beloved resources that it manages should
   * it be holding onto resources that can not be freed by lack of references.
   */
  destroy(): void {
    this.fontManager.destroy();
  }

  /**
   * Destroy a single resource if the system deems it's time for it to go
   */
  destroyResource(init: BaseResourceOptions) {
    const resource = this.resourceLookup.get(init.key);
    if (!resource) return;
    this.fontManager.destroyFontMap(resource.id);
    this.resourceLookup.delete(init.key);
  }

  /**
   * This will provide the resource generated from the initResource operation.
   */
  getResource(resourceKey: string) {
    return this.resourceLookup.get(resourceKey) || null;
  }

  /**
   * Make the expander to handle making the attribute changes necessary to have the texture applied
   * to a uniform when the attribute places a resource request with a key.
   */
  getIOExpansion(): BaseIOExpansion[] {
    return [new TextureIOExpansion(ResourceType.FONT, this)];
  }

  /**
   * This is a request to intiialize a resource by this manager.
   */
  async initResource(options: BaseResourceOptions) {
    if (isFontResource(options)) {
      const fontMap = await this.fontManager.createFontMap(options);

      if (fontMap) {
        this.resourceLookup.set(options.key, fontMap);
      }

      debug("Font map created->", fontMap);
    }
  }

  /**
   * This is for attributes making a request for a resource of this type to create shader compatible info
   * regarding the requests properties.
   */
  request<U extends Instance, V extends ILayerProps<U>>(
    layer: Layer<U, V>,
    instance: Instance,
    req: IFontResourceRequest,
    _context?: IResourceContext
  ): InstanceIOValue {
    const request: IFontResourceRequestInternal = req;
    const fontMap = request.fontMap;
    let texture: SubTexture | null = null;

    // If the texture is ready and available, then we simply return the IO values
    if (fontMap) {
      // If this is a character request, then we output the texture desired. Kerning requests only needs
      // the font map populated in the request.
      if (request.character) {
        texture = fontMap.getGlyphTexture(request.character);
      }

      if (texture) {
        if (request.fetch === FontResourceRequestFetch.IMAGE_SIZE) {
          return [texture.pixelWidth, texture.pixelHeight];
        }

        return subTextureIOValue(texture);
      }

      if (request.fetch === FontResourceRequestFetch.IMAGE_SIZE) {
        return [0, 0];
      }

      return subTextureIOValue(null);
    }

    // This is the attributes resource key being requested
    const resourceKey = req.key;
    // If a request is already made, then we must save the instance making the request for deactivation and
    // Reactivation but without any additional atlas loading
    let fontRequests = this.requestLookup.get(resourceKey);

    if (fontRequests) {
      const existingRequests = fontRequests.get(request);

      if (existingRequests) {
        existingRequests.push([layer, instance]);
        instance.active = false;

        if (request.fetch === FontResourceRequestFetch.IMAGE_SIZE) {
          return [0, 0];
        }

        return subTextureIOValue(texture);
      }
    } else {
      fontRequests = new Map();
      this.requestLookup.set(resourceKey, fontRequests);
    }

    // If the texture is not available, then we must load the resource, deactivate the instance
    // And wait for the resource to become available. Once the resource is available, the system
    // Must activate the instance to render the resource.
    instance.active = false;
    let requests = this.requestQueue.get(resourceKey);

    if (!requests) {
      requests = [];
      this.requestQueue.set(resourceKey, requests);
    }

    requests.push(request);
    fontRequests.set(request, [[layer, instance]]);

    // This returns essentially returns blank values for the resource lookup
    if (request.fetch) {
      return [0, 0];
    }

    return subTextureIOValue(texture);
  }

  /**
   * Responds to the system detecting properties for a resource need updating.
   */
  updateResource(options: BaseResourceOptions) {
    if (!isFontResource(options)) return;
    const resource = this.resourceLookup.get(options.key);
    if (!resource) return;
    if (shallowEqual(options.fontSource, resource.fontSource)) return;

    debug(
      "Font resources currently do not update. To update their properties simply destroy and recreate for now."
    );
  }
}
