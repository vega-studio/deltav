import { Transform } from "../3d/scene-graph/transform.js";
import {
  compare4x4,
  copy4x4,
  identity4x4,
  inverse4x4,
  Mat4x4,
  multiply4x4,
  orthographic4x4,
  perspective4x4,
  transform4,
} from "../math/matrix.js";
import { compare3, Vec3 } from "../math/vector.js";
import { shallowCompare } from "./shallow-compare.js";
import { uid } from "./uid.js";

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
  /**
   * When this is true, the camera left, right, top, bottom, near, and far
   * will automatically adjust to the view bounds.
   */
  adjustsToView?: boolean;

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
  | ICameraPerspectiveOptions
) & {
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
 * This class is present to simplify the concepts of Matrix math down to simpler
 * camera concepts. A camera is two things:
 * - An object that can be placed within the world and be a part of a scene
 *   graph
 * - A mathematical structure that defines the viewing
 */
export class Camera {
  /**
   * Provide an identifier for the camera to follow the pattern of most
   * everything in this framework.
   */
  get id() {
    return this._id;
  }
  private _id: number = uid();

  /**
   * This is the calculated timestamp at which this camera is 'at rest' and will
   * no longer trigger updates
   */
  animationEndTime = 0;
  /** The id of the view to be broadcasted for the sake of a change */
  viewChangeViewId = "";
  /** This is the transform that places the camera within world space */
  transform: Transform = new Transform();

  /** Handler  */
  onChange?(camera: Camera, viewId: string): void;

  /**
   * Performs the broadcast of changes for the camera if the camera needed a
   * broadcast.
   */
  broadcast(viewId: string) {
    // Emit changes for the view indicated that this camera affects
    if (this.onChange) this.onChange(this, viewId);
  }

  /**
   * Quick generation of a camera with properties. None make any sense and
   * should be set appropriately. ie - View2D handles setting these values
   * correctly for you.
   */
  static makeOrthographic(options?: Partial<ICameraOrthographicOptions>) {
    return new Camera(
      Object.assign(
        {
          left: -100,
          right: 100,
          top: -100,
          bottom: 100,
          near: -100,
          far: 100000,
          type: CameraProjectionType.ORTHOGRAPHIC,
        },
        options
      )
    );
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
          fov: (90 * Math.PI) / 180,
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
    this.update(true);
    return this._projection;
  }
  private _projection: Mat4x4 = identity4x4();

  /** The computed view transform of the camera. */
  get view() {
    return this.transform.viewMatrix;
  }

  /**
   * Gets the computed inverse of the view matrix.
   */
  get inverseView() {
    return this.transform.inverseViewMatrix;
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
    this._needsUpdate =
      this._needsUpdate || !compare3(val, this.transform.position);
    this.transform.position = val;
  }

  /**
   * The camera must always look at a position within the world. This in
   * conjunction with 'roll' defines the orientation of the camera viewing the
   * world.
   */
  lookAt(position: Vec3, up?: Vec3) {
    const old: Mat4x4 = copy4x4(this.transform.matrix);
    this.transform.lookAtLocal(position, up || [0, 1, 0]);
    this._needsUpdate =
      this._needsUpdate || !compare4x4(old, this.transform.matrix);
  }

  /**
   * This is a scale distortion the camera views the world with. A scale of 2
   * along an axis, means the camera will view 2x the amount of the world along
   * that axis (thus having a visual compression if the screen dimensions do not
   * change).
   *
   * This also has the added benefit of quickly and easily swapping axis
   * directions by simply making the scale -1 for any of the axis.
   */
  get scale() {
    return this.transform.scale;
  }
  set scale(val: Vec3) {
    this._needsUpdate =
      this._needsUpdate || !compare3(val, this.transform.scale);
    this.transform.scale = val;
  }

  /**
   * Options used for making the projection of the camera. Set new options to
   * update the projection. Getting the options returns a copy of the object and
   * is not the internal object itself.
   */
  get projectionOptions() {
    return this._projectionOptions;
  }
  set projectionOptions(val: ICameraOptions) {
    this._needsUpdate =
      this._needsUpdate || !shallowCompare(val, this._projectionOptions);
    this._projectionOptions = val;
  }
  private _projectionOptions: ICameraOptions;

  /**
   * Provides the combined view projection matrices. Applies view first then the
   * projection multiply(P, V).
   */
  get viewProjection() {
    this.update(true);
    return this._viewProjection;
  }
  private _viewProjection: Mat4x4 = identity4x4();

  /**
   * Gets the computed inverse of the view projection matrix. If the view or
   * projection is modified, the inverse will be invalidated and recomputed.
   */
  get inverseViewProjection() {
    const viewProjection = this.viewProjection;

    if (!this._inverseViewProjection) {
      this._inverseViewProjection = inverse4x4(viewProjection) ?? identity4x4();
    }

    return this._inverseViewProjection;
  }
  private _inverseViewProjection?: Mat4x4 = void 0;

  constructor(options: ICameraOptions) {
    this._projectionOptions = options;
    this._needsUpdate = true;
    this.onChange = options.onViewChange;
    this.update();
  }

  /**
   * Sets projection options with the camera as an orthographic projection.
   */
  setOrthographic(options: Partial<ICameraOrthographicOptions>) {
    this._projectionOptions = Object.assign(
      {
        left: -100,
        right: 100,
        top: -100,
        bottom: 100,
        near: -100,
        far: 100000,
        type: CameraProjectionType.ORTHOGRAPHIC,
      },
      options
    );
    this._needsUpdate = true;
  }

  /**
   * Sets projection options with the camera as a perspective projection.
   */
  setPerspective(options: Partial<ICameraPerspectiveOptions>) {
    this._projectionOptions = Object.assign(
      {
        type: CameraProjectionType.PERSPECTIVE,
        far: 10000,
        near: 1,
        fov: (90 * Math.PI) / 180,
        height: 1000,
        width: 1000,
      },
      options
    );
    this._needsUpdate = true;
  }

  /**
   * This marks the camera's changes as resolved and responded to.
   */
  resolve() {
    this._needsUpdate = false;
  }

  /**
   * Updates the transform matrices associated with this camera.
   */
  update(force?: boolean) {
    if (this._needsUpdate || force) {
      this._inverseViewProjection = void 0;
      this.updateProjection();
    }
  }

  /**
   * This makes the projection tightly fit it's frustum to include the points
   * provided. The points provided are expected to be in WORLD SPACE unelss
   * otherwise noted.
   */
  fitProjectionToPoints(points: Vec3[], pointsAreCameraSpace: boolean = false) {
    const viewMatrix = this.view;

    const cameraSpacePoints = pointsAreCameraSpace
      ? points
      : points.map((p) => {
          const [x, y, z] = p;
          const result = transform4(viewMatrix, [x, y, z, 1]);
          return [result[0], result[1], result[2]] as Vec3;
        });

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (const [x, y, z] of cameraSpacePoints) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }

    if (isOrthographic(this)) {
      this.projectionOptions = {
        ...this.projectionOptions,
        left: minX,
        right: maxX,
        bottom: minY,
        top: maxY,
        near: minZ,
        far: maxZ,
      };
    } else if (isPerspective(this)) {
      const width = this.projectionOptions.width;
      const height = this.projectionOptions.height;
      const aspect = width / height;

      let maxTanY = 0;
      let maxTanX = 0;

      for (const [x, y, z] of cameraSpacePoints) {
        if (z <= 0.01) continue;

        maxTanY = Math.max(maxTanY, Math.abs(y / z));
        maxTanX = Math.max(maxTanX, Math.abs(x / z));
      }

      const fovYFromY = 2 * Math.atan(maxTanY);
      const fovYFromX = 2 * Math.atan(maxTanX / aspect);
      const newFov = Math.max(fovYFromY, fovYFromX);

      const near = Math.max(0.01, minZ);
      const far = maxZ;

      this.projectionOptions = {
        ...this.projectionOptions,
        near,
        far,
        fov: newFov,
      };
    }

    this._needsUpdate = true;
    this.update(true);
  }

  /**
   * Takes the current projection options and produces the projection matrix
   * needed to project elements to the screen.
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

    this._needsUpdate = false;
  }
}
