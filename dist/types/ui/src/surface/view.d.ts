import { AbsolutePosition } from "../math/primitives/absolute-position";
import { BaseProjection, SimpleProjection } from "../math/base-projection";
import { BaseResourceOptions } from "../resources/base-resource-manager";
import { Bounds } from "../math/primitives/bounds";
import { Camera } from "../util/camera";
import { Color, FragmentOutputType, Omit } from "../types";
import { IColorBufferResource } from "../resources/color-buffer";
import { GLState, RenderTarget } from "../gl";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { IRenderTextureResource } from "../resources/texture/render-texture";
import { LayerScene } from "./layer-scene";
import { ResourceRouter } from "../resources/resource-router";
import { Vec2 } from "../math";
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
 * This specifies a class type that can be used in creating a view with
 * createView
 */
export type IViewConstructionClass<TViewProps extends IViewProps> = IViewConstructable<TViewProps> & {
    defaultProps: TViewProps;
};
/**
 * This is a pair of a Class Type and the props to be applied to that class
 * type.
 */
export type ViewInitializer<TViewProps extends IViewProps> = {
    key: string;
    init: [IViewConstructionClass<TViewProps>, IViewProps];
};
/**
 * This describes a target resource for the view to output into.
 */
export type ViewOutputTarget = {
    /**
     * The form of information this output will provide. This is mostly an
     * arbitrary number to help make associations between an output target and the
     * type of information a layer can provide.
     */
    outputType: FragmentOutputType | number;
    /** The resource key that the output will target */
    resource: BaseResourceOptions;
};
/**
 * Used for reactive view generation and updates.
 */
export declare function createView<TViewProps extends IViewProps>(viewClass: IViewConstructable<TViewProps> & {
    defaultProps: TViewProps;
}, props: Omit<TViewProps, "key" | "viewport"> & Partial<Pick<TViewProps, "key" | "viewport">>): ViewInitializer<TViewProps>;
export type ViewOutputBuffers = Record<number, IRenderTextureResource | IColorBufferResource | undefined>;
export type ViewDepthBuffer = IRenderTextureResource | IColorBufferResource | boolean;
/**
 * Defines the input metrics of a view for a scene.
 */
export interface IViewProps extends IdentifyByKeyOptions {
    /**
     * The background color that gets cleared out for this view. Performance is
     * better if this is left clear. Probably better to draw a colored quad
     * instead. This is just convenient.
     */
    background?: Color;
    /**
     * This is the 3D camera used to create a vantage point in the 3D world and
     * project it's viewpoint to the 2d screen.
     */
    camera: Camera;
    /**
     * This sets what buffers get cleared by webgl before the view is drawn in
     * it's space.
     */
    clearFlags?: ClearFlags[];
    /**
     * Helps assert a guaranteed rendering order if needed. Lower numbers render
     * first.
     */
    order?: number;
    /**
     * Excluding this property means the view will render to the screen. Only
     * include this if you have a targetted resource to take in what you want to
     * render.
     *
     * This lets you target resources based on their key for where you want to
     * render the output of the view to. If you just specify a key, it will assume
     * it is rendering to the target with COLOR information as a default.
     *
     * If you specify multiple targets with outputType definitions, then the
     * system will look for those information types in the layer renderings and
     * match those render targets to the outputs of the layer. If the layer has
     * nothing to provide for the outputTypes defined, then the layer won't render
     * anything at all to any of the outputs.
     */
    output?: {
        /**
         * Specify output targets for the color buffers this view wants to write to.
         * These should be targets specifying resource keys and provide outputTypes
         * to match information potentially provided by the layers.
         */
        buffers: ViewOutputBuffers;
        /**
         * Set to true to include a depth buffer the system will generate for you.
         * Set to a resource id to target an output texture to store the depth
         * buffer. Set to false to not have the depth buffer used or calculated.
         */
        depth: ViewDepthBuffer;
    };
    /**
     * This specifies the bounds on the canvas this camera will render to. This
     * let's you render say a little square in the bottom right showing a minimap.
     *
     * If this is not specified, the entire canvas will be the viewport.
     */
    viewport: AbsolutePosition;
    /**
     * This helps resolve scaling differences between a View rendering to an
     * offscreen target, which is then rendered the screen. This is commonly
     * associated with the render target being a scaled version of the screen,
     * then rendered to the screen.
     */
    screenScale?: Vec2;
    /**
     * If provided, this will manually set the pixel ratio of the view. THis is
     * used to help adjust for differing render targets that may not directly
     * render to the screen but rather in scaled modes.
     */
    pixelRatio?: number;
    /**
     * This is a hook to allow gl state changes JUST BEFORE drawing a layer. This
     * allows for view specific tweaks to how a lyer gets drawn which is a common
     * occurrence in many rendering pipelines.
     */
    glState?(glState: GLState, layerId: string): void;
}
/**
 * A View renders a perspective of a scene to a given surface or surfaces.
 */
export declare abstract class View<TViewProps extends IViewProps> extends IdentifyByKey {
    static defaultProps: IViewProps;
    /** End time of animation */
    animationEndTime: number;
    /**
     * This is the depth of the view. The higher the depth represents which layer
     * is on top. Zero always represents the default view.
     */
    depth: number;
    /** Last frame time this view was rendered under */
    lastFrameTime: number;
    /** This is the flag to see if a view needs draw */
    needsDraw: boolean;
    /**
     * This is a flag for various processes to indicate the view is demanding
     * optimal rendering performance over other processes. This is merely a
     * hinting device and does not guarantee better performance at any given
     * moment.
     */
    optimizeRendering: boolean;
    /**
     * This is set to ensure the projections that happen properly translates the
     * pixel ratio to normal Web coordinates
     */
    get pixelRatio(): number;
    set pixelRatio(val: number);
    private _pixelRatio;
    /**
     * This establishes the projection methods that can be used to project
     * geometry between the screen and the world
     */
    projection: BaseProjection<View<TViewProps>>;
    /** The props applied to this view */
    props: TViewProps;
    /**
     * This is the router that makes it possible to request resources. Our view
     * needs this to be available to aid in creating render targets to output
     * into.
     */
    resource: ResourceRouter;
    /**
     * If this is set, then this view is outputting its rendering somewhere that
     * is not the direct screen buffer.
     */
    renderTarget?: RenderTarget;
    /** The scene this view is displaying */
    scene: LayerScene;
    get screenBounds(): Bounds<View<TViewProps>>;
    set screenBounds(val: Bounds<View<TViewProps>>);
    get viewBounds(): Bounds<View<TViewProps>>;
    set viewBounds(val: Bounds<View<TViewProps>>);
    /** Retrieves the clearflag prop assigned to the view and provides a default */
    get clearFlags(): ClearFlags[];
    /** Retrieves the order prop assigned to the view and provides a default */
    get order(): number;
    constructor(scene: LayerScene, props: TViewProps);
    /**
     * retrieves this view's targets for outputting fragment information. This
     * provides a simple list of the target's keys with their output type.
     */
    getOutputTargets(): ViewOutputTarget[] | null;
    /**
     * The view can have one or multiple render targets. This helps by always
     * returning a list containing all of the render targets. Returns an empty
     * list if there is no render target associated with the view.
     */
    getRenderTargets(): RenderTarget[];
    /**
     * This generates the render target needed to handle the output configuration
     * specified by the props and the layer configuration.
     *
     * This is called by the system and should never need to be called externally.
     */
    createRenderTarget(): void;
    /**
     * This let's the view do anything it needs to be ready for next render. Some
     * tasks this may include is checking if it's render target is still valid.
     * It's buffer outputs can get invalidated for any number of reasons.
     */
    willUseView(): void;
    /**
     * This operation makes sure we have the view camera adjusted to the new
     * viewport's needs. For default behavior this ensures that the coordinate
     * system has no distortion, orthographic, top left as 0,0 with +y axis
     * pointing down.
     */
    abstract fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
    shouldDrawView(oldProps: TViewProps, newProps: TViewProps): boolean;
    /**
     * Lifecycle: Fires before the props object is updated with the newProps.
     * Allows view to respond to diff changes.
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
