import { uid } from "../util/uid";
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

/**
 * This is a custom decorator intended for single properties on Instances only!
 * It will facilitate automatic updates and stream the updates through an
 * InstanceProvider to properly update the Instances values in the appropriate
 * and corresponding buffers that will get committed to the GPU.
 */
export function observable<T extends Instance>(target: T, key: string) {
  // Here we store the name of the observable to a UID. This mapping allows us
  // to have a UID per NAME of an observable. A UID for a name can produce MUCH
  // faster lookups than the name itself. Matching against the name allows us to
  // have instances with their own property sets but have matching name mappings
  // to improve compatibility of Instances with varying Layers.
  let propertyUID: number =
    ObservableMonitoring.observableNamesToUID.get(key) || 0;

  if (propertyUID === 0) {
    propertyUID = uid();
    ObservableMonitoring.observableNamesToUID.set(key, propertyUID);
  }

  /**
   * New property getter to get the property's alternative storage since we
   * overrode the initial storage with a custom getter and setter.
   */
  function getter(this: T) {
    if (m.gatherIds) {
      if (!m.setCycle) m.observableIds.push(propertyUID);
    }
    return this.observableStorage[propertyUID];
  }

  /**
   * New property setter to replace the property marked as observable. This
   * allows us to broadcast a change to our current observer.
   */
  function setter(this: T, newVal: any) {
    if (m.gatherIds) m.setCycle = true;
    // Update the privatized value
    this.observableStorage[propertyUID] = newVal;
    // Broadcast change
    this.changes[propertyUID] = propertyUID;
    if (this.observer) this.observer.instanceUpdated(this);
    if (m.gatherIds) m.setCycle = false;
  }

  /**
   * Make sure the desired property is declared on the class with our custom
   * getter and setter.
   */
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get: getter,
    set: setter
  });
}
