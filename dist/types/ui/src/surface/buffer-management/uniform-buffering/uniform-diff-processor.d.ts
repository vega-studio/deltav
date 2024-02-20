import { BaseDiffProcessor } from "../base-diff-processor.js";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager.js";
import { ILayerProps } from "../../layer.js";
import { Instance } from "../../../instance-provider/index.js";
import { InstanceDiff } from "../../../types.js";
import { IUniformBufferLocation } from "./uniform-buffer-manager.js";
/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export declare class UniformDiffProcessor<TInstance extends Instance, TProps extends ILayerProps<TInstance>> extends BaseDiffProcessor<TInstance, TProps> {
    /**
     * This processes add operations from changes in the instancing data
     */
    addInstance(manager: this, instance: TInstance, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    /**
     * This processes change operations from changes in the instancing data
     */
    changeInstance(manager: this, instance: TInstance, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    /**
     * This processes remove operations from changes in the instancing data
     */
    removeInstance(manager: this, instance: TInstance, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    /**
     * TODO: We should be updating based on prop ids instead of always updating all props for every change.
     *
     * This performs the actual updating of buffers the instance needs to update
     */
    updateInstance(layer: IInstanceDiffManagerTarget<TInstance, TProps>, instance: TInstance, uniformCluster: IUniformBufferLocation): void;
    /**
     * Right now there is no operations for committing for the uniform manager.
     */
    commit(): void;
    /**
     * There are no optimizations available for this processor yet.
     */
    incomingChangeList(_changes: InstanceDiff<TInstance>[]): void;
}
