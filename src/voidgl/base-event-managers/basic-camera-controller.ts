import { EventManager } from '../surface/event-manager';
import { IDragMetrics, IMouseInteraction } from '../surface/mouse-event-manager';
import { ChartCamera } from '../util/chart-camera';

export interface IBasicCameraControllerOptions {
  /** This is the camera this controller will manipulate */
  camera: ChartCamera;
  /**
   * This is the view that MUST be the start view from the events.
   * If not provided, then dragging anywhere will adjust the camera
   */
  startView?: string;
}

export class BasicCameraController extends EventManager {
  /** This is the camera that this controller will manipulate */
  camera: ChartCamera;
  /** This view  */
  startView: string;

  constructor(options: IBasicCameraControllerOptions) {
    super();
    this.camera = options.camera;
    this.startView = options.startView;
  }

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    if (!this.startView || (this.startView && e.start.view.id === this.startView)) {
      this.camera.offset[0] += drag.screen.delta.x;
      this.camera.offset[1] += drag.screen.delta.y;
    }
  }
}
