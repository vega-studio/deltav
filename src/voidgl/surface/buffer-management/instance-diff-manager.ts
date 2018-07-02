import { Instance } from '../../instance-provider/instance';
import { IInstanceAttribute, INonePickingMetrics, IQuadTreePickingMetrics, ISinglePickingMetrics, PickType } from '../../types';
import { BufferManagerBase, IBufferLocation } from '../buffer-management';
import { IUniformBufferLocation } from '../buffer-management/uniform-buffer-manager';
import { AtlasResourceManager } from '../texture/atlas-resource-manager';
import { BaseDiffProcessor } from './diff-processors/base-diff-processor';
import { UniformColorDiffProcessor } from './diff-processors/uniform-color-diff-processor';
import { UniformDiffProcessor } from './diff-processors/uniform-diff-processor';
import { UniformQuadDiffProcessor } from './diff-processors/uniform-quad-diff-processor';

/** Signature of a method that handles a diff */
export type DiffHandler<T extends Instance> = (manager: BaseDiffProcessor<T>, instance: T, uniformCluster?: IUniformBufferLocation) => void;
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
  picking: IQuadTreePickingMetrics<T> | ISinglePickingMetrics<T> | INonePickingMetrics;
  /** This is the resource manager for the target which let's us fetch information from an atlas for an instance */
  resource: AtlasResourceManager;
  /** This is the manager that links an instance to it's uniform cluster for populating the uniform buffer */
  bufferManager: BufferManagerBase<T, IBufferLocation>;
}

/**
 * This class manages the process of taking the diffs of a layer and executing methods on those diffs to perform
 * updates to the uniforms that control those instances.
 */
export class InstanceDiffManager<T extends Instance> {
  processor: BaseDiffProcessor<T>;
  processing: DiffLookup<T>;

  layer: IInstanceDiffManagerTarget<T>;

  colorPicking: ISinglePickingMetrics<T>;

  constructor(layer: IInstanceDiffManagerTarget<T>) {
    this.layer = layer;
  }

  /**
   * This returns the proper diff processor for handling diffs
   */
  makeProcessor(): DiffLookup<T> {
    // If this manager has already figured out which processor to use. Just return that processor.
    if (this.processing) return this.processing;

    // Now we look at the state of the layer to determine the best diff processor strategy
    if (this.layer.picking) {
      if (this.layer.picking.type === PickType.ALL) {
        this.processor = new UniformQuadDiffProcessor(this.layer);
      }

      else if (this.layer.picking.type === PickType.SINGLE) {
        this.processor = new UniformColorDiffProcessor(this.layer);
      }
    }

    if (!this.processor) {
      this.processor = new UniformDiffProcessor(this.layer);
    }

    this.processing = [
      this.processor.changeInstance,
      this.processor.addInstance,
      this.processor.removeInstance,
    ];

    return this.processing;
  }
}
