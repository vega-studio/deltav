/**
 * This defines an object that helps facilitate parts of or complete shape buffers that
 * need regenerating.
 */
export class ShapeBufferCache<T> {
  buffer: T[] = [];
  bustCache: boolean = true;

  /**
   * Tells this cache to generate what it needs to. If the cache isn't busted,
   * it will not regenerate
   */
  generate(...args: any[]) {
    if (this.bustCache) {
      this.buildCache.apply(this, args);
      this.bustCache = false;
    }
  }

  /**
   * Sub classes will implement this stub to perform what is necessary to produce
   * a newly updated version of their cache.
   */
  buildCache(...args: any[]) {
    // Implemented by sub classes
  }

  /**
   * Get the buffer the cache has generated
   */
  getBuffer(): T[] {
    return this.buffer;
  }
}
