import { InstanceProvider } from './instance-provider';

export enum ObservableManagerMode {
  GATHER_OBSERVABLES,
  BROADCAST,
}

export class ObservableManager {
  static mode: ObservableManagerMode = ObservableManagerMode.BROADCAST;
  static observer: InstanceProvider<any>;
  static observableDisposer: (observer: InstanceProvider<any>) => void;
}
