import { Scene } from "../gl/scene";
import { Instance } from "../instance-provider/instance";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { ReactiveDiff } from "../util/reactive-diff";
import {
  ILayerProps,
  ILayerPropsInternal,
  Layer,
  LayerInitializer,
  LayerInitializerInternal,
} from "./layer";
import { generateDefaultScene } from "./layer-processing/generate-default-scene";
import { Surface } from "./surface";
import { IViewProps, View, ViewInitializer } from "./view";
import Debug from "debug";

const debug = Debug("performance");

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
export class LayerScene extends IdentifyByKey {
  static DEFAULT_SCENE_ID = "__default__";

  /** This is the GL scene which actually sets up the rendering objects */
  container: Scene | undefined = new Scene();
  /** This is the diff tracker for the layers for the scene which allows us to make the pipeline easier to manage */
  layerDiffs!: ReactiveDiff<
    Layer<Instance, ILayerProps<Instance>>,
    LayerInitializer<Instance, ILayerProps<Instance>>
  >;
  /** Helps assert a guaranteed render order for scenes. Lower numbers render first. */
  order?: number;
  /** The presiding surface over this scene */
  surface?: Surface;
  /** This is the diff tracker for the views for the scene which allows us to make the pip0eline easier to manage */
  viewDiffs!: ReactiveDiff<View<IViewProps>, ViewInitializer<IViewProps>>;

  /** This is all of the layers attached to the scene */
  get layers(): Layer<any, any>[] {
    return this.layerDiffs.items;
  }

  /** This is all of the views attached to the scene */
  get views(): View<IViewProps>[] {
    return this.viewDiffs.items;
  }

  constructor(surface: Surface | undefined, options: ISceneOptions) {
    super(options);
    this.surface = surface;
    this.init(options);
  }

  /**
   * Initialize all that needs to be initialized
   */
  private init(options: ISceneOptions) {
    // Make sure there is a rendering context set up
    if (!this.surface || !this.surface.gl) return;
    // Make a Scene for the GL layer to accept and render objects from
    this.container = new Scene();
    // Make default scene elements
    const defaultElements = generateDefaultScene(this.surface.gl);

    // Create the diff manager to handle the layers coming in.
    this.layerDiffs = new ReactiveDiff({
      buildItem: async (initializer: LayerInitializerInternal) => {
        debug("Building layer", initializer.key);
        if (!this.surface) return null;
        const layerClass = initializer.init[0];
        const props = initializer.init[1];
        // Generate the new layer and provide it it's initial props
        const layer = new layerClass(
          this.surface,
          this,
          Object.assign({}, layerClass.defaultProps, props)
        );
        // Keep the initializer object that generated the layer for reference and debugging
        layer.initializer = initializer;
        // Sync the data provider applied to the layer in case the provider has existing data
        // before being applied to the layer
        layer.props.data.sync();
        // Look in the props of the layer for the parent of the layer
        layer.parent = props.parent;

        // If the parent is present, the parent should have the child added
        if (props.parent) {
          if (props.parent.children) props.parent.children.push(layer);
          else props.parent.children = [layer];
        }

        // Add the layer to this surface
        if (!layer.init(this.views)) {
          console.warn(
            "Error initializing layer:",
            props.key,
            "A layer was unable to be added to the surface. See previous warnings (if any) to determine why they could not be instantiated"
          );

          return null;
        }

        // Get the children for the layer
        const children = layer.childLayers();
        // Add in the children of the layer
        this.layerDiffs.inline(children);

        return layer;
      },

      destroyItem: async (
        initializer: LayerInitializer<Instance, ILayerProps<Instance>>,
        layer: Layer<Instance, ILayerProps<Instance>>
      ) => {
        debug("Destroying layer", initializer.key);
        layer.destroy();
        return true;
      },

      updateItem: async (
        initializer: LayerInitializer<Instance, ILayerProps<Instance>>,
        layer: Layer<Instance, ILayerProps<Instance>>
      ) => {
        const props: ILayerPropsInternal<Instance> = initializer.init[1];
        // Execute lifecycle method
        layer.willUpdateProps(props);

        // If we have a provider that is about to be newly set to the layer, then the provider
        // needs to do a full sync in order to have existing elements in the provider
        if (props.data !== layer.props.data) {
          props.data.sync();
        }

        // Check to see if the layer is going to require it's view to be redrawn based on the props for the Layer changing,
        // or by custom logic of the layer.
        if (layer.shouldDrawView(layer.props, props)) {
          layer.needsViewDrawn = true;
        }

        // Make sure the layer has the current props applied to it
        Object.assign(layer.props, props);
        // Keep the initializer up to date with the injected props
        layer.initializer.init[1] = layer.props;
        // Lifecycle hook
        layer.didUpdateProps();

        // If we are having a parent swap, we need to make sure the previous parent does not
        // register this layer as a child anymore
        if (props.parent) {
          if (layer.parent && layer.parent !== props.parent) {
            // RESUME: We're making sure deleted layers or regenerated layers properly have parent child relationships
            // updated properly.
            const children = layer.parent.children || [];
            const index = children.indexOf(layer) || -1;

            if (index > -1) {
              children.splice(index, 1);
            }
          }
        }

        // Always make sure the layer's parent is set properly by the props
        layer.parent = props.parent;

        // A layer may flag itself as needing to be rebuilt. This is handled here and is completed by deleting
        // the layer completely then generating the layer anew.
        if (layer.willRebuildLayer) {
          this.layerDiffs.rebuild();
          layer.willRebuildLayer = false;
        }

        // If the layer is not regenerated, then during this render phase we add in the child layers of this layer.
        else {
          this.layerDiffs.inline(layer.childLayers());
        }
      },
    });

    // Create the diff manager to handle the views coming in.
    this.viewDiffs = new ReactiveDiff({
      buildItem: async (initializer: ViewInitializer<IViewProps>) => {
        if (!this.surface) return null;
        const newView = new initializer.init[0](this, initializer.init[1]);
        newView.props.camera = newView.props.camera || defaultElements.camera;
        newView.pixelRatio = this.surface.pixelRatio;
        newView.resource = this.surface.resourceManager;
        this.surface.userInputManager.waitingForRender = true;

        return newView;
      },

      // No special needs for destroying/removing a view
      destroyItem: async (
        _initializer: ViewInitializer<IViewProps>,
        _view: View<IViewProps>
      ) => true,

      // Hand off the initializer to the update of the view
      updateItem: async (
        initializer: ViewInitializer<IViewProps>,
        view: View<IViewProps>
      ) => {
        const props = initializer.init[1];
        view.willUpdateProps(props);

        if (view.shouldDrawView(view.props, props)) {
          view.needsDraw = true;
        }

        Object.assign(view.props, props);
        view.didUpdateProps();

        if (this.surface) {
          this.surface.userInputManager.waitingForRender = true;
        }
      },
    });

    // Now add in the initial data into our diff objects
    this.update(options);
  }

  /**
   * Release any resources this may be hanging onto
   */
  destroy() {
    delete this.container;
    this.layerDiffs.destroy();
    this.viewDiffs.destroy();
  }

  /**
   * Ensures a layer is removed from the scene
   */
  removeLayer(layer: Layer<any, any>) {
    if (this.layers) {
      const index = this.layers.indexOf(layer);

      if (index >= 0) {
        this.layers.splice(index, 1);
        return;
      }
    }
  }

  /**
   * Hand off the diff objects to our view and layer diffs
   */
  async update(options: ISceneOptions) {
    this.order = options.order;
    await this.viewDiffs.diff(options.views);
    await this.layerDiffs.diff(options.layers);
    // After the views and layers have been updated and created, we can now tell
    // the views to establish their render targets as creating the render
    // targets is dependent on how the layer's analyzed the output of the views
    this.views.forEach((view) => view.createRenderTarget());
  }
}
