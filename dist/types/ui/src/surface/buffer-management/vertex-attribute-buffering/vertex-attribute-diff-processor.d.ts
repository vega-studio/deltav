import { BaseDiffProcessor } from "../base-diff-processor.js";
import { IInstanceAttributeInternal, InstanceDiff } from "../../../types.js";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager.js";
import { ILayerProps } from "../../layer.js";
import { Instance } from "../../../instance-provider/instance.js";
import { IVertexAttributeBufferLocationGroup } from "./vertex-attribute-buffer-manager.js";
/**
 * Manages diffs for layers that are utilizing the vertex buffer strategy.
 */
export declare class VertexAttributeDiffProcessor<TInstance extends Instance, TProps extends ILayerProps<TInstance>> extends BaseDiffProcessor<TInstance, TProps> {
    /**
     * This is the processor's current diff mode for consuming instance updates.
     */
    private diffMode;
    /**
     * This tracks a buffer attribute's uid to the range of data that it should
     * update
     */
    bufferAttributeUpdateRange: {
        [key: number]: [IInstanceAttributeInternal<TInstance>, number, number];
    };
    /**
     * This tracks a buffer attribute's uid that will perform a complete update
     */
    bufferAttributeWillUpdate: {
        [key: number]: IInstanceAttributeInternal<TInstance>;
    };
    /**
     * The instance updating is a property instead of a method as we will want to
     * be able to gear shift it for varying levels of adjustments.
     */
    updateInstance: (layer: IInstanceDiffManagerTarget<TInstance, TProps>, instance: TInstance, propIds: number[], bufferLocations: IVertexAttributeBufferLocationGroup) => void;
    /**
     * This processes add operations from changes in the instancing data
     */
    addInstance(manager: this, instance: TInstance, _propIds: number[], bufferLocations?: IVertexAttributeBufferLocationGroup): void;
    /**
     * This processes change operations from changes in the instancing data
     */
    changeInstance(manager: this, instance: TInstance, propIds: number[], bufferLocations?: IVertexAttributeBufferLocationGroup): void;
    /**
     * This processes remove operations from changes in the instancing data
     */
    removeInstance(manager: this, instance: TInstance, _propIds: number[], bufferLocations?: IVertexAttributeBufferLocationGroup): void;
    /**
     * This performs the actual updating of buffers the instance needs to update
     */
    updateInstancePartial(layer: IInstanceDiffManagerTarget<TInstance, TProps>, instance: TInstance, propIds: number[], bufferLocations: IVertexAttributeBufferLocationGroup): void;
    /**
     * This performs an update on the buffers with the intent the entire buffer is
     * going to update rather than a chunk of it.
     */
    updateInstanceFull(_layer: IInstanceDiffManagerTarget<TInstance, TProps>, instance: TInstance, propIds: number[], bufferLocations: IVertexAttributeBufferLocationGroup): void;
    /**
     * Finalize all of the buffer changes and apply the correct update ranges
     */
    commit(): void;
    /**
     * This will optimize the update method used. If there are enough instances
     * being updated, we will cause the entire attribute buffer to update. If
     * there are not enough, then we will update with additional steps to only
     * update the chunks of the buffer that are affected by the changelist.
     */
    incomingChangeList(changes: InstanceDiff<TInstance>[]): void;
}
