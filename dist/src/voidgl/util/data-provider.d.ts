import { IObservableArray } from "mobx";
import { Instance } from "./instance";
export declare enum DiffType {
    CHANGE = 0,
    INSERT = 1,
    REMOVE = 2,
}
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
    destroy(): void;
    private monitorItem;
    private monitorList(_list, changes, lookUp, disposers);
    resolve(): void;
}
