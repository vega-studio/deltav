import { Vec2 } from '../vector';

const { min, max } = Math;

export interface IBoundsOptions {
  /** Top left x position */
  x?: number;
  /** Top left y position */
  y?: number;
  /** Width covered */
  width?: number;
  /** height covered */
  height?: number;

  /** Specify the left */
  left?: number;
  /** Specify the right */
  right?: number;
  /** Specify the top */
  top?: number;
  /** Specify the bottom */
  bottom?: number;
}

/**
 * Class to manage the x, y, width, and height of an object
 *
 * @template T This specifies the data type associated with this shape and is accessible
 *             via the property 'd'
 */
export class Bounds<T> {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  d?: T;

  get area() {
    return this.width * this.height;
  }

  get bottom() {
    return this.y + this.height;
  }

  get left() {
    return this.x;
  }

  get mid(): Vec2 {
    return [this.x + this.width / 2.0, this.y + this.height / 2.0];
  }

  get right() {
    return this.x + this.width;
  }

  get top() {
    return this.y;
  }

  static emptyBounds<T>() {
    return new Bounds<T>({
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    });
  }

  /**
   * Create a new instance
   *
   * @param left  The left side (x coordinate) of the instance
   * @param right The right side of the instance
   * @param top The top (y coordinate) of the instance
   * @param bottom The bottom of the instance
   */
  constructor(options: IBoundsOptions) {
    this.x = options.x || options.left || 0;
    this.y = options.y || options.top || 0;
    this.height = options.height || (options.bottom || 0) - this.y || 0;
    this.width = options.width || (options.right || 0) - this.x || 0;
  }

  /**
   * Checks to see if a point is within this bounds object.
   *
   * @param point
   */
  containsPoint(point: Vec2) {
    return !(
      point[0] < this.x ||
      point[1] < this.y ||
      point[0] > this.right ||
      point[1] > this.bottom
    );
  }

  /**
   * Grows this bounds object to cover the space of the provided bounds object
   *
   * @param item
   */
  encapsulate(item: Bounds<any> | Vec2) {
    if (item instanceof Bounds) {
      if (item.x < this.x) {
        this.width += Math.abs(item.x - this.x);
        this.x = item.x;
      }

      if (item.y < this.y) {
        this.height += Math.abs(item.y - this.y);
        this.y = item.y;
      }

      if (this.right < item.right) {
        this.width += item.right - this.right;
      }

      if (this.bottom < item.bottom) {
        this.height += item.bottom - this.bottom;
      }

      return true;
    } else {
      if (item[0] < this.x) {
        this.width += this.x - item[0];
        this.x = item[0];
      }

      if (item[0] > this.right) {
        this.width += item[0] - this.x;
      }

      if (item[1] < this.y) {
        this.height += this.y - item[1];
        this.y = item[1];
      }

      if (item[1] > this.bottom) {
        this.height += item[1] - this.y;
      }

      return true;
    }
  }

  /**
   * Grows the bounds (if needed) to encompass all bounds or points provided. This
   * performs much better than running encapsulate one by one.
   */
  encapsulateAll(all: Bounds<any>[] | Vec2[]) {
    // Nothing provided, nothing to do
    if (all.length <= 0) return;
    // Stores max boundaries found
    let minX = Number.MAX_SAFE_INTEGER,
      maxX = Number.MIN_SAFE_INTEGER,
      minY = Number.MAX_SAFE_INTEGER,
      maxY = Number.MIN_SAFE_INTEGER;

    // Handle list of bounds
    if (all[0] instanceof Bounds) {
      const boundsList = all as Bounds<T>[];

      for (let i = 0, iMax = boundsList.length; i < iMax; ++i) {
        const bounds = boundsList[i];
        minX = min(minX, bounds.left);
        maxX = max(maxX, bounds.right);
        minY = min(minY, bounds.top);
        maxY = max(maxY, bounds.bottom);
      }
    }

    // Handle list of points
    else {
      const pointsList = all as Vec2[];

      for (let i = 0, iMax = pointsList.length; i < iMax; ++i) {
        const [x, y] = pointsList[i];
        minX = min(minX, x);
        maxX = max(maxX, x);
        minY = min(minY, y);
        maxY = max(maxY, y);
      }
    }

    this.x = Math.min(this.x, minX);
    this.y = Math.min(this.y, minY);
    this.width = Math.max(this.width, maxX - minX);
    this.height = Math.max(this.height, maxY - minY);
  }

  /**
   * Checks to see if the provided bounds object could fit within the dimensions of this bounds object
   * This ignores position and just checks width and height.
   *
   * @param bounds
   *
   * @return {number} 0 if it doesn't fit. 1 if it fits perfectly. 2 if it just fits.
   */
  fits(bounds: Bounds<T>): 0 | 1 | 2 {
    // If the same, the bounds fits exactly into this bounds
    if (this.width === bounds.width && this.height === bounds.height) {
      return 1;
    }

    // The bounds can fit within this, then it just fits
    if (this.width >= bounds.width && this.height >= bounds.height) {
      return 2;
    }

    // Otherwise, the bounds does not fit within this bounds
    return 0;
  }

  /**
   * Checks if a bounds object intersects another bounds object.
   *
   * @param bounds
   */
  hitBounds(bounds: Bounds<any>) {
    return !(
      this.right < bounds.x ||
      this.x > bounds.right ||
      this.bottom < bounds.y ||
      this.y > bounds.bottom
    );
  }

  /**
   * Sees if the provided bounds is completely within this bounds object. Unlike fits() this takes
   * position into account.
   *
   * @param bounds
   */
  isInside(bounds: Bounds<any>): boolean {
    return (
      this.x >= bounds.x &&
      this.right <= bounds.right &&
      this.y >= bounds.y &&
      this.bottom <= bounds.bottom
    );
  }

  /**
   * Top left position of the bounds
   */
  get location(): Vec2 {
    return [this.x, this.y];
  }

  /**
   * Easy readout of this Bounds object.
   */
  toString() {
    return `{x: ${this.x} y:${this.y} w:${this.width} h:${this.height}}`;
  }
}
