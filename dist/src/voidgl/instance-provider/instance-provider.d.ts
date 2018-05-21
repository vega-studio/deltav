import { InstanceDiffType } from '../types';
import { Instance } from '../util/instance';
/**
 * This is an optimized provider, that can provide instances that use the internal observable system
 * to deliver updates to the framework.
 */
export declare class InstanceProvider<T extends Instance> {
    /** Stores the disposers that are called when the instance is no longer listened to */
    private cleanObservation;
    /** This stores the changes to the instances themselves */
    private instanceChanges;
    /** This flag is true when resolving changes when the change list is retrieved. it blocks changes until the current list is resolved */
    private allowChanges;
    readonly changeList: [T, InstanceDiffType][];
    /**
     * Adds an instance to the provider which will stream observable changes of the instance to
     * the framework.
     */
    add(instance: T): T;
    /**
     * Removes all instances from this provider
     */
    clear(): void;
    /**
     * Clear all resources held by this provider. It IS valid to lose reference to all instances
     * and to this object, which would effectively cause this object to get GC'ed. But if you
     * desire to hang onto the instance objects, then this should be called.
     */
    destroy(): void;
    /**
     * THis is called from observables to indicate it's parent has been updated
     */
    instanceUpdated(instance: T): void;
    /**
     * Removes the instance from being advertised changes and from providing the changes
     * for the instance.
     */
    remove(instance: T): boolean;
    /**
     * Flagged all changes were dealt with
     */
    resolve(): void;
}
