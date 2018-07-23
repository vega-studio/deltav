import * as Three from "three";
import { Instance } from "../instance-provider/instance";
import { ILayerProps, Layer } from "../surface/layer";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { IViewOptions, View } from "./view";
export interface ISceneOptions extends IdentifyByKeyOptions {
    views: IViewOptions[];
}
export declare class Scene extends IdentifyByKey {
    static DEFAULT_SCENE_ID: string;
    container: Three.Scene | undefined;
    pickingContainer: Three.Scene;
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
