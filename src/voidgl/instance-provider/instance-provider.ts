import { InstanceDiffType } from '../types';
import { Instance } from '../util/instance';

const noop = () => { /* no-op */ };

function isObservable(val: any): val is { $$: any } {
  return val.$$;
}

/**
 * This is an optimized provider, that can provide instances that use the internal observable system
 * to deliver updates to the framework.
 */
export class InstanceProvider<T extends Instance> {
  /** Stores the disposers that are called when the instance is no longer listened to */
  private cleanObservation = new Map<number, [T, Function]>();
  /** This stores the changes to the instances themselves */
  private instanceChanges = new Map<T, InstanceDiffType>();
  /** This flag is true when resolving changes when the change list is retrieved. it blocks changes until the current list is resolved */
  private allowChanges = true;

  get changeList(): [T, InstanceDiffType][] {
    this.allowChanges = false;
    return Array.from(this.instanceChanges.entries());
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
      // This is the disposer
      let disposer: Function = noop;

      if (isObservable(instance)) {
        instance.$$ = this;
        disposer = instance.$$;
      }

      // Store the disposers so we can clean up the observable properties
      this.cleanObservation.set(instance.uid, [instance, disposer]);
      // Indicate we have a new instance
      this.instanceChanges.set(instance, InstanceDiffType.INSERT);
    }

    return instance;
  }

  /**
   * Removes all instances from this provider
   */
  clear() {
    for (const instance of Array.from(this.cleanObservation.values())) {
      this.remove(instance[0]);
    }
  }

  /**
   * Clear all resources held by this provider. It IS valid to lose reference to all instances
   * and to this object, which would effectively cause this object to get GC'ed. But if you
   * desire to hang onto the instance objects, then this should be called.
   */
  destroy() {
    const toRemove = Array.from(this.cleanObservation.values());
    toRemove.forEach(instance => instance[1]());
    this.cleanObservation.clear();
    this.instanceChanges.clear();
  }

  /**
   * THis is called from observables to indicate it's parent has been updated
   */
  instanceUpdated(instance: T) {
    if (this.allowChanges) {
      // Flag the instance as having a property changed
      this.instanceChanges.set(instance, InstanceDiffType.CHANGE);
    }
  }

  /**
   * Removes the instance from being advertised changes and from providing the changes
   * for the instance.
   */
  remove(instance: T) {
    if (this.allowChanges) {
      const disposer = this.cleanObservation.get(instance.uid);

      if (disposer) {
        disposer[1]();
        this.cleanObservation.delete(instance.uid);
        this.instanceChanges.set(instance, InstanceDiffType.REMOVE);
      }
    }

    return false;
  }

  /**
   * Flagged all changes were dealt with
   */
  resolve() {
    this.allowChanges = true;
    this.instanceChanges.clear();
  }
}
