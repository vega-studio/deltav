import {
  IInstanceOptions,
  Instance,
  observable,
  Vec3,
  Vec4,
} from '../../../../src';

export interface ILine3DInstanceOptions extends IInstanceOptions {
  start: Vec3;
  end: Vec3;
  colorStart: Vec4;
  colorEnd: Vec4;
}

export class Line3DInstance extends Instance {
  @observable start: Vec3;
  @observable end: Vec3;
  @observable colorStart: Vec4;
  @observable colorEnd: Vec4;

  constructor(options: ILine3DInstanceOptions) {
    super(options);
    this.start = options.start;
    this.end = options.end;
    this.colorStart = options.colorStart;
    this.colorEnd = options.colorEnd;
  }
}
