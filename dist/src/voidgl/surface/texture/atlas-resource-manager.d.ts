import * as Three from 'three';
import { InstanceIOValue } from '../../types';
import { Instance } from '../../util/instance';
import { Layer } from '../layer';
import { AtlasManager, AtlasResource } from './atlas-manager';
export interface IAtlasResourceManagerOptions {
    /** This is the atlas manager that handles operations with our atlas' */
    atlasManager: AtlasManager;
}
/**
 * This class is responsible for tracking resources requested to be placed on an Atlas.
 * This makes sure the resource is uploaded and then properly cached so similar requests
 * return already existing resources. This also manages instances waiting for the resource
 * to be made available.
 */
export declare class AtlasResourceManager {
    /** This is the atlas manager that handles operations with our atlas' */
    atlasManager: AtlasManager;
    /** This is the atlas currently targetted by requests */
    targetAtlas: string;
    /** This stores all of the requests awaiting queue */
    requestQueue: AtlasResource[];
    /** This tracks if a resource is already in the request queue. This also stores ALL instances awaiting the resource */
    requestLookup: Map<AtlasResource, [Layer<any, any, any>, Instance][]>;
    constructor(options: IAtlasResourceManagerOptions);
    /**
     * This dequeues all instance requests for a resource and processes the request which will
     * inevitably make the instance active
     */
    dequeueRequests(): Promise<void>;
    /**
     * This retrieves the actual atlas texture that should be applied to a uniform's
     * value.
     */
    getAtlasTexture(key: string): Three.Texture;
    /**
     * This is a request for atlas texture resources. It will produce either the coordinates needed to
     * make valid texture lookups, or it will trigger a loading of resources to an atlas and cause an
     * automated deactivation and reactivation of the instance.
     */
    request(layer: Layer<any, any, any>, instance: Instance, resource: AtlasResource): InstanceIOValue;
    /**
     * This is used by the system to target the correct atlas for subsequent requests to a resource.
     */
    setTargetAtlas(target: string): void;
}
