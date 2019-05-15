import { AbsolutePosition } from "../primitives/absolute-position";
import { Bounds } from "../primitives/bounds";
import { Color } from "../types";
import { Vec2 } from "../util";
import { ChartCamera } from "../util/chart-camera";
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
    animationEndTime: number;
    background?: Color;
    camera: ChartCamera;
    clearFlags: ClearFlags[];
    depth: number;
    lastFrameTime: number;
    needsDraw: boolean;
    optimizeRendering: boolean;
    pixelRatio: number;
    screenBounds: Bounds<never>;
    viewCamera: ViewCamera;
    viewport: AbsolutePosition;
    viewBounds: Bounds<View>;
    constructor(options: IViewOptions);
    screenToPixelSpace(point: Vec2, out?: Vec2): [number, number];
    pixelSpaceToScreen(point: Vec2, out?: Vec2): [number, number];
    screenToView(point: Vec2, out?: Vec2): [number, number];
    viewToScreen(point: Vec2, out?: Vec2): [number, number];
    screenToWorld(point: Vec2, out?: Vec2): [number, number];
    worldToScreen(point: Vec2, out?: Vec2): [number, number];
    viewToWorld(point: Vec2, out?: Vec2): [number, number];
    worldToView(point: Vec2, out?: Vec2): [number, number];
    fitViewtoViewport(surfaceDimensions: Bounds<never>): void;
}
