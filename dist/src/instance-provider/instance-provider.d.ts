import { IInstanceProvider } from "../surface/layer";
import { InstanceDiffType } from "../types";
import { Instance } from "./instance";
export declare type InstanceDiff<T extends Instance> = [T, InstanceDiffType, {
    [key: number]: number;
}];
export declare class InstanceProvider<T extends Instance> implements IInstanceProvider<T> {
    readonly uid: number;
    private _uid;
    private cleanObservation;
    private instanceChanges;
    private allowChanges;
    resolveContext: string;
    constructor(instances?: T[]);
    readonly changeList: InstanceDiff<T>[];
    add(instance: T): T;
    clear(): void;
    destroy(): void;
    instanceUpdated(instance: T): void;
    remove(instance: T): boolean;
    resolve(context: string): void;
    sync(): void;
}
