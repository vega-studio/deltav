import Debug from "debug";

import { Texture, TextureOptions } from "../../gl/texture.js";
import { Vec2 } from "../../math/vector.js";
import { Omit, ResourceType, TextureSize } from "../../types.js";
import { IdentifyByKey } from "../../util/identify-by-key.js";
import { BaseResourceOptions } from "../base-resource-manager.js";
import { IAtlasResourceRequest } from "./atlas-resource-request.js";
import { PackNode } from "./pack-node.js";
import { SubTexture } from "./sub-texture.js";
import { VideoTextureMonitor } from "./video-texture-monitor.js";

const debug = Debug("performance");

/**
 * Options required for generating an atlas.
 */
export interface IAtlasResource extends BaseResourceOptions {
  /** Set the type of the resource to explicitally be an atlas resource */
  type: ResourceType.ATLAS;
  /** This is the height of the texture */
  height: TextureSize;
  /** This is the width of the atlas */
  width: TextureSize;
  /**
   * This applies any desired settings to the Texture.
   * Some noteable defaults this system sets:
   *  - generateMipMaps is true and
   *  - premultiply alpha is true.
   */
  textureSettings?: TextureOptions;
}

/**
 * Use this in the property creation of atlas'.
 */
export function createAtlas(
  options: Omit<IAtlasResource, "type" | "key"> &
    Partial<Pick<IAtlasResource, "key">>
): IAtlasResource {
  return {
    key: "",
    type: ResourceType.ATLAS,
    ...options,
  };
}

/**
 * Type guard for the atlas resource type.
 */
export function isAtlasResource(val: BaseResourceOptions): val is Atlas {
  return val && val.type === ResourceType.ATLAS;
}

type ResourceReference = {
  subtexture: SubTexture;
  count: number;
  videoMonitor?: VideoTextureMonitor;
};

/**
 * This represents a single Texture on the gpu that is composed of several smaller textures
 * as a 'look up'.
 */
export class Atlas extends IdentifyByKey implements IAtlasResource {
  /** Stores the size of the atlas texture */
  height: TextureSize;
  /** This is the packing of the atlas with images */
  packing: PackNode<SubTexture>;
  /**
   * This is storage for handling resource reference counting. When a resource's reference drops below
   * a count of 1, then the resource is disposed and it's space on the atlas is flagged for freeing up
   * should the atlas need to consolidate resources.
   */
  resourceReferences = new Map<
    IAtlasResourceRequest["source"],
    ResourceReference
  >();
  /** This is the actual texture object that represents the atlas on the GPU */
  texture?: Texture;
  /** These are the applied settings to our texture */
  textureSettings?: TextureOptions;
  /** The resource type for resource management */
  type: number = ResourceType.ATLAS;
  /** Stores the size of the atlas texture */
  width: TextureSize;

  constructor(options: IAtlasResource) {
    super(options);
    const canvas = document.createElement("canvas");
    this.width = canvas.width = options.width;
    this.height = canvas.height = options.height;
    this.textureSettings = options.textureSettings;

    if (options.width < 0 || options.height < 0) {
      throw new Error(
        "TextureSize Error: An atlas does NOT support Screen Texture sizing."
      );
    }

    // Set up the packing for this atlas
    this.packing = new PackNode(0, 0, options.width, options.height);
    // Make sure the texture is started and updated
    this.createTexture(canvas);
  }

  /**
   * This generates the texture object needed for this atlas.
   */
  private createTexture(canvas?: HTMLCanvasElement) {
    if (this.texture) return;

    // Establish the settings to be applied to the Texture
    let textureSettings;

    if (this.textureSettings) {
      textureSettings = {
        generateMipMaps: true,
        premultiplyAlpha: true,
        ...this.textureSettings,
      };
    } else {
      textureSettings = {
        generateMipMaps: true,
        premultiplyAlpha: true,
      };
    }

    // Generate the texture
    this.texture = new Texture({
      data: canvas,
      ...textureSettings,
    });
  }

  /**
   * This frees up all the resources down to the GPU related to this atlas. It also
   * loops through every resource and invalidates the texturing information within
   * them so subsequent accidental renders will appear as a single color rather than
   * an artifacted element.
   */
  destroy() {
    // Delete the GPU's texture object
    this.texture?.destroy();

    // Invalidate the Sub textures so they don't start rendering wild colors. Instead
    // should render a single color at the 0, 0 mark of the texture.
    this.resourceReferences.forEach((resource) => {
      this.invalidateTexture(resource.subtexture);
    });
  }

  /**
   * This invalidates the SubTexture of an atlas resource.
   */
  private invalidateTexture(texture: SubTexture) {
    const zero: Vec2 = [0, 0];

    // Make anything trying to render with the image not render much anything useful
    texture.aspectRatio = 1;
    texture.atlasBL = zero;
    texture.atlasBR = zero;
    texture.atlasTL = zero;
    texture.atlasTR = zero;
    texture.isValid = false;
    texture.texture = null;
    texture.pixelHeight = 0;
    texture.pixelWidth = 0;
    delete texture.source;

    // Video monitoring should be stopped at this point.
    if (texture.video) {
      texture.video.monitor.destroy();
      delete texture.video;
    }
  }

  /**
   * This will look through all resources in this atlas and will determine if the resource
   * should be removed or not.
   */
  resolveResources() {
    const toRemove: IAtlasResourceRequest["source"][] = [];

    this.resourceReferences.forEach((ref, source) => {
      if (ref.count <= 0 && ref.subtexture) {
        debug(
          "A subtexture on an atlas has been invalidated as it is deemed no longer used: %o",
          ref.subtexture
        );
        this.invalidateTexture(ref.subtexture);
        toRemove.push(source);
      }
    });

    for (let i = 0, iMax = toRemove.length; i < iMax; ++i) {
      this.resourceReferences.delete(toRemove[i]);
    }
  }

  /**
   * This flags a resource no longeer used and decrements it's reference count.
   * If the use of the resource drops low enough, this will clear out the resurce
   * completely.
   */
  stopUsingResource(request: IAtlasResourceRequest) {
    const reference: ResourceReference = this.resourceReferences.get(
      request.source
    ) || {
      subtexture: request.texture || new SubTexture(),
      count: 0,
    };

    reference.count--;
  }

  /**
   * This flags a resource for use and increments it's reference count.
   */
  useResource(request: IAtlasResourceRequest) {
    const reference = this.resourceReferences.get(request.source) || {
      subtexture: request.texture,
      count: 0,
    };

    reference.count++;
  }
}
