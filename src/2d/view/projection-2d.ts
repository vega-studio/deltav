import { BaseProjection, Vec2 } from "../../math";
import { Camera2D } from "./camera-2d";

export class Projection2D extends BaseProjection<any> {
  camera: Camera2D;

  /**
   * Maps a coordinate relative to the screen to a coordinate found within the world space.
   */
  screenToWorld(point: Vec2, out?: Vec2) {
    const view = this.screenToView(point);

    const world = out || [0, 0];
    world[0] =
      (view[0] - this.camera.control2D.offset[0] * this.camera.scale2D[0]) /
      this.camera.scale2D[0];
    world[1] =
      (view[1] - this.camera.control2D.offset[1] * this.camera.scale2D[1]) /
      this.camera.scale2D[1];

    return world;
  }

  /**
   * Maps a coordinate found within the world to a relative coordinate within the screen space.
   */
  worldToScreen(point: Vec2, out?: Vec2) {
    const screen: Vec2 = [0, 0];

    // Calculate from the camera to view space
    screen[0] =
      (point[0] * this.camera.scale2D[0] +
        this.camera.control2D.offset[0] * this.camera.scale2D[0]) *
      this.pixelRatio;
    screen[1] =
      (point[1] * this.camera.scale2D[1] +
        this.camera.control2D.offset[1] * this.camera.scale2D[1]) *
      this.pixelRatio;

    // Convert from view to screen space
    return this.viewToScreen(screen, out);
  }

  /**
   * Maps a coordinate relative to the view's viewport to a coordinate found within the world.
   */
  viewToWorld(point: Vec2, out?: Vec2) {
    const world = out || [0, 0];

    const screen = point;
    world[0] =
      (screen[0] - this.camera.control2D.offset[0] * this.camera.scale2D[0]) /
      this.camera.scale2D[0];
    world[1] =
      (screen[1] - this.camera.control2D.offset[1] * this.camera.scale2D[1]) /
      this.camera.scale2D[1];

    return world;
  }

  /**
   * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
   */
  worldToView(point: Vec2, out?: Vec2) {
    const screen = out || [0, 0];

    // Calculate from the camera to view space
    screen[0] =
      point[0] * this.camera.scale2D[0] +
      this.camera.control2D.offset[0] * this.camera.scale2D[0];
    screen[1] =
      point[1] * this.camera.scale2D[1] +
      this.camera.control2D.offset[1] * this.camera.scale2D[1];

    return screen;
  }
}
