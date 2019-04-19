import { Instance, InstanceDiff } from "../../../instance-provider";
import { BaseDiffProcessor } from "../base-diff-processor";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import { IUniformBufferLocation } from "./uniform-buffer-manager";
export declare class UniformDiffProcessor<T extends Instance> extends BaseDiffProcessor<T> {
    addInstance(manager: this, instance: T, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    changeInstance(manager: this, instance: T, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    removeInstance(manager: this, instance: T, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    updateInstance(layer: IInstanceDiffManagerTarget<T>, instance: T, uniformCluster: IUniformBufferLocation): void;
    commit(): void;
    incomingChangeList(_changes: InstanceDiff<T>[]): void;
}
