import { InstanceDiffType } from "../types";
import { Instance } from "./instance";
export declare type InstanceDiff<T extends Instance> = [T, InstanceDiffType, {
    [key: number]: number;
}];
export declare class InstanceProvider<T extends Instance> {
    private cleanObservation;
    private instanceChanges;
    private allowChanges;
    readonly changeList: InstanceDiff<T>[];
    add(instance: T): T;
    clear(): void;
    destroy(): void;
    instanceUpdated(instance: T, _property: number): void;
    remove(instance: T): boolean;
    resolve(): void;
}
