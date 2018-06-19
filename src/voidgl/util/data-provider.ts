import { IArrayWillChange, IArrayWillSplice, intercept, IObjectWillChange, IObservableArray, Lambda, observable } from 'mobx';
import { Instance } from './instance';

export enum DiffType {
  CHANGE = 0,
  INSERT = 1,
  REMOVE = 2,
}

function isObservableArray<T>(val: any): val is IObservableArray<T> {
  return Boolean(val.observe);
}

const UPDATE_FLAG = 'update';
const SPLICE_FLAG = 'splice';

/**
 * This is a generic DataProvider that provides instance data to a layer. It monitors
 * changes to a list of instance items and records those changes for consumption by
 * internal layer processes. This allows for extremely easy editing of instance data
 * that reflects highly targetted changes to the system with very little overhead
 * allowing for very large datasets with rapidly changing parts.
 */
export class DataProvider<T extends Instance> {
  // When active, this provider is recording changes. Deactivate to temporarily disable
  // Change tracking.
  private active: boolean = true;

  // These are the non-touchable items that help with management of the data or
  // Are items that should not be touched for the sake of performance concerns.
  private listDisposer: Lambda;
  private instanceDisposers = new Map<T, Lambda>();
  private _instances: T[] | IObservableArray<T>;

  private instanceChanges = new Map<T, DiffType>();
  private instanceById = new Map<string, T>();

  private isChanged = false;
  private _changeList: [T, DiffType][] = [];

  // We very explicitly shut off the ability to set the top level properties on
  // This element. Mutations on the properties are allowed (and are thus trackable)
  // But modifying the root properties will not have a very clean way to monitor that.
  // So we make the properties accessible without being replaceable.
  get instances() {
    return this._instances;
  }

  get changeList() {
    // When the changelist is retrieved, we deactivate change recording until the provider
    // Is resolved
    this.active = false;

    if (this.isChanged) {
      const changes: [T, DiffType][] = [];
      this.instanceChanges.forEach((changeType, instance) => {
        changes.push([instance, changeType]);
      });

      this._changeList = changes;
    }

    return this._changeList;
  }

  constructor(data: T[]) {
    this._instances = observable(data || []);

    if (isObservableArray(this._instances)) {
      this.listDisposer = intercept(this._instances, this.monitorList(this._instances, this.instanceChanges, this.instanceById, this.instanceDisposers));
    }
  }

  /**
   * Clears out all disposers and items in the dataset
   */
  destroy() {
    this.listDisposer();
    this.instanceDisposers.forEach((disposer) => disposer());
    delete this._instances;
    this.instanceChanges.clear();
    delete this._changeList;
  }

  /**
   * This generates a method for an interceptor to monitor individual items within a list and record
   * any changes found to the changelist
   *
   * @param changes This is the change list which records the changes to the items
   */
  private monitorItem = (changes: Map<T, DiffType>) => (change: IObjectWillChange) => {
    if (this.active) {
      if (change.type === UPDATE_FLAG) {
        changes.set(change.object, DiffType.CHANGE);
        this.isChanged = true;
      }

      else {
        console.warn('Received an update type not supported by monitorItem:', change.type);
      }
    }

    return change;
  }

  /**
   * This generates a method for an interceptor that will monitor and collect change information
   * on the list of items specified.
   *
   * @param list The list of items to monitor
   * @param changes The changelist for the list of given item type
   * @param lookUp A lookup so items that have changed can get their source easily
   */
  private monitorList(list: T[], changes: Map<T, DiffType>, lookUp: Map<string, T>, disposers: Map<T, Lambda>) {
    return (change: IArrayWillChange<T> | IArrayWillSplice<T>) => {
      if (this.active) {
        // We only handle splice types for changes, these indicate elements have been added or removed
        if (change.type === SPLICE_FLAG) {
          // Record the removals and clear out any interceptors
          for (let i = change.index, end = change.index + change.removedCount; i < end; ++i) {
            const item = change.object[i];
            changes.set(item, DiffType.REMOVE);
            this.isChanged = true;
            const dispose = disposers.get(item);

            if (dispose) {
              dispose();
            }
          }

          // Record the additions and add intercepts for each item. Also generate a lookup for the item
          for (let i = 0, end = change.added.length; i < end; ++i) {
            const item = change.added[i] = observable(change.added[i]);
            changes.set(item, DiffType.INSERT);
            this.isChanged = true;
            lookUp.set(item.id, item);
            disposers.set(item, intercept(item, this.monitorItem(changes)));
          }
        }

        else {
          console.warn('Received an update type not supported by monitorList:', change.type);
        }
      }

      return change;
    };
  }

  /**
   * This resolves all of the changes found and makes them disappear.
   */
  resolve() {
    this.instanceById.clear();
    this.instanceChanges.clear();
    this._changeList = [];
    this.active = true;
  }
}
