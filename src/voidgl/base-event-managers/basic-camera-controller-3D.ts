import {
  EventManager,
  IMouseInteraction,
  IDragMetrics,
  IWheelMetrics
} from "../surface";
import { ChartCamera } from "../util";
import { timingSafeEqual } from "crypto";

export interface IBasicCameraController3DOptions {
  camera: ChartCamera;
}

export class BasicCameraController3D extends EventManager {
  camera: ChartCamera;

  oldMouseX: number;
  oldMouseY: number;
  mouseIsDown: boolean = false;

  constructor(options: IBasicCameraController3DOptions) {
    super();
    this.camera = options.camera;
  }

  handleClick(e: IMouseInteraction) {}

  handleDrag(e: IMouseInteraction, drag: IDragMetrics) {}

  handleMouseDown(e: IMouseInteraction) {
    this.mouseIsDown = true;
    this.oldMouseX = e.screen.mouse[0];
    this.oldMouseY = e.screen.mouse[1];
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

  handleMouseOut(e: IMouseInteraction) {}

  handleMouseOver(e: IMouseInteraction) {}

  handleMouseUp(e: IMouseInteraction) {
    this.mouseIsDown = false;
  }

  handleWheel(e: IMouseInteraction, wheel: IWheelMetrics) {
    //const offset = this.camera.offset;
    //this.camera.setOffset([offset[0], offset[1], offset[2] - 0.01]);
  }
}
