import { Camera, CameraProjectionType } from "../../util/camera";
import { Control2D, IControl2DOptions } from "./control-2d";

/**
 * This is a complex camera that layers simpler 2D concepts over an actual 3D projection camera. This camera FORCES the
 * orthographic projection type to work with the 2D layering system created.
 *
 * Essentially this Camera is a two layer concept rolled into one. This is done this way to make the front end API
 * simpler to use and understand while providing ease of use and conveniences for the 2D layer system.
 */
export class Camera2D extends Camera {
  /** These are the 2d controls to make manipulating a 2D world easier */
  control2D: Control2D;

  get scale2D() {
    return this.control2D.scale;
  }

  get offset() {
    return this.control2D.offset;
  }

  constructor(options?: IControl2DOptions) {
    // Force this 2d camera to be an orthographic projection type
    super({
      left: -100,
      right: 100,
      top: -100,
      bottom: 100,
      near: -100,
      far: 100000,
      type: CameraProjectionType.ORTHOGRAPHIC
    });

    // Generate the controller that manipulates our 2D world
    this.control2D = new Control2D(this, options);
  }
}
