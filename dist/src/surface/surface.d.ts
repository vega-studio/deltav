import { RenderTarget } from "../gl";
import { WebGLRenderer } from "../gl/webgl-renderer";
import { Instance } from "../instance-provider/instance";
import { Bounds } from "../primitives/bounds";
import { BaseResourceManager, BaseResourceOptions, BaseResourceRequest, ResourceRouter } from "../resources";
import { FrameMetrics, Omit } from "../types";
import { IdentifiableById, IPipeline, IProjection, IResourceType } from "../types";
import { ReactiveDiff } from "../util/reactive-diff";
import { Vec2 } from "../util/vector";
import { BaseIOSorting } from "./base-io-sorting";
import { EventManager } from "./event-manager";
import { ILayerProps, ILayerPropsInternal, Layer } from "./layer";
import { BaseIOExpansion } from "./layer-processing/base-io-expansion";
import { ISceneOptions, LayerScene } from "./layer-scene";
import { MouseEventManager } from "./mouse-event-manager";
import { View } from "./view";
export declare const DEFAULT_IO_EXPANSION: BaseIOExpansion[];
export declare const DEFAULT_RESOURCE_MANAGEMENT: ISurfaceOptions["resourceManagers"];
export interface ISurfaceOptions {
    context?: HTMLCanvasElement;
    eventManagers?: EventManager[];
    handlesWheelEvents?: boolean;
    ioExpansion?: BaseIOExpansion[] | ((defaultExpanders: BaseIOExpansion[]) => BaseIOExpansion[]);
    pixelRatio?: number;
    rendererOptions?: {
        alpha?: boolean;
        antialias?: boolean;
        premultipliedAlpha?: boolean;
        preserveDrawingBuffer?: boolean;
    };
    resourceManagers?: {
        type: number;
        manager: BaseResourceManager<IResourceType, BaseResourceRequest>;
    }[];
}
export interface ILayerConstructable<T extends Instance> {
    new (surface: Surface, scene: LayerScene, props: ILayerProps<T>): Layer<any, any>;
}
export declare type ILayerConstructionClass<T extends Instance, U extends ILayerProps<T>> = ILayerConstructable<T> & {
    defaultProps: U;
};
export declare type LayerInitializer = {
    key: string;
    init: [ILayerConstructionClass<Instance, ILayerProps<Instance>>, ILayerProps<Instance>];
};
export declare type LayerInitializerInternal = {
    key: string;
    init: [ILayerConstructionClass<Instance, ILayerPropsInternal<Instance>>, ILayerPropsInternal<Instance>];
};
export declare function createLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: Omit<U, "key"> & Partial<Pick<U, "key">>): LayerInitializer;
export declare class Surface {
    private context;
    frameMetrics: FrameMetrics;
    private isBufferingResources;
    private ioExpanders;
    ioSorting: BaseIOSorting;
    layers: Map<string, Layer<Instance, ILayerProps<Instance>>>;
    mouseManager: MouseEventManager;
    pickingTarget: RenderTarget;
    pixelRatio: number;
    renderer: WebGLRenderer;
    resourceManager: ResourceRouter;
    updateColorPick?: {
        mouse: Vec2;
        views: View[];
    };
    private viewDrawDependencies;
    ready: Promise<Surface>;
    private readyResolver;
    private queuedPicking?;
    resourceDiffs: ReactiveDiff<IdentifiableById, BaseResourceOptions>;
    sceneDiffs: ReactiveDiff<LayerScene, ISceneOptions>;
    constructor(options?: ISurfaceOptions);
    readonly gl: WebGLRenderingContext;
    readonly scenes: LayerScene[];
    getIOExpanders(): BaseIOExpansion[];
    getIOSorting(): BaseIOSorting;
    commit(time?: number, frameIncrement?: boolean, onViewReady?: (needsDraw: boolean, scene: LayerScene, view: View, pickingPass: Layer<any, any>[]) => void): Promise<void>;
    destroy(): void;
    private analyzePickRendering;
    draw(time?: number): Promise<void>;
    private drawPicking;
    private drawSceneView;
    private gatherViewDrawDependencies;
    getViewSize(viewId: string): Bounds<View> | null;
    getViewWorldBounds(viewId: string): Bounds<never> | null;
    getProjections(viewId: string): IProjection | null;
    init(options: ISurfaceOptions): Promise<this>;
    private initGL;
    private initIOExpanders;
    private initMouseManager;
    private initResources;
    pipeline(pipeline: IPipeline): Promise<void>;
    fitContainer(_pixelRatio?: number): void;
    resize(width: number, height: number, pixelRatio?: number): void;
    private setRendererSize;
    updateColorPickRange(mouse: Vec2, views: View[]): void;
}
