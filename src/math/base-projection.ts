import { Bounds } from "../primitives";
import { uid } from "../util";
import { Vec2, Vec2Compat } from "./vector";

/**
 * This object expresses a suite of methods that aids in projecting values from screen to world and vice versa.
 * These methods can be implemented in many ways and should be customized to a view + camera configuration.
 */
export abstract class BaseProjection<T> {
  /** Provides a numerical UID for this object */
  get uid() {
    return this._uid;
  }
  private _uid: number = uid();
  /** Allows for a sensical identifier to be applied to this projection. */
  id: string = "";

  /** This is set to ensure the projections that happen properly translates the pixel ratio to normal Web coordinates */
  pixelRatio: number = 1;
  /** This is the rendering bounds within screen space */
  screenBounds: Bounds<T>;
  /**
   * The bounds of the render space on the canvas this view will render on. This is the size of the render space within
   * the context so this will include the pixelRatio as needed.
   */
  viewBounds: Bounds<T>;

  screenToPixelSpace(point: Vec2, out?: Vec2) {
    const p = out || [0, 0];

    p[0] = point[0] * this.pixelRatio;
    p[1] = point[1] * this.pixelRatio;

    return p;
  }

  pixelSpaceToScreen(point: Vec2, out?: Vec2) {
    const p = out || [0, 0];

    p[0] = point[0] / this.pixelRatio;
    p[1] = point[1] / this.pixelRatio;

    return p;
  }

  /**
   * Takes a coordinate in screen coordinates and maps it to a point that is relative to a view's viewport on
   * the screen.
   */
  screenToView(point: Vec2, out?: Vec2) {
    const p = out || [0, 0];

    p[0] = point[0] - this.screenBounds.x;
    p[1] = point[1] - this.screenBounds.y;

    return p;
  }

  /**
   * Takes a coordinate that is relative to a view's viewport within the screen and maps it to a coordinate relative to
   * the screen.
   */
  viewToScreen(point: Vec2, out?: Vec2) {
    const p: Vec2 = [0, 0];

    p[0] = point[0] + this.screenBounds.x;
    p[1] = point[1] + this.screenBounds.y;

    return this.pixelSpaceToScreen(p, out);
  }

  /**
   * Maps a coordinate relative to the screen to a coordinate found within the world space.
   */
  abstract screenToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;

  /**
   * Maps a coordinate found within the world to a relative coordinate within the screen space.
   */
  abstract worldToScreen(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;

  /**
   * Maps a coordinate relative to the view's viewport to a coordinate found within the world.
   */
  abstract viewToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;

  /**
   * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
   */
  abstract worldToView(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
}
