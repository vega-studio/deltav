import { Instance } from "../../../instance-provider";
import { Vec4 } from "../../../math/vector";
import { InstanceDiff } from "../../../types";
import { BaseDiffProcessor } from "../base-diff-processor";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import {
  isUniformBufferLocation,
  IUniformBufferLocation
} from "./uniform-buffer-manager";

// This is a mapping of the vector properties as they relate to an array order
const EMPTY: number[] = [];

/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export class UniformDiffProcessor<T extends Instance> extends BaseDiffProcessor<
  T
> {
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(
    manager: this,
    instance: T,
    _propIds: number[],
    uniformCluster?: IUniformBufferLocation
  ) {
    // If the uniform cluster already exists, then we swap over to a change update
    if (uniformCluster) {
      manager.changeInstance(manager, instance, EMPTY, uniformCluster);
    } else {
      // Otherwise, we DO need to perform an add and we link a Uniform cluster to our instance
      const uniforms = manager.layer.bufferManager.add(instance);

      if (isUniformBufferLocation(uniforms)) {
        instance.active = true;

        if (manager.layer.onDiffManagerAdd) {
          manager.layer.onDiffManagerAdd(instance);
        }

        manager.updateInstance(manager.layer, instance, uniforms);
      }
    }
  }

  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(
    manager: this,
    instance: T,
    _propIds: number[],
    uniformCluster?: IUniformBufferLocation
  ) {
    // If there is an existing uniform cluster for this instance, then we can update the uniforms
    if (uniformCluster) {
      manager.updateInstance(manager.layer, instance, uniformCluster);
    } else {
      // If we don't have existing uniforms, then we must remove the instance
      manager.addInstance(manager, instance, EMPTY, uniformCluster);
    }
  }

  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(
    manager: this,
    instance: T,
    _propIds: number[],
    uniformCluster?: IUniformBufferLocation
  ) {
    if (uniformCluster) {
      // We deactivate the instance so it does not render anymore
      instance.active = false;

      // Execute the remove hook for the instance on behalf of the layer
      if (manager.layer.onDiffManagerRemove) {
        manager.layer.onDiffManagerRemove(instance);
      }

      // We do one last update on the instance to update to it's deactivated state
      manager.updateInstance(manager.layer, instance, uniformCluster);
      // Unlink the instance from the uniform cluster
      manager.layer.bufferManager.remove(instance);
    }
  }

  /**
   * TODO: We should be updating based on prop ids instead of always updating all props for every change.
   *
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstance(
    layer: IInstanceDiffManagerTarget<T>,
    instance: T,
    uniformCluster: IUniformBufferLocation
  ) {
    if (instance.active) {
      const uniforms = uniformCluster.buffer;
      const uniformRangeStart = uniformCluster.range[0];
      const instanceData: Vec4[] = uniforms.value;
      let instanceUniform, value, block, start;
      let k: number, endk;

      // Loop through the instance attributes and update the uniform cluster with the values
      // Calculated for the instance
      for (
        let i = 0, end = layer.shaderIOInfo.instanceAttributes.length;
        i < end;
        ++i
      ) {
        instanceUniform = layer.shaderIOInfo.instanceAttributes[i];
        value = instanceUniform.update(instance);
        block = instanceData[uniformRangeStart + (instanceUniform.block || 0)];
        start = instanceUniform.blockIndex;

        if (start === undefined) {
          continue;
        }

        // Vec4 updating routine. Makes sure the correct components are updated for the provided values
        for (k = start, endk = value.length + start; k < endk; ++k) {
          block[k] = value[k - start];
        }
      }

      uniforms.value = instanceData;
    } else {
      const uniforms = uniformCluster.buffer;
      const uniformRangeStart = uniformCluster.range[0];
      const instanceData: Vec4[] = uniforms.value;
      let instanceUniform, value, block, start;

      // Only update the _active attribute to ensure it is false. When it is false, there is no
      // Point to updating any other uniform
      instanceUniform = layer.shaderIOInfo.activeAttribute;
      value = instanceUniform.update(instance);
      block = instanceData[uniformRangeStart + (instanceUniform.block || 0)];
      start = instanceUniform.blockIndex;

      if (start !== undefined) {
        // Hyper optimized vector filling routine. It uses properties that are globally scoped
        // To greatly reduce overhead
        for (
          let k: number = start, endk = value.length + start;
          k < endk;
          ++k
        ) {
          block[k] = value[k - start];
        }
      }

      uniforms.value = instanceData;
    }
  }

  /**
   * Right now there is no operations for committing for the uniform manager.
   */
  commit() {
    /** no-op */
  }

  /**
   * There are no optimizations available for this processor yet.
   */
  incomingChangeList(_changes: InstanceDiff<T>[]) {
    /** no-op */
  }
}
