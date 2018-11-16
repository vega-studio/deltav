import { Vec2 } from "src/voidgl/util";
import * as Three from "three";
import {
  AbsolutePosition,
  getAbsolutePositionBounds
} from "../primitives/absolute-position";
import { Bounds } from "../primitives/bounds";
import { Color } from "../types";
import { ChartCamera } from "../util/chart-camera";
import { DataBounds } from "../util/data-bounds";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { ViewCamera, ViewCameraType } from "../util/view-camera";

export enum ClearFlags {
  COLOR = 0b0001,
  DEPTH = 0b0010,
  STENCIL = 0b0100
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
  viewport: AbsolutePosition;
}

function isOrthographic(val: Three.Camera): val is Three.OrthographicCamera {
  return "left" in val;
}

/**
 * This defines a view of a scene
 */
export class View extends IdentifyByKey {
  static DEFAULT_VIEW_ID = "__default__";

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
  /** This is the flag to see if a view needs draw */
  needsDraw: boolean = false;
  /** End time of animation */
  animationEndTime: number = 0;

  constructor(options: IViewOptions) {
    super(options);
    Object.assign(this, options);
  }

  screenToPixelSpace(point: Vec2, out?: Vec2) {
    const p = out || [0, 0];

    p[0] = point[0] * this.pixelRatio;
    p[1] = point[1] * this.pixelRatio;

    return p;
  }

  pixelSpaceToScreen(point: Vec2, out?: Vec2) {
    const p = out || [0, 0];

    p[0] = point[0] / this.pixelRatio;
    p[1] = point[1] / this.pixelRatio;

    return p;
  }

  screenToView(point: Vec2, out?: Vec2) {
    const p = this.screenToPixelSpace(point, out);

    p[0] = p[0] - this.viewBounds.x;
    p[1] = p[1] - this.viewBounds.y;

    return p;
  }

  viewToScreen(point: Vec2, out?: Vec2) {
    const p: Vec2 = [0, 0];

    p[0] = point[0] + this.viewBounds.x;
    p[1] = point[1] + this.viewBounds.y;

    return this.pixelSpaceToScreen(p, out);
  }

  screenToWorld(point: Vec2, out?: Vec2) {
    const view = this.pixelSpaceToScreen(this.screenToView(point));

    const world = out || [0, 0];
    world[0] =
      (view[0] - this.camera.offset[0] * this.camera.scale[0]) /
      this.camera.scale[0];
    world[1] =
      (view[1] - this.camera.offset[1] * this.camera.scale[1]) /
      this.camera.scale[1];

    // If this is a custom camera, we must actually project our world point to the screen
    if (this.viewCamera.type === ViewCameraType.CUSTOM) {
      console.warn("Custom View Camera projections not supported yet");
    }

    return world;
  }

  worldToScreen(point: Vec2, out?: Vec2) {
    const screen: Vec2 = [0, 0];

    // Calculate from the camera to view space
    screen[0] =
      (point[0] * this.camera.scale[0] +
        this.camera.offset[0] * this.camera.scale[0]) *
      this.pixelRatio;
    screen[1] =
      (point[1] * this.camera.scale[1] +
        this.camera.offset[1] * this.camera.scale[1]) *
      this.pixelRatio;

    // If this is a custom camera, we must actually project our world point to the screen
    if (this.viewCamera.type === ViewCameraType.CUSTOM) {
      console.warn("Custom View Camera projections not supported yet");
    }

    // Convert from view to screen space
    return this.viewToScreen(screen, out);
  }

  viewToWorld(point: Vec2, out?: Vec2) {
    const world = out || [0, 0];

    const screen = this.pixelSpaceToScreen(point);
    world[0] =
      (screen[0] - this.camera.offset[0] * this.camera.scale[0]) /
      this.camera.scale[0];
    world[1] =
      (screen[1] - this.camera.offset[1] * this.camera.scale[1]) /
      this.camera.scale[1];

    // If this is a custom camera, we must actually project our world point to the screen
    if (this.viewCamera.type === ViewCameraType.CUSTOM) {
      console.warn("Custom View Camera projections not supported yet");
    }

    return world;
  }

  worldToView(point: Vec2, out?: Vec2) {
    const screen = out || [0, 0];

    // Calculate from the camera to view space
    screen[0] =
      point[0] * this.camera.scale[0] +
      this.camera.offset[0] * this.camera.scale[0];
    screen[1] =
      point[1] * this.camera.scale[1] +
      this.camera.offset[1] * this.camera.scale[1];

    // If this is a custom camera, we must actually project our world point to the screen
    if (this.viewCamera.type === ViewCameraType.CUSTOM) {
      console.warn("Custom View Camera projections not supported yet");
    }

    return screen;
  }

  /**
   * This operation makes sure we have the view camera adjusted to the new viewport's needs.
   * For default behavior this ensures that the coordinate system has no distortion, orthographic,
   * top left as 0,0 with +y axis pointing down.
   */
  fitViewtoViewport(surfaceDimensions: Bounds) {
    if (
      this.viewCamera.type === ViewCameraType.CONTROLLED &&
      isOrthographic(this.viewCamera.baseCamera)
    ) {
      const viewBounds = getAbsolutePositionBounds<View>(
        this.viewport,
        surfaceDimensions,
        this.pixelRatio
      );

      const width = viewBounds.width;
      const height = viewBounds.height;

      const viewport = {
        bottom: -height / 2,
        far: 10000000,
        left: -width / 2,
        near: -100,
        right: width / 2,
        top: height / 2
      };

      const scaleX = 1;
      const scaleY = 1;
      const camera = this.viewCamera.baseCamera;

      Object.assign(camera, viewport);
      camera.position.set(
        -viewBounds.width / 2.0 * scaleX,
        viewBounds.height / 2.0 * scaleY,
        camera.position.z
      );
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
        y: this.viewBounds.y / this.pixelRatio
      });
    } else if (!isOrthographic(this.viewCamera.baseCamera)) {
      console.warn(
        "Fit to viewport does not support non-orthographic cameras as a default behavior."
      );
    }
  }
}
