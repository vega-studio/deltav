import * as Three from 'three';
import { Bounds } from '../primitives/bounds';
import { Color } from '../types';
import { ChartCamera } from '../util/chart-camera';
import { IdentifyByKey, IdentifyByKeyOptions } from '../util/identify-by-key';

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
  viewport?: Bounds;
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
  /** Camera that defines the view projection matrix */
  viewCamera: Three.Camera;
  /** The bounds of the render space on the canvas this view will render on */
  viewport: Bounds;

  constructor(options: IViewOptions) {
    super(options);
    Object.assign(this, options);
  }
}
