import { Instance } from '../util/instance';
import { ObservableManager, ObservableManagerMode } from './observable-manager';

const noop = () => { /* no-op */ };
const observerKey = '$$';

export function observable(target: Instance, key: string) {
  // This is the privatized version of the property where the actual value is stored
  const storage = `_$${key}`;

  // Property getter
  function getter() {
    return this[storage];
  }

  // Property setter
  function setter(newVal: any) {
    // Update the privatized value
    this[storage] = newVal;
    // Broadcast change
    const observer = this[observerKey];
    observer && observer.instanceUpdated(this);
  }

  function register(): () => void {
    if (ObservableManager.mode === ObservableManagerMode.GATHER_OBSERVABLES) {
      this[observerKey] = ObservableManager.observer;
      return () => (this[observerKey] = null);
    }

    return noop;
  }

  function dispose(): void {
    this[observerKey] = null;
  }

  Object.defineProperty(target, '$$dispose', {
    configurable: true,
    enumerable: false,
    get: dispose,
  });

  Object.defineProperty(target, '$$register', {
    configurable: true,
    enumerable: false,
    get: register,
  });

  // Create new property with custom getter and setter
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get: getter,
    set: setter,
  });
}
