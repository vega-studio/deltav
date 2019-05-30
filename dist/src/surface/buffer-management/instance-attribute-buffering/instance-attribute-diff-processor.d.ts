import { Instance } from "../../../instance-provider/instance";
import { InstanceDiff } from "../../../instance-provider/instance-provider";
import { IInstanceAttributeInternal } from "../../../types";
import { BaseDiffProcessor } from "../base-diff-processor";
import { IBufferLocation, IBufferLocationGroup } from "../buffer-manager-base";
import { IInstanceDiffManagerTarget } from "../instance-diff-manager";
import { IInstanceAttributeBufferLocation, IInstanceAttributeBufferLocationGroup } from "./instance-attribute-buffer-manager";
export declare class InstanceAttributeDiffProcessor<T extends Instance> extends BaseDiffProcessor<T> {
    private diffMode;
    bufferAttributeUpdateRange: {
        [key: number]: [IInstanceAttributeInternal<T>, number, number];
    };
    bufferAttributeWillUpdate: {
        [key: number]: IInstanceAttributeInternal<T>;
    };
    updateInstance: (layer: IInstanceDiffManagerTarget<T>, instance: T, propIds: number[], bufferLocations: IBufferLocationGroup<IBufferLocation>) => void;
    addInstance(manager: this, instance: T, _propIds: number[], bufferLocations?: IInstanceAttributeBufferLocationGroup): void;
    changeInstance(manager: this, instance: T, propIds: number[], bufferLocations?: IInstanceAttributeBufferLocationGroup): void;
    removeInstance(manager: this, instance: T, _propIds: number[], bufferLocations?: IInstanceAttributeBufferLocationGroup): void;
    updateInstancePartial(_layer: IInstanceDiffManagerTarget<T>, instance: T, propIds: number[], bufferLocations: IBufferLocationGroup<IInstanceAttributeBufferLocation>): void;
    updateInstanceFull(_layer: IInstanceDiffManagerTarget<T>, instance: T, propIds: number[], bufferLocations: IBufferLocationGroup<IInstanceAttributeBufferLocation>): void;
    commit(): void;
    incomingChangeList(changes: InstanceDiff<T>[]): void;
}
