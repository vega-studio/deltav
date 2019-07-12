import { Instance, observable } from "../../instance-provider";
import { Transform } from "../scene-graph";

export class Instance3d extends Instance {
  transform: Transform;

  @observable
  get translation() {
    return this.transform;
  }
}
