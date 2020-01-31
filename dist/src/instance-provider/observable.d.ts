import { Instance } from "./instance";
export declare class ObservableMonitoring {
    static gatherIds: boolean;
    static observableIds: number[];
    static observableNamesToUID: Map<string, number>;
    /**
     * This activates all observables to gather their UIDs when they are retrieved via their getter.
     * All of the ID's gathered can be accessed via getObservableMonitorIds. It is REQUIRED that this
     * is disabled again to prevent a MASSIVE memory leak.
     */
    static setObservableMonitor(enabled: boolean): void;
    /**
     * This retrieves the observables monitored IDs that were gathered when setObservableMonitor was
     * enabled.
     */
    static getObservableMonitorIds(clear?: boolean): number[];
}
/**
 * This is a custom decorator intended for single properties on Instances only! It will
 * facilitate automatic updates and stream the updates through an InstanceProvider to properly
 * update the Instances values in the appropriate and corresponding buffers that will get committed
 * to the GPU.
 */
export declare function observable<T extends Instance>(target: T, key: string): void;
