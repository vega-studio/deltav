import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { InstanceIOValue, IResourceContext } from "../../types";
import { BaseResourceManager } from "../base-resource-manager";
import { IRenderTextureResource, RenderTexture } from "./render-texture";
import { IRenderTextureResourceRequest } from "./render-texture-resource-request";
import { TextureIOExpansion } from "./texture-io-expansion";
/**
 * This manager handles creation and destruction of simple Texture Resources.
 * Render Textures are more used on a higher level with the Surface
 * configuration, so we don't need robust memeory handling for it.
 */
export declare class RenderTextureResourceManager extends BaseResourceManager<IRenderTextureResource, IRenderTextureResourceRequest> {
    /** These are the generated resources this manager collects and monitors */
    resources: Map<string, RenderTexture>;
    /**
     * This manager does not need to dequeue requests as all requests will be
     * immediately resolved with no asynchronous requirements.
     */
    dequeueRequests(): Promise<boolean>;
    /**
     * This frees up resources when the system indictates this manager is no
     * longer needed.
     */
    destroy(): void;
    /**
     * We make an expander for when an attribute requests a TEXTURE resource. This
     * will ensure attributes that require a TEXTURE type resource will have the
     * resource added as a uniform.
     */
    getIOExpansion(): TextureIOExpansion[];
    /**
     * This retrieves the generated resources this manager tracks.
     */
    getResource(resourceKey: string): RenderTexture | null;
    /**
     * The system will inform this manager when a resource is no longer needed and
     * should be disposed.
     */
    destroyResource(options: IRenderTextureResource): void;
    /**
     * The system will inform this manager when a resource should be built.
     */
    initResource(options: IRenderTextureResource): Promise<void>;
    /**
     * Handle requests that stream in from instances requesting metrics for a
     * specific resource.
     */
    request<U extends Instance, V extends ILayerProps<U>>(_layer: Layer<U, V>, _instance: Instance, resourceRequest: IRenderTextureResourceRequest, _context?: IResourceContext): InstanceIOValue;
    /**
     * Trigger that executes when the rendering context resizes. For this manager,
     * we will update all textures with dimensions that are tied to the screen.
     */
    resize(): void;
    /**
     * This targets the specified resource and attempts to update it's settings.
     */
    updateResource(options: IRenderTextureResource): void;
}
