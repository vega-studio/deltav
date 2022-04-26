import { Instance } from "./instance";

export class ObservableMonitoring {
  /**
   * Flag to help gathering Ids not gather Ids that arise from setting values
   */
  static setCycle: boolean = false;
  /** When true, observables will gather their used IDs into a list */
  static gatherIds: boolean = false;
  /** The IDs gathered while gatherIds flag is true */
  static observableIds: number[] = [];
  /**
   * A tracker to help keep similar names utilizing the same UID values to
   * improve compatibility in inheritance and across layers
   */
  static observableNamesToUID = new Map<string, number>();

  /**
   * This activates all observables to gather their UIDs when they are retrieved
   * via their getter. All of the ID's gathered can be accessed via
   * getObservableMonitorIds. It is REQUIRED that this is disabled again to
   * prevent a MASSIVE memory leak.
   */
  static setObservableMonitor(enabled: boolean) {
    ObservableMonitoring.gatherIds = enabled;
    ObservableMonitoring.observableIds = [];
  }

  /**
   * This retrieves the observables monitored IDs that were gathered when
   * setObservableMonitor was enabled.
   */
  static getObservableMonitorIds(clear?: boolean) {
    const values = ObservableMonitoring.observableIds.slice(0);
    if (clear) ObservableMonitoring.observableIds = [];

    return values;
  }
}

/**
 * Shorthand for the Observable Monitor as this has a hard time getting
 * compressed properly in minification.
 */
const m = ObservableMonitoring;
// This is not a major concern or heavy cost to retain for the life of the
// application. This only will contain some meta data for each class definition
// and not for every instance.
const isObservable = new Map<object, Set<string>>();
// Internal property UID generator. Using this to keep UIDs smaller.
let propUID = 1;
// The constructor of the base object class. This aids in comparing the
// prototype chain of an object.
const objectCtor = {}.constructor;

/**
 * This is a custom decorator intended for single properties on Instances only!
 * It will facilitate automatic updates and stream the updates through an
 * InstanceProvider to properly update the Instances values in the appropriate
 * and corresponding buffers that will get committed to the GPU.
 */
function observeProperty<T extends Instance>(instance: T, key: string) {
  // Here we store the name of the observable to a UID. This mapping allows us
  // to have a UID per NAME of an observable. A UID for a name can produce MUCH
  // faster lookups than the name itself. Matching against the name allows us to
  // have instances with their own property sets but have matching name mappings
  // to improve compatibility of Instances with varying Layers.
  const propertyUID: number = m.observableNamesToUID.get(key) || 0;

  if (propertyUID === 0) {
    console.warn(
      "A property with name",
      key,
      "for",
      instance,
      "has not been assigned a UID which is an error in this step of the process."
    );
    return;
  }

  /**
   * New property getter to get the property's alternative storage since we
   * overrode the initial storage with a custom getter and setter.
   */
  function getter() {
    if (m.gatherIds) {
      if (!m.setCycle) m.observableIds.push(propertyUID);
    }
    return instance.observableStorage[propertyUID];
  }

  /**
   * New property setter to replace the property marked as observable. instance
   * allows us to broadcast a change to our current observer.
   */
  function setter(newVal: any) {
    if (m.gatherIds) m.setCycle = true;
    // Update the privatized value
    instance.observableStorage[propertyUID] = newVal;
    // Broadcast change
    instance.changes[propertyUID] = propertyUID;
    if (instance.observer) instance.observer.instanceUpdated(instance);
    if (m.gatherIds) m.setCycle = false;
  }

  const value = (instance as any)[key];

  /**
   * Make sure the desired property is declared on the class with our custom
   * getter and setter.
   */
  Object.defineProperty(instance, key, {
    configurable: true,
    enumerable: true,
    get: getter,
    set: setter
  });

  (instance as any)[key] = value;
}

/**
 * This is a custom decorator intended for single properties on Instances only!
 * It will facilitate automatic updates and stream the updates through an
 * InstanceProvider to properly update the Instances values in the appropriate
 * and corresponding buffers that will get committed to the GPU.
 */
export function observable<T extends Instance>(
  target: T,
  key: string,
  descriptor?: PropertyDescriptor
): void {
  if (!descriptor) return;
  let willObserve = isObservable.get(target.constructor);
  let propertyUID: number = m.observableNamesToUID.get(key) || 0;
  console.log("OBSERVABLE", target, key);

  if (propertyUID === 0) {
    propertyUID = ++propUID;
    m.observableNamesToUID.set(key, propertyUID);
  }

  if (!willObserve) {
    willObserve = new Set<string>();
    isObservable.set(target.constructor, willObserve);
  }

  willObserve.add(key);

  // Loop through all inherited classes of this class and aggregate the
  // properties associated with them as observable properties for this base
  // class.
  let proto = Object.getPrototypeOf(target);
  let failSafe = 0;

  while (proto.constructor !== objectCtor && ++failSafe < 100) {
    const baseProperties = isObservable.get(proto.constructor);

    if (baseProperties) {
      baseProperties.forEach(prop => willObserve?.add(prop));
      console.log("GATHERING", proto.constructor.name, willObserve);
    }

    proto = Object.getPrototypeOf(proto);
  }

  if (failSafe >= 100) {
    console.warn(
      "@observable decorator encountered a type that has 100+ levels of inheritance. This is most likely an error, and may be a result of a circular dependency and will not be supported by this decorator."
    );
  }

  // Define the property with it's own descriptor so it is not affected in any
  // way by this decorator.,
  descriptor.enumerable = true;
  Object.defineProperty(target, key, descriptor);

  return;
}

/**
 * Place this within the constructor of a class that inherits from an Instance
 * to transform flagged observable properties into actual observables.
 */
export function makeObservable(target: Instance, ctor: Function) {
  // Only perform the observable setup if the target is an instance of the
  // indicated ctor. This prevents the makeObservable chain that is created from
  // inheritance from causing redundant operations per instance instantiated.
  if (target.constructor !== ctor) return;
  const props = isObservable.get(ctor);
  if (!props) return;
  props.forEach(prop => observeProperty(target, prop));
}
