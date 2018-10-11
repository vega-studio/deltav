import { Instance } from "../../../instance-provider";
import { IQuadTreePickingMetrics, PickType } from "../../../types";
import {
  BufferManagerBase,
  IBufferLocation,
  isBufferLocation
} from "../buffer-manager-base";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import { IUniformBufferLocation } from "../uniform-buffer-manager";
import { UniformDiffProcessor } from "./uniform-diff-processor";

const EMPTY: number[] = [];

/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export class UniformQuadDiffProcessor<
  T extends Instance
> extends UniformDiffProcessor<T> {
  quadPicking: IQuadTreePickingMetrics<T>;

  constructor(
    layer: IInstanceDiffManagerTarget<T>,
    bufferManager: BufferManagerBase<T, IBufferLocation>
  ) {
    super(layer, bufferManager);

    if (layer.picking.type === PickType.ALL) {
      this.quadPicking = layer.picking;
    } else {
      console.warn(
        "Diff Processing Error: A layer has a diff processor requesting Quad Processing but the picking type is not valid."
      );
    }
  }

  /**
   * This processes add operations from changes in the instancing data and manages the layer's quad tree
   * with the instance as well.
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
    }

    // Otherwise, we DO need to perform an add and we link a Uniform cluster to our instance
    else {
      const uniforms = manager.layer.bufferManager.add(instance);

      if (isBufferLocation(uniforms)) {
        instance.active = true;
        instance.easingId = manager.layer.easingId;
        manager.updateInstance(manager.layer, instance, uniforms);

        // Ensure the instance has an updated injection in the quad tree
        manager.quadPicking.quadTree.remove(instance);
        manager.quadPicking.quadTree.add(instance);
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

      // Ensure the instance has an updated injection in the quad tree
      manager.quadPicking.quadTree.remove(instance);
      manager.quadPicking.quadTree.add(instance);
    }

    // If we don't have existing uniforms, then we must remove the instance
    else {
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
      // Remove the easing information the instance gained from being apart of the layer
      instance.clearEasing();
      // We do one last update on the instance to update to it's deactivated state
      manager.updateInstance(manager.layer, instance, uniformCluster);
      // Unlink the instance from the uniform cluster
      manager.layer.bufferManager.remove(instance);
      // Remove the instance from our quad tree
      manager.quadPicking.quadTree.remove(instance);
    }
  }
}
