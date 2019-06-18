import { Controller2D } from "./controller2D";

export interface IReferenceCameraOptions {
  /** This is the base camera to monitor */
  base: Controller2D;
  /**
   * This is a filter applied to the offset that comes from the chart camera.
   */
  offsetFilter?(offset: [number, number, number]): [number, number, number];
  /**
   * This is a filter applied to the scale that comes from the chart camera.
   */
  scaleFilter?(scale: [number, number, number]): [number, number, number];
}

/**
 * This is a camera that is based on another camera. This can apply filters
 * to the information provided from the base camera.
 *
 * Useful for situations such as a chart having a chart area and a list on the
 * left. This can use the same camera the chart area uses, but filter the response
 * to only track the y offset of the base camera.
 *
 * That would allow easy tracking of the left list to track with elements in the
 * chart and only manipulate a single camera instead of managing many cameras and
 * tie them together with lots of events.
 */
export class ReferenceCamera extends Controller2D {
  private base: Controller2D;
  private offsetFilter = (offset: [number, number, number]) => offset;
  private scaleFilter = (scale: [number, number, number]) => scale;

  set offset(_val: any) {
    /** no-op */
  }

  get offset() {
    return this.offsetFilter(this.base.offset);
  }

  set scale(_val: any) {
    /** no-op */
  }

  get scale() {
    return this.scaleFilter(this.base.scale);
  }

  constructor(options: IReferenceCameraOptions) {
    super();
    Object.assign(this, options);
  }
}
