import * as Three from 'three';
import { Bounds } from '../primitives/bounds';
import { ChartCamera } from '../util/chart-camera';
import { Scene } from './scene';
import { View } from './view';

export interface IDefaultSceneElements {
  /** Default chartting camera */
  camera: ChartCamera;
  /** Default scene for elements to be added into */
  scene: Scene;
  /** Default view scenes are rendered with when no other views are specified by the layer or the surface */
  view: View;
  /**
   * The default view projection. Defaults to being an orthographic rendering with the origin at the
   * top left of the canvas and the y-axis as +y going downward.
   */
  viewCamera: Three.Camera;
  /** The default viewport that encompasses the entire canvas */
  viewport: Bounds;
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
export function generateDefaultScene(context: WebGLRenderingContext): IDefaultSceneElements {
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
    viewSize: height,
  };

  const defaultCamera: Three.OrthographicCamera = new Three.OrthographicCamera(
    viewport.left,
    viewport.right,
    viewport.top,
    viewport.bottom,
    viewport.near,
    viewport.far,
  );

  defaultCamera.scale.set(1.0, -1.0, 1.0);
  defaultCamera.position.set(0.0, 0.0, -300.0);
  defaultCamera.updateMatrixWorld(true);
  defaultCamera.updateMatrix();
  defaultCamera.updateProjectionMatrix();

  // Generate a charting camera with all scales set to 1 and no offsets in any direction
  const defaultChartCamera: ChartCamera = new ChartCamera();

  // This is a viewport that covers the entire context
  const defaultViewport = new Bounds({
    bottom: context.canvas.height,
    left: 0,
    right: context.canvas.width,
    top: 0,
  });

  // Make a view using our defaults
  const defaultView = new View({
    camera: defaultChartCamera,
    key: View.DEFAULT_VIEW_ID,
    viewCamera: defaultCamera,
    viewport: defaultViewport,
  });

  // Make a scene with our defaults
  const defaultScene = new Scene({
    key: Scene.DEFAULT_SCENE_ID,
    views: [],
  });

  // Make sure the default view is a part of the default scene
  defaultScene.addView(defaultView);

  return {
    camera: defaultChartCamera,
    scene: defaultScene,
    view: defaultView,
    viewCamera: defaultCamera,
    viewport: defaultViewport,
  };
}
