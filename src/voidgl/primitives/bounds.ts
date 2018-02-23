import { computed, observable } from 'mobx';

export interface IBoundsOptions {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

/**
 * Class to manage the x, y, width, and height of an object
 *
 * @template T This specifies the data type associated with this shape and is accessible
 *             via the property 'd'
 */
export class Bounds {
  @observable bottom: number = 0;
  @observable left: number = 0;
  @observable right: number = 0;
  @observable top: number = 0;

  @computed
  get height() {
    return this.bottom - this.top;
  }

  @computed
  get width() {
    return this.right - this.left;
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
    this.left = options.left;
    this.right = options.right;
    this.bottom = options.bottom;
    this.top = options.top;
  }
}
