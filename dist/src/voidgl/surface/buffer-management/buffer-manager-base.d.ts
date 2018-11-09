import { Instance } from "../../instance-provider/instance";
import { IInstanceAttributeInternal } from "../../types";
import { Vec2 } from "../../util";
import { Layer } from "../layer";
import { Scene } from "../scene";
export declare function isBufferLocation(val: any): val is IBufferLocation;
export declare function isBufferLocationGroup(val: any): val is IBufferLocationGroup<IBufferLocation>;
export interface IBufferLocation {
    attribute: IInstanceAttributeInternal<Instance>;
    block?: number;
    buffer: {
        value: Float32Array | Uint8Array;
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
    layer: Layer<T, any>;
    scene: Scene;
    constructor(layer: Layer<T, any>, scene: Scene);
    abstract destroy(): void;
    add: (instance: T) => U | IBufferLocationGroup<U> | undefined;
    abstract getBufferLocations(instance: T): U | IBufferLocationGroup<U> | undefined;
    abstract getActiveAttributePropertyId(): number;
    abstract getInstanceCount(): number;
    abstract getUpdateAllPropertyIdList(): number[];
    remove: (instance: T) => T;
    abstract removeFromScene(): void;
}
