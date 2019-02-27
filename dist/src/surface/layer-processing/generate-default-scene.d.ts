import { AbsolutePosition } from "../../primitives/absolute-position";
import { ChartCamera } from "../../util/chart-camera";
import { ViewCamera } from "../../util/view-camera";
import { LayerScene } from "../layer-scene";
import { View } from "../view";
export interface IDefaultSceneElements {
    camera: ChartCamera;
    scene: LayerScene;
    view: View;
    viewCamera: ViewCamera;
    viewport: AbsolutePosition;
}
export declare function generateDefaultScene(context: WebGLRenderingContext): IDefaultSceneElements;
