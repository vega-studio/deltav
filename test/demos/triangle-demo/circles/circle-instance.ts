import { IInstanceOptions, Instance, observable, Vec2 } from "src";

export interface ICircleInstanceOptions extends IInstanceOptions {
  world: Vec2;
  /** Center position of the circle */
  position: Vec2;
  /** The radius of the circle */
  size: number;
  /** The color of this circle */
  color?: [number, number, number, number];
  /** The z depth of the circle (for draw ordering) */
  depth?: number;
}

export class CircleInstance extends Instance {
  /** The color of this circle */
  @observable color: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];
  /** The z depth of the circle (for draw ordering) */
  @observable depth: number = 0;
  /** The radius of the circle */
  @observable radius: number = 0;
  /** Center position of the circle */
  @observable center: Vec2 = [0, 0];

  anchor: Vec2 = [0, 0];

  constructor(options: ICircleInstanceOptions) {
    super(options);

    this.color = options.color || this.color;
    this.radius = options.size || this.radius;
    this.center = options.position || this.center;
    this.depth = options.depth || this.depth;
    this.anchor = options.world || this.anchor;
  }

  get width() {
    return this.radius * 2;
  }

  get height() {
    return this.radius * 2;
  }
}
