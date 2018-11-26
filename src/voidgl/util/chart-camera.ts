import { Vec3 } from "./vector";

let chartCameraUID = 0;

export interface IChartCameraOptions {
  /** The world space offset of elements in the chart */
  offset?: [number] | [number, number] | Vec3;
  /** The world space scaling present in the chart */
  scale?: [number] | [number, number] | Vec3;
}

/**
 * Quick method for applying a source array to a target array. This
 * ensures the arrays both are valid and applies the values without just making
 * a copy of the source.
 */
function applyArray(target?: number[], source?: number[]) {
  target && source && target.splice(0, source.length, ...source);
}

export class ChartCamera {
  /** Internally set id */
  private _id: number = chartCameraUID++;
  /** Represents how much an element should be offset in world space */
  private _offset: Vec3 = [0, 0, 0];
  /** Represents how scaled each axis should be in world space */
  private _scale: Vec3 = [1, 1, 1];
  /** This indicates whether the view where the camera is in needs drawn */
  private _needsViewDrawn: boolean = true;

  constructor(options?: IChartCameraOptions) {
    if (options) {
      applyArray(this.offset, options.offset);
      applyArray(this.scale, options.scale);
    }
  }

  /** Keep id as readonly */
  get id() {
    return this._id;
  }

  setId(id: number) {
    this._id = id;
    this._needsViewDrawn = true;
  }

  get offset() {
    return this._offset;
  }

  /**
   * Sets the location of the camera by adjusting the offsets to match.
   */
  setOffset(offset: Vec3) {
    this._offset = offset.slice(0) as Vec3;
    this._needsViewDrawn = true;
  }

  get scale() {
    return this._scale;
  }

  setScale(scale: Vec3) {
    this._scale = scale;
    this._needsViewDrawn = true;
  }

  get needsViewDrawn() {
    return this._needsViewDrawn;
  }

  resolve() {
    this._needsViewDrawn = false;
  }

  update() {
    this._needsViewDrawn = true;
  }
}
