import { computed, observable } from 'mobx';
import { IPoint } from './point';

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
export class Bounds {
  @observable x: number = 0;
  @observable y: number = 0;
  @observable width: number = 0;
  @observable height: number = 0;

  @computed
  get area() {
    return this.width * this.height;
  }

  @computed
  get bottom() {
    return this.y + this.height;
  }

  @computed
  get left() {
    return this.x;
  }

  @computed
  get mid() {
    return {
      x: this.x + this.width / 2.0,
      y: this.y + this.height / 2.0,
    };
  }

  @computed
  get right() {
    return this.x + this.width;
  }

  @computed
  get top() {
    return this.y;
  }

  static emptyBounds() {
    return new Bounds({
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
    this.height = options.height || (options.bottom - this.y) || 0;
    this.width = options.width || (options.right - this.x) || 0;
  }

  /**
   * Checks to see if a point is within this bounds object.
   *
   * @param point
   */
  containsPoint(point: IPoint) {
    return !(point.x < this.x || point.y < this.y || point.x > this.right || point.y > this.bottom);
  }

  /**
   * Grows this bounds object to cover the space of the provided bounds object
   *
   * @param bounds
   */
  encapsulate(bounds: Bounds) {
    this.x = Math.min(this.x, bounds.x);
    this.y = Math.min(this.y, bounds.y);

    if (this.right < bounds.right) {
      this.width += bounds.right - this.right;
    }

    if (this.bottom < bounds.bottom) {
      this.height += bounds.bottom - this.bottom;
    }

    return true;
  }

  /**
   * Checks to see if the provided bounds object could fit within the dimensions of this bounds object
   * This ignores position and just checks width and height.
   *
   * @param bounds
   *
   * @return {number} 0 if it doesn't fit. 1 if it fits perfectly. 2 if it just fits.
   */
  fits(bounds: Bounds): 0 | 1 | 2 {
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
  hitBounds(bounds: Bounds) {
    return !(this.right < bounds.x || this.x > bounds.right || this.bottom < bounds.y || this.y > bounds.height);
  }

  /**
   * Sees if the provided bounds is completely within this bounds object. Unlike fits() this takes
   * position into account.
   *
   * @param bounds
   */
  isInside(bounds: Bounds): boolean {
    return this.x >= bounds.x && this.right <= bounds.right && this.y >= bounds.y && this.bottom <= bounds.bottom;
  }

  /**
   * Easy readout of this Bounds object.
   */
  toString() {
    return `{x: ${this.x} y:${this.y} w:${this.width} h:${this.height}}`;
  }
}
