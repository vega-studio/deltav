import { Identifiable, IEasingProps } from "../types";
import { InstanceProvider } from "./instance-provider";
import { observable } from "./observable";

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
  /** The property changes on the instance */
  changes: { [key: number]: number } = {};
  /** This is an internal easing object to track properties for automated easing */
  private _easing = new Map<number, IEasingProps>();
  /** Internal, non-changeable id */
  private _id: string;
  /** This is the observer of the Instance's observable properties */
  private _observer: InstanceProvider<this> | null;
  /** This is where observables store their data for the instance */
  observableStorage: any[] = [];
  /** A numerical look up for the instance. Numerical identifiers run faster than objects or strings */
  @observable private _uid = Instance.newUID;

  /**
   * Retrieves a method for disposing the link between observables and observer.
   */
  get observableDisposer(): () => void {
    return () => delete this._observer;
  }

  /**
   * Retrieves the observer of the observables.
   */
  get observer(): InstanceProvider<this> | null {
    return this._observer || null;
  }

  /**
   * Applies an observer for changes to the observables.
   */
  set observer(val: InstanceProvider<this> | null) {
    // If an observer already is present, we should inform it, that it is being removed
    // in favor of a new observer
    const oldObserver = this._observer;

    // If we're switching observers, then we have to dump out assumptions made within other observers
    if (oldObserver && oldObserver !== val) {
      this._easing.clear();
      oldObserver.remove(this);
    }

    // Apply the new observer as the current observer
    this._observer = val;
  }

  /**
   * Retrieves easing properties for the observables that are associated with easing.
   */
  get easing() {
    return this._easing;
  }

  /**
   * Get the applied id of this instance
   */
  get id() {
    return this._id;
  }

  /**
   * Get the auto generated ID of this instance
   */
  get uid() {
    return this._uid;
  }

  /**
   * This method is utilized internally to indicate when requested resources are ready.
   * If you have a property that will be requesting a resource, you should implement this method
   * to cause a trigger for the property to activate such that the property will update it's buffer.
   */
  resourceTrigger() {
    // No default behavior, subclasses must override and provide behavior.
    console.warn(
      "resourceTrigger called on an instance that did not override resourceTrigger. resourceTrigger MUST be overridden for instances",
      "that utilize a resource. The observable that is tied to committing the resource should be 'triggered' in this method."
    );
  }

  constructor(options: IInstanceOptions) {
    this._id = options.id || "";
    this.active = options.active || this.active;
  }
}
