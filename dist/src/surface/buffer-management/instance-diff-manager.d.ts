import { Instance } from "../../instance-provider/instance";
import { IInstanceAttribute, INonePickingMetrics, IQuadTreePickingMetrics, ISinglePickingMetrics } from "../../types";
import { LayerBufferType } from "../layer-processing/layer-buffer-type";
import { AtlasResourceManager } from "../texture/atlas-resource-manager";
import { BaseDiffProcessor } from "./base-diff-processor";
import { IBufferLocationGroup } from "./buffer-manager-base";
import { BufferManagerBase, IBufferLocation } from "./buffer-manager-base";
export declare type DiffHandler<T extends Instance> = (manager: BaseDiffProcessor<T>, instance: T, propIds: number[], bufferLocations?: IBufferLocation | IBufferLocationGroup<IBufferLocation>) => void;
export declare type DiffLookup<T extends Instance> = DiffHandler<T>[];
export interface IInstanceDiffManagerTarget<T extends Instance> {
    activeAttribute: IInstanceAttribute<T>;
    easingId: {
        [key: string]: number;
    };
    instanceAttributes: IInstanceAttribute<T>[];
    picking: IQuadTreePickingMetrics<T> | ISinglePickingMetrics<T> | INonePickingMetrics;
    resource: AtlasResourceManager;
    bufferManager: BufferManagerBase<T, IBufferLocation>;
    bufferType: LayerBufferType;
}
export declare class InstanceDiffManager<T extends Instance> {
    bufferManager: BufferManagerBase<T, IBufferLocation>;
    processor: BaseDiffProcessor<T>;
    processing: DiffLookup<T>;
    layer: IInstanceDiffManagerTarget<T>;
    constructor(layer: IInstanceDiffManagerTarget<T>, bufferManager: BufferManagerBase<T, IBufferLocation>);
    makeProcessor(): DiffLookup<T>;
}
