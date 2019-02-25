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
}

/**
 * Options for generating a camera that has perspective properties.
 */
export interface ICameraPerspectiveOptions {
  /** Forced type requirement, indicates perspective projection */
  type: CameraProjectionType.PERSPECTIVE;
}

/**
 * Base options for camera construction
 */
export type ICameraOptions = ICameraOrthographicOptions | ICameraPerspectiveOptions;

/**
 * This class is present to simplify the concepts of Matrix math down to simpler camera concepts.
 */
export class Camera {
  /** The expected projection style of the Camera */
  get projectionType() { return this._projectionType; }
  private _projectionType = CameraProjectionType.PERSPECTIVE;

  constructor(options: ICameraOptions) {
    if (options.type === CameraProjectionType.ORTHOGRAPHIC) {

    }

    else {

    }
  }
}
