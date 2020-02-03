import { Vec2 } from "../math";
import { Geometry } from "./geometry";
import { GLSettings } from "./gl-settings";
import { Material } from "./material";
/**
 * This represents a Geometry with a Material as a paired configuration to be rendered
 * within a scene.
 */
export declare class Model {
    /** Specifies how the system will utilize the geometry applied */
    drawMode: GLSettings.Model.DrawMode;
    /** Specifies the vertices to render within the Model */
    vertexDrawRange?: Vec2;
    /** This specifies how many instances to draw of this model */
    drawInstances: number;
    /** The vertex information of the Model */
    geometry: Geometry;
    /** The material associated with the model */
    material: Material;
    /** Specifies the number of vertices available to the underlying geometry */
    vertexCount: number;
    constructor(geometry: Geometry, material: Material);
}
