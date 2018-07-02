import { Instance } from '../../../instance-provider';
import { isBufferLocation } from '../buffer-manager-base';
import { IInstanceDiffManagerTarget } from '../instance-diff-manager';
import { IUniformBufferLocation } from '../uniform-buffer-manager';
import { BaseDiffProcessor } from './base-diff-processor';

/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export class InstanceAttributeDiffProcessor<T extends Instance> extends BaseDiffProcessor<T> {
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(manager: this, instance: T, uniformCluster?: IUniformBufferLocation) {
    // If the uniform cluster already exists, then we swap over to a change update
    if (uniformCluster) {
      manager.changeInstance(manager, instance, uniformCluster);
    }

    // Otherwise, we DO need to perform an add and we link a Uniform cluster to our instance
    else {
      const uniforms = manager.layer.bufferManager.add(instance);

      if (isBufferLocation(uniforms)) {
        instance.active = true;
        manager.updateInstance(manager.layer, instance, uniforms);
      }
    }
  }

  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(manager: this, instance: T, uniformCluster?: IUniformBufferLocation) {
    // If there is an existing uniform cluster for this instance, then we can update the uniforms
    if (uniformCluster) {
      manager.updateInstance(manager.layer, instance, uniformCluster);
    }

    // If we don't have existing uniforms, then we must remove the instance
    else {
      manager.addInstance(manager, instance, uniformCluster);
    }
  }

  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(manager: this, instance: T, uniformCluster?: IUniformBufferLocation) {
    if (uniformCluster) {
      // We deactivate the instance so it does not render anymore
      instance.active = false;
      // We do one last update on the instance to update to it's deactivated state
      manager.updateInstance(manager.layer, instance, uniformCluster);
      // Unlink the instance from the uniform cluster
      manager.layer.bufferManager.remove(instance);
    }
  }

  /**
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstance(layer: IInstanceDiffManagerTarget<T>, instance: T, uniformCluster: IUniformBufferLocation) {
    // TODO: Time to make the buffer actually update appropriately.

    if (instance.active) {

    }

    else {

    }
  }
}
