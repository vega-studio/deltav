import * as Three from 'three';
import { IInstanceAttribute, IQuadTreePickingMetrics, ISinglePickingMetrics, PickType } from '../types';
import { Instance } from '../util';
import { InstanceUniformManager, IUniformInstanceCluster } from '../util/instance-uniform-manager';
import { AtlasResourceManager } from './texture/atlas-resource-manager';

const VECTOR_ACCESSORS: (keyof Three.Vector4)[] = ['x', 'y', 'z', 'w'];

// We declare any fill vector properties needed out here to maximize optimization
// @ts-ignore: variable-name
let _I_, _END_;

function fillVector(vec: Three.Vector4, start: number, values: number[]) {
  for (_I_ = start, _END_ = values.length + start; _I_ < _END_; ++_I_) {
    vec[VECTOR_ACCESSORS[_I_]] = values[_I_ - start];
  }
}

/** Signature of a method that handles a diff */
export type DiffHandler<T extends Instance> = (manager: InstanceDiffManager<T>, instance: T, uniformCluster: IUniformInstanceCluster) => void;
/** A set of diff handling methods in this order [change, add, remove] */
export type DiffLookup<T extends Instance> = DiffHandler<T>[];

/**
 * This interface is the bare minimum properties needed for this diff manager to map instance updates to
 * uniform changes. We don't use a Layer as a target explicitly to avoid circular/hard dependencies
 */
export interface IInstanceDiffManagerTarget<T extends Instance> {
  /** This is the attribute for the target that represents the _active injected value */
  activeAttribute: IInstanceAttribute<T>;
  /** This is all of the instance attributes applied to the target */
  instanceAttributes: IInstanceAttribute<T>[];
  /** This is the picking metrics for how Instances are picked with the mouse */
  picking: IQuadTreePickingMetrics<T> | ISinglePickingMetrics;
  /** This is the resource manager for the target which let's us fetch information from an atlas for an instance */
  resource: AtlasResourceManager;
  /** This is the manager that links an instance to it's uniform cluster for populating the uniform buffer */
  uniformManager: InstanceUniformManager<T>;
}

/**
 * This class manages the process of taking the diffs of a layer and executing methods on those diffs to perform
 * updates to the uniforms that control those instances.
 */
export class InstanceDiffManager<T extends Instance> {
  layer: IInstanceDiffManagerTarget<T>;
  quadPicking: IQuadTreePickingMetrics<T>;

  constructor(layer: IInstanceDiffManagerTarget<T>) {
    this.layer = layer;
  }

  /**
   * This returns the proper diff processor for handling diffs
   */
  getDiffProcessor(): DiffLookup<T> {
    if (this.layer.picking) {
      if (this.layer.picking.type === PickType.ALL) {
        this.quadPicking = this.layer.picking;

        return [
          this.changeInstanceQuad,
          this.addInstanceQuad,
          this.removeInstanceQuad,
        ];
      }
    }

    return [
      this.changeInstance,
      this.addInstance,
      this.removeInstance,
    ];
  }

  /**
   * This processes add operations from changes in the instancing data
   */
  private addInstance(manager: this, instance: T, uniformCluster: IUniformInstanceCluster) {
    // If the uniform cluster already exists, then we swap over to a change update
    if (uniformCluster) {
      manager.changeInstance(manager, instance, uniformCluster);
    }

    // Otherwise, we DO need to perform an add and we link a Uniform cluster to our instance
    else {
      const uniforms = manager.layer.uniformManager.add(instance);
      instance.active = true;
      manager.updateInstance(instance, uniforms);
    }
  }

  /**
   * This processes add operations from changes in the instancing data and manages the layer's quad tree
   * with the instance as well.
   */
  private addInstanceQuad(manager: this, instance: T, uniformCluster: IUniformInstanceCluster) {
    // If the uniform cluster already exists, then we swap over to a change update
    if (uniformCluster) {
      manager.changeInstance(manager, instance, uniformCluster);
    }

    // Otherwise, we DO need to perform an add and we link a Uniform cluster to our instance
    else {
      const uniforms = manager.layer.uniformManager.add(instance);
      instance.active = true;
      manager.updateInstance(instance, uniforms);

      // Ensure the instance has an updated injection in the quad tree
      this.quadPicking.quadTree.remove(instance);
      this.quadPicking.quadTree.add(instance);
    }
  }

  /**
   * This processes change operations from changes in the instancing data
   */
  private changeInstance(manager: this, instance: T, uniformCluster: IUniformInstanceCluster) {
    // If there is an existing uniform cluster for this instance, then we can update the uniforms
    if (uniformCluster) {
      manager.updateInstance(instance, uniformCluster);
    }

    // If we don't have existing uniforms, then we must remove the instance
    else {
      manager.addInstance(manager, instance, uniformCluster);
    }
  }

  /**
   * This processes change operations from changes in the instancing data
   */
  private changeInstanceQuad(manager: this, instance: T, uniformCluster: IUniformInstanceCluster) {
    // If there is an existing uniform cluster for this instance, then we can update the uniforms
    if (uniformCluster) {
      manager.updateInstance(instance, uniformCluster);

      // Ensure the instance has an updated injection in the quad tree
      this.quadPicking.quadTree.remove(instance);
      this.quadPicking.quadTree.add(instance);
    }

    // If we don't have existing uniforms, then we must remove the instance
    else {
      manager.addInstance(manager, instance, uniformCluster);
    }
  }

  /**
   * This processes remove operations from changes in the instancing data
   */
  private removeInstance(manager: this, instance: T, uniformCluster: IUniformInstanceCluster) {
    if (uniformCluster) {
      // We deactivate the instance so it does not render anymore
      instance.active = false;
      // We do one last update on the instance to update to it's deactivated state
      manager.updateInstance(instance, uniformCluster);
      // Unlink the instance from the uniform cluster
      manager.layer.uniformManager.remove(instance);
    }
  }

  /**
   * This processes remove operations from changes in the instancing data
   */
  private removeInstanceQuad(manager: this, instance: T, uniformCluster: IUniformInstanceCluster) {
    if (uniformCluster) {
      // We deactivate the instance so it does not render anymore
      instance.active = false;
      // We do one last update on the instance to update to it's deactivated state
      manager.updateInstance(instance, uniformCluster);
      // Unlink the instance from the uniform cluster
      manager.layer.uniformManager.remove(instance);
      // Remove the instance from our quad tree
      this.quadPicking.quadTree.remove(instance);
    }
  }

  private updateInstance(instance: T, uniformCluster: IUniformInstanceCluster) {
    if (instance.active) {
      const uniforms = uniformCluster.uniform;
      const uniformRangeStart = uniformCluster.uniformRange[0];
      const instanceData: Three.Vector4[] = uniforms.value;
      let instanceUniform, value, block, start;
      let k, endk;

      // Loop through the instance attributes and update the uniform cluster with the valaues
      // Calculated for the instance
      for (let i = 0, end = this.layer.instanceAttributes.length; i < end; ++i) {
        instanceUniform = this.layer.instanceAttributes[i];
        value = instanceUniform.update(instance);
        block = instanceData[uniformRangeStart + instanceUniform.block];
        instanceUniform.atlas && this.layer.resource.setTargetAtlas(instanceUniform.atlas.key);
        start = instanceUniform.blockIndex;

        // Hyper optimized vector filling routine. It uses properties that are globally scoped
        // To greatly reduce overhead
        for (k = start, endk = value.length + start; k < endk; ++k) {
          block[VECTOR_ACCESSORS[k]] = value[k - start];
        }
      }

      uniforms.value = instanceData;
    }

    else {
      const uniforms: Three.IUniform = uniformCluster.uniform;
      const uniformRangeStart = uniformCluster.uniformRange[0];
      const instanceData: Three.Vector4[] = uniforms.value;
      let instanceUniform, value, block;

      // Only update the _active attribute to ensure it is false. When it is false, there is no
      // Point to updating any other uniform
      instanceUniform = this.layer.activeAttribute;
      value = instanceUniform.update(instance);
      block = instanceData[uniformRangeStart + instanceUniform.block];
      instanceUniform.atlas && this.layer.resource.setTargetAtlas(instanceUniform.atlas.key);
      fillVector(block, instanceUniform.blockIndex, value);

      uniforms.value = instanceData;
    }
  }
}
