let chartCameraUID = 0;

export interface IChartCameraOptions {
  /** The world space offset of elements in the chart */
  offset?: [number] | [number, number] | [number, number, number];
  /** The world space scaling present in the chart */
  scale?: [number] | [number, number] | [number, number, number];
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
  private _offset: [number, number, number] = [0, 0, 0];
  /** Represents how scaled each axis should be in world space */
  private _scale: [number, number, number] = [1, 1, 1];
  /** This indicates whether the view where the camera is in needs drawn */
  private _needsViewDrawn: boolean = false;

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
    this.setNeedsViewDrawn(true);
  }

  get offset() {
    return this._offset;
  }

  /**
   * Sets the location of the camera by adjusting the offsets to match.
   */
  setOffset(offset: [number, number, number]) {
    this._offset = offset.slice(0) as [number, number, number];
    this.setNeedsViewDrawn(true);
  }

  get scale() {
    return this._scale;
  }

  setScale(scale: [number, number, number]) {
    this._scale = scale;
    this.setNeedsViewDrawn(true);
  }

  get needsViewDrawn() {
    return this._needsViewDrawn;
  }

  setNeedsViewDrawn(needsViewDrawn: boolean) {
    this._needsViewDrawn = needsViewDrawn;
  }
}
