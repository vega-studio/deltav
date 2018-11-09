import { Instance } from "../../../instance-provider";
import { ISinglePickingMetrics } from "../../../types";
import { BufferManagerBase, IBufferLocation } from "../buffer-manager-base";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import { IInstanceAttributeBufferLocationGroup } from "./instance-attribute-buffer-manager";
import { InstanceAttributeDiffProcessor } from "./instance-attribute-diff-processor";
export declare class InstanceAttributeColorDiffProcessor<T extends Instance> extends InstanceAttributeDiffProcessor<T> {
    colorPicking: ISinglePickingMetrics<T>;
    constructor(layer: IInstanceDiffManagerTarget<T>, bufferManager: BufferManagerBase<T, IBufferLocation>);
    addInstance(manager: this, instance: T, _propIds: number[], bufferLocations?: IInstanceAttributeBufferLocationGroup): void;
    changeInstance(manager: this, instance: T, propIds: number[], bufferLocations?: IInstanceAttributeBufferLocationGroup): void;
    removeInstance(manager: this, instance: T, _propIds: number[], bufferLocations?: IInstanceAttributeBufferLocationGroup): void;
}
