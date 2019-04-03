import {
  affineInverse4x4,
  identity4,
  Mat4x4,
  multiply4x4,
  perspective4x4,
  translation4x4,
  transpose4x4,
  orthographic4x4
} from "./matrix";
import { cross3, normalize3, subtract3, Vec3 } from "./vector";

let chartCameraUID = 0;

export enum CameraType {
  PROJECTION,
  ORTHOGRAPHIC,
  NONE
}

export interface IPerspectiveMetrics {
  fovRadian: number;
  aspectRadio: number;
  near: number;
  far: number;
}

export interface IOrthographicMetrics {
  left: number;
  right: number;
  bottom: number;
  top: number;
  near: number;
  far: number;
}

export interface IChartCameraOptions {
  /** The world space offset of elements in the chart */
  offset?: [number] | [number, number] | Vec3;
  /** The world space scaling present in the chart */
  scale?: [number] | [number, number] | Vec3;

  target?: Vec3;

  up?: Vec3;

  perspective?: IPerspectiveMetrics;
  orthographic?: IOrthographicMetrics;

  type?: CameraType;

  enable3D?: boolean;
}

/**
 * Quick method for applying a source array to a target array. This
 * ensures the arrays both are valid and applies the values without just making
 * a copy of the source.
 */
function applyArray(target?: number[], source?: number[]) {
  target && source && target.splice(0, source.length, ...source);
}

function calculateModelView(offset: Vec3, target: Vec3): Mat4x4 {
  const t: Mat4x4 = translation4x4(-offset[0], -offset[1], -offset[2]);

  let f: Vec3 = subtract3(offset, target);
  f = normalize3(f);

  let u: Vec3 = [0, 1, 0];
  const l: Vec3 = normalize3(cross3(u, f));
  u = normalize3(cross3(f, l));

  const mr: Mat4x4 = [
    l[0],
    u[0],
    f[0],
    0,
    l[1],
    u[1],
    f[1],
    0,
    l[2],
    u[2],
    f[2],
    0,
    0,
    0,
    0,
    1
  ];

  return multiply4x4(mr, t);
}

export class ChartCamera {
  /** Internally set id */
  private _id: number = chartCameraUID++;
  /** Represents how much an element should be offset in world space */
  private _offset: Vec3 = [0, 0, 0];
  /** Represents how scaled each axis should be in world space */
  private _scale: Vec3 = [1, 1, 1];
  /** This indicates whether the view where the camera is in needs drawn */
  private _needsViewDrawn: boolean = true;

  private _target: Vec3 = [0, 0, 0];
  private _up: Vec3 = [0, 1, 0];
  private _modelViewMatrix: Mat4x4 = identity4();
  private _projectionOrOrthographicMatrix: Mat4x4 = identity4();
  private _enable3D: boolean = false;

  private _type: CameraType = CameraType.NONE;

  constructor(options?: IChartCameraOptions) {
    if (options) {
      applyArray(this.offset, options.offset);
      applyArray(this.scale, options.scale);
      applyArray(this.target, options.target);
      applyArray(this.up, options.up);

      this._modelViewMatrix = calculateModelView(this._offset, this._target);

      this._enable3D = options.enable3D || this._enable3D;

      this._type = options.type || this._type;

      if (this._type !== CameraType.NONE) {
        if (this._type === CameraType.PROJECTION) {
          if (options.perspective) {
            const metrics = options.perspective;
            this._projectionOrOrthographicMatrix = perspective4x4(
              metrics.fovRadian,
              metrics.aspectRadio,
              metrics.near,
              metrics.far
            );
          }
        } else if (this._type === CameraType.ORTHOGRAPHIC) {
          if (options.orthographic) {
            const metrics = options.orthographic;
            this._projectionOrOrthographicMatrix = orthographic4x4(
              metrics.left,
              metrics.right,
              metrics.bottom,
              metrics.top,
              metrics.near,
              metrics.far
            );
          }
        }
      }
    }
  }

  setType(type: CameraType) {
    this._type = type;
  }

  get type() {
    return this._type;
  }

  setEnable3D(value: boolean) {
    this._enable3D = value;
  }

  get enable3D() {
    return this._enable3D;
  }

  /** Keep id as readonly */
  get id() {
    return this._id;
  }

  setId(id: number) {
    this._id = id;
    this._needsViewDrawn = true;
  }

  get offset() {
    return this._offset;
  }

  /**
   * Sets the location of the camera by adjusting the offsets to match.
   */
  setOffset(offset: Vec3) {
    this._offset = offset.slice(0) as Vec3;
    this._modelViewMatrix = calculateModelView(this._offset, this._target);
    this._needsViewDrawn = true;
  }

  get scale() {
    return this._scale;
  }

  setScale(scale: Vec3) {
    this._scale = scale;
    this._needsViewDrawn = true;
  }

  get target() {
    return this._target;
  }

  setTarget(target: Vec3) {
    this._target = target.slice(0) as Vec3;
    this._modelViewMatrix = calculateModelView(this._offset, this._target);
    this._needsViewDrawn = true;
  }

  get up() {
    return this._up;
  }

  get modelViewMatrix() {
    return this._modelViewMatrix;
  }

  get projectionMatrix() {
    return this._projectionOrOrthographicMatrix;
  }

  setProjectionMatrix(
    fovRadian: number,
    aspectRadio: number,
    near: number,
    far: number
  ) {
    if (this.type === CameraType.PROJECTION) {
      this._projectionOrOrthographicMatrix = perspective4x4(
        fovRadian,
        aspectRadio,
        near,
        far
      );
    }
  }

  setOrthographicMatrix(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ) {
    if (this.type === CameraType.ORTHOGRAPHIC) {
      this._projectionOrOrthographicMatrix = orthographic4x4(
        left,
        right,
        bottom,
        top,
        near,
        far
      );
    }
  }

  getProjectionOrOthographicElements() {
    return new Float32Array(this._projectionOrOrthographicMatrix);
  }

  getModelViewMatrixElements() {
    return new Float32Array(this._modelViewMatrix);
  }

  getNormalMatrixElements() {
    const transposeMatrix = affineInverse4x4(this._modelViewMatrix);
    if (transposeMatrix) {
      const NormalMatrix = transpose4x4(transposeMatrix);
      return new Float32Array(NormalMatrix);
    }
    return new Float32Array(identity4());
  }

  get needsViewDrawn() {
    return this._needsViewDrawn;
  }

  resolve() {
    this._needsViewDrawn = false;
  }

  update() {
    this._needsViewDrawn = true;
  }
}
