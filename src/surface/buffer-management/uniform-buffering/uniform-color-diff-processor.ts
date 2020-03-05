import { Instance } from "../../../instance-provider";
import { ISinglePickingMetrics, PickType } from "../../../types";
import { BufferManagerBase, IBufferLocation } from "../buffer-manager-base";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import {
  isUniformBufferLocation,
  IUniformBufferLocation
} from "./uniform-buffer-manager";
import { UniformDiffProcessor } from "./uniform-diff-processor";

const EMPTY: number[] = [];

/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export class UniformColorDiffProcessor<
  T extends Instance
> extends UniformDiffProcessor<T> {
  colorPicking: ISinglePickingMetrics<T>;

  constructor(
    layer: IInstanceDiffManagerTarget<T>,
    bufferManager: BufferManagerBase<T, IBufferLocation>
  ) {
    super(layer, bufferManager);

    if (layer.picking.type === PickType.SINGLE) {
      this.colorPicking = layer.picking;
      this.colorPicking.uidToInstance = new Map<number, T>();
    } else {
      console.warn(
        "Diff Processing Error: A layer has a diff processor requesting Color Processing but the picking type is not valid."
      );
    }
  }

  /**
   * This processes add operations from changes in the instancing data and manages the layer's matching of
   * color / UID to Instance
   */
  addInstance(
    manager: this,
    instance: T,
    _propIds: number[],
    uniformCluster: IUniformBufferLocation
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

        // Make sure the instance is mapped to it's UID
        manager.colorPicking.uidToInstance.set(instance.uid, instance);
      } else {
        console.warn(
          "A data cluster was not provided by the manager to associate an instance with."
        );
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
    uniformCluster: IUniformBufferLocation
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
    uniformCluster: IUniformBufferLocation
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
      // Remove the instance from our quad tree
      manager.colorPicking.uidToInstance.delete(instance.uid);
    }
  }
}
