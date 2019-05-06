import { Bounds } from "../primitives/bounds";
import { EventManager } from "../surface/event-manager";
import {
  IDragMetrics,
  IMouseInteraction,
  IWheelMetrics
} from "../surface/mouse-event-manager";
import { View } from "../surface/view";
import {
  add3,
  divide2,
  max3,
  min3,
  subtract2,
  subtract3,
  Vec3,
  vec3
} from "../util";
import { ChartCamera } from "../util/chart-camera";
export enum CameraBoundsAnchor {
  TOP_LEFT,
  TOP_MIDDLE,
  TOP_RIGHT,
  MIDDLE_LEFT,
  MIDDLE,
  MIDDLE_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_MIDDLE,
  BOTTOM_RIGHT
}

/**
 * This represents how the camera should be bounded in the world space. This gives enough information
 * to handle all cases of bounding, including screen padding and anchoring for cases where the viewed space
 * is smaller than the view.
 */
export interface ICameraBoundsOptions {
  /** How the bounded world space should anchor itself within the view when the projected world space to the screen is smaller than the view */
  anchor: CameraBoundsAnchor;
  /** Minimum settings the camera can scale to */
  scaleMin?: Vec3;
  /** Maximum settings the camera can scale to */
  scaleMax?: Vec3;
  /** The actual screen pixels the bounds can exceed when the camera's view has reached the bounds of the world */
  screenPadding: { left: number; right: number; top: number; bottom: number };
  /** This is the view for which the bounds applies towards */
  view: string;
  /** The area the camera is bound inside */
  worldBounds: Bounds;
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
  panFilter?(
    offset: [number, number, number],
    view: View,
    allViews: View[]
  ): [number, number, number];
  /**
   * This adjusts how fast scaling is applied from the mouse wheel
   */
  scaleFactor?: number;
  /**
   * This provides a control to filter scaling that will be applied to the camera. The input and
   * output of this will be the delta value to be applied.
   */
  scaleFilter?(
    scale: [number, number, number],
    view: View,
    allViews: View[]
  ): [number, number, number];
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
  /**
   * This specifies whether a view can be scrolled by wheel
   * If this is not specified or set false, the view can be zoomed by wheel
   */
  wheelShouldScroll?: boolean;
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
  bounds?: ICameraBoundsOptions;
  /** This is the camera that this controller will manipulate */
  camera: ChartCamera;
  /** When this is set to true, the start view can be targetted even when behind other views */
  ignoreCoverViews?: boolean;
  /** Informative property indicating the controller is panning the chart or not */
  isPanning: boolean = false;
  /** This is the filter applied to panning operations */
  private panFilter = (
    offset: [number, number, number],
    _view: View,
    _allViews: View[]
  ) => offset;
  /** The rate scale is adjusted with the mouse wheel */
  scaleFactor: number;
  /** THis is the filter applied to tscaling operations */
  private scaleFilter = (
    scale: [number, number, number],
    _view: View,
    _allViews: View[]
  ) => scale;
  /** The view that must be the start or focus of the interactions in order for the interactions to occur */
  startViews: string[] = [];
  /** Whether a view can be scrolled by wheel */
  wheelShouldScroll: boolean;
  /** Stores the views this controller has flagged for optimizing */
  private optimizedViews = new Set<View>();

  /**
   * If an unconvered start view is not available, this is the next available covered view, if present
   */
  private coveredStartView: View;
  /**
   * Callback for when the range has changed for the camera in a view
   */
  private onRangeChanged = (_camera: ChartCamera, _targetView: View) => {
    /* no-op */
  };

  /**
   * This flag is set to true when a start view is targetted on mouse down even if it is not
   * the top most view.
   */
  private startViewDidStart: boolean = false;

  constructor(options: IBasicCameraControllerOptions) {
    super();
    if (options.bounds) {
      this.setBounds(options.bounds);
    }
    this.camera = options.camera;
    this.scaleFactor = options.scaleFactor || 1000.0;
    this.ignoreCoverViews = options.ignoreCoverViews || false;

    if (options.startView) {
      this.startViews = Array.isArray(options.startView)
        ? options.startView
        : [options.startView];
    }

    this.panFilter = options.panFilter || this.panFilter;
    this.scaleFilter = options.scaleFilter || this.scaleFilter;
    this.onRangeChanged = options.onRangeChanged || this.onRangeChanged;

    if (options.wheelShouldScroll) {
      this.wheelShouldScroll = options.wheelShouldScroll;
    }
  }

  /**
   * Corrects camera offset to respect current bounds and anchor.
   */
  applyBounds = () => {
    if (this.bounds && this.camera) {
      const targetView = this.getView(this.bounds.view);
      this.applyScaleBounds();

      // Next bound the positioning
      if (targetView) {
        this.camera.offset[0] = this.boundsHorizontalOffset(
          targetView,
          this.bounds
        );

        this.camera.offset[1] = this.boundsVerticalOffset(
          targetView,
          this.bounds
        );
      }
    }
  };

  applyScaleBounds = () => {
    if (this.camera && this.bounds) {
      // First bound the scaling
      if (this.bounds.scaleMin) {
        this.camera.setScale(max3(this.camera.scale, this.bounds.scaleMin));
      }

      if (this.bounds.scaleMax) {
        this.camera.setScale(min3(this.camera.scale, this.bounds.scaleMax));
      }
    }
  };

  /**
   * Calculation for adhering to an anchor - x-axis offset only.
   */
  anchoredByBoundsHorizontal(targetView: View, bounds: ICameraBoundsOptions) {
    switch (bounds.anchor) {
      case CameraBoundsAnchor.TOP_LEFT:
      case CameraBoundsAnchor.MIDDLE_LEFT:
      case CameraBoundsAnchor.BOTTOM_LEFT:
        return -(
          bounds.worldBounds.left -
          bounds.screenPadding.left / this.camera.scale[0]
        );

      case CameraBoundsAnchor.TOP_MIDDLE:
      case CameraBoundsAnchor.MIDDLE:
      case CameraBoundsAnchor.BOTTOM_MIDDLE:
        return -(
          bounds.worldBounds.right -
          bounds.worldBounds.width / 2 -
          0.5 *
            ((targetView.screenBounds.width + bounds.screenPadding.right) /
              this.camera.scale[0])
        );

      case CameraBoundsAnchor.TOP_RIGHT:
      case CameraBoundsAnchor.MIDDLE_RIGHT:
      case CameraBoundsAnchor.BOTTOM_RIGHT:
        return -(
          bounds.worldBounds.right -
          (targetView.screenBounds.width - bounds.screenPadding.right) /
            this.camera.scale[0]
        );
    }
  }

  /**
   * Calculation for adhering to an anchor - y-axis offset only.
   */
  anchoredByBoundsVertical(targetView: View, bounds: ICameraBoundsOptions) {
    switch (bounds.anchor) {
      case CameraBoundsAnchor.TOP_LEFT:
      case CameraBoundsAnchor.TOP_MIDDLE:
      case CameraBoundsAnchor.TOP_RIGHT:
        return -(
          bounds.worldBounds.top -
          bounds.screenPadding.top / this.camera.scale[1]
        );

      case CameraBoundsAnchor.MIDDLE_LEFT:
      case CameraBoundsAnchor.MIDDLE:
      case CameraBoundsAnchor.MIDDLE_RIGHT:
        return -(
          bounds.worldBounds.bottom -
          bounds.worldBounds.height / 2 -
          0.5 *
            ((targetView.screenBounds.height + bounds.screenPadding.bottom) /
              this.camera.scale[1])
        );

      case CameraBoundsAnchor.BOTTOM_LEFT:
      case CameraBoundsAnchor.BOTTOM_MIDDLE:
      case CameraBoundsAnchor.BOTTOM_RIGHT:
        return -(
          bounds.worldBounds.bottom -
          (targetView.screenBounds.height - bounds.screenPadding.bottom) /
            this.camera.scale[1]
        );
    }
  }

  /**
   * Returns offset on x-axis due to current bounds and anchor.
   */
  boundsHorizontalOffset(targetView: View, bounds: ICameraBoundsOptions) {
    const worldTLinScreenSpace = targetView.worldToScreen([
      bounds.worldBounds.left,
      bounds.worldBounds.top
    ]);
    const worldBRinScreenSpace = targetView.worldToScreen([
      bounds.worldBounds.right,
      bounds.worldBounds.bottom
    ]);

    const widthDifference =
      worldBRinScreenSpace[0] -
      worldTLinScreenSpace[0] +
      bounds.screenPadding.left +
      bounds.screenPadding.right -
      targetView.screenBounds.width;

    // If the worldBounds are smaller than the screenBounds,
    // We offset according to the anchoring
    if (widthDifference < 0) {
      return this.anchoredByBoundsHorizontal(targetView, bounds);
    }

    if (
      worldBRinScreenSpace[0] <
      targetView.screenBounds.right - bounds.screenPadding.right
    ) {
      return (
        -bounds.worldBounds.right +
        (targetView.screenBounds.width - bounds.screenPadding.right) /
          this.camera.scale[0]
      );
    }

    if (
      worldTLinScreenSpace[0] >
      targetView.screenBounds.left + bounds.screenPadding.left
    ) {
      return (
        -bounds.worldBounds.left +
        bounds.screenPadding.left / this.camera.scale[0]
      );
    }

    return this.camera.offset[0];
  }

  /**
   * Returns offset on y-axis due to current bounds and anchor.
   */
  boundsVerticalOffset(targetView: View, bounds: ICameraBoundsOptions) {
    const worldTLinScreenSpace = targetView.worldToScreen([
      bounds.worldBounds.left,
      bounds.worldBounds.top
    ]);
    const worldBRinScreenSpace = targetView.worldToScreen([
      bounds.worldBounds.right,
      bounds.worldBounds.bottom
    ]);

    const heightDifference =
      worldBRinScreenSpace[1] -
      worldTLinScreenSpace[1] +
      bounds.screenPadding.top +
      bounds.screenPadding.bottom -
      targetView.screenBounds.height;

    // If the viewBounds are larger than the screenBounds,
    // We offset according to the anchoring
    if (heightDifference < 0) {
      return this.anchoredByBoundsVertical(targetView, bounds);
    }

    if (
      worldBRinScreenSpace[1] <
      targetView.screenBounds.bottom - bounds.screenPadding.bottom
    ) {
      return (
        -bounds.worldBounds.bottom +
        (targetView.screenBounds.height - bounds.screenPadding.bottom) /
          this.camera.scale[1]
      );
    }

    if (
      worldTLinScreenSpace[1] >
      targetView.screenBounds.top + bounds.screenPadding.top
    ) {
      return (
        -bounds.worldBounds.top +
        bounds.screenPadding.top / this.camera.scale[0]
      );
    }

    return this.camera.offset[1];
  }

  private canStart(viewId: string) {
    return (
      this.startViews.length === 0 ||
      (this.startViews && this.startViews.indexOf(viewId) > -1) ||
      (this.startViewDidStart && this.ignoreCoverViews)
    );
  }

  private findCoveredStartView(e: IMouseInteraction) {
    const found = e.viewsUnderMouse.find(
      under => this.startViews.indexOf(under.view.id) > -1
    );
    this.startViewDidStart = Boolean(found);

    if (found) {
      this.coveredStartView = found.view;
    }
  }

  private getTargetView(e: IMouseInteraction) {
    // If we have a start view and we do not ignore covering views,
    // Then our target view is the view we started with
    if (this.startViews && !this.ignoreCoverViews) {
      return e.target.view;
    } else {
      // Otherwise, we use the covered start view
      return this.coveredStartView;
    }
  }

  /**
   * Used to aid in handling the pan effect and determine the contextual view targetted.
   */
  handleMouseDown(e: IMouseInteraction, _button: number) {
    if (this.startViews) {
      // We look for valid covered views on mouse down so dragging will work
      this.findCoveredStartView(e);
      // If this is a valid start view, then we enter a panning state with the mouse down
      if (e.start) {
        this.isPanning = this.canStart(e.start.view.id) || this.isPanning;
      }
    }
  }

  /**
   * Used to aid in handling the pan effect
   */
  handleMouseUp(_e: IMouseInteraction) {
    this.startViewDidStart = false;
    this.isPanning = false;
    this.optimizedViews.forEach(view => (view.optimizeRendering = false));
    this.optimizedViews.clear();
  }

  private doPan(e: IMouseInteraction, view: View, delta: [number, number]) {
    let pan: Vec3 = vec3(divide2(delta, this.camera.scale), 0);

    if (this.panFilter) {
      pan = this.panFilter(pan, view, e.viewsUnderMouse.map(v => v.view));
    }

    this.camera.offset[0] += pan[0];
    this.camera.offset[1] += pan[1];

    // Add additional correction for bounds
    this.applyBounds();
    // Broadcast the change occurred
    if (e.start) this.onRangeChanged(this.camera, e.start.view);
    // Add additional correction for bounds
    this.applyBounds();
    // Indicate the camera needs a refresh
    this.camera.update();
  }

  /**
   * Applies a panning effect by adjusting the camera's offset.
   */
  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    if (e.start) {
      if (this.canStart(e.start.view.id)) {
        e.viewsUnderMouse.forEach(view => {
          view.view.optimizeRendering = true;
          this.optimizedViews.add(view.view);
        });

        this.doPan(e, e.start.view, drag.screen.delta);
      }
    }
  }

  /**
   * Applies a scaling effect to the camera for mouse wheel events
   */
  handleWheel(e: IMouseInteraction, wheelMetrics: IWheelMetrics) {
    // Every mouse wheel event must look to see if it's over a valid covered start view
    this.findCoveredStartView(e);

    if (this.canStart(e.target.view.id)) {
      if (this.wheelShouldScroll) {
        const deltaPosition: [number, number] = [
          -wheelMetrics.wheel[0],
          wheelMetrics.wheel[1]
        ];

        if (e.start) this.doPan(e, e.start.view, deltaPosition);
      } else {
        const targetView = this.getTargetView(e);
        const beforeZoom = targetView.screenToWorld(e.screen.mouse);
        const currentZoomX = this.camera.scale[0] || 1.0;
        const currentZoomY = this.camera.scale[1] || 1.0;

        let deltaScale: [number, number, number] = [
          wheelMetrics.wheel[1] / this.scaleFactor * currentZoomX,
          wheelMetrics.wheel[1] / this.scaleFactor * currentZoomY,
          1
        ];

        if (this.scaleFilter) {
          deltaScale = this.scaleFilter(
            deltaScale,
            targetView,
            e.viewsUnderMouse.map(v => v.view)
          );
        }

        this.camera.scale[0] = currentZoomX + deltaScale[0];
        this.camera.scale[1] = currentZoomY + deltaScale[1];

        // Ensure the new scale values are within bounds before attempting to correct offsets
        this.applyScaleBounds();

        const afterZoom = targetView.screenToWorld(e.screen.mouse);
        const deltaZoom = subtract2(beforeZoom, afterZoom);
        this.camera.offset[0] -= deltaZoom[0];
        this.camera.offset[1] -= deltaZoom[1];

        // Add additional correction for bounds
        this.applyBounds();
        // Broadcast the change occurred
        this.onRangeChanged(this.camera, targetView);
        // Add additional correction for bounds
        this.applyBounds();

        // Make sure the camera updates
        this.camera.update();
      }
    }
  }

  // These are the currently Unused responses for this controller
  handleMouseOut(_e: IMouseInteraction) {
    /*no-op*/
  }
  handleClick(_e: IMouseInteraction) {
    /*no-op*/
  }
  handleMouseMove(_e: IMouseInteraction) {
    /*no-op*/
  }
  handleMouseOver(_e: IMouseInteraction) {
    /*no-op*/
  }

  /**
   * Evaluates the world bounds the specified view is observing
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  getRange(viewId: string): Bounds {
    /** Get the projections for the provided view */
    const projection = this.getProjection(viewId);
    /** Get the bounds on the screen for the indicated view */
    const screenBounds = this.getViewScreenBounds(viewId);

    // Make sure we have a valid projection and screen bounds to make the adjustment
    if (projection && screenBounds) {
      /** Get the current viewed world bounds of the view */
      const topLeft = projection.screenToWorld([
        screenBounds.x,
        screenBounds.y
      ]);
      const bottomRight = projection.screenToWorld([
        screenBounds.right,
        screenBounds.bottom
      ]);

      return new Bounds({
        height: bottomRight[1] - topLeft[1],
        width: bottomRight[0] - topLeft[0],
        x: topLeft[0],
        y: topLeft[1]
      });
    }

    return new Bounds({ x: 0, y: 0, width: 1, height: 1 });
  }

  /**
   * Retrieves the current pan of the controlled camera
   */
  get pan(): Vec3 {
    return this.camera.offset;
  }

  /**
   * Sets bounds applicable to the supplied view.
   * If no view is supplied, it uses the first in the startViews array
   */
  setBounds(bounds: ICameraBoundsOptions) {
    this.bounds = bounds;
    this.applyBounds();
  }

  /**
   * Retrieves the current scale of the camera
   */
  get scale(): Vec3 {
    return this.camera.scale;
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
          1
        ],
        this.camera.scale
      );

      this.camera.setScale(
        add3(this.camera.scale, this.scaleFilter(deltaScale, view, [view]))
      );

      const deltaPan = subtract3(
        [-newWorld.x, -newWorld.y, 0],
        this.camera.offset
      );

      this.camera.setOffset(
        add3(this.camera.offset, this.scaleFilter(deltaPan, view, [view]))
      );

      // Bound the camera to the specified bounding range
      this.applyBounds();
      // Broadcast the change occurred
      this.onRangeChanged(this.camera, view);
      // Bound the camera to the specified bounding range
      this.applyBounds();
    }
  }
}
