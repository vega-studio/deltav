import { IdentifyByKey } from "src/util/identify-by-key";

/**
 * These are the minimum properties required for a ReactiveDiff to monitor a set of objects.
 */
export type ReactiveDiffObject<U> = {
  /** The identifier of the object which is used to determine who is added/removed/updated */
  key: string | number;
  /** When inline() is used, it designates the caller of inline as the parent object */
  parent?: U;
};

/**
 * Customizes a ReactiveDiff object
 */
export interface IReactiveDiffOptions<U, T extends ReactiveDiffObject<U>> {
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
export class ReactiveDiff<
  U extends IdentifyByKey | null,
  T extends ReactiveDiffObject<U>
> {
  /** The options used to construct this controller */
  private options: IReactiveDiffOptions<U, T>;
  /** All items flagged for disposing */
  private willDispose = new Set<T["key"]>();
  /** We track all items by their key for quicker processing */
  private keyToItem = new Map<T["key"], U>();
  /** We track all initializers by their key for quicker processing */
  private keyToInitializer = new Map<T["key"], T>();
  /** Used to faciliate and enable the inline() ability */
  private currentInitalizerIndex = 0;
  /**
   * The current initializers being processed. This is used to ensure the inline() method can inject correctly without
   * jmutating the input initializer list.
   */
  private currentInitializers: T[] = [];
  /**
   * This is the list of the items generated and managed by this diff object, this list is in the order they appear
   * in the diff initializers injected into the diff.
   */
  private _items: U[] = [];
  /**
   * While processing, this keeps track of the currently executing initializer and object
   */
  private currentInitializer?: T;
  private currentItem?: U;

  /** A list of all the items currently alive and managed by this diff */
  get items(): U[] {
    return this._items.slice(0);
  }

  constructor(options: IReactiveDiffOptions<U, T>) {
    this.options = options;
  }

  /**
   * This triggers all resources currently managed by this diff manager to process their destroy procedure
   */
  async destroy() {
    const promises: Promise<boolean | null>[] = [];

    for (let i = 0, iMax = this.currentInitializers.length; i < iMax; ++i) {
      const init = this.currentInitializers[i];
      const item = this.keyToItem.get(init.key);
      if (!item) continue;
      promises.push(this.options.destroyItem(init, item));
    }

    await Promise.all(promises);
  }

  /**
   * This injects the objects into the diff to be processed for new and removed items.
   */
  async diff(intializers: T[]) {
    // Make sure we don't mutate the input
    const processing = intializers.slice(0);
    this.currentInitializers = processing;
    // Clear out our items listing so we can repopulate it with the correct order of elements injected
    this._items = [];

    // We loop through all items injected to see who is new, who exists already, and who no longer
    // exists in our input list.
    for (let i = 0, iMax = processing.length; i < iMax; ++i) {
      const initializer = processing[i];
      this.currentInitalizerIndex = i;
      this.currentInitializer = initializer;

      // Existing items will be in our dispose list, so since we received this item again
      // then we merely have an update and we remove the flag that would cause it to get tossed away
      if (this.willDispose.has(initializer.key)) {
        let item = this.keyToItem.get(initializer.key) || null;

        if (item) {
          this.currentItem = item;
          await this.options.updateItem(initializer, item);
        } else item = await this.options.buildItem(initializer);

        if (item) {
          this.keyToInitializer.set(initializer.key, initializer);
          this.willDispose.delete(initializer.key);
          this.items.push(item);
        }
      }

      // Items that are not existing already will not be in the dispose queue
      else {
        const item = await this.options.buildItem(initializer);

        if (item) {
          this.keyToItem.set(initializer.key, item);
          this.keyToInitializer.set(initializer.key, initializer);
          this.items.push(item);
        }
      }

      delete this.currentItem;
    }

    // Now that we have processed all incoming items, the remaining items in our disposal list
    // are the items we should remove.
    this.willDispose.forEach(async (key: string) => {
      const item = this.keyToItem.get(key);
      const initializer = this.keyToInitializer.get(key);
      if (!item || !initializer) return;
      const success = await this.options.destroyItem(initializer, item);

      if (success) {
        this.keyToItem.delete(key);
        this.keyToInitializer.delete(key);
      }
    });

    this.willDispose.clear();

    // Now we take all existing items and flag them anew for disposal
    this.keyToInitializer.forEach(item => {
      this.willDispose.add(item.key);
    });

    // Don't hang onto the mutated list of initializers
    delete this.currentInitializers;
    delete this.currentItem;
    delete this.currentInitializer;
  }

  /**
   * Returns a specified item by key
   */
  getByKey(key: string) {
    return this.keyToItem.get(key);
  }

  /**
   * This method is used to inline new elements at the time an update/creation occurs
   */
  inline(newInitializers: T[]) {
    if (this.currentInitializers && this.currentItem) {
      this.currentInitializers.splice(
        this.currentInitalizerIndex + 1,
        0,
        ...newInitializers
      );

      for (let i = 0, iMax = newInitializers.length; i < iMax; ++i) {
        const init = newInitializers[i];
        init.parent = this.currentItem;
      }
    }
  }

  /**
   * Only during the updateItem phase of an item can this be called. This will cause the item
   * to be fully destroyed, then reconstructed instead of go through an update.
   */
  async rebuild() {
    // Only execute if currently running diffs and if currently in an update phase
    if (!this.currentItem || !this.currentInitializer) return;
    // Clear the item from any look ups
    this.keyToItem.delete(this.currentItem.id);
    this.keyToInitializer.delete(this.currentItem.id);

    // Perform the destruction of the item
    this.options.destroyItem(this.currentInitializer, this.currentItem);
    // Rebuild the item
    const item = await this.options.buildItem(this.currentInitializer);

    // Re-add the item to the lookups if the rebuild succeeded
    if (item) {
      this.keyToItem.set(this.currentItem.id, item);
      this.keyToInitializer.set(this.currentItem.id, this.currentInitializer);
    }
  }
}
