import { Instance } from '../../instance-provider';
import { Layer } from '../layer';
import { Scene } from '../scene';
import { BufferManagerBase, IBufferLocation, IBufferLocationGroup } from './buffer-manager-base';
/**
 * This represents the location of data for an instance's property to the piece of attribute buffer
 * it will update when it changes.
 */
export interface IInstanceAttributeBufferLocation extends IBufferLocation {
}
/** Represents the Location Groupings for Instance attribute Buffer locations */
export declare type IInstanceAttributeBufferLocationGroup = IBufferLocationGroup<IInstanceAttributeBufferLocation>;
/**
 * This manages instances in how they associate with buffer data for an instanced attribute strategy.
 */
export declare class InstanceAttributeBufferManager<T extends Instance> extends BufferManagerBase<T, IInstanceAttributeBufferLocation> {
    /** This stores an attribute's name to the buffer locations generated for it */
    private allBufferLocations;
    /** This contains the buffer locations the system will have available to the  */
    private availableLocations;
    /** This is the number of instances the buffer draws currently */
    currentInstancedCount: number;
    /** This is the mapped buffer location to the provided Instance */
    private instanceToBufferLocation;
    /**
     * This is the number of times the buffer has grown. This is used to determine how much the buffer will grow
     * for next growth pass.
     */
    private growthCount;
    /** This is the number of instances the buffer currently supports */
    private maxInstancedCount;
    private geometry;
    private material;
    private model;
    private pickModel;
    private attributes;
    /** This is a mapping of all attributes to their associated property ids that, when the property changes, the attribute will be updated */
    private attributeToPropertyIds;
    /**
     * This is a trimmed listing of minimum property ids needed to trigger an update on all properties.
     * This is used by the diffing process mostly to handle adding a new instance.
     */
    private updateAllPropertyIdList;
    /**
     * This is the discovered property id of the active attribute for the instance type this manager manages.
     * This is used by the diffing process to target updates related to deactivating an instance.
     */
    private activePropertyId;
    constructor(layer: Layer<T, any>, scene: Scene);
    /**
     * First instance to be added to this manager will be heavily analyzed for used observables per attribute.
     */
    private doAddWithRegistration(instance);
    /**
     * After the registration add happens, we gear shift over to this add method which will only pair instances
     * with their appropriate buffer location.
     */
    private doAdd(instance);
    destroy(): void;
    /**
     * This retireves the buffer locations associated with an instance, or returns nothing
     * if the instance has not been associated yet.
     */
    getBufferLocations(instance: T): IBufferLocationGroup<IInstanceAttributeBufferLocation>;
    /**
     * This is the property id of the active attribute.
     */
    getActiveAttributePropertyId(): number;
    /**
     * This is the bare minimum property ids that, when triggered for update, will update ALL of the attribute buffers
     * for the managed layer.
     */
    getUpdateAllPropertyIdList(): number[];
    /**
     * Analyzes the list of attributes to the property ids that affects them. This populates the list
     * of minimal property ids needed to trigger updates on all of the attributes.
     */
    private makeUpdateAllPropertyIdList();
    /**
     * Disassociates an instance with a buffer
     */
    remove: (instance: T) => T;
    /**
     * Clears all elements of this manager from the current scene it was in.
     */
    removeFromScene(): void;
    /**
     * This generates a new buffer of uniforms to associate instances with.
     */
    private resizeBuffer();
    /**
     * This takes newly created buffer locations and groups them by the property ids identified by the
     * registration phase.
     */
    private gatherLocationsIntoGroups(attributeToNewBufferLocations, totalNewInstances);
    /**
     * Returns the total instances this buffer manages.
     */
    getInstanceCount(): number;
}
