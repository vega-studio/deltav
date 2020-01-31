import { AbsolutePosition } from "../../math/primitives/absolute-position";
import { Camera } from "../../util/camera";
export interface IDefaultElements {
    /** Default chartting camera */
    camera: Camera;
    /** The default viewport that encompasses the entire canvas */
    viewport: AbsolutePosition;
}
/**
 * This generates all of the cameras/views/scenes necessary for default viewing of elements.
 *
 * These defaults are required to ensure the following:
 *
 * - Orthographic view
 * - top left corner of the canvas is 0,0
 * - y axis is +y downward
 * - entire canvas is the viewport.
 */
export declare function generateDefaultElements(context: WebGLRenderingContext): IDefaultElements;
