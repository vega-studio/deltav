import {
  AutoEasingMethod,
  IAutoEasingMethod
} from "../../math/auto-easing-method";
import { copy3, divide3, scale3, subtract3, Vec3 } from "../../math/vector";
import { Surface } from "../../surface";
import { uid } from "../../util/uid";
import { Camera2D } from "./camera-2d";

export interface IControl2DOptions {
  /** The world space offset of elements in the chart */
  offset?: Vec3;
  /** The world space scaling present in the chart */
  scale?: Vec3;
}

const immediateAnimation = AutoEasingMethod.immediate<Vec3>(0);

/**
 * Controls for 2D world manipulation
 */
export class Control2D {
  get id() {
    return this._id;
  }
  private _id: number = uid();

  /** The animation set to this camera to animate it's scale and offset */
  animation: IAutoEasingMethod<Vec3> = AutoEasingMethod.immediate(0);
  /** This records when the end of the animation for the camera will be completed */
  animationEndTime: number = 0;
  /** The 2d camera to work with */
  camera: Camera2D;
  /** Indicates which time frame the offset was retrieved so it will only broadcast a change event once for that timeframe */
  private offsetBroadcastTime: number = 0;
  /** Indicates which time frame the scale was retrieved so it will only broadcast a change event once for that timeframe */
  private scaleBroadcastTime: number = 0;
  /** Represents how much an element should be offset in world space */
  private _offset: Vec3 = [0, 0, 0];
  private startOffset: Vec3 = [0, 0, 0];
  private startOffsetTime: number = 0;
  private offsetEndTime: number = 0;
  /** Represents how scaled each axis should be in world space */
  private _scale: Vec3 = [1, 1, 1];
  private startScale: Vec3 = [1, 1, 1];
  private startScaleTime: number = 0;
  private scaleEndTime: number = 0;
  /** This is the surface the camera is controlled by */
  surface: Surface;
  /** When set, this will broadcast any change in the camera that will affect the view range */
  private onViewChange?: (camera: Camera2D, view: string) => void;
  /** Flag indicating the camera needs to broadcast it's changes */
  private needsBroadcast = false;

  constructor(camera: Camera2D, options?: IControl2DOptions) {
    this.camera = camera;

    if (options) {
      this._offset = copy3(options.offset || this._offset);
      this._scale = copy3(options.scale || this._scale);
    }
  }

  /**
   * Performs the broadcast of changes for the camera if the camera needed a broadcast.
   */
  broadcast(viewId: string) {
    // First we do a simple get of the animated properties. This will cause the broadcast flag to
    // be set if there are any changes for the current frame.
    this.offset;
    this.scale;

    // If the broadcast flag get's set, we should emit the event for the change.
    if (this.needsBroadcast) {
      this.needsBroadcast = false;
      if (this.onViewChange) this.onViewChange(this.camera, viewId);
    }
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

    const currentAnimation = this.animation;
    this.setOffset(copy3(this.offset));
    this.animation = immediateAnimation;
    this.setOffset(scale3(fromScreenCenter, -1));
    this.animation = currentAnimation;
  }

  /**
   * Retrieves the current frame's time from the surface this camera is managed under.
   */
  private getCurrentTime() {
    if (this.surface) {
      return this.surface.frameMetrics.currentTime;
    }

    return 0;
  }

  /**
   * Gets the source offset value
   */
  getOffset() {
    return this._offset;
  }

  /**
   * Gets the source scale value
   */
  getScale() {
    return this._scale;
  }

  /**
   * Retrieves the animated value of the offset of the camera.
   * To get a non-animated version of the offset use getOffset()
   */
  get offset() {
    const currentTime = this.getCurrentTime();

    if (this.onViewChange) {
      if (this.offsetBroadcastTime < this.offsetEndTime) {
        this.offsetBroadcastTime = currentTime;
        this.needsBroadcast = true;
      }
    }

    return this.animation.cpu(
      this.startOffset,
      this._offset,
      (currentTime - this.startOffsetTime) / this.animation.duration
    );
  }

  /**
   * Sets the id of this camera
   */
  setId(id: number) {
    this._id = id;
    this.camera.needsViewDrawn = true;
  }

  /**
   * Sets the location of the camera by adjusting the offsets to match.
   * Whatever is set for the "animation" property determines the animation.
   */
  setOffset(offset: Vec3) {
    // Start offset is the offset of the camera at the current evaluated time
    this.startOffset = copy3(this.offset);
    // Copy the new end offset value
    this._offset = copy3(offset);
    // Get the current time as our starter time of the animating
    this.startOffsetTime = this.getCurrentTime();
    // Get the time the offset will complete
    this.offsetEndTime = this.startOffsetTime + this.animation.duration;
    // The total animation end time will be the max end time of all animateable properties
    this.updateEndTime();
    // Flag the view for a redraw
    this.camera.needsViewDrawn = true;

    // Broadcast change
    if (this.onViewChange) {
      this.offsetBroadcastTime = this.startOffsetTime;
      this.needsBroadcast = true;
    }
  }

  /**
   * Retrieves the animated scale. If you want straight end scale value, use getScale()
   */
  get scale() {
    const currentTime = this.getCurrentTime();

    if (this.onViewChange) {
      if (this.scaleBroadcastTime < this.scaleEndTime) {
        this.scaleBroadcastTime = currentTime;
        this.needsBroadcast = true;
      }
    }

    return this.animation.cpu(
      this.startScale,
      this._scale,
      (currentTime - this.startScaleTime) / this.animation.duration
    );
  }

  /**
   * Applies the handler for broadcasting view changes from the camera.
   */
  setViewChangeHandler(handler: Control2D["onViewChange"]) {
    this.onViewChange = handler;
  }

  /**
   * Sets and animates the scale of the camera.
   * Whatever is set for the "animation" property determines the animation.
   */
  setScale(scale: Vec3) {
    // Start scale is the scale of the camera at the current evaluated time
    this.startScale = copy3(this.scale);
    // Store the destination value of the scale
    this._scale = copy3(scale);
    // Start of the animation is now
    this.startScaleTime = this.getCurrentTime();
    // Get the time the scale will complete animation
    this.scaleEndTime = this.startScaleTime + this.animation.duration;
    // Update end animation time
    this.updateEndTime();
    // Flag this as needing a redraw so all views using it will update.
    this.camera.needsViewDrawn = true;

    // Broadcast change
    if (this.onViewChange) {
      this.scaleBroadcastTime = this.startScaleTime;
      this.needsBroadcast = true;
    }
  }

  /**
   * Resolves all flags indicating updates needed.
   */
  resolve() {
    this.camera.needsViewDrawn = false;
    this.needsBroadcast = false;
  }

  update() {
    this.camera.needsViewDrawn = true;
  }

  private updateEndTime() {
    this.animationEndTime = Math.max(this.scaleEndTime, this.offsetEndTime);
  }
}
