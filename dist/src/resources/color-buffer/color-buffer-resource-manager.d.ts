import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { InstanceIOValue, IResourceContext } from "../../types";
import { BaseResourceManager } from "../base-resource-manager";
import { ColorBufferResource, IColorBufferResource } from "./color-buffer-resource";
import { IColorBufferResourceRequest } from "./color-buffer-resource-request";
/**
 * This manager handles creation and destruction of simple Texture Resources.
 * Render Textures are more used on a higher level with the Surface
 * configuration, so we don't need robust memeory handling for it.
 */
export declare class ColorBufferResourceManager extends BaseResourceManager<IColorBufferResource, IColorBufferResourceRequest> {
    /** These are the generated resources this manager collects and monitors */
    resources: Map<string, ColorBufferResource>;
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
     * This resource has no special IO expansion as it can not be used within a
     * shader's context. It can only be an output target.
     */
    getIOExpansion(): never[];
    /**
     * This retrieves the generated resources this manager tracks.
     */
    getResource(resourceKey: string): ColorBufferResource | null;
    /**
     * The system will inform this manager when a resource is no longer needed and
     * should be disposed.
     */
    destroyResource(options: IColorBufferResource): void;
    /**
     * The system will inform this manager when a resource should be built.
     */
    initResource(options: IColorBufferResource): Promise<void>;
    /**
     * Handle requests that stream in from instances requesting metrics for a
     * specific resource.
     */
    request<U extends Instance, V extends ILayerProps<U>>(_layer: Layer<U, V>, _instance: Instance, resourceRequest: IColorBufferResourceRequest, _context?: IResourceContext): InstanceIOValue;
    /**
     * Trigger that executes when the rendering context resizes. For this manager,
     * we will update all textures with dimensions that are tied to the screen.
     */
    resize(): void;
    /**
     * This targets the specified resource and attempts to update it's settings.
     */
    updateResource(options: IColorBufferResource): void;
}
