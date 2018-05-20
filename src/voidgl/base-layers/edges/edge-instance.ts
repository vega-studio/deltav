import { observable } from '../../instance-provider';
import { IInstanceOptions, Instance } from '../../util/instance';

export interface IEdgeInstanceOptions extends IInstanceOptions {
  /** The color of this edge at the start point. */
  colorStart?: [number, number, number, number];
  /** The color of this edge at the end point. */
  colorEnd?: [number, number, number, number];
  /** This is the list of control points  */
  control?: [number, number][];
  /** The z depth of the edge (for draw ordering) */
  depth?: number;
  /** End point of the edge. */
  end: [number, number];
  /** Beginning point of the edge. */
  start: [number, number];
  /** Start width of the edge. */
  widthStart?: number;
  /** End width of the edge */
  widthEnd?: number;
}

export type EdgeColor = [number, number, number, number];

export class EdgeInstance extends Instance {
  @observable colorStart: EdgeColor = [1.0, 1.0, 1.0, 1.0];
  @observable colorEnd: EdgeColor = [1.0, 1.0, 1.0, 1.0];
  @observable control: [number, number][] = [[0, 0], [0, 0]];
  @observable depth: number = 0;
  @observable end: [number, number] = [0, 0];
  @observable start: [number, number] = [0, 0];
  @observable widthStart: number = 1.0;
  @observable widthEnd: number = 1.0;

  get length() {
    const delta = [
      this.end[0] - this.start[0],
      this.end[1] - this.start[1],
    ];

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
  get perpendicular(): [number, number] {
    const length = this.length;

    return [
      (this.end[1] - this.start[1]) / length,
      -(this.end[0] - this.start[0]) / length,
    ];
  }

  /**
   * Applies the edge width to the start and end
   */
  setEdgeWidth(width: number) {
    if (width) {
      this.widthEnd = width;
      this.widthStart = width;
    }
  }

  /**
   * Applies the color to the start and end
   */
  setColor(color: EdgeColor) {
    this.colorStart = color;
    this.colorEnd = color;
  }

  constructor(options: IEdgeInstanceOptions) {
    super(options);
    this.colorStart = options.colorStart || this.colorStart;
    this.colorEnd = options.colorEnd || this.colorEnd;
    this.control = options.control || this.control;
    this.depth = options.depth || this.depth;
    this.end = options.end || this.end;
    this.widthStart = options.widthStart || this.widthStart;
    this.widthEnd = options.widthEnd || this.widthEnd;
    this.start = options.start || this.start;
  }
}
