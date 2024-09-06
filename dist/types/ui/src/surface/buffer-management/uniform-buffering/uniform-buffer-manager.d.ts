import { Geometry, Material, Model } from "../../../gl";
import { BufferManagerBase, IBufferLocation } from "../buffer-manager-base";
import { ILayerProps, Layer } from "../../layer";
import { IMaterialUniform, MaterialUniformType } from "../../../gl/types";
import { Instance } from "../../../instance-provider";
import { LayerScene } from "../../layer-scene";
export interface IUniformBufferLocation extends IBufferLocation {
    /** This is the index of the instance as it appears in the buffer */
    instanceIndex: number;
    /** This is the instance data uniform */
    buffer: IMaterialUniform<MaterialUniformType.VEC4_ARRAY>;
    /** This is the instance data range start within the instanceData uniform */
    start: number;
    /** This is the instance data range end within the instanceData uniform */
    end: number;
}
/**
 * Typeguard for uniform buffer locations
 */
export declare function isUniformBufferLocation(val: any): val is IUniformBufferLocation;
export interface InstanceUniformBuffer {
    /** This tracks which instances are active. Helps optimize draw range */
    activeInstances: boolean[];
    /** This is all of the clusters within this buffer */
    clusters: IUniformBufferLocation[];
    /** The first instance in the draw range */
    firstInstance: number;
    /** The unique geometry object for the buffer: Used to set draw range */
    geometry: Geometry;
    /** The last instance in the draw range */
    lastInstance: number;
    /** The unique material for the buffer: Used to provide a new set of uniforms */
    material: Material;
    /** The unique model generated for the buffer: Used to allow the buffer to be rendered by adding to a scene */
    model: Model;
}
/**
 * This is a Buffer Management system that performs instancing via the uniforms available to the hardware.
 * This improves compatibility with instancing for systems DRAMATICALLY as ALL systems WILL support uniforms.
 * This will NOT perform the best against true hardware instancing support, but it will have edge cases where it
 * is needed.
 *
 * When a layer has too many instance + vertex attributes for the hardware, the system will defer to this buffer methodology.
 *
 * This class does a whoooooole lot of making the magical instancing optimization controls possible.
 *
 * Our instancing hackyness comes from the idea that uniforms are fast, and you don't have to commit
 * ALL of them when you touch just a little piece, and you don't have worry about drivers not supporting
 * partial vertex buffer updates.
 *
 * This also is WebGL 1.0 compatible without any extensions that are poorly implemented. And again: does
 * NOT require entire attribute buffer commits.
 *
 * Uniforms are limited for any given draw call. So we have to create multiple materials to support
 * chunks of the instances that need to be drawn. We then have to associate an instance with the set
 * of uniforms that is related to the instance and keep them paired together. If we have too many instances
 * we must generate more buffers to accomodate them.
 *
 * If we remove instances, we must free up the uniform set so that others can use the uniforms. While the uniforms
 * are not in use, the instance should not be rendering.
 */
export declare class UniformBufferManager<TInstance extends Instance, TProps extends ILayerProps<TInstance>> extends BufferManagerBase<TInstance, TProps, IUniformBufferLocation> {
    /** The number of uniform blocks an instance requires */
    private uniformBlocksPerInstance;
    /** The generated buffers by this manager */
    private buffers;
    /** The uniform clusters that are free and can be used by an instance */
    private availableClusters;
    /** A lookup of an instance to a cluster of uniforms associated with it */
    private instanceToCluster;
    /** A map of a cluster of uniforms to the buffer it comes from */
    private clusterToBuffer;
    constructor(layer: Layer<TInstance, any>, scene: LayerScene);
    /**
     * This adds an instance to the manager and gives the instance an associative
     * block of uniforms to work with.
     */
    add: (instance: TInstance) => IUniformBufferLocation | undefined;
    /**
     * Free all resources this manager may be holding onto
     */
    destroy(): void;
    /**
     * This retireves the uniforms associated with an instance, or returns nothing
     * if the instance has not been associated yet.
     */
    getBufferLocations(instance: TInstance): IUniformBufferLocation;
    /**
     * TODO: The uniform buffer does not need to utilize this yet. it will be more necessary
     * when this manager updates only changed properties.
     */
    getActiveAttributePropertyId(): number;
    /**
     * TODO: This is irrelevant tot his manager for now.
     * Number of instances this buffer manages.
     */
    getInstanceCount(): number;
    /**
     * TODO: The uniform buffer updates ALL attributes every change for any property so far.
     * This should be fixed for performance improvements on the compatibility mode.
     */
    getUpdateAllPropertyIdList(): never[];
    /**
     * Checks to see if the instance is managed by this manager.
     */
    managesInstance(instance: TInstance): boolean;
    /**
     * Disassociates an instance with it's group of uniforms and makes the instance
     * in the buffer no longer drawable.
     */
    remove: (instance: TInstance) => TInstance;
    /**
     * Clears all elements of this manager from the current scene it was in.
     */
    removeFromScene(): void;
    /**
     * Applies the buffers to the provided scene for rendering.
     */
    setScene(scene: LayerScene): void;
    /**
     * This generates a new buffer of uniforms to associate instances with.
     */
    makeNewBuffer(): void;
}
