import { IInstanceOptions, Instance, observable, Vec2, Vec3, Vec4 } from "src";

export interface IPlateEndOptions extends IInstanceOptions {
  width?: number;
  height?: number;
  normal?: Vec3;
  base?: Vec2;
  barCenter?: Vec2;
  color?: Vec4;
}

export class PlateEndInstance extends Instance {
  @observable width: number = 0;
  @observable height: number = 0;
  @observable base: Vec2 = [0, 0]; // X, Z
  @observable barCenter: Vec2 = [0, 0]; // X, Y
  @observable normal: Vec3 = [1, 0, 0];
  @observable color: Vec4 = [1, 1, 1, 1];

  constructor(options: IPlateEndOptions) {
    super(options);
    this.width = options.width || this.width;
    this.height = options.height || this.height;
    this.normal = options.normal || this.normal;
    this.base = options.base || this.base;
    this.color = options.color || this.color;
    this.barCenter = options.barCenter || this.barCenter;
  }
}
