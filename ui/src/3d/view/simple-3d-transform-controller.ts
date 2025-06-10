import { SimpleEventHandler } from "../../event-management/simple-event-handler.js";
import type { IMouseInteraction } from "../../event-management/types.js";
import {
  fromEulerAxisAngleToQuat,
  multiplyQuat,
  normalizeQuat,
  Quaternion,
} from "../../math/quaternion.js";
import type { Camera } from "../../util/camera.js";
import type { Instance3D } from "../scene-graph/instance-3d.js";

export interface ISimple3DTransformControllerOptions {
  /** The transform to manipulate with the event manager */
  target: Instance3D;
  /** The camera object to use for determining rotation axes */
  camera: Camera;
}

/**
 * This listens to mouse events to control the transform of a 3D object to
 * rotate and scale the object around the origin [0, 0, 0];
 */
export class Simple3DTransformController extends SimpleEventHandler {
  private target: Instance3D;
  private camera: Camera;
  private isDragging = false;
  private lastMouse: [number, number] | null = null;
  private readonly ROTATE_SENSITIVITY = 0.01; // radians per pixel
  private readonly ZOOM_SENSITIVITY = 0.1; // scale per wheel notch
  private readonly MIN_SCALE = 0.1;
  private readonly MAX_SCALE = 10;

  constructor(options: ISimple3DTransformControllerOptions) {
    super({});
    this.target = options.target;
    this.camera = options.camera;
  }

  /**
   * Update the camera reference if needed.
   */
  setCamera(camera: Camera) {
    this.camera = camera;
  }

  handleMouseDown(e: IMouseInteraction) {
    if (e.mouse.button === 0) {
      // left button
      this.isDragging = true;
      this.lastMouse = [e.mouse.currentPosition[0], e.mouse.currentPosition[1]];
    }
  }

  handleMouseUp(_e: IMouseInteraction) {
    this.isDragging = false;
    this.lastMouse = null;
  }

  handleDrag(e: IMouseInteraction) {
    if (!this.isDragging || !this.lastMouse) return;
    const [lastX, lastY] = this.lastMouse;
    const [currX, currY] = e.mouse.currentPosition;
    const dx = currX - lastX;
    const dy = currY - lastY;
    this.lastMouse = [currX, currY];

    // Get camera's right and up vectors from its transform
    // Assuming camera.transform.matrix is a 4x4 matrix in column-major order
    // Right: first column, Up: second column
    const m = this.camera.transform.matrix;
    const cameraRight: [number, number, number] = [m[0], m[1], m[2]];
    const cameraUp: [number, number, number] = [m[4], m[5], m[6]];

    // Rotate around camera's up for dx, camera's right for dy
    const angleY = dx * this.ROTATE_SENSITIVITY;
    const angleX = dy * this.ROTATE_SENSITIVITY;

    const qY = fromEulerAxisAngleToQuat(cameraUp, angleY);
    const qX = fromEulerAxisAngleToQuat(cameraRight, angleX);

    // Compose new rotation: qY * qX * current
    const newRot: Quaternion = [0, 0, 0, 0];
    multiplyQuat(qY, qX, newRot);
    multiplyQuat(newRot, this.target.localRotation, newRot);
    normalizeQuat(newRot, newRot);
    this.target.localRotation = newRot;
  }

  handleWheel(e: IMouseInteraction) {
    // e.mouse.wheel.delta[1] is vertical wheel
    let scale = this.target.localScale[0];
    scale *= 1 + e.mouse.wheel.delta[1] * this.ZOOM_SENSITIVITY * 0.01;
    scale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, scale));
    this.target.localScale = [scale, scale, scale];
  }
}
