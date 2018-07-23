import { Instance } from "../../../instance-provider";
import { IQuadTreePickingMetrics } from "../../../types";
import { BufferManagerBase, IBufferLocation } from "../buffer-manager-base";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import { IUniformBufferLocation } from "../uniform-buffer-manager";
import { UniformDiffProcessor } from "./uniform-diff-processor";
export declare class UniformQuadDiffProcessor<T extends Instance> extends UniformDiffProcessor<T> {
    quadPicking: IQuadTreePickingMetrics<T>;
    constructor(layer: IInstanceDiffManagerTarget<T>, bufferManager: BufferManagerBase<T, IBufferLocation>);
    addInstance(manager: this, instance: T, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    changeInstance(manager: this, instance: T, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
    removeInstance(manager: this, instance: T, _propIds: number[], uniformCluster?: IUniformBufferLocation): void;
}
