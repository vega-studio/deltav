import { AbsolutePosition } from "../../primitives/absolute-position";
import { ChartCamera } from "../../util/chart-camera";
import { ViewCamera } from "../../util/view-camera";
export interface IDefaultElements {
    camera: ChartCamera;
    viewCamera: ViewCamera;
    viewport: AbsolutePosition;
}
export declare function generateDefaultElements(context: WebGLRenderingContext): IDefaultElements;
