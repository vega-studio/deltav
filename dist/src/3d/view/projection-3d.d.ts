import { BaseProjection } from "../../math/base-projection";
import { Vec2, Vec3 } from "../../math/vector";
import { Camera } from "../../util/camera";
export declare class Projection3D extends BaseProjection<any> {
    /** Camera used for the 3d view. */
    camera: Camera;
    /**
     * Maps a coordinate relative to the screen to the pixel's location within the 3D world. Remember that a camera with
     * a view creates a frustum to work within the 3D world. This frustum has a near clipping plane and a far clipping
     * plane.
     *
     * This method provides a point located in front of the camera that would be located on a ray eminating from the
     * camera to the world.
     *
     * To make a ray from this point simply: rayFromPoints(camera.position, screenToWorld([x, y]))
     */
    screenToWorld(point: Vec2, out?: Vec3): Vec3;
    /**
     * Maps a coordinate found within the world to a relative coordinate within the screen space.
     */
    worldToScreen(point: Vec3, out?: Vec2): [number, number];
    /**
     * Maps a coordinate relative to the view to the pixel's location within the 3D world. Remember that a camera with
     * a view creates a frustum to work within the 3D world. This frustum has a near clipping plane and a far clipping
     * plane.
     *
     * This method provides a point located in front of the camera that would be located on a ray eminating from the
     * camera to the world.
     *
     * To make a ray from this point simply: const ray = rayFromPoints(camera.position, screenToWorld([x, y]))
     * To get a point located a distance from the camera: rayToLocation(ray, distance);
     */
    viewToWorld(point: Vec2, out?: Vec3): [number, number, number];
    /**
     * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
     */
    worldToView(point: Vec3, out?: Vec2): [number, number];
}
