import { Instance } from '../../../instance-provider/instance';
import { InstanceDiff } from '../../../instance-provider/instance-provider';
import { IInstanceAttributeInternal } from '../../../types';
import { Vec } from '../../../util';
import {
  IBufferLocation,
  IBufferLocationGroup,
  isBufferLocationGroup,
} from '../buffer-manager-base';
import { IInstanceAttributeBufferLocationGroup } from '../instance-attribute-buffer-manager';
import { IInstanceDiffManagerTarget } from '../instance-diff-manager';
import { BaseDiffProcessor } from './base-diff-processor';

const EMPTY: number[] = [];
const { min, max } = Math;

/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export class InstanceAttributeDiffProcessor<
  T extends Instance
> extends BaseDiffProcessor<T> {
  /** This tracks a buffer attribute's uid to the range of data that it should update */
  bufferAttributeUpdateRange: {
    [key: number]: [IInstanceAttributeInternal<T>, number, number];
  } = {};

  /**
   * The instance updating is a property instead of a method as we will want to be able to gear shift it for varying levels
   * of adjustments.
   */
  updateInstance: (
    layer: IInstanceDiffManagerTarget<T>,
    instance: T,
    propIds: number[],
    bufferLocations: IBufferLocationGroup<IBufferLocation>,
  ) => void = this.updateInstancePartial;

  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(
    manager: this,
    instance: T,
    _propIds: number[],
    bufferLocations?: IInstanceAttributeBufferLocationGroup,
  ) {
    // If the uniform cluster already exists, then we swap over to a change update
    if (bufferLocations) {
      manager.changeInstance(manager, instance, EMPTY, bufferLocations);
    }

    // Otherwise, we DO need to perform an add and we link a Uniform cluster to our instance
    else {
      const newBufferLocations = manager.layer.bufferManager.add(instance);

      if (isBufferLocationGroup(newBufferLocations)) {
        instance.active = true;
        manager.updateInstance(
          manager.layer,
          instance,
          EMPTY,
          newBufferLocations,
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
    bufferLocations?: IInstanceAttributeBufferLocationGroup,
  ) {
    // If there is an existing uniform cluster for this instance, then we can update the bufferLocations
    if (bufferLocations) {
      manager.updateInstance(manager.layer, instance, propIds, bufferLocations);
    }

    // If we don't have existing bufferLocations, then we must remove the instance
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
    bufferLocations?: IInstanceAttributeBufferLocationGroup,
  ) {
    if (bufferLocations) {
      // We deactivate the instance so it does not render anymore
      instance.active = false;
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
    layer: IInstanceDiffManagerTarget<T>,
    instance: T,
    propIds: number[],
    bufferLocations: IBufferLocationGroup<IBufferLocation>,
  ) {
    const propertyToLocation = bufferLocations.propertyToBufferLocation;
    const bufferAttributeUpdateRange = this.bufferAttributeUpdateRange;
    let location: IBufferLocation;
    let updateValue: Vec;
    let updateRange;
    let childLocations: IBufferLocation[];

    if (instance.active) {
      // If no prop ids provided, then we perform a complete instance property update
      if (propIds.length === 0) {
        propIds = this.bufferManager.getUpdateAllPropertyIdList();
      }

      for (let i = 0, end = propIds.length; i < end; ++i) {
        // First update for the instance attribute itself
        location = propertyToLocation[propIds[i]];
        updateValue = location.attribute.update(instance);
        location.buffer.value.set(updateValue, location.range[0]);
        updateRange = bufferAttributeUpdateRange[location.attribute.uid] || [
          null,
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
        ];
        updateRange[0] = location.attribute;
        updateRange[1] = min(location.range[0], updateRange[1]);
        updateRange[2] = max(location.range[1], updateRange[2]);
        bufferAttributeUpdateRange[location.attribute.uid] = updateRange;

        // Now update any child attributes that would need updating based on the parent attribute changing
        if (location.childLocations) {
          childLocations = location.childLocations;

          for (let k = 0, endk = childLocations.length; k < endk; ++k) {
            location = childLocations[k];
            updateValue = location.attribute.update(instance);
            location.buffer.value.set(updateValue, location.range[0]);
            updateRange = bufferAttributeUpdateRange[
              location.attribute.uid
            ] || [null, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
            updateRange[0] = location.attribute;
            updateRange[1] = min(location.range[0], updateRange[1]);
            updateRange[2] = max(location.range[1], updateRange[2]);
            bufferAttributeUpdateRange[location.attribute.uid] = updateRange;
          }
        }
      }
    }

    // When the instance is inactive all we update is the active attribute to false
    else {
      location =
        propertyToLocation[this.bufferManager.getActiveAttributePropertyId()];
      updateValue = location.attribute.update(instance);
      location.buffer.value.set(updateValue, location.range[0]);
      updateRange = bufferAttributeUpdateRange[location.attribute.uid] || [
        null,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ];
      updateRange[0] = location.attribute;
      updateRange[1] = min(location.range[0], updateRange[1]);
      updateRange[2] = max(location.range[1], updateRange[2]);
      bufferAttributeUpdateRange[location.attribute.uid] = updateRange;
    }
  }

  /**
   * Finalize all of the buffer changes and apply the correct update ranges
   */
  commit() {
    // We now grab all of the attributes and set their update ranges
    const updates = Object.values(this.bufferAttributeUpdateRange);

    for (let i = 0, end = updates.length; i < end; ++i) {
      const update = updates[i];
      const attribute = update[0].bufferAttribute;
      attribute.needsUpdate = true;
      attribute.updateRange = {
        count: update[2] - update[1],
        offset: update[1],
      };
    }

    // Clear the attribute update metrics
    this.bufferAttributeUpdateRange = {};
  }

  /**
   * This will optimize the update method used. If there are enough instances being updated, we will
   * cause the entire attribute buffer to update. If there are not enough, then we will update with
   * additional steps to
   */
  incomingChangeList(_changes: InstanceDiff<T>[]) {
    // TODO: make the updateInstance Method use the partial updater if the change list is small enough
    // make the update instance Method use a full buffer updater if the change list is large enough
  }
}
