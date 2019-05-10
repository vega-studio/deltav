import { RenderTarget } from "../gl";
import { WebGLRenderer } from "../gl/webgl-renderer";
import { Instance } from "../instance-provider/instance";
import { Bounds } from "../primitives/bounds";
import { BaseResourceManager, BaseResourceOptions, ResourceManager } from "../resources";
import { IProjection, IResourceType } from "../types";
import { FrameMetrics } from "../types";
import { Vec2 } from "../util/vector";
import { BaseIOSorting } from "./base-io-sorting";
import { EventManager } from "./event-manager";
import { ILayerProps, ILayerPropsInternal, Layer } from "./layer";
import { BaseIOExpansion } from "./layer-processing/base-io-expansion";
import { ISceneOptions, LayerScene } from "./layer-scene";
import { SceneView } from "./mouse-event-manager";
import { View } from "./view";
export declare const DEFAULT_IO_EXPANSION: BaseIOExpansion[];
export declare const DEFAULT_RESOURCE_MANAGEMENT: ILayerSurfaceOptions["resourceManagers"];
export interface ILayerSurfaceOptions {
    background: [number, number, number, number];
    context?: HTMLCanvasElement;
    eventManagers?: EventManager[];
    handlesWheelEvents?: boolean;
    ioExpansion?: BaseIOExpansion[] | ((defaultExpanders: BaseIOExpansion[]) => BaseIOExpansion[]);
    pixelRatio?: number;
    rendererOptions?: {
        antialias?: boolean;
        premultipliedAlpha?: boolean;
        preserveDrawingBuffer?: boolean;
    };
    resources?: BaseResourceOptions[];
    resourceManagers?: {
        type: number;
        manager: BaseResourceManager<IResourceType, IResourceType>;
    }[];
    scenes: ISceneOptions[];
}
export interface ILayerConstructable<T extends Instance> {
    new (props: ILayerProps<T>): Layer<any, any>;
}
export declare type ILayerConstructionClass<T extends Instance, U extends ILayerProps<T>> = ILayerConstructable<T> & {
    defaultProps: U;
};
export declare type LayerInitializer = [ILayerConstructionClass<Instance, ILayerProps<Instance>>, ILayerProps<Instance>];
export declare type LayerInitializerInternal = [ILayerConstructionClass<Instance, ILayerPropsInternal<Instance>>, ILayerPropsInternal<Instance>];
export declare function createLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: U): LayerInitializer;
export declare class LayerSurface {
    private context;
    frameMetrics: FrameMetrics;
    private isBufferingResources;
    private ioExpanders;
    ioSorting: BaseIOSorting;
    layers: Map<string, Layer<Instance, ILayerProps<Instance>>>;
    private mouseManager;
    pickingTarget: RenderTarget;
    pixelRatio: number;
    renderer: WebGLRenderer;
    resourceManager: ResourceManager;
    scenes: Map<string, LayerScene>;
    sceneViews: SceneView[];
    updateColorPick?: {
        mouse: Vec2;
        views: View[];
    };
    willDisposeLayer: Map<string, boolean>;
    private viewDrawDependencies;
    private loadReadyResolve;
    loadReady: Promise<void>;
    readonly gl: WebGLRenderingContext;
    private addLayer;
    commit(time?: number, frameIncrement?: boolean, onViewReady?: (needsDraw: boolean, scene: LayerScene, view: View, pickingPass: Layer<any, any>[]) => void): Promise<void>;
    destroy(): void;
    private queuedPicking?;
    private analyzePickRendering;
    draw(time?: number): Promise<void>;
    private drawPicking;
    private drawSceneView;
    private gatherViewDrawDependencies;
    getViewSize(viewId: string): Bounds<never> | null;
    getViewWorldBounds(viewId: string): Bounds<never> | null;
    getProjections(viewId: string): IProjection | null;
    init(options: ILayerSurfaceOptions): Promise<this | undefined>;
    private initGL;
    private initIOExpanders;
    private initLayer;
    private initMouseManager;
    private initResources;
    private addLayerToScene;
    private removeLayer;
    private expandLayerChildren;
    private updateLayer;
    private generateLayer;
    render(layerInitializers: LayerInitializer[]): void;
    fitContainer(_pixelRatio?: number): void;
    resize(width: number, height: number, pixelRatio?: number): void;
    private setRendererSize;
    updateColorPickRange(mouse: Vec2, views: View[]): void;
}
