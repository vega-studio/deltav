import { Instance } from "../../../instance-provider/instance";
import { InstanceDiff } from "../../../instance-provider/instance-provider";
import { Vec } from "../../../math";
import { IInstanceAttributeInternal } from "../../../types";
import { BaseDiffProcessor } from "../base-diff-processor";
import {
  IBufferLocation,
  IBufferLocationGroup,
  isBufferLocationGroup
} from "../buffer-manager-base";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import {
  IInstanceAttributeBufferLocation,
  IInstanceAttributeBufferLocationGroup
} from "./instance-attribute-buffer-manager";

const EMPTY: number[] = [];
const { min, max } = Math;

enum DiffMode {
  /** This mode will analyze incoming buffer location changes and only update the range of changed buffer */
  PARTIAL,
  /** This mode will not spend time figuring out what has changed for a buffer, rather the whole buffer will get an update */
  FULL
}

/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export class InstanceAttributeDiffProcessor<
  T extends Instance
> extends BaseDiffProcessor<T> {
  /** This is the processor's current diff mode for consuming instance updates. */
  private diffMode: DiffMode = DiffMode.PARTIAL;

  /** This tracks a buffer attribute's uid to the range of data that it should update */
  bufferAttributeUpdateRange: {
    [key: number]: [IInstanceAttributeInternal<T>, number, number];
  } = {};

  /** This tracks a buffer attribute's uid that will perform a complete update */
  bufferAttributeWillUpdate: {
    [key: number]: IInstanceAttributeInternal<T>;
  } = {};

  /**
   * The instance updating is a property instead of a method as we will want to be able to gear shift it for varying levels
   * of adjustments.
   */
  updateInstance: (
    layer: IInstanceDiffManagerTarget<T>,
    instance: T,
    propIds: number[],
    bufferLocations: IBufferLocationGroup<IBufferLocation>
  ) => void = this.updateInstancePartial;

  /**
   * This processes add operations from changes in the instancing data
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
    } else {
      // Otherwise, we DO need to perform an add and we link a Uniform cluster to our instance
      const newBufferLocations = manager.layer.bufferManager.add(instance);

      if (isBufferLocationGroup(newBufferLocations)) {
        instance.active = true;
        instance.easingId = manager.layer.easingId;

        manager.updateInstance(
          manager.layer,
          instance,
          EMPTY,
          newBufferLocations
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
    // If there is an existing uniform cluster for this instance, then we can update the bufferLocations
    if (bufferLocations) {
      manager.updateInstance(manager.layer, instance, propIds, bufferLocations);
    } else {
      // If we don't have existing bufferLocations, then we must add the instance
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
    }
  }

  /**
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstancePartial(
    _layer: IInstanceDiffManagerTarget<T>,
    instance: T,
    propIds: number[],
    bufferLocations: IBufferLocationGroup<IInstanceAttributeBufferLocation>
  ) {
    const propertyToLocation = bufferLocations.propertyToBufferLocation;
    const bufferAttributeUpdateRange = this.bufferAttributeUpdateRange;

    let location: IInstanceAttributeBufferLocation;
    let updateValue: Vec;
    let updateRange;
    let childLocations: IInstanceAttributeBufferLocation[];
    let attribute: IInstanceAttributeInternal<T>;
    let attributeChangeUID;

    if (instance.active) {
      // If no prop ids provided, then we perform a complete instance property update
      if (propIds.length === 0 || instance.reactivate) {
        propIds = this.bufferManager.getUpdateAllPropertyIdList();
      }

      for (let i = 0, end = propIds.length; i < end; ++i) {
        // First update for the instance attribute itself
        location = propertyToLocation[propIds[i]];
        attribute = location.attribute;
        attributeChangeUID = attribute.packUID || attribute.uid;
        updateValue = attribute.update(instance);
        location.buffer.value.set(updateValue, location.range[0]);
        updateRange = bufferAttributeUpdateRange[attributeChangeUID] || [
          null,
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER
        ];
        updateRange[0] = attribute;
        updateRange[1] = min(location.range[0], updateRange[1]);
        updateRange[2] = max(location.range[1], updateRange[2]);
        bufferAttributeUpdateRange[attributeChangeUID] = updateRange;

        // Now update any child attributes that would need updating based on the parent attribute changing
        if (location.childLocations) {
          childLocations = location.childLocations;

          for (let k = 0, endk = childLocations.length; k < endk; ++k) {
            location = childLocations[k];
            attributeChangeUID =
              location.attribute.packUID || location.attribute.uid;
            updateValue = location.attribute.update(instance);
            location.buffer.value.set(updateValue, location.range[0]);
            updateRange = bufferAttributeUpdateRange[attributeChangeUID] || [
              null,
              Number.MAX_SAFE_INTEGER,
              Number.MIN_SAFE_INTEGER
            ];
            updateRange[0] = location.attribute;
            updateRange[1] = min(location.range[0], updateRange[1]);
            updateRange[2] = max(location.range[1], updateRange[2]);
            bufferAttributeUpdateRange[attributeChangeUID] = updateRange;
          }
        }
      }
    } else {
      // When the instance is inactive all we update is the active attribute to false
      location =
        propertyToLocation[this.bufferManager.getActiveAttributePropertyId()];
      attribute = location.attribute;
      attributeChangeUID = attribute.packUID || attribute.uid;
      updateValue = attribute.update(instance);
      location.buffer.value.set(updateValue, location.range[0]);
      updateRange = bufferAttributeUpdateRange[attributeChangeUID] || [
        null,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER
      ];
      updateRange[0] = attribute;
      updateRange[1] = min(location.range[0], updateRange[1]);
      updateRange[2] = max(location.range[1], updateRange[2]);
      bufferAttributeUpdateRange[attributeChangeUID] = updateRange;
    }

    // Make sure the instance reactivation process is not executed again
    instance.reactivate = false;
  }

  /**
   * This performs an update on the buffers with the intent the entire buffer is going to update
   * rather than a chunk of it.
   */
  updateInstanceFull(
    _layer: IInstanceDiffManagerTarget<T>,
    instance: T,
    propIds: number[],
    bufferLocations: IBufferLocationGroup<IInstanceAttributeBufferLocation>
  ) {
    const propertyToLocation = bufferLocations.propertyToBufferLocation;
    const bufferAttributeWillUpdate = this.bufferAttributeWillUpdate;

    let location: IInstanceAttributeBufferLocation;
    let updateValue: Vec;
    let childLocations: IInstanceAttributeBufferLocation[];
    let attribute: IInstanceAttributeInternal<T>;

    if (instance.active) {
      // If no prop ids provided, then we perform a complete instance property update
      if (propIds.length === 0 || instance.reactivate) {
        propIds = this.bufferManager.getUpdateAllPropertyIdList();
      }

      for (let i = 0, end = propIds.length; i < end; ++i) {
        // First update for the instance attribute itself
        location = propertyToLocation[propIds[i]];
        attribute = location.attribute;
        updateValue = attribute.update(instance);
        location.buffer.value.set(updateValue, location.range[0]);
        bufferAttributeWillUpdate[
          attribute.packUID || attribute.uid
        ] = attribute;

        // Now update any child attributes that would need updating based on the parent attribute changing
        if (location.childLocations) {
          childLocations = location.childLocations;

          for (let k = 0, endk = childLocations.length; k < endk; ++k) {
            location = childLocations[k];
            attribute = location.attribute;
            updateValue = attribute.update(instance);
            location.buffer.value.set(updateValue, location.range[0]);
            bufferAttributeWillUpdate[
              attribute.packUID || attribute.uid
            ] = attribute;
          }
        }
      }
    } else {
      // When the instance is inactive all we update is the active attribute to false
      location =
        propertyToLocation[this.bufferManager.getActiveAttributePropertyId()];
      attribute = location.attribute;
      updateValue = attribute.update(instance);
      location.buffer.value.set(updateValue, location.range[0]);
      bufferAttributeWillUpdate[attribute.packUID || attribute.uid] = attribute;
    }

    // Make sure the instance reactivation process is not executed again
    instance.reactivate = false;
  }

  /**
   * Finalize all of the buffer changes and apply the correct update ranges
   */
  commit() {
    // If we're in a partial mode: just update the portion of the buffer that needs updating.
    if (this.diffMode === DiffMode.PARTIAL) {
      // We now grab all of the attributes and set their update ranges
      const updates = Object.values(this.bufferAttributeUpdateRange);

      for (let i = 0, end = updates.length; i < end; ++i) {
        const update = updates[i];
        const attribute = update[0].bufferAttribute;
        attribute.updateRange = {
          count: update[2] - update[1],
          offset: update[1]
        };
      }
    } else {
      // Otherwise just update the full buffer
      // We now grab all of the attributes and set their update ranges
      const updates = Object.values(this.bufferAttributeWillUpdate);

      for (let i = 0, end = updates.length; i < end; ++i) {
        const attribute = updates[i].bufferAttribute;
        attribute.updateRange = {
          count: -1,
          offset: 0
        };
      }
    }

    // Clear the attribute update metrics
    this.bufferAttributeUpdateRange = {};
  }

  /**
   * This will optimize the update method used. If there are enough instances being updated, we will
   * cause the entire attribute buffer to update. If there are not enough, then we will update with
   * additional steps to only update the chunks of the buffer that are affected by the changelist.
   */
  incomingChangeList(changes: InstanceDiff<T>[]) {
    if (changes.length === 0) {
      this.diffMode = DiffMode.PARTIAL;
    } else if (changes.length > this.bufferManager.getInstanceCount() * 0.7) {
      this.diffMode = DiffMode.FULL;
    } else {
      this.diffMode = DiffMode.PARTIAL;
    }

    if (this.diffMode === DiffMode.PARTIAL) {
      this.updateInstance = this.updateInstancePartial;
    } else {
      this.updateInstance = this.updateInstanceFull;
    }
  }
}
