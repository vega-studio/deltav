import { LayerInitializer } from "src/surface/layer-surface";
import { ReactiveDiff } from "src/util/reactive-diff";
import { Scene } from "../gl/scene";
import { Instance } from "../instance-provider/instance";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { ILayerProps, Layer } from "./layer";
import { IViewOptions, View } from "./view";

/**
 * Defines the input for an available scene layers can add themselves to. Each scene can be rendered with multiple
 * views.
 */
export interface ISceneOptions extends IdentifyByKeyOptions {
  /**
   * This decalres all of the layers that should be applied to this scene.
   */
  layers: LayerInitializer[];
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

function sortByDepth(a: Layer<any, any>, b: Layer<any, any>) {
  return a.depth - b.depth;
}

/**
 * This defines a scene to which layers are added to. It also tracks the views that this scene
 * is rendered with.
 */
export class LayerScene extends IdentifyByKey {
  static DEFAULT_SCENE_ID = "__default__";

  /** This is the three scene which actually sets up the rendering objects */
  container: Scene | undefined = new Scene();
  /** This is the diff tracker for the layers for the scene which allows us to make the pipeline easier to manage */
  layerDiffs: ReactiveDiff<LayerInitializer, Layer<Instance, ILayerProps<Instance>>>;
  /** This indicates the sort is dirty for a set of layers */
  sortIsDirty = false;
  /** This is the view */
  viewById = new Map<string, View>();
  /** This is the diff tracker for the views for the scene which allows us to make the pip0eline easier to manage */
  viewDiffs: ReactiveDiff<IViewOptions, View>;

  /** This is all of the layers attached to the scene */
  get layers(): Layer<any, any>[] {
    return this.layerDiffs.items;
  }

  /** This is all of the views attached to the scene */
  get views(): View[] {
    return this.viewDiffs.items;
  }

  constructor(options: ISceneOptions) {
    super(options);
    this.init();
  }

  /**
   * Initialize all that needs to be initialized
   */
  private init(options: ISceneOptions) {
    this.layerDiffs = new ReactiveDiff({

    });

    this.viewDiffs = new ReactiveDiff({
      buildItem: (initializer: IViewOptions) => {
        const newView = new View(initializer);
        newView.camera = newView.camera || defaultSceneElement.camera;
        newView.viewCamera =
          newView.viewCamera || defaultSceneElement.viewCamera;
        newView.pixelRatio = this.pixelRatio;

        for (const sceneView of this.sceneViews) {
          if (sceneView.view.id === newView.id) {
            console.warn(
              "You can NOT have two views with the same id. Please use unique identifiers for every view generated."
            );
          }
        }

        return newView;
      }
    });

    this.update(options);
  }

  /**
   * Release any resources this may be hanging onto
   */
  destroy() {
    delete this.container;
  }

  sortLayers() {
    if (this.sortIsDirty) {
      this.layers.sort(sortByDepth);
    }
  }

  update(options: ISceneOptions) {
    this.viewDiffs.diff(options.views);
    this.layerDiffs.diff(options.layers);
  }
}
