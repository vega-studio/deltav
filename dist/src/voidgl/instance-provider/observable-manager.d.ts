import { InstanceProvider } from './instance-provider';
export declare enum ObservableManagerMode {
    GATHER_OBSERVABLES = 0,
    BROADCAST = 1,
}
export declare class ObservableManager {
    static mode: ObservableManagerMode;
    static observer: InstanceProvider<any>;
    static observableDisposer: (observer: InstanceProvider<any>) => void;
}
