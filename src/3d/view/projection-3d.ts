import { BaseProjection } from "../../math/base-projection";
import { normalize3, Vec2, Vec3 } from "../../math/vector";
import { Camera, CameraProjectionType } from "../../util/camera";

export class Projection3D extends BaseProjection<any> {
  /** Camera used for the 3d view. */
  camera: Camera;

  /**
   * Maps a coordinate relative to the screen to the pixel's location within the 3D world. Remember that a camera with
   * a view creates a frustum to work within the 3D world. This frustum has a near clipping plane and a far clipping
   * plane. This method essentially provides the coordinate that the pixel represents on the near clipping plane within
   * the 3D world.
   */
  screenToWorld(point: Vec2, out?: Vec3): Vec3 {
    out = out || [0, 0, 0];
    // Make sure the point is relative to the view
    this.screenToView(point, point);
    const { width, height } = this.viewBounds;
    const { projectionOptions } = this.camera;

    // We here analyze the point specified and calculate a ray that would project out into the world such that it
    // eminates where the ray would appear as a dot flying away from the screen.
    if (projectionOptions.type === CameraProjectionType.PERSPECTIVE) {
      const { fov } = projectionOptions;
      let Px, Py;

      if (width > height) {
        const imageAspectRatio = width / height;
        Px =
          (2 * ((point[0] + 0.5) / width) - 1) *
          Math.tan(fov / 2 * Math.PI / 180) *
          imageAspectRatio;
        Py =
          1 -
          2 * ((point[1] + 0.5) / height) * Math.tan(fov / 2 * Math.PI / 180);
      } else {
        const imageAspectRatio = height / width;
        Px =
          (2 * ((point[0] + 0.5) / width) - 1) *
          Math.tan(fov / 2 * Math.PI / 180);
        Py =
          (1 -
            2 *
              ((point[1] + 0.5) / height) *
              Math.tan(fov / 2 * Math.PI / 180)) *
          imageAspectRatio;
      }

      const rayReference: Vec3 = [Px, Py, -1];

      out[0] = rayReference[0];
      out[1] = rayReference[1];

      // TODO: Now we need to have a matrix that will transform this rayDirection to world space (model transform of
      // the camera, then world projection)
    }

    return out;
  }

  /**
   * Maps a coordinate relative to the screen to a 'camera ray direction vector'. A camera ray is a ray that extends
   * from the camera's position through the near plane that goes in the viewing direction away from the camera.
   * This means you get a vector direction that if drawn as a line (camera position + vector direction) would appear as
   * a dot on the screen at the given pixel selected.
   *
   * This can be used to aid in picking 3D objects via the camera or perform ray tracing algorithms.
   */
  screenToWorldDirection(point: Vec2, out?: Vec3): Vec3 {
    out = out || [0, 0, 0];
    // Make sure the point is relative to the view
    this.screenToView(point, point);
    const { width, height } = this.viewBounds;
    const { projectionOptions } = this.camera;

    // We here analyze the point specified and calculate a ray that would project out into the world such that it
    // eminates where the ray would appear as a dot flying away from the screen.
    if (projectionOptions.type === CameraProjectionType.PERSPECTIVE) {
      const { fov } = projectionOptions;
      let Px, Py;

      if (width > height) {
        const imageAspectRatio = width / height;
        Px =
          (2 * ((point[0] + 0.5) / width) - 1) *
          Math.tan(fov / 2 * Math.PI / 180) *
          imageAspectRatio;
        Py =
          1 -
          2 * ((point[1] + 0.5) / height) * Math.tan(fov / 2 * Math.PI / 180);
      } else {
        const imageAspectRatio = height / width;
        Px =
          (2 * ((point[0] + 0.5) / width) - 1) *
          Math.tan(fov / 2 * Math.PI / 180);
        Py =
          (1 -
            2 *
              ((point[1] + 0.5) / height) *
              Math.tan(fov / 2 * Math.PI / 180)) *
          imageAspectRatio;
      }

      let rayDirection: Vec3 = [Px, Py, -1];
      rayDirection = normalize3(rayDirection);

      // TODO: Now we need to have a matrix that will transform this rayDirection to world space (model transform of
      // the camera, then world projection)
    }

    return out;
  }

  /**
   * Maps a coordinate found within the world to a relative coordinate within the screen space.
   */
  worldToScreen(_point: Vec3, _out?: Vec2) {
    // const viewProjectionMatrix: Mat4x4 = multiply4x4(this.camera.projection, this.camera.view);
    // // Transform world to clipping coordinates
    // point3D = viewProjectionMatrix.multiply(point3D);
    // int; winX = (int); Math.round((( point3D.getX() + 1 ) / 2.0) *
    //                               width );
    // //we calculate -point3D.getY() because the screen Y axis is
    // //oriented top->down
    // int; winY = (int); Math.round((( 1 - point3D.getY() ) / 2.0) *
    //                               height );
    // return new Point2D(winX, winY);

    return [0, 0] as Vec2;
  }

  /**
   * Maps a coordinate relative to the view's viewport to a coordinate found within the world.
   */
  viewToWorld(_point: Vec2, _out?: Vec2) {
    return [0, 0] as Vec2;
  }

  /**
   * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
   */
  worldToView(_point: Vec2, out?: Vec2) {
    const screen = out || [0, 0];

    // Calculate from the camera to view space
    // screen[0] =
    //   point[0] * this.camera.scale2D[0] +
    //   this.camera.control2D.offset[0] * this.camera.scale2D[0];
    // screen[1] =
    //   point[1] * this.camera.scale2D[1] +
    //   this.camera.control2D.offset[1] * this.camera.scale2D[1];

    return screen;
  }
}
