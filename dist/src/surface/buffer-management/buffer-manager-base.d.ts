import { Instance } from "../../instance-provider/instance";
import { Vec2, Vec4 } from "../../math";
import { IInstanceAttributeInternal, InstanceDiff } from "../../types";
import { Layer } from "../layer";
import { LayerScene } from "../layer-scene";
export declare function isBufferLocation(val: any): val is IBufferLocation;
export declare function isBufferLocationGroup(val: any): val is IBufferLocationGroup<IBufferLocation>;
/**
 * This defines a base information object that explains where in a buffer a value
 * is represented.
 */
export interface IBufferLocation {
    /** This is the parent attribute of this location */
    attribute: IInstanceAttributeInternal<Instance>;
    /** For some buffer strategies, there is a concept of block that is used to tightly pack attributes together. */
    block?: number;
    /**
     * This is the generic buffer object interface for accessing the actual buffer.
     */
    buffer: {
        value: Float32Array | Uint8Array | Vec4[];
    };
    /**
     * If the attribute has child attributes (attributes auto generated as a consequence of the attributes settings)
     * then the children's buffer locations can be found here.
     */
    childLocations?: IBufferLocation[];
    /**
     * This is the instance index indicative of the instance positioning within the buffer.
     * Keep in mind: This does NOT correlate to a lookup for an Instance object but rather for
     * the instancing concept designed for GL Buffers.
     */
    instanceIndex: number;
    /**
     * This is the range within the buffer values should be injected for this location.
     */
    range: Vec2;
}
/**
 * Each instance that comes in can be associated with a group of buffer locations. A buffer location for each
 * instance attribute used in updates. So a grouping is several buffer locations that are keyed by
 * the instance's property's UIDs.
 */
export interface IBufferLocationGroup<T extends IBufferLocation> {
    /** This is the instance index WITHIN THE BUFFERS. This does NOT have relevance to Instance type objects */
    instanceIndex: number;
    /** This is a map of property UIDs to an associated buffer location */
    propertyToBufferLocation: {
        [key: number]: T;
    };
}
/**
 * Layers manage instances and those instances require a form of binding to their associated buffers.
 * The buffers have to be intelligently created and managed in this tieing to maximize performance.
 * One can not have a buffer for every instance in most cases, so the buffer manager has to get instances
 * to cooperate sharing a buffer in whatever strategy possible that best suits the hardware and it's limitations.
 *
 * This provides a uniform interface between instances and their corresponding buffer.
 */
export declare abstract class BufferManagerBase<T extends Instance, U extends IBufferLocation> {
    /** This is the list of changes in effect while this manager is processing requests */
    changeListContext: InstanceDiff<T>[];
    /** The layer this manager glues Instances to Buffers */
    layer: Layer<T, any>;
    /** The scene the layer is injecting elements into */
    scene: LayerScene;
    /**
     * Base constructor. A manager always needs to be associated with it's layer and it's scene.
     */
    constructor(layer: Layer<T, any>, scene: LayerScene);
    /**
     * This adds an instance to the manager and thus ties the instance to an IBuffer location
     */
    add: (instance: T) => U | IBufferLocationGroup<U> | undefined;
    /**
     * This allows a manager to clean up any contextual information it may have stored while processing changes.
     */
    changesProcessed(): void;
    /**
     * Destroy all elements that consume GPU resources or consumes otherwise unreleaseable resources.
     */
    abstract destroy(): void;
    /**
     * Retrieves the buffer locations for the instance provided
     */
    abstract getBufferLocations(instance: T): U | IBufferLocationGroup<U> | undefined;
    /**
     * This retrieves the property ID for the active attribute. This is necessary to prevent
     * the need for lookups to find the active attribute.
     */
    abstract getActiveAttributePropertyId(): number;
    /**
     * This returns how many instances this buffer manager has grown to accommodate.
     */
    abstract getInstanceCount(): number;
    /**
     * This should provide a minimum property id list that represents a set of properties that if triggered
     * for update, would cause all of the attributes to be updated for the layer.
     */
    abstract getUpdateAllPropertyIdList(): number[];
    /**
     * This will be called with the changes that WILL be processed. This allows this manager to make extra judgement calls on
     * how it will process the changes and let's it optimize itself before changes are actually processed. An example optimization:
     *
     * The manager is receiving add requests. The manager receives an add request that triggers a resize of the buffer. Ideally,
     * the buffer should perform a single resize operation to accommodate ALL add requests getting ready to stream in plus the
     * current size of of the buffer. With this method, the changes will be available to the manager and let the manager make this
     * important decision instead of reflexively grow the buffer as requests stream in, which can cause a large number of costly
     * resize operations.
     */
    incomingChangeList(changes: InstanceDiff<T>[]): void;
    /**
     * This method checks to see if this buffer manager has linked an instance to a buffer
     * location managed by this object.
     */
    abstract managesInstance(instance: T): boolean;
    /**
     * Disassociates an instance with it's buffer location and makes the instance
     * in the buffer no longer drawable.
     */
    remove: (instance: T) => T;
    /**
     * Removes the manager from the scene it applied itself to.
     */
    abstract removeFromScene(): void;
}
