import { WebGLRenderer } from "../../gl";
import { Texture } from "../../gl/texture.js";
import { Instance } from "../../instance-provider/instance.js";
import { ILayerProps, Layer } from "../../surface";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion.js";
import { InstanceIOValue, IResourceContext } from "../../types.js";
import { BaseResourceManager, BaseResourceOptions } from "../base-resource-manager.js";
import { Atlas, IAtlasResource } from "./atlas.js";
import { AtlasManager } from "./atlas-manager.js";
import { IAtlasResourceRequest } from "./atlas-resource-request.js";
export interface IAtlasResourceManagerOptions {
    /** This is the atlas manager that handles operations with our atlas' */
    atlasManager?: AtlasManager;
}
/**
 * This class is responsible for tracking resources requested to be placed on an
 * Atlas. This makes sure the resource is uploaded and then properly cached so
 * similar requests return already existing resources. This also manages
 * instances waiting for the resource to be made available.
 */
export declare class AtlasResourceManager extends BaseResourceManager<IAtlasResource, IAtlasResourceRequest> {
    /** This is the resources generated by this manager */
    resources: Map<string, Atlas>;
    /** This is the atlas manager that handles operations with our atlas' */
    atlasManager: AtlasManager;
    /** This stores all of the requests awaiting dequeueing */
    private requestQueue;
    /**
     * This tracks if a resource is already in the request queue. This also stores
     * ALL instances awaiting the resource.
     */
    private requestLookup;
    /**
     * Override the get and set of the webgl renderer so we can also apply it to
     * the atlas manager object
     */
    get webGLRenderer(): WebGLRenderer | undefined;
    set webGLRenderer(val: WebGLRenderer | undefined);
    constructor(options?: IAtlasResourceManagerOptions);
    /**
     * This dequeues all instance requests for a resource and processes the
     * request which will inevitably make the instance active
     */
    dequeueRequests(): Promise<boolean>;
    /**
     * Free ALL resources managed under this resource manager
     */
    destroy(): void;
    /**
     * System requests a resource get's destroyed here
     */
    destroyResource(init: BaseResourceOptions): void;
    /**
     * This retrieves the actual atlas texture that should be applied to a uniform's
     * value.
     */
    getAtlasTexture(key: string): Texture | null;
    /**
     * Get generated resources from this manager
     */
    getResource(resourceKey: string): Atlas | null;
    /**
     * Return the IO Expander necessary to handle the resurce type this manager is
     * attempting to provide for layers.
     */
    getIOExpansion(): BaseIOExpansion[];
    /**
     * Initialize the atlas resources requested for construction
     */
    initResource(resource: BaseResourceOptions): Promise<void>;
    /**
     * This is a request for atlas texture resources. It will produce either the
     * coordinates needed to make valid texture lookups, or it will trigger a
     * loading of resources to an atlas and cause an automated deactivation and
     * reactivation of the instance.
     */
    request<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, instance: Instance, request: IAtlasResourceRequest, _context?: IResourceContext): InstanceIOValue;
    /**
     * System is requesting properties for a resource to be updated.
     */
    updateResource(options: BaseResourceOptions): void;
}
