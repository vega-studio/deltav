import { Instance } from "../../instance-provider/instance.js";
import { ILayerProps, Layer } from "../../surface/layer.js";
import { InstanceIOValue, IResourceContext, TextureSize } from "../../types.js";
import { BaseResourceManager } from "../base-resource-manager.js";
import {
  ColorBufferResource,
  IColorBufferResource,
} from "./color-buffer-resource.js";
import { IColorBufferResourceRequest } from "./color-buffer-resource-request.js";

/**
 * This manager handles creation and destruction of simple Texture Resources.
 * Render Textures are more used on a higher level with the Surface
 * configuration, so we don't need robust memory handling for it.
 */
export class ColorBufferResourceManager extends BaseResourceManager<
  IColorBufferResource,
  IColorBufferResourceRequest
> {
  /** These are the generated resources this manager collects and monitors */
  resources = new Map<string, ColorBufferResource>();

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
   * This resource has no special IO expansion as it can not be used within a
   * shader's context. It can only be an output target.
   */
  getIOExpansion() {
    return [];
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
  destroyResource(options: IColorBufferResource) {
    const resource = this.resources.get(options.key);
    if (!resource) return;
    resource.destroy();
    this.resources.delete(options.key);
  }

  /**
   * The system will inform this manager when a resource should be built.
   */
  async initResource(options: IColorBufferResource) {
    let resource = this.resources.get(options.key);

    if (resource) {
      console.warn(
        "Attempted to generate a RenderTexture that already exists for key",
        options.key
      );
      return;
    }

    resource = new ColorBufferResource(options, this.webGLRenderer);
    this.resources.set(options.key, resource);
  }

  /**
   * Handle requests that stream in from instances requesting metrics for a
   * specific resource.
   */
  request<U extends Instance, V extends ILayerProps<U>>(
    _layer: Layer<U, V>,
    _instance: Instance,
    resourceRequest: IColorBufferResourceRequest,
    _context?: IResourceContext
  ): InstanceIOValue {
    const resource = this.resources.get(resourceRequest.key);
    if (!resource) return [0, 0, 0, 0];
    resourceRequest.colorBuffer = resource.colorBuffer;

    return [0, 0, 1, 1];
  }

  /**
   * Trigger that executes when the rendering context resizes. For this manager,
   * we will update all textures with dimensions that are tied to the screen.
   */
  resize() {
    const toUpdate = new Map<string, ColorBufferResource>();

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
      resource.colorBuffer.destroy();
      // Regenerate the resource with the new dimensions
      resource = new ColorBufferResource(resource, this.webGLRenderer);
      toUpdate.set(key, resource);
    });

    toUpdate.forEach((resource, key) => this.resources.set(key, resource));
  }

  /**
   * This targets the specified resource and attempts to update it's settings.
   */
  updateResource(options: IColorBufferResource) {
    const resource = this.resources.get(options.key);
    if (!resource) return;
    console.warn("UPDATING AN EXISTING COLOR BUFFER IS NOT SUPPORTED YET");
  }
}
