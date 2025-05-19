import { makeObservable, observable } from "../../../instance-provider";
import {
  IInstanceOptions,
  Instance,
} from "../../../instance-provider/instance.js";
import { Vec2, Vec4 } from "../../../math";

export interface IArcInstanceOptions extends IInstanceOptions {
  /** The start and end angle of the arc */
  angle: Vec2;
  /** The center point where the arc wraps around */
  center: Vec2;
  /** This is the end color of the arc */
  colorEnd?: Vec4;
  /** This is the start color of the arc */
  colorStart?: Vec4;
  /** Depth sorting of the arc (or the z value of the arc) */
  depth?: number;
  /** The radius of how far the middle of the arc is from the center point */
  radius: number;
  /** The start to end thickness of the arc */
  thickness?: Vec2;
}

/**
 * This generates a new arc instance. An arc is a shape with a center and an angle that
 * is spans. This effectively can be used for a 'pie slice' or just the edge line on the pie
 * slice.
 */
export class ArcInstance extends Instance {
  /** The start and end angle of the arc */
  @observable angle: Vec2 = [0, Math.PI];
  /** This is the end color of the arc */
  @observable colorEnd: Vec4 = [1, 1, 1, 1];
  /** This is the start color of the arc */
  @observable colorStart: Vec4 = [1, 1, 1, 1];
  /** The center point where the arc wraps around */
  @observable center: Vec2 = [0, 0];
  /** Depth sorting of the arc (or the z value of the arc) */
  @observable depth = 0;
  /** An offset to apply to the angle. This makes it easy to animate the arc or set a point of reference for angle 0 */
  @observable angleOffset = 0;
  /** The radius of how far the middle of the arc is from the center point */
  @observable radius = 1;
  /** The start to end thickness of the arc */
  @observable thickness: Vec2 = [5, 5];

  constructor(options: IArcInstanceOptions) {
    super(options);
    makeObservable(this, ArcInstance);

    this.angle = options.angle || this.angle;
    this.colorEnd = options.colorEnd || this.colorEnd;
    this.colorStart = options.colorStart || this.colorStart;
    this.center = options.center || this.center;
    this.depth = options.depth || this.depth;
    this.radius = options.radius || this.radius;
    this.thickness = options.thickness || this.thickness;
  }
}
