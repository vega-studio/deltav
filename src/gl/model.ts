import { Vec2 } from "../util";
import { Geometry } from "./geometry";
import { GLSettings } from "./gl-settings";
import { Material } from "./material";

/**
 * This represents a Geometry with a Material as a paired configuration to be rendered
 * within a scene.
 */
export class Model {
  /** Specifies how the system will utilize the geometry applied */
  drawMode: GLSettings.Model.DrawMode = GLSettings.Model.DrawMode.TRIANGLES;
  /** Specifies the vertices to render within the Model */
  drawRange?: Vec2 = [-1, -1];
  /** The vertex information of the Model */
  geometry: Geometry;
  /** The material associated with the model */
  material: Material;
  /** Specifies the number of vertices available to the underlying geometry */
  vertexCount: number = 0;

  constructor(geometry: Geometry, material: Material) {
    this.geometry = geometry;
    this.material = material;
  }
}
