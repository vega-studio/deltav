import * as Three from 'three';
import { Layer } from '../surface/layer';
import { Scene } from '../surface/scene';
import { Instance } from './instance';
export interface IUniformInstanceCluster {
    /** This is the index of the instance as it appears in the buffer */
    instanceIndex: number;
    /** This is the instance data uniform */
    uniform: Three.IUniform;
    /** This is the instance data range within the instanceData uniform */
    uniformRange: [number, number];
}
export interface InstanceUniformBuffer {
    /** This tracks which instances are active. Helps optimize draw range */
    activeInstances: boolean[];
    /** This is all of the clusters within this buffer */
    clusters: IUniformInstanceCluster[];
    /** The first instance in the draw range */
    firstInstance: number;
    /** The unique geometry object for the buffer: Used to set draw range */
    geometry: Three.BufferGeometry;
    /** The last instance in the draw range */
    lastInstance: number;
    /** The unique material for the buffer: Used to provide a new set of uniforms */
    material: Three.ShaderMaterial;
    /** The unique model generated for the buffer: Used to allow the buffer to be rendered by adding to a scene */
    model: Three.Object3D;
    /** Threejs can not have duplicate objects across Scenes */
    pickModel?: Three.Object3D;
}
/**
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
export declare class InstanceUniformManager<T extends Instance> {
    /** The layer this manager provides uniforms */
    private layer;
    /** The scene the layer should add elements to */
    private scene;
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
    constructor(layer: Layer<T, any>, scene: Scene);
    /**
     * This adds an instance to the manager and gives the instance an associative
     * block of uniforms to work with.
     */
    add(instance: T): IUniformInstanceCluster | undefined;
    /**
     * Free all resources this manager may be holding onto
     */
    destroy(): void;
    /**
     * This retireves the uniforms associated with an instance, or returns nothing
     * if the instance has not been associated yet.
     */
    getUniforms(instance: T): IUniformInstanceCluster | undefined;
    /**
     * Disassociates an instance with it's group of uniforms and makes the instance
     * in the buffer no longer drawable.
     */
    remove(instance: T): IUniformInstanceCluster | undefined;
    /**
     * Clears all elements of this manager from the current scene it was in.
     */
    removeFromScene(): void;
    /**
     * Applies the buffers to the provided scene for rendering.
     */
    setScene(scene: Scene): void;
    /**
     * This generates a new buffer of uniforms to associate instances with.
     */
    private makeNewBuffer();
}
