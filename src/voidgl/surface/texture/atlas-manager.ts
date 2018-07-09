import { Bounds } from "../../primitives/bounds";
import { Atlas, IAtlasOptions } from "./atlas";
import { ColorAtlasResource } from "./color-atlas-resource";
import { ColorRasterizer } from "./color-rasterizer";
import { ImageAtlasResource } from "./image-atlas-resource";
import { LabelAtlasResource } from "./label-atlas-resource";
import { LabelRasterizer } from "./label-rasterizer";
import { ImageDimensions, PackNode } from "./pack-node";
import { SubTexture } from "./sub-texture";

const debug = require("debug")("webgl-surface:Atlas");

const ZERO_IMAGE: SubTexture = {
  aspectRatio: 0,
  atlasBL: { x: 0, y: 0 },
  atlasBR: { x: 0, y: 0 },
  atlasReferenceID: "",
  atlasTexture: null,
  atlasTL: { x: 0, y: 0 },
  atlasTR: { x: 0, y: 0 },
  heightOnAtlas: 0,
  isValid: false,
  pixelHeight: 0,
  pixelWidth: 0,
  widthOnAtlas: 0
};

export type AtlasResource =
  | ColorAtlasResource
  | LabelAtlasResource
  | ImageAtlasResource;

/**
 * Determines if a SubTexture is a valid SubTexture for rendering
 */
function isValidImage(image: SubTexture) {
  let isValid = false;

  if (image && image.isValid) {
    if (image.pixelWidth && image.pixelHeight) {
      isValid = true;
    }
  }

  return isValid;
}

/**
 * Defines a manager of atlas', which includes generating the atlas and producing
 * textures defining those pieces of atlas.
 */
export class AtlasManager {
  /** Stores all of the generated atlas' in a lookup by name */
  allAtlas = new Map<string, Atlas>();

  /**
   * Atlas' must be created from scratch to update them. In order to properly
   * update an existing one, you must destroy it then recreate it again.
   * This is from not knowing how to update a texture via three js.
   *
   * @param resources The images with their image path set to be loaded into the atlas.
   *               Images that keep an atlas ID of null indicates the image did not load
   *               correctly
   *
   * @return {Texture} The Threejs texture that is created as our atlas. The images injected
   *                   into the texture will be populated with the atlas'
   */
  async createAtlas(options: IAtlasOptions, resources?: AtlasResource[]) {
    // Create the new Atlas object that tracks all of our atlas' metrics
    const atlas = new Atlas(options);
    // Set the manager to the atlas
    atlas.setManager(this);
    // Make the atlas identifiable by it's name
    this.allAtlas.set(atlas.id, atlas);

    // Now we load, pack in, and draw each requested resource
    if (resources) {
      await this.updateAtlas(atlas.id, resources);
    }

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
   * @param resource The image who should have it's image path loaded
   * @param atlasName The name of the atlas to make the packing work
   * @param canvas The canvas we will be drawing into to generate the complete image
   *
   * @return {Promise<boolean>} Promise that resolves to if the image successfully was drawn or not
   */
  private async draw(atlas: Atlas, resource: AtlasResource): Promise<boolean> {
    const canvas = atlas.texture.image;
    const atlasName = atlas.id;

    // Register the resource with the atlas
    if (!atlas.registerResource(resource)) {
      console.warn(
        "Could not draw resource to the atlas as the resource was not properly registered to the atlas first",
        atlas,
        resource
      );
      return Promise.resolve(false);
    }

    // First we must load the image
    // Make a buffer to hold our new image
    // Load the image into memory, default to keeping the alpha channel
    const loadedImage: HTMLImageElement | null = await this.loadImage(resource);

    // Only a non-null image means the image loaded correctly
    if (loadedImage && isValidImage(resource.texture)) {
      // Get the sub texture that is going to be applied to the atlas
      const rasterization = resource.rasterization;
      const texture = resource.texture;
      // Now we create a Rectangle to store the image dimensions
      const rect: Bounds = new Bounds({
        bottom: rasterization.texture.height,
        left: 0,
        right: rasterization.texture.width,
        top: 0
      });
      // Create ImageDimension to insert into our atlas mapper
      const dimensions: ImageDimensions = {
        first: texture,
        second: rect
      };

      // Auto add a buffer in
      dimensions.second.width += 1;
      dimensions.second.height += 1;
      // Get the atlas map node
      const packing: PackNode = atlas.packing;
      // Store the node resulting from the insert operation
      const insertedNode: PackNode | null = packing.insert(dimensions);

      // If the result was NULL we did not successfully insert the image into any map
      if (insertedNode) {
        debug("Atlas location determined: %o", insertedNode);

        // Apply the image to the node
        insertedNode.nodeImage = texture;

        // Set our image's atlas properties
        const ux = insertedNode.nodeDimensions.x / atlas.width;
        const uy = insertedNode.nodeDimensions.y / atlas.height;
        const uw = insertedNode.nodeDimensions.width / atlas.width;
        const uh = insertedNode.nodeDimensions.height / atlas.height;
        const onePixelX = 1 / atlas.width;

        const atlasDimensions: Bounds = new Bounds({
          bottom: 1.0 - uy,
          left: ux,
          right: ux + uw,
          top: 1.0 - (uy + uh)
        });

        const bottom = atlasDimensions.bottom;
        const top = atlasDimensions.y;
        const left = atlasDimensions.x;
        const right = atlasDimensions.x + atlasDimensions.width - onePixelX;

        texture.atlasReferenceID = atlasName;
        texture.atlasTL = { x: left, y: top };
        texture.atlasBR = { x: right, y: bottom };
        texture.atlasBL = { x: left, y: bottom };
        texture.atlasTR = { x: right, y: top };
        texture.widthOnAtlas = Math.abs(texture.atlasTR.x - texture.atlasTL.x);
        texture.heightOnAtlas = Math.abs(texture.atlasTR.y - texture.atlasBR.y);
        texture.pixelWidth = rasterization.texture.width;
        texture.pixelHeight = rasterization.texture.height;

        // Now draw the image to the indicated canvas
        canvas
          .getContext("2d")
          .drawImage(
            loadedImage,
            insertedNode.nodeDimensions.x,
            insertedNode.nodeDimensions.y
          );

        // We have finished inserting
        return true;
      } else {
        // Log an error
        console.error(`Could not fit resource into atlas`, resource);
        resource.texture = this.setDefaultImage(resource.texture, atlasName);
        return false;
      }
    } else {
      if (!resource.texture.isValid) {
        debug("Resource was invalidated during load:", resource);
      } else {
        // Log an error and load a default sub texture
        console.error(`Could not load resource:`, resource);
      }

      resource.texture = this.setDefaultImage(resource.texture, atlasName);
      return false;
    }
  }

  /**
   * Retrieves the threejs texture for the atlas
   *
   * @param atlasName The identifier of the atlas
   */
  getAtlasTexture(atlasName: string): Atlas | undefined {
    return this.allAtlas.get(atlasName);
  }

  /**
   * This takes in any atlas resource and rasterizes it.
   *
   * @param {SubTexture} resource This is any atlas resource which will have it's image rasterized
   *
   * @return {Promise<HTMLImageElement>} A promise to resolve to the loaded image
   *                                     or null if there was an error
   */
  private async loadImage(
    resource: AtlasResource
  ): Promise<HTMLImageElement | null> {
    let imageSrc: string = "";

    const subTexture = resource.texture || new SubTexture();
    resource.texture = subTexture;

    if (resource.texture.isValid === false) return null;

    if (resource instanceof ImageAtlasResource) {
      // If the texture was provided an image then we ensure the image is loaded
      // Then hand it back
      if (resource.image.element) {
        if (
          resource.image.element.width !== 0 &&
          resource.image.element.height !== 0
        ) {
          const image = resource.image.element;
          subTexture.pixelWidth = image.width;
          subTexture.pixelHeight = image.height;
          subTexture.aspectRatio = image.width / image.height;

          return image;
        }

        const image = await new Promise<HTMLImageElement | null>(
          (resolve, reject) => {
            const image: HTMLImageElement | undefined = resource.image.element;

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
          }
        );

        return image;
      }

      // If a string was returned, we must load the image then return the image
      else if (resource.image.path) {
        imageSrc = resource.image.path;
      }
    } else if (resource instanceof LabelAtlasResource) {
      // Ensure the label has been rasterized to a canvas element
      if (!resource.rasterization.canvas) {
        await LabelRasterizer.render(resource);
      }

      // Make sure the rasterization properly executed
      if (resource.rasterization.canvas) {
        debug("Rasterized label %o", resource.rasterization);
        imageSrc = resource.rasterization.canvas.toDataURL("image/png");
      } else {
        console.warn("The label was not able to be rasterized");
      }
    } else if (resource instanceof ColorAtlasResource) {
      // Ensure the color has been rasterized to a canvas element
      if (!resource.rasterization.canvas) {
        await ColorRasterizer.render(resource);
      }

      // Make sure the rasterization properly executed
      if (resource.rasterization.canvas) {
        debug("Rasterized color %o", resource.rasterization);
        imageSrc = resource.rasterization.canvas.toDataURL("image/png");
      } else {
        console.warn("The color was not able to be rasterized");
      }
    }

    if (imageSrc) {
      const image = await new Promise<HTMLImageElement | null>(
        (resolve, reject) => {
          const image: HTMLImageElement = new Image();

          image.onload = function() {
            subTexture.pixelWidth = image.width;
            subTexture.pixelHeight = image.height;
            subTexture.aspectRatio = image.width / image.height;
            resolve(image);
          };

          image.onerror = function() {
            resolve(null);
          };

          image.src = imageSrc;
        }
      );

      return image;
    }

    return null;
  }

  /**
   * This targets an existing atlas and attempts to update it with the provided atlas resources.
   *
   * @param atlasName
   * @param resources
   */
  async updateAtlas(atlasName: string, resources: AtlasResource[]) {
    const atlas = this.allAtlas.get(atlasName);

    if (atlas) {
      for (const resource of resources) {
        await this.draw(atlas, resource);
      }

      // Perform the best method for updating the underlying texture of the atlas to the latest changes
      atlas.updateTexture();
    } else {
      console.warn(
        "Can not update non-existing atlas:",
        atlasName,
        "These resources will not be loaded:",
        resources
      );
    }
  }
}
