import { Instance } from "../../../instance-provider";
import { ISinglePickingMetrics } from "../../../types";
import { BufferManagerBase, IBufferLocation } from "../buffer-manager-base";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import { IInstanceAttributeBufferLocationGroup } from "./instance-attribute-buffer-manager";
import { InstanceAttributeDiffProcessor } from "./instance-attribute-diff-processor";
/**
 * Manages diffs for layers that are utilizing the base uniform instancing buffer strategy.
 */
export declare class InstanceAttributeColorDiffProcessor<T extends Instance> extends InstanceAttributeDiffProcessor<T> {
    colorPicking: ISinglePickingMetrics<T>;
    constructor(layer: IInstanceDiffManagerTarget<T>, bufferManager: BufferManagerBase<T, IBufferLocation>);
    /**
     * This processes add operations from changes in the instancing data and manages the layer's matching of
     * color / UID to Instance
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
}
