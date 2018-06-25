import { Instance } from '../util/instance';
import { InstanceProvider } from './instance-provider';

/**
 * This is the storage location on an Instance where
 */
const observerStorage = '_$$';
const observerKey = '$$';

/**
 * This is a custom decorator intended for single properties on Instances only! It will
 * facilitate automatic updates and stream the updates through an InstanceProvider to properly
 * update the Instances values in the appropriate and corresponding buffers that will get committed
 * to the GPU.
 */
export function observable(target: Instance, key: string) {
  /** This is the privatized version of the property where the actual value is stored */
  const storage = `_$${key}`;

  /**
   * New property getter to get the property's alternative storage since we overrode
   * the initial storage with a custom getter and setter.
   */
  function getter() {
    return this[storage];
  }

  /**
   * New property setter to replace the property marked as observable. This allows
   * us to broadcast a change to our current observer.
   */
  function setter(newVal: any) {
    // Update the privatized value
    this[storage] = newVal;
    // Broadcast change
    const observer = this[observerStorage];
    observer && observer.instanceUpdated(this);
  }

  /**
   * When retrieving the current observer, it will provide a disposer for clearing
   * the registration of the observer from the instance.
   */
  function makeDisposer(): () => void {
    return () => (this[observerStorage] = null);
  }

  /**
   * Sets the observer for the
   */
  function applyObserver(val: InstanceProvider<any>) {
    // If an observer already is present, we should inform it, that it is being removed
    // in favor of a new observer
    const oldObserver = this[observerStorage];

    if (oldObserver && oldObserver !== val) {
      oldObserver.remove(this);
    }

    // Apply the new observer as the current observer
    this[observerStorage] = val;
  }

  // Do some validation on our desired name and ensure it does not conflict with needed internal properties
  if (key === observerStorage || key === observerKey) {
    console.warn(`Observable Name Error for property ${key} on`, target);
    console.warn('A class that utilizes DeltaV observables can not declare its own use of $$ or _$$');
  }

  /**
   * This is a specially declared accessor for setting the observer for the property
   * and retrieving a disposer for the registration.
   */
  Object.defineProperty(target, observerKey, {
    configurable: true,
    enumerable: false,
    get: makeDisposer,
    set: applyObserver,
  });

  /**
   * Make sure the desired property is declared on the class with our custom getter and
   * setter.
   */
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get: getter,
    set: setter,
  });
}
