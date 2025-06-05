import { IdentifiableById } from "../types.js";
/**
 * These are the minimum properties required for a ReactiveDiff to monitor a set
 * of objects.
 */
export type ReactiveDiffObject<U> = {
    /**
     * The identifier of the object which is used to determine who is
     * added/removed/updated
     */
    key: string | number;
    /**
     * When inline() is used, it designates the caller of inline as the parent
     * object
     */
    parent?: U;
};
/**
 * Customizes a ReactiveDiff object
 */
export interface IReactiveDiffOptions<U, T extends ReactiveDiffObject<U>> {
    /**
     * This method will execute when this controller has determined a new object
     * should be constructed
     */
    buildItem(intiializer: T): Promise<U | null>;
    /**
     * This method will execute when this controller has determined an object
     * should be deconstructed
     */
    destroyItem(intiializer: T, item: U): Promise<boolean | null>;
    /**
     * This method will execute when this controller has determined an object has
     * potential new properties to be applied to it
     */
    updateItem(initializer: T, item: U): Promise<void>;
}
/**
 * This is a helper object to monitor a set of objects
 */
export declare class ReactiveDiff<U extends IdentifiableById | null, T extends ReactiveDiffObject<U>> {
    /** The options used to construct this controller */
    private options;
    /** All items flagged for disposing */
    private willDispose;
    /** We track all items by their key for quicker processing */
    private keyToItem;
    /** We track all initializers by their key for quicker processing */
    private keyToInitializer;
    /** Used to faciliate and enable the inline() ability */
    private currentInitalizerIndex;
    /**
     * The current initializers being processed. This is used to ensure the
     * inline() method can inject correctly without jmutating the input
     * initializer list.
     */
    private currentInitializers;
    /**
     * This is the list of the items generated and managed by this diff object,
     * this list is in the order they appear in the diff initializers injected
     * into the diff.
     */
    private _items;
    /**
     * While processing, this keeps track of the currently executing initializer
     * and object
     */
    private currentInitializer?;
    private currentItem?;
    /**
     * This stores deferred inlined elements that are waiting for their parent to
     * be completely created
     */
    private deferredInlining?;
    /** A list of all the items currently alive and managed by this diff */
    get items(): U[];
    constructor(options: IReactiveDiffOptions<U, T>);
    /**
     * This triggers all resources currently managed by this diff manager to
     * process their destroy procedure
     */
    destroy(): Promise<void>;
    /**
     * This injects the objects into the diff to be processed for new and removed
     * items.
     */
    diff(intializers: T[]): Promise<void>;
    /**
     * Returns a specified item by key
     */
    getByKey(key: string): U | undefined;
    /**
     * Returns a specified initializer by key. void if not found.
     */
    getInitializerByKey(key: string): T | undefined;
    /**
     * This method is used to inline new elements at the time a creation occurs
     */
    private inlineDeferred;
    /**
     * This method is used to inline new elements at the time an update occurs
     */
    private inlineImmediate;
    /**
     * Inlining new items takes on two different modes: immediate inlining for
     * during update cycles and inlining during creation cycles which requires
     * deferring the inline until the creation of the item has been completed.
     */
    inline: (newInitializers: T[]) => void;
    /**
     * Only during the updateItem phase of an item can this be called. This will
     * cause the item to be fully destroyed, then reconstructed instead of go
     * through an update.
     */
    rebuild(): Promise<void>;
}
