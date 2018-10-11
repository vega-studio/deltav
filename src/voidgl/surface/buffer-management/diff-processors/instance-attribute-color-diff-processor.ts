import { Instance } from "../../../instance-provider";
import { ISinglePickingMetrics, PickType } from "../../../types";
import {
  BufferManagerBase,
  IBufferLocation,
  isBufferLocationGroup
} from "../buffer-manager-base";
import { IInstanceAttributeBufferLocationGroup } from "../instance-attribute-buffer-manager";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import { InstanceAttributeDiffProcessor } from "./instance-attribute-diff-processor";

const EMPTY: number[] = [];

/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export class InstanceAttributeColorDiffProcessor<
  T extends Instance
> extends InstanceAttributeDiffProcessor<T> {
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
    bufferLocations?: IInstanceAttributeBufferLocationGroup
  ) {
    // If the uniform cluster already exists, then we swap over to a change update
    if (bufferLocations) {
      manager.changeInstance(manager, instance, EMPTY, bufferLocations);
    }

    // Otherwise, we DO need to perform an add and we link a Uniform cluster to our instance
    else {
      const locations = manager.layer.bufferManager.add(instance);

      if (isBufferLocationGroup(locations)) {
        instance.active = true;
        instance.easingId = manager.layer.easingId;
        manager.updateInstance(manager.layer, instance, EMPTY, locations);

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
    propIds: number[],
    bufferLocations?: IInstanceAttributeBufferLocationGroup
  ) {
    // If there is an existing uniform cluster for this instance, then we can update the uniforms
    if (bufferLocations) {
      manager.updateInstance(manager.layer, instance, propIds, bufferLocations);
    }

    // If we don't have existing uniforms, then we must remove the instance
    else {
      manager.addInstance(manager, instance, EMPTY, bufferLocations);
    }
  }

  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(
    manager: this,
    instance: T,
    _propIds: number[],
    bufferLocations?: IInstanceAttributeBufferLocationGroup
  ) {
    if (bufferLocations) {
      // We deactivate the instance so it does not render anymore
      instance.active = false;
      // Remove the easing information the instance gained from being apart of the layer
      instance.clearEasing();
      // We do one last update on the instance to update to it's deactivated state
      manager.updateInstance(manager.layer, instance, EMPTY, bufferLocations);
      // Unlink the instance from the uniform cluster
      manager.layer.bufferManager.remove(instance);
      // Remove the instance from our quad tree
      manager.colorPicking.uidToInstance.delete(instance.uid);
    }
  }
}
