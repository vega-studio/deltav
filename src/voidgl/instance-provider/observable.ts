import { Instance } from '../instance-provider/instance';
import { uid } from '../util/uid';

let gatherIds: boolean = false;
let observableIds: number[] = [];
const observableNamesToUID = new Map<string, number>();

/**
 * This activates all observables to gather their UIDs when they are retrieved via their getter.
 * All of the ID's gathered can be accessed via getObservableMonitorIds. It is REQUIRED that this
 * is disabled again to prevent a MASSIVE memory leak.
 */
export function setObservableMonitor(enabled: boolean) {
  gatherIds = enabled;
  observableIds = [];
}

/**
 * This retrieves the observables montiored IDs that were gathered when setObservableMonitor was
 * enabled.
 */
export function getObservableMonitorIds() {
  return observableIds.slice(0);
}

/**
 * This is a custom decorator intended for single properties on Instances only! It will
 * facilitate automatic updates and stream the updates through an InstanceProvider to properly
 * update the Instances values in the appropriate and corresponding buffers that will get committed
 * to the GPU.
 */
export function observable<T extends Instance>(target: T, key: string) {
  // Here we store the name of the observable to a UID. This mapping allows us to have a UID
  // per NAME of an observable. A UID for a name can produce MUCH faster lookups than the name itself.
  // Matching against the name allows us to have instances with their own property sets but have matching
  // name mappings to improve compatibility of Instances with varying Layers.
  let propertyUID: number = observableNamesToUID.get(key) || 0;

  if (!propertyUID) {
    propertyUID = uid();
    observableNamesToUID.set(key, propertyUID);
  }

  /**
   * New property getter to get the property's alternative storage since we overrode
   * the initial storage with a custom getter and setter.
   */
  function getter(this: T) {
    if (gatherIds) observableIds.push(propertyUID);
    return this.observableStorage[propertyUID];
  }

  /**
   * New property setter to replace the property marked as observable. This allows
   * us to broadcast a change to our current observer.
   */
  function setter(this: T, newVal: any) {
    // Update the privatized value
    this.observableStorage[propertyUID] = newVal;
    // Broadcast change
    const observer = this.observer;
    observer && observer.instanceUpdated(this, propertyUID);
  }

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
