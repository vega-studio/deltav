import { Instance, InstanceDiff } from '../../../instance-provider';
import { IInstanceDiffManagerTarget } from '../instance-diff-manager';
import { IUniformBufferLocation } from '../uniform-buffer-manager';
import { BaseDiffProcessor } from './base-diff-processor';
/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export declare class UniformDiffProcessor<T extends Instance> extends BaseDiffProcessor<T> {
    /**
     * This processes add operations from changes in the instancing data
     */
    addInstance(manager: this, instance: T, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    /**
     * This processes change operations from changes in the instancing data
     */
    changeInstance(manager: this, instance: T, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    /**
     * This processes remove operations from changes in the instancing data
     */
    removeInstance(manager: this, instance: T, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    /**
     * This performs the actual updating of buffers the instance needs to update
     */
    updateInstance(layer: IInstanceDiffManagerTarget<T>, instance: T, uniformCluster: IUniformBufferLocation): void;
    /**
     * Right now there is no operations for committing for the uniform manager.
     */
    commit(): void;
    /**
     * There are no optimizations available for this processor yet.
     */
    incomingChangeList(_changes: InstanceDiff<T>[]): void;
}
