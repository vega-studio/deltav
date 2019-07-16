import { Instance } from "./instance";
export declare class ObservableMonitoring {
    static gatherIds: boolean;
    static observableIds: number[];
    static observableNamesToUID: Map<string, number>;
    static setObservableMonitor(enabled: boolean): void;
    static getObservableMonitorIds(clear?: boolean): number[];
}
export declare function observable<T extends Instance>(target: T, key: string): void;
