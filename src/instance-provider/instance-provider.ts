import { IInstanceProvider } from "../surface/layer";
import { InstanceDiffType } from "../types";
import { uid } from "../util/uid";
import { Instance } from "./instance";

/**
 * This is an entry within the change list of the provider. It represents the type of change
 * and stores the property id's of the properties on the instance that have changed.
 */
export type InstanceDiff<T extends Instance> = [
  T,
  InstanceDiffType,
  { [key: number]: number }
];

type InstanceDisposer<T extends Instance> = [T, Function];

/**
 * This is an optimized provider, that can provide instances that use the internal observable system
 * to deliver updates to the framework.
 */
export class InstanceProvider<T extends Instance>
  implements IInstanceProvider<T> {
  /** A uid provided to this object to give it some easy to identify uniqueness */
  get uid() {
    return this._uid;
  }
  private _uid: number = uid();
  /** Stores the disposers that are called when the instance is no longer listened to */
  private cleanObservation = new Map<number, InstanceDisposer<T>>();
  /** This stores the changes to the instances themselves */
  private instanceChanges = new Map<number, InstanceDiff<T>>();
  /** This flag is true when resolving changes when the change list is retrieved. it blocks changes until the current list is resolved */
  private allowChanges = true;
  /**
   * This indicates the context this provider was handled within. Currently, only one context is allowed per provider,
   * so we use this to detect when multiple contexts have attempted use of this provider.
   */
  resolveContext: string = "";

  constructor(instances?: T[]) {
    if (instances) {
      for (let i = 0, iMax = instances.length; i < iMax; ++i) {
        const instance = instances[i];
        this.add(instance);
      }
    }
  }

  /**
   * Retrieve all of the changes applied to instances
   */
  get changeList(): InstanceDiff<T>[] {
    this.allowChanges = false;
    const changes: InstanceDiff<T>[] = [];
    this.instanceChanges.forEach(val => changes.push(val));

    return changes;
  }

  /**
   * Adds an instance to the provider which will stream observable changes of the instance to
   * the framework.
   */
  add(instance: T) {
    // No need to duplicate the addition
    if (this.cleanObservation.get(instance.uid)) {
      return instance;
    }

    if (this.allowChanges) {
      instance.observer = this;
      const disposer: Function = instance.observableDisposer;
      // Store the disposers so we can clean up the observable properties
      this.cleanObservation.set(instance.uid, [instance, disposer]);
      // Indicate we have a new instance
      this.instanceChanges.set(instance.uid, [
        instance,
        InstanceDiffType.INSERT,
        instance.changes
      ]);
    }

    return instance;
  }

  /**
   * Removes all instances from this provider
   */
  clear() {
    this.cleanObservation.forEach(values => {
      this.remove(values[0]);
    });
  }

  /**
   * Clear all resources held by this provider. It IS valid to lose reference to all instances
   * and to this object, which would effectively cause this object to get GC'ed. But if you
   * desire to hang onto the instance objects, then this should be called.
   */
  destroy() {
    this.cleanObservation.forEach(values => {
      values[1]();
    });

    this.cleanObservation.clear();
    this.instanceChanges.clear();
  }

  /**
   * This is called from observables to indicate it's parent has been updated.
   * This is what an instance calls when it's observable property is modified.
   */
  instanceUpdated(instance: T) {
    if (this.allowChanges) {
      // Flag the instance as having a property changed
      this.instanceChanges.set(instance.uid, [
        instance,
        InstanceDiffType.CHANGE,
        instance.changes
      ]);
    }
  }

  /**
   * Stops the instance's ability to register changes with this provider and flags
   * a final removal diff change.
   */
  remove(instance: T) {
    if (this.allowChanges) {
      const disposer = this.cleanObservation.get(instance.uid);

      if (disposer) {
        disposer[1]();
        this.cleanObservation.delete(instance.uid);
        this.instanceChanges.set(instance.uid, [
          instance,
          InstanceDiffType.REMOVE,
          {}
        ]);
      }
    }

    return false;
  }

  /**
   * Flagged all changes as dealt with
   */
  resolve(context: string) {
    this.allowChanges = true;
    this.instanceChanges.clear();

    if (this.resolveContext && this.resolveContext !== context) {
      throw new Error(
        "An instance provider has been issued to two layers. This is not a suppported feature yet and can cause issues."
      );
    }

    this.resolveContext = context;
  }

  /**
   * This performs an operation that forces all of the instances to be flagged as an
   * 'add' change. This allows a layer listening to this provider to ensure it has added
   * all currently existing instances monitored by the provider.
   *
   * NOTE: This is a VERY poor performing method and should probably be used by the framework
   * and not manually.
   */
  sync() {
    const emptyPropertyChanges: number[] = [];

    // Loop through all registered instances (which is only stored in the disposer list kept by this provider)
    this.cleanObservation.forEach(disposer => {
      const [instance] = disposer;
      // Flag the instance as having a property changed
      this.instanceChanges.set(instance.uid, [
        instance,
        InstanceDiffType.INSERT,
        emptyPropertyChanges
      ]);
    });
  }
}
