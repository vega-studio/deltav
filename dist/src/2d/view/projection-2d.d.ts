import { BaseProjection, Vec2 } from "../../math";
import { Camera2D } from "./camera-2d";
export declare class Projection2D extends BaseProjection<any> {
    camera: Camera2D;
    screenToWorld(point: Vec2, out?: Vec2): [number, number];
    worldToScreen(point: Vec2, out?: Vec2): [number, number];
    viewToWorld(point: Vec2, out?: Vec2): [number, number];
    worldToView(point: Vec2, out?: Vec2): [number, number];
}
