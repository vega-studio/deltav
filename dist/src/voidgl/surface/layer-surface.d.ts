import * as Three from 'three';
import { Bounds } from '../primitives/bounds';
import { Box } from '../primitives/box';
import { EventManager } from '../surface/event-manager';
import { IDefaultSceneElements } from '../surface/generate-default-scene';
import { SceneView } from '../surface/mouse-event-manager';
import { ISceneOptions, Scene } from '../surface/scene';
import { View } from '../surface/view';
import { FrameMetrics } from '../types';
import { Instance } from '../util/instance';
import { Vec2 } from '../util/vector';
import { ILayerProps, Layer } from './layer';
import { IAtlasOptions } from './texture/atlas';
import { AtlasResourceManager } from './texture/atlas-resource-manager';
export interface ILayerSurfaceOptions {
    /**
     * These are the atlas resources we want available that our layers can be provided to utilize
     * for their internal processes.
     */
    atlasResources?: IAtlasOptions[];
    /**
     * This is the color the canvas will be set to.
     */
    background: [number, number, number, number];
    /**
     * If this is provided, it will use this context for rendering. If a string is provided
     * it will search for the canvas context by id.
     */
    context?: WebGLRenderingContext | HTMLCanvasElement | string;
    /**
     * This is the event managers to respond to the mouse events.
     */
    eventManagers?: EventManager[];
    /**
     * Set to true to allow this surface to absorb and handle wheel events from the mouse.
     */
    handlesWheelEvents?: boolean;
    /**
     * This specifies the density of rendering in the surface. The default value is window.devicePixelRatio to match the
     * monitor for optimal clarity. Using a value of 1 will be acceptable, will not get high density renders, but will
     * have better performance if needed.
     */
    pixelRatio?: number;
    /**
     * This sets up the available scenes the surface will have to work with. Layers then can
     * reference the scene by it's scene property. The order of the scenes here is the drawing
     * order of the scenes.
     */
    scenes?: ISceneOptions[];
}
export interface ILayerConstructable<T extends Instance> {
    new (props: ILayerProps<T>): Layer<any, any>;
}
/**
 * This is a pair of a Class Type and the props to be applied to that class type.
 */
export declare type LayerInitializer = [ILayerConstructable<Instance> & {
    defaultProps: ILayerProps<Instance>;
}, ILayerProps<Instance>];
/**
 * Used for reactive layer generation and updates.
 */
export declare function createLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: U): LayerInitializer;
/**
 * This is a manager for layers. It will use voidgl layers to intelligently render resources
 * as efficiently as possible. Layers will be rendered in the order they are provided and this
 * surface will provide some basic camera controls by default.
 */
export declare class LayerSurface {
    /** This is the atlas manager that will help with modifying and tracking atlas' generated for the layers */
    private atlasManager;
    /** This is the gl context this surface is rendering to */
    private context;
    /** This is the current viewport the renderer state is in */
    currentViewport: Map<Three.WebGLRenderer, Box>;
    /**
     * This is the default scene that layers get added to if they do not specify a valid Scene.
     * This scene by default only has a single default view.
     */
    defaultSceneElements: IDefaultSceneElements;
    /**
     * This is the metrics of the current running frame
     */
    frameMetrics: FrameMetrics;
    /**
     * This is used to help resolve concurrent draws. There are some very async operations that should
     * not overlap in draw calls.
     */
    private isBufferingAtlas;
    /** This is all of the layers in this manager by their id */
    layers: Map<string, Layer<any, any>>;
    /** This manages the mouse events for the current canvas context */
    private mouseManager;
    /**
     * This is the renderer that is meant for rendering the picking pass. We have a separate renderer so we can disable
     * over complicated features like antialiasing which would ruin the picking pass.
     */
    pickingRenderer: Three.WebGLRenderer;
    /** This is a target used to perform rendering our picking pass */
    pickingTarget: Three.WebGLRenderTarget;
    /** This is the density the rendering renders for the surface */
    pixelRatio: number;
    /** This is the THREE render system we use to render scenes with views */
    renderer: Three.WebGLRenderer;
    /** This is the resource manager that handles resource requests for instances */
    resourceManager: AtlasResourceManager;
    /**
     * This is all of the available scenes and their views for this surface. Layers reference the IDs
     * of the scenes and the views to be a part of their rendering state.
     */
    scenes: Map<string, Scene>;
    /**
     * This is all of the views currently generated for this surface paired with the scene they render.
     */
    sceneViews: SceneView[];
    /** When set to true, the next render will make sure color picking is updated for layer interactions */
    updateColorPick?: {
        mouse: Vec2;
        views: View[];
    };
    /**
     * This flags all layers by id for disposal at the end of every render. A Layer must be recreated
     * after each render in order to clear it's disposal flag. This is the trick to making this a
     * reactive system.
     */
    willDisposeLayer: Map<string, boolean>;
    /** Read only getter for the gl context */
    readonly gl: WebGLRenderingContext;
    /**
     * This adds a layer to the manager which will manage all of the resource lifecycles of the layer
     * as well as additional helper injections to aid in instancing and shader i/o.
     */
    private addLayer<T, U, V>(layer);
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
     * This finalizes everything and sets up viewports and clears colors and performs the actual render step
     */
    private drawSceneView(scene, view, renderer?, target?);
    /**
     * This allows for querying a view's screen bounds. Null is returned if the view id
     * specified does not exist.
     */
    getViewSize(viewId: string): Bounds | null;
    /**
     * This queries a view's window into a world's space.
     */
    getViewWorldBounds(viewId: string): Bounds | null;
    /**
     * This is the beginning of the system. This should be called immediately after the surface is constructed.
     * We make this mandatory outside of the constructor so we can make it follow an async pattern.
     */
    init(options: ILayerSurfaceOptions): Promise<this>;
    /**
     * This initializes the Canvas GL contexts needed for rendering.
     */
    private initGL(options);
    /**
     * This does special initialization by gathering the layers shader IO, generates a material
     * and injects special automated uniforms and attributes to make instancing work for the
     * shader.
     */
    private initLayer<T, U, V>(layer);
    /**
     * Initializes elements for handling mouse interactions with the canvas.
     */
    private initMouseManager(options);
    /**
     * This initializes resources needed or requested such as textures or render surfaces.
     */
    private initResources(options);
    /**
     * This finds the scene and view the layer belongs to based on the layer's props. For invalid or not provided
     * props, the layer gets added to default scenes and views.
     */
    private addLayerToScene<T, U, V>(layer);
    /**
     * Discontinues a layer's management by this surface. This will invalidate any resources
     * the layer was using in association with the context. If the layer is re-insertted, it will
     * be revaluated as though it were a new layer.
     */
    private removeLayer<T, U, V>(layer);
    /**
     * Used for reactive rendering and diffs out the layers for changed layers.
     */
    render(layerInitializers: LayerInitializer[]): void;
    /**
     * This must be executed when the canvas changes size so that we can re-calculate the scenes and views
     * dimensions for handling all of our rendered elements.
     */
    fitContainer(pixelRatio?: number): void;
    /**
     * This resizes the canvas and retains pixel ratios amongst all of the resources involved.
     */
    resize(width: number, height: number, pixelRatio?: number): void;
    /**
     * This establishes the rendering canvas context for the surface.
     */
    private setContext(context?);
    /**
     * This applies a new size to the renderer and resizes any additional resources that requires being
     * sized along with the renderer.
     */
    private setRendererSize(width, height);
    /**
     * This triggers an update to all of the layers that perform picking, the pixel data
     * within the specified mouse range.
     */
    updateColorPickRange(mouse: Vec2, views: View[]): void;
}
