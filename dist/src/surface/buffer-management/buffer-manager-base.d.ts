import { Instance } from "../../instance-provider/instance";
import { InstanceDiff } from "../../instance-provider/instance-provider";
import { Vec2, Vec4 } from "../../math";
import { IInstanceAttributeInternal } from "../../types";
import { Layer } from "../layer";
import { LayerScene } from "../layer-scene";
export declare function isBufferLocation(val: any): val is IBufferLocation;
export declare function isBufferLocationGroup(val: any): val is IBufferLocationGroup<IBufferLocation>;
export interface IBufferLocation {
    attribute: IInstanceAttributeInternal<Instance>;
    block?: number;
    buffer: {
        value: Float32Array | Uint8Array | Vec4[];
    };
    childLocations?: IBufferLocation[];
    instanceIndex: number;
    range: Vec2;
}
export interface IBufferLocationGroup<T extends IBufferLocation> {
    instanceIndex: number;
    propertyToBufferLocation: {
        [key: number]: T;
    };
}
export declare abstract class BufferManagerBase<T extends Instance, U extends IBufferLocation> {
    changeListContext: InstanceDiff<T>[];
    layer: Layer<T, any>;
    scene: LayerScene;
    constructor(layer: Layer<T, any>, scene: LayerScene);
    add: (instance: T) => U | IBufferLocationGroup<U> | undefined;
    changesProcessed(): void;
    abstract destroy(): void;
    abstract getBufferLocations(instance: T): U | IBufferLocationGroup<U> | undefined;
    abstract getActiveAttributePropertyId(): number;
    abstract getInstanceCount(): number;
    abstract getUpdateAllPropertyIdList(): number[];
    incomingChangeList(changes: InstanceDiff<T>[]): void;
    abstract managesInstance(instance: T): boolean;
    remove: (instance: T) => T;
    abstract removeFromScene(): void;
}
