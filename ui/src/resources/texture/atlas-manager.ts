import {
  Attribute,
  Geometry,
  GLSettings,
  Material,
  MaterialUniformType,
  Model,
  RenderTarget,
  Scene,
  Texture,
  WebGLRenderer
} from "../../gl";
import { Bounds } from "../../math/primitives/bounds";
import { ImageRasterizer } from "../../resources/texture/image-rasterizer";
import { VideoTextureMonitor } from "../../resources/texture/video-texture-monitor";
import { isString } from "../../types";
import { Atlas, IAtlasResource } from "./atlas";
import { IAtlasResourceRequest } from "./atlas-resource-request";
import { IPackNodeDimensions, PackNode } from "./pack-node";
import { SubTexture } from "./sub-texture";

import Debug from "debug";

const debug = Debug("performance");

const ZERO_IMAGE: SubTexture = new SubTexture({
  aspectRatio: 0,
  atlasBL: [0, 0],
  atlasBR: [0, 0],
  texture: null,
  atlasTL: [0, 0],
  atlasTR: [0, 0],
  heightOnAtlas: 0,
  isValid: false,
  pixelHeight: 0,
  pixelWidth: 0,
  widthOnAtlas: 0
});

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
 * Defines a manager of atlas', which includes generating the atlas and
 * producing textures defining those pieces of atlas.
 */
export class AtlasManager {
  /** Stores all of the generated atlas' in a lookup by name */
  allAtlas = new Map<string, Atlas>();
  /**
   * This will be the renderer this manager is acting on behalf. This is used
   * internally to perform some GL actions without messing up the sync state of
   * the gl context with the renderer.
   */
  renderer?: WebGLRenderer;

  /**
   * Creates a new atlas that resources can be loaded into.
   *
   * @param resources The images with their image path set to be loaded into the
   *               atlas. Images that keep an atlas ID of null indicates the
   *               image did not load correctly
   *
   * @return {Texture} The texture that is created as our atlas. The images
   *                   injected into the texture will be populated with the
   *                   atlas'
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
   * Disposes of the resources the atlas held and makes the atlas invalid for
   * use
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
   * @param canvas The canvas we will be drawing into to generate the complete
   * image
   *
   * @return {Promise<boolean>} Promise that resolves to if the image
   * successfully was drawn or not
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

    // If the resource still has it's reference, we exit immediately to prevent
    // drawing the resource into the atlas twice
    if (existing) {
      // Ensure the request is referring to the correct subtexture for the
      // request
      request.texture = existing.subtexture;
      return true;
    }

    // Immediately register the resource with a subtexture to prevent duplicate
    // processing.
    request.texture = new SubTexture();
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
      dimensions.bounds.width += 0;
      dimensions.bounds.height += 0;
      // Get the atlas map node
      let packing: PackNode<SubTexture> = atlas.packing;
      // Store the node resulting from the insert operation
      let insertedNode: PackNode<SubTexture> | null = packing.insert(
        dimensions
      );

      // If we failed to insert the image, let's repack the atlas and attempt a
      // second round of packing. We can only repack if the system has provided
      // the manager a renderer to work with.
      if (!insertedNode) {
        // Repack the atlas
        const success = this.repackResources(atlas);

        if (!success) {
          console.error(
            "Repacking the atlas failed. Some resources may be in an undefined state. Consider making another atlas."
          );
          return false;
        }

        // Attempt to insert the item again
        packing = atlas.packing;
        insertedNode = packing.insert(dimensions);
      }

      // If the result was NULL we did not successfully insert the image into
      // any atlas
      if (insertedNode) {
        // Apply the image to the node
        insertedNode.data = texture;

        // Set our image's atlas properties
        PackNode.applyToSubTexture(packing, insertedNode, texture, {
          top: 0.5,
          left: 0.5,
          right: 0.5,
          bottom: 0.5
        });

        // Track the subtexture with the source that created it.
        texture.texture = atlas.texture;
        texture.source = loadedImage;
        texture.atlasRegion = {
          ...insertedNode.bounds,
          y: atlas.height - insertedNode.bounds.y - insertedNode.bounds.height
        };

        // Now specify the update region to be applied to the texture
        atlas.texture.update(loadedImage, texture.atlasRegion);

        // If this is a video element, we must make a monitor for it to keep the
        // texture in sync with the videos time location
        if (loadedImage instanceof HTMLVideoElement) {
          texture.video = {
            monitor: new VideoTextureMonitor(loadedImage, texture)
          };
        }

        // We have finished inserting
        return true;
      } else {
        // Log an error
        console.error(`Could not fit resource into atlas`, request);
        request.texture = this.setDefaultImage(texture, atlasName);
        return false;
      }
    }

    // Since the image did not fit, we now get the atlas to consolidate all of
    // it's existing resources by removing unused images that were placed in the
    // atlas but were flagged as no longer used.
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
   * This takes in any atlas resource and ensures the image is available and
   * ready to render.
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
            image.onload = null;
            resolve(image);
          };

          image.onerror = function() {
            console.error("Error generating Image element for source:", source);
            image.onload = null;
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
      if (source.videoHeight === 0 || source.videoWidth === 0) {
        console.warn(
          "Video requests to the atlas manager MUST have the video completely loaded and ready for loading",
          "There are too many caveats to automate video loading at this low of a level to have it prepped properly for",
          "use in the texture for all browsers. Consider handling video resources at the layer level to have them",
          "prepped for use."
        );
        return null;
      }

      // At this point, the video width and height should definitely be established and can be applied to the texture
      subTexture.pixelWidth = source.videoWidth;
      subTexture.pixelHeight = source.videoHeight;
      subTexture.aspectRatio = source.videoWidth / source.videoHeight;

      // Return the video here to indicate a successful load
      return source;
    } else if (isString(source)) {
      const dataURL = source;

      let image = await new Promise<TexImageSource | null>(resolve => {
        const generatingImage = new Image();

        generatingImage.onload = function() {
          subTexture.pixelWidth = generatingImage.width;
          subTexture.pixelHeight = generatingImage.height;
          subTexture.aspectRatio =
            generatingImage.width / generatingImage.height;
          generatingImage.onload = null;
          resolve(generatingImage);
        };

        generatingImage.onerror = function() {
          console.error("Error generating Image element for source:", source);
          resolve(null);
        };

        generatingImage.src = dataURL;
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
  }

  /**
   * When this is triggered, the atlas will examine all of it's packing and
   * repack it's resources on the texture for the atlas thus eliminating any
   * dead space from resources that have been disposed.
   *
   * This process will cause the atlas to generate a new Texture to utilize and
   * dispose of the old texture to allow for the atlas to redraw it's texture
   * using GPU operations which is much faster than a CPU operation of
   * generating the texture.
   */
  private repackResources(atlas: Atlas) {
    if (!this.renderer) {
      console.warn(
        "Attempted to repack resources for an atlas, but no renderer has been specified for this manager yet."
      );
      return false;
    }

    // Flatten the nodes into a list to make them easier to work with
    const toProcess = [atlas.packing];
    const allNodes = [];
    let index = 0;
    // Track the old bounds position information. Will be able to look up via the node's bounds object as it will get
    // reused for the remapping.
    const oldBounds = new Map<Bounds<any>, Bounds<any>>();

    // We process all of the nodes in the current atlas and flatten out the tree to merely the bounds of each node
    while (index < toProcess.length) {
      const next = toProcess[index];
      index++;

      // Only gather nodes that have not been invalidated.
      if (next.data && next.data.texture) {
        allNodes.push(next);
        oldBounds.set(next.bounds, new Bounds<any>(next.bounds));
      }

      if (next.child[0]) toProcess.push(next.child[0]);
      if (next.child[1]) toProcess.push(next.child[1]);
    }

    // Place the nodes with the largest features first
    allNodes.sort(
      (a, b) =>
        Math.max(b.bounds.width, b.bounds.height) -
        Math.max(a.bounds.width, a.bounds.height)
    );

    // If there are no valid nodes left, then we simply clear out the root pack node and let the texture repack anew.
    if (allNodes.length <= 0) {
      atlas.packing = new PackNode<SubTexture>(0, 0, atlas.width, atlas.height);
      return true;
    }

    // We now know at this point a new texture will be needed to render the newly packed layout
    // Simply copy all of the settings of the existing texture
    const newAtlasTexture = new Texture(atlas.texture);
    // Initialize the texture with blank information
    newAtlasTexture.data = {
      buffer: new Uint8Array(atlas.width * atlas.height * 4),
      width: atlas.width,
      height: atlas.height
    };

    // We now have all of the valid nodes and their respective original bounds. We will now repack these nodes to
    // get the new locations of them all.
    const rootNode = new PackNode<SubTexture>(0, 0, atlas.width, atlas.height);
    let failedRepack = false;

    for (let i = 0, iMax = allNodes.length; i < iMax; ++i) {
      const node = allNodes[i];

      if (!node.data) {
        console.warn("Attempted to repack a node with no valid data.");
        continue;
      }

      node.bounds.x = 0;
      node.bounds.y = 0;

      const newNode = rootNode.insert({
        bounds: node.bounds,
        data: node.data
      });

      if (!newNode) {
        console.warn(
          "When repacking the atlas, an existing node was unable to be repacked",
          node
        );
        failedRepack = true;
        continue;
      }

      // Apply the node to the subtexture to let the subtexture know it's new coordinates in the render space. This
      // sub texture should be the same subtexture object the node originally was associated with. This way all
      // references using this subtexture object will immediately have the new subtexture information.
      PackNode.applyToSubTexture(rootNode, newNode, node.data);
    }

    if (failedRepack) {
      return false;
    }

    // Now we can map all of the nodes to quads
    // Positions = Total nodes * Vec2 for xy coords * 6 vertices per quad
    const positions = new Float32Array(allNodes.length * 2 * 6);
    // Texture coordinates = Total nodes * Vec2 for xy coord positions * 6 vertices per quad
    const texCoords = new Float32Array(allNodes.length * 2 * 6);
    // We now produce the geometry that will render the old texture atlas elements to the new texture atlas. The texture
    // coordinates will be the coordinates located on the old texture. The position of the vertices will be the new pack
    // location to be rendered on the new texture.
    const tempTexture = new SubTexture();

    for (let i = 0, iMax = allNodes.length; i < iMax; ++i) {
      const node = allNodes[i];
      const previousBounds = oldBounds.get(node.bounds);
      const nextTexture = node.data;

      if (!previousBounds || !nextTexture) {
        console.warn(
          "While repacking there was an issue finding the previous bounds and the next texture to use",
          previousBounds,
          nextTexture
        );
        continue;
      }

      // We need the atlas coordinates of the previous bounds so we can make sure we keep the coordinate system
      // consistent with the new packing
      PackNode.applyToSubTexture(rootNode, previousBounds, tempTexture);
      // Get the index of data for the first vertex for the quad for the node we want to render
      const startIndex = i * 2 * 6;

      // The position is the location within clip space the new packing will occur. We must convert the coords to clip
      // space simply by x * 2 - 1 as clip space is [-1, 1] so it's '2' wide while tex coords are 0 - 1.
      // Set the xy coordinate within the new texture
      positions[startIndex] = nextTexture.atlasTL[0] * 2 - 1;
      positions[startIndex + 1] = nextTexture.atlasTL[1] * 2 - 1;
      positions[startIndex + 2] = nextTexture.atlasTR[0] * 2 - 1;
      positions[startIndex + 3] = nextTexture.atlasTR[1] * 2 - 1;
      positions[startIndex + 4] = nextTexture.atlasBL[0] * 2 - 1;
      positions[startIndex + 5] = nextTexture.atlasBL[1] * 2 - 1;

      // Bottom triangle
      positions[startIndex + 6] = nextTexture.atlasTR[0] * 2 - 1;
      positions[startIndex + 7] = nextTexture.atlasTR[1] * 2 - 1;
      positions[startIndex + 8] = nextTexture.atlasBR[0] * 2 - 1;
      positions[startIndex + 9] = nextTexture.atlasBR[1] * 2 - 1;
      positions[startIndex + 10] = nextTexture.atlasBL[0] * 2 - 1;
      positions[startIndex + 11] = nextTexture.atlasBL[1] * 2 - 1;

      // The Tex coordinate is the tex coords within the previous position
      // Top triangle
      texCoords[startIndex] = tempTexture.atlasTL[0];
      texCoords[startIndex + 1] = tempTexture.atlasTL[1];
      texCoords[startIndex + 2] = tempTexture.atlasTR[0];
      texCoords[startIndex + 3] = tempTexture.atlasTR[1];
      texCoords[startIndex + 4] = tempTexture.atlasBL[0];
      texCoords[startIndex + 5] = tempTexture.atlasBL[1];

      // Bottom triangle
      texCoords[startIndex + 6] = tempTexture.atlasTR[0];
      texCoords[startIndex + 7] = tempTexture.atlasTR[1];
      texCoords[startIndex + 8] = tempTexture.atlasBR[0];
      texCoords[startIndex + 9] = tempTexture.atlasBR[1];
      texCoords[startIndex + 10] = tempTexture.atlasBL[0];
      texCoords[startIndex + 11] = tempTexture.atlasBL[1];

      // Set the subtexture's texture to the new texture
      nextTexture.texture = newAtlasTexture;
    }

    // Create a model to render our newly specified geometry. Our vertices will already be in clip
    // space so no camera transforms will be needed.
    const geometry = new Geometry();
    const positionAttr = new Attribute(positions, 2);
    const texAttr = new Attribute(texCoords, 2);
    geometry.addAttribute("position", positionAttr);
    geometry.addAttribute("texCoord", texAttr);

    // Now we create a render target that will render to our new texture
    const renderTarget = new RenderTarget({
      buffers: {
        color: { buffer: newAtlasTexture, outputType: 0 }
      },
      retainTextureTargets: true
    });

    // Make a simple material that will handle the
    const material = new Material({
      culling: GLSettings.Material.CullSide.NONE,
      uniforms: {
        texture: { type: MaterialUniformType.TEXTURE, value: atlas.texture }
      },
      fragmentShader: new Map([
        [
          renderTarget,
          {
            outputNames: [],
            outputTypes: [0],
            source: `
          precision highp float;

          uniform sampler2D texture;
          varying vec2 _texCoord;

          void main() {
            gl_FragColor = texture2D(texture, _texCoord);
          }
        `
          }
        ]
      ]),
      vertexShader: `
        precision highp float;

        attribute vec2 position;
        attribute vec2 texCoord;
        varying vec2 _texCoord;

        void main() {
          _texCoord = texCoord;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `
    });

    const model = new Model("__atlas_manager__", geometry, material);
    model.vertexCount = allNodes.length * 6;
    model.drawMode = GLSettings.Model.DrawMode.TRIANGLES;

    // Make a dummy scene to cram our model into
    const scene = new Scene();
    scene.add(model);
    // Now perform the rendering to our new texture. This should effectively make our new texture the newly packed
    // version of the previous atlas texture.
    this.renderer.setRenderTarget(renderTarget);
    this.renderer.setViewport(this.renderer.getFullViewport());
    this.renderer.setScissor(this.renderer.getFullViewport());
    this.renderer.render(scene, renderTarget);
    // Clean up anything that will try to retain GPU resources
    material.dispose();
    geometry.destroy();
    renderTarget.dispose();
    // The old texture is no longer needed now!
    atlas.texture.destroy();
    // Apply the new texture to our atlas. The texture should already be applied to all of the valid
    // subtextures already.
    atlas.texture = newAtlasTexture;
    // Set the new packing node as the packing scheme for the texture since it was recalculated. This will allow
    // new nodes to use the new pack layout.
    atlas.packing = rootNode;

    return true;
  }

  /**
   * This targets an existing atlas and attempts to update it with the provided
   * atlas resources.
   */
  async updateAtlas(atlasName: string, requests: IAtlasResourceRequest[]) {
    const atlas = this.allAtlas.get(atlasName);

    if (atlas) {
      for (const request of requests) {
        if (!request.disposeResource) {
          await this.draw(atlas, request);
        }
      }

      // Now that all of the requests have been processed, we can now update
      // reference counting for the underlying resources.
      for (let i = 0, iMax = requests.length; i < iMax; ++i) {
        const request = requests[i];

        if (request.disposeResource) atlas.stopUsingResource(request);
        else atlas.useResource(request);
      }

      // Now resolve the reference counting with the atlas so the atlas can
      // invalidate textures and flag space on the atlas as available for
      // rendering again.
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
