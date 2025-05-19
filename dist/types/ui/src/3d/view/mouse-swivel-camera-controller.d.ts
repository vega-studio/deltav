import { IMouseInteraction } from "../../event-management";
import { SimpleEventHandler } from "../../event-management/simple-event-handler.js";
import { Camera } from "../../util";
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
export declare class MouseSwivelCameraController extends SimpleEventHandler {
    private options;
    private didCapture;
    private targetCanvas?;
    constructor(options: IMouseSwivelCameraController);
    handleSwivel(_e: IMouseInteraction): void;
    /**
     * This examines the interaction to see if it includes the configured starting
     * view for validating the controller's handling.
     */
    private viewIsValid;
    /**
     * Lock the mouse and begin monitoring everything the mouse does
     */
    private capture;
    /**
     * Remove all lock monitoring listeners
     */
    private stopCapture;
    /**
     * Analyze the change in pointer lock state and determine if the system has
     * successfully started a lock or not.
     */
    private handlePointerLockChange;
    handleMouseMove(e: IMouseInteraction): void;
    handleClick(e: IMouseInteraction): void;
}
