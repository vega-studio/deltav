import { Transform } from '../3d/scene-graph/transform';
import {
  identity4,
  Mat4x4,
  multiply4x4,
  orthographic4x4,
  perspective4x4,
} from '../math/matrix';
import { Vec3 } from '../math/vector';
import { uid } from './uid';

export enum CameraProjectionType {
  PERSPECTIVE,
  ORTHOGRAPHIC,
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
export type ICameraOptions = (
  | ICameraOrthographicOptions
  | ICameraPerspectiveOptions) & {
  onViewChange?(camera: Camera, viewId: string): void;
};

export interface IOrthoGraphicCamera extends Camera {
  projectionOptions: ICameraOrthographicOptions;
}

export interface IPerspectiveCamera extends Camera {
  projectionOptions: ICameraPerspectiveOptions;
}

export function isOrthographic(camera: Camera): camera is IOrthoGraphicCamera {
  return (
    camera.projectionOptions.type === CameraProjectionType.ORTHOGRAPHIC &&
    'left' in camera.projectionOptions
  );
}

export function isPerspective(camera: Camera): camera is IPerspectiveCamera {
  return (
    camera.projectionOptions.type === CameraProjectionType.PERSPECTIVE &&
    'fov' in camera.projectionOptions
  );
}

/**
 * This class is present to simplify the concepts of Matrix math down to simpler camera concepts. A camera is two things:
 * - An object that can be placed within the world and be a part of a scene graph
 * - A mathematical structure that defines the viewing
 */
export class Camera {
  /** Provide an identifier for the camera to follow the pattern of most everything in this framework. */
  get id() {
    return this._id;
  }
  private _id: number = uid();

  /** This is the calculated timestamp at which this camera is 'at rest' and will no longer trigger updates */
  animationEndTime: number = 0;
  /** Indicates the view's associated with this camera should be redrawn */
  needsViewDrawn: boolean = true;
  /** Flag indicating the camera needs to broadcast changes applied to it */
  needsBroadcast: boolean = false;
  /** The id of the view to be broadcasted for the sake of a change */
  viewChangeViewId: string = '';
  /** This is the transform that places the camera within world space */
  transform: Transform = new Transform();

  /** Handler  */
  onChange?(camera: Camera, viewId: string): void;

  /**
   * Performs the broadcast of changes for the camera if the camera needed a broadcast.
   */
  broadcast(viewId: string) {
    // Emit changes for the view indicated that this camera affects
    if (this.onChange) this.onChange(this, viewId);
  }

  /**
   * Quick generation of a camera with properties. None make any sense and should be set appropriately.
   * ie - View2D handles setting these values correctly for you.
   */
  static makeOrthographic() {
    return new Camera({
      left: -100,
      right: 100,
      top: -100,
      bottom: 100,
      near: -100,
      far: 100000,
      type: CameraProjectionType.ORTHOGRAPHIC,
    });
  }

  /**
   * Quick generation of a camera with perspective properties.
   */
  static makePerspective(options?: Partial<ICameraPerspectiveOptions>) {
    return new Camera(
      Object.assign(
        {
          type: CameraProjectionType.PERSPECTIVE,
          far: 10000,
          near: 1,
          fov: 90 * Math.PI / 180,
          height: 1000,
          width: 1000,
        },
        options
      )
    );
  }

  /** The expected projection style of the Camera. */
  get projectionType() {
    return this._projectionOptions.type;
  }

  /** The computed projection of the camera. */
  get projection() {
    this.update();
    return this._projection;
  }
  private _projection: Mat4x4 = identity4();

  /** The computed view transform of the camera. */
  get view() {
    return this.transform.viewMatrix;
  }

  /** Flag indicating the transforms for this camera need updating. */
  get needsUpdate() {
    return this._needsUpdate;
  }
  private _needsUpdate = true;

  /** This is the position of the camera within the world. */
  get position() {
    return this.transform.position;
  }
  set position(val: Vec3) {
    this._needsUpdate = true;
    this.transform.position = val;
  }

  /**
   * The camera must always look at a position within the world. This in conjunction with 'roll' defines the orientation
   * of the camera viewing the world.
   */
  lookAt(position: Vec3, up: Vec3) {
    this._needsUpdate = true;
    this.transform.lookAt(position, up);
  }

  /**
   * This is a scale distortion the camera views the world with. A scale of 2 along an axis, means the camera will view
   * 2x the amount of the world along that axis (thus having a visual compression if the screen dimensions do
   * not change).
   *
   * This also has the added benefit of quickly and easily swapping axis directions by simply making the scale -1 for
   * any of the axis.
   */
  get scale() {
    return this.transform.scale;
  }
  set scale(val: Vec3) {
    this._needsUpdate = true;
    this.transform.scale = val;
  }

  /**
   * Options used for making the projection of the camera. Set new options to update the projection.
   * Getting the options returns a copy of the object and is not the internal object itself.
   */
  get projectionOptions() {
    return this._projectionOptions;
  }
  set projectionOptions(val: ICameraOptions) {
    this._projectionOptions = val;
    this._needsUpdate = true;
  }
  private _projectionOptions: ICameraOptions;

  /**
   * Provides the combined view projection matrices. Applies view first then the projection multiply(P, V).
   */
  get viewProjection() {
    if (this.transform.changed || this._needsUpdate) {
      this.update(true);
    }

    return this._viewProjection;
  }
  private _viewProjection: Mat4x4 = identity4();

  constructor(options: ICameraOptions) {
    this._projectionOptions = options;
    this._needsUpdate = true;
    this.onChange = options.onViewChange;
    this.update();
  }

  /**
   * This marks the camera's changes as resolved and responded to.
   */
  resolve() {
    this._needsUpdate = false;
    this.needsViewDrawn = false;
    this.needsBroadcast = false;
  }

  /**
   * Updates the transform matrices associated with this camera.
   */
  update(force?: boolean) {
    if (this._needsUpdate || force) {
      this.updateProjection();
      this._needsUpdate = false;
    }
  }

  /**
   * Takes the current projection options and produces the projection matrix needed to project elements to the screen.
   */
  updateProjection() {
    if (isOrthographic(this)) {
      orthographic4x4(
        this.projectionOptions.left,
        this.projectionOptions.right,
        this.projectionOptions.bottom,
        this.projectionOptions.top,
        this.projectionOptions.near,
        this.projectionOptions.far,
        this._projection
      );
    } else if (isPerspective(this)) {
      perspective4x4(
        this.projectionOptions.fov,
        this.projectionOptions.width,
        this.projectionOptions.height,
        this.projectionOptions.near,
        this.projectionOptions.far,
        this._projection
      );
    }

    multiply4x4(
      this._projection,
      this.transform.viewMatrix,
      this._viewProjection
    );
  }
}
