import { Bounds } from "../../primitives/bounds";
import { ImageRasterizer } from "../../resources/texture/image-rasterizer";
import { Atlas, IAtlasResource } from "./atlas";
import { IAtlasResourceRequest } from "./atlas-resource-request";
import { IPackNodeDimensions, PackNode } from "./pack-node";
import { SubTexture } from "./sub-texture";

const debug = require("debug")("performance");

const ZERO_IMAGE: SubTexture = {
  aspectRatio: 0,
  atlasBL: [0, 0],
  atlasBR: [0, 0],
  textureReferenceID: "",
  texture: null,
  atlasTL: [0, 0],
  atlasTR: [0, 0],
  heightOnAtlas: 0,
  isValid: false,
  pixelHeight: 0,
  pixelWidth: 0,
  widthOnAtlas: 0
};

/**
 * Determines if a SubTexture is a valid SubTexture for rendering
 */
function isValidImage(image?: SubTexture): image is SubTexture {
  if (image && image.isValid) {
    if (image.pixelWidth && image.pixelHeight) {
      return true;
    }
  }

  return false;
}

/**
 * Defines a manager of atlas', which includes generating the atlas and producing
 * textures defining those pieces of atlas.
 */
export class AtlasManager {
  /** Stores all of the generated atlas' in a lookup by name */
  allAtlas = new Map<string, Atlas>();

  /**
   * Creates a new atlas that resources can be loaded into.
   *
   * @param resources The images with their image path set to be loaded into the atlas.
   *               Images that keep an atlas ID of null indicates the image did not load
   *               correctly
   *
   * @return {Texture} The texture that is created as our atlas. The images injected
   *                   into the texture will be populated with the atlas'
   */
  async createAtlas(options: IAtlasResource) {
    // Create the new Atlas object that tracks all of our atlas' metrics
    const atlas = new Atlas(options);
    // Make the atlas identifiable by it's name
    this.allAtlas.set(atlas.id, atlas);

    debug("Atlas Created-> %o", atlas);

    return atlas;
  }

  /**
   * Free ALL resources under this manager
   */
  destroy() {
    this.allAtlas.forEach(value => value.destroy());
  }

  /**
   * Disposes of the resources the atlas held and makes the atlas invalid for use
   *
   * @param atlasName
   */
  destroyAtlas(atlasName: string) {
    const atlas = this.allAtlas.get(atlasName);

    if (atlas) {
      atlas.destroy();
    }
  }

  private setDefaultImage(image: SubTexture, atlasName: string) {
    image = Object.assign(image, ZERO_IMAGE, { atlasReferenceID: atlasName });
    return image;
  }

  /**
   * This loads, packs, and draws the indicated image into the specified canvas
   * using the metrics that exists for the specified atlas.
   *
   * @param request The image who should have it's image path loaded
   * @param atlasName The name of the atlas to make the packing work
   * @param canvas The canvas we will be drawing into to generate the complete image
   *
   * @return {Promise<boolean>} Promise that resolves to if the image successfully was drawn or not
   */
  private async draw(
    atlas: Atlas,
    request: IAtlasResourceRequest
  ): Promise<boolean> {
    const atlasName = atlas.id;

    // We don't draw or process requests to resources being disposed.
    if (request.disposeResource) {
      return true;
    }

    // First ensure the atlas does not have this resource referenced yet
    const existing = atlas.resourceReferences.get(request.source);

    if (existing) {
      return true;
    }

    // Immediately register the resource with a subtexture to prevent duplicate
    // processing.
    request.texture = request.texture || new SubTexture();
    request.texture.isValid = true;
    atlas.resourceReferences.set(request.source, {
      subtexture: request.texture,
      count: 0
    });

    // First we must load the image
    // Make a buffer to hold our new image
    // Load the image into memory, default to keeping the alpha channel
    const loadedImage: TexImageSource | null = await this.loadImage(request);
    // Get the sub texture that is going to be applied to the atlas
    const texture = request.texture;

    // Only a non-null image means the image loaded correctly
    if (loadedImage && isValidImage(texture)) {
      // Now we create a Rectangle to store the image dimensions
      const rect: Bounds<never> = new Bounds({
        bottom: texture.pixelHeight,
        left: 0,
        right: texture.pixelWidth,
        top: 0
      });

      // Create ImageDimension to insert into our atlas mapper
      const dimensions: IPackNodeDimensions<SubTexture> = {
        data: texture,
        bounds: rect
      };

      // Auto add a buffer in
      dimensions.bounds.width += 1;
      dimensions.bounds.height += 1;
      // Get the atlas map node
      let packing: PackNode<SubTexture> = atlas.packing;
      // Store the node resulting from the insert operation
      let insertedNode: PackNode<SubTexture> | null = packing.insert(
        dimensions
      );

      // If we failed to insert the image, let's repack the atlas and attempt a second round
      // of packing.
      if (!insertedNode) {
        // Repack the atlas
        this.repackResources(atlas);
        // Attempt to inset the item again
        packing = atlas.packing;
        insertedNode = packing.insert(dimensions);
      }

      // If the result was NULL we did not successfully insert the image into any map
      if (insertedNode) {
        // Apply the image to the node
        insertedNode.data = texture;

        // Set our image's atlas properties
        PackNode.applyToSubTexture(packing, insertedNode, texture, {
          top: 0,
          left: 0,
          right: 1,
          bottom: 1
        });

        // Now specify the update region to be applied to the texture
        atlas.texture.update(loadedImage, {
          ...insertedNode.bounds,
          y: atlas.height - insertedNode.bounds.y - insertedNode.bounds.height
        });

        // We have finished inserting
        return true;
      } else {
        // Log an error
        console.error(`Could not fit resource into atlas`, request);
        request.texture = this.setDefaultImage(texture, atlasName);
        return false;
      }
    }

    // Since the image did not fit, we now get the atlas to consolidate all of it's existing resources
    // by removing unused images that were placed in the atlas but were flagged as no longer used.
    else {
      if (texture && !texture.isValid) {
        debug("Resource was invalidated during load:", request);
      } else {
        // Log an error and load a default sub texture
        console.error(`Could not load resource:`, request);
      }

      if (request.texture) {
        request.texture = this.setDefaultImage(request.texture, atlasName);
      }

      return false;
    }
  }

  /**
   * Retrieves the actual Atlas object for a given resource id
   */
  getAtlasTexture(resourceId: string): Atlas | undefined {
    return this.allAtlas.get(resourceId);
  }

  /**
   * This takes in any atlas resource and ensures the image is available and ready to
   * render.
   */
  private async loadImage(
    resource: IAtlasResourceRequest
  ): Promise<TexImageSource | null> {
    const subTexture = resource.texture || new SubTexture();
    const source = resource.source;
    resource.texture = subTexture;
    if (resource.texture.isValid === false) return null;

    if (source instanceof HTMLImageElement) {
      let image = await new Promise<TexImageSource | null>(resolve => {
        if (!(source instanceof HTMLImageElement)) return;
        const image: HTMLImageElement | undefined = source;

        if (image.width && image.height) {
          ImageRasterizer.calculateImageSize(image);
          subTexture.pixelWidth = image.width;
          subTexture.pixelHeight = image.height;
          subTexture.aspectRatio = image.width / image.height;
          resolve(image);
          return;
        }

        if (image) {
          image.onload = function() {
            subTexture.pixelWidth = image.width;
            subTexture.pixelHeight = image.height;
            subTexture.aspectRatio = image.width / image.height;
            resolve(image);
          };

          image.onerror = function() {
            resolve(null);
          };
        } else {
          resolve(null);
        }
      });

      if (
        image &&
        resource.rasterizationScale !== undefined &&
        resource.rasterizationScale !== 1
      ) {
        image = await ImageRasterizer.resizeImage(
          image,
          resource.rasterizationScale || 1
        );
      }

      return image;
    } else if (source instanceof HTMLVideoElement) {
      console.warn("System does not support HTMLVideoElements yet");
    } else if (typeof source === "string") {
      const dataURL = source;

      let image = await new Promise<TexImageSource | null>(resolve => {
        const image = new Image();

        image.onload = function() {
          subTexture.pixelWidth = image.width;
          subTexture.pixelHeight = image.height;
          subTexture.aspectRatio = image.width / image.height;
          resolve(image);
        };

        image.onerror = function() {
          resolve(null);
        };

        image.src = dataURL;
      });

      if (
        image &&
        resource.rasterizationScale !== undefined &&
        resource.rasterizationScale !== 1
      ) {
        image = await ImageRasterizer.resizeImage(
          image,
          resource.rasterizationScale || 1
        );
      }
    } else {
      let image: TexImageSource = source;

      if (
        image &&
        resource.rasterizationScale !== undefined &&
        resource.rasterizationScale !== 1
      ) {
        image = await ImageRasterizer.resizeImage(
          image,
          resource.rasterizationScale || 1
        );
      }

      return image;
    }

    return null;
  }

  /**
   * When this is triggered, the atlas will examine all of it's packing and repack it's resources
   * on the texture for the atlas thus eliminating any dead space from resources that have been disposed.
   *
   * This process will cause the atlas to generate a new Texture to utilize and dispose of the old texture
   * to allow for the atlas to redraw it's texture using GPU operations which is much faster than a CPU operation
   * of generating the texture.
   */
  private repackResources(_atlas: Atlas) {
    // TODO
    console.warn(
      "Atlas is attempting repacking, but the method to do so has not been implmented yet."
    );

    return true;
  }

  /**
   * This targets an existing atlas and attempts to update it with the provided atlas resources.
   */
  async updateAtlas(atlasName: string, requests: IAtlasResourceRequest[]) {
    const atlas = this.allAtlas.get(atlasName);

    if (atlas) {
      const promises = [];

      for (let i = 0, iMax = requests.length; i < iMax; ++i) {
        const request = requests[i];

        if (!request.disposeResource) {
          promises.push(this.draw(atlas, request));
        }
      }

      await Promise.all(promises);

      // Now that all of the requests have been processed, we can now update reference counting for the
      // underlying resources.
      for (let i = 0, iMax = requests.length; i < iMax; ++i) {
        const request = requests[i];

        if (request.disposeResource) atlas.stopUsingResource(request);
        else atlas.useResource(request);
      }

      // Now resolve the reference counting with the atlas so the atlas can invalidate textures and flag
      // space on the atlas as available for rendering again.
      atlas.resolveResources();
    } else {
      console.warn(
        "Can not update non-existing atlas:",
        atlasName,
        "These resources will not be loaded:",
        requests
      );
    }

    return atlas;
  }
}
