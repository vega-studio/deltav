import * as Three from "three";
import { Bounds } from "../primitives/bounds";
import { Box } from "../primitives/box";
import { EventManager } from "../surface/event-manager";
import { IDefaultSceneElements } from "../surface/generate-default-scene";
import { SceneView } from "../surface/mouse-event-manager";
import { ISceneOptions, Scene } from "../surface/scene";
import { View } from "../surface/view";
import { FrameMetrics } from "../types";
import { Instance } from "../util/instance";
import { ILayerProps, Layer } from "./layer";
import { IAtlasOptions } from "./texture/atlas";
import { AtlasResourceManager } from "./texture/atlas-resource-manager";
export interface ILayerSurfaceOptions {
    atlasResources?: IAtlasOptions[];
    background: [number, number, number, number];
    context?: WebGLRenderingContext | HTMLCanvasElement | string;
    eventManagers?: EventManager[];
    handlesWheelEvents?: boolean;
    pixelRatio?: number;
    scenes?: ISceneOptions[];
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
    currentViewport: Box;
    defaultSceneElements: IDefaultSceneElements;
    frameMetrics: FrameMetrics;
    private isBufferingAtlas;
    layers: Map<string, Layer<any, any>>;
    private mouseManager;
    pixelRatio: number;
    renderer: Three.WebGLRenderer;
    resourceManager: AtlasResourceManager;
    scenes: Map<string, Scene>;
    sceneViews: SceneView[];
    willDisposeLayer: Map<string, boolean>;
    readonly gl: WebGLRenderingContext;
    private addLayer<T, U>(layer);
    commit(time?: number, frameIncrement?: boolean, onViewReady?: (scene: Scene, view: View) => void): Promise<void>;
    destroy(): void;
    draw(time?: number): Promise<void>;
    private drawSceneView(scene, view);
    getViewSize(viewId: string): Bounds | null;
    getViewWorldBounds(viewId: string): Bounds | null;
    init(options: ILayerSurfaceOptions): Promise<this>;
    private initGL(options);
    private initLayer<T, U>(layer);
    private initMouseManager(options);
    private initResources(options);
    private addLayerToScene<T, U>(layer);
    private removeLayer<T, U>(layer);
    render(layerInitializers: LayerInitializer[]): void;
    fitContainer(_pixelRatio?: number): void;
    resize(width: number, height: number, pixelRatio?: number): void;
    private setContext(context?);
}
