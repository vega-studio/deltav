import {
  identity4,
  Mat4x4,
  multiply4x4,
  orthographic4x4,
  perspective4x4,
  scale4x4by3,
  translation4x4by3
} from "./matrix";
import { copy3, Vec3 } from "./vector";

export enum CameraProjectionType {
  PERSPECTIVE,
  ORTHOGRAPHIC
}

/**
 * Options for generating a camera that has orthographic properties.
 */
export interface ICameraOrthographicOptions {
  /** Forced type requirement, indicates orthographic projection */
  type: CameraProjectionType.ORTHOGRAPHIC;

  /** Left border of the view range */
  left: number;
  /** Right border of the view range */
  right: number;
  /** Top border of the view range */
  top: number;
  /** Bottom border of the view range */
  bottom: number;
  /** Near border of the view range */
  near: number;
  /** Far border of the view range */
  far: number;
}

/**
 * Options for generating a camera that has perspective properties.
 */
export interface ICameraPerspectiveOptions {
  /** Forced type requirement, indicates perspective projection */
  type: CameraProjectionType.PERSPECTIVE;

  /** Field of view in radians */
  fov: number;
  /** Width of the render space */
  width: number;
  /** Height of the render space */
  height: number;
  /** The near clipping plane */
  near: number;
  /** The far clipping plane */
  far: number;
}

/**
 * Base options for camera construction
 */
export type ICameraOptions =
  | ICameraOrthographicOptions
  | ICameraPerspectiveOptions;

export interface IOrthoGraphicCamera extends Camera {
  projectionOptions: ICameraOrthographicOptions;
}

export interface IPerspectiveCamera extends Camera {
  projectionOptions: ICameraPerspectiveOptions;
}

export function isOrthographic(camera: Camera): camera is IOrthoGraphicCamera {
  return (
    camera.projectionOptions.type === CameraProjectionType.ORTHOGRAPHIC &&
    "left" in camera.projectionOptions
  );
}

export function isPerspective(camera: Camera): camera is IPerspectiveCamera {
  return (
    camera.projectionOptions.type === CameraProjectionType.PERSPECTIVE &&
    "fov" in camera.projectionOptions
  );
}

/**
 * This class is present to simplify the concepts of Matrix math down to simpler camera concepts.
 */
export class Camera {
  /**
   * Quick generation of a camera with properties. None of any make sense.
   */
  static defaultCamera() {
    return new Camera({
      left: -100,
      right: 100,
      top: -100,
      bottom: 100,
      near: -100,
      far: 100000,
      type: CameraProjectionType.ORTHOGRAPHIC
    });
  }

  /** The expected projection style of the Camera. */
  get projectionType() {
    return this._projectionOptions.type;
  }

  /** The computed projection of the camera. */
  get projection() {
    return this._projection;
  }
  private _projection: Mat4x4 = identity4();
  /** The computed view transform of the camera. */
  get view() {
    return this._view;
  }
  private _view: Mat4x4 = identity4();
  /** Flag indicating the transforms for this camera need updating. */
  get needsUpdate() {
    return this._needsUpdate;
  }
  private _needsUpdate = false;

  /** This is the position of the camera within the world. Call updateTransform for changes to take effect. */
  get position() {
    return copy3(this._position);
  }
  set position(val: Vec3) {
    this._position = val;
    this._needsUpdate = true;
  }
  private _position: Vec3 = [0, 0, 0];

  /** This is a scale distortion the camera views the world with */
  get scale() {
    return copy3(this._scale);
  }
  set scale(val: Vec3) {
    this._scale = val;
    this._needsUpdate = true;
  }
  private _scale: Vec3 = [1, 1, 1];

  /** This is the rotation of the camera looking into the world */
  get rotation() {
    return copy3(this._rotation);
  }
  set rotation(val: Vec3) {
    this._rotation = val;
    this._needsUpdate = true;
  }
  private _rotation: Vec3 = [0, 0, 0];

  /**
   * Options used for making the projection of the camera. Set new options to update the projection.
   * Getting the options returns a copy of the object and is not the internal object itself.
   */
  get projectionOptions() {
    return Object.assign({}, this._projectionOptions);
  }
  set projectionOptions(val: ICameraOptions) {
    this._projectionOptions = val;
    this._needsUpdate = true;
  }
  private _projectionOptions: ICameraOptions;

  constructor(options: ICameraOptions) {
    this._projectionOptions = options;
    this._needsUpdate = true;
    this.update();
  }

  /**
   * Updates the transform matrices associated with this camera.
   */
  update(force?: boolean) {
    if (this._needsUpdate || force) {
      this.updateProjection();
      this.updateTransform();
    }
  }

  /**
   * Takes the current projection options and
   */
  updateProjection() {
    if (isOrthographic(this)) {
      this._projection = orthographic4x4(
        this.projectionOptions.left,
        this.projectionOptions.right,
        this.projectionOptions.bottom,
        this.projectionOptions.top,
        this.projectionOptions.near,
        this.projectionOptions.far
      );
    } else if (isPerspective(this)) {
      this._projection = perspective4x4(
        this.projectionOptions.fov,
        this.projectionOptions.width / this.projectionOptions.height,
        this.projectionOptions.near,
        this.projectionOptions.far
      );
    }
  }

  /**
   * Takes the current components of the camera and updates the transform of the camera (the view)
   * within Model View Projection Transform
   */
  updateTransform() {
    this._view = multiply4x4(
      scale4x4by3(this._scale),
      translation4x4by3(this._position)
    );
  }
}
