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
  _id: number = chartCameraUID++;
  /** Represents how much an element should be offset in world space */
  offset: [number, number, number] = [0, 0, 0];
  /** Represents how scaled each axis should be in world space */
  scale: [number, number, number] = [1, 1, 1];
  /** This indicates whether the view where the camera is in needs drawn */
  needsViewDrawn: boolean = false;

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

  /**
   * Sets the location of the camera by adjusting the offsets to match.
   */
  position(location: [number, number, number]) {
    this.offset = location.slice(0) as [number, number, number];
  }
}
