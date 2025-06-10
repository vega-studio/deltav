import { SimpleEventHandler } from "../../event-management/simple-event-handler.js";
import type { IMouseInteraction } from "../../event-management/types.js";
import type { Camera } from "../../util/camera.js";
import type { Instance3D } from "../scene-graph/instance-3d.js";
export interface ISimple3DTransformControllerOptions {
    /** The transform to manipulate with the event manager */
    target: Instance3D;
    /** The camera object to use for determining rotation axes */
    camera: Camera;
}
/**
 * This listens to mouse events to control the transform of a 3D object to
 * rotate and scale the object around the origin [0, 0, 0];
 */
export declare class Simple3DTransformController extends SimpleEventHandler {
    private target;
    private camera;
    private isDragging;
    private lastMouse;
    private readonly ROTATE_SENSITIVITY;
    private readonly ZOOM_SENSITIVITY;
    private readonly MIN_SCALE;
    private readonly MAX_SCALE;
    constructor(options: ISimple3DTransformControllerOptions);
    /**
     * Update the camera reference if needed.
     */
    setCamera(camera: Camera): void;
    handleMouseDown(e: IMouseInteraction): void;
    handleMouseUp(_e: IMouseInteraction): void;
    handleDrag(e: IMouseInteraction): void;
    handleWheel(e: IMouseInteraction): void;
}
