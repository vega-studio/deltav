import { Ray } from "../../math";
import { BaseProjection } from "../../math/base-projection.js";
import { Vec2, Vec3 } from "../../math/vector.js";
import { Camera } from "../../util/camera.js";
export declare class Projection3D extends BaseProjection<any> {
    /** Camera used for the 3d view. */
    camera: Camera;
    /**
     * Maps a coordinate relative to the screen to the pixel's location within the 3D world. Remember that a camera with
     * a view creates a frustum to work within the 3D world. This frustum has a near clipping plane and a far clipping
     * plane.
     *
     * This method provides a point located in front of the camera that would be located on a ray eminating from the
     * camera to the world. See screenRay
     *
     * For a perspective camera:
     * - To make a ray from this point simply:
     *
     * `const ray = rayFromPoints(camera.position, screenToWorld([x, y]))`
     *
     * For an orthographic camera:
     * - To make a ray from this point:
     *
     * `const ray = ray(screenToWorld([x, y]), camera.forward)`
     */
    screenToWorld(point: Vec2, out?: Vec3): Vec3;
    /**
     * Generates a ray from screen coordinates that emanates out into the 3D world
     * space.
     */
    screenRay(point: Vec2): Ray;
    /**
     * Maps a coordinate found within the world to a relative coordinate within the screen space.
     */
    worldToScreen(point: Vec3, out?: Vec2): Vec2;
    /**
     * Maps a coordinate relative to the view to the pixel's location within the
     * 3D world. Remember that a camera with a view creates a frustum to work
     * within the 3D world. This frustum has a near clipping plane and a far
     * clipping plane.
     *
     * This method provides a point located in front of the camera that would be
     * located on a ray eminating from the camera to the world in such a way, that
     * the ray traveling to infinity would appear, from the screen's perspective,
     * to stay on the same pixel.
     *
     * See screenRay
     *
     * For a perspective camera:
     * - To make a ray from this point simply:
     *
     * `const ray = rayFromPoints(camera.position, screenToWorld([x, y]))`
     *
     * For an orthographic camera:
     * - To make a ray from this point:
     *
     * `const ray = ray(screenToWorld([x, y]), camera.forward)`
     */
    viewToWorld(point: Vec2, out?: Vec3): Vec3;
    /**
     * Maps a coordinate found within the world to a relative coordinate within
     * the view's viewport.
     */
    worldToView(point: Vec3, out?: Vec2): Vec2;
}
