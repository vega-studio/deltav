import {
  IInstance3DOptions,
  Instance3D,
  observable,
  Vec3,
  Vec4
} from "../../../../src";

export interface IArmOptions extends IInstance3DOptions {
  color?: Vec4;
  radus?: number;
  length1?: number;
  length2?: number;
  quat1?: Vec4;
  quat2?: Vec4;
  origin?: Vec3;
}

export class ArmInstance extends Instance3D {
  @observable color: Vec4 = [1.0, 1.0, 0.0, 1.0];
  @observable radius: number = 0.5;
  @observable length1: number = 1;
  @observable length2: number = 1;

  @observable quat1: Vec4 = [1, 0, 0, 0];
  @observable quat2: Vec4 = [1, 0, 0, 0];

  @observable origin: Vec3 = [0, 0, 0];

  constructor(options: IArmOptions) {
    super(options);
    this.color = options.color || this.color;
    this.radius = options.radus || this.radius;
    this.length1 = options.length1 || this.length1;
    this.length2 = options.length2 || this.length2;
    this.quat1 = options.quat1 || this.quat1;
    this.quat2 = options.quat2 || this.quat2;
    this.origin = options.origin || this.origin;
  }
}
