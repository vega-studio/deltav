import {
  Color,
  IInstance3DOptions,
  Instance3D,
  makeObservable,
  observable,
  Vec4,
} from "../../../../src";

export interface ISimpleMeshInstanceOptions extends IInstance3DOptions {
  color?: Vec4;
}

/**
 * Represents a simple mesh instance with custom vertices and normals
 */
export class SimpleMeshInstance extends Instance3D {
  @observable color: Color = [1, 1, 1, 1];

  constructor(options: ISimpleMeshInstanceOptions) {
    super(options);
    makeObservable(this, SimpleMeshInstance);
    this.color = options.color || this.color;
  }
}
