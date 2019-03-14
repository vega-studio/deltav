import { Instance } from "../../instance-provider/instance";
import {
  SubTexture,
  subTextureIOValue
} from "../../resources/texture/sub-texture";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import {
  InstanceIOValue,
  IResourceInstanceAttribute,
  ResourceType
} from "../../types";
import {
  BaseResourceManager,
  BaseResourceOptions,
  BaseResourceRequest
} from "../base-resource-manager";
import { TextureIOExpansion } from "../texture/texture-io-expansion";
import {
  FontManager,
  IFontResourceOptions,
  isFontResource
} from "./font-manager";

export interface IFontResourceRequest extends BaseResourceRequest {
  /** This is the information needed to pick the correct glyph texture coordinates */
  glyph?: SubTexture;
  /** Establish the only type that this request shall be is a FONT type */
  type: ResourceType.FONT;
  /** The character being requested from the fontmap */
  character: string;
  /** The character immediately to the left of the character */
  leftCharacter: string;
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
  private currentAttribute: IResourceInstanceAttribute<Instance>;
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
  private resourceLookup = new Map<string, IFontResourceOptions>();
  /** This is the manager that is used to create and update font resources */
  private fontManager = new FontManager();

  /**
   * This is so the system can control when requests are made so this manager has the opportunity
   * to verify and generate the resources the request requires.
   */
  async dequeueRequests(): Promise<boolean> {
    // This flag will be modified to reflect if a dequeue operation has occurred
    let didDequeue = false;

    for (const [fontResource, resources] of Array.from(
      this.requestQueue.entries()
    )) {
      if (resources.length > 0) {
        // We did dequeue
        didDequeue = true;
        // Pull out all of the requests into a new array and empty the existing queue to allow the queue to register
        // New requests while this dequeue is being processed
        const requests = resources.slice(0);
        // Empty the queue to begin taking in new requests as needed
        resources.length = 0;

        // Tell the atlas manager to update with all of the requested resources
        await this.fontManager.updateFontMap(fontResource, requests);
        // Get the requests for the given atlas
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
                if (layer.bufferManager.managesInstance(instance)) {
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
   * This will force this manager to free all of it's beloved resources that it manages should
   * it be holding onto resources that can not be freed by lack of references.
   */
  destroy(): void {
    throw new Error("Method not implemented.");
  }

  /**
   * This will provide the resource generated from the initResource operation.
   */
  getResource(resourceKey: string): IFontResourceOptions | null {
    return this.resourceLookup.get(resourceKey) || null;
  }

  /**
   * Make the expander to handle making the attribute changes necessary to
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
        this.resourceLookup.set(options.key, options);
      }
    }
  }

  /**
   * This is for attributes making a request for a resource of this type to create shader compatible info
   * regarding the requests properties.
   */
  request<U extends Instance, V extends ILayerProps<U>>(
    layer: Layer<U, V>,
    instance: Instance,
    request: IFontResourceRequest
  ): InstanceIOValue {
    const texture = request.glyph;

    // If the texture is ready and available, then we simply return the IO values
    if (texture) {
      return subTextureIOValue(texture);
    }

    // This is the attributes resource key being requested
    const resourceKey = this.currentAttribute.resource.key;
    // If a request is already made, then we must save the instance making the request for deactivation and
    // Reactivation but without any additional atlas loading
    let fontRequests = this.requestLookup.get(resourceKey);

    if (fontRequests) {
      const existingRequests = fontRequests.get(request);

      if (existingRequests) {
        existingRequests.push([layer, instance]);
        instance.active = false;

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
    return subTextureIOValue(texture);
  }

  /**
   * Sets the attribute that is currently making requests.
   */
  setAttributeContext(attribute: IResourceInstanceAttribute<Instance>) {
    this.currentAttribute = attribute;
  }
}
