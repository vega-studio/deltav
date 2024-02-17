import { copy4, Vec2, Vec4 } from "../../../math";
import {
  IInstanceOptions,
  Instance,
} from "../../../instance-provider/instance";
import {
  makeObservable,
  observable,
} from "../../../instance-provider/observable";

export interface IEdgeInstanceOptions extends IInstanceOptions {
  /** This is the list of control points  */
  control?: Vec2[];
  /** The z depth of the edge (for draw ordering) */
  depth?: number;
  /** End point of the edge. */
  end: Vec2;
  /** End color of the edge */
  endColor?: Vec4;
  /** Beginning point of the edge. */
  start: Vec2;
  /** Start color of the edge */
  startColor?: Vec4;
  /** Start width of the edge. */
  thickness?: Vec2;
}

export class EdgeInstance extends Instance {
  @observable control: Vec2[] = [
    [0, 0],
    [0, 0],
  ];
  @observable depth = 0;
  @observable end: Vec2 = [0, 0];
  @observable endColor: Vec4 = [1.0, 1.0, 1.0, 1.0];
  @observable start: Vec2 = [0, 0];
  @observable startColor: Vec4 = [1.0, 1.0, 1.0, 1.0];
  @observable thickness: Vec2 = [1.0, 1.0];

  /**
   * Calculates length from beginning point to end point
   */
  get length() {
    const delta = [this.end[0] - this.start[0], this.end[1] - this.start[1]];

    return Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1]);
  }

  /**
   * Calculates the midpoint of the edge
   */
  get midpoint() {
    return 0;
  }

  /**
   * Calculates a perpendicular direction vector to the edge
   */
  get perpendicular(): Vec2 {
    const length = this.length;

    return [
      (this.end[1] - this.start[1]) / length,
      -(this.end[0] - this.start[0]) / length,
    ];
  }

  /**
   * Applies the edge width to the start and end
   */
  setEdgeThickness(thickness: number) {
    this.thickness = [thickness, thickness];
  }

  /**
   * Applies the color to the start and end
   */
  setColor(color: Vec4) {
    this.startColor = copy4(color);
    this.endColor = copy4(color);
  }

  constructor(options: IEdgeInstanceOptions) {
    super(options);
    makeObservable(this, EdgeInstance);
    this.startColor = options.startColor || this.startColor;
    this.endColor = options.endColor || this.endColor;
    this.control = options.control || this.control;
    this.depth = options.depth || this.depth;
    this.end = options.end || this.end;
    this.thickness = options.thickness || this.thickness;
    this.start = options.start || this.start;
  }
}
