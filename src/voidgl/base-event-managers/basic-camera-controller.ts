import { Bounds } from '../primitives/bounds';
import { EventManager } from '../surface/event-manager';
import { IDragMetrics, IMouseInteraction, IWheelMetrics } from '../surface/mouse-event-manager';
import { View } from '../surface/view';
import { add3, subtract3 } from '../util';
import { ChartCamera } from '../util/chart-camera';
export enum CameraBoundsAnchor {
  TOP_LEFT,
  TOP_MIDDLE,
  TOP_RIGHT,
  MIDDLE_LEFT,
  MIDDLE,
  MIDDLE_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_MIDDLE,
  BOTTOM_RIGHT,
}

export interface ICameraBoundsOptions {
  worldBounds: Bounds;
  screenPadding: {left: number, right: number, top: number, bottom: number};
  anchor: CameraBoundsAnchor;
  view: String
}
export interface IBasicCameraControllerOptions {
  /** Takes in the options to be used for creating a new ViewBounds object on this controller. */
  bounds?: ICameraBoundsOptions;
  /** This is the camera this controller will manipulate */
  camera: ChartCamera;
  /** When this is set to true, the start view can be targetted even when behind other views */
  ignoreCoverViews?: boolean;
  /**
   * This provides a control to filter panning that will be applied to the camera. The input and
   * output of this will be the delta value to be applied.
   */
  panFilter?(offset: [number, number, number], view: View, allViews: View[]): [number, number, number];
  /**
   * This adjusts how fast scaling is applied from the mouse wheel
   */
  scaleFactor?: number;
  /**
   * This provides a control to filter scaling that will be applied to the camera. The input and
   * output of this will be the delta value to be applied.
   */
  scaleFilter?(scale: [number, number, number], view: View, allViews: View[]): [number, number, number];
  /**
   * This is the view that MUST be the start view from the events.
   * If not provided, then dragging anywhere will adjust the camera
   */
  startView?: string | string[];

  /**
   * This is a handler for when the camera has applied changes to the visible range of what is seen.
   * Which most likely means offset or scale has been altered.
   */
  onRangeChanged?(camera: ChartCamera, targetView: View): void;
}

/**
 * This provides some very basic common needs for a camera control system. This is not a total solution
 * very every scenario. This should just often handle most basic needs.
 */
export class BasicCameraController extends EventManager {
  /**
   * If total bounds of worldbounds + screenpadding is smaller
   * than width or height of view, anchor dictates placement.
   */
  bounds: ICameraBoundsOptions;
  /** This is the camera that this controller will manipulate */
  camera: ChartCamera;
  /** When this is set to true, the start view can be targetted even when behind other views */
  ignoreCoverViews?: boolean;
  /** Informative property indicating the controller is panning the chart or not */
  isPanning: boolean = false;
  /** This is the filter applied to panning operations */
  private panFilter = (offset: [number, number, number], view: View, allViews: View[]) => offset;
  /** The rate scale is adjusted with the mouse wheel */
  scaleFactor: number;
  /** THis is the filter applied to tscaling operations */
  private scaleFilter = (scale: [number, number, number], view: View, allViews: View[]) => scale;
  /** The view that must be the start or focus of the interactions in order for the interactions to occur */
  startViews: string[] | undefined;

  /**
   * This flag is set to true when a start view is targetted on mouse down even if it is not
   * the top most view.
   */
  private startViewDidStart: boolean = false;
  /**
   * If an unconvered start view is not available, this is the next available covered view, if present
   */
  private coveredStartView: View;
  /**
   * Callback for when the range has changed for the camera in a view
   */
  private onRangeChanged = (camera: ChartCamera, targetView: View) => {/* no-op */};

  constructor(options: IBasicCameraControllerOptions) {
    super();
    this.setBounds(options.bounds);
    this.camera = options.camera;
    this.scaleFactor = options.scaleFactor || 1000.0;
    this.ignoreCoverViews = options.ignoreCoverViews || false;

    if (options.startView) {
      this.startViews = Array.isArray(options.startView) ? options.startView : [options.startView];
    }

    this.panFilter = options.panFilter || this.panFilter;
    this.scaleFilter = options.scaleFilter || this.scaleFilter;
    this.onRangeChanged = options.onRangeChanged || this.onRangeChanged;
  }

  /*
  * Sets bounds applicable to the supplied view.
  * If no view is supplied, it uses the first in the startViews array
  */
  setBounds(bounds: ICameraBoundsOptions, targetView?: View) {
    this.bounds = bounds;
    if (targetView) {
      this.applyBounds(targetView);
    }
    else if (this.startViews && this.startViews.length >= 1) {
      const targetView = this.getView(this.startViews[0]);
      this.applyBounds(targetView);
    }
  }

  get pan() {
    return this.camera.offset;
  }

  get scale() {
    return this.camera.scale;
  }

  canStart(viewId: string) {
    return (
      !this.startViews ||
      this.startViews.length === 0 ||
      (this.startViews && this.startViews.indexOf(viewId) > -1) ||
      this.startViewDidStart && this.ignoreCoverViews
    );
  }

  findCoveredStartView(e: IMouseInteraction) {
    const found = e.viewsUnderMouse.find(under => this.startViews.indexOf(under.view.id) > -1);
    this.startViewDidStart = Boolean(found);

    if (found) {
      this.coveredStartView = found.view;
    }
  }

  getTargetView(e: IMouseInteraction) {
    // If we have a start view and we do not ignore covering views,
    // Then our target view is the view we started with
    if (this.startViews && !this.ignoreCoverViews) {
      return e.target.view;
    }

    // Otherwise, we use the covered start view
    else {
      return this.coveredStartView;
    }
  }

  handleMouseDown(e: IMouseInteraction, button: number) {
    // We look for valid covered views on mouse down so dragging will work
    this.findCoveredStartView(e);
    // If this is a valid start view, then we enter a panning state with the mouse down
    this.isPanning = this.canStart(e.start.view.id);
  }

  handleMouseUp(e: IMouseInteraction) {
    this.startViewDidStart = false;
    this.isPanning = false;
  }

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    if (this.canStart(e.start.view.id)) {
      let pan : [number, number, number] = [(drag.screen.delta.x / this.camera.scale[0]),
        (drag.screen.delta.y / this.camera.scale[1]),
        0];

      if (this.panFilter) {
        pan = this.panFilter(pan, e.start.view, e.viewsUnderMouse.map(v => v.view));
      }

      this.camera.offset[0] += pan[0];
      this.camera.offset[1] += pan[1];

      // Add additional correction for bounds
      if (this.bounds && e.start.view.id === this.bounds.view) {
        this.applyBounds(e.start.view);
      }

      // Broadcast the change occurred
      this.onRangeChanged(this.camera, e.start.view);
    }
  }

  handleWheel(e: IMouseInteraction, wheelMetrics: IWheelMetrics) {
    // Every mouse wheel event must look to see if it's over a valid covered start view
    this.findCoveredStartView(e);

    if (this.canStart(e.target.view.id)) {
      const targetView = this.getTargetView(e);
      const beforeZoom = targetView.screenToWorld(e.screen.mouse);

      const currentZoomX = this.camera.scale[0] || 1.0;
      const currentZoomY = this.camera.scale[1] || 1.0;

      let scale: [number, number, number] = [wheelMetrics.wheel[1] / this.scaleFactor *
        currentZoomX, wheelMetrics.wheel[1] / this.scaleFactor * currentZoomY, 1];

      if (this.scaleFilter) {
        scale = this.scaleFilter(scale, targetView, e.viewsUnderMouse.map(v => v.view));
      }

      this.camera.scale[0] = currentZoomX + scale[0];
      this.camera.scale[1] = currentZoomY + scale[1];

      const afterZoom = targetView.screenToWorld(e.screen.mouse);
      this.camera.offset[0] -= (beforeZoom.x - afterZoom.x);
      this.camera.offset[1] -= (beforeZoom.y - afterZoom.y);

      // Add additional correction for bounds
      if (this.bounds && (targetView.id === this.bounds.view)) {
        this.applyBounds(targetView);
      }

      // Broadcast the change occurred
      this.onRangeChanged(this.camera, targetView);
    }
  }

  /*
  * Corrects camera offset to respect current bounds and anchor.
  */
  applyBounds(targetView: View) {
    this.camera.offset[0] = this.boundsHorizontalOffset(targetView);
    this.camera.offset[1] = this.boundsVerticalOffset(targetView);
  }

  /**
   * Returns offset on x-axis due to current bounds and anchor.
   */
  boundsHorizontalOffset(targetView: View) {
    const worldTLinScreenSpace =  targetView.worldToScreen({x: this.bounds.worldBounds.left, y: this.bounds.worldBounds.top});
    const worldBRinScreenSpace =  targetView.worldToScreen({x: this.bounds.worldBounds.right, y: this.bounds.worldBounds.bottom});

    const widthDifference =
      (worldBRinScreenSpace.x - worldTLinScreenSpace.x) +
      this.bounds.screenPadding.left +
      this.bounds.screenPadding.right -
      targetView.screenBounds.width;

    /* if the worldBounds are smaller than the screenBounds,
     we offset according to the anchoring */

    if (widthDifference < 0) {
      return this.anchoredByBoundsHorizontal(targetView);
    }

    if (worldBRinScreenSpace.x < (targetView.screenBounds.right - this.bounds.screenPadding.right)) {
      return (-this.bounds.worldBounds.right + (targetView.screenBounds.width - this.bounds.screenPadding.right) / this.camera.scale[0]);
    }

    if (worldTLinScreenSpace.x > (targetView.screenBounds.left + this.bounds.screenPadding.left)) {
      return (-this.bounds.worldBounds.left + (this.bounds.screenPadding.left / this.camera.scale[0]));
    }

    return this.camera.offset[0];
  }

  /**
   * Returns offset on y-axis due to current bounds and anchor.
   */
  boundsVerticalOffset(targetView: View) {
    const worldTLinScreenSpace =  targetView.worldToScreen({x: this.bounds.worldBounds.left, y: this.bounds.worldBounds.top});
    const worldBRinScreenSpace =  targetView.worldToScreen({x: this.bounds.worldBounds.right, y: this.bounds.worldBounds.bottom});

    const heightDifference =
      (worldBRinScreenSpace.y - worldTLinScreenSpace.y) +
      this.bounds.screenPadding.top +
      this.bounds.screenPadding.bottom -
      targetView.screenBounds.height;

    /* if the viewBounds are larger than the screenBounds,
     we offset according to the anchoring */
    if (heightDifference < 0) {
      return this.anchoredByBoundsVertical(targetView);
    }

    if (worldTLinScreenSpace.y > targetView.screenBounds.top - this.bounds.screenPadding.top) {
      return (-(this.bounds.worldBounds.top - (this.bounds.screenPadding.top / this.camera.scale[1])));
    }

    if (worldBRinScreenSpace.y < targetView.screenBounds.bottom + this.bounds.screenPadding.bottom) {
      return (-(this.bounds.worldBounds.bottom + ((-targetView.screenBounds.height + this.bounds.screenPadding.bottom) / this.camera.scale[1])));
    }

    return this.camera.offset[1];
  }

  /*
  * Calculation for adhering to an anchor - x-axis offset only.
  */
  anchoredByBoundsHorizontal(targetView: View) {
    switch (this.bounds.anchor) {
      case CameraBoundsAnchor.TOP_LEFT:
      case CameraBoundsAnchor.MIDDLE_LEFT:
      case CameraBoundsAnchor.BOTTOM_LEFT:
        return -(this.bounds.worldBounds.left -
          this.bounds.screenPadding.left / this.camera.scale[0]);

      case CameraBoundsAnchor.TOP_MIDDLE:
      case CameraBoundsAnchor.MIDDLE:
      case CameraBoundsAnchor.BOTTOM_MIDDLE:
        return -(this.bounds.worldBounds.right - (this.bounds.worldBounds.width / 2) -
          (0.5 * ((targetView.screenBounds.width + this.bounds.screenPadding.right) / this.camera.scale[0])));

      case CameraBoundsAnchor.TOP_RIGHT:
      case CameraBoundsAnchor.MIDDLE_RIGHT:
      case CameraBoundsAnchor.BOTTOM_RIGHT:
        return -(this.bounds.worldBounds.right - ((targetView.screenBounds.width - this.bounds.screenPadding.right) / this.camera.scale[0] ));
    }
  }

  /*
  * Calculation for adhering to an anchor - y-axis offset only.
  */
  anchoredByBoundsVertical(targetView: View) {
    switch (this.bounds.anchor) {
      case CameraBoundsAnchor.TOP_LEFT:
      case CameraBoundsAnchor.TOP_MIDDLE:
      case CameraBoundsAnchor.TOP_RIGHT:
        return -(this.bounds.worldBounds.top) -
          (-this.bounds.screenPadding.top  / this.scale[1]);

      case CameraBoundsAnchor.MIDDLE_LEFT:
      case CameraBoundsAnchor.MIDDLE:
      case CameraBoundsAnchor.MIDDLE_RIGHT:
        return -(this.bounds.worldBounds.bottom - (this.bounds.worldBounds.height / 2)) +
          ((0.5 * (targetView.screenBounds.height - this.bounds.screenPadding.bottom)  / this.scale[1]));

      case CameraBoundsAnchor.BOTTOM_LEFT:
      case CameraBoundsAnchor.BOTTOM_MIDDLE:
      case CameraBoundsAnchor.BOTTOM_RIGHT:
        return -(this.bounds.worldBounds.bottom -
          (targetView.screenBounds.height - this.bounds.screenPadding.bottom)  / this.scale[1]);
    }
  }

  // These are the currently Unused responses for this controller
  handleMouseOut(e: IMouseInteraction) { /*no-op*/ }
  handleClick(e: IMouseInteraction) { /*no-op*/ }
  handleMouseMove(e: IMouseInteraction) { /*no-op*/ }
  handleMouseOver(e: IMouseInteraction) { /*no-op*/ }

  /**
   * Evaluates the world bounds the specified view is observing
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  getRange(viewId: string) : Bounds {
    /** Get the projections for the provided view */
    const projection = this.getProjection(viewId);
    /** Get the bounds on the screen for the indicated view */
    const screenBounds = this.getViewScreenBounds(viewId);

    // Make sure we have a valid projection and screen bounds to make the adjustment
    if (projection && screenBounds) {
      /** Get the current viewed world bounds of the view */
      const topLeft = projection.screenToWorld(screenBounds);
      const bottomRight = projection.screenToWorld({ x: screenBounds.right, y: screenBounds.bottom });

      return new Bounds({
        height: bottomRight.y - topLeft.y,
        width: bottomRight.x - topLeft.x,
        x: topLeft.x,
        y: topLeft.y,
      });
    }

    return new Bounds({ x: 0, y: 0, width: 1, height: 1 });
  }

  /**
   * This lets you set the visible range of a view based on the view's camera. This will probably not work
   * as expected if the view indicated and this controller do not share the same camera.
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  setRange(newWorld: Bounds, viewId: string) {
    /** Get the projections for the provided view */
    const projection = this.getProjection(viewId);
    /** Get the bounds on the screen for the indicated view */
    const screenBounds = this.getViewScreenBounds(viewId);
    /** Get the view the range is being applied towards */
    const view = this.getView(viewId);

    // Make sure we have a valid projection and screen bounds to make the adjustment
    if (projection && screenBounds && view) {
      const deltaScale = subtract3(
        [
          screenBounds.width / newWorld.width,
          screenBounds.height / newWorld.height,
          1,
        ],
        this.camera.scale,
      );

      this.camera.scale = add3(
        this.camera.scale,
        this.scaleFilter(deltaScale, view, [view]),
      );

      const deltaPan = subtract3(
        [
          -newWorld.x,
          -newWorld.y,
          0,
        ],
        this.camera.offset,
      );

      this.camera.offset = add3(
        this.camera.offset,
        this.scaleFilter(deltaPan, view, [view]),
      );

      // Bound the camera to the specified bounding range
      this.applyBounds(view);

      // Broadcast the change occurred
      this.onRangeChanged(this.camera, view);
    }
  }
}
