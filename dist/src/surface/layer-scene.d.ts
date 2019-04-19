import { Scene } from "../gl/scene";
import { Instance } from "../instance-provider/instance";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { ILayerProps, Layer } from "./layer";
import { IViewOptions, View } from "./view";
export interface ISceneOptions extends IdentifyByKeyOptions {
    views: IViewOptions[];
}
export declare class LayerScene extends IdentifyByKey {
    static DEFAULT_SCENE_ID: string;
    container: Scene | undefined;
    layers: Layer<any, any>[];
    sortIsDirty: boolean;
    viewById: Map<string, View>;
    constructor(options: ISceneOptions);
    addLayer<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>): void;
    addView(view: View): void;
    destroy(): void;
    removeLayer(layer: Layer<any, any>): void;
    sortLayers(): void;
}
