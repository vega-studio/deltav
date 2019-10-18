import { Vec2 } from "../math";
import { BaseProjection, SimpleProjection } from "../math/base-projection";
import { AbsolutePosition } from "../math/primitives/absolute-position";
import { Bounds } from "../math/primitives/bounds";
import { Color, Omit } from "../types";
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
    projection: BaseProjection<View<TViewProps>>;
    screenBounds: Bounds<View<TViewProps>>;
    viewBounds: Bounds<View<TViewProps>>;
    readonly clearFlags: ClearFlags[];
    readonly order: number;
    constructor(scene: LayerScene, props: TViewProps);
    abstract fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
    shouldDrawView(oldProps: TViewProps, newProps: TViewProps): boolean;
    willUpdateProps(_newProps: IViewProps): void;
    didUpdateProps(): void;
}
export declare class NoView extends View<IViewProps> {
    projection: SimpleProjection;
    screenToWorld(_point: Vec2, _out?: Vec2): Vec2;
    worldToScreen(_point: Vec2, _out?: Vec2): Vec2;
    viewToWorld(_point: Vec2, _out?: Vec2): Vec2;
    worldToView(_point: Vec2, _out?: Vec2): Vec2;
    fitViewtoViewport(screenBounds: Bounds<never>, _viewBounds: Bounds<View<IViewProps>>): void;
    constructor();
}
