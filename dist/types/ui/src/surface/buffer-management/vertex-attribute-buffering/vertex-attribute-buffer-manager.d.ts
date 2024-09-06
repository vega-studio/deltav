import { BufferManagerBase, IBufferLocation, IBufferLocationGroup } from "../buffer-manager-base";
import { ILayerProps, Layer } from "../../layer";
import { Instance } from "../../../instance-provider";
import { LayerScene } from "../../layer-scene";
/**
 * This represents the location of data for an instance's property to the piece
 * of attribute buffer it will update when it changes.
 */
export interface IVertexAttributeBufferLocation extends IBufferLocation {
    /**
     * We narrow the buffer type for instance attributes down to just array
     * buffers
     */
    buffer: {
        data: Float32Array | Uint8Array;
    };
    /** We narrow the child locations to be the same as this buffer location */
    childLocations?: IVertexAttributeBufferLocation[];
}
/** Represents the Location Groupings for Instance attribute Buffer locations */
export type IVertexAttributeBufferLocationGroup = IBufferLocationGroup<IVertexAttributeBufferLocation>;
/**
 * Typeguard for the instance attribute buffer location.
 */
export declare function isVertexAttributeBufferLocation(val: IBufferLocation): val is IVertexAttributeBufferLocation;
/**
 * Typeguard for the instance attribute buffer location group.
 */
export declare function isVertexAttributeBufferLocationGroup(val: any): val is IVertexAttributeBufferLocationGroup;
/**
 * This manages instances in how they associate with buffer data for an
 * non-instanced vertex attribute strategy.
 *
 * SOME NOTES:
 * This buffer management strategy follows the EXACT same pattern as
 * the instance attribute buffering strategy. It creates the EXACT SAME buffer
 * location values.
 *
 * WHERE IT DIFFERS:
 * - This will resize the vertex attributes AS WELL to match the instance count
 *   since we will NOT be able to take advantage of drawing instanced arrays.
 * - ALL BUFFERS will repeat values for every instance for every VERTEX instead
 *   of storing a single copy of the value for each instance.
 *
 * BUFFER LOCATIONS GENERATED WILL NOT MATCH REAL BUFFER LOCATIONS WITH THIS
 * STRATEGY:
 * Again! This follows the instance attribute buffer location strategy
 * for BUFFER LOCATIONS EXXXXACTLY. This similarity will be resolved in the diff
 * processor as it will take into account the number of vertices the values need
 * to be copied for to match the buffer expectations when drawing as a
 * non-instanced attribute.
 */
export declare class VertexAttributeBufferManager<TInstance extends Instance, TProps extends ILayerProps<TInstance>> extends BufferManagerBase<TInstance, TProps, IVertexAttributeBufferLocation> {
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
    /**
     * This is a mapping of all attributes to their associated property ids that,
     * when the property changes, the attribute will be updated
     */
    private attributeToPropertyIds;
    /**
     * This is a trimmed listing of minimum property ids needed to trigger an
     * update on all properties. This is used by the diffing process mostly to
     * handle adding a new instance.
     */
    private updateAllPropertyIdList;
    /**
     * This is the discovered property id of the active attribute for the instance
     * type this manager manages. This is used by the diffing process to target
     * updates related to deactivating an instance.
     */
    private activePropertyId;
    /**
     * As changes are processed, instances will be added into the buffers. As they
     * are added in, the instance will take over available locations within the
     * buffer. Normally we would have these available locations in a queue and we
     * would push and shift into that queue to retrieve the locations; however,
     * shifting queues when done in VERY large quantities causes javascript to lag
     * horrendously. Thus we instead have this index to monitor the next available
     * item to pull during processing changes. AFTER changes have been processed
     * we perform a one time operation splice to delete any list of available
     * locations that have been used. This GREATLY improves performance for these
     * types of operations.
     */
    private currentAvailableLocation;
    constructor(layer: Layer<TInstance, any>, scene: LayerScene);
    /**
     * This is the tail end of processing changes and lets us clean up anything
     * that might have been used to aid in the processing.
     */
    changesProcessed(): void;
    /**
     * First instance to be added to this manager will be heavily analyzed for
     * used observables per attribute.
     */
    private doAddWithRegistration;
    /**
     * After the registration add happens, we gear shift over to this add method
     * which will only pair instances with their appropriate buffer location.
     */
    private doAdd;
    /**
     * Free any buffer and material resources this is managing.
     */
    destroy(): void;
    /**
     * This retireves the buffer locations associated with an instance, or returns
     * nothing if the instance has not been associated yet.
     */
    getBufferLocations(instance: TInstance): IVertexAttributeBufferLocationGroup;
    /**
     * This is the property id of the active attribute.
     */
    getActiveAttributePropertyId(): number;
    /**
     * This is the bare minimum property ids that, when triggered for update, will
     * update ALL of the attribute buffers for the managed layer.
     */
    getUpdateAllPropertyIdList(): number[];
    /**
     * Checks to see if an instance is managed by this manager.
     */
    managesInstance(instance: TInstance): boolean;
    /**
     * Analyzes the list of attributes to the property ids that affects them. This
     * populates the list of minimal property ids needed to trigger updates on all
     * of the attributes.
     */
    private makeUpdateAllPropertyIdList;
    /**
     * Disassociates an instance with a buffer
     */
    remove: (instance: TInstance) => TInstance;
    /**
     * Clears all elements of this manager from the current scene it was in.
     */
    removeFromScene(): void;
    /**
     * This generates a new buffer of attribute locations to associate instances
     * with.
     */
    private resizeBuffer;
    /**
     * This takes newly created buffer locations and groups them by the property
     * ids identified by the registration phase.
     */
    private gatherLocationsIntoGroups;
    /**
     * Returns the total instances this buffer manages.
     */
    getInstanceCount(): number;
}
