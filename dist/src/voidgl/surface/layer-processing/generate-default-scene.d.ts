import { AbsolutePosition } from "../../primitives/absolute-position";
import { ChartCamera } from "../../util/chart-camera";
import { ViewCamera } from "../../util/view-camera";
import { Scene } from "../scene";
import { View } from "../view";
export interface IDefaultSceneElements {
    camera: ChartCamera;
    scene: Scene;
    view: View;
    viewCamera: ViewCamera;
    viewport: AbsolutePosition;
}
export declare function generateDefaultScene(context: WebGLRenderingContext): IDefaultSceneElements;
