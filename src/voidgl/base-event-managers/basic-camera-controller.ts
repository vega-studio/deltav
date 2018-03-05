import { EventManager } from '../surface/event-manager';
import { IDragMetrics, IMouseInteraction, IWheelMetrics } from '../surface/mouse-event-manager';
import { ChartCamera } from '../util/chart-camera';

export interface IBasicCameraControllerOptions {
  /** This is the camera this controller will manipulate */
  camera: ChartCamera;
  /**
   * This adjusts how fast scaling is applied from the mouse wheel
   */
  scaleFactor?: number;
  /**
   * This is the view that MUST be the start view from the events.
   * If not provided, then dragging anywhere will adjust the camera
   */
  startView?: string;
}

export class BasicCameraController extends EventManager {
  /** This is the camera that this controller will manipulate */
  camera: ChartCamera;
  /** The rate scale is adjusted with the mouse wheel */
  scaleFactor: number;
  /** The view that must be the start or focus of the interactions in order for the interactions to occur */
  startView: string;

  constructor(options: IBasicCameraControllerOptions) {
    super();
    this.camera = options.camera;
    this.scaleFactor = options.scaleFactor || 1000.0;
    this.startView = options.startView;
  }

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    if (!this.startView || (this.startView && e.start.view.id === this.startView)) {
      this.camera.offset[0] += drag.screen.delta.x / this.camera.scale[0];
      this.camera.offset[1] += drag.screen.delta.y / this.camera.scale[1];
    }
  }

  handleWheel(e: IMouseInteraction, wheelMetrics: IWheelMetrics) {
    if (!this.startView || (this.startView && e.target.view.id === this.startView)) {
      const beforeZoom = e.target.view.screenToWorld(e.screen.mouse);

      const currentZoomX = this.camera.scale[0] || 1.0;
      this.camera.scale[0] = currentZoomX + wheelMetrics.wheel[1] / this.scaleFactor * currentZoomX;

      const currentZoomY = this.camera.scale[1] || 1.0;
      this.camera.scale[1] = currentZoomY + wheelMetrics.wheel[1] / this.scaleFactor * currentZoomY;

      const afterZoom = e.target.view.screenToWorld(e.screen.mouse);

      this.camera.offset[0] -= (beforeZoom.x - afterZoom.x);
      this.camera.offset[1] -= (beforeZoom.y - afterZoom.y);
    }
  }
}
