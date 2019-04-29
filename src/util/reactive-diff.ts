import { IdentifyByKey } from "src/util/identify-by-key";

/**
 * These are the minimum properties required for a ReactiveDiff to monitor a set of objects.
 */
export type ReactiveDiffObject = {
  key: string | number;
};

/**
 * Customizes a ReactiveDiff object
 */
export interface IReactiveDiffOptions<T extends ReactiveDiffObject, U> {
  /** This method will execute when this controller has determined a new object should be constructed */
  buildItem(intiializer: T): Promise<U | null>;
  /** This method will execute when this controller has determined an object should be deconstructed */
  destroyItem(intiializer: T, item: U): Promise<boolean | null>;
  /** This method will execute when this controller has determined an object has potential new properties to be applied to it */
  updateItem(initializer: T, item: U): Promise<void>;
}

/**
 * This is a helper object to monitor a set of objects
 */
export class ReactiveDiff<T extends ReactiveDiffObject, U extends IdentifyByKey | null> {
  /** The options used to construct this controller */
  private options: IReactiveDiffOptions<T, U>;
  /** All items flagged for disposing */
  private willDispose = new Set<ReactiveDiffObject['key']>();
  /** We track all items by their key for quicker processing */
  private keyToItem = new Map<ReactiveDiffObject['key'], U>();
  /** We track all initializers by their key for quicker processing */
  private keyToInitializer = new Map<ReactiveDiffObject['key'], T>();

  /** A list of all the items currently alive and managed by this diff */
  get items(): U[] {
    const items: U[] = [];
    this.keyToItem.forEach(i => items.push(i));

    return items;
  }

  constructor(options: IReactiveDiffOptions<T, U>) {
    this.options = options;
  }

  /**
   * This injects the objects into the diff to be processed for new and removed items.
   */
  async diff(intializers: T[]) {
    // We loop through all items injected to see who is new, who exists already, and who no longer
    // exists in our input list.
    for (let i = 0, iMax = intializers.length; i < iMax; ++i) {
      const initializer = intializers[i];

      // Existing items will be in our dispose list, so since we received this item again
      // then we merely have an update and we remove the flag that would cause it to get tossed away
      if (this.willDispose.has(initializer.key)) {
        const item = this.keyToItem.get(initializer.key);
        if (item) await this.options.updateItem(initializer, item);
        this.keyToInitializer.set(initializer.key, initializer);
        this.willDispose.delete(initializer.key);
      }

      // Items that are not existing already will not be in the dispose queue
      else {
        const item = await this.options.buildItem(initializer);

        if (item) {
          this.keyToItem.set(initializer.key, item);
          this.keyToInitializer.set(initializer.key, initializer);
        }
      }
    }

    // Now that we have processed all incoming items, the remaining items in our disposal list
    // are the items we should remove.
    this.willDispose.forEach(async (key: string) => {
      const item = this.keyToItem.get(key);
      const initializer = this.keyToInitializer.get(key);
      if (!item || !initializer) return;
      const success = await this.options.destroyItem(initializer, item);
      if (success) this.keyToItem.delete(key);
    });

    this.willDispose.clear();

    // Now we take all existing items and flag them anew for disposal
    this.keyToInitializer.forEach(item => {
      this.willDispose.add(item.key);
    });
  }

  /**
   * Returns a specified item by key
   */
  getByKey(key: string) {
    return this.keyToItem.get(key);
  }
}
