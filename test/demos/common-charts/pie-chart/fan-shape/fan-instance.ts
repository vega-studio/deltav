import { IInstanceOptions, Instance, observable, Vec2, Vec4 } from "src";

export interface IFanInstanceOptions extends IInstanceOptions {
  angle?: Vec2;
  center?: Vec2;
  color?: Vec4;
  depth?: number;
  edgeColor?: Vec4;
  radius?: number;
}

export class FanInstance extends Instance {
  @observable angle: Vec2 = [0, Math.PI];
  @observable center: Vec2 = [0, 0];
  @observable color: Vec4 = [1, 1, 1, 1];
  @observable depth: number = 0;
  @observable edgeColor: Vec4 = [1, 1, 1, 1];
  @observable radius: number = 1;

  constructor(options: IFanInstanceOptions) {
    super(options);

    this.angle = options.angle || this.angle;
    this.color = options.color || this.color;
    this.edgeColor = options.edgeColor || this.edgeColor;
    this.center = options.center || this.center;
    this.depth = options.depth || this.depth;
    this.radius = options.radius || this.radius;
  }
}
