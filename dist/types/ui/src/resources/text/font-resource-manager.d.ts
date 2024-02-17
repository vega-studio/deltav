import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { BaseResourceManager, BaseResourceOptions } from "../base-resource-manager";
import { IFontResourceOptions } from "./font-manager";
import { FontMap } from "./font-map";
import { IFontResourceRequest } from "./font-resource-request";
import { ILayerProps, Layer } from "../../surface/layer";
import { Instance } from "../../instance-provider/instance";
import { InstanceIOValue, IResourceContext } from "../../types";
export interface IFontResourceRequestInternal extends IFontResourceRequest {
    /**
     * This is used to flag a request object as requested so that the same request
     * object can be used for similar resources without generating two request
     * lifecycles.
     */
    isRequested?: boolean;
}
/**
 * This manager controls and manages Font type resources that are requested for
 * generation. This manager will utilize the request given to it to provide the
 * best possible solution in both load times and run time performance available
 * to the manager.
 *
 * This manager will have the ability to handle resources
 */
export declare class FontResourceManager extends BaseResourceManager<IFontResourceOptions, IFontResourceRequest> {
    /**
     * This tracks if a resource is already in the request queue. This also stores
     * ALL instances awaiting the resource.
     */
    private requestLookup;
    /** This stores all of the requests awaiting dequeueing */
    private requestQueue;
    /** This is the lookup for generated font map resources */
    private resourceLookup;
    /** This is the manager that is used to create and update font resources */
    private fontManager;
    /**
     * This is so the system can control when requests are made so this manager
     * has the opportunity to verify and generate the resources the request
     * requires.
     */
    dequeueRequests(): Promise<boolean>;
    /**
     * This will force this manager to free all of it's beloved resources that it
     * manages should it be holding onto resources that can not be freed by lack
     * of references.
     */
    destroy(): void;
    /**
     * Destroy a single resource if the system deems it's time for it to go
     */
    destroyResource(init: BaseResourceOptions): void;
    /**
     * This will provide the resource generated from the initResource operation.
     */
    getResource(resourceKey: string): FontMap | null;
    /**
     * Make the expander to handle making the attribute changes necessary to have
     * the texture applied to a uniform when the attribute places a resource
     * request with a key.
     */
    getIOExpansion(): BaseIOExpansion[];
    /**
     * This is a request to intiialize a resource by this manager.
     */
    initResource(options: BaseResourceOptions): Promise<void>;
    /**
     * This is for attributes making a request for a resource of this type to
     * create shader compatible info regarding the requests properties.
     */
    request<U extends Instance, V extends ILayerProps<U>>(layer: Layer<U, V>, instance: Instance, req: IFontResourceRequest, _context?: IResourceContext): InstanceIOValue;
    /**
     * Responds to the system detecting properties for a resource need updating.
     */
    updateResource(options: BaseResourceOptions): void;
}
