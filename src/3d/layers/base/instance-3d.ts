import {
  IInstanceOptions,
  Instance,
  observable
} from "../../../instance-provider";
import { Transform } from "../../scene-graph";

export interface IInstance3DOptions extends IInstanceOptions {
  /** The transform object that will manage this instance */
  transform: Transform;
}

/**
 * Basic properties of an instance that exists within a 3D world.
 */
export class Instance3D extends Instance {
  /** This is the 3D transform that will place this object within the 3D world. */
  @observable transform: Transform;

  constructor(options: IInstance3DOptions) {
    super(options);
    this.transform = options.transform;
  }
}
