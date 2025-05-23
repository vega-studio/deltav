import { uid } from "../util/uid.js";
import { Bounds } from "./primitives/bounds.js";
import { Ray } from "./ray.js";
import { apply2, compare2, Vec2, Vec2Compat } from "./vector.js";

/**
 * This object expresses a suite of methods that aids in projecting values from
 * screen to world and vice versa. These methods can be implemented in many ways
 * and should be customized to a view + camera configuration.
 */
export abstract class BaseProjection<T> {
  /** Provides a numerical UID for this object */
  get uid() {
    return this._uid;
  }
  private _uid: number = uid();
  /** Allows for a sensical identifier to be applied to this projection. */
  id = "";

  /**
   * This is set to ensure the projections that happen properly translates the
   * pixel ratio to normal Web coordinates
   */
  pixelRatio = 1;
  /** This is the rendering bounds within screen space */
  get screenBounds(): Bounds<T> {
    if (!this._scaledScreenBounds) {
      this._scaledScreenBounds = new Bounds<T>({
        x: this._screenBounds.x * this._screenScale[0],
        y: this._screenBounds.y * this._screenScale[1],
        width: this._screenBounds.width * this._screenScale[0],
        height: this._screenBounds.height * this._screenScale[1],
      });
    }

    return this._scaledScreenBounds;
  }

  set screenBounds(val: Bounds<T>) {
    delete this._scaledScreenBounds;
    this._screenBounds = val;
  }

  /**
   * This helps resolve view's that don't correlate to the screen perfectly.
   * This would include times a view renders to a resource at a scaled valued
   * compared to the actual dimensions of the screen.
   */
  get screenScale(): Vec2 {
    return this._screenScale;
  }

  set screenScale(val: Vec2) {
    if (!compare2(val, this._screenScale)) {
      delete this._scaledScreenBounds;
      this._screenScale = val;
    }
  }
  /**
   * The bounds of the render space on the canvas this view will render on. This
   * is the size of the render space within the context so this will include the
   * pixelRatio as needed.
   */
  viewBounds!: Bounds<T>;

  private _screenScale: Vec2 = [1, 1];
  private _screenBounds!: Bounds<T>;
  private _scaledScreenBounds?: Bounds<T>;

  /**
   * This projects a point to be relative to the rendering dimensions of the
   * view.
   */
  screenToRenderSpace(point: Vec2, out?: Vec2) {
    out = this.screenToView(point, out);

    return apply2(out, point[0] * this.pixelRatio, point[1] * this.pixelRatio);
  }

  /**
   * This projects a point relative to the render space of the view to the
   * screen coordinates
   */
  renderSpaceToScreen(point: Vec2, out?: Vec2) {
    out = out || [0, 0];

    return apply2(
      out,
      point[0] / this.pixelRatio - this.screenBounds.x,
      point[1] / this.pixelRatio - this.screenBounds.y
    );
  }

  /**
   * Takes a coordinate in screen coordinates and maps it to a point that is
   * relative to a view's viewport on the screen.
   */
  screenToView(point: Vec2, out?: Vec2) {
    out = out || [0, 0];

    return apply2(
      out,
      point[0] - this.screenBounds.x,
      point[1] - this.screenBounds.y
    );
  }

  /**
   * Takes a coordinate that is relative to a view's viewport within the screen
   * and maps it to a coordinate relative to the screen.
   */
  viewToScreen(point: Vec2, out?: Vec2) {
    out = out || [0, 0];

    return apply2(
      out,
      point[0] + this.screenBounds.x,
      point[1] + this.screenBounds.y
    );
  }

  /**
   * Maps a coordinate relative to the screen to a coordinate found within the
   * world space.
   */
  abstract screenToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;

  /**
   * Maps a coordinate relative to the screen to a ray that emanates from the
   * selected coordinate such that the ray extending to infinity would be
   * projected to the same point.
   */
  abstract screenRay(point: Vec2Compat): Ray;

  /**
   * Maps a coordinate found within the world to a relative coordinate within
   * the screen space.
   */
  abstract worldToScreen(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;

  /**
   * Maps a coordinate relative to the view's viewport to a coordinate found
   * within the world.
   */
  abstract viewToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;

  /**
   * Maps a coordinate found within the world to a relative coordinate within
   * the view's viewport.
   */
  abstract worldToView(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
}

/**
 * This is an implementation of the BaseProjection with the abstract methods
 * implmented but not functional
 */
export class SimpleProjection extends BaseProjection<any> {
  screenToWorld(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat {
    return point;
  }

  screenRay(_point: Vec2Compat): Ray {
    return [
      [0, 0, -1],
      [0, 0, -2],
    ];
  }

  worldToScreen(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat {
    return point;
  }

  viewToWorld(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat {
    return point;
  }

  worldToView(point: Vec2Compat, _out?: Vec2Compat): Vec2Compat {
    return point;
  }
}
