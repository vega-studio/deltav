import {
  IInstanceOptions,
  Instance
} from "../../../instance-provider/instance";
import { observable } from "../../../instance-provider/observable";
import { Vec2 } from "../../../math";

export interface IRingInstanceOptions extends IInstanceOptions {
  /** The center of the ring */
  center?: Vec2;
  /** The color of this ring */
  color?: [number, number, number, number];
  /** The z depth of the ring (for draw ordering) */
  depth?: number;
  /** The outer radius of the ring */
  radius?: number;
  /** The thickness of the ring */
  thickness?: number;
}

export class RingInstance extends Instance {
  @observable color: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];
  @observable depth: number = 0;
  @observable radius: number = 0;
  @observable thickness: number = 1;
  @observable center: Vec2 = [0, 0];

  constructor(options: IRingInstanceOptions) {
    super(options);
    makeObservable(this, RingInstance);

    this.color = options.color || this.color;
    this.depth = options.depth || this.depth;
    this.radius = options.radius || this.radius;
    this.thickness = options.thickness || this.thickness;
    this.center = options.center || this.center;
  }

  get width() {
    return this.radius * 2;
  }

  get height() {
    return this.radius * 2;
  }

  get innerRadius() {
    return this.radius - this.thickness;
  }
}
