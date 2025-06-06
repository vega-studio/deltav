import { makeObservable, observable } from "../../../instance-provider";
import { Color, Size } from "../../../types.js";
import {
  IInstance3DOptions,
  Instance3D,
} from "../../scene-graph/instance-3d.js";

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
  /** Dimensions of the cube */
  @observable size: Size = [1, 1, 1];
  /** Color of the cube */
  @observable color: Color = [1, 1, 1, 1];

  constructor(options: ICubeOptions) {
    super(options);
    makeObservable(this, CubeInstance);
    this.size = options.size || this.size;
    this.color = options.color || this.color;
  }
}
