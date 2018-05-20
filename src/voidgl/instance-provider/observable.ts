import { Instance } from '../util/instance';
import { InstanceProvider } from './instance-provider';
import { ObservableManager, ObservableManagerMode } from './observable-manager';

const observerKey = '$$';

export function observable(target: Instance, key: string) {
  // This is the privatized version of the property where the actual value is stored
  const storage = `_$${key}`;

  /**
   * This is the method a registered instance provider should call when the instance
   * is removed from the provider.
   */
  function disposer(parent: Instance, observers: InstanceProvider<any>[]) {
    return (observer: InstanceProvider<any>) => observers.splice(observers.indexOf(observer), 1);
  }

  // Property getter
  function getter() {
    if (ObservableManager.mode === ObservableManagerMode.GATHER_OBSERVABLES) {
      const observers = this[observerKey] || (this[observerKey] = []);

      if (observers.indexOf(ObservableManager.observer) < 0) {
        observers.push(ObservableManager.observer);
        ObservableManager.observableDisposer = disposer(this, observers);
      }
    }

    return this[storage];
  }

  // Property setter
  function setter(newVal: any) {
    // Update the privatized value
    this[storage] = newVal;

    // Broadcast change
    const observers = this[observerKey] || (this[observerKey] = []);
    for (let i = 0, end = observers.length; i < end; ++i) {
      observers[i].instanceUpdated(this);
    }
  }

  // Create new property with custom getter and setter
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get: getter,
    set: setter,
  });
}
