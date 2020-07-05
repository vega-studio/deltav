import {
  IInstance3DOptions,
  Instance,
  observable,
  Vec2
} from "../../../../src";

/** Customizes a new Cube instance */
export interface ICubeOptions extends IInstance3DOptions {
  size: Vec2;
  resource: string;
  position: Vec2;
}

/**
 * Represents a cube model within 3D space.
 */
export class RenderImageInstance extends Instance {
  /** Sets the dimensions of the image */
  @observable size: Vec2 = [1, 1];
  /** Color of the front face [0, 0, -1] face */
  @observable resource: string = "";
  @observable position: Vec2 = [0, 0];

  constructor(options: ICubeOptions) {
    super(options);
    this.size = options.size || this.size;
  }
}
