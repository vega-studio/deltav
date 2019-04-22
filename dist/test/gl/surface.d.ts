import { BasicCameraController, ChartCamera, EventManager, ILayerSurfaceOptions, ISceneOptions, LayerInitializer, LayerSurface, Vec4 } from "src";
export interface ISurfaceOptions {
    background?: Vec4;
    container: HTMLElement;
    eventManagers?: EventManager[] | null;
    layers?(): LayerInitializer[];
    resources?: ILayerSurfaceOptions["resources"];
    scenes?: ISceneOptions[] | null;
    makeElements?(defaultController?: BasicCameraController, defaultCamera?: ChartCamera): {
        eventManagers?: EventManager[] | null;
        layers?(): LayerInitializer[];
        scenes?: ISceneOptions[] | null;
    };
}
export declare class Surface {
    cameraControl: BasicCameraController;
    container: HTMLElement;
    context: HTMLCanvasElement;
    options: ISurfaceOptions;
    surface?: LayerSurface;
    private surfaceReadyResolver;
    surfaceReady: Promise<LayerSurface>;
    private currentTime;
    private waitForSizeContext;
    private animationFrameId;
    needsLayerUpdate: boolean;
    constructor(options: ISurfaceOptions);
    private cameraSetup;
    resize(): void;
    makeContext(): void;
    updateLayers(): void;
    init(options: Partial<ISurfaceOptions>): Promise<void>;
    destroySurface(): void;
    draw(time: number): void;
    private waitForValidDimensions;
}
