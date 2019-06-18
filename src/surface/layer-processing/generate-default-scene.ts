import { AbsolutePosition } from "../../primitives/absolute-position";
import { Camera, CameraProjectionType } from "../../util/camera";
import { Controller2D } from "../../util/controller2D";
import { ViewCamera } from "../../util/view-camera";

export interface IDefaultElements {
  /** Default chartting camera */
  camera: Controller2D;
  /**
   * The default view projection. Defaults to being an orthographic rendering with the origin at the
   * top left of the canvas and the y-axis as +y going downward.
   */
  viewCamera: ViewCamera;
  /** The default viewport that encompasses the entire canvas */
  viewport: AbsolutePosition;
}

/**
 * This generates all of the cameras/views/scenes necessary for default viewing of elements.
 *
 * These defaults are required to ensure the following:
 *
 * - Orthographic view
 * - top left corner of the canvas is 0,0
 * - y axis is +y downward
 * - entire canvas is the viewport.
 */
export function generateDefaultElements(
  context: WebGLRenderingContext
): IDefaultElements {
  // Generate a default view camera that is
  // - Orthographic
  // - (0, 0) is the top left of the canvas
  // - the y axis is +y going downward
  const height = context.canvas.height;
  const width = context.canvas.width;
  const aspectRatio = width / height;

  const viewport = {
    aspectRatio: aspectRatio,
    bottom: -height / 2,
    far: 10000000,
    left: -width / 2,
    near: -100,
    right: width / 2,
    top: height / 2,
    viewSize: height
  };

  const defaultCamera: ViewCamera = new ViewCamera();
  defaultCamera.baseCamera = new Camera({
    type: CameraProjectionType.ORTHOGRAPHIC,
    left: viewport.left,
    right: viewport.right,
    top: viewport.top,
    bottom: viewport.bottom,
    near: viewport.near,
    far: viewport.far
  });

  defaultCamera.baseCamera.scale = [1.0, -1.0, 1.0];
  defaultCamera.baseCamera.position = [0.0, 0.0, -300.0];
  defaultCamera.baseCamera.update();

  // Generate a charting camera with all scales set to 1 and no offsets in any direction
  const defaultChartCamera: Controller2D = new Controller2D();

  // This is a viewport that covers the entire context
  const defaultViewport = {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
  };

  return {
    camera: defaultChartCamera,
    viewCamera: defaultCamera,
    viewport: defaultViewport
  };
}
