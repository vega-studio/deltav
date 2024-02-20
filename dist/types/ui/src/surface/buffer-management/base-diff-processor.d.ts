import { BufferManagerBase, IBufferLocation, IBufferLocationGroup } from "./buffer-manager-base.js";
import { IInstanceDiffManagerTarget } from "./instance-diff-manager.js";
import { ILayerProps } from "../layer.js";
import { Instance } from "../../instance-provider/index.js";
import { InstanceDiff } from "../../types.js";
/**
 * Base requirements for handling diffs from a layer.
 */
export declare abstract class BaseDiffProcessor<TInstance extends Instance, TProps extends ILayerProps<TInstance>> {
    layer: IInstanceDiffManagerTarget<TInstance, TProps>;
    bufferManager: BufferManagerBase<TInstance, TProps, IBufferLocation>;
    constructor(layer: IInstanceDiffManagerTarget<TInstance, TProps>, bufferManager: BufferManagerBase<TInstance, TProps, IBufferLocation>);
    /** Perform an 'add' operation for the instance's buffer */
    abstract addInstance(manager: this, instance: TInstance, propIds: number[], bufferLocation?: IBufferLocation | IBufferLocationGroup<IBufferLocation>): void;
    /** Perform a 'change' operation for the instance's buffer */
    abstract changeInstance(manager: this, instance: TInstance, propIds: number[], bufferLocation?: IBufferLocation | IBufferLocationGroup<IBufferLocation>): void;
    /** Perform a 'remove' operation for the instance's buffer */
    abstract removeInstance(manager: this, instance: TInstance, propIds: number[], bufferLocation?: IBufferLocation | IBufferLocationGroup<IBufferLocation>): void;
    /**
     * This indicates all changes have been applied, this allows the processor to finalize buffer updates
     */
    abstract commit(): void;
    /**
     * This will be called with the changes that WILL be processed. This allows this processor to make extra judgement calls on
     * how it will process the changes and let's it optimize itself before changes are actually processed. An example optimization:
     *
     * Buffers have an update range we can adjust so only a piece of the buffer is updated. However, calculating that range causes
     * overhead to calculate the affected range. So, if we have mass changes happening for major sections of the buffer (number of
     * changes approaches some large percentage of the instances supported by the buffer), then it would be more efficient just to
     * update the entire buffer rather than discover the portion needing updating.
     */
    abstract incomingChangeList(changes: InstanceDiff<TInstance>[]): void;
}
