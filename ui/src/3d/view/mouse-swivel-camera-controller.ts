import { Camera } from "../../util";
import { IMouseInteraction } from "../../event-management";
import { SimpleEventHandler } from "../../event-management/simple-event-handler";

export interface IMouseSwivelCameraController {
  /**
   * This is a 3D camera this handler will use to control the scene.
   */
  camera: Camera;
  /**
   * When true, once the mouse interacts with the target view, the mouse will
   * disappear and operate the view until the ESC key is pressed to release.
   *
   * Once ESC is pressed OR this flag is false, the capture mode changes where
   * the user must click on the view to recapture the mouse.
   */
  captureMouse?: boolean;
  /**
   * When this is set, interaction with the view can start even if there are
   * higher layered views atop the control view indicated.
   */
  ignoreCoveringViews?: boolean;
  /** Specify the key of the view that you wish for this to activate */
  view: string;
}

/**
 * This captures the mouse and makes it where the mouse swivels the camera's
 * view. You can then use WASD to navigate left right forward and backward.
 * Space and Shift will raise and lower elevation on the y-axis.
 */
export class MouseSwivelCameraController extends SimpleEventHandler {
  private options: IMouseSwivelCameraController;
  private didCapture = false;
  private targetCanvas?: HTMLCanvasElement;

  constructor(options: IMouseSwivelCameraController) {
    super({});
    this.options = options;
  }

  handleSwivel(_e: IMouseInteraction) {
    // TODO
  }

  /**
   * This examines the interaction to see if it includes the configured starting
   * view for validating the controller's handling.
   */
  private viewIsValid(e: IMouseInteraction) {
    if (this.options.ignoreCoveringViews) {
      return Boolean(
        e.target.views.find((v) => v.view.key === this.options.view)
      );
    } else {
      return e.target.view.key === this.options.view;
    }
  }

  /**
   * Lock the mouse and begin monitoring everything the mouse does
   */
  private capture = (e: IMouseInteraction) => {
    if (this.didCapture) return;
    this.targetCanvas = e.canvas;
    document.addEventListener(
      "pointerlockchange",
      this.handlePointerLockChange,
      false
    );
    e.canvas?.requestPointerLock();
  };

  /**
   * Remove all lock monitoring listeners
   */
  private stopCapture = () => {
    document.removeEventListener(
      "pointerlockchange",
      this.handlePointerLockChange,
      false
    );
    this.didCapture = false;
  };

  /**
   * Analyze the change in pointer lock state and determine if the system has
   * successfully started a lock or not.
   */
  private handlePointerLockChange() {
    if (document.pointerLockElement === this.targetCanvas) {
      this.didCapture = true;
    } else {
      this.stopCapture();
    }
  }

  handleMouseMove(e: IMouseInteraction) {
    if (this.didCapture) return;

    if (this.options.captureMouse && this.viewIsValid(e)) {
      this.capture(e);
    }
  }

  handleClick(e: IMouseInteraction) {
    if (this.didCapture) return;
    if (this.viewIsValid(e)) this.capture(e);
  }
}
