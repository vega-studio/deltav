import {
  IInstanceOptions,
  Instance,
  makeObservable,
  observable,
  Vec2,
} from "../../../../src/index.js";

export interface IVertexPackingCircleInstanceOptions extends IInstanceOptions {
  /** Center position of the circle */
  center: Vec2;
  /** The radius of the circle */
  radius: number;
  /** The color of this circle */
  color?: [number, number, number, number];
  color2?: [number, number, number, number];
  /** The z depth of the circle (for draw ordering) */
  depth?: number;
}

/**
 * A poorly optimized circle that causes vertex packing to happen in the buffer
 * management (there is more vertex information than available vertex attributes
 * thus causing multiple vertex atttributes to be packed into a single vertex.)
 */
export class VertexPackingCircleInstance extends Instance {
  /** The color of this circle */
  @observable color: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];
  @observable color2: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];
  /** The z depth of the circle (for draw ordering) */
  @observable depth = 0;
  /** The radius of the circle */
  @observable radius = 0;
  /** Center position of the circle */
  @observable center: Vec2 = [0, 0];

  constructor(options: IVertexPackingCircleInstanceOptions) {
    super(options);
    makeObservable(this, VertexPackingCircleInstance);

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
