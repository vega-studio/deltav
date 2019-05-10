import { LayerSurface } from "src/surface";
import {
  AutoEasingMethod,
  IAutoEasingMethod
} from "src/util/auto-easing-method";
import { copy3, divide3, scale3, subtract3, Vec3 } from "./vector";

let chartCameraUID = 0;

export interface IChartCameraOptions {
  /** The world space offset of elements in the chart */
  offset?: Vec3;
  /** The world space scaling present in the chart */
  scale?: Vec3;
}

export class ChartCamera {
  /** The animation set to this camera to animate it's scale and offset */
  animation: IAutoEasingMethod<Vec3> = AutoEasingMethod.immediate(0);
  /** This records when the end of the animation for the camera will be completed */
  animationEndTime: number;
  /** Internally set id */
  private _id: number = chartCameraUID++;
  /** Represents how much an element should be offset in world space */
  private _offset: Vec3 = [0, 0, 0];
  private startOffset: Vec3 = [0, 0, 0];
  private startOffsetTime: number = 0;
  /** Represents how scaled each axis should be in world space */
  private _scale: Vec3 = [1, 1, 1];
  private startScale: Vec3 = [1, 1, 1];
  private startScaleTime: number = 0;
  /** This indicates whether the view where the camera is in needs drawn */
  private _needsViewDrawn: boolean = true;
  /** This is the surface the camera is controlled by */
  surface: LayerSurface;

  constructor(options?: IChartCameraOptions) {
    if (options) {
      this._offset = copy3(options.offset || this._offset);
      this._scale = copy3(options.scale || this._scale);
    }
  }

  /** Keep id as readonly */
  get id() {
    return this._id;
  }

  /**
   * Adjusts offset to set the middle at the provided location relative to a provided view.
   */
  centerOn(viewId: string, position: Vec3) {
    const viewBounds = this.surface.getViewSize(viewId);
    if (!viewBounds) return;
    const midScreen: Vec3 = [viewBounds.width / 2, viewBounds.height / 2, 0];
    const fromScreenCenter: Vec3 = subtract3(
      position,
      divide3(midScreen, this._scale)
    );
    this.setOffset(scale3(fromScreenCenter, -1));
  }

  setId(id: number) {
    this._id = id;
    this._needsViewDrawn = true;
  }

  get offset() {
    return this.animation.cpu(
      this.startOffset,
      this._offset,
      (this.getCurrentTime() - this.startOffsetTime) / this.animation.duration
    );
  }

  /**
   * Gets the source offset value
   */
  getOffset() {
    return this._offset;
  }

  /**
   * Sets the location of the camera by adjusting the offsets to match.
   */
  setOffset(offset: Vec3) {
    this.startOffset = copy3(this._offset);
    this._offset = copy3(offset);
    this.startOffsetTime = this.getCurrentTime();
    this.animationEndTime = Math.max(
      this.animationEndTime,
      this.startOffsetTime + this.animation.duration
    );
    this._needsViewDrawn = true;
  }

  get scale() {
    return this.animation.cpu(
      this.startScale,
      this._scale,
      (this.getCurrentTime() - this.startScaleTime) / this.animation.duration
    );
  }

  setScale(scale: Vec3) {
    this.startScale = this._scale;
    this._scale = scale;
    this.startScaleTime = this.getCurrentTime();
    this.animationEndTime = Math.max(
      this.animationEndTime,
      this.startScaleTime + this.animation.duration
    );
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

  private getCurrentTime() {
    if (this.surface) {
      return this.surface.frameMetrics.currentTime;
    }

    return 0;
  }
}
