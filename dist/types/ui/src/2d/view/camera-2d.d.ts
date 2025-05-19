import { Camera } from "../../util/camera.js";
import { Control2D, IControl2DOptions } from "./control-2d.js";
/**
 * This is a complex camera that layers simpler 2D concepts over an actual 3D projection camera. This camera FORCES the
 * orthographic projection type to work with the 2D layering system created.
 *
 * Essentially this Camera is a two layer concept rolled into one. This is done this way to make the front end API
 * simpler to use and understand while providing ease of use and conveniences for the 2D layer system.
 */
export declare class Camera2D extends Camera {
    /** These are the 2d controls to make manipulating a 2D world easier */
    _control2D: Control2D;
    get control2D(): Control2D;
    set control2D(val: Control2D);
    get scale2D(): import("../../index.js").Vec3;
    get offset(): import("../../index.js").Vec3;
    constructor(options?: IControl2DOptions);
}
