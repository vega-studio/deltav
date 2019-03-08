import { Texture } from "../../gl/texture";
import { AtlasSize, Omit, ResourceType } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";
import { Vec2 } from "../../util/vector";
import { BaseResourceOptions } from "../base-resource-manager";
import { AtlasManager, AtlasResourceRequest } from "./atlas-manager";
import { PackNode } from "./pack-node";
import { SubTexture } from "./sub-texture";

/**
 * Options required for generating an atlas.
 */
export interface IAtlasResource extends BaseResourceOptions {
  /** Set the type of the resource to explicitally be an atlas resource */
  type: ResourceType.ATLAS;
  /** This is the height of the texture */
  height: AtlasSize;
  /** This is the width of the atlas */
  width: AtlasSize;
  /**
   * This applies any desired settings to the Texture.
   * Some noteable defaults this system sets:
   *  - generateMipMaps is true and
   *  - premultiply alpha is true.
   */
  textureSettings?: Partial<Texture>;
}

/**
 * Use this in the property creation of atlas'.
 */
export function createAtlas(
  options: Omit<IAtlasResource, "type">
): IAtlasResource {
  return {
    type: ResourceType.ATLAS,
    ...options
  };
}

/**
 * Type guard for the atlas resource type.
 */
export function isAtlasResource(val: BaseResourceOptions): val is Atlas {
  return val && val.type === ResourceType.ATLAS;
}

/**
 * This represents a single Texture on the gpu that is composed of several smaller textures
 * as a 'look up'.
 */
export class Atlas extends IdentifyByKey implements IAtlasResource {
  /** Stores the size of the atlas texture */
  height: AtlasSize;
  /** This is the parent manager of the atlas */
  manager: AtlasManager;
  /** This is the packing of the atlas with images */
  packing: PackNode;
  /** This is the actual texture object that represents the atlas on the GPU */
  texture: Texture;
  /** These are the applied settings to our texture */
  textureSettings?: Partial<Texture>;
  /** The resource type for resource management */
  type: number = ResourceType.ATLAS;
  /**
   * This is all of the resources associated with this atlas. The boolean flag indicates if the resource
   * is flagged for removal. When set to false, the resource is no longer valid and can be removed from
   * the atlas at any given moment.
   */
  validResources = new Set<AtlasResourceRequest>();
  /** Stores the size of the atlas texture */
  width: AtlasSize;

  constructor(options: IAtlasResource) {
    super(options);
    const canvas = document.createElement("canvas");
    this.width = canvas.width = options.width;
    this.height = canvas.height = options.height;
    this.textureSettings = options.textureSettings;

    // Set up the packing for this atlas
    this.packing = new PackNode(0, 0, options.width, options.height);
    // Make sure the texture is started and updated
    this.updateTexture(canvas);
  }

  /**
   * This invalidates the SubTexture of an atlas resource.
   */
  private invalidateResource(resource: AtlasResourceRequest) {
    const zero: Vec2 = [0, 0];
    resource.texture.aspectRatio = 1;
    resource.texture.atlasBL = zero;
    resource.texture.atlasBR = zero;
    resource.texture.atlasTL = zero;
    resource.texture.atlasTR = zero;
    resource.texture.atlasReferenceID = "";
    resource.texture.pixelWidth = 0;
    resource.texture.pixelHeight = 0;
    resource.texture.isValid = false;
    resource.texture.atlasTexture = null;
  }

  /**
   * Adds a resource to this atlas AND ensures the resource is flagged valid for use.
   *
   * @return {boolean} True if the resource successfully registered
   */
  registerResource(resource: AtlasResourceRequest) {
    if (!this.validResources.has(resource)) {
      if (!resource.texture || !resource.texture.isValid) {
        if (!resource.texture) {
          resource.texture = new SubTexture();
        }

        resource.texture.isValid = true;
        resource.texture.atlasTexture = this.texture;
        this.validResources.add(resource);

        return true;
      } else {
        console.warn(
          "Atlas Error:",
          this.id,
          "Attempted to add a resource to an Atlas that is already a valid resource on another atlas.",
          "Consider Creating a new resource to be loaded into this particular atlas.",
          "Resource:",
          resource
        );
      }
    } else {
      console.warn(
        "Atlas Error:",
        this.id,
        "A resource was trying to be added to the atlas that has already been added before.",
        "Consider creating a new resource to indicate what you want loaded to the atlas",
        "Resource:",
        resource
      );
    }

    return false;
  }

  /**
   * This flags a resource from removal from an atlas.
   *
   * NOTE: This does not immediately clear the resource fromt he atlas, nor does it even guarantee
   * the resource will be cleared from the atlas for a while. It merely suggests the resource be removed
   * and makes the SubTexture invalid. It could be a long while before the atlas gets regnerated and repacked
   * to actually reflect the resource not existing on the atlas.
   */
  removeResource(resource: AtlasResourceRequest) {
    if (this.validResources.has(resource)) {
      this.validResources.delete(resource);
      this.invalidateResource(resource);
    } else {
      console.warn(
        "Atlas Error:",
        this.id,
        "Attempted to remove a resource that does not exist on this atlas.",
        "or the resource was already considered invalidated on this atlas.",
        "Resource:",
        resource
      );
    }
  }

  /**
   * Sets the parent manager of this atlas
   */
  setManager(manager: AtlasManager) {
    this.manager = manager;
  }

  /**
   * TODO:
   * This now uses the new gl framework and should be updated to update a portion of the texture using
   * SubTexture2D
   */
  updateTexture(canvas?: HTMLCanvasElement) {
    // Establish the settings to be applied to the Texture
    let textureSettings;

    if (this.textureSettings) {
      textureSettings = {
        generateMipMaps: true,
        premultiplyAlpha: true,
        ...this.textureSettings
      };
    }

    else {
      textureSettings = {
        generateMipMaps: true,
        premultiplyAlpha: true,
      };
    }

    // Generate the texture
    if (this.texture) {
      const redoneCanvas = this.texture.data;
      this.texture.dispose();
      this.texture = new Texture({
        data: redoneCanvas,
        ...textureSettings
      });
    } else {
      this.texture = new Texture({
        data: canvas,
        ...textureSettings
      });
    }

    // Update resources referencing the texture
    this.validResources.forEach(resource => {
      if (resource.texture) {
        resource.texture.atlasTexture = this.texture;
      }
    });
  }

  /**
   * This frees up all the resources down to the GPU related to this atlas. It also
   * loops through every resource and invalidates the texturing information within
   * them so subsequent accidental renders will appear as a single color rather than
   * an artifacted element.
   */
  destroy() {
    this.texture.dispose();
    this.validResources.forEach((_isValid, resource) => {
      this.invalidateResource(resource);
    });
  }
}
