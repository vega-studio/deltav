import { IObservableArray } from 'mobx';
import { Instance } from './instance';
export declare enum DiffType {
    CHANGE = 0,
    INSERT = 1,
    REMOVE = 2,
}
/**
 * This is a generic DataProvider that provides instance data to a layer. It monitors
 * changes to a list of instance items and records those changes for consumption by
 * internal layer processes. This allows for extremely easy editing of instance data
 * that reflects highly targetted changes to the system with very little overhead
 * allowing for very large datasets with rapidly changing parts.
 */
export declare class DataProvider<T extends Instance> {
    private active;
    private listDisposer;
    private instanceDisposers;
    private _instances;
    private instanceChanges;
    private instanceById;
    private isChanged;
    private _changeList;
    readonly instances: IObservableArray<T> | T[];
    readonly changeList: [T, DiffType][];
    constructor(data: T[]);
    /**
     * Clears out all disposers and items in the dataset
     */
    destroy(): void;
    /**
     * This generates a method for an interceptor to monitor individual items within a list and record
     * any changes found to the changelist
     *
     * @param changes This is the change list which records the changes to the items
     */
    private monitorItem;
    /**
     * This generates a method for an interceptor that will monitor and collect change information
     * on the list of items specified.
     *
     * @param list The list of items to monitor
     * @param changes The changelist for the list of given item type
     * @param lookUp A lookup so items that have changed can get their source easily
     */
    private monitorList(list, changes, lookUp, disposers);
    /**
     * This resolves all of the changes found and makes them disappear.
     */
    resolve(): void;
}
