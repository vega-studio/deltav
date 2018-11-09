import { Instance } from "../../../instance-provider";
import { Layer } from "../../layer";
import { Scene } from "../../scene";
import { BufferManagerBase, IBufferLocation, IBufferLocationGroup } from "../buffer-manager-base";
export interface IInstanceAttributeBufferLocation extends IBufferLocation {
}
export declare type IInstanceAttributeBufferLocationGroup = IBufferLocationGroup<IInstanceAttributeBufferLocation>;
export declare class InstanceAttributeBufferManager<T extends Instance> extends BufferManagerBase<T, IInstanceAttributeBufferLocation> {
    private allBufferLocations;
    private availableLocations;
    currentInstancedCount: number;
    private instanceToBufferLocation;
    private growthCount;
    private maxInstancedCount;
    private geometry?;
    private material?;
    private model?;
    private pickModel?;
    private attributes?;
    private attributeToPropertyIds;
    private updateAllPropertyIdList;
    private activePropertyId;
    constructor(layer: Layer<T, any>, scene: Scene);
    private doAddWithRegistration;
    private doAdd;
    destroy(): void;
    getBufferLocations(instance: T): IBufferLocationGroup<IInstanceAttributeBufferLocation>;
    getActiveAttributePropertyId(): number;
    getUpdateAllPropertyIdList(): number[];
    private makeUpdateAllPropertyIdList;
    remove: (instance: T) => T;
    removeFromScene(): void;
    private resizeBuffer;
    private gatherLocationsIntoGroups;
    getInstanceCount(): number;
}
