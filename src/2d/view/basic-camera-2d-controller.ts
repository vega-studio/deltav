import { SimpleEventHandler } from "../../event-management/simple-event-handler";
import {
  IMouseInteraction,
  ISingleTouchInteraction,
  ITouchInteraction
} from "../../event-management/types";
import { Bounds } from "../../primitives/bounds";
import { IViewProps, View } from "../../surface/view";
import { IProjection } from "../../types";
import {
  add3,
  AutoEasingMethod,
  copy3,
  divide2,
  divide3,
  length2,
  max3,
  min3,
  scale3,
  subtract2,
  subtract3,
  touchesContainsStartView,
  touchesHasStartView,
  uid,
  Vec2,
  Vec3,
  vec3
} from "../../util";
import { Camera2D } from "./camera-2d";

/**
 * Anchor options for the controller
 */
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
  worldBounds: Bounds<any>;
}

export interface IBasicCamera2DControllerOptions {
  /** Takes in the options to be used for creating a new ViewBounds object on this controller. */
  bounds?: ICameraBoundsOptions;
  /** This is the camera this controller will manipulate */
  camera: Camera2D;
  /** When this is set to true, the start view can be targetted even when behind other views */
  ignoreCoverViews?: boolean;
  /**
   * This is a handler for when the camera has applied changes to the visible range of what is seen.
   * Which most likely means offset or scale has been altered.
   */
  onRangeChanged?(camera: Camera2D, targetView: View<IViewProps>): void;
  /**
   * This provides a control to filter panning that will be applied to the camera. The input and
   * output of this will be the delta value to be applied.
   */
  panFilter?(
    offset: [number, number, number],
    view: View<IViewProps>,
    allViews: View<IViewProps>[]
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
    view: View<IViewProps>,
    allViews: View<IViewProps>[]
  ): [number, number, number];
  /**
   * This is the view that MUST be the start view from the events.
   * If not provided, then dragging anywhere will adjust the camera.
   * This MUST be set for onRangeChange to broadcast animated camera movements.
   */
  startView?: string | string[];
  /** When this is set, it will require two fingers to be down at minimum to pan the camera */
  twoFingerPan?: boolean;
  /**
   * This specifies whether a view can be scrolled by wheel
   * If this is not specified or set false, the view can be zoomed by wheel
   */
  wheelShouldScroll?: boolean;
}

/**
 * This provides some very basic common needs for a camera control system. This is not a total solution
 * for every scenario. This should just often handle most basic needs.
 */
export class BasicCamera2DController extends SimpleEventHandler {
  /** Unique identifier of this controller */
  get uid() {
    return this._uid;
  }
  private _uid = uid();
  /**
   * If total bounds of worldbounds + screenpadding is smaller
   * than width or height of view, anchor dictates placement.
   */
  bounds?: ICameraBoundsOptions;
  /** This is the camera that this controller will manipulate */
  get camera() {
    return this._camera;
  }
  private _camera: Camera2D;
  /** When this is set to true, the start view can be targetted even when behind other views */
  ignoreCoverViews?: boolean;
  /** Informative property indicating the controller is panning the chart or not */
  isPanning: boolean = false;
  /** Informative property indicationt he controller is scaling via touch gesture */
  isScaling: boolean = false;
  /** This is the filter applied to panning operations */
  private panFilter = (
    offset: [number, number, number],
    _view: View<IViewProps>,
    _allViews: View<IViewProps>[]
  ) => offset;
  /** The rate scale is adjusted with the mouse wheel */
  scaleFactor: number;
  /** This is the filter applied to tscaling operations */
  private scaleFilter = (
    scale: [number, number, number],
    _view: View<IViewProps>,
    _allViews: View<IViewProps>[]
  ) => scale;
  /** The view that must be the start or focus of the interactions in order for the interactions to occur */
  startViews: string[] = [];
  /** Whether a view can be scrolled by wheel */
  wheelShouldScroll: boolean;
  /** Indicates if panning will happen with two or more fingers down instead of one */
  twoFingerPan: boolean;
  /** Stores the views this controller has flagged for optimizing */
  private optimizedViews = new Set<View<IViewProps>>();
  /** The animation used to immediately position the camera */
  private cameraImmediateAnimation = AutoEasingMethod.immediate<Vec3>(0);
  /** This is the identifier of the primary touch controlling panning */
  private targetTouches = new Set<number>();

  /**
   * If an unconvered start view is not available, this is the next available covered view, if present
   */
  private coveredStartView: View<IViewProps>;
  /**
   * Callback for when the range has changed for the camera in a view
   */
  private onRangeChanged = (_camera: Camera2D, _targetView: IProjection) => {
    /* no-op */
  };

  /**
   * This flag is set to true when a start view is targetted on mouse down even if it is not
   * the top most view.
   */
  private startViewDidStart: boolean = false;

  constructor(options: IBasicCamera2DControllerOptions) {
    super({});

    if (options.bounds) {
      this.setBounds(options.bounds);
    }

    this._camera = options.camera;
    this.scaleFactor = options.scaleFactor || 1000.0;
    this.ignoreCoverViews = options.ignoreCoverViews || false;
    this.twoFingerPan = options.twoFingerPan || false;

    if (options.startView) {
      if (Array.isArray(options.startView)) {
        this.startViews = options.startView;
        this._camera.control2D.setViewChangeHandler(
          this.handleCameraViewChange
        );
      } else {
        this.startViews = [options.startView];
        this._camera.control2D.setViewChangeHandler(
          this.handleCameraViewChange
        );
      }
    }

    this.panFilter = options.panFilter || this.panFilter;
    this.scaleFilter = options.scaleFilter || this.scaleFilter;
    this.onRangeChanged = options.onRangeChanged || this.onRangeChanged;

    if (options.wheelShouldScroll) {
      this.wheelShouldScroll = options.wheelShouldScroll;
    }
  }

  /**
   * Corrects camera offset to respect the current bounds and anchor.
   */
  applyBounds = () => {
    if (this.bounds && this.camera) {
      const targetView = this.getView(this.bounds.view);
      this.applyScaleBounds();

      // Next bound the positioning
      if (targetView) {
        this.camera.control2D.getOffset()[0] = this.boundsHorizontalOffset(
          targetView,
          this.bounds
        );

        this.camera.control2D.getOffset()[1] = this.boundsVerticalOffset(
          targetView,
          this.bounds
        );
      }
    }
  };

  /**
   * Corrects camera scale to respect the current bounds and anchor.
   */
  applyScaleBounds = () => {
    if (this.camera && this.bounds) {
      // First bound the scaling
      if (this.bounds.scaleMin) {
        this.camera.control2D.setScale(
          max3(this.camera.control2D.getScale(), this.bounds.scaleMin)
        );
      }

      if (this.bounds.scaleMax) {
        this.camera.control2D.setScale(
          min3(this.camera.control2D.getScale(), this.bounds.scaleMax)
        );
      }
    }
  };

  /**
   * Calculation for adhering to an anchor - x-axis offset only.
   */
  anchoredByBoundsHorizontal(
    targetView: View<IViewProps>,
    bounds: ICameraBoundsOptions
  ) {
    switch (bounds.anchor) {
      case CameraBoundsAnchor.TOP_LEFT:
      case CameraBoundsAnchor.MIDDLE_LEFT:
      case CameraBoundsAnchor.BOTTOM_LEFT:
        return -(
          bounds.worldBounds.left -
          bounds.screenPadding.left / this.camera.control2D.getScale()[0]
        );

      case CameraBoundsAnchor.TOP_MIDDLE:
      case CameraBoundsAnchor.MIDDLE:
      case CameraBoundsAnchor.BOTTOM_MIDDLE:
        return -(
          bounds.worldBounds.right -
          bounds.worldBounds.width / 2 -
          0.5 *
            ((targetView.screenBounds.width + bounds.screenPadding.right) /
              this.camera.control2D.getScale()[0])
        );

      case CameraBoundsAnchor.TOP_RIGHT:
      case CameraBoundsAnchor.MIDDLE_RIGHT:
      case CameraBoundsAnchor.BOTTOM_RIGHT:
        return -(
          bounds.worldBounds.right -
          (targetView.screenBounds.width - bounds.screenPadding.right) /
            this.camera.control2D.getScale()[0]
        );
    }
  }

  /**
   * Calculation for adhering to an anchor - y-axis offset only.
   */
  anchoredByBoundsVertical(
    targetView: View<IViewProps>,
    bounds: ICameraBoundsOptions
  ) {
    switch (bounds.anchor) {
      case CameraBoundsAnchor.TOP_LEFT:
      case CameraBoundsAnchor.TOP_MIDDLE:
      case CameraBoundsAnchor.TOP_RIGHT:
        return -(
          bounds.worldBounds.top -
          bounds.screenPadding.top / this.camera.control2D.getScale()[1]
        );

      case CameraBoundsAnchor.MIDDLE_LEFT:
      case CameraBoundsAnchor.MIDDLE:
      case CameraBoundsAnchor.MIDDLE_RIGHT:
        return -(
          bounds.worldBounds.bottom -
          bounds.worldBounds.height / 2 -
          0.5 *
            ((targetView.screenBounds.height + bounds.screenPadding.bottom) /
              this.camera.control2D.getScale()[1])
        );

      case CameraBoundsAnchor.BOTTOM_LEFT:
      case CameraBoundsAnchor.BOTTOM_MIDDLE:
      case CameraBoundsAnchor.BOTTOM_RIGHT:
        return -(
          bounds.worldBounds.bottom -
          (targetView.screenBounds.height - bounds.screenPadding.bottom) /
            this.camera.control2D.getScale()[1]
        );
    }
  }

  /**
   * Returns offset on x-axis due to current bounds and anchor.
   */
  boundsHorizontalOffset(
    targetView: View<IViewProps>,
    bounds: ICameraBoundsOptions
  ) {
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
          this.camera.control2D.getScale()[0]
      );
    }

    if (
      worldTLinScreenSpace[0] >
      targetView.screenBounds.left + bounds.screenPadding.left
    ) {
      return (
        -bounds.worldBounds.left +
        bounds.screenPadding.left / this.camera.control2D.getScale()[0]
      );
    }

    return this.camera.control2D.getOffset()[0];
  }

  /**
   * Returns offset on y-axis due to current bounds and anchor.
   */
  boundsVerticalOffset(
    targetView: View<IViewProps>,
    bounds: ICameraBoundsOptions
  ) {
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
          this.camera.control2D.getScale()[1]
      );
    }

    if (
      worldTLinScreenSpace[1] >
      targetView.screenBounds.top + bounds.screenPadding.top
    ) {
      return (
        -bounds.worldBounds.top +
        bounds.screenPadding.top / this.camera.control2D.getScale()[0]
      );
    }

    return this.camera.control2D.getOffset()[1];
  }

  private canStart(viewId: string) {
    return (
      this.startViews.length === 0 ||
      (this.startViews && this.startViews.indexOf(viewId) > -1) ||
      (this.startViewDidStart && this.ignoreCoverViews)
    );
  }

  /**
   * Centers the camera on a position. Must provide a reference view.
   */
  centerOn(viewId: string, position: Vec3) {
    if (!this.camera.control2D.surface) return;

    const viewBounds = this.camera.control2D.surface.getViewSize(viewId);
    if (!viewBounds) return;
    const midScreen: Vec3 = [viewBounds.width / 2, viewBounds.height / 2, 0];
    const fromScreenCenter: Vec3 = subtract3(
      position,
      divide3(midScreen, this.camera.control2D.getScale())
    );

    const newOffset = scale3(fromScreenCenter, -1);

    this.setOffset(viewId, newOffset);
  }

  /**
   * Performs the panning operation for the camera
   *
   * @param allViews This is all of the related views under the event interactions
   * @param relativeView This is the view that performs the projections related to the operation
   * @param allViews All the views associated with the operation or event interaction
   * @param delta This is the amount of panning being requested to happen
   */
  private doPan(
    allViews: View<IViewProps>[],
    relativeView: View<IViewProps>,
    delta: [number, number]
  ) {
    let pan: Vec3 = vec3(divide2(delta, this.camera.control2D.getScale()), 0);

    if (this.panFilter) {
      pan = this.panFilter(pan, relativeView, allViews);
    }

    this.camera.control2D.getOffset()[0] += pan[0];
    this.camera.control2D.getOffset()[1] += pan[1];

    // Add additional correction for bounds
    this.applyBounds();
    // Broadcast the change occurred
    this.onRangeChanged(this.camera, relativeView);
    // Add additional correction for bounds
    this.applyBounds();
    // Indicate the camera needs a refresh
    this.camera.control2D.update();
  }

  /**
   * Scales the camera relative to a point and a view.
   *
   * @param focalPoint The point the scaling happens around
   * @param targetView The relative view this operation happens in relation to
   * @param deltaScale The amount of scaling per axis that should happen
   */
  private doScale(
    focalPoint: Vec2,
    targetView: View<IViewProps>,
    allViews: View<IViewProps>[],
    deltaScale: Vec3
  ) {
    const beforeZoom = targetView.screenToWorld(focalPoint);
    const currentZoomX = this.camera.control2D.getScale()[0] || 1.0;
    const currentZoomY = this.camera.control2D.getScale()[1] || 1.0;

    if (this.scaleFilter) {
      deltaScale = this.scaleFilter(deltaScale, targetView, allViews);
    }

    this.camera.control2D.getScale()[0] = currentZoomX + deltaScale[0];
    this.camera.control2D.getScale()[1] = currentZoomY + deltaScale[1];

    // Ensure the new scale values are within bounds before attempting to correct offsets
    this.applyScaleBounds();

    const afterZoom = targetView.screenToWorld(focalPoint);
    const deltaZoom = subtract2(beforeZoom, afterZoom);
    this.camera.control2D.getOffset()[0] -= deltaZoom[0];
    this.camera.control2D.getOffset()[1] -= deltaZoom[1];

    // Add additional correction for bounds
    this.applyBounds();
    // Broadcast the change occurred
    this.onRangeChanged(this.camera, targetView);
    // Add additional correction for bounds
    this.applyBounds();

    // Make sure the camera updates
    this.camera.control2D.update();
    // Set the immediate animation AFTER setting so we don't get the offset to immediately jump
    // to the end
    this.camera.control2D.animation = this.cameraImmediateAnimation;
  }

  /**
   * This filters a set of touches to be touches that had a valid starting view interaction.
   */
  filterTouchesByValidStart(touches: ISingleTouchInteraction[]) {
    // If we ignore cover views, then the touches only have to contain a start view upon touch down
    if (this.ignoreCoverViews) {
      return touches.filter(touchesContainsStartView(this.startViews));
    }

    // Otherwise, the start touch has to be the primary start view
    else {
      return touches.filter(touchesHasStartView(this.startViews));
    }
  }

  /**
   * Finds a view within the event that matches a start view even if the view is covered by other views at the event's
   * interaction point.
   */
  private findCoveredStartView(e: IMouseInteraction) {
    const found = e.target.views.find(
      under => this.startViews.indexOf(under.view.id) > -1
    );
    this.startViewDidStart = Boolean(found);

    if (found) {
      this.coveredStartView = found.view;
    }
  }

  /**
   * Evaluates the world bounds the specified view is observing
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  getRange(viewId: string): Bounds<never> {
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
  handleMouseDown(e: IMouseInteraction) {
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
   * Aids in understanding how the user is interacting with the views. If a single touch is present, we're panning.
   * If multiple touches are present, we're panning and we're zooming
   */
  handleTouchDown(e: ITouchInteraction) {
    if (this.startViews) {
      const validTouches = this.filterTouchesByValidStart(e.allTouches);

      if (this.twoFingerPan) {
        if (validTouches.length > 1) {
          this.isPanning = true;
        }
      } else {
        if (validTouches.length > 0) {
          this.isPanning = true;
        }
      }

      if (validTouches.length > 1) {
        this.isScaling = true;
      }

      for (let i = 0, iMax = validTouches.length; i < iMax; ++i) {
        const touch = validTouches[i];
        this.targetTouches.add(touch.touch.touch.identifier);
      }
    }
  }

  /**
   * Used to aid in handling the pan effect. Stops panning operations for the
   */
  handleMouseUp(_e: IMouseInteraction) {
    this.startViewDidStart = false;
    this.isPanning = false;
    this.optimizedViews.forEach(view => (view.optimizeRendering = false));
    this.optimizedViews.clear();
  }

  /**
   * Used to stop panning and scaling effects
   */
  handleTouchUp(e: ITouchInteraction) {
    e.touches.forEach(touch => {
      this.targetTouches.delete(touch.touch.touch.identifier);

      if (this.targetTouches.size <= 0) {
        this.startViewDidStart = false;
        this.isPanning = false;
        this.optimizedViews.forEach(view => (view.optimizeRendering = false));
        this.optimizedViews.clear();
      }
    });

    this.isPanning = false;
    this.isScaling = false;

    if (this.targetTouches.size > 0) {
      this.isPanning = true;
    }

    if (this.targetTouches.size > 1) {
      this.isScaling = true;
    }
  }

  /**
   * Used to stop panning and scaling effects when touches are forcibly ejected from existence.
   */
  handleTouchCancelled(e: ITouchInteraction) {
    e.touches.forEach(touch => {
      this.targetTouches.delete(touch.touch.touch.identifier);

      if (this.targetTouches.size <= 0) {
        this.startViewDidStart = false;
        this.isPanning = false;
        this.optimizedViews.forEach(view => (view.optimizeRendering = false));
        this.optimizedViews.clear();
      }
    });

    this.isPanning = false;
    this.isScaling = false;

    if (this.targetTouches.size > 0) {
      this.isPanning = true;
    }

    if (this.targetTouches.size > 1) {
      this.isScaling = true;
    }
  }

  /**
   * Applies a panning effect by adjusting the camera's offset.
   */
  handleDrag(e: IMouseInteraction) {
    if (e.start) {
      if (this.canStart(e.start.view.id)) {
        e.target.views.forEach(view => {
          view.view.optimizeRendering = true;
          this.optimizedViews.add(view.view);
        });

        // Panning the camera will always be immediate
        this.doPan(
          e.target.views.map(v => v.view),
          e.start.view,
          e.mouse.deltaPosition
        );
        // Set the immediate animation AFTER setting so we don't get the offset to immediately jump
        // to the end
        this.camera.control2D.animation = this.cameraImmediateAnimation;
      }
    }
  }

  /**
   * Applies panning effect from single or multitouch interaction.
   */
  handleTouchDrag(e: ITouchInteraction) {
    const validTouches = this.filterTouchesByValidStart(e.allTouches);

    if (validTouches.length > 0 && this.isPanning) {
      for (let i = 0, iMax = validTouches.length; i < iMax; ++i) {
        const targetTouch = validTouches[i];

        targetTouch.target.views.forEach(view => {
          view.view.optimizeRendering = true;
          this.optimizedViews.add(view.view);
        });
      }

      // The relative view will be the view that was touched first.
      // We also gather all relatedviews during this search.
      const allViews = new Set<View<IViewProps>>();
      const firstTouch = validTouches.reduce((p, n) => {
        for (let i = 0, iMax = n.target.views.length; i < iMax; ++i) {
          const v = n.target.views[i];
          allViews.add(v.view);
        }

        return n.touch.startTime < p.touch.startTime ? n : p;
      }, validTouches[0]);

      const relativeView = firstTouch.start.view;

      if (this.isPanning) {
        // Panning the camera will always be immediate
        this.doPan(
          Array.from(allViews.values()),
          relativeView,
          e.multitouch.centerDelta(validTouches)
        );
        // Set the immediate animation AFTER setting so we don't get the offset to immediately jump
        // to the end
        this.camera.control2D.animation = this.cameraImmediateAnimation;
      }

      // Now we handle the magic of pinch to zoom. To make this 'feel' right the gesture needs to scale the surface so
      // that (in the case of two fingers) the fingers will remain on the world coordinates of what they were touching
      // throughout the scaling experience.
      if (this.isScaling) {
        // We must get the centroid of the touches for the current event
        const currentWorldCenter = e.multitouch.center(validTouches);

        // We must also calculate the current frame's distance from the centroid to compare against the previous frame's
        const currentCenterToTouch = subtract2(
          validTouches[0].touch.currentPosition,
          currentWorldCenter
        );

        // We must get the centroid of the touches for the previous known event
        const previousWorldCenter = subtract2(
          currentWorldCenter,
          e.multitouch.centerDelta(validTouches)
        );

        // We must now calculate how far our touch in the previous frame was from our current frame
        const previousCenterToTouch = subtract2(
          validTouches[0].touch.previousPosition,
          previousWorldCenter
        );

        // This is how much scaling it takes to get from the previous touch to the current touch relative to the vectors
        // per axis
        const scaleToCurrentTouch =
          length2(currentCenterToTouch) / length2(previousCenterToTouch);

        const deltaScale: Vec3 = [
          scaleToCurrentTouch * this.camera.scale2D[0] - this.camera.scale2D[0],
          scaleToCurrentTouch * this.camera.scale2D[1] - this.camera.scale2D[1],
          0
        ];

        if (scaleToCurrentTouch !== 1) {
          this.doScale(
            currentWorldCenter,
            relativeView,
            Array.from(allViews.values()),
            deltaScale
          );
        }
      }
    }
  }

  /**
   * Applies a scaling effect to the camera for mouse wheel events
   */
  handleWheel(e: IMouseInteraction) {
    // Every mouse wheel event must look to see if it's over a valid covered start view
    this.findCoveredStartView(e);

    if (this.canStart(e.target.view.id)) {
      if (this.wheelShouldScroll) {
        const deltaPosition: [number, number] = [
          -e.mouse.wheel.delta[0],
          e.mouse.wheel.delta[1]
        ];

        if (e.start) {
          this.doPan(
            e.target.views.map(v => v.view),
            e.start.view,
            deltaPosition
          );
        }
      } else {
        const currentZoomX = this.camera.control2D.getScale()[0] || 1.0;
        const currentZoomY = this.camera.control2D.getScale()[1] || 1.0;
        const targetView = this.getTargetView(e);

        const deltaScale: [number, number, number] = [
          e.mouse.wheel.delta[1] / this.scaleFactor * currentZoomX,
          e.mouse.wheel.delta[1] / this.scaleFactor * currentZoomY,
          1
        ];

        this.doScale(
          e.screen.position,
          targetView,
          e.target.views.map(v => v.view),
          deltaScale
        );
      }
    }
  }

  /**
   * Handles changes broadcasted by the camera
   */
  private handleCameraViewChange = (cam: Camera2D, viewId: string) => {
    if (viewId !== this.startViews[0]) return;
    const projections = cam.surface.getProjections(viewId);
    if (!projections) return;
    this.onRangeChanged(cam, projections);
  };

  /**
   * Retrieves the current pan of the controlled camera
   */
  get pan(): Vec3 {
    return this.camera.control2D.offset;
  }

  /**
   * Retrieves the current scale of the camera
   */
  get scale(): Vec3 {
    return this.camera.control2D.getScale();
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
   * Tells the controller to set an explicit offset for the camera.
   * Must provide a reference view.
   */
  setOffset(viewId: string, offset: Vec3) {
    const startOffset = copy3(this.camera.control2D.offset);

    this.camera.control2D.getOffset()[0] = offset[0];
    this.camera.control2D.getOffset()[1] = offset[1];
    this.camera.control2D.getOffset()[2] = offset[2];

    // Add additional correction for bounds
    this.applyBounds();

    // Broadcast the change occurred
    if (this.camera.control2D.surface) {
      const projections = this.camera.control2D.surface.getProjections(viewId);

      if (projections) {
        this.onRangeChanged(this.camera, projections);
      }
    }

    // Add additional correction for bounds
    this.applyBounds();
    const newOffset = copy3(this.camera.control2D.getOffset());

    const currentAnimation = this.camera.control2D.animation;
    this.camera.control2D.setOffset(startOffset);
    this.camera.control2D.animation = this.cameraImmediateAnimation;
    this.camera.control2D.setOffset(newOffset);
    this.camera.control2D.animation = currentAnimation;
  }

  /**
   * This lets you set the visible range of a view based on the view's camera. This will probably not work
   * as expected if the view indicated and this controller do not share the same camera.
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  setRange(newWorld: Bounds<{}>, viewId: string) {
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
        this.camera.control2D.getScale()
      );

      this.camera.control2D.setScale(
        add3(
          this.camera.control2D.getScale(),
          this.scaleFilter(deltaScale, view, [view])
        )
      );

      const deltaPan = subtract3(
        [-newWorld.x, -newWorld.y, 0],
        this.camera.control2D.offset
      );

      this.camera.control2D.setOffset(
        add3(
          this.camera.control2D.offset,
          this.scaleFilter(deltaPan, view, [view])
        )
      );

      // Bound the camera to the specified bounding range
      this.applyBounds();
      // Broadcast the change occurred
      this.onRangeChanged(this.camera, view);
      // Bound the camera to the specified bounding range
      this.applyBounds();
    }
  }

  /**
   * Applies a handler for the range changing.
   */
  setRangeChangeHandler(handler: BasicCamera2DController["onRangeChanged"]) {
    this.onRangeChanged = handler;
  }
}
