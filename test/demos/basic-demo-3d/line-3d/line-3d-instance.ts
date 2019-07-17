import { Instance, observable, Vec3, Vec4 } from "../../../../src";

export class Line3DInstance extends Instance {
  @observable start: Vec3;
  @observable end: Vec3;
  @observable colorStart: Vec4;
  @observable colorEnd: Vec4;
}
