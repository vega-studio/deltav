import { Instance } from "../../../instance-provider/instance.js";
import { Mat4x4, Vec } from "../../../math/index.js";
import { IInstanceAttributeInternal, InstanceDiff } from "../../../types.js";
import { ILayerProps } from "../../layer.js";
import { BaseDiffProcessor } from "../base-diff-processor.js";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager.js";
import {
  isVertexAttributeBufferLocationGroup,
  IVertexAttributeBufferLocation,
  IVertexAttributeBufferLocationGroup,
} from "./vertex-attribute-buffer-manager.js";

const EMPTY: number[] = [];
const { min, max } = Math;

enum DiffMode {
  /** This mode will analyze incoming buffer location changes and only update the range of changed buffer */
  PARTIAL,
  /** This mode will not spend time figuring out what has changed for a buffer, rather the whole buffer will get an update */
  FULL,
}

/**
 * Manages diffs for layers that are utilizing the vertex buffer strategy.
 */
export class VertexAttributeDiffProcessor<
  TInstance extends Instance,
  TProps extends ILayerProps<TInstance>,
> extends BaseDiffProcessor<TInstance, TProps> {
  /**
   * This is the processor's current diff mode for consuming instance updates.
   */
  private diffMode: DiffMode = DiffMode.PARTIAL;

  /**
   * This tracks a buffer attribute's uid to the range of data that it should
   * update
   */
  bufferAttributeUpdateRange: {
    [key: number]: [IInstanceAttributeInternal<TInstance>, number, number];
  } = {};

  /**
   * This tracks a buffer attribute's uid that will perform a complete update
   */
  bufferAttributeWillUpdate: {
    [key: number]: IInstanceAttributeInternal<TInstance>;
  } = {};

  /**
   * The instance updating is a property instead of a method as we will want to
   * be able to gear shift it for varying levels of adjustments.
   */
  updateInstance: (
    layer: IInstanceDiffManagerTarget<TInstance, TProps>,
    instance: TInstance,
    propIds: number[],
    bufferLocations: IVertexAttributeBufferLocationGroup
  ) => void = this.updateInstancePartial;

  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(
    manager: this,
    instance: TInstance,
    _propIds: number[],
    bufferLocations?: IVertexAttributeBufferLocationGroup
  ) {
    // If the buffer cluster already exists, then we swap over to a change
    // update
    if (bufferLocations) {
      manager.changeInstance(manager, instance, EMPTY, bufferLocations);
    } else {
      // Otherwise, we DO need to perform an add and we link a buffer cluster to
      // our instance
      const newBufferLocations = manager.layer.bufferManager.add(instance);

      if (isVertexAttributeBufferLocationGroup(newBufferLocations)) {
        instance.active = true;

        if (manager.layer.onDiffAdd) {
          manager.layer.onDiffAdd(instance);
        }

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
    instance: TInstance,
    propIds: number[],
    bufferLocations?: IVertexAttributeBufferLocationGroup
  ) {
    // If there is an existing cluster for this instance, then we can update the
    // bufferLocations
    if (bufferLocations) {
      manager.updateInstance(manager.layer, instance, propIds, bufferLocations);
    } else {
      // If we don't have existing bufferLocations, then we must add the
      // instance
      manager.addInstance(manager, instance, EMPTY, bufferLocations);
    }
  }

  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(
    manager: this,
    instance: TInstance,
    _propIds: number[],
    bufferLocations?: IVertexAttributeBufferLocationGroup
  ) {
    if (bufferLocations) {
      // We deactivate the instance so it does not render anymore
      instance.active = false;

      // Execute the remove hook for the instance on behalf of the layer
      if (manager.layer.onDiffRemove) {
        manager.layer.onDiffRemove(instance);
      }

      // We do one last update on the instance to update to it's deactivated
      // state
      manager.updateInstance(manager.layer, instance, EMPTY, bufferLocations);
      // Unlink the instance from the uniform cluster
      manager.layer.bufferManager.remove(instance);
    }
  }

  /**
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstancePartial(
    layer: IInstanceDiffManagerTarget<TInstance, TProps>,
    instance: TInstance,
    propIds: number[],
    bufferLocations: IVertexAttributeBufferLocationGroup
  ) {
    const vertexCount = layer.shaderIOInfo.instanceVertexCount;
    const propertyToLocation = bufferLocations.propertyToBufferLocation;
    const bufferAttributeUpdateRange = this.bufferAttributeUpdateRange;

    let location: IVertexAttributeBufferLocation;
    let updateValue: Vec | Mat4x4;
    let updateRange;
    let childLocations: IVertexAttributeBufferLocation[];
    let attribute: IInstanceAttributeInternal<TInstance>;
    let attributeChangeUID;
    let attributeSize = 0;
    let i, j, z, k, endk, endi, endj;

    if (instance.active) {
      // If no prop ids provided, then we perform a complete instance property
      // update
      if (propIds.length === 0 || instance.reactivate) {
        propIds = this.bufferManager.getUpdateAllPropertyIdList();
      }

      for (i = 0, endi = propIds.length; i < endi; ++i) {
        // First update for the instance attribute itself
        location = propertyToLocation[propIds[i]];
        // Not finding a location can indicate an observable property changed on
        // the instance that is not used by the layer
        if (!location) continue;
        attribute = location.attribute;
        attributeChangeUID = attribute.packUID || attribute.uid;
        updateValue = attribute.update(instance);
        attributeSize = attribute.size || location.end - location.start;

        // location.buffer.value.set(updateValue, location.start);
        // We have to loop through each vertex and fill the vertex with the
        // attribute's value.
        for (
          j = location.start * vertexCount, endj = location.end * vertexCount;
          j < endj;

        ) {
          for (z = 0; z < attributeSize; ++z, ++j) {
            location.buffer.data[j] = updateValue[z];
          }
        }

        updateRange = bufferAttributeUpdateRange[attributeChangeUID] || [
          null,
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
        ];
        updateRange[0] = attribute;
        updateRange[1] = min(location.start * vertexCount, updateRange[1]);
        updateRange[2] = max(location.end * vertexCount, updateRange[2]);
        bufferAttributeUpdateRange[attributeChangeUID] = updateRange;

        // Now update any child attributes that would need updating based on the
        // parent attribute changing
        if (location.childLocations) {
          childLocations = location.childLocations;

          for (k = 0, endk = childLocations.length; k < endk; ++k) {
            location = childLocations[k];
            // Not finding a location can indicate an observable property
            // changed on the instance that is not used by the layer
            if (!location) continue;
            attributeChangeUID =
              location.attribute.packUID || location.attribute.uid;
            updateValue = location.attribute.update(instance);
            attributeSize = attribute.size || location.end - location.start;

            // location.buffer.value.set(updateValue, location.start);
            // We have to loop through each vertex and fill the vertex with the
            // attribute's value.
            for (
              j = location.start * vertexCount,
                endj = location.end * vertexCount;
              j < endj;

            ) {
              for (z = 0; z < attributeSize; ++z, ++j) {
                location.buffer.data[j] = updateValue[z];
              }
            }

            updateRange = bufferAttributeUpdateRange[attributeChangeUID] || [
              null,
              Number.MAX_SAFE_INTEGER,
              Number.MIN_SAFE_INTEGER,
            ];
            updateRange[0] = location.attribute;
            updateRange[1] = min(location.start * vertexCount, updateRange[1]);
            updateRange[2] = max(location.end * vertexCount, updateRange[2]);
            bufferAttributeUpdateRange[attributeChangeUID] = updateRange;
          }
        }
      }
    } else {
      // When the instance is inactive all we update is the active attribute to
      // false
      location =
        propertyToLocation[this.bufferManager.getActiveAttributePropertyId()];
      attribute = location.attribute;
      attributeChangeUID = attribute.packUID || attribute.uid;
      updateValue = attribute.update(instance);
      attributeSize = attribute.size || location.end - location.start;

      // location.buffer.value.set(updateValue, location.start);
      // We have to loop through each vertex and fill the vertex with the
      // attribute's value.
      for (
        j = location.start * vertexCount, endj = location.end * vertexCount;
        j < endj;

      ) {
        for (z = 0; z < attributeSize; ++z, ++j) {
          location.buffer.data[j] = updateValue[z];
        }
      }

      updateRange = bufferAttributeUpdateRange[attributeChangeUID] || [
        null,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ];
      updateRange[0] = attribute;
      updateRange[1] = min(location.start * vertexCount, updateRange[1]);
      updateRange[2] = max(location.end * vertexCount, updateRange[2]);
      bufferAttributeUpdateRange[attributeChangeUID] = updateRange;
    }

    // Make sure the instance reactivation process is not executed again
    instance.reactivate = false;
  }

  /**
   * This performs an update on the buffers with the intent the entire buffer is
   * going to update rather than a chunk of it.
   */
  updateInstanceFull(
    _layer: IInstanceDiffManagerTarget<TInstance, TProps>,
    instance: TInstance,
    propIds: number[],
    bufferLocations: IVertexAttributeBufferLocationGroup
  ) {
    const propertyToLocation = bufferLocations.propertyToBufferLocation;
    const bufferAttributeWillUpdate = this.bufferAttributeWillUpdate;
    const vertexCount = this.layer.shaderIOInfo.instanceVertexCount;

    let location: IVertexAttributeBufferLocation;
    let updateValue: Vec | Mat4x4;
    let childLocations: IVertexAttributeBufferLocation[];
    let attribute: IInstanceAttributeInternal<TInstance>;
    let attributeSize = 0;
    let i, j, k, z, endk, endi, endj;

    if (instance.active) {
      // If no prop ids provided, then we perform a complete instance property
      // update
      if (propIds.length === 0 || instance.reactivate) {
        propIds = this.bufferManager.getUpdateAllPropertyIdList();
      }

      for (i = 0, endi = propIds.length; i < endi; ++i) {
        // First update for the instance attribute itself
        location = propertyToLocation[propIds[i]];
        // Not finding a location can indicate an observable property changed on
        // the instance that is not used by the layer
        if (!location) continue;
        attribute = location.attribute;
        updateValue = attribute.update(instance);
        attributeSize = attribute.size || location.end - location.start;

        // We have to loop through each vertex and fill the vertex with the
        // attribute's value.
        for (
          k = location.start * vertexCount, endk = location.end * vertexCount;
          k < endk;

        ) {
          for (z = 0; z < attributeSize; ++z, ++k) {
            location.buffer.data[k] = updateValue[z];
          }
        }

        bufferAttributeWillUpdate[attribute.packUID || attribute.uid] =
          attribute;

        // Now update any child attributes that would need updating based on the
        // parent attribute changing
        if (location.childLocations) {
          childLocations = location.childLocations;

          for (k = 0, endk = childLocations.length; k < endk; ++k) {
            location = childLocations[k];
            // Not finding a location can indicate an observable property
            // changed on the instance that is not used by the layer
            if (!location) continue;
            attribute = location.attribute;
            updateValue = attribute.update(instance);
            attributeSize = attribute.size || location.end - location.start;

            // location.buffer.value.set(updateValue, location.start);
            // We have to loop through each vertex and fill the vertex with the
            // attribute's value.
            for (
              j = location.start * vertexCount,
                endj = location.end * vertexCount;
              j < endj;

            ) {
              for (z = 0; z < attributeSize; ++z, ++j) {
                location.buffer.data[j] = updateValue[z];
              }
            }

            bufferAttributeWillUpdate[attribute.packUID || attribute.uid] =
              attribute;
          }
        }
      }
    } else {
      // When the instance is inactive all we update is the active attribute to
      // false
      location =
        propertyToLocation[this.bufferManager.getActiveAttributePropertyId()];
      attribute = location.attribute;
      attributeSize = attribute.size || location.end - location.start;
      updateValue = attribute.update(instance);

      // location.buffer.value.set(updateValue, location.start);
      // We have to loop through each vertex and fill the vertex with the
      // attribute's value.
      for (
        j = location.start * vertexCount, endj = location.end * vertexCount;
        j < endj;

      ) {
        for (z = 0; z < attributeSize; ++z, ++j) {
          location.buffer.data[j] = updateValue[z];
        }
      }

      bufferAttributeWillUpdate[attribute.packUID || attribute.uid] = attribute;
    }

    // Make sure the instance reactivation process is not executed again
    instance.reactivate = false;
  }

  /**
   * Finalize all of the buffer changes and apply the correct update ranges
   */
  commit() {
    // If we're in a partial mode: just update the portion of the buffer that
    // needs updating.
    if (this.diffMode === DiffMode.PARTIAL) {
      // We now grab all of the attributes and set their update ranges
      const updates = Object.values(this.bufferAttributeUpdateRange);

      for (let i = 0, end = updates.length; i < end; ++i) {
        const update = updates[i];
        const attribute = update[0].bufferAttribute;
        attribute.updateRange = {
          count: update[2] - update[1],
          offset: update[1],
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
          offset: 0,
        };
      }
    }

    // Clear the attribute update metrics
    this.bufferAttributeUpdateRange = {};
  }

  /**
   * This will optimize the update method used. If there are enough instances
   * being updated, we will cause the entire attribute buffer to update. If
   * there are not enough, then we will update with additional steps to only
   * update the chunks of the buffer that are affected by the changelist.
   */
  incomingChangeList(changes: InstanceDiff<TInstance>[]) {
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
