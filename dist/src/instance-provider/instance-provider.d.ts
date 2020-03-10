import { IInstanceProvider, InstanceDiff } from "../types";
import { Instance } from "./instance";
/**
 * This is an optimized provider, that can provide instances that use the internal observable system
 * to deliver updates to the framework.
 */
export declare class InstanceProvider<T extends Instance> implements IInstanceProvider<T> {
    /** A uid provided to this object to give it some easy to identify uniqueness */
    get uid(): number;
    private _uid;
    /** Stores the disposers that are called when the instance is no longer listened to */
    private cleanObservation;
    /** This stores the changes to the instances themselves */
    private instanceChanges;
    /** This flag is true when resolving changes when the change list is retrieved. it blocks changes until the current list is resolved */
    private allowChanges;
    /**
     * This indicates the context this provider was handled within. Currently, only one context is allowed per provider,
     * so we use this to detect when multiple contexts have attempted use of this provider.
     */
    resolveContext: string;
    constructor(instances?: T[]);
    /**
     * Retrieve all of the changes applied to instances
     */
    get changeList(): InstanceDiff<T>[];
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
     * This is called from observables to indicate it's parent has been updated.
     * This is what an instance calls when it's observable property is modified.
     */
    instanceUpdated(instance: T): void;
    /**
     * Stops the instance's ability to register changes with this provider and flags
     * a final removal diff change.
     */
    remove(instance: T): boolean;
    /**
     * Flagged all changes as dealt with
     */
    resolve(context: string): void;
    /**
     * This performs an operation that forces all of the instances to be flagged as an
     * 'add' change. This allows a layer listening to this provider to ensure it has added
     * all currently existing instances monitored by the provider.
     *
     * NOTE: This is a VERY poor performing method and should probably be used by the framework
     * and not manually.
     */
    sync(): void;
}
