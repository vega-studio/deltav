import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { ILayerProps, Layer, LayerInitializer } from "./layer";
import { Instance } from "../instance-provider/instance";
import { IViewProps, View, ViewInitializer } from "./view";
import { ReactiveDiff } from "../util/reactive-diff";
import { Scene } from "../gl/scene";
import { Surface } from "./surface";
/**
 * Defines the input for an available scene layers can add themselves to. Each scene can be rendered with multiple
 * views.
 */
export interface ISceneOptions extends IdentifyByKeyOptions {
    /**
     * This decalres all of the layers that should be applied to this scene.
     */
    layers: LayerInitializer<Instance, ILayerProps<Instance>>[];
    /** Helps assert a guaranteed rendering order for scenes. Lower numbers reender first. */
    order?: number;
    /**
     * This indicates all of the views this scene can be rendered with. For instance: You have a
     * world scene and you want to render it stereoscopically for VR. Then you can specify two
     * views with two viewports to render the scene on both halves of the canvas.
     *
     * Or perhaps you want an aerial shot as a minimap in the bottom right corner while the rest
     * of the canvas renders a first person view, then you would make two views for that as well.
     */
    views: ViewInitializer<IViewProps>[];
}
/**
 * This defines a scene to which layers are added to. It also tracks the views that this scene
 * is rendered with.
 */
export declare class LayerScene extends IdentifyByKey {
    static DEFAULT_SCENE_ID: string;
    /** This is the GL scene which actually sets up the rendering objects */
    container: Scene | undefined;
    /** This is the diff tracker for the layers for the scene which allows us to make the pipeline easier to manage */
    layerDiffs: ReactiveDiff<Layer<Instance, ILayerProps<Instance>>, LayerInitializer<Instance, ILayerProps<Instance>>>;
    /** Helps assert a guaranteed render order for scenes. Lower numbers render first. */
    order?: number;
    /** The presiding surface over this scene */
    surface?: Surface;
    /** This is the diff tracker for the views for the scene which allows us to make the pip0eline easier to manage */
    viewDiffs: ReactiveDiff<View<IViewProps>, ViewInitializer<IViewProps>>;
    /** This is all of the layers attached to the scene */
    get layers(): Layer<any, any>[];
    /** This is all of the views attached to the scene */
    get views(): View<IViewProps>[];
    constructor(surface: Surface | undefined, options: ISceneOptions);
    /**
     * Initialize all that needs to be initialized
     */
    private init;
    /**
     * Release any resources this may be hanging onto
     */
    destroy(): void;
    /**
     * Ensures a layer is removed from the scene
     */
    removeLayer(layer: Layer<any, any>): void;
    /**
     * Hand off the diff objects to our view and layer diffs
     */
    update(options: ISceneOptions): Promise<void>;
}
