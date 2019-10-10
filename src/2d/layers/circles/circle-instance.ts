import { observable } from '../../../instance-provider';
import {
  IInstanceOptions,
  Instance,
} from '../../../instance-provider/instance';
import { Vec2 } from '../../../math';

export interface ICircleInstanceOptions extends IInstanceOptions {
  /** Center x position of the circle */
  center: Vec2;
  /** The radius of the circle */
  radius: number;
  /** The color of this circle */
  color?: [number, number, number, number];
  /** The z depth of the circle (for draw ordering) */
  depth?: number;
}

export class CircleInstance extends Instance {
  @observable color: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];
  @observable depth: number = 0;
  @observable radius: number = 0;
  @observable center: Vec2 = [0, 0];

  constructor(options: ICircleInstanceOptions) {
    super(options);

    this.color = options.color || this.color;
    this.radius = options.radius || this.radius;
    this.center = options.center || this.center;
    this.depth = options.depth || this.depth;
  }

  get width() {
    return this.radius * 2;
  }

  get height() {
    return this.radius * 2;
  }
}
