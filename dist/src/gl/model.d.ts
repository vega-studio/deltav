import { Vec2 } from "../math";
import { Geometry } from "./geometry";
import { GLSettings } from "./gl-settings";
import { Material } from "./material";
export declare class Model {
    drawMode: GLSettings.Model.DrawMode;
    vertexDrawRange?: Vec2;
    drawInstances: number;
    geometry: Geometry;
    material: Material;
    vertexCount: number;
    constructor(geometry: Geometry, material: Material);
}
