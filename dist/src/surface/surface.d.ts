import { EventManager } from "../event-management/event-manager";
import { UserInputEventManager } from "../event-management/user-input-event-manager";
import { RenderTarget } from "../gl";
import { WebGLRenderer } from "../gl/webgl-renderer";
import { Instance } from "../instance-provider/instance";
import { BaseProjection } from "../math";
import { Bounds } from "../math/primitives/bounds";
import { Vec2 } from "../math/vector";
import { BaseResourceManager, BaseResourceOptions, BaseResourceRequest, ResourceRouter } from "../resources";
import { FrameMetrics } from "../types";
import { IdentifiableById, IPipeline, IResourceType } from "../types";
import { ReactiveDiff } from "../util/reactive-diff";
import { BaseIOSorting } from "./base-io-sorting";
import { ILayerProps, Layer } from "./layer";
import { BaseIOExpansion } from "./layer-processing/base-io-expansion";
import { ISceneOptions, LayerScene } from "./layer-scene";
import { IViewProps, View } from "./view";
/**
 * Default IO expansion controllers applied to the system when explicit settings
 * are not provided.
 */
export declare const DEFAULT_IO_EXPANSION: BaseIOExpansion[];
/**
 * Default resource managers the system will utilize to handle default / basic resources.
 */
export declare const DEFAULT_RESOURCE_MANAGEMENT: ISurfaceOptions["resourceManagers"];
/**
 * Options for generating a new layer surface.
 */
export interface ISurfaceOptions {
    /**
     * Provides the context the surface will use while rendering
     */
    context?: HTMLCanvasElement;
    /**
     * This is the event managers to respond to the mouse events.
     */
    eventManagers?: EventManager[];
    /**
     * Set to true to allow this surface to absorb and handle wheel events from the mouse.
     */
    handlesWheelEvents?: boolean;
    /**
     * Provides additional expansion controllers that will contribute to our Shader IO configuration
     * for the layers. If this is not provided, this defaults to default system behaviors.
     *
     * To add additional Expansion controllers and keep default system controllers utilize a Function
     * instead:
     *
     * ioExpansion: (defaultExpanders: BaseIOExpansion) => [...defaultExpanders, <your own expanders>]
     *
     * For instance: easing properties on attributes requires the attribute to be expanded to additional
     * attributes + modified behavior of the base attribute. Thus the system by default adds in the
     * EasinggIOExpansion controller when this is not provided to make those property types work.
     */
    ioExpansion?: BaseIOExpansion[] | ((defaultExpanders: BaseIOExpansion[]) => BaseIOExpansion[]);
    /**
     * This specifies the density of rendering in the surface. The default value is window.devicePixelRatio to match the
     * monitor for optimal clarity. Using a value of 1 will be acceptable, will not get high density renders, but will
     * have better performance if needed.
     */
    pixelRatio?: number;
    /** Sets some options for the renderer which deals with top level settings that can only be set when the context is retrieved */
    rendererOptions?: {
        /**
         * This indicates the back buffer for the webgl context will have an alpha channel. This affects performance some, but is mainly
         * for the DOM compositing the canvas with the other DOM elements.
         */
        alpha?: boolean;
        /** Hardware antialiasing. Disabled by default. Enabled makes things prettier but slower. */
        antialias?: boolean;
        /**
         * This tells the browser what to expect from the colors rendered into the canvas. This will affect how compositing
         * the canvas with the rest of the DOM will be accomplished. This should match the color values being written to
         * the final FBO target (render target null). If incorrect, bizarre color blending with the DOM can occur.
         */
        premultipliedAlpha?: boolean;
        /**
         * This sets what the browser will do with the target frame buffer object after it's done using it for compositing.
         * If you wish to take a snap shot of the canvas being rendered into, this must be true. This has the potential
         * to hurt performance, thus it is disabled by default.
         */
        preserveDrawingBuffer?: boolean;
    };
    /**
     * This specifies the resource managers that will be applied to the surface. If this is not
     * provided, this will default to DEFAULT_RESOURCE_MANAGEMENT.
     *
     * To add additional managers to the default framework:
     * [
     *   ...DEFAULT_RESOURCE_MANAGEMENT,
     *   <your own resource managers>
     * ]
     *
     * Resource managers handle a layer's requests for a resource (this.resource.request(layer, instance, requestObject))
     * during update cycles of the attributes.
     */
    resourceManagers?: {
        type: number;
        manager: BaseResourceManager<IResourceType, BaseResourceRequest>;
    }[];
}
/**
 * This is a render controller for managing GPU rendering techniques via a layering system. This is the entry object
 * that contains and monitors all resources for performing the GPU actions.
 */
export declare class Surface {
    /** This is the gl context this surface is rendering to */
    private context;
    /**
     * This is the metrics of the current running frame
     */
    frameMetrics: FrameMetrics;
    /** This is used to help resolve concurrent draws and resolving resource request dequeue operations. */
    private isBufferingResources;
    /** These are the registered expanders of Shader IO configuration */
    private ioExpanders;
    /**
     * This is the sorting controller for sorting attributes/uniforms of a layer after all the attributes have been
     * generated that are needed
     */
    ioSorting: BaseIOSorting;
    /** This is all of the layers in this manager by their id */
    layers: Map<string, Layer<Instance, ILayerProps<Instance>>>;
    /** This manages the mouse events for the current canvas context */
    mouseManager: UserInputEventManager;
    /** This is a target used to perform rendering our picking pass */
    pickingTarget: RenderTarget;
    /** This is the density the rendering renders for the surface */
    pixelRatio: number;
    /** This is the THREE render system we use to render scenes with views */
    renderer: WebGLRenderer;
    /** This is the resource manager that handles resource requests for instances */
    resourceManager: ResourceRouter;
    /** When set to true, the next render will make sure color picking is updated for layer interactions */
    updateColorPick?: {
        position: Vec2;
        views: View<IViewProps>[];
    };
    /**
     * This map is a quick look up for a view to determine other views that
     * would need to be redrawn as a consequence of the key view needing a redraw.
     */
    private viewDrawDependencies;
    /**
     * This is used to indicate the surface has loaded it's initial systems. This is complete after init has executed
     * successfully for this surface.
     */
    ready: Promise<Surface>;
    /** This is used to reolve this surface as ready */
    private readyResolver;
    /**
     * Picking gets deferred to the beginning of next draw. Thus picking operations get queued till next
     * frame using this store here.
     */
    private queuedPicking?;
    /** Diff manager to handle diffing resource objects for the pipeline */
    resourceDiffs: ReactiveDiff<IdentifiableById, BaseResourceOptions>;
    /** Diff manager to handle diffing scene objects for the pipeline */
    sceneDiffs: ReactiveDiff<LayerScene, ISceneOptions>;
    constructor(options?: ISurfaceOptions);
    /** Read only getter for the gl context */
    readonly gl: WebGLRenderingContext;
    /** Get all of the scenes for this surface */
    readonly scenes: LayerScene[];
    /**
     * Retrieves all IO Expanders applied to this surface
     */
    getIOExpanders(): BaseIOExpansion[];
    /**
     * Retrieves the controller for sorting the IO for the layers.
     */
    getIOSorting(): BaseIOSorting;
    /**
     * This processes what is rendered into the picking render target to see if the mouse interacted with
     * any elements.
     */
    private analyzePickRendering;
    /**
     * The performs all of the needed updates that layers need to commit to the scene and buffers
     * to be ready for a draw pass. This is callable outside of the draw loop to allow for specialized
     * procedures or optimizations to take place, where incremental updates to the buffers would make
     * the most sense.
     *
     * @param time The start time of the given frame
     * @param frameIncrement When true, the frame count for the frame metrics will increment
     * @param onViewReady Callback for when all of the layers of a scene view have been committed
     *                    and are thus potentially ready to be rendered.
     */
    commit(time?: number, frameIncrement?: boolean, onViewReady?: (needsDraw: boolean, scene: LayerScene, view: View<IViewProps>, pickingPass: Layer<any, any>[]) => void): Promise<void>;
    /**
     * Free all resources consumed by this surface that gets applied to the GPU.
     */
    destroy(): void;
    /**
     * This is the draw loop that must be called per frame for updates to take effect and display.
     *
     * @param time This is an optional time flag so one can manually control the time flag for the frame.
     *             This will affect animations and other automated gpu processes.
     */
    draw(time?: number): Promise<void>;
    /**
     * NOTE: This is a temp way to handle picking. Picking will be handled with MRT once that pipeline is set up.
     *
     * This renders a selected scene/view into our picking target. Settings get adjusted
     */
    private drawPicking;
    /**
     * This finalizes everything and sets up viewports and clears colors and performs the actual render step
     */
    private drawSceneView;
    /**
     * This gathers all the overlap views of every view
     */
    private gatherViewDrawDependencies;
    /**
     * This allws for querying a view's screen bounds. Null i;s returned if the view id
     * specified does not exist.
     */
    getViewSize(viewId: string): Bounds<View<IViewProps>> | null;
    /**
     * This queries a view's window into a world's space.
     */
    getViewWorldBounds(viewId: string): Bounds<never> | null;
    /**
     * Retrieves the projection methods for a given view, null if the view id does not exist
     * in the surface
     */
    getProjections(viewId: string): BaseProjection<any> | null;
    /**
     * This is the beginning of the system. This should be called immediately after the surface is constructed.
     * We make this mandatory outside of the constructor so we can make it follow an async pattern.
     */
    init(options: ISurfaceOptions): Promise<this>;
    /**
     * This initializes the Canvas GL contexts needed for rendering.
     */
    private initGL;
    /**
     * Initializes the expanders that should be applied to the surface for layer processing.
     */
    private initIOExpanders;
    /**
     * Initializes elements for handling mouse interactions with the canvas.
     */
    private initMouseManager;
    /**
     * This initializes resources needed or requested such as textures or render surfaces.
     */
    private initResources;
    /**
     * Use this to establish the rendering pipeline the application should be using at the current time.
     *
     * NOTE: If you update the pipeline on a loop of any sort, you will want to await the pipeline to complete
     * it's diff before you issue a draw command. Failure to do so invites undefined behavior which often causes
     * elements tobe comepltely not rendered at all in many cases.
     */
    pipeline(pipeline: IPipeline): Promise<void>;
    /**
     * This must be executed when the canvas changes size so that we can re-calculate the scenes and views
     * dimensions for handling all of our rendered elements.
     */
    fitContainer(_pixelRatio?: number): void;
    /**
     * This resizes the canvas and retains pixel ratios amongst all of the resources involved.
     */
    resize(width: number, height: number, pixelRatio?: number): void;
    /**
     * This applies a new size to the renderer and resizes any additional resources that requires being
     * sized along with the renderer.
     */
    private setRendererSize;
    /**
     * This triggers an update to all of the layers that perform picking, the pixel data
     * within the specified mouse range.
     */
    updateColorPickPosition(position: Vec2, views: View<IViewProps>[]): void;
}
