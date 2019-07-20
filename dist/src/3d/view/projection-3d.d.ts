import { BaseProjection } from "../../math/base-projection";
import { Vec2, Vec3 } from "../../math/vector";
import { Camera } from "../../util/camera";
export declare class Projection3D extends BaseProjection<any> {
    camera: Camera;
    screenToWorld(point: Vec2, out?: Vec3): Vec3;
    worldToScreen(point: Vec3, out?: Vec2): [number, number];
    viewToWorld(point: Vec2, out?: Vec3): [number, number, number];
    worldToView(point: Vec3, out?: Vec2): [number, number];
}
