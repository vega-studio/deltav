import { InstanceDiffType } from '../types';
import { Instance } from '../util/instance';
/**
 * This is an optimized provider, that can provide instances that use the internal observable system
 * to deliver updates to the framework.
 */
export declare class InstanceProvider<T extends Instance> {
    private cleanObservation;
    private instanceChanges;
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
