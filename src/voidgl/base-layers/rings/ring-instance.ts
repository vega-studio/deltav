import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { observable } from "../../instance-provider/observable";
import { Circle } from "../../primitives";

export interface IRingInstanceOptions extends IInstanceOptions, Circle {
  /** The color of this ring */
  color?: [number, number, number, number];
  /** The z depth of the ring (for draw ordering) */
  depth?: number;
  /** The thickness of the ring */
  thickness?: number;
}

export class RingInstance extends Instance implements Circle {
  @observable color: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];
  @observable depth: number = 0;
  @observable radius: number = 0;
  @observable thickness: number = 1;
  @observable x: number = 0;
  @observable y: number = 0;

  constructor(options: IRingInstanceOptions) {
    super(options);

    this.color = options.color || [1, 1, 1, 1];
    this.depth = options.depth || 0;
    this.radius = options.radius;
    this.thickness = options.thickness || this.thickness;
    this.x = options.x;
    this.y = options.y;
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
