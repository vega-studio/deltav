import { Instance, InstanceDiff } from "../../instance-provider";
import { BufferManagerBase, IBufferLocation, IBufferLocationGroup } from "./buffer-manager-base";
import { IInstanceDiffManagerTarget } from "./instance-diff-manager";
export declare abstract class BaseDiffProcessor<T extends Instance> {
    layer: IInstanceDiffManagerTarget<T>;
    bufferManager: BufferManagerBase<T, IBufferLocation>;
    constructor(layer: IInstanceDiffManagerTarget<T>, bufferManager: BufferManagerBase<T, IBufferLocation>);
    abstract addInstance(manager: this, instance: T, propIds: number[], bufferLocation?: IBufferLocation | IBufferLocationGroup<IBufferLocation>): void;
    abstract changeInstance(manager: this, instance: T, propIds: number[], bufferLocation?: IBufferLocation | IBufferLocationGroup<IBufferLocation>): void;
    abstract removeInstance(manager: this, instance: T, propIds: number[], bufferLocation?: IBufferLocation | IBufferLocationGroup<IBufferLocation>): void;
    abstract commit(): void;
    abstract incomingChangeList(changes: InstanceDiff<T>[]): void;
}
