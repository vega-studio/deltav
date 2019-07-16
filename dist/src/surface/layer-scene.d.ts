import { Scene } from "../gl/scene";
import { Instance } from "../instance-provider/instance";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { ReactiveDiff } from "../util/reactive-diff";
import { ILayerProps, Layer, LayerInitializer } from "./layer";
import { Surface } from "./surface";
import { IViewProps, View, ViewInitializer } from "./view";
export interface ISceneOptions extends IdentifyByKeyOptions {
    layers: LayerInitializer[];
    order?: number;
    views: ViewInitializer<IViewProps>[];
}
export declare class LayerScene extends IdentifyByKey {
    static DEFAULT_SCENE_ID: string;
    container: Scene | undefined;
    layerDiffs: ReactiveDiff<Layer<Instance, ILayerProps<Instance>>, LayerInitializer>;
    order?: number;
    surface?: Surface;
    viewDiffs: ReactiveDiff<View<IViewProps>, ViewInitializer<IViewProps>>;
    readonly layers: Layer<any, any>[];
    readonly views: View<IViewProps>[];
    constructor(surface: Surface | undefined, options: ISceneOptions);
    private init;
    destroy(): void;
    removeLayer(layer: Layer<any, any>): void;
    update(options: ISceneOptions): Promise<void>;
}
