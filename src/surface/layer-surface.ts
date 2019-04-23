import { GLSettings, RenderTarget, Scene, Texture } from "../gl";
import { flushDebug } from "../gl/debug-resources";
import { WebGLRenderer } from "../gl/webgl-renderer";
import { Instance } from "../instance-provider/instance";
import { Bounds } from "../primitives/bounds";
import {
  BaseResourceManager,
  BaseResourceOptions,
  FontResourceManager,
  ResourceManager
} from "../resources";
import { AtlasResourceManager } from "../resources/texture/atlas-resource-manager";
import { ShaderProcessor } from "../shaders/processing/shader-processor";
import { LayerInteractionHandler } from "../surface/layer-interaction-handler";
import { ActiveIOExpansion } from "../surface/layer-processing/base-io-expanders/active-io-expansion";
import { IResourceType, PickType } from "../types";
import { FrameMetrics, ResourceType } from "../types";
import { analyzeColorPickingRendering } from "../util/color-picking-analysis";
import { DataBounds } from "../util/data-bounds";
import { copy4, Vec2, Vec4 } from "../util/vector";
import { BaseIOSorting } from "./base-io-sorting";
import { EventManager } from "./event-manager";
import { LayerMouseEvents } from "./event-managers/layer-mouse-events";
import { ILayerProps, ILayerPropsInternal, Layer } from "./layer";
import { BasicIOExpansion } from "./layer-processing/base-io-expanders/basic-io-expansion";
import { EasingIOExpansion } from "./layer-processing/base-io-expanders/easing-io-expansion";
import { BaseIOExpansion } from "./layer-processing/base-io-expansion";
import { generateDefaultScene } from "./layer-processing/generate-default-scene";
import { generateLayerGeometry } from "./layer-processing/generate-layer-geometry";
import { generateLayerMaterial } from "./layer-processing/generate-layer-material";
import { generateLayerModel } from "./layer-processing/generate-layer-model";
import { makeLayerBufferManager } from "./layer-processing/layer-buffer-type";
import { ISceneOptions, LayerScene } from "./layer-scene";
import { MouseEventManager, SceneView } from "./mouse-event-manager";
import { ClearFlags, View } from "./view";

/**
 * Default IO expansion controllers applied to the system when explicit settings
 * are not provided.
 */
export const DEFAULT_IO_EXPANSION: BaseIOExpansion[] = [
  // Basic expansion to handle writing attributes and uniforms to the shader
  new BasicIOExpansion(),
  // Expansion to write in the active attribute handler. Any expansion injected AFTER
  // this expander will have it's processes canceled out for the destructuring portion
  // of the expansion when an instance is not active (if the instance has an active
  // attribute).
  new ActiveIOExpansion(),
  // Expansion to handle easing IO attributes and write AutoEasingMethods to the shaders
  new EasingIOExpansion()
];

/**
 * Default resource managers the system will utilize to handle default / basic resources.
 */
export const DEFAULT_RESOURCE_MANAGEMENT: ILayerSurfaceOptions["resourceManagers"] = [
  {
    type: ResourceType.ATLAS,
    manager: new AtlasResourceManager({})
  },
  {
    type: ResourceType.FONT,
    manager: new FontResourceManager()
  }
];

/**
 * Options for generating a new layer surface.
 */
export interface ILayerSurfaceOptions {
  /**
   * This is the color the canvas will be set to.
   */
  background: [number, number, number, number];
  /**
   * If this is provided, it will use this context for rendering. If a string is provided
   * it will search for the canvas context by id.
   */
  context?: WebGLRenderingContext | HTMLCanvasElement | string;
  /**
   * This is the event managers to respond to the mouse events.
   */
  eventManagers?: EventManager[];
  /**
   * Set to true to allow this surface to absorb and handle wheel events from the mouse.
   */
  handlesWheelEvents?: boolean;
  /**
   * Provides additional expansion controllers that will contribute to our Shader IO configuration
   * for the layers. If this is not provided, this defaults to default system behaviors.
   *
   * To add additional Expansion controllers and keep default system controllers utilize a Function
   * instead:
   *
   * ioExpansion: (defaultExpanders: BaseIOExpansion) => [...defaultExpanders, <your own expanders>]
   *
   * For instance: easing properties on attributes requires the attribute to be expanded to additional
   * attributes + modified behavior of the base attribute. Thus the system by default adds in the
   * EasinggIOExpansion controller when this is not provided to make those property types work.
   */
  ioExpansion?:
    | BaseIOExpansion[]
    | ((defaultExpanders: BaseIOExpansion[]) => BaseIOExpansion[]);
  /**
   * This specifies the density of rendering in the surface. The default value is window.devicePixelRatio to match the
   * monitor for optimal clarity. Using a value of 1 will be acceptable, will not get high density renders, but will
   * have better performance if needed.
   */
  pixelRatio?: number;
  /**
   * These are the resources we want available that our layers can be provided to utilize
   * for their internal processes.
   */
  resources?: BaseResourceOptions[];
  /**
   * This specifies the resource managers that will be applied to the surface. If this is not
   * provided, this will default to DEFAULT_RESOURCE_MANAGEMENT.
   *
   * To add additional managers to the default framework:
   * [
   *   ...DEFAULT_RESOURCE_MANAGEMENT,
   *   <your own resource managers>
   * ]
   *
   * Resource managers handle a layer's requests for a resource (this.resource.request(layer, instance, requestObject))
   * during update cycles of the attributes.
   */
  resourceManagers?: {
    type: number;
    manager: BaseResourceManager<IResourceType, IResourceType>;
  }[];
  /**
   * This sets up the available scenes the surface will have to work with. Layers then can
   * reference the scene by it's scene property. The order of the scenes here is the drawing
   * order of the scenes.
   */
  scenes: ISceneOptions[];
}

const DEFAULT_BACKGROUND_COLOR: Vec4 = [1.0, 1.0, 1.0, 1.0];

function isCanvas(val: any): val is HTMLCanvasElement {
  return Boolean(val.getContext);
}

function isString(val: any): val is string {
  return Boolean(val.substr);
}

function isWebGLContext(val: any): val is WebGLRenderingContext {
  return Boolean(val.canvas);
}

/**
 * A type to describe the constructor of a Layer class.
 */
export interface ILayerConstructable<T extends Instance> {
  new (props: ILayerProps<T>): Layer<any, any>;
}

/**
 * This specifies a class type that can be used in creating a layer with createLayer
 */
export type ILayerConstructionClass<
  T extends Instance,
  U extends ILayerProps<T>
> = ILayerConstructable<T> & { defaultProps: U };

/**
 * This is a pair of a Class Type and the props to be applied to that class type.
 */
export type LayerInitializer = [
  ILayerConstructionClass<Instance, ILayerProps<Instance>>,
  ILayerProps<Instance>
];

/**
 * The internal system layer initializer that hides additional properties the front
 * facing API should not be concerned with.
 */
export type LayerInitializerInternal = [
  ILayerConstructionClass<Instance, ILayerPropsInternal<Instance>>,
  ILayerPropsInternal<Instance>
];

/**
 * Used for reactive layer generation and updates.
 */
export function createLayer<T extends Instance, U extends ILayerProps<T>>(
  layerClass: ILayerConstructable<T> & { defaultProps: U },
  props: U
): LayerInitializer {
  return [layerClass, props];
}

/**
 * This is a manager for layers. It will use voidgl layers to intelligently render resources
 * as efficiently as possible. Layers will be rendered in the order they are provided and this
 * surface will provide some basic camera controls by default.
 */
export class LayerSurface {
  /** This is the gl context this surface is rendering to */
  private context: WebGLRenderingContext;
  /**
   * This is the metrics of the current running frame
   */
  frameMetrics: FrameMetrics = {
    currentFrame: 0,
    currentTime: Date.now() | 0,
    frameDuration: 1000 / 60,
    previousTime: Date.now() | 0
  };
  /** This is used to help resolve concurrent draws and resolving resource request dequeue operations. */
  private isBufferingResources = false;
  /** These are the registered expanders of Shader IO configuration */
  private ioExpanders: BaseIOExpansion[] = [];
  /** This is the sorting controller for sorting attributes/uniforms of a layer after all the attributes have been generated that are needed */
  ioSorting = new BaseIOSorting();
  /** This is all of the layers in this manager by their id */
  layers = new Map<string, Layer<Instance, ILayerProps<Instance>>>();
  /** This manages the mouse events for the current canvas context */
  private mouseManager: MouseEventManager;
  /** This is a target used to perform rendering our picking pass */
  pickingTarget: RenderTarget;
  /** This is the density the rendering renders for the surface */
  pixelRatio: number = window.devicePixelRatio;
  /** This is the THREE render system we use to render scenes with views */
  renderer: WebGLRenderer;
  /** This is the resource manager that handles resource requests for instances */
  resourceManager: ResourceManager;
  /**
   * This is all of the available scenes and their views for this surface. Layers reference the IDs
   * of the scenes and the views to be a part of their rendering state.
   */
  scenes = new Map<string, LayerScene>();
  /**
   * This is all of the views currently generated for this surface paired with the scene they render.
   */
  sceneViews: SceneView[] = [];
  /** When set to true, the next render will make sure color picking is updated for layer interactions */
  updateColorPick?: {
    mouse: Vec2;
    views: View[];
  };
  /**
   * This flags all layers by id for disposal at the end of every render. A Layer must be recreated
   * after each render in order to clear it's disposal flag. This is the trick to making this a
   * reactive system.
   */
  willDisposeLayer = new Map<string, boolean>();
  /**
   * This map is a quick look up for a view to determine other views that
   * would need to be redrawn as a consequence of the key view needing a redraw.
   */
  private viewDrawDependencies = new Map<View, View[]>();
  /** This is used to indicate whether the loading is completed */
  private loadReadyResolve: () => void;
  loadReady: Promise<void> = new Promise(
    resolve => (this.loadReadyResolve = resolve)
  );

  /** Read only getter for the gl context */
  get gl() {
    return this.context;
  }

  /**
   * This adds a layer to the manager which will manage all of the resource lifecycles of the layer
   * as well as additional helper injections to aid in instancing and shader i/o.
   */
  private addLayer<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>
  ): Layer<T, U> | null {
    if (!layer.id) {
      console.warn("All layers must have an id");
      return layer;
    }

    if (this.layers.get(layer.id)) {
      console.warn("All layer's ids must be unique per layer manager");
      return layer;
    }

    // We add the layer to our management
    this.layers.set(layer.id, layer);
    // Now we initialize the layer's gl components
    const layerId = layer.id;

    // Init the layer and see if the initialization is successful
    if (!this.initLayer(layer)) {
      this.layers.delete(layerId);
      return null;
    }

    return layer;
  }

  /**
   * The performs all of the needed updates that layers need to commit to the scene and buffers
   * to be ready for a draw pass. This is callable outside of the draw loop to allow for specialized
   * procedures or optimizations to take place, where incremental updates to the buffers would make
   * the most sense.
   *
   * @param time The start time of the given frame
   * @param frameIncrement When true, the frame count for the frame metrics will increment
   * @param onViewReady Callback for when all of the layers of a scene view have been committed
   *                    and are thus potentially ready to be rendered.
   */
  async commit(
    time?: number,
    frameIncrement?: boolean,
    onViewReady?: (
      needsDraw: boolean,
      scene: LayerScene,
      view: View,
      pickingPass: Layer<any, any>[]
    ) => void
  ) {
    if (!this.gl) return;

    // For now, while certain mysteries remain, we will track only if any view needs to be redrawn.
    // Any view that needs to be redrawn will trigger a redraw of the entire surface for now until
    // we can optimize down to only drawing a single view without erasing views that were not redrawn.
    let needsDraw = false;

    // We are rendering a new frame so increment our frame count
    if (frameIncrement) this.frameMetrics.currentFrame++;
    this.frameMetrics.frameDuration =
      this.frameMetrics.currentTime - this.frameMetrics.previousTime;
    this.frameMetrics.previousTime = this.frameMetrics.currentTime;

    // If no manual time was provided, we shall use Date.now in 32 bit format
    if (time === undefined) {
      this.frameMetrics.currentTime = Date.now() | 0;
    } else {
      // If this is our first frame and we have a manual time entry, then we first need to sync up
      // The manual time as our previous timing.
      if (this.frameMetrics.previousTime === this.frameMetrics.currentTime) {
        this.frameMetrics.previousTime = time;
      }

      this.frameMetrics.currentTime = time;
    }

    // Now that we have established what the time should be, let's swap our input parameter to reflect
    // the time we will be using for this frame
    time = this.frameMetrics.currentTime;

    // Get the scenes in their added order
    const scenes = Array.from(this.scenes.values());
    const validLayers: { [key: string]: Layer<any, any> } = {};
    const erroredLayers: { [key: string]: [Layer<any, any>, Error] } = {};
    const pickingPassByView = new Map<View, Layer<any, any>[]>();

    // Loop through scenes
    for (let i = 0, end = scenes.length; i < end; ++i) {
      const scene = scenes[i];
      const views = Array.from(scene.viewById.values());
      const layers = scene.layers;

      // Make sure the layers are depth sorted
      scene.sortLayers();

      // Loop through the views
      for (let k = 0, endk = views.length; k < endk; ++k) {
        const view = views[k];
        // When this flags true, a picking pass will be rendered for the provided scene / view
        const pickingPass: Layer<any, any>[] = [];

        // We must perform any operations necessary to make the view camera fit the viewport
        // Correctly
        view.fitViewtoViewport(
          new Bounds({
            height: this.context.canvas.height,
            width: this.context.canvas.width,
            x: 0,
            y: 0
          })
        );

        // Let the layers update their uniforms before the draw
        for (let j = 0, endj = layers.length; j < endj; ++j) {
          // Get the layer to be rendered in the scene
          const layer = layers[j];
          // Update the layer with the view it is about to be rendered with
          layer.view = view;

          // Make sure the layer is given the opportunity to update all of it's uniforms
          // To match the view state and update any unresolved diffs internally
          try {
            // Update uniforms, resolve diff changes
            layer.draw();
            // If any of the layers under the view need a redraw
            // Then the view needs a redraw
            if (layer.needsViewDrawn) view.needsDraw = true;
            // Flag the layer as valid
            validLayers[layer.id] = layer;
            // The view's animationEndTime is the largest end time found on one of the view's child layers.
            view.animationEndTime = Math.max(
              view.animationEndTime,
              layer.animationEndTime
            );
            // Indicate this layer is being rendered at the current time frame
            layer.lastFrameTime = time;
          } catch (err) {
            if (!erroredLayers[layer.id]) {
              erroredLayers[layer.id] = [layer, err];
            }
          }

          // If this layer specifies a picking draw pass, then we shall store it in the current draw order
          // For that next step
          if (layer.picking.type === PickType.SINGLE) {
            pickingPass.push(layer);
          }
        }

        // Analyze the view's animation end timings and the camera to see if there are view changes
        // that will trigger a redraw outside of our layer changes
        if (
          view.needsDraw ||
          (time && time < view.lastFrameTime) ||
          view.camera.needsViewDrawn ||
          true
        ) {
          view.needsDraw = true;
          needsDraw = true;

          // Get all of the dependent views for that view
          const overlapViews = this.viewDrawDependencies.get(view);

          // And make all of them need a redraw.
          if (overlapViews) {
            overlapViews.forEach(view => {
              view.needsDraw = true;
            });
          }
        }

        // Store the picking pass for the view to use when the view is ready to draw
        pickingPassByView.set(view, pickingPass);
      }
    }

    // If any draw need was detected, redraw the surface
    for (let i = 0, end = scenes.length; i < end; ++i) {
      const scene = scenes[i];
      // Our scene must have a valid container to operate
      if (!scene.container) continue;
      const views = Array.from(scene.viewById.values());

      for (let k = 0, endk = views.length; k < endk; ++k) {
        const view = views[k];

        // Now perform the rendering
        if (onViewReady) {
          onViewReady(
            needsDraw,
            scene,
            view,
            pickingPassByView.get(view) || []
          );
        }
      }
    }

    // Get the layers with errors flagged for them
    const errors = Object.values(erroredLayers);

    if (errors.length > 0) {
      const passed = Object.values(validLayers);

      console.warn(
        "Some layers errored during their draw update. These layers will be removed. They can be re-added if render() is called again:",
        errors.map(err => err[0].id)
      );

      // Output each layer and why it errored
      errors.forEach(err => {
        console.warn(`Layer ${err[0].id} removed for the following error:`);
        if (err[1]) console.error(err[1].stack || err[1].message);
      });

      // Re-render but only include non-errored layers
      this.render(passed.map(layer => layer.initializer));
    }
  }

  /**
   * Free all resources consumed by this surface that gets applied to the GPU.
   */
  destroy() {
    this.layers.forEach(layer => layer.destroy());
    this.resourceManager.destroy();
    this.mouseManager.destroy();
    this.sceneViews.forEach(sceneView => sceneView.scene.destroy());
    this.renderer.dispose();
    this.pickingTarget.dispose();
  }

  /**
   * This is the draw loop that must be called per frame for updates to take effect and display.
   *
   * @param time This is an optional time flag so one can manually control the time flag for the frame.
   *             This will affect animations and other automated gpu processes.
   */
  async draw(time?: number) {
    if (!this.gl) return;

    // Make the layers commit their changes to the buffers then draw each scene view on
    // Completion.
    await this.commit(time, true, (needsDraw, scene, view, pickingPass) => {
      // Our scene must have a valid container to operate
      if (!scene.container) return;

      if (needsDraw) {
        // Now perform the rendering
        this.drawSceneView(scene.container, view);
      }

      // If a layer needs a picking pass, then perform a picking draw pass only
      // if a request for the color pick has been made, then we query the pixels rendered to our picking target
      if (pickingPass.length > 0 && this.updateColorPick) {
        this.drawPicking(scene, view, pickingPass);
      }
    });

    // After we have drawn our views of our scenes, we can now ensure all of the bounds
    // Are updated in the interactions and flag our interactions ready for mouse input
    if (this.mouseManager.waitingForRender) {
      this.sceneViews.forEach(sceneView => {
        sceneView.bounds = new DataBounds(sceneView.view.screenBounds);
        sceneView.bounds.data = sceneView;
      });

      this.mouseManager.waitingForRender = false;
    }

    // Now that all of our layers have performed updates to everything, we can now dequeue
    // All resource requests
    // We create this gate in case multiple draw calls flow through before a buffer opertion is completed
    if (!this.isBufferingResources) {
      this.isBufferingResources = true;
      const didBuffer = await this.resourceManager.dequeueRequests();
      this.isBufferingResources = false;

      // If buffering did occur and completed, then we should be performing a draw to ensure all of the
      // Changes are committed and pushed out.
      if (didBuffer) {
        this.loadReadyResolve();
        this.loadReady = new Promise(
          resolve => (this.loadReadyResolve = resolve)
        );
        this.draw();
      }
    }

    // Clear out the flag requesting a pick pass so we don't perform a pick render pass unless we have
    // another requested from mouse interactions
    delete this.updateColorPick;

    // Each frame needs to analyze if draws are needed or not. Thus we reset all draw needs so they will
    // be considered resolved for the current set of changes.
    // Set draw needs of cameras and views back to false
    this.sceneViews.forEach(sceneView => {
      sceneView.view.needsDraw = false;
      sceneView.view.camera.resolve();
    });

    // Set all layers draw needs back to false, also, resolve all of the data providers
    // so their changelists are considered consumed.
    this.layers.forEach(layer => {
      layer.needsViewDrawn = false;
      layer.props.data.resolveContext = "";
    });

    // Dequeue rendering debugs
    flushDebug();
  }

  /**
   * NOTE: This is a temp way to handle picking. Picking will be handled with MRT once that pipeline is set up.
   *
   * This renders a selected scene/view into our picking target. Settings get adjusted
   */
  private drawPicking(
    scene: LayerScene,
    view: View,
    pickingPass: Layer<any, any>[]
  ) {
    if (!this.updateColorPick) return;
    if (!scene.container) return;

    // Get the requested metrics for the pick
    const mouse = this.updateColorPick.mouse;
    const views = this.updateColorPick.views;

    // Ensure the view provided is a view that is registered with this surface
    if (views.indexOf(view) > -1) {
      // Picking uses a pixel ratio of 1
      view.pixelRatio = 1.0;
      // Get the current flags for the view
      const flags = view.clearFlags.slice(0);
      // Store the current background of the view
      const background = copy4(view.background);
      // Set color rendering flag
      view.clearFlags = [ClearFlags.COLOR, ClearFlags.DEPTH];
      // Set the view's background to a solid black so we don't interfere with color encoding
      view.background = [0, 0, 0, 0];

      // We must perform any operations necessary to make the view camera fit the viewport
      // Correctly with the possibly adjusted pixel ratio
      view.fitViewtoViewport(
        new Bounds({
          height: this.pickingTarget.height,
          width: this.pickingTarget.width,
          x: 0,
          y: 0
        })
      );

      // We must redraw the layers so they will update their uniforms to adapt to a picking pass
      for (let j = 0, endj = pickingPass.length; j < endj; ++j) {
        const layer = pickingPass[j];
        // Adjust the layer to utilize the proper pick mode, thus causing the layer to properly
        // Set it's uniforms into a pick mode.
        layer.picking.currentPickMode = PickType.SINGLE;

        // Update the layer's material uniforms and avoid causing the changelist to attempt updates again
        try {
          layer.updateUniforms();
        } catch (err) {
          /** No-op, the first draw should have output an error for bad draw calls */
          console.warn(err);
        }

        layer.picking.currentPickMode = PickType.NONE;
      }

      // Draw the scene with our picking target as the target
      this.drawSceneView(
        scene.container,
        view,
        this.renderer,
        this.pickingTarget
      );

      // Make our metrics for how much of the image we wish to analyze
      const pickWidth = 5;
      const pickHeight = 5;
      const numBytesPerColor = 4;
      const out = new Uint8Array(pickWidth * pickHeight * numBytesPerColor);

      // Read the pixels out
      // TODO: We need to defer this reading to next frame as the rendering MUST be completed before a readPixels
      // operation can complete. Thus in complex rendering situations that pushes the GPU, this could be a MAJOR bottleneck.
      this.renderer.readPixels(
        mouse[0] - pickWidth / 2,
        mouse[1] - pickHeight / 2,
        pickWidth,
        pickHeight,
        out
      );

      // Analyze the rendered color data for the picking routine
      const pickingData = analyzeColorPickingRendering(
        [mouse[0] - view.screenBounds.x, mouse[1] - view.screenBounds.y],
        out,
        pickWidth,
        pickHeight
      );

      // We must redraw the layers so they will update their uniforms to adapt to a picking pass
      for (let j = 0, endj = pickingPass.length; j < endj; ++j) {
        const layer = pickingPass[j];

        if (layer.picking.type === PickType.SINGLE) {
          layer.interactions.colorPicking = pickingData;
        }
      }

      // Return the pixel ratio back to the rendered ratio
      view.pixelRatio = this.pixelRatio;
      // Return the view's clear flags
      view.clearFlags = flags;
      // Return the view's background color
      view.background = background;

      // After reverting the pixel ratio, we must return to the state we came from so that mouse interactions
      // will work properly
      view.fitViewtoViewport(
        new Bounds({
          height: this.context.canvas.height,
          width: this.context.canvas.width,
          x: 0,
          y: 0
        })
      );
    }
  }

  /**
   * This finalizes everything and sets up viewports and clears colors and performs the actual render step
   */
  private drawSceneView(
    scene: Scene,
    view: View,
    renderer?: WebGLRenderer,
    target?: RenderTarget
  ) {
    renderer = renderer || this.renderer;
    const offset = { x: view.viewBounds.left, y: view.viewBounds.top };
    const size = view.viewBounds;
    const pixelRatio = view.pixelRatio;
    const background = view.background;

    // Make sure the correct render target is applied
    renderer.setRenderTarget(target || null);

    // Set the scissor rectangle.
    renderer.setScissor(
      {
        x: offset.x / pixelRatio,
        y: offset.y / pixelRatio,
        width: size.width / pixelRatio,
        height: size.height / pixelRatio
      },
      target
    );
    // If a background is established, we should clear the background color
    // Specified for this context
    if (view.background) {
      // Clear the rect of color and depth so the region is totally it's own
      renderer.clearColor([
        background[0],
        background[1],
        background[2],
        background[3]
      ]);
    }

    // Make sure the viewport is set properly for the next render
    renderer.setViewport({
      x: offset.x / pixelRatio,
      y: offset.y / pixelRatio,
      width: size.width,
      height: size.height
    });

    // Get the view's clearing preferences
    if (view.clearFlags) {
      renderer.clear(
        view.clearFlags.indexOf(ClearFlags.COLOR) > -1,
        view.clearFlags.indexOf(ClearFlags.DEPTH) > -1,
        view.clearFlags.indexOf(ClearFlags.STENCIL) > -1
      );
    } else {
      renderer.clear(true, true);
    }

    // Render the scene with the provided view metrics
    renderer.render(scene, target);
    // Indicate this view has been rendered for the given time allottment
    view.lastFrameTime = this.frameMetrics.currentTime;
  }

  /**
   * This gathers all the overlap views of every view
   */
  private gatherViewDrawDependencies() {
    this.viewDrawDependencies.clear();

    // Fit all views to viewport
    for (let i = 0, endi = this.sceneViews.length; i < endi; i++) {
      this.sceneViews[i].view.fitViewtoViewport(
        new Bounds({
          height: this.context.canvas.height,
          width: this.context.canvas.width,
          x: 0,
          y: 0
        })
      );
    }

    // Set viewDrawDependencies
    for (let i = 0, endi = this.sceneViews.length; i < endi; i++) {
      const sourceView = this.sceneViews[i].view;
      const overlapViews: View[] = [];

      for (let j = 0, endj = this.sceneViews.length; j < endj; j++) {
        if (j !== i) {
          const targetView = this.sceneViews[j].view;

          if (sourceView.viewBounds.hitBounds(targetView.viewBounds)) {
            overlapViews.push(targetView);
          }
        }
      }

      this.viewDrawDependencies.set(sourceView, overlapViews);
    }
  }

  /**
   * This allows for querying a view's screen bounds. Null is returned if the view id
   * specified does not exist.
   */
  getViewSize(viewId: string): Bounds | null {
    for (const sceneView of this.sceneViews) {
      if (sceneView.view.id === viewId) {
        return sceneView.view.screenBounds;
      }
    }

    return null;
  }

  /**
   * This queries a view's window into a world's space.
   */
  getViewWorldBounds(viewId: string): Bounds | null {
    for (const sceneView of this.sceneViews) {
      if (sceneView.view.id === viewId) {
        const view = sceneView.view;

        if (view.screenBounds) {
          const topLeft = view.viewToWorld([0, 0]);
          const bottomRight = view.screenToWorld([
            view.screenBounds.right,
            view.screenBounds.bottom
          ]);

          return new Bounds({
            bottom: bottomRight[1],
            left: topLeft[0],
            right: bottomRight[0],
            top: topLeft[1]
          });
        } else {
          return null;
        }
      }
    }

    return null;
  }

  /**
   * This is the beginning of the system. This should be called immediately after the surface is constructed.
   * We make this mandatory outside of the constructor so we can make it follow an async pattern.
   */
  async init(options: ILayerSurfaceOptions) {
    // Make sure our desired pixel ratio is set up
    this.pixelRatio = options.pixelRatio || this.pixelRatio;

    if (this.pixelRatio < 1.0) {
      this.pixelRatio = 1.0;
    }

    // Make sure we have a gl context to work with
    this.setContext(options.context);

    if (this.gl) {
      // Initialize our GL needs that set the basis for rendering
      this.initGL(options);
      // Initialize our event manager that handles mouse interactions/gestures with the canvas
      this.initMouseManager(options);
      // Initialize any resources requested or needed, such as textures or rendering surfaces
      await this.initResources(options);
      // Initialize any io expanders requested or needed. This must happen after resource initialization
      // as resource managers can produce their own expanders.
      await this.initIOExpanders(options);
    } else {
      console.warn(
        "Could not establish a GL context. Layer Surface will be unable to render"
      );
    }

    return this;
  }

  /**
   * This initializes the Canvas GL contexts needed for rendering.
   */
  private initGL(options: ILayerSurfaceOptions) {
    if (!this.context) {
      console.error(
        "Can not initialize Layer Surface as a valid GL context was not established."
      );
      return;
    }

    // Get the canvas of our context to set up our Three settings
    const canvas = this.context.canvas;
    // Get the starting width and height so adjustments don't affect it
    const width = canvas.width;
    const height = canvas.height;

    // Generate the renderer along with it's properties
    this.renderer = new WebGLRenderer({
      // Context supports rendering to an alpha canvas only if the background color has a transparent
      // Alpha value.
      alpha: options.background && options.background[3] < 1.0,
      // Yes to antialias! Make it preeeeetty!
      antialias: false,
      // Make three use an existing canvas rather than generate another
      canvas,
      // TODO: This should be toggleable. If it's true it allows us to snapshot the rendering in the canvas
      //       But we dont' always want it as it makes performance drop a bit.
      preserveDrawingBuffer: false,
      // This indicates if the information written to the canvas is going to be written as premultiplied values
      // or if they will be standard rgba values. Helps with compositing with the DOM.
      premultipliedAlpha: false
    });

    if (this.resourceManager) {
      this.resourceManager.setWebGLRenderer(this.renderer);
    }

    // Generate a target for the picking pass
    this.pickingTarget = new RenderTarget({
      buffers: {
        color: new Texture({
          generateMipMaps: false,
          data: {
            width,
            height,
            buffer: null
          }
        }),
        depth: GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16
      },
      // We want a target with a pixel ratio of just 1, which will be more than enough accuracy for mouse picking
      width,
      height
    });

    // This sets the pixel ratio to handle differing pixel densities in screens
    this.setRendererSize(width, height);
    // Set the pixel ratio to match the pixel density of the monitor in use
    this.renderer.setPixelRatio(this.pixelRatio);

    // Applies the background color and establishes whether or not the context supports
    // Alpha or not
    if (options.background) {
      this.renderer.setClearColor([
        options.background[0],
        options.background[1],
        options.background[2],
        options.background[3]
      ]);
    } else {
      // If a background color was not established, then we set a default background color
      this.renderer.setClearColor(DEFAULT_BACKGROUND_COLOR);
    }

    // Make a scene view depth tracker so we can track the order each scene view combo is drawn
    let sceneViewDepth = 0;
    // Turn on the scissor test to keep the rendering clipped within the
    // Render region of the context
    this.context.enable(this.context.SCISSOR_TEST);

    // Add the requested scenes to the surface and apply the necessary defaults
    if (options.scenes) {
      options.scenes.forEach(sceneOptions => {
        // Make us a new scene based on the requested options
        const newScene = new LayerScene(sceneOptions);
        // Use defaultSceneElement to set cameras
        const defaultSceneElement = generateDefaultScene(this.context);
        // Generate the views requested for the scene
        sceneOptions.views.forEach(viewOptions => {
          const newView = new View(viewOptions);
          newView.camera = newView.camera || defaultSceneElement.camera;
          newView.viewCamera =
            newView.viewCamera || defaultSceneElement.viewCamera;
          newView.pixelRatio = this.pixelRatio;
          newScene.addView(newView);

          for (const sceneView of this.sceneViews) {
            if (sceneView.view.id === newView.id) {
              console.warn(
                "You can NOT have two views with the same id. Please use unique identifiers for every view generated."
              );
            }
          }

          this.sceneViews.push({
            depth: ++sceneViewDepth,
            scene: newScene,
            view: newView
          });
        });

        this.scenes.set(sceneOptions.key, newScene);
      });

      this.gatherViewDrawDependencies();
    }
  }

  /**
   * Initializes the expanders that should be applied to the surface for layer processing.
   */
  private initIOExpanders(options: ILayerSurfaceOptions) {
    // Handle expanders passed in as an array or blank
    if (
      Array.isArray(options.ioExpansion) ||
      options.ioExpansion === undefined
    ) {
      // Initialize the Shader IO expansion objects
      this.ioExpanders =
        (options.ioExpansion && options.ioExpansion.slice(0)) ||
        (DEFAULT_IO_EXPANSION && DEFAULT_IO_EXPANSION.slice(0)) ||
        [];
    }

    // Handle expanders passed in as a method
    else if (options.ioExpansion instanceof Function) {
      this.ioExpanders = options.ioExpansion(DEFAULT_IO_EXPANSION);
    }

    // Retrieve any expansion objects the resource managers may provide
    const managerIOExpanders = this.resourceManager.getIOExpansion();
    // Add the expanders to our current handled list.
    this.ioExpanders = this.ioExpanders.concat(managerIOExpanders);
  }

  /**
   * This does special initialization by gathering the layers shader IO, generates a material
   * and injects special automated uniforms and attributes to make instancing work for the
   * shader.
   */
  private initLayer<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>
  ): Layer<T, U> | null {
    // Set the layer's parent surface here
    layer.surface = this;
    // Set the resource manager this surface utilizes to the layer
    layer.resource = this.resourceManager;
    // Get the shader metrics the layer desires
    const shaderIO = layer.initShader();
    // For the sake of initializing uniforms to the correct values, we must first add the layer to it's appropriate
    // Scene so that the necessary values will be in place for the sahder IO
    const scene = this.addLayerToScene(layer);
    if (!scene) return null;
    // Ensure the layer has interaction handling applied to it
    layer.interactions = new LayerInteractionHandler(layer);

    // If no metrics are provided, this layer is merely a shell layer and will not
    // receive any GPU handling objects.
    if (!shaderIO) {
      layer.picking.type = PickType.NONE;
      return layer;
    }

    if (!shaderIO.fs || !shaderIO.vs) {
      console.warn(
        "Layer needs to specify the fragment and vertex shaders:",
        layer.id
      );
      return null;
    }

    // Clean out nulls provided as a convenience to the layer
    shaderIO.instanceAttributes = (shaderIO.instanceAttributes || []).filter(
      Boolean
    );
    shaderIO.vertexAttributes = (shaderIO.vertexAttributes || []).filter(
      Boolean
    );
    shaderIO.uniforms = (shaderIO.uniforms || []).filter(Boolean);

    // Generate the actual shaders to be used by injecting all of the necessary fragments and injecting
    // Instancing fragments
    const shaderMetrics = new ShaderProcessor().process(
      layer,
      shaderIO,
      this.ioExpanders,
      this.ioSorting
    );

    // Check to see if the Shader Processing failed. If so, return null as a failure flag.
    if (!shaderMetrics) return null;
    // Retrieve all of the attributes created as a result of layer input and module processing.
    const { vertexAttributes, instanceAttributes, uniforms } = shaderMetrics;

    // Generate the geometry this layer will be utilizing
    const geometry = generateLayerGeometry(
      layer,
      shaderMetrics.maxInstancesPerBuffer,
      vertexAttributes,
      shaderIO.vertexCount
    );
    // This is the material that is generated for the layer that utilizes all of the generated and
    // Injected shader IO and shader fragments
    const material = generateLayerMaterial(
      layer,
      shaderMetrics.vs,
      shaderMetrics.fs,
      uniforms,
      shaderMetrics.materialUniforms
    );
    // And now we can now generate the mesh that will be added to the scene
    const model = generateLayerModel(geometry, material, shaderIO.drawMode);

    // Now that all of the elements of the layer are complete, let us apply them to the layer
    layer.geometry = geometry;
    layer.instanceAttributes = instanceAttributes;
    layer.instanceVertexCount = shaderIO.vertexCount;
    layer.material = material;
    layer.maxInstancesPerBuffer = shaderMetrics.maxInstancesPerBuffer;
    layer.model = model;
    layer.uniforms = uniforms;
    layer.vertexAttributes = vertexAttributes;

    // Generate the correct buffering strategy for the layer
    makeLayerBufferManager(this.gl, layer, scene);

    if (layer.props.printShader) {
      console.warn(
        "A Layer requested its shader be debugged. Do not leave this active for production:",
        "Layer:",
        layer.props.key,
        "Shader Metrics",
        shaderMetrics
      );
      console.warn("\n\nVERTEX SHADER\n--------------\n\n", shaderMetrics.vs);
      console.warn("\n\nFRAGMENT SHADER\n--------------\n\n", shaderMetrics.fs);
    }

    return layer;
  }

  /**
   * Initializes elements for handling mouse interactions with the canvas.
   */
  private initMouseManager(options: ILayerSurfaceOptions) {
    // We must inject an event manager to broadcast events through the layers themselves
    const eventManagers: EventManager[] = ([
      new LayerMouseEvents(this)
    ] as EventManager[]).concat(options.eventManagers || []);

    // Generate the mouse manager for the layer
    this.mouseManager = new MouseEventManager(
      this.context.canvas,
      this.sceneViews,
      eventManagers,
      options.handlesWheelEvents
    );
  }

  /**
   * This initializes resources needed or requested such as textures or render surfaces.
   */
  private async initResources(options: ILayerSurfaceOptions) {
    // Create the controller for handling all resource managers
    this.resourceManager = new ResourceManager();
    // Set the GL renderer to the
    this.resourceManager.setWebGLRenderer(this.renderer);

    // Get the managers requested by the configuration
    const managers =
      (options.resourceManagers && options.resourceManagers.slice(0)) ||
      (DEFAULT_RESOURCE_MANAGEMENT && DEFAULT_RESOURCE_MANAGEMENT.slice(0)) ||
      [];

    // Register all of the managers for use by their type.
    managers.forEach(manager => {
      this.resourceManager.setManager(manager.type, manager.manager);
    });

    // Tell our managers to handle all of the requested resources injected into the
    // configuration
    if (options.resources) {
      for (const resource of options.resources) {
        await this.resourceManager.initResource(resource);
      }
    }
  }

  /**
   * This finds the scene and view the layer belongs to based on the layer's props. For invalid or not provided
   * props, the layer gets added to default scenes and views.
   */
  private addLayerToScene<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>
  ): LayerScene | undefined {
    // Get the scene the layer will add itself to
    const scene = this.scenes.get(layer.props.scene || "");

    if (!scene) {
      console.warn(
        "No scene is specified by the layer, or the scene identifier is invalid"
      );
    } else {
      // Add the layer to the scene for rendering
      scene.addLayer(layer);
    }

    return scene;
  }

  /**
   * Discontinues a layer's management by this surface. This will invalidate any resources
   * the layer was using in association with the context. If the layer is re-insertted, it will
   * be revaluated as though it were a new layer.
   */
  private removeLayer<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U> | null
  ): Layer<T, U> | null {
    // Make sure we are removing a layer that exists in the system
    if (!layer) {
      return null;
    }

    if (!this.layers.get(layer && layer.id)) {
      console.warn(
        "Tried to remove a layer that is not in the manager.",
        layer
      );
      return layer;
    }

    layer.destroy();
    this.layers.delete(layer.id);

    return layer;
  }

  /**
   * This expands a layer's children within the initializer list
   */
  private expandLayerChildren(
    initializers: LayerInitializerInternal[],
    layer: Layer<Instance, ILayerProps<Instance>>,
    index: number
  ) {
    // Merge in the child layers this layer may request as the immediate next layers in the sequence
    const childLayers: LayerInitializerInternal[] = layer.childLayers();
    // No children, no need to do anything
    if (childLayers.length <= 0) return;

    // Make sure each child layer knows their parent
    for (let i = 0, iMax = childLayers.length; i < iMax; ++i) {
      const init = childLayers[i];
      init[1].parent = layer;
    }

    // Add in the initializers of the children to be immediately updated or generated
    initializers.splice(index + 1, 0, ...childLayers);
  }

  /**
   * This handles a layer's update lifecycle during the layer rendering phase.
   */
  private updateLayer(
    initializers: LayerInitializerInternal[],
    layer: Layer<Instance, ILayerPropsInternal<Instance>>,
    props: ILayerPropsInternal<Instance>,
    index: number
  ) {
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
    layer.initializer[1] = layer.props;
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
      this.removeLayer(layer);
      this.generateLayer(initializers, layer.initializer, index, true);
    }

    // If the layer is not regenerated, then during this render phase we add in the child layers of this layer.
    else {
      this.expandLayerChildren(initializers, layer, index);
    }
  }

  /**
   * This handles a layer's creation during the rendering of layers.
   */
  private generateLayer(
    initializers: LayerInitializerInternal[],
    init: LayerInitializerInternal,
    index: number,
    preventChildren?: boolean
  ) {
    const layerClass = init[0];
    const props = init[1];
    // Generate the new layer and provide it it's initial props
    const layer = new layerClass(
      Object.assign({}, layerClass.defaultProps, props)
    );
    // Keep the initializer object that generated the layer for reference and debugging
    layer.initializer = init;
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
    if (!this.addLayer(layer)) {
      console.warn(
        "Error initializing layer:",
        props.key,
        "A layer was unable to be added to the surface. See previous warnings (if any) to determine why they could not be instantiated"
      );

      return;
    }

    // Add in the children of the layer
    if (!preventChildren) {
      this.expandLayerChildren(initializers, layer, index);
    }
  }

  /**
   * Used for reactive rendering and diffs out the layers for changed layers.
   */
  render(layerInitializers: LayerInitializer[]) {
    if (!this.gl) return;

    // Prevent mutations of the input
    const initializers: LayerInitializerInternal[] = layerInitializers.slice(0);

    // Loop through all of the initializers and properly add and remove layers as needed
    if (initializers && initializers.length > 0) {
      // This loop is VERY specifically putting the length check in the conditional of the loop
      // The list CAN add additional initializers to account for the children being added
      for (let i = 0; i < initializers.length; ++i) {
        const init = initializers[i];
        const props = init[1];
        const existingLayer = this.layers.get(props.key);

        if (existingLayer) {
          this.updateLayer(initializers, existingLayer, props, i);
        } else {
          this.generateLayer(initializers, init, i);
        }

        this.willDisposeLayer.set(props.key, false);
      }
    }

    // Take any layer that retained it's disposal flag and trash it
    this.willDisposeLayer.forEach((dispose, layerId) => {
      if (dispose) {
        const layer = this.layers.get(layerId);
        if (layer) {
          this.removeLayer(layer);
        } else {
          console.warn(
            "this.willDisposeLayer applied to a layer that does not exist in the existing layer check."
          );
        }
      }
    });

    // Resolve that all disposals occurred
    this.willDisposeLayer.clear();

    // Reflag every layer for removal again so creation of layers will determine
    // Which layers remain for a reactive pattern
    this.layers.forEach((_layer, id) => {
      this.willDisposeLayer.set(id, true);
    });
  }

  /**
   * This must be executed when the canvas changes size so that we can re-calculate the scenes and views
   * dimensions for handling all of our rendered elements.
   */
  fitContainer(_pixelRatio?: number) {
    const container = this.context.canvas.parentElement;

    if (container) {
      const canvas = this.context.canvas;
      canvas.className = "";
      canvas.setAttribute("style", "");
      container.style.position = "relative";
      canvas.style.position = "absolute";
      canvas.style.left = "0xp";
      canvas.style.top = "0xp";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.setAttribute("width", "");
      canvas.setAttribute("height", "");
      const containerBox = container.getBoundingClientRect();
      const box = canvas.getBoundingClientRect();

      this.resize(box.width || 100, containerBox.height || 100);
    }
  }

  /**
   * This resizes the canvas and retains pixel ratios amongst all of the resources involved.
   */
  resize(width: number, height: number, pixelRatio?: number) {
    this.pixelRatio = pixelRatio || this.pixelRatio;

    if (this.pixelRatio < 1.0) {
      this.pixelRatio = 1.0;
    }

    this.sceneViews.forEach(
      sceneView => (sceneView.view.pixelRatio = this.pixelRatio)
    );
    this.setRendererSize(width, height);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.mouseManager.resize();
    this.gatherViewDrawDependencies();
  }

  /**
   * This establishes the rendering canvas context for the surface.
   */
  private setContext(
    context?: WebGLRenderingContext | HTMLCanvasElement | string
  ) {
    if (!context) {
      return;
    }

    if (isWebGLContext(context)) {
      this.context = context;
    } else if (isCanvas(context)) {
      const canvasContext =
        context.getContext("webgl") || context.getContext("experimental-webgl");

      if (!canvasContext) {
        console.warn(
          "A valid GL context was not found for the context provided to the surface. This surface will not be able to operate."
        );
      } else {
        this.context = canvasContext;
      }
    } else if (isString(context)) {
      const element = document.getElementById(context);

      if (isCanvas(element)) {
        this.setContext(element);
      }
    }
  }

  /**
   * This applies a new size to the renderer and resizes any additional resources that requires being
   * sized along with the renderer.
   */
  private setRendererSize(width: number, height: number) {
    width = width || 100;
    height = height || 100;

    // Set the canvas size for the renderer
    this.renderer.setSize(width, height);
    // Set the picking target size to be the dimensions of our renderer as well
    this.pickingTarget.setSize(width, height);
  }

  /**
   * This triggers an update to all of the layers that perform picking, the pixel data
   * within the specified mouse range.
   */
  updateColorPickRange(mouse: Vec2, views: View[]) {
    // We will flag the color range as needing an update
    this.updateColorPick = {
      mouse,
      views
    };
  }
}
