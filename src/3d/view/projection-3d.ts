import {
  Mat4x4,
  multiply4x4,
  project3As4ToScreen,
  toString4x4,
  transform3as4,
  transform4
} from "../../math";
import { BaseProjection } from "../../math/base-projection";
import {
  add3,
  add4,
  apply2,
  apply3,
  divide2,
  normalize3,
  scale2,
  Vec2,
  Vec3,
  vec4
} from "../../math/vector";
import { Camera, CameraProjectionType } from "../../util/camera";

export class Projection3D extends BaseProjection<any> {
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
  screenToWorld(point: Vec2, out?: Vec3): Vec3 {
    out = out || [0, 0, 0];
    // Make sure the point is relative to the view then use the view to world projection
    this.viewToWorld(this.screenToView(point), out);

    return out;
  }

  /**
   * Maps a coordinate found within the world to a relative coordinate within the screen space.
   */
  worldToScreen(point: Vec3, out?: Vec2) {
    out = out || [0, 0];

    const viewProjection: Mat4x4 = multiply4x4(
      this.camera.projection,
      this.camera.view
    );

    const screen = project3As4ToScreen(
      viewProjection,
      point,
      this.viewBounds.width,
      this.viewBounds.height
    );

    return apply2(
      out,
      screen[0] / this.pixelRatio,
      screen[1] / this.pixelRatio
    );
  }

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
  viewToWorld(point: Vec2, out?: Vec3) {
    out = out || [0, 0, 0];
    const { width, height } = this.viewBounds;
    const { projectionOptions } = this.camera;
    const renderSpace = scale2(point, this.pixelRatio);
    const { tan } = Math;
    console.log("PROJECTING", point, renderSpace, width, height);

    // We here analyze the point specified and calculate a ray that would project out into the world such that it
    // eminates where the ray would appear as a dot flying away from the screen.
    if (projectionOptions.type === CameraProjectionType.PERSPECTIVE) {
      const { fov, near } = projectionOptions;
      let Px, Py;

      const aspect = height / width;
      const r = tan(fov / 2) * near;

      // We assume z = 1 and algebraically reverse the projection operation to solve for the vector input instead of the
      // screen.
      Px = (2 * ((renderSpace[0] + 0.5) / width) - 1) * r;
      Py = (1 - 2 * ((renderSpace[1] + 0.5) / height)) * r * aspect;

      const rayReference: Vec3 = [Px, Py, -1];
      console.log("RAY REF", rayReference);
      console.log("POSITION", this.camera.transform.position);
      console.log("TRANSFORM", toString4x4(this.camera.transform.matrix));
      const world = transform4(
        this.camera.transform.matrix,
        vec4(rayReference, 0)
      );
      console.log("ROTATED", world);
      add3(this.camera.position, world, world);

      apply3(out, world[0], world[1], world[2]);
    } else {
      console.warn(
        "Projections with orthographic cameras and 3D contexts are not working yet"
      );
    }

    console.log("RESULT", out);
    return out;
  }

  /**
   * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
   */
  worldToView(point: Vec3, out?: Vec2) {
    out = out || [0, 0];

    const viewProjection: Mat4x4 = multiply4x4(
      this.camera.projection,
      this.camera.view
    );

    const screen = project3As4ToScreen(
      viewProjection,
      point,
      this.viewBounds.width,
      this.viewBounds.height
    );

    return apply2(
      out,
      screen[0] / this.pixelRatio,
      screen[1] / this.pixelRatio
    );
  }
}
