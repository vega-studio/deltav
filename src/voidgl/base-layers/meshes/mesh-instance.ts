import { observable } from "../../instance-provider";
import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Mat4x4, Vec4 } from "../../util";

export interface IMeshInstanceOptions extends IInstanceOptions {
  color: Vec4;
  depth: number;
}

export class MeshInstance extends Instance {
  @observable color: Vec4 = [0, 0, 0, 1];
  @observable depth: number = 0.1;
  eye: Vec4 = [0, 0, 0, 1];
  position: Vec4 = [0, 0, 0, 1];
  scale: Vec4 = [1, 1, 1, 1];
  quaternion: Vec4 = [0, 0, 0, 1];
  transform: Mat4x4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  constructor(options: IMeshInstanceOptions) {
    super(options);
    this.color = options.color || this.color;
    this.depth = options.depth || this.depth;
  }
}
