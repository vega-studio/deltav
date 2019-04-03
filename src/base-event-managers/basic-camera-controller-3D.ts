import {
  EventManager,
  IDragMetrics,
  IMouseInteraction,
  IWheelMetrics
} from "../surface";
import { ChartCamera } from "../util";

export interface IBasicCameraController3DOptions {
  camera: ChartCamera;
  ignoreCoverViews?: boolean;
  startView?: string | string[];
}

export class BasicCameraController3D extends EventManager {
  camera: ChartCamera;

  oldMouseX: number;
  oldMouseY: number;
  mouseIsDown: boolean = false;

  startViews: string[] = [];

  ignoreCoverViews?: boolean;
  private startViewDidStart: boolean = false;

  constructor(options: IBasicCameraController3DOptions) {
    super();
    this.camera = options.camera;
    this.ignoreCoverViews = options.ignoreCoverViews || false;

    if (options.startView) {
      this.startViews = Array.isArray(options.startView)
        ? options.startView
        : [options.startView];
    }
  }

  private findCoveredStartView(e: IMouseInteraction) {
    const found = e.viewsUnderMouse.find(
      under => this.startViews.indexOf(under.view.id) > -1
    );
    this.startViewDidStart = Boolean(found);
  }

  private canStart(viewId: string) {
    return (
      this.startViews.length === 0 ||
      (this.startViews && this.startViews.indexOf(viewId) > -1) ||
      (this.startViewDidStart && this.ignoreCoverViews)
    );
  }

  handleClick(e: IMouseInteraction) {
    e;
    /* TODO */
  }

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {
    e;
    drag;
    /* TODO */
  }

  handleMouseDown(e: IMouseInteraction) {
    if (this.startViews && e.start && this.canStart(e.start.view.id)) {
      this.findCoveredStartView(e);
      this.mouseIsDown = true;
      this.oldMouseX = e.screen.mouse[0];
      this.oldMouseY = e.screen.mouse[1];
    }
  }

  handleMouseMove(e: IMouseInteraction) {
    if (this.mouseIsDown) {
      const addH = 0.01 * (e.screen.mouse[0] - this.oldMouseX);
      const addV = 0.01 * (e.screen.mouse[1] - this.oldMouseY);

      const r = Math.sqrt(
        (this.camera.offset[0] - this.camera.target[0]) ** 2 +
          (this.camera.offset[1] - this.camera.target[1]) ** 2 +
          (this.camera.offset[2] - this.camera.target[2]) ** 2
      );

      let angleV = Math.acos(
        (this.camera.offset[1] - this.camera.target[1]) / r
      );

      let angleH = Math.acos(
        (this.camera.offset[0] - this.camera.target[0]) / (r * Math.sin(angleV))
      );

      if (this.camera.offset[2] - this.camera.target[2] < 0) {
        angleH = -angleH;
      }

      angleV -= addV;
      if (angleV < 0.001) angleV = 0.001;
      if (angleV > Math.PI) angleV = Math.PI;

      angleH += addH;

      this.camera.setOffset([
        this.camera.target[0] + r * Math.sin(angleV) * Math.cos(angleH),
        this.camera.target[1] + r * Math.cos(angleV),
        this.camera.target[2] + r * Math.sin(angleV) * Math.sin(angleH)
      ]);

      this.oldMouseX = e.screen.mouse[0];
      this.oldMouseY = e.screen.mouse[1];
    }
  }

  handleMouseOut(e: IMouseInteraction) {
    e;
    /* TODO */
  }

  handleMouseOver(e: IMouseInteraction) {
    e;
    /* TODO */
  }

  handleMouseUp(e: IMouseInteraction) {
    e;
    this.mouseIsDown = false;
  }

  handleWheel(e: IMouseInteraction, wheelMetrics: IWheelMetrics) {
    this.findCoveredStartView(e);
    if (this.canStart(e.target.view.id)) {
      const r = Math.sqrt(
        (this.camera.offset[0] - this.camera.target[0]) ** 2 +
          (this.camera.offset[1] - this.camera.target[1]) ** 2 +
          (this.camera.offset[2] - this.camera.target[2]) ** 2
      );

      const addR = wheelMetrics.wheel[1] * 0.01;
      if (r - addR > 0) {
        this.camera.setOffset([
          this.camera.target[0] +
            (this.camera.offset[0] - this.camera.target[0]) * (r - addR) / r,
          this.camera.target[1] +
            (this.camera.offset[1] - this.camera.target[1]) * (r - addR) / r,
          this.camera.target[2] +
            (this.camera.offset[2] - this.camera.target[2]) * (r - addR) / r
        ]);
      }
    }
  }
}
