import { Instance } from "./instance";
export declare class ObservableMonitoring {
    /**
     * Flag to help gathering Ids not gather Ids that arise from setting values
     */
    static setCycle: boolean;
    /** When true, observables will gather their used IDs into a list */
    static gatherIds: boolean;
    /** The IDs gathered while gatherIds flag is true */
    static observableIds: number[];
    /**
     * A tracker to help keep similar names utilizing the same UID values to
     * improve compatibility in inheritance and across layers
     */
    static observableNamesToUID: Map<string, number>;
    /**
     * This activates all observables to gather their UIDs when they are retrieved
     * via their getter. All of the ID's gathered can be accessed via
     * getObservableMonitorIds. It is REQUIRED that this is disabled again to
     * prevent a MASSIVE memory leak.
     */
    static setObservableMonitor(enabled: boolean): void;
    /**
     * This retrieves the observables monitored IDs that were gathered when
     * setObservableMonitor was enabled.
     */
    static getObservableMonitorIds(clear?: boolean): number[];
}
/**
 * This is a custom decorator intended for single properties on Instances only!
 * It will facilitate automatic updates and stream the updates through an
 * InstanceProvider to properly update the Instances values in the appropriate
 * and corresponding buffers that will get committed to the GPU.
 */
export declare function observable<T extends Instance>(target: T, key: string, descriptor?: PropertyDescriptor): void;
/**
 * Place this within the constructor of a class that inherits from an Instance
 * to transform flagged observable properties into actual observables.
 */
export declare function makeObservable(target: Instance, ctor: Function): void;
