import { BaseDiffProcessor } from "./base-diff-processor.js";
import { BufferManagerBase, IBufferLocation } from "./buffer-manager-base.js";
import { IBufferLocationGroup } from "./buffer-manager-base.js";
import { ILayerProps, ILayerShaderIOInfo } from "../layer.js";
import { INonePickingMetrics, ISinglePickingMetrics, LayerBufferType } from "../../types.js";
import { Instance } from "../../instance-provider/instance.js";
import { ResourceRouter } from "../../resources/index.js";
/** Signature of a method that handles a diff */
export type DiffHandler<TInstance extends Instance, TProps extends ILayerProps<TInstance>> = (manager: BaseDiffProcessor<TInstance, TProps>, instance: TInstance, propIds: number[], bufferLocations?: IBufferLocation | IBufferLocationGroup<IBufferLocation>) => void;
/** A set of diff handling methods in this order [change, add, remove] */
export type DiffLookup<TInstance extends Instance, TProps extends ILayerProps<TInstance>> = DiffHandler<TInstance, TProps>[];
/**
 * This interface is the bare minimum properties needed for this diff manager to
 * map instance updates to uniform changes. We don't use a Layer as a target
 * explicitly to avoid circular/hard dependencies
 */
export interface IInstanceDiffManagerTarget<TInstance extends Instance, TProps extends ILayerProps<TInstance>> {
    /** Contains the shader IO information available in the target */
    shaderIOInfo: ILayerShaderIOInfo<TInstance>;
    /** This is the picking metrics for how Instances are picked with the mouse */
    picking: ISinglePickingMetrics<TInstance> | INonePickingMetrics;
    /**
     * This is the resource manager for the target which let's us fetch
     * information from an atlas for an instance
     */
    resource: ResourceRouter;
    /**
     * This is the manager that links an instance to it's uniform cluster for
     * populating the uniform buffer
     */
    bufferManager: BufferManagerBase<TInstance, TProps, IBufferLocation>;
    /** This is the buffering strategy being used */
    bufferType: LayerBufferType;
    /**
     * This is a hook for the layer to respond to an instance being added via the
     * diff manager. This is a simple opportunity to set some expectations of the
     * instance and tie it directly to the layer it is processing under.
     *
     * For example: the primary case this arose was from instances needing the
     * easing id mapping to allow for retrieval of the instance's easing
     * information for a given layer association.
     *
     * WARNING: This is tied into a MAJOR performance sensitive portion of the
     * framework. This should involve VERY simple assignments at best. Do NOT
     * perform any logic in this callback or your application WILL suffer.
     */
    onDiffAdd?(instance: TInstance): void;
    /**
     * This is an opportunity to clean up any instance's association with the
     * layer it was originally a part of.
     *
     * WARNING: This is tied into a MAJOR performance sensitive portion of the
     * framework. This should involve VERY simple assignments at best. Do NOT
     * perform any logic in this callback or your application WILL suffer.
     *
     * EXTRA WARNING: You better make sure you instantiate this if you
     * instantiated onDiffManagerAdd so you can clean out any bad memory
     * allocation choices you made.
     */
    onDiffRemove?(instance: TInstance): void;
}
/**
 * This is a simple organizational class that generates a diff processor and
 * provides a processing tuple that is used in processing the diffs.
 */
export declare class InstanceDiffManager<TInstance extends Instance, TProps extends ILayerProps<TInstance>> {
    processor?: BaseDiffProcessor<TInstance, TProps>;
    processing?: DiffLookup<TInstance, TProps>;
    /**
     * This returns the proper diff processor for handling diffs
     */
    makeProcessor(layer: IInstanceDiffManagerTarget<TInstance, TProps>, bufferManager: BufferManagerBase<TInstance, TProps, IBufferLocation>): DiffLookup<TInstance, TProps>;
}
