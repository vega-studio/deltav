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
/**
 * A type to describe the constructor of a View class.
 */
export interface IViewConstructable<TViewProps extends IViewProps> {
    new (scene: LayerScene, props: TViewProps): View<TViewProps>;
}
/**
 * This specifies a class type that can be used in creating a view with createView
 */
export declare type IViewConstructionClass<TViewProps extends IViewProps> = IViewConstructable<TViewProps> & {
    defaultProps: TViewProps;
};
/**
 * This is a pair of a Class Type and the props to be applied to that class type.
 */
export declare type ViewInitializer<TViewProps extends IViewProps> = {
    key: string;
    init: [IViewConstructionClass<TViewProps>, IViewProps];
};
/**
 * Used for reactive view generation and updates.
 */
export declare function createView<TViewProps extends IViewProps>(viewClass: IViewConstructable<TViewProps> & {
    defaultProps: TViewProps;
}, props: Omit<TViewProps, "key" | "viewport"> & Partial<Pick<TViewProps, "key" | "viewport">>): ViewInitializer<TViewProps>;
/**
 * Defines the input metrics of a view for a scene.
 */
export interface IViewProps extends IdentifyByKeyOptions {
    /**
     * The background color that gets cleared out for this view. Performance is
     * better if this is left clear. Probably better to draw a colored quad instead.
     * This is just convenient.
     */
    background?: Color;
    /**
     * This is the 3D camera used to create a vantage point in the 3D world and project it's viewpoint to the 2d screen.
     */
    camera: Camera;
    /**
     * This sets what buffers get cleared by webgl before the view is drawn in it's space.
     */
    clearFlags?: ClearFlags[];
    /** Helps assert a guaranteed rendering order if needed. Lower numbers render first. */
    order?: number;
    /**
     * This specifies the bounds on the canvas this camera will render to. This let's you render
     * say a little square in the bottom right showing a minimap.
     *
     * If this is not specified, the entire canvas will be the viewport.
     */
    viewport: AbsolutePosition;
}
/**
 * A View renders a perspective of a scene to a given surface or surfaces.
 */
export declare abstract class View<TViewProps extends IViewProps> extends IdentifyByKey {
    static defaultProps: IViewProps;
    /** End time of animation */
    animationEndTime: number;
    /**
     * This is the depth of the view. The higher the depth represents which layer is on top.
     * Zero always represents the default view.
     */
    depth: number;
    /** Last frame time this view was rendered under */
    lastFrameTime: number;
    /** This is the flag to see if a view needs draw */
    needsDraw: boolean;
    /**
     * This is a flag for various processes to indicate the view is demanding optimal rendering performance over other processes.
     * This is merely a hinting device and does not guarantee better performance at any given moment.
     */
    optimizeRendering: boolean;
    /** This is set to ensure the projections that happen properly translates the pixel ratio to normal Web coordinates */
    pixelRatio: number;
    /** The props applied to this view */
    props: TViewProps;
    /** The scene this view is displaying */
    scene: LayerScene;
    /** This establishes the projection methods that can be used to project geometry between the screen and the world */
    projection: BaseProjection<View<TViewProps>>;
    screenBounds: Bounds<View<TViewProps>>;
    viewBounds: Bounds<View<TViewProps>>;
    /** Retrieves the clearflag prop assigned to the view and provides a default */
    readonly clearFlags: ClearFlags[];
    /** Retrieves the order prop assigned to the view and provides a default */
    readonly order: number;
    constructor(scene: LayerScene, props: TViewProps);
    /**
     * This operation makes sure we have the view camera adjusted to the new viewport's needs.
     * For default behavior this ensures that the coordinate system has no distortion, orthographic,
     * top left as 0,0 with +y axis pointing down.
     */
    abstract fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
    shouldDrawView(oldProps: TViewProps, newProps: TViewProps): boolean;
    /**
     * Lifecycle: Fires before the props object is updated with the newProps. Allows view to
     * respond to diff changes.
     */
    willUpdateProps(_newProps: IViewProps): void;
    /**
     * Lifecycle: Executes after props have been updated with new contents
     */
    didUpdateProps(): void;
}
/**
 * A view that does not view anything.
 * Useful as a placeholder view to not cause null or undefined values.
 */
export declare class NoView extends View<IViewProps> {
    projection: SimpleProjection;
    screenToWorld(_point: Vec2, _out?: Vec2): Vec2;
    worldToScreen(_point: Vec2, _out?: Vec2): Vec2;
    viewToWorld(_point: Vec2, _out?: Vec2): Vec2;
    worldToView(_point: Vec2, _out?: Vec2): Vec2;
    fitViewtoViewport(screenBounds: Bounds<never>, _viewBounds: Bounds<View<IViewProps>>): void;
    constructor();
}
