import { makeObservable, observable } from "../../../instance-provider";
import { Color } from "../../../types.js";
import {
  IInstance3DOptions,
  Instance3D,
} from "../../scene-graph/instance-3d.js";

/** Customizes a new Triangle instance */
export interface ITriangleOptions extends IInstance3DOptions {
  /** Sets the color of the Triangle */
  color?: Color;
  /** Sizes the triangle */
  size?: number;
}

/**
 * Represents a Triangle model within 3D space.
 */
export class TriangleInstance extends Instance3D {
  /** Sets the color of the Triangle */
  @observable color: Color = [1, 1, 1, 1];
  /** Sizes the triangle */
  @observable size = 1;

  constructor(options: ITriangleOptions) {
    super(options);
    makeObservable(this, TriangleInstance);
    this.color = options.color || this.color;
    this.size = options.size || this.size;
  }
}
