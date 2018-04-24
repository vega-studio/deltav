import * as Three from 'three';
import { AbsolutePosition, getAbsolutePositionBounds } from '../primitives/absolute-position';
import { Bounds } from '../primitives/bounds';
import { IPoint } from '../primitives/point';
import { Color } from '../types';
import { ChartCamera } from '../util/chart-camera';
import { DataBounds } from '../util/data-bounds';
import { IdentifyByKey, IdentifyByKeyOptions } from '../util/identify-by-key';
import { ViewCamera, ViewCameraType } from '../util/view-camera';

export enum ClearFlags {
  COLOR = 0b0001,
  DEPTH = 0b0010,
  STENCIL = 0b0100,
}

/**
 * Defines the input metrics of a view for a scene.
 */
export interface IViewOptions extends IdentifyByKeyOptions {
  /**
   * The background color that gets cleared out for this view. Performance is
   * better if this is left clear. Probably better to draw a colored quad instead.
   * This is just convenient.
   */
  background?: Color;
  /**
   * This is the spatial charting camera that is concerned with offsets and scales.
   * It is often easier to work with camera positioning and settings rather than working
   * with the complex and nuanced viewCamera which works with special transformation matrices
   * to express orientation.
   *
   * If not provided, then this camera will use a default ChartCamera for this camera slot. This
   * will also cause a normal camera handler to be utilized.
   */
  camera?: ChartCamera;
  /**
   * This sets what buffers get cleared by webgl before the view is drawn in it's space.
   */
  clearFlags?: ClearFlags[];
  /**
   * If this is provided, the layer can be rendered with a traditional camera that utilizes
   * matrix transforms to provide orientation/projection for the view.
   *
   * If this is NOT provided, the camera will be a special orthographic camera for 2d spaces
   * with a y-axis of +y points down with (0, 0) at the top left of the viewport.
   */
  viewCamera?: ViewCamera;
  /**
   * This specifies the bounds on the canvas this camera will render to. This let's you render
   * say a little square in the bottom right showing a minimap.
   *
   * If this is not specified, the entire canvas will be the viewport.
   */
  viewport?: AbsolutePosition;
}

function isOrthographic(val: Three.Camera): val is Three.OrthographicCamera {
  return 'left' in val;
}

/**
 * This defines a view of a scene
 */
export class View extends IdentifyByKey {
  static DEFAULT_VIEW_ID = '__default__';

  /** If present, is the cleared color before this view renders */
  background: Color;
  /** Camera that defines the individual components of each axis with simpler concepts */
  camera: ChartCamera;
  /** These are the clear flags set for this view */
  clearFlags: ClearFlags[];
  /**
   * This is the depth of the view. The higher the depth represents which layer is on top.
   * Zero always represents the default view.
   */
  depth: number = 0;
  /** This is set to ensure the projections that happen properly translates the pixel ratio to normal Web coordinates */
  pixelRatio: number = window.devicePixelRatio;
  /** This is the rendering bounds within screen space */
  screenBounds: Bounds;
  /** Camera that defines the view projection matrix */
  viewCamera: ViewCamera;
  /** The size positioning of the view */
  viewport: AbsolutePosition;
  /** The bounds of the render space on the canvas this view will render on */
  viewBounds: DataBounds<View>;

  constructor(options: IViewOptions) {
    super(options);
    Object.assign(this, options);
  }

  screenToPixelSpace(point: IPoint, out?: IPoint) {
    const p = out || {x: 0, y: 0};

    p.x = point.x * this.pixelRatio;
    p.y = point.y * this.pixelRatio;

    return p;
  }

  pixelSpaceToScreen(point: IPoint, out?: IPoint) {
    const p = out || {x: 0, y: 0};

    p.x = point.x / this.pixelRatio;
    p.y = point.y / this.pixelRatio;

    return p;
  }

  screenToView(point: IPoint, out?: IPoint) {
    const p = this.screenToPixelSpace(point, out);

    p.x = p.x - this.viewBounds.x;
    p.y = p.y - this.viewBounds.y;

    return p;
  }

  viewToScreen(point: IPoint, out?: IPoint) {
    const p = {x: 0, y: 0};

    p.x = point.x + this.viewBounds.x;
    p.y = point.y + this.viewBounds.y;

    return this.pixelSpaceToScreen(p, out);
  }

  screenToWorld(point: IPoint, out?: IPoint) {
    const view = this.screenToView(point);

    const world = out || {x: 0, y: 0};
    world.x = (view.x - (this.camera.offset[0] * this.camera.scale[0])) / this.camera.scale[0];
    world.y = (view.y - (this.camera.offset[1] * this.camera.scale[1])) / this.camera.scale[1];

    // If this is a custom camera, we must actually project our world point to the screen
    if (this.viewCamera.type === ViewCameraType.CUSTOM) {
      console.warn('Custom View Camera projections not supported yet');
    }

    return world;
  }

  worldToScreen(point: IPoint, out?: IPoint) {
    const screen = {x: 0, y: 0};

    // Calculate from the camera to view space
    screen.x = (point.x * this.camera.scale[0]) + (this.camera.offset[0] * this.camera.scale[0]);
    screen.y = (point.y * this.camera.scale[1]) + (this.camera.offset[1] * this.camera.scale[1]);

    // If this is a custom camera, we must actually project our world point to the screen
    if (this.viewCamera.type === ViewCameraType.CUSTOM) {
      console.warn('Custom View Camera projections not supported yet');
    }

    // Convert from view to screen space
    return this.viewToScreen(screen, out);
  }

  viewToWorld(point: IPoint, out?: IPoint) {
    const world = out || {x: 0, y: 0};

    const screen = this.pixelSpaceToScreen(point);
    world.x = (screen.x - (this.camera.offset[0] * this.camera.scale[0])) / this.camera.scale[0];
    world.y = (screen.y - (this.camera.offset[1] * this.camera.scale[1])) / this.camera.scale[1];

    // If this is a custom camera, we must actually project our world point to the screen
    if (this.viewCamera.type === ViewCameraType.CUSTOM) {
      console.warn('Custom View Camera projections not supported yet');
    }

    return world;
  }

  worldToView(point: IPoint, out?: IPoint) {
    const screen = out || {x: 0, y: 0};

    // Calculate from the camera to view space
    screen.x = (point.x * this.camera.scale[0]) + (this.camera.offset[0] * this.camera.scale[0]);
    screen.y = (point.y * this.camera.scale[1]) + (this.camera.offset[1] * this.camera.scale[1]);

    // If this is a custom camera, we must actually project our world point to the screen
    if (this.viewCamera.type === ViewCameraType.CUSTOM) {
      console.warn('Custom View Camera projections not supported yet');
    }

    return screen;
  }

  /**
   * This operation makes sure we have the view camera adjusted to the new viewport's needs.
   * For default behavior this ensures that the coordinate system has no distortion, orthographic,
   * top left as 0,0 with +y axis pointing down.
   */
  fitViewtoViewport(surfaceDimensions: Bounds) {
    if (this.viewCamera.type === ViewCameraType.CONTROLLED && isOrthographic(this.viewCamera.baseCamera)) {
      const viewBounds = getAbsolutePositionBounds<View>(this.viewport, surfaceDimensions, this.pixelRatio);
      const width = viewBounds.width;
      const height = viewBounds.height;

      const viewport = {
        bottom: -height / 2,
        far: 10000000,
        left: -width / 2,
        near: -100,
        right: width / 2,
        top: height / 2,
      };

      const scaleX = 1;
      const scaleY = 1;
      const camera = this.viewCamera.baseCamera;

      Object.assign(camera, viewport);
      camera.position.set(-viewBounds.width / 2.0 * scaleX, viewBounds.height / 2.0 * scaleY, camera.position.z);
      camera.scale.set(scaleX, -scaleY, 1.0);
      camera.updateMatrix();
      camera.updateMatrixWorld(true);
      camera.updateProjectionMatrix();

      this.viewBounds = viewBounds;
      this.viewBounds.data = this;
      this.screenBounds = new Bounds({
        height: this.viewBounds.height / this.pixelRatio,
        width: this.viewBounds.width / this.pixelRatio,
        x: this.viewBounds.x / this.pixelRatio,
        y: this.viewBounds.y / this.pixelRatio,
      });
    }

    else if (!isOrthographic(this.viewCamera.baseCamera)) {
      console.warn('Fit to viewport does not support non-orthographic cameras as a default behavior.');
    }
  }
}
