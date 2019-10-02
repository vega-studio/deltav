import { Instance } from "../../../instance-provider";
import { Layer } from "../../layer";
import { LayerScene } from "../../layer-scene";
import { BufferManagerBase, IBufferLocation, IBufferLocationGroup } from "../buffer-manager-base";
export interface IInstanceAttributeBufferLocation extends IBufferLocation {
    buffer: {
        value: Float32Array | Uint8Array;
    };
    childLocations?: IInstanceAttributeBufferLocation[];
}
export declare type IInstanceAttributeBufferLocationGroup = IBufferLocationGroup<IInstanceAttributeBufferLocation>;
export declare function isInstanceAttributeBufferLocation(val: IBufferLocation): val is IInstanceAttributeBufferLocation;
export declare class InstanceAttributeBufferManager<T extends Instance> extends BufferManagerBase<T, IInstanceAttributeBufferLocation> {
    private allBufferLocations;
    private availableLocations;
    currentInstancedCount: number;
    private instanceToBufferLocation;
    private maxInstancedCount;
    private geometry?;
    private material?;
    private model?;
    private attributes?;
    private attributeToPropertyIds;
    private updateAllPropertyIdList;
    private activePropertyId;
    private currentAvailableLocation;
    constructor(layer: Layer<T, any>, scene: LayerScene);
    changesProcessed(): void;
    private doAddWithRegistration;
    private doAdd;
    destroy(): void;
    getBufferLocations(instance: T): IBufferLocationGroup<IInstanceAttributeBufferLocation>;
    getActiveAttributePropertyId(): number;
    getUpdateAllPropertyIdList(): number[];
    managesInstance(instance: T): boolean;
    private makeUpdateAllPropertyIdList;
    remove: (instance: T) => T;
    removeFromScene(): void;
    private resizeBuffer;
    private gatherLocationsIntoGroups;
    getInstanceCount(): number;
}
