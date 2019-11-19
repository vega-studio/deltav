import {
  IInstanceOptions,
  Instance,
  observable
} from "../../../../src/instance-provider";
import { Vec3, Vec4 } from "../../../../src/math";

export interface IBlockInstanceOptions extends IInstanceOptions {
  startValue?: Vec3;
  endValue?: Vec3;
  color?: Vec4;
  baseY?: number;
  baseZ: number;
  normal1?: Vec3;
  normal2?: Vec3;
  normal3?: Vec3;
}
export class BlockInstance extends Instance {
  /** The beginning value of this block [time, height, width] */
  @observable startValue: Vec3 = [0, 0, 0];
  /** The end value of this block [time, height, width] */
  @observable endValue: Vec3 = [0, 0, 0];
  /** This is the color of the block */
  @observable color: Vec4 = [252 / 255, 187 / 255, 3 / 255, 1.0];
  /** This is the bottom line's y position */
  @observable baseY: number = 0;

  @observable baseZ: number = 0;

  @observable normal1: Vec3 = [0.0, 0.0, -1.0];
  @observable normal2: Vec3 = [0.0, 1.0, 0.0];
  @observable normal3: Vec3 = [0.0, 0.0, 1.0];

  constructor(options: IBlockInstanceOptions) {
    super(options);

    this.startValue = options.startValue || this.startValue;
    this.endValue = options.endValue || this.endValue;
    this.color = options.color || this.color;
    this.baseY = options.baseY || this.baseY;
    this.baseZ = options.baseZ || this.baseZ;
    this.normal1 = options.normal1 || this.normal1;
    this.normal2 = options.normal2 || this.normal2;
    this.normal3 = options.normal3 || this.normal3;
  }
}
