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

function sortByDepth(a: Layer<any, any, any>, b: Layer<any, any, any>) {
  return a.depth - b.depth;
}

/**
 * This defines a scene to which layers are added to. It also tracks the views that this scene
 * is rendered with.
 */
export class Scene extends IdentifyByKey {
  static DEFAULT_SCENE_ID = '__default__';

  /** This is the three scene which actually sets up the rendering objects */
  container: Three.Scene = new Three.Scene();
  /** This is all of the layers tracked to the scene */
  layers: Layer<any, any, any>[] = [];
  /** This indicates the sort is dirty for a set of layers */
  sortIsDirty = false;
  /** This is the view */
  viewById = new Map<string, View>();

  constructor(options: ISceneOptions) {
    super(options);
    this.container.frustumCulled = false;
    this.container.autoUpdate = false;
  }

  /**
   * Adds a layer to the scene with the current view setting the layer contains.
   * The layer can not jump between views or scenes. You must destroy and reconstruct
   * the layer.
   */
  addLayer(layer: Layer<any, any, any>) {
    // Add the layer to the list of layers under the view
    this.layers.push(layer);
    this.sortIsDirty = true;
  }

  /**
   * This adds a view to this scene to be used by the scene
   */
  addView(view: View) {
    this.viewById.set(view.id, view);
  }

  /**
   * Release any resources this may be hanging onto
   */
  destroy() {
    this.container = null;
  }

  /**
   * Removes a layer from the scene. No resort is needed as remove operations
   * do not adjust the sorting order.
   */
  removeLayer(layer: Layer<any, any, any>) {
    if (this.layers) {
      const index = this.layers.indexOf(layer);

      if (index >= 0) {
        this.layers.splice(index, 1);
        return;
      }
    }

    console.warn('Could not remove a layer from the scene as the layer was not a part of the scene to start. Scene:', this.id, 'Layer:', layer.id);
  }

  sortLayers() {
    if (this.sortIsDirty) {
      this.layers.sort(sortByDepth);
    }
  }
}
