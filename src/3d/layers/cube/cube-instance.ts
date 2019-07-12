import { IInstanceOptions, Instance, observable } from "../../../instance-provider";
import { Color, Size } from "../../../types";
import { Transform } from "../../scene-graph";

/** Customizes a new Cube instance */
export interface ICubeOptions extends IInstanceOptions {

}

/**
 * Represents a cube model within 3D space.
 */
export class CubeInstance extends Instance {
  /** Sets the expected transformation of the cube */
  @observable transform: Transform;
  /** Sets the dimensions of the cube */
  @observable size: Size = [1, 1, 1];
  /** Sets the color of the cube */
  @observable color: Color = [1, 1, 1, 1];

  constructor(options: ICubeOptions) {
    super(options);
  }
}
