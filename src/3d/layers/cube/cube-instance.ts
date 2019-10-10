import { observable } from '../../../instance-provider';
import { Color, Size } from '../../../types';
import { IInstance3DOptions, Instance3D } from '../base/instance-3d';

/** Customizes a new Cube instance */
export interface ICubeOptions extends IInstance3DOptions {
  /** Sets the dimensions of the cube */
  size?: Size;
  /** Sets the color of the cube */
  color?: Color;
}

/**
 * Represents a cube model within 3D space.
 */
export class CubeInstance extends Instance3D {
  /** Sets the dimensions of the cube */
  @observable size: Size = [1, 1, 1];
  /** Sets the color of the cube */
  @observable color: Color = [1, 1, 1, 1];

  constructor(options: ICubeOptions) {
    super(options);
    this.size = options.size || this.size;
    this.color = options.color || this.color;
  }
}
