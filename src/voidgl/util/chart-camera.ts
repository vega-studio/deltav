import { Vec3, Vec4, subtract3, normalize3, cross3 } from "./vector";
import { Mat4x4, perspective4x4, translation4x4, multiply4x4 } from "./matrix";

let chartCameraUID = 0;

export interface perspectiveMetrics {
  fovRadian: number;
  aspectRadio: number;
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

  perspective?: perspectiveMetrics;
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
  private _offset: Vec3 = [0, 0, 1];
  /** Represents how scaled each axis should be in world space */
  private _scale: Vec3 = [1, 1, 1];
  /** This indicates whether the view where the camera is in needs drawn */
  private _needsViewDrawn: boolean = true;

  private _target: Vec3 = [0, 0, 0];
  private _up: Vec3 = [0, 1, 0];
  private _modelViewMatrix: Mat4x4 = [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  ];

  private _projectionMatrix: Mat4x4 = perspective4x4(
    Math.PI / 4,
    window.innerWidth / window.innerHeight,
    1.0,
    1000.0
  );

  constructor(options?: IChartCameraOptions) {
    if (options) {
      applyArray(this.offset, options.offset);
      applyArray(this.scale, options.scale);
      applyArray(this.target, options.target);
      applyArray(this.up, options.up);
      if (options.perspective) {
        const metrics = options.perspective;
        this._projectionMatrix = perspective4x4(
          metrics.fovRadian,
          metrics.aspectRadio,
          metrics.near,
          metrics.far
        );
      }
    }

    this._modelViewMatrix = calculateModelView(this._offset, this._target);
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
    this._target = target;
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
    return this._projectionMatrix;
  }

  setProjectionMatrix(
    fovRadian: number,
    aspectRadio: number,
    near: number,
    far: number
  ) {
    return perspective4x4(fovRadian, aspectRadio, near, far);
  }

  getProjectionElements() {
    return new Float32Array(this._projectionMatrix);
  }

  getModelViewMatrixElements() {
    return new Float32Array(this._modelViewMatrix);
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
