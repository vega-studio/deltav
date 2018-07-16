import { InstanceDiffType } from '../types';
import { Instance } from './instance';

/**
 * This is an entry within the change list of the provider. It represents the type of change
 * and stores the property id's of the properties on the instance that have changed.
 */
export type InstanceDiff<T extends Instance> = [T, InstanceDiffType, {[key: number]: number}];

/**
 * This is an optimized provider, that can provide instances that use the internal observable system
 * to deliver updates to the framework.
 */
export class InstanceProvider<T extends Instance> {
  /** Stores the disposers that are called when the instance is no longer listened to */
  private cleanObservation: {[key: number]: [T, Function]} = {};
  /** This stores the changes to the instances themselves */
  private instanceChanges: {[key: number]: InstanceDiff<T>} = {};
  /** This flag is true when resolving changes when the change list is retrieved. it blocks changes until the current list is resolved */
  private allowChanges = true;

  /**
   * Retrieve all of the changes applied to instances
   */
  get changeList(): InstanceDiff<T>[] {
    this.allowChanges = false;
    const changes = Object.values(this.instanceChanges);

    return changes;
  }

  /**
   * Adds an instance to the provider which will stream observable changes of the instance to
   * the framework.
   */
  add(instance: T) {
    // No need to duplicate the addition
    if (this.cleanObservation[instance.uid]) {
      return instance;
    }

    if (this.allowChanges) {
      instance.observer = this;
      const disposer: Function = instance.observableDisposer;
      // Store the disposers so we can clean up the observable properties
      this.cleanObservation[instance.uid] = [instance, disposer];
      // Indicate we have a new instance
      this.instanceChanges[instance.uid] = [instance, InstanceDiffType.INSERT, {}];
    }

    return instance;
  }

  /**
   * Removes all instances from this provider
   */
  clear() {
    const values = Object.values(this.cleanObservation);

    for (let i = 0, end = values.length; i < end; ++i) {
      this.remove(values[i][0]);
    }
  }

  /**
   * Clear all resources held by this provider. It IS valid to lose reference to all instances
   * and to this object, which would effectively cause this object to get GC'ed. But if you
   * desire to hang onto the instance objects, then this should be called.
   */
  destroy() {
    const values = Object.values(this.cleanObservation);

    for (let i = 0, end = values.length; i < end; ++i) {
      values[i][1]();
    }

    this.cleanObservation = {};
    this.instanceChanges = {};
  }

  /**
   * This is called from observables to indicate it's parent has been updated
   */
  instanceUpdated(instance: T, property: number) {
    if (this.allowChanges) {
      // Flag the instance as having a property changed
      const change = this.instanceChanges[instance.uid] || [instance, InstanceDiffType.CHANGE, {}];
      this.instanceChanges[instance.uid] = change;
      change[1] = InstanceDiffType.CHANGE;
      change[2][property] = property;
    }
  }

  /**
   * Removes the instance from being advertised changes and from providing the changes
   * for the instance.
   */
  remove(instance: T) {
    if (this.allowChanges) {
      const disposer = this.cleanObservation[instance.uid];

      if (disposer) {
        disposer[1]();
        delete this.cleanObservation[instance.uid];
        this.instanceChanges[instance.uid] = [instance, InstanceDiffType.REMOVE, {}];
      }
    }

    return false;
  }

  /**
   * Flagged all changes as dealt with
   */
  resolve() {
    this.allowChanges = true;
    this.instanceChanges = {};
  }
}
