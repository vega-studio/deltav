import * as Three from "three";
import { Instance } from "../../instance-provider";
import { makeInstanceUniformNameArray } from "../../shaders/util/make-instance-uniform-name";
import { IInstanceAttribute, PickType } from "../../types";
import { uid, Vec2 } from "../../util";
import { Layer } from "../layer";
import { generateLayerModel } from "../layer-processing/generate-layer-model";
import { Scene } from "../scene";
import { BufferManagerBase, IBufferLocation } from "./buffer-manager-base";

export interface IUniformBufferLocation extends IBufferLocation {
  /** This is the index of the instance as it appears in the buffer */
  instanceIndex: number;
  /** This is the instance data uniform */
  buffer: Three.IUniform;
  /** This is the instance data range within the instanceData uniform */
  range: Vec2;
}

export interface InstanceUniformBuffer {
  /** This tracks which instances are active. Helps optimize draw range */
  activeInstances: boolean[];
  /** This is all of the clusters within this buffer */
  clusters: IUniformBufferLocation[];
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
export class UniformBufferManager<T extends Instance> extends BufferManagerBase<
  T,
  IUniformBufferLocation
> {
  /** The number of uniform blocks an instance requires */
  private uniformBlocksPerInstance: number;
  /** The generated buffers by this manager */
  private buffers: InstanceUniformBuffer[] = [];
  /** The uniform clusters that are free and can be used by an instance */
  private availableClusters: IUniformBufferLocation[] = [];
  /** A lookup of an instance to a cluster of uniforms associated with it */
  private instanceToCluster: { [key: number]: IUniformBufferLocation } = {};
  /** A map of a cluster of uniforms to the buffer it comes from */
  private clusterToBuffer = new Map<
    IUniformBufferLocation,
    InstanceUniformBuffer
  >();

  constructor(layer: Layer<T, any>, scene: Scene) {
    super(layer, scene);

    let maxUniformBlock: number = 0;
    layer.instanceAttributes.forEach((attributes: IInstanceAttribute<T>) => {
      maxUniformBlock = Math.max(attributes.block || 0, maxUniformBlock);
    });

    this.uniformBlocksPerInstance = maxUniformBlock + 1;
  }

  /**
   * This adds an instance to the manager and gives the instance an associative
   * block of uniforms to work with.
   */
  add = function(instance: T) {
    // If there are no available buffers, we must add a buffer
    if (this.availableClusters.length <= 0) {
      this.makeNewBuffer();
    }

    const cluster = this.availableClusters.pop();

    if (cluster) {
      this.instanceToCluster[instance.uid] = cluster;
    } else {
      console.warn(
        "No valid cluster available for instance added to uniform manager."
      );
    }

    return cluster;
  };

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
  getBufferLocations(instance: T) {
    return this.instanceToCluster[instance.uid];
  }

  /**
   * TODO: The uniform buffer does not need to utilize this yet. it will be more necessary
   * when this manager updates only changed properties.
   */
  getActiveAttributePropertyId() {
    return -1;
  }

  /**
   * TODO: This is irrelevant tot his manager for now.
   * Number of instances this buffer manages.
   */
  getInstanceCount() {
    return -1;
  }

  /**
   * TODO: The uniform buffer updates ALL attributes every change for any property so far.
   * This should be fixed for performance improvements on the compatibility mode.
   */
  getUpdateAllPropertyIdList() {
    return [];
  }

  /**
   * Disassociates an instance with it's group of uniforms and makes the instance
   * in the buffer no longer drawable.
   */
  remove = function(instance: T) {
    const cluster = this.instanceToCluster[instance.uid];

    // If the instance is associated with a cluster, we can add the cluster back to being available
    // For another instance.
    if (cluster) {
      delete this.instanceToCluster[instance.uid];
      this.availableClusters.push(cluster);
    }

    return instance;
  };

  /**
   * Clears all elements of this manager from the current scene it was in.
   */
  removeFromScene() {
    const scene = this.scene;

    if (scene.container) {
      for (let i = 0, end = this.buffers.length; i < end; ++i) {
        const buffer = this.buffers[i];
        scene.container.remove(buffer.model);
        buffer.pickModel &&
          this.scene.pickingContainer.remove(buffer.pickModel);
      }

      delete this.scene;
    }
  }

  /**
   * Applies the buffers to the provided scene for rendering.
   */
  setScene(scene: Scene) {
    if (scene.container) {
      for (let i = 0, end = this.buffers.length; i < end; ++i) {
        const buffer = this.buffers[i];
        scene.container.add(buffer.model);
        buffer.pickModel && scene.pickingContainer.add(buffer.pickModel);
      }

      this.scene = scene;
    } else {
      console.warn("Can not set a scene that has an undefined container.");
    }
  }

  /**
   * This generates a new buffer of uniforms to associate instances with.
   */
  makeNewBuffer() {
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
      model: newModel,
      pickModel:
        this.layer.picking.type === PickType.SINGLE
          ? newModel.clone()
          : undefined
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

    // TODO: This will go away! To satisfy the changing buffer manager interfaces, we make a
    // fake internal attribute for now
    const fakeAttribute = Object.assign({}, this.layer.instanceAttributes[0], {
      bufferAttribute: new Three.InstancedBufferAttribute(
        new Float32Array(1),
        1
      ),
      uid: uid()
    });

    for (let i = 0, end = this.layer.maxInstancesPerBuffer; i < end; ++i) {
      const cluster: IUniformBufferLocation = {
        attribute: fakeAttribute, // TODO: This is not needed for the uniform method yet. When we break down
        // the uniform updates into attributes, this will be utilized.
        buffer: instanceData,
        instanceIndex: i,
        range: [uniformIndex, 0]
      };

      uniformIndex += this.uniformBlocksPerInstance;
      cluster.range[1] = uniformIndex;

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
    if (this.scene && this.scene.container) {
      this.scene.container.add(buffer.model);
      buffer.pickModel && this.scene.pickingContainer.add(buffer.pickModel);
    }
  }
}
