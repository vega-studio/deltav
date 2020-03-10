import { Instance } from "../../instance-provider/instance";
import { ResourceRouter } from "../../resources";
import {
  INonePickingMetrics,
  ISinglePickingMetrics,
  LayerBufferType
} from "../../types";
import { ILayerShaderIOInfo } from "../layer";
import { BaseDiffProcessor } from "./base-diff-processor";
import { IBufferLocationGroup } from "./buffer-manager-base";
import { BufferManagerBase, IBufferLocation } from "./buffer-manager-base";
import { InstanceAttributeDiffProcessor } from "./instance-attribute-buffering/instance-attribute-diff-processor";
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
  onDiffAdd?(instance: T): void;

  /**
   * This is an opportunity to clean up any instance's association with the layer it was originally a part of.
   *
   * WARNING: This is tied into a MAJOR performance sensitive portion of the framework. This should involve VERY simple
   * assignments at best. Do NOT perform any logic in this callback or your application WILL suffer.
   *
   * EXTRA WARNING: You better make sure you instantiate this if you instantiated onDiffManagerAdd so you can clean out
   * any bad memory allocation choices you made.
   */
  onDiffRemove?(instance: T): void;
}

/**
 * This is a simple organizational class that generates a diff processor and provides a processing tuple that is used
 * in processing the diffs.
 */
export class InstanceDiffManager<T extends Instance> {
  processor: BaseDiffProcessor<T>;
  processing: DiffLookup<T>;

  /**
   * This returns the proper diff processor for handling diffs
   */
  makeProcessor(
    layer: IInstanceDiffManagerTarget<T>,
    bufferManager: BufferManagerBase<T, IBufferLocation>
  ): DiffLookup<T> {
    // If this manager has already figured out which processor to use. Just return that processor.
    if (this.processing) return this.processing;

    if (
      layer.bufferType === LayerBufferType.INSTANCE_ATTRIBUTE ||
      layer.bufferType === LayerBufferType.INSTANCE_ATTRIBUTE_PACKING
    ) {
      this.processor = new InstanceAttributeDiffProcessor(layer, bufferManager);
    } else {
      this.processor = new UniformDiffProcessor(layer, bufferManager);
    }

    this.processing = [
      this.processor.changeInstance,
      this.processor.addInstance,
      this.processor.removeInstance
    ];

    return this.processing;
  }
}
