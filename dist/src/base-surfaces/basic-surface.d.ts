import { EventManager } from "../event-management/event-manager";
import { Instance, InstanceProvider } from "../instance-provider";
import { Bounds } from "../math/primitives/bounds";
import { BaseResourceOptions } from "../resources";
import { ISceneOptions, ISurfaceOptions, IViewProps, LayerInitializer, Surface, View, ViewInitializer } from "../surface";
import { Lookup, Omit, Size } from "../types";
import { Camera } from "../util/camera";
/** Non-keyed View options with ordering property to specify rendering order */
export declare type BasicSurfaceView<TViewProps extends IViewProps> = Omit<ViewInitializer<TViewProps>, "key"> & Partial<Pick<IViewProps, "key">>;
/** Non-keyed layer initializer with ordering property to specify rendering order */
export declare type BasicSurfaceLayer = Omit<LayerInitializer, "key"> & Partial<Pick<IViewProps, "key">>;
/**
 * Defines a scene that elements are injected to. Each scene can be viewed with multiple views
 * and have several layers of injection into it.
 *
 * These are scene options without elements needing to specify keys. Instead, the keys will be
 * generated via Lookup definition keys.
 */
export declare type BasicSurfaceSceneOptions = Omit<ISceneOptions, "key" | "views" | "layers"> & {
    /** Layers to inject elements into the scene */
    layers: Lookup<BasicSurfaceLayer> | BasicSurfaceLayer[];
    /** Views for rendering a perspective of the scene to a surface */
    views: Lookup<BasicSurfaceView<IViewProps>> | BasicSurfaceView<IViewProps>[];
};
export declare type BasicSurfaceResourceOptions = Omit<BaseResourceOptions, "key"> & {
    key?: string;
};
export interface IBasicSurfacePipeline {
    /** Easy define the scenes to be used for the render pipeline */
    scenes: Lookup<BasicSurfaceSceneOptions>;
}
/**
 * Customization for the basic surface
 */
export interface IBasicSurfaceOptions<TProviders extends Lookup<InstanceProvider<Instance>>, TCameras extends Lookup<Camera>, TEvents extends Lookup<EventManager> | EventManager[], TResources extends Lookup<BaseResourceOptions | Record<number, BaseResourceOptions>>, TScenes extends Lookup<BasicSurfaceSceneOptions> | BasicSurfaceSceneOptions[]> {
    /** The container this surface will fill with a canvas to render within */
    container: HTMLElement;
    /**
     * A lookup of all cameras the surface will utilize. They are injected with identifiers to make it easy to
     * reference them later. It's highly recommended to use an enum to identify the camera.
     */
    cameras: TCameras;
    /**
     * Tell the surface to absorb wheel events to prevent the wheel from scolling the page.
     * This defaults to true as it's more common to need wheel controls than not. Explicitly set to false to disable.
     */
    handlesWheelEvents?: boolean;
    /**
     * A list of providers you will utilize within your application. They are injected with identifiers to make it easy to
     * reference them later. It's highly recommended to use an enum to identify the provider.
     *
     * NOTE: This is optional as it is usually VERY handy to have strong typed providers
     */
    providers: TProviders;
    /** Options used to specify settings for the surface itself and how it will be composited in the DOM */
    rendererOptions?: ISurfaceOptions["rendererOptions"];
    /** The resources to be used for the pipeline */
    resources?: TResources;
    /**
     * All of the event managers used to control the surface. They are injected with identifiers to make it easy to
     * reference them later. It's highly recommended to use an enum to identify the event manager.
     */
    eventManagers(cameras: TCameras): TEvents;
    /** A callback that provides the pipeline to use in the surface */
    scenes(resources: TResources, providers: TProviders, cameras: TCameras, managers: TEvents): TScenes;
    /** This will be called if no webgl context is detected */
    onNoWebGL?(): void;
}
/**
 * Helper method to make surface configuration be easier to read and aid in
 * better code hinting.
 */
export declare function createScene(options: BasicSurfaceSceneOptions): BasicSurfaceSceneOptions;
/**
 * This is a surface that has some concepts already set up within it, such as monitoring
 * resizing, waiting for a valid size to be present, a render loop tied into requestAnimationFrame.
 * Nothing here is difficult to set up in your own custom Surface implementation, this may provide
 * enough basics to quickly get started or be enough for most small projects.
 *
 * This auto generates a canvas object that tracks the size of the provided container HTMLElement. Essentially
 * this surface attempts to fill in the provided container.
 */
export declare class BasicSurface<TProviders extends Lookup<InstanceProvider<Instance>>, TCameras extends Lookup<Camera>, TEvents extends Lookup<EventManager> | EventManager[], TResources extends Lookup<BaseResourceOptions | Record<number, BaseResourceOptions>>, TScenes extends Lookup<BasicSurfaceSceneOptions> | BasicSurfaceSceneOptions[]> {
    /** The context generated by this surface to render into. */
    private context;
    /** This is the last known time this surface executed it's draw loop */
    private currentTime;
    /** This is the identifier of the requestAnimationFrame, used for canceling */
    private drawRequestId;
    /** The target canvas to render on */
    private options;
    /** This is the timer id for resize events. This is used to debounce resize events */
    private resizeTimer;
    /** Tracks the last visibility state the browser is in */
    private visibility;
    /** This is the context  */
    private waitForSize;
    /** The cameras specified for this surface */
    cameras: TCameras;
    /** The surface we are implementing */
    base?: Surface;
    /** The event managers specified for this surface */
    eventManagers: TEvents;
    /** The providers specified for this surface */
    providers: TProviders;
    /** The scenes specified for this surface */
    scenes: TScenes;
    /** A promise to await for the surface to be ready for rendering */
    ready: Promise<BasicSurface<TProviders, TCameras, TEvents, TResources, TScenes>>;
    /** The resources specified for the surface pipeline */
    resources: TResources;
    constructor(options: IBasicSurfaceOptions<TProviders, TCameras, TEvents, TResources, TScenes>);
    /**
     * Generates the proper context for our surface to work with.
     */
    private createContext;
    /**
     * Frees all GPU memory and resources used by this Surface.
     */
    destroy: () => void;
    /**
     * The draw loop of the surface
     */
    private draw;
    /**
     * This is a handler that responds to varying resize events
     */
    private handleResize;
    /**
     * This is a handler that responds to the browser window losing visibility
     */
    private handleVisibility;
    /**
     * Initializes all elements for the surface
     */
    init(): Promise<void>;
    /**
     * Tells the surface to resize to the container if it's not fitted currently.
     */
    fitContainer(preventRedraw?: boolean): void;
    /**
     * Retrieves the projection methods for a given view. If the projections do not exist, this returns null.
     */
    getViewProjections(viewId: string): import("..").BaseProjection<any> | null;
    /**
     * Retrieves the size of the view as it appears on the screen if the ID exists in the current pipeline.
     * If it does not exist yet, this will return [0, 0]
     */
    getViewScreenSize(viewId: string | ((scenes: TScenes) => ViewInitializer<any>)): Size;
    /**
     * Retrieves the bounds of the view as it appears on the screen (relative to the canvas).
     * If it does not exist yet, this will return a dimensionless Bounds object.
     */
    getViewScreenBounds(viewId: string): Bounds<View<IViewProps>>;
    /**
     * Gets the bounds of the view within world space.
     * If it does not exist yet, this will return a dimensionless Bounds object.
     */
    getViewWorldBounds(viewId: string): Bounds<View<IViewProps>>;
    /**
     * Redeclare the pipeline
     */
    pipeline(callback: IBasicSurfaceOptions<TProviders, TCameras, TEvents, TResources, TScenes>["scenes"]): Promise<void>;
    /**
     * Destroys all current existing GPU resources and reconstructs them anew.
     *
     * NOTE: options parameter f
     */
    rebuild(): Promise<void>;
    rebuild(clearProviders?: boolean): Promise<void>;
    rebuild(options?: IBasicSurfaceOptions<TProviders, TCameras, TEvents, TResources, TScenes>): Promise<void>;
    /**
     * Point to a new container to fill.
     */
    setContainer(container: HTMLElement): void;
    /**
     * Calls the pipeline callback to retrieve an updated pipeline for the surface
     */
    updatePipeline(): Promise<void>;
}
