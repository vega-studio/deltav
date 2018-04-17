import * as Three from 'three';
import { Layer } from '../surface/layer';
import { IdentifyByKey, IdentifyByKeyOptions } from '../util/identify-by-key';
import { IViewOptions, View } from './view';
/**
 * Defines the input for an available scene layers can add themselves to. Each scene can be rendered with multiple
 * views.
 */
export interface ISceneOptions extends IdentifyByKeyOptions {
    /**
     * This indicates all of the views this scene can be rendered with. For instance: You have a
     * world scene and you want to render it stereoscopically for VR. Then you can specify two
     * views with two viewports to render the scene on both halves of the canvas.
     *
     * Or perhaps you want an aerial shot as a minimap in the bottom right corner while the rest
     * of the canvas renders a first person view, then you would make two views for that as well.
     */
    views: IViewOptions[];
}
/**
 * This defines a scene to which layers are added to. It also tracks the views that this scene
 * is rendered with.
 */
export declare class Scene extends IdentifyByKey {
    static DEFAULT_SCENE_ID: string;
    /** This is the three scene which actually sets up the rendering objects */
    container: Three.Scene;
    /** This is all of the layers tracked to the scene */
    layers: Layer<any, any, any>[];
    /** This indicates the sort is dirty for a set of layers */
    sortIsDirty: boolean;
    /** This is the view */
    viewById: Map<string, View>;
    constructor(options: ISceneOptions);
    /**
     * Adds a layer to the scene with the current view setting the layer contains.
     * The layer can not jump between views or scenes. You must destroy and reconstruct
     * the layer.
     */
    addLayer(layer: Layer<any, any, any>): void;
    /**
     * This adds a view to this scene to be used by the scene
     */
    addView(view: View): void;
    /**
     * Removes a layer from the scene. No resort is needed as remove operations
     * do not adjust the sorting order.
     */
    removeLayer(layer: Layer<any, any, any>): void;
    sortLayers(): void;
}
