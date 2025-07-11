import { Instance } from "../../instance-provider/instance.js";
import { ILayerProps, Layer } from "../../surface/layer.js";
import {
  InstanceIOValue,
  IResourceContext,
  ResourceType,
  TextureSize,
} from "../../types.js";
import { BaseResourceManager } from "../base-resource-manager.js";
import { IRenderTextureResource, RenderTexture } from "./render-texture.js";
import { IRenderTextureResourceRequest } from "./render-texture-resource-request.js";
import { TextureIOExpansion } from "./texture-io-expansion.js";

/**
 * This manager handles creation and destruction of simple Texture Resources.
 * Render Textures are more used on a higher level with the Surface
 * configuration, so we don't need robust memeory handling for it.
 */
export class RenderTextureResourceManager extends BaseResourceManager<
  IRenderTextureResource,
  IRenderTextureResourceRequest
> {
  /** These are the generated resources this manager collects and monitors */
  resources = new Map<string, RenderTexture>();

  /**
   * This manager does not need to dequeue requests as all requests will be
   * immediately resolved with no asynchronous requirements.
   */
  async dequeueRequests() {
    // Do nothing. We do not need to trigger a dequeue update as requests will
    // be able to be processed immediately from this manager.
    return false;
  }

  /**
   * This frees up resources when the system indictates this manager is no
   * longer needed.
   */
  destroy() {
    this.resources.forEach((r) => r.destroy());
    this.resources.clear();
  }

  /**
   * We make an expander for when an attribute requests a TEXTURE resource. This
   * will ensure attributes that require a TEXTURE type resource will have the
   * resource added as a uniform.
   */
  getIOExpansion() {
    return [new TextureIOExpansion(ResourceType.TEXTURE, this)];
  }

  /**
   * This retrieves the generated resources this manager tracks.
   */
  getResource(resourceKey: string) {
    return this.resources.get(resourceKey) || null;
  }

  /**
   * The system will inform this manager when a resource is no longer needed and
   * should be disposed.
   */
  destroyResource(options: IRenderTextureResource) {
    const resource = this.resources.get(options.key);
    if (!resource) return;
    resource.destroy();
    this.resources.delete(options.key);
  }

  /**
   * The system will inform this manager when a resource should be built.
   */
  async initResource(options: IRenderTextureResource) {
    let resource = this.resources.get(options.key);

    if (resource) {
      console.warn(
        "Attempted to generate a RenderTexture that already exists for key",
        options.key
      );
      return;
    }

    resource = new RenderTexture(options, this.webGLRenderer);
    this.resources.set(options.key, resource);
  }

  /**
   * Handle requests that stream in from instances requesting metrics for a
   * specific resource.
   */
  request<U extends Instance, V extends ILayerProps<U>>(
    _layer: Layer<U, V>,
    _instance: Instance,
    resourceRequest: IRenderTextureResourceRequest,
    _context?: IResourceContext
  ): InstanceIOValue {
    const resource = this.resources.get(resourceRequest.key);
    if (!resource) return [0, 0, 0, 0];
    resourceRequest.texture = resource.texture;

    return [0, 0, 1, 1];
  }

  /**
   * Trigger that executes when the rendering context resizes. For this manager,
   * we will update all textures with dimensions that are tied to the screen.
   */
  resize() {
    const toUpdate = new Map<string, RenderTexture>();

    this.resources.forEach((resource, key) => {
      // Only do a resize of a texture if any of it's dimensions are tied to the
      // screen.
      if (
        resource.width > TextureSize.SCREEN &&
        resource.height > TextureSize.SCREEN
      ) {
        return;
      }

      // Remove the old texture
      resource.texture.destroy();
      // Regenerate the resource with the new dimensions
      resource = new RenderTexture(resource, this.webGLRenderer);
      toUpdate.set(key, resource);
    });

    toUpdate.forEach((resource, key) => this.resources.set(key, resource));
  }

  /**
   * This targets the specified resource and attempts to update it's settings.
   */
  updateResource(options: IRenderTextureResource) {
    let resource = this.resources.get(options.key);

    if (!resource) {
      console.error(
        `A resource was requested to be updated with key: ${options.key}, but no resource was found`
      );
      return;
    }

    // Change in dimensions requires a texture rebuild.
    if (
      options.height !== resource.height ||
      options.width !== resource.width
    ) {
      // Remove the old texture
      resource.texture.destroy();
      // Regenerate the resource with the new dimensions
      resource = new RenderTexture(options, this.webGLRenderer);
      // Update the resource in the manager
      this.resources.set(options.key, resource);
    }

    // Settings changes are applied to the existing texture.
    else if (options.textureSettings) {
      resource.texture.applySettings(options.textureSettings);
    }

    return;
  }
}
