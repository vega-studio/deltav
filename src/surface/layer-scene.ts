import {
  LayerInitializer,
  LayerInitializerInternal,
  Surface
} from "src/surface/surface";
import { ReactiveDiff } from "src/util/reactive-diff";
import { Scene } from "../gl/scene";
import { Instance } from "../instance-provider/instance";
import { IdentifyByKey, IdentifyByKeyOptions } from "../util/identify-by-key";
import { ILayerProps, ILayerPropsInternal, Layer } from "./layer";
import { generateDefaultElements } from "./layer-processing/generate-default-scene";
import { IViewOptions, View } from "./view";

const debug = require("debug")("performance");

/**
 * Defines the input for an available scene layers can add themselves to. Each scene can be rendered with multiple
 * views.
 */
export interface ISceneOptions extends IdentifyByKeyOptions {
  /**
   * This decalres all of the layers that should be applied to this scene.
   */
  layers: LayerInitializer[];
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
  views: IViewOptions[];
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
  layerDiffs: ReactiveDiff<
    Layer<Instance, ILayerProps<Instance>>,
    LayerInitializer
  >;
  /** Helps assert a guaranteed render order for scenes. Lower numbers render first. */
  order?: number;
  /** The presiding surface over this scene */
  surface?: Surface;
  /** This is the diff tracker for the views for the scene which allows us to make the pip0eline easier to manage */
  viewDiffs: ReactiveDiff<View, IViewOptions>;

  /** This is all of the layers attached to the scene */
  get layers(): Layer<any, any>[] {
    return this.layerDiffs.items;
  }

  /** This is all of the views attached to the scene */
  get views(): View[] {
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
    const defaultElements = generateDefaultElements(this.surface.gl);

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
        // Set the ordering value
        layer.order = initializer.init[1].order || Number.MAX_SAFE_INTEGER;
        // Keep the initializer object that generated the layer for reference and debugging
        layer.initializer = initializer;
        // Sync the data provider applied to the layer in case the provider has existing data
        // before being applied tot he layer
        layer.props.data.sync();
        // Look in the props of the layer for the parent of the layer
        layer.parent = props.parent;

        // If the parent is present, the parent should have the child added
        if (props.parent) {
          if (props.parent.children) props.parent.children.push(layer);
          else props.parent.children = [layer];
        }

        // Add the layer to this surface
        if (!layer.init()) {
          console.warn(
            "Error initializing layer:",
            props.key,
            "A layer was unable to be added to the surface. See previous warnings (if any) to determine why they could not be instantiated"
          );

          return null;
        }

        // Get the children for the layer
        const children = layer.childLayers();

        // Make the child layer be just slightly larger than the parent layer to keep it nearby in the render order
        for (let i = 0, iMax = children.length; i < iMax; ++i) {
          const child = children[i];
          child.init[1].order = layer.order + 0.01 * i;
        }

        // Add in the children of the layer
        this.layerDiffs.inline(children);

        return layer;
      },

      destroyItem: async (
        initializer: LayerInitializer,
        layer: Layer<Instance, ILayerProps<Instance>>
      ) => {
        debug("Destroying layer", initializer.key);
        layer.destroy();
        return true;
      },

      updateItem: async (
        initializer: LayerInitializer,
        layer: Layer<Instance, ILayerProps<Instance>>
      ) => {
        const props: ILayerPropsInternal<Instance> = initializer.init[1];
        // Execute lifecycle method
        layer.willUpdateProps(props);
        // Apply the potential new ordering.
        layer.order = props.order;

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
      }
    });

    // Create the diff manager to handle the views coming in.
    this.viewDiffs = new ReactiveDiff({
      buildItem: async (initializer: IViewOptions) => {
        if (!this.surface) return null;
        const newView = new View(this, initializer);
        newView.camera = newView.camera || defaultElements.camera;
        newView.viewCamera = newView.viewCamera || defaultElements.viewCamera;
        newView.pixelRatio = this.surface.pixelRatio;
        newView.camera.surface = this.surface;
        this.surface.mouseManager.waitingForRender = true;

        return newView;
      },

      // No special needs for destroying/removing a view
      destroyItem: async (_initializer: IViewOptions, _view: View) => true,

      // Hand off the initializer to the update of the view
      updateItem: async (initializer: IViewOptions, view: View) => {
        view.update(initializer);

        if (this.surface) {
          this.surface.mouseManager.waitingForRender = true;
        }
      }
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
  }
}
