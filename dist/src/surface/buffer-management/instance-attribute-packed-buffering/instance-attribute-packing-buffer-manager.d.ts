import { Instance } from "../../../instance-provider";
import { Layer } from "../../layer";
import { LayerScene } from "../../layer-scene";
import { BufferManagerBase, IBufferLocation, IBufferLocationGroup } from "../buffer-manager-base";
/**
 * This represents the location of data for an instance's property to the piece of attribute buffer
 * it will update when it changes.
 */
export interface IInstanceAttributePackingBufferLocation extends IBufferLocation {
}
/** Represents the Location Groupings for Instance attribute Buffer locations */
export declare type IInstanceAttributePackingBufferLocationGroup = IBufferLocationGroup<IInstanceAttributePackingBufferLocation>;
/**
 * This manages instances in how they associate with buffer data for an instanced attribute strategy that is
 * packed tightly.
 */
export declare class InstanceAttributePackingBufferManager<T extends Instance> extends BufferManagerBase<T, IInstanceAttributePackingBufferLocation> {
    /** This stores an attribute's name to the buffer locations generated for it */
    private allBufferLocations;
    /** This contains the buffer locations the system will have available */
    private availableLocations;
    /** This is the number of instances the buffer draws currently */
    currentInstancedCount: number;
    /** This is the mapped buffer location to the provided Instance */
    private instanceToBufferLocation;
    /** This is the number of instances the buffer currently supports */
    private maxInstancedCount;
    private geometry?;
    private material?;
    private model?;
    private attributes?;
    private blockAttributes?;
    private blockSubAttributesLookup;
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
    /**
     * As changes are processed, instances will be added into the buffers. As they are added in, the instance
     * will take over available locations within the buffer. Normally we would have these available locations
     * in a queue and we would push and shift into that queue to retrieve the locations; however, shifting queues
     * when done in VERY large quantities causes javascript to lag horrendously. Thus we instead have this index
     * to monitor the next available item to pull during processing changes. AFTER changes have been processed
     * we perform a one time operation splice to delete any list of available locations that have been used. This
     * GREATLY improves performance for these types of operations.
     */
    private currentAvailableLocation;
    constructor(layer: Layer<T, any>, scene: LayerScene);
    /**
     * This is the tail end of processing changes and lets us clean up anything that might have been used to aid in the
     * processing.
     */
    changesProcessed(): void;
    /**
     * First instance to be added to this manager will be heavily analyzed for used observables per attribute.
     */
    private doAddWithRegistration;
    /**
     * After the registration add happens, we gear shift over to this add method which will only pair instances
     * with their appropriate buffer location.
     */
    private doAdd;
    /**
     * Destroy this manager and clear out all elements utilized within the scene.
     */
    destroy(): void;
    /**
     * This retireves the buffer locations associated with an instance, or returns nothing
     * if the instance has not been associated yet.
     */
    getBufferLocations(instance: T): IBufferLocationGroup<IInstanceAttributePackingBufferLocation>;
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
     * Checks to see if this buffer manager manages the indicated instance
     */
    managesInstance(instance: T): boolean;
    /**
     * Analyzes the list of attributes to the property ids that affects them. This populates the list
     * of minimal property ids needed to trigger updates on all of the attributes.
     */
    private makeUpdateAllPropertyIdList;
    /**
     * Disassociates an instance with a buffer
     */
    remove: (instance: T) => T;
    /**
     * Clears all elements of this manager from the current scene it was in.
     */
    removeFromScene(): void;
    /**
     * This generates a new buffer of attributes to associate instances with.
     *
     * This method for the attribute packing strategy creates a vertex attribute for each block required.
     * The individual properties are then packed into each of these blocks.
     */
    private resizeBuffer;
    /**
     * This takes newly created buffer locations and groups them by the property ids identified by the
     * registration phase.
     */
    private gatherLocationsIntoGroups;
    /**
     * Returns the total instances this buffer manages.
     */
    getInstanceCount(): number;
}
