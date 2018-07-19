import { Identifiable, IEasingProps } from '../types';
import { InstanceProvider } from './instance-provider';
import { observable } from './observable';

let instanceUID = 0;

export interface IInstanceOptions {
  /** The instance can be declared with an initial active state */
  active?: boolean;
  /** An instance must be declared with an identifier */
  id?: string;
}

export class Instance implements Identifiable {
  static get newUID() {
    return (instanceUID = ++instanceUID % 0xffffff);
  }

  /** This indicates when the instance is active / rendering */
  @observable active: boolean;
  /** This is an internal easing object to track properties for automated easing */
  private _easing = new Map<number, IEasingProps>();
  /** Internal, non-changeable id */
  private _id: string;
  /** This is the observer of the Instance's observable properties */
  private _observer: InstanceProvider<this> | null;
  /** This is where observables store their data for the instance */
  observableStorage: any[] = [];
  /** A numerical look up for the instance. Numerical identifiers run faster than objects or strings */
  private _uid = Instance.newUID;
  /** The property changes on the instance */
  changes: { [key: number]: number } = {};

  /**
   * The system will call this on the instance when it believes the instance may be
   * harboring resources that are not released.
   */
  destroy() {
    // Generally a No-op
  }

  get observableDisposer(): () => void {
    return () => delete this._observer;
  }

  get observer(): InstanceProvider<this> | null {
    return this._observer || null;
  }

  set observer(val: InstanceProvider<this> | null) {
    // If an observer already is present, we should inform it, that it is being removed
    // in favor of a new observer
    const oldObserver = this._observer;

    if (oldObserver && oldObserver !== val) {
      oldObserver.remove(this);
    }

    // Apply the new observer as the current observer
    this._observer = val;
  }

  get easing() {
    return this._easing;
  }

  get id() {
    return this._id;
  }

  get uid() {
    return this._uid;
  }

  /**
   * This method is utilized internally to indicate when requested resources are ready.
   * If you have a property that will be requesting a resource, you should implement this method
   * to cause a trigger for the property to activate such that the property will update it's buffer.
   */
  resourceTrigger() {
    // For subclasses
  }

  constructor(options: IInstanceOptions) {
    this._id = options.id || '';
    this.active = options.active || this.active;
  }
}
