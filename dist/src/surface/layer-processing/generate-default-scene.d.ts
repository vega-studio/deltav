import { AbsolutePosition } from "../../primitives/absolute-position";
import { Camera } from "../../util/camera";
export interface IDefaultElements {
    camera: Camera;
    viewport: AbsolutePosition;
}
export declare function generateDefaultElements(context: WebGLRenderingContext): IDefaultElements;
