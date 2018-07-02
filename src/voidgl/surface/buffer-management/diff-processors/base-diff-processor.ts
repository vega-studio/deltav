import { Instance } from '../../../instance-provider';
import { IBufferLocation } from '../buffer-manager-base';
import { IInstanceDiffManagerTarget } from '../instance-diff-manager';

/**
 * Base requirements for handling diffs from a layer.
 */
export abstract class BaseDiffProcessor<T extends Instance> {
  layer: IInstanceDiffManagerTarget<T>;

  constructor(layer: IInstanceDiffManagerTarget<T>) {
    this.layer = layer;
  }

  /** Perform an 'add' operation for the instance's buffer */
  abstract addInstance(manager: this, instance: T, uniformCluster?: IBufferLocation): void;
  /** Perform a 'change' operation for the instance's buffer */
  abstract changeInstance(manager: this, instance: T, uniformCluster?: IBufferLocation): void;
  /** Perform a 'remove' operation for the instance's buffer */
  abstract removeInstance(manager: this, instance: T, uniformCluster?: IBufferLocation): void;
}
