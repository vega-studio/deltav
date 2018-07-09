import { computed, observable } from "mobx";
import { Circle } from "../../primitives/circle";
import { IInstanceOptions, Instance } from "../../util/instance";

export interface ICircleInstanceOptions extends IInstanceOptions, Circle {
  /** The color of this circle */
  color?: [number, number, number, number];
  /** The z depth of the circle (for draw ordering) */
  depth?: number;
}

export class CircleInstance extends Instance implements Circle {
  @observable color: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];
  @observable radius: number = 0;
  @observable x: number = 0;
  @observable y: number = 0;
  @observable depth: number = 0;

  constructor(options: ICircleInstanceOptions) {
    super(options);

    this.color = options.color || this.color;
    this.radius = options.radius || this.radius;
    this.x = options.x || this.x;
    this.y = options.y || this.y;
    this.depth = options.depth || this.depth;
  }

  @computed
  get width() {
    return this.radius * 2;
  }

  @computed
  get height() {
    return this.radius * 2;
  }
}
