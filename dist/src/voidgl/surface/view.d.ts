import { AbsolutePosition } from "../primitives/absolute-position";
import { Bounds } from "../primitives/bounds";
import { IPoint } from "../primitives/point";
import { Color } from "../types";
import { ChartCamera } from "../util/chart-camera";
import { DataBounds } from "../util/data-bounds";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { ViewCamera } from "../util/view-camera";
export declare enum ClearFlags {
    COLOR = 1,
    DEPTH = 2,
    STENCIL = 4
}
export interface IViewOptions extends IdentifyByKeyOptions {
    background?: Color;
    camera?: ChartCamera;
    clearFlags?: ClearFlags[];
    viewCamera?: ViewCamera;
    viewport: AbsolutePosition;
}
export declare class View extends IdentifyByKey {
    static DEFAULT_VIEW_ID: string;
    background: Color;
    camera: ChartCamera;
    clearFlags: ClearFlags[];
    depth: number;
    pixelRatio: number;
    screenBounds: Bounds;
    viewCamera: ViewCamera;
    viewport: AbsolutePosition;
    viewBounds: DataBounds<View>;
    needsDraw: boolean;
    animationEndTime: number;
    constructor(options: IViewOptions);
    screenToPixelSpace(point: IPoint, out?: IPoint): IPoint;
    pixelSpaceToScreen(point: IPoint, out?: IPoint): IPoint;
    screenToView(point: IPoint, out?: IPoint): IPoint;
    viewToScreen(point: IPoint, out?: IPoint): IPoint;
    screenToWorld(point: IPoint, out?: IPoint): IPoint;
    worldToScreen(point: IPoint, out?: IPoint): IPoint;
    viewToWorld(point: IPoint, out?: IPoint): IPoint;
    worldToView(point: IPoint, out?: IPoint): IPoint;
    fitViewtoViewport(surfaceDimensions: Bounds): void;
}
