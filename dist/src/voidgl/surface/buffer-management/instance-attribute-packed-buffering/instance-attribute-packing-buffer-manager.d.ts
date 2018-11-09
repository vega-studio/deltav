import { Instance } from "../../../instance-provider";
import { Layer } from "../../layer";
import { Scene } from "../../scene";
import { BufferManagerBase, IBufferLocation, IBufferLocationGroup } from "../buffer-manager-base";
export interface IInstanceAttributePackingBufferLocation extends IBufferLocation {
}
export declare type IInstanceAttributePackingBufferLocationGroup = IBufferLocationGroup<IInstanceAttributePackingBufferLocation>;
export declare class InstanceAttributePackingBufferManager<T extends Instance> extends BufferManagerBase<T, IInstanceAttributePackingBufferLocation> {
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
    private blockAttributes?;
    private blockSubAttributesLookup;
    private attributeToPropertyIds;
    private updateAllPropertyIdList;
    private activePropertyId;
    constructor(layer: Layer<T, any>, scene: Scene);
    private doAddWithRegistration;
    private doAdd;
    destroy(): void;
    getBufferLocations(instance: T): IBufferLocationGroup<IInstanceAttributePackingBufferLocation>;
    getActiveAttributePropertyId(): number;
    getUpdateAllPropertyIdList(): number[];
    private makeUpdateAllPropertyIdList;
    remove: (instance: T) => T;
    removeFromScene(): void;
    private resizeBuffer;
    private gatherLocationsIntoGroups;
    getInstanceCount(): number;
}
