import { Instance, InstanceProvider } from "../instance-provider";
import { Bounds } from "../primitives/bounds";
import { BaseResourceOptions } from "../resources";
import { EventManager, ISceneOptions, ISurfaceOptions, IViewOptions, Surface, View } from "../surface";
import { LayerInitializer } from "../surface/surface";
import { Lookup, Omit, Size } from "../types";
import { ChartCamera } from "../util";
export declare type BasicSurfaceView = Omit<IViewOptions, "key"> & Partial<Pick<IViewOptions, "key">>;
export declare type BasicSurfaceLayer = Omit<LayerInitializer, "key"> & Partial<Pick<IViewOptions, "key">>;
export declare type BasicSurfaceSceneOptions = Omit<ISceneOptions, "key" | "views" | "layers"> & {
    layers: Lookup<BasicSurfaceLayer>;
    views: Lookup<BasicSurfaceView>;
};
export declare type BasicSurfaceResourceOptions = Omit<BaseResourceOptions, "key"> & {
    key?: string;
};
export interface IBasicSurfacePipeline {
    scenes: Lookup<BasicSurfaceSceneOptions>;
}
export interface IBasicSurfaceOptions<T extends Lookup<InstanceProvider<Instance>>, U extends Lookup<ChartCamera>, V extends Lookup<EventManager>, W extends Lookup<BaseResourceOptions>> {
    container: HTMLElement;
    cameras: U;
    handlesWheelEvents?: boolean;
    providers: T;
    rendererOptions?: ISurfaceOptions["rendererOptions"];
    resources: W;
    eventManagers(cameras: U): V;
    pipeline(resources: W, providers: T, cameras: U, managers: V): IBasicSurfacePipeline;
    onNoWebGL?(): void;
}
export declare class BasicSurface<T extends Lookup<InstanceProvider<Instance>>, U extends Lookup<ChartCamera>, V extends Lookup<EventManager>, W extends Lookup<BaseResourceOptions>> {
    private context;
    private currentTime;
    private drawRequestId;
    private options;
    private resizeTimer;
    private waitForSizeContext;
    cameras: U;
    base?: Surface;
    eventManagers: V;
    providers: T;
    ready: Promise<BasicSurface<T, U, V, W>>;
    resources: W;
    constructor(options: IBasicSurfaceOptions<T, U, V, W>);
    private createContext;
    destroy: () => void;
    private draw;
    private handleResize;
    init(): Promise<void>;
    fitContainer(preventRedraw?: boolean): void;
    getViewProjections(viewId: string): import("../types").IProjection | null;
    getViewScreenSize(viewId: string): Size;
    getViewScreenBounds(viewId: string): Bounds<View>;
    getViewWorldBounds(viewId: string): Bounds<View>;
    pipeline(callback: IBasicSurfaceOptions<T, U, V, W>["pipeline"]): Promise<void>;
    rebuild(): Promise<void>;
    rebuild(clearProviders?: boolean): Promise<void>;
    rebuild(options?: IBasicSurfaceOptions<T, U, V, W>): Promise<void>;
    setContainer(container: HTMLElement): void;
    updatePipeline(): Promise<void>;
    private waitForValidDimensions;
}
