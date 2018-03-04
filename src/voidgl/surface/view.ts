import * as Three from 'three';
import { AbsolutePosition, getAbsolutePositionBounds } from '../primitives/absolute-position';
import { Bounds } from '../primitives/bounds';
import { IPoint } from '../primitives/point';
import { Color } from '../types';
import { ChartCamera } from '../util/chart-camera';
import { DataBounds } from '../util/data-bounds';
import { IdentifyByKey, IdentifyByKeyOptions } from '../util/identify-by-key';

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
  viewCamera?: Three.Camera;
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
  /** Camera that defines the view projection matrix */
  viewCamera: Three.Camera;
  /** The size positioning of the view */
  viewport: AbsolutePosition;
  /** The bounds of the render space on the canvas this view will render on */
  viewBounds: DataBounds<View>;

  constructor(options: IViewOptions) {
    super(options);
    Object.assign(this, options);
  }

  screenToView(point: IPoint, out?: IPoint) {
    const p = out || {x: 0, y: 0};

    p.x = point.x - this.viewBounds.x;
    p.y = point.y - this.viewBounds.y;

    return p;
  }

  viewToScreen(point: IPoint, out?: IPoint) {
    const p = out || {x: 0, y: 0};

    p.x = point.x + this.viewBounds.x;
    p.y = point.y + this.viewBounds.y;

    return p;
  }

  screenToWorld(point: IPoint, out?: IPoint) {

  }

  worldToScreen(point: IPoint, out?: IPoint) {

  }

  viewToWorld(point: IPoint, out?: IPoint) {

  }

  worldToView(point: IPoint, out?: IPoint) {

  }

  /**
   * This operation makes sure we have the view camera adjusted to the new viewport's needs.
   * For default behavior this ensures that the coordinate system has no distortion, orthographic,
   * top left as 0,0 with +y axis pointing down.
   */
  fitViewtoViewport(surfaceDimensions: Bounds) {
    if (isOrthographic(this.viewCamera)) {
      const viewBounds = getAbsolutePositionBounds<View>(this.viewport, surfaceDimensions);
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

      const scaleX = surfaceDimensions.width / viewBounds.width;
      const scaleY = surfaceDimensions.height / viewBounds.height;

      Object.assign(this.viewCamera, viewport);
      this.viewCamera.position.set(-viewBounds.width / 2.0 * scaleX, viewBounds.height / 2.0 * scaleY, this.viewCamera.position.z);
      this.viewCamera.scale.set(scaleX, -scaleY, 1.0);
      this.viewCamera.updateMatrix();
      this.viewCamera.updateMatrixWorld(true);

      this.viewBounds = viewBounds;
      this.viewBounds.data = this;
    }

    else {
      console.warn('Fit to viewport does not support non-orthographic cameras as a default behavior.');
    }
  }
}
