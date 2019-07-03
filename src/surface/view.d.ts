import { AbsolutePosition } from "../primitives/absolute-position";
import { Bounds } from "../primitives/bounds";
import { Color, Omit } from "../types";
import { Vec2, Vec2Compat } from "../util";
import { Camera } from "../util/camera";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { LayerScene } from "./layer-scene";
export declare enum ClearFlags {
    COLOR = 1,
    DEPTH = 2,
    STENCIL = 4
}
export interface IViewConstructable<TViewProps extends IViewProps> {
    new (scene: LayerScene, props: TViewProps): View<TViewProps>;
}
export declare type IViewConstructionClass<TViewProps extends IViewProps> = IViewConstructable<TViewProps> & {
    defaultProps: TViewProps;
};
export declare type ViewInitializer<TViewProps extends IViewProps> = {
    key: string;
    init: [IViewConstructionClass<TViewProps>, IViewProps];
};
export declare function createView<TViewProps extends IViewProps>(viewClass: IViewConstructable<TViewProps> & {
    defaultProps: TViewProps;
}, props: Omit<TViewProps, "key" | "viewport"> & Partial<Pick<TViewProps, "key" | "viewport">>): ViewInitializer<TViewProps>;
export interface IViewProps extends IdentifyByKeyOptions {
    background?: Color;
    camera: Camera;
    clearFlags?: ClearFlags[];
    order?: number;
    viewport: AbsolutePosition;
}
export declare abstract class View<TViewProps extends IViewProps> extends IdentifyByKey {
    static defaultProps: IViewProps;
    animationEndTime: number;
    depth: number;
    lastFrameTime: number;
    needsDraw: boolean;
    optimizeRendering: boolean;
    pixelRatio: number;
    props: TViewProps;
    scene: LayerScene;
    screenBounds: Bounds<View<TViewProps>>;
    viewBounds: Bounds<View<IViewProps>>;
    readonly clearFlags: ClearFlags[];
    readonly order: number;
    constructor(scene: LayerScene, props: TViewProps);
    screenToPixelSpace(point: Vec2, out?: Vec2): [number, number];
    pixelSpaceToScreen(point: Vec2, out?: Vec2): [number, number];
    screenToView(point: Vec2, out?: Vec2): [number, number];
    viewToScreen(point: Vec2, out?: Vec2): [number, number];
    abstract screenToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    abstract worldToScreen(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    abstract viewToWorld(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    abstract worldToView(point: Vec2Compat, out?: Vec2Compat): Vec2Compat;
    abstract fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
    shouldDrawView(oldProps: TViewProps, newProps: TViewProps): boolean;
    willUpdateProps(_newProps: IViewProps): void;
    didUpdateProps(): void;
}
export declare class NoView extends View<IViewProps> {
    screenBounds: Bounds<never>;
    screenToWorld(_point: Vec2, _out?: Vec2): Vec2;
    worldToScreen(_point: Vec2, _out?: Vec2): Vec2;
    viewToWorld(_point: Vec2, _out?: Vec2): Vec2;
    worldToView(_point: Vec2, _out?: Vec2): Vec2;
    fitViewtoViewport(screenBounds: Bounds<never>, _viewBounds: Bounds<View<IViewProps>>): void;
    constructor();
}
