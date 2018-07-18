import { Instance } from '../../instance-provider/instance';
import { IInstanceAttribute, INonePickingMetrics, IQuadTreePickingMetrics, ISinglePickingMetrics } from '../../types';
import { LayerBufferType } from '../layer-processing/layer-buffer-type';
import { AtlasResourceManager } from '../texture/atlas-resource-manager';
import { BufferManagerBase, IBufferLocation } from './buffer-manager-base';
import { IBufferLocationGroup } from './buffer-manager-base';
import { BaseDiffProcessor } from './diff-processors/base-diff-processor';
/** Signature of a method that handles a diff */
export declare type DiffHandler<T extends Instance> = (manager: BaseDiffProcessor<T>, instance: T, propIds: number[], bufferLocations?: IBufferLocation | IBufferLocationGroup<IBufferLocation>) => void;
/** A set of diff handling methods in this order [change, add, remove] */
export declare type DiffLookup<T extends Instance> = DiffHandler<T>[];
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
    /** This is the buffering strategy being used */
    bufferType: LayerBufferType;
}
/**
 * This class manages the process of taking the diffs of a layer and executing methods on those diffs to perform
 * updates to the uniforms that control those instances.
 */
export declare class InstanceDiffManager<T extends Instance> {
    bufferManager: BufferManagerBase<T, IBufferLocation>;
    processor: BaseDiffProcessor<T>;
    processing: DiffLookup<T>;
    layer: IInstanceDiffManagerTarget<T>;
    constructor(layer: IInstanceDiffManagerTarget<T>, bufferManager: BufferManagerBase<T, IBufferLocation>);
    /**
     * This returns the proper diff processor for handling diffs
     */
    makeProcessor(): DiffLookup<T>;
}
