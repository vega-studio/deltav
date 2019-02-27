import { RenderTarget } from "src/gl";
import { WebGLRenderer } from "../gl/webgl-renderer";
import { Instance } from "../instance-provider/instance";
import { Bounds } from "../primitives/bounds";
import { Box } from "../primitives/box";
import { FrameMetrics } from "../types";
import { Vec2 } from "../util/vector";
import { EventManager } from "./event-manager";
import { ILayerProps, Layer } from "./layer";
import { ISceneOptions, LayerScene } from "./layer-scene";
import { SceneView } from "./mouse-event-manager";
import { IAtlasOptions } from "./texture/atlas";
import { AtlasResourceManager } from "./texture/atlas-resource-manager";
import { View } from "./view";
export interface ILayerSurfaceOptions {
    atlasResources?: IAtlasOptions[];
    background: [number, number, number, number];
    context?: WebGLRenderingContext | HTMLCanvasElement | string;
    eventManagers?: EventManager[];
    handlesWheelEvents?: boolean;
    pixelRatio?: number;
    scenes: ISceneOptions[];
}
export interface ILayerConstructable<T extends Instance> {
    new (props: ILayerProps<T>): Layer<any, any>;
}
export declare type LayerInitializer = [ILayerConstructable<Instance> & {
    defaultProps: ILayerProps<Instance>;
}, ILayerProps<Instance>];
export declare function createLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: U): LayerInitializer;
export declare class LayerSurface {
    private atlasManager;
    private context;
    currentViewport: Map<WebGLRenderer, Box>;
    frameMetrics: FrameMetrics;
    private isBufferingAtlas;
    layers: Map<string, Layer<Instance, ILayerProps<Instance>>>;
    private mouseManager;
    pickingTarget: RenderTarget;
    pixelRatio: number;
    renderer: WebGLRenderer;
    resourceManager: AtlasResourceManager;
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
    draw(time?: number): Promise<void>;
    private drawSceneView;
    private gatherViewDrawDependencies;
    getViewSize(viewId: string): Bounds | null;
    getViewWorldBounds(viewId: string): Bounds | null;
    init(options: ILayerSurfaceOptions): Promise<this>;
    private initGL;
    private initLayer;
    private initMouseManager;
    private initResources;
    private addLayerToScene;
    private removeLayer;
    render(layerInitializers: LayerInitializer[]): void;
    fitContainer(_pixelRatio?: number): void;
    resize(width: number, height: number, pixelRatio?: number): void;
    private setContext;
    private setRendererSize;
    updateColorPickRange(mouse: Vec2, views: View[]): void;
}
