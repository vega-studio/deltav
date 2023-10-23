import {
  Color,
  IInstance3DOptions,
  Instance3D,
  makeObservable,
  observable,
  Size
} from "../../../../../src";

/** Customizes a new Cube instance */
export interface ICubeOptions extends IInstance3DOptions {
  /** Sets the dimensions of the cube */
  size?: Size;
  /** Sets the color of the cube */
  color?: Color;
  /** Sets the color of the cube */
  frontColor?: Color;
}

/**
 * Represents a cube model within 3D space.
 */
export class CubeInstance extends Instance3D {
  /** Sets the dimensions of the cube */
  @observable size: Size = [1, 1, 1];
  /** Sets the color of the cube */
  @observable color: Color = [1, 0, 0, 1];
  /** Color of the front face [0, 0, -1] face */
  @observable frontColor: Color = [0, 0, 1, 1];

  constructor(options: ICubeOptions) {
    super(options);
    makeObservable(this, CubeInstance);
    this.size = options.size || this.size;
    this.color = options.color || this.color;
    this.frontColor = options.frontColor || this.frontColor;
  }
}
