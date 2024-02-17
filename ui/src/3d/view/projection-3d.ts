import {
  apply2,
  apply3,
  scale2,
  subtract2,
  Vec2,
  Vec3,
  vec3,
  vec4,
} from "../../math/vector";
import { BaseProjection } from "../../math/base-projection";
import { Camera, CameraProjectionType } from "../../util/camera";
import {
  Mat4x4,
  multiply4x4,
  project3As4ToScreen,
  ray,
  Ray,
  rayFromPoints,
  transform4,
} from "../../math";

export class Projection3D extends BaseProjection<any> {
  /** Camera used for the 3d view. */
  camera!: Camera;

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
  screenToWorld(point: Vec2, out?: Vec3): Vec3 {
    out = out || [0, 0, 0];
    // Make sure the point is relative to the view then use the view to world projection
    this.viewToWorld(this.screenToView(point), out);

    return out;
  }

  /**
   * Generates a ray from screen coordinates that emanates out into the 3D world
   * space.
   */
  screenRay(point: Vec2): Ray {
    if (this.camera.projectionType === CameraProjectionType.ORTHOGRAPHIC) {
      const world: Vec3 = vec3(this.screenToWorld(point));

      return ray(world, this.camera.transform.forward);
    } else {
      const world: Vec3 = vec3(this.screenToWorld(point));

      return rayFromPoints(vec3(this.camera.transform.position), world);
    }
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
  viewToWorld(point: Vec2, out?: Vec3) {
    out = out || [0, 0, 0];
    const { width, height } = this.viewBounds;
    const { projectionOptions } = this.camera;
    const renderSpace = scale2(point, this.pixelRatio);
    const { tan } = Math;

    // We here analyze the point specified and calculate a ray that would
    // project out into the world such that it eminates where the ray would
    // appear as a dot flying away from the screen.
    if (projectionOptions.type === CameraProjectionType.PERSPECTIVE) {
      const { fov, near } = projectionOptions;

      const aspect = height / width;
      const r = tan(fov / 2) * near;

      // We assume z = 1 and algebraically reverse the projection operation to
      // solve for the vector input instead of the screen.
      const Px = (2 * ((renderSpace[0] + 0.5) / width) - 1) * r;
      const Py = (1 - 2 * ((renderSpace[1] + 0.5) / height)) * r * aspect;

      const rayReference: Vec3 = [Px, Py, -1];
      const world = transform4(
        this.camera.transform.matrix,
        vec4(rayReference, 1)
      );
      apply3(out, world[0], world[1], world[2]);
    } else {
      const middleToPoint = subtract2(renderSpace, [width / 2, height / 2]);
      const world = transform4(
        this.camera.transform.viewMatrix,
        vec4(middleToPoint, -projectionOptions.near)
      );
      apply3(out, world[0], -world[1], world[2]);
    }

    return out;
  }

  /**
   * Maps a coordinate found within the world to a relative coordinate within
   * the view's viewport.
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
