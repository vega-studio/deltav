import { Instance } from "../../instance-provider/instance";
import { ResourceRouter } from "../../resources";
import {
  INonePickingMetrics,
  ISinglePickingMetrics,
  LayerBufferType,
  PickType
} from "../../types";
import { ILayerShaderIOInfo } from "../layer";
import { BaseDiffProcessor } from "./base-diff-processor";
import { IBufferLocationGroup } from "./buffer-manager-base";
import { BufferManagerBase, IBufferLocation } from "./buffer-manager-base";
import { InstanceAttributeColorDiffProcessor } from "./instance-attribute-buffering/instance-attribute-color-diff-processor";
import { InstanceAttributeDiffProcessor } from "./instance-attribute-buffering/instance-attribute-diff-processor";
import { UniformColorDiffProcessor } from "./uniform-buffering/uniform-color-diff-processor";
import { UniformDiffProcessor } from "./uniform-buffering/uniform-diff-processor";

/** Signature of a method that handles a diff */
export type DiffHandler<T extends Instance> = (
  manager: BaseDiffProcessor<T>,
  instance: T,
  propIds: number[],
  bufferLocations?: IBufferLocation | IBufferLocationGroup<IBufferLocation>
) => void;
/** A set of diff handling methods in this order [change, add, remove] */
export type DiffLookup<T extends Instance> = DiffHandler<T>[];

/**
 * This interface is the bare minimum properties needed for this diff manager to map instance updates to
 * uniform changes. We don't use a Layer as a target explicitly to avoid circular/hard dependencies
 */
export interface IInstanceDiffManagerTarget<T extends Instance> {
  /** Contains the shader IO information available in the target */
  shaderIOInfo: ILayerShaderIOInfo<T>;
  /** This is the picking metrics for how Instances are picked with the mouse */
  picking: ISinglePickingMetrics<T> | INonePickingMetrics;
  /** This is the resource manager for the target which let's us fetch information from an atlas for an instance */
  resource: ResourceRouter;
  /** This is the manager that links an instance to it's uniform cluster for populating the uniform buffer */
  bufferManager: BufferManagerBase<T, IBufferLocation>;
  /** This is the buffering strategy being used */
  bufferType: LayerBufferType;

  /**
   * This is a hook for the layer to respond to an instance being added via the diff manager. This is a simple
   * opportunity to set some expectations of the instance and tie it directly to the layer it is processing under.
   *
   * For example: the primary case this arose was from instances needing the easing id mapping to allow for retrieval
   * of the instance's easing information for a given layer association.
   *
   * WARNING: This is tied into a MAJOR performance sensitive portion of the framework. This should involve VERY simple
   * assignments at best. Do NOT perform any logic in this callback or your application WILL suffer.
   */
  onDiffManagerAdd?(instance: T): void;

  /**
   * This is an opportunity to clean up any instance's association with the layer it was originally a part of.
   *
   * WARNING: This is tied into a MAJOR performance sensitive portion of the framework. This should involve VERY simple
   * assignments at best. Do NOT perform any logic in this callback or your application WILL suffer.
   *
   * EXTRA WARNING: You better make sure you instantiate this if you instantiated onDiffManagerAdd so you can clean out
   * any bad memory allocation choices you made.
   */
  onDiffManagerRemove?(instance: T): void;
}

/**
 * This class manages the process of taking the diffs of a layer and executing methods on those diffs to perform
 * updates to the uniforms that control those instances.
 */
export class InstanceDiffManager<T extends Instance> {
  bufferManager: BufferManagerBase<T, IBufferLocation>;
  processor: BaseDiffProcessor<T>;
  processing: DiffLookup<T>;
  layer: IInstanceDiffManagerTarget<T>;

  constructor(
    layer: IInstanceDiffManagerTarget<T>,
    bufferManager: BufferManagerBase<T, IBufferLocation>
  ) {
    this.layer = layer;
    this.bufferManager = bufferManager;
  }

  /**
   * This returns the proper diff processor for handling diffs
   */
  makeProcessor(): DiffLookup<T> {
    // If this manager has already figured out which processor to use. Just return that processor.
    if (this.processing) return this.processing;

    if (
      this.layer.bufferType === LayerBufferType.INSTANCE_ATTRIBUTE ||
      this.layer.bufferType === LayerBufferType.INSTANCE_ATTRIBUTE_PACKING
    ) {
      // Now we look at the state of the layer to determine the best diff processor strategy
      if (this.layer.picking) {
        if (this.layer.picking.type === PickType.SINGLE) {
          this.processor = new InstanceAttributeColorDiffProcessor(
            this.layer,
            this.bufferManager
          );
        }
      }

      if (!this.processor) {
        this.processor = new InstanceAttributeDiffProcessor(
          this.layer,
          this.bufferManager
        );
      }
    } else {
      // Now we look at the state of the layer to determine the best diff processor strategy
      if (this.layer.picking) {
        if (this.layer.picking.type === PickType.SINGLE) {
          this.processor = new UniformColorDiffProcessor(
            this.layer,
            this.bufferManager
          );
        }
      }

      if (!this.processor) {
        this.processor = new UniformDiffProcessor(
          this.layer,
          this.bufferManager
        );
      }
    }

    this.processing = [
      this.processor.changeInstance,
      this.processor.addInstance,
      this.processor.removeInstance
    ];

    return this.processing;
  }
}
