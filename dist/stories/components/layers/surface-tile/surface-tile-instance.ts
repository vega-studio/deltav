import {
  Color,
  IInstanceOptions,
  Instance,
  makeObservable,
  observable,
  Vec3,
  Vec4,
} from "../../../../src";

export interface ISurfaceTileInstance extends IInstanceOptions {
  corners: [Vec3, Vec3, Vec3, Vec3];
  color?: Vec4;
}

/**
 * Makes a surface piece that fits 4 points in 3D space
 */
export class SurfaceTileInstance extends Instance {
  @observable c1: Vec3;
  @observable c2: Vec3;
  @observable c3: Vec3;
  @observable c4: Vec3;
  @observable color: Color = [1, 1, 0, 1];

  constructor(options: ISurfaceTileInstance) {
    super(options);
    makeObservable(this, SurfaceTileInstance);
    this.c1 = options.corners[0];
    this.c2 = options.corners[1];
    this.c3 = options.corners[2];
    this.c4 = options.corners[3];
    this.color = options.color || this.color;
  }
}
