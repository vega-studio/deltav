import { Scene } from "../gl/scene";
import { Instance } from "../instance-provider/instance";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { ReactiveDiff } from "../util/reactive-diff";
import { ILayerProps, Layer } from "./layer";
import { LayerInitializer, Surface } from "./surface";
import { IViewOptions, View } from "./view";
export interface ISceneOptions extends IdentifyByKeyOptions {
    layers: LayerInitializer[];
    order?: number;
    views: IViewOptions[];
}
export declare class LayerScene extends IdentifyByKey {
    static DEFAULT_SCENE_ID: string;
    container: Scene | undefined;
    layerDiffs: ReactiveDiff<Layer<Instance, ILayerProps<Instance>>, LayerInitializer>;
    order?: number;
    surface?: Surface;
    viewDiffs: ReactiveDiff<View, IViewOptions>;
    readonly layers: Layer<any, any>[];
    readonly views: View[];
    constructor(surface: Surface | undefined, options: ISceneOptions);
    private init;
    destroy(): void;
    removeLayer(layer: Layer<any, any>): void;
    update(options: ISceneOptions): Promise<void>;
}
