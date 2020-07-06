import { BaseProjection, Ray, Vec2 } from "../../math";
import { Camera2D } from "./camera-2d";
export declare class Projection2D extends BaseProjection<any> {
    camera: Camera2D;
    /**
     * Maps a coordinate relative to the screen to a coordinate found within the world space.
     */
    screenToWorld(point: Vec2, out?: Vec2): Vec2;
    /**
     * Makes a ray from the provided point that emanates into 3D space straight
     * into the screen. Since our spaces have 3D tendencies, this can have some
     * useful applications for interacting with the 2D elements in interesting and
     * new ways.
     */
    screenRay(point: Vec2): Ray;
    /**
     * Maps a coordinate found within the world to a relative coordinate within the screen space.
     */
    worldToScreen(point: Vec2, out?: Vec2): Vec2;
    /**
     * Maps a coordinate relative to the view's viewport to a coordinate found within the world.
     */
    viewToWorld(point: Vec2, out?: Vec2): Vec2;
    /**
     * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
     */
    worldToView(point: Vec2, out?: Vec2): Vec2;
}
