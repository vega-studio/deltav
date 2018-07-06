import * as Three from "three";
import { generateLayerModel } from "../surface/generate-layer-model";
import { Layer } from "../surface/layer";
import { Scene } from "../surface/scene";
import { IInstanceAttribute } from "../types";
import { Instance } from "./instance";
import { makeInstanceUniformNameArray } from "./make-instance-uniform-name";

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
export class InstanceUniformManager<T extends Instance> {
  /** The layer this manager provides uniforms */
  private layer: Layer<T, any>;
  /** The scene the layer should add elements to */
  private scene: Scene;
  /** The number of uniform blocks an instance requires */
  private uniformBlocksPerInstance: number;

  /** The generated buffers by this manager */
  private buffers: InstanceUniformBuffer[] = [];
  /** The uniform clusters that are free and can be used by an instance */
  private availableClusters: IUniformInstanceCluster[] = [];

  /** A lookup of an instance to a cluster of uniforms associated with it */
  private instanceToCluster = new Map<T, IUniformInstanceCluster>();
  /** A map of a cluster of uniforms to the buffer it comes from */
  private clusterToBuffer = new Map<
    IUniformInstanceCluster,
    InstanceUniformBuffer
  >();

  constructor(layer: Layer<T, any>, scene: Scene) {
    this.layer = layer;

    let maxUniformBlock: number = 0;
    layer.instanceAttributes.forEach((attributes: IInstanceAttribute<T>) => {
      maxUniformBlock = Math.max(attributes.block, maxUniformBlock);
    });

    this.uniformBlocksPerInstance = maxUniformBlock + 1;
    this.scene = scene;
  }

  /**
   * This adds an instance to the manager and gives the instance an associative
   * block of uniforms to work with.
   */
  add(instance: T) {
    // If there are no available buffers, we must add a buffer
    if (this.availableClusters.length <= 0) {
      this.makeNewBuffer();
    }

    const cluster = this.availableClusters.shift();

    if (cluster) {
      this.instanceToCluster.set(instance, cluster);
    } else {
      console.warn(
        "No valid cluster available for instance added to uniform manager."
      );
    }

    return cluster;
  }

  /**
   * Free all resources this manager may be holding onto
   */
  destroy() {
    this.buffers.forEach(buffer => {
      buffer.geometry.dispose();
      buffer.material.dispose();
    });
  }

  /**
   * This retireves the uniforms associated with an instance, or returns nothing
   * if the instance has not been associated yet.
   */
  getUniforms(instance: T) {
    return this.instanceToCluster.get(instance);
  }

  /**
   * Disassociates an instance with it's group of uniforms and makes the instance
   * in the buffer no longer drawable.
   */
  remove(instance: T) {
    const cluster = this.instanceToCluster.get(instance);

    // If the instance is associated with a cluster, we can add the cluster back to being available
    // For another instance.
    if (cluster) {
      this.instanceToCluster.delete(instance);
      this.availableClusters.unshift(cluster);
    }

    return cluster;
  }

  /**
   * Clears all elements of this manager from the current scene it was in.
   */
  removeFromScene() {
    this.buffers.forEach((buffer, index) => {
      this.scene.container.remove(buffer.model);
    });

    delete this.scene;
  }

  /**
   * Applies the buffers to the provided scene for rendering.
   */
  setScene(scene: Scene) {
    this.buffers.forEach((buffer, index) => {
      this.scene.container.add(buffer.model);
    });

    this.scene = scene;
  }

  /**
   * This generates a new buffer of uniforms to associate instances with.
   */
  private makeNewBuffer() {
    // We generate a new geometry object for the buffer as the geometry
    // Needs to have it's own unique draw range per buffer for optimal
    // Performance
    const newGeometry = new Three.BufferGeometry();
    this.layer.vertexAttributes.forEach(attribute => {
      if (attribute.materialAttribute) {
        newGeometry.addAttribute(attribute.name, attribute.materialAttribute);
      }
    });

    // Ensure the draw range covers every instance in the geometry.
    newGeometry.drawRange.start = 0;
    newGeometry.drawRange.count =
      this.layer.maxInstancesPerBuffer * this.layer.instanceVertexCount;

    // This is the material that is generated for the layer that utilizes all of the generated and
    // Injected shader IO and shader fragments
    const newMaterial = this.layer.material.clone();
    // Now make a Model for the buffer so it can be rendered withn the scene
    const newModel = generateLayerModel(this.layer, newGeometry, newMaterial);
    // We render junkloads of instances in a buffer. Culling will have to happen
    // On an instance level.
    newModel.frustumCulled = false;

    // Make our new buffer which will manage the geometry and everything necessary
    const buffer: InstanceUniformBuffer = {
      activeInstances: [],
      clusters: [],
      firstInstance: 0,
      geometry: newGeometry,
      lastInstance: 0,
      material: newMaterial,
      model: newModel
    };

    this.buffers.push(buffer);

    // Now that we have created a new buffer, we have all of it's uniforms
    // To use to render more instances. We must take the instancing uniforms
    // And divvy them up into clusters for our available buffer.
    let uniformIndex = 0;
    const uniformName = makeInstanceUniformNameArray();
    const instanceData = newMaterial.uniforms[uniformName];

    // We must ensure the vector objects are TOTALLY unique otherwise they'll get shared across buffers
    instanceData.value = instanceData.value.map(
      () => new Three.Vector4(0.0, 0.0, 0.0, 0.0)
    );

    for (let i = 0, end = this.layer.maxInstancesPerBuffer; i < end; ++i) {
      const cluster: IUniformInstanceCluster = {
        instanceIndex: i,
        uniform: instanceData,
        uniformRange: [uniformIndex, 0]
      };

      uniformIndex += this.uniformBlocksPerInstance;
      cluster.uniformRange[1] = uniformIndex;

      buffer.clusters.push(cluster);
      this.availableClusters.push(cluster);
      this.clusterToBuffer.set(cluster, buffer);
    }

    // Grab the global uniforms from the material and add it to the uniform's materialUniform list so that
    // We can keep uniforms consistent across all Instances
    for (let i = 0, end = this.layer.uniforms.length; i < end; ++i) {
      const uniform = this.layer.uniforms[i];
      uniform.materialUniforms.push(newMaterial.uniforms[uniform.name]);
    }

    // Now that we are ready to utilize the buffer, let's add it to the scene so it may be rendered.
    // Each new buffer equates to one draw call.
    if (this.scene) {
      this.scene.container.add(buffer.model);
    }
  }
}
