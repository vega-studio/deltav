import { Instance } from "../../../instance-provider/instance";
import { IInstanceAttributeInternal, InstanceDiff } from "../../../types";
import { BaseDiffProcessor } from "../base-diff-processor";
import { IBufferLocation, IBufferLocationGroup } from "../buffer-manager-base";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import { IInstanceAttributeBufferLocation, IInstanceAttributeBufferLocationGroup } from "./instance-attribute-buffer-manager";
/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export declare class InstanceAttributeDiffProcessor<T extends Instance> extends BaseDiffProcessor<T> {
    /** This is the processor's current diff mode for consuming instance updates. */
    private diffMode;
    /** This tracks a buffer attribute's uid to the range of data that it should update */
    bufferAttributeUpdateRange: {
        [key: number]: [IInstanceAttributeInternal<T>, number, number];
    };
    /** This tracks a buffer attribute's uid that will perform a complete update */
    bufferAttributeWillUpdate: {
        [key: number]: IInstanceAttributeInternal<T>;
    };
    /**
     * The instance updating is a property instead of a method as we will want to be able to gear shift it for varying levels
     * of adjustments.
     */
    updateInstance: (layer: IInstanceDiffManagerTarget<T>, instance: T, propIds: number[], bufferLocations: IBufferLocationGroup<IBufferLocation>) => void;
    /**
     * This processes add operations from changes in the instancing data
     */
    addInstance(manager: this, instance: T, _propIds: number[], bufferLocations?: IInstanceAttributeBufferLocationGroup): void;
    /**
     * This processes change operations from changes in the instancing data
     */
    changeInstance(manager: this, instance: T, propIds: number[], bufferLocations?: IInstanceAttributeBufferLocationGroup): void;
    /**
     * This processes remove operations from changes in the instancing data
     */
    removeInstance(manager: this, instance: T, _propIds: number[], bufferLocations?: IInstanceAttributeBufferLocationGroup): void;
    /**
     * This performs the actual updating of buffers the instance needs to update
     */
    updateInstancePartial(_layer: IInstanceDiffManagerTarget<T>, instance: T, propIds: number[], bufferLocations: IBufferLocationGroup<IInstanceAttributeBufferLocation>): void;
    /**
     * This performs an update on the buffers with the intent the entire buffer is going to update
     * rather than a chunk of it.
     */
    updateInstanceFull(_layer: IInstanceDiffManagerTarget<T>, instance: T, propIds: number[], bufferLocations: IBufferLocationGroup<IInstanceAttributeBufferLocation>): void;
    /**
     * Finalize all of the buffer changes and apply the correct update ranges
     */
    commit(): void;
    /**
     * This will optimize the update method used. If there are enough instances being updated, we will
     * cause the entire attribute buffer to update. If there are not enough, then we will update with
     * additional steps to only update the chunks of the buffer that are affected by the changelist.
     */
    incomingChangeList(changes: InstanceDiff<T>[]): void;
}
