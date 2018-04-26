import { EventManager } from '../surface/event-manager';
import { IDragMetrics, IMouseInteraction, IWheelMetrics } from '../surface/mouse-event-manager';
import { View } from '../surface/view';
import { ChartCamera } from '../util/chart-camera';

export interface IBasicCameraControllerOptions {
  /** This is the camera this controller will manipulate */
  camera: ChartCamera;
  /** When this is set to true, the start view can be targetted even when behind other views */
  ignoreCoverViews?: boolean;
  /**
   * This is a filter applied to the offset that comes from the chart camera.
   */
  filterPan?(panDelta: [number, number, number], view: View) : [number, number, number];
  /**
   * This is a filter applied to the scale that comes from the chart camera.
   */
  filterScale?(scaleDelta: [number, number, number], view: View): [number, number, number];

  /**
   * This adjusts how fast scaling is applied from the mouse wheel
   */
  scaleFactor?: number;
  /**
   * This is the view that MUST be the start view from the events.
   * If not provided, then dragging anywhere will adjust the camera
   */
  startView?: string | string[];
}

export class BasicCameraController extends EventManager {
  /** This is the camera that this controller will manipulate */
  camera: ChartCamera;
//  P private filterPan = (panDelta: [number, number, number]) => panDelta;
//  P private filterScale = (scaleDelta: [number, number, number]) => scaleDelta;

  /** When this is set to true, the start view can be targetted even when behind other views */
  ignoreCoverViews?: boolean;
  /** The rate scale is adjusted with the mouse wheel */
  scaleFactor: number;
  /** The view that must be the start or focus of the interactions in order for the interactions to occur */
  startViews: string[] | undefined;

  /**
   * This flag is set to true when a start view is targetted on mouse down even if it is not
   * the top most view.
   */
  private startViewDidStart: boolean = false;
  private coveredStartView: View;

  constructor(options: IBasicCameraControllerOptions) {
    super();
    this.camera = options.camera;
    this.scaleFactor = options.scaleFactor || 1000.0;
    this.ignoreCoverViews = options.ignoreCoverViews || false;

    if (options.startView) {
      this.startViews = Array.isArray(options.startView) ? options.startView : [options.startView];
    }
  }
  filterPan(panDelta: [number, number, number], view: View) : [
    number, number, number] {
    return [
      view.panFilter[0] ? panDelta[0] : 0,
      view.panFilter[1] ? panDelta[1] : 0,
      view.panFilter[2] ? panDelta[2] : 0,
    ];
  }
  filterScale(scaleDelta: [number, number, number], view: View) : [number, number, number] {
    return ([
      view.scaleFilter[0] ? scaleDelta[0] : 1,
      view.scaleFilter[1] ? scaleDelta[1] : 1,
      view.scaleFilter[2] ? scaleDelta[2] : 1,
    ]);
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
  }

  handleMouseUp(e: IMouseInteraction) {
    this.startViewDidStart = false;
  }

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    if (this.canStart(e.start.view.id)) {
      this.camera.offset[0] += (drag.screen.delta.x / this.camera.scale[0]);
      this.camera.offset[1] += (drag.screen.delta.y / this.camera.scale[1]);
    }
    if (this.filterPan) {
      this.camera.offset = this.filterPan(this.camera.offset, e.start.view);
    }
  }

  handleWheel(e: IMouseInteraction, wheelMetrics: IWheelMetrics) {
    // Every mouse wheel event must look to see if it's over a valid covered start view
    this.findCoveredStartView(e);

    if (this.canStart(e.target.view.id)) {
      const targetView = this.getTargetView(e);
      const beforeZoom = targetView.screenToWorld(e.screen.mouse);

      const currentZoomX = this.camera.scale[0] || 1.0;
      this.camera.scale[0] = currentZoomX + wheelMetrics.wheel[1] / this.scaleFactor * currentZoomX;
//    P  this.camera.scale[0] = currentZoomX + wheelMetrics.wheel[1] * filterScale[0] / this.scaleFactor * currentZoomX;

      const currentZoomY = this.camera.scale[1] || 1.0;
      this.camera.scale[1] = currentZoomY + wheelMetrics.wheel[1] / this.scaleFactor * currentZoomY;

      const afterZoom = targetView.screenToWorld(e.screen.mouse);

      this.camera.offset[0] -= (beforeZoom.x - afterZoom.x) / targetView.pixelRatio;
      this.camera.offset[1] -= (beforeZoom.y - afterZoom.y) / targetView.pixelRatio;

      if (this.filterScale) {
        this.camera.scale = this.filterScale(this.camera.scale, targetView);
      }
    }
  }

  canStart(viewId: string) {
    return (
      !this.startViews ||
      this.startViews.length === 0 ||
      (this.startViews && this.startViews.indexOf(viewId) > -1) ||
      this.startViewDidStart && this.ignoreCoverViews
    );
  }
}
