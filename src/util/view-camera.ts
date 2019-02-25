import { Camera } from "./camera";

export enum ViewCameraType {
  /**
   * Indicates a camera that is forced by the system to follow:
   * - Match width and height of the view port
   * - +y axis points downward
   * - gl origin is at the top left of the screen
   */
  CONTROLLED,
  /**
   * This allows a custom view camera to be applied to the scene.
   */
  CUSTOM
}

/**
 * This is a camera that controls the view projection matrix. This is a much more
 * complicated way to handle views that is better suited for handling 3D applications
 * and is very overkill for most 2D charting systems. If you are working purely with
 * 2D components, it's recommended to leave this as a CONTROLLED camera and utilize
 * the ChartCamera for most of your needs.
 */
export class ViewCamera {
  type: ViewCameraType = ViewCameraType.CONTROLLED;
  baseCamera: Camera;
}
