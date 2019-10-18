import { Camera2D } from "./camera-2d";
import { Control2D } from "./control-2d";

export interface IReferenceControl2DOptions {
  /** This is the base camera to monitor */
  base: Control2D;
  /**
   * This is a filter applied to the offset that comes from the chart camera.
   */
  offsetFilter?(offset: [number, number, number]): [number, number, number];
  /**
   * This is a filter applied to the scale that comes from the chart camera.
   */
  scaleFilter?(scale: [number, number, number]): [number, number, number];
}

class ReferenceControl2D extends Control2D {
  base: Control2D;
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

  constructor(camera: Camera2D, options: IReferenceControl2DOptions) {
    super(camera);
    this.base = options.base;
    this.offsetFilter = options.offsetFilter || this.offsetFilter;
    this.scaleFilter = options.scaleFilter || this.scaleFilter;
  }
}

export interface IReferenceCamera2DOptions {
  /** This is the base camera to monitor */
  base: Camera2D;
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
export class ReferenceCamera2D extends Camera2D {
  private base: Camera2D;
  private _control2D: ReferenceControl2D;

  set control2D(_val: Control2D) {
    /** Noop */
  }
  get control2D() {
    return this._control2D;
  }

  constructor(options: IReferenceCamera2DOptions) {
    super();
    this.base = options.base;

    this._control2D = new ReferenceControl2D(this.base, {
      base: this.base.control2D,
      offsetFilter: options.offsetFilter,
      scaleFilter: options.scaleFilter
    });
  }
}
