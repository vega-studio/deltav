import { Geometry } from "./geometry";
import { Material } from "./material";

/**
 * This represents a Geometry with a Material as a paired configuration to be rendered
 * within a scene.
 */
export class Model {
  /** The vertex information of the Model */
  geometry: Geometry;
  /** The material associated with the model */
  material: Material;

  constructor(geometry: Geometry, material: Material) {
    this.geometry = geometry;
    this.material = material;
  }
}
