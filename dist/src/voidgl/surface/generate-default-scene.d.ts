import { AbsolutePosition } from '../primitives/absolute-position';
import { ChartCamera } from '../util/chart-camera';
import { ViewCamera } from '../util/view-camera';
import { Scene } from './scene';
import { View } from './view';
export interface IDefaultSceneElements {
    /** Default chartting camera */
    camera: ChartCamera;
    /** Default scene for elements to be added into */
    scene: Scene;
    /** Default view scenes are rendered with when no other views are specified by the layer or the surface */
    view: View;
    /**
     * The default view projection. Defaults to being an orthographic rendering with the origin at the
     * top left of the canvas and the y-axis as +y going downward.
     */
    viewCamera: ViewCamera;
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
export declare function generateDefaultScene(context: WebGLRenderingContext): IDefaultSceneElements;
