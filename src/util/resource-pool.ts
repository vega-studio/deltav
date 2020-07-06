export interface IResourcePool<T> {
  firstAlloc: number;
  create(): T;
  destroy(item: T): void;
}

/**
 * This is a resource pool manager that aids in utilizing resources without ever
 * deallocating them. This is most useful in working with basic structured items
 * like Matrices and Vectors.
 */
export class ResourcePool<T> {
  private index: number = -1;
  private pool: T[];
  private marker = new Map<T, number>();
  private options: IResourcePool<T>;

  constructor(options: IResourcePool<T>) {
    this.pool = new Array(options.firstAlloc);

    for (let i = 0, iMax = options.firstAlloc; i < iMax; ++i) {
      this.pool[i] = options.create();
    }

    this.options = options;
  }

  destroy() {
    for (let i = 0, iMax = this.pool.length; i < iMax; ++i) {
      this.options.destroy(this.pool[i]);
    }

    delete this.pool;
    delete this.marker;
    delete this.options;
  }

  retrieve(): T {
    const item = this.pool[this.index + 1];
    this.index++;
    this.marker.set(item, this.index);
    return item;
  }

  replace(item: T) {
    const index = this.marker.get(item);
    if (index === void 0) return;
    this.pool[index] = this.pool[this.index];
    this.pool[this.index] = item;
    this.marker.delete(item);
    this.index--;
  }
}
