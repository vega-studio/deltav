import { InstanceDiffType } from '../types';
import { Instance } from '../util/instance';
import { ObservableManager, ObservableManagerMode } from './observable-manager';

/**
 * This is an optimized provider, that can provide instances that use the internal observable system
 * to deliver updates to the framework.
 */
export class InstanceProvider<T extends Instance> {
  private cleanObservation = new Map<T, Function[]>();
  private instanceChanges = new Map<T, InstanceDiffType>();

  get changeList(): [T, InstanceDiffType][] {
    return Array.from(this.instanceChanges.entries());
  }

  /**
   * Adds an instance to the provider which will stream observable changes of the instance to
   * the framework.
   */
  add(instance: T) {
    // Set the observable manager mode to gather observables
    ObservableManager.mode = ObservableManagerMode.GATHER_OBSERVABLES;
    // Set this as the current observer so registrations are made
    ObservableManager.observer = this;

    const disposers: Function[] = [];

    // Activate getters in the properties of the instance until the observable disposer
    // Is populated
    for (const key in instance) {
      // Trigger getter of the property
      instance[key];

      // See if triggering the getter populates the disposer in the manager
      if (ObservableManager.observableDisposer) {
        disposers.push(ObservableManager.observableDisposer);
        delete ObservableManager.observableDisposer;
      }
    }

    // Store the disposers so we can clean up the observable properties
    this.cleanObservation.set(instance, disposers);
    // Indicate we have a new instance
    this.instanceChanges.set(instance, InstanceDiffType.INSERT);
    // Change the mode back to broadcasting so we don't keep trying to record observables
    ObservableManager.mode = ObservableManagerMode.BROADCAST;

    return instance;
  }

  /**
   * Removes all instances from this provider
   */
  clear() {
    for (const instance of Array.from(this.cleanObservation.keys())) {
      this.remove(instance);
    }
  }

  /**
   * THis is called from observables to indicate it's parent has been updated
   */
  instanceUpdated(instance: T) {
    // Flag the instance as having a property changed
    this.instanceChanges.set(instance, InstanceDiffType.CHANGE);
  }

  /**
   * Removes the instance from being advertised changes and from providing the changes
   * for the instance.
   */
  remove(instance: T) {
    const disposers = this.cleanObservation.get(instance);
    this.cleanObservation.delete(instance);

    if (disposers) {
      for (let i = 0, end = disposers.length; i < end; ++i) {
        if (disposers[i](this)) {
          this.instanceChanges.set(instance, InstanceDiffType.REMOVE);
        }
      }
    }

    return false;
  }

  /**
   * Flagged all changes were dealt with
   */
  resolve() {
    this.instanceChanges.clear();
  }
}
