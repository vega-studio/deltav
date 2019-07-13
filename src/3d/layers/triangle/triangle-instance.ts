import { observable } from "../../../instance-provider";
import { Color } from "../../../types";
import { IInstance3DOptions, Instance3D } from "../base/instance-3d";

/** Customizes a new Triangle instance */
export interface ITriangleOptions extends IInstance3DOptions {
  /** Sets the color of the Triangle */
  color?: Color;
  /** Scales the triangle */
  scale?: number;
}

/**
 * Represents a Triangle model within 3D space.
 */
export class TriangleInstance extends Instance3D {
  /** Sets the color of the Triangle */
  @observable color: Color = [1, 1, 1, 1];
  /** Scales the  */
  @observable scale: number = 1;

  constructor(options: ITriangleOptions) {
    super(options);
    this.color = options.color || this.color;
    this.scale = options.scale || this.scale;
  }
}
