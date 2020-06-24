import { EventManager } from "../event-management/event-manager";
import { UserInputEventManager } from "../event-management/user-input-event-manager";
import {
  GLSettings,
  isOffscreenCanvas,
  RenderTarget,
  Scene,
  Texture
} from "../gl";
import { WebGLRenderer } from "../gl/webgl-renderer";
import { Instance } from "../instance-provider/instance";
import { BaseProjection } from "../math";
import { getAbsolutePositionBounds } from "../math/primitives/absolute-position";
import { Bounds } from "../math/primitives/bounds";
import { copy4, Vec2, Vec4 } from "../math/vector";
import {
  BaseResourceManager,
  BaseResourceOptions,
  BaseResourceRequest,
  FontResourceManager,
  ResourceRouter
} from "../resources";
import { AtlasResourceManager } from "../resources/texture/atlas-resource-manager";
import { BaseShaderTransform } from "../shaders/processing/base-shader-transform";
import { ActiveIOExpansion } from "../surface/layer-processing/base-io-expanders/active-io-expansion";
import { FrameMetrics, ResourceType, SurfaceErrorType } from "../types";
import {
  IdentifiableById,
  IInstanceAttribute,
  IPipeline,
  IResourceType,
  PickType
} from "../types";
import { onFrame, PromiseResolver } from "../util";
import { analyzeColorPickingRendering } from "../util/color-picking-analysis";
import { ReactiveDiff } from "../util/reactive-diff";
import { BaseIOSorting } from "./base-io-sorting";
import { LayerMouseEvents } from "./event-managers/layer-mouse-events";
import { Layer } from "./layer";
import { BasicIOExpansion } from "./layer-processing/base-io-expanders/basic-io-expansion";
import { EasingIOExpansion } from "./layer-processing/base-io-expanders/easing-io-expansion";
import { BaseIOExpansion } from "./layer-processing/base-io-expansion";
import { Shaders30CompatibilityTransform } from "./layer-processing/base-shader-transforms/shaders-30-compatibility-transform";
import { ISceneOptions, LayerScene } from "./layer-scene";
import { ClearFlags, IViewProps, View } from "./view";

/**
 * Default IO expansion controllers applied to the system when explicit settings
 * are not provided.
 */
export const DEFAULT_IO_EXPANSION: BaseIOExpansion[] = [
  // Basic expansion to handle writing attributes and uniforms to the shader
  new BasicIOExpansion(),
  // Expansion to write in the active attribute handler. Any expansion injected AFTER
  // this expander will have it's processes canceled out for the destructuring portion
  // of the expansion when an instance is not active (if the instance has an
  // active
  // attribute).
  new ActiveIOExpansion(),
  // Expansion to handle easing IO attributes and write AutoEasingMethods to the
  // shaders
  new EasingIOExpansion()
];

/**
 * Default resource managers the system will utilize to handle default / basic resources.
 */
export const DEFAULT_RESOURCE_MANAGEMENT: ISurfaceOptions["resourceManagers"] = [
  {
    type: ResourceType.ATLAS,
    manager: new AtlasResourceManager({})
  },
  {
    type: ResourceType.FONT,
    manager: new FontResourceManager()
  }
];

export const DEFAULT_SHADER_TRANSFORM: BaseShaderTransform[] = [
  // Transform that handles odds and ends of 3.0 and 2.0 inconsistencies and
  // attempts tp unify them as best as possible depending on the current
  // system's operating mode.
  new Shaders30CompatibilityTransform()
];

/**
 * Options for generating a new layer surface.
 */
export interface ISurfaceOptions {
  /**
   * Provides the context the surface will use while rendering
   */
  context?: HTMLCanvasElement;
  /**
   * This is the event managers to respond to the mouse events.
   */
  eventManagers?: EventManager[];
  /**
   * Set to true to allow this surface to absorb and handle wheel events from
   * the mouse.
   */
  handlesWheelEvents?: boolean;
  /**
   * Provides additional expansion controllers that will contribute to our
   * Shader IO configuration for the layers. If this is not provided, this
   * defaults to default system behaviors.
   *
   * To add additional Expansion controllers and keep default system controllers
   * utilize a Function instead:
   *
   * ioExpansion: (defaultExpanders: BaseIOExpansion) => [...defaultExpanders,
   * <your own expanders>]
   *
   * For instance: easing properties on attributes requires the attribute to be
   * expanded to additional attributes + modified behavior of the base
   * attribute. Thus the system by default adds in the EasinggIOExpansion
   * controller when this is not provided to make those property types work.
   */
  ioExpansion?:
    | BaseIOExpansion[]
    | ((defaultExpanders: BaseIOExpansion[]) => BaseIOExpansion[]);
  /**
   * This specifies the density of rendering in the surface. The default value
   * is window.devicePixelRatio to match the monitor for optimal clarity. Using
   * a value of 1 will be acceptable, will not get high density renders, but
   * will have better performance if needed.
   */
  pixelRatio?: number;
  /**
   * Sets some options for the renderer which deals with top level settings that
   * can only be set when the context is retrieved
   */
  rendererOptions?: {
    /**
     * This indicates the back buffer for the webgl context will have an alpha
     * channel. This affects performance some, but is mainly for the DOM
     * compositing the canvas with the other DOM elements.
     */
    alpha?: boolean;
    /**
     * Hardware antialiasing. Disabled by default. Enabled makes things
     * prettier but slower.
     */
    antialias?: boolean;
    /**
     * This tells the browser what to expect from the colors rendered into the
     * canvas. This will affect how compositing the canvas with the rest of the
     * DOM will be accomplished. This should match the color values being
     * written to the final FBO target (render target null). If incorrect,
     * bizarre color blending with the DOM can occur.
     */
    premultipliedAlpha?: boolean;
    /**
     * This sets what the browser will do with the target frame buffer object
     * after it's done using it for compositing. If you wish to take a snap shot
     * of the canvas being rendered into, this must be true. This has the
     * potential to hurt performance, thus it is disabled by default.
     */
    preserveDrawingBuffer?: boolean;
  };
  /**
   * This specifies the resource managers that will be applied to the surface.
   * If this is not provided, this will default to DEFAULT_RESOURCE_MANAGEMENT.
   *
   * To add additional managers to the default framework:
   * [
   *   ...DEFAULT_RESOURCE_MANAGEMENT, <your own resource managers>
   * ]
   *
   * Resource managers handle a layer's requests for a resource
   * (this.resource.request(layer, instance, requestObject)) during update
   * cycles of the attributes.
   */
  resourceManagers?: {
    type: number;
    manager: BaseResourceManager<IResourceType, BaseResourceRequest>;
  }[];
  /**
   * Provides last step processing of shaders after all system adjustments and
   * settings have been applied to the Shader.
   *
   * This is a raw string processing transformation and will NOT provide any
   * insights into the settings of the Surface down to the layer that built this
   * shader.
   */
  shaderTransforms?:
    | BaseShaderTransform[]
    | ((defaultExpanders: BaseShaderTransform[]) => BaseShaderTransform[]);
}

/**
 * If a view does not specify a background color, this is the color that will be cleared to
 * when the color buffer is cleared for the view
 */
const DEFAULT_BACKGROUND_COLOR: Vec4 = [0.0, 0.0, 0.0, 0.0];

/**
 * Sort method for any object with an 'order' property
 */
function sortByOrder<T extends { order?: number }>(a: T, b: T) {
  return (
    (a.order || Number.MAX_SAFE_INTEGER) - (b.order || Number.MAX_SAFE_INTEGER)
  );
}

/**
 * This is a render controller for managing GPU rendering techniques via a layering system. This is the entry object
 * that contains and monitors all resources for performing the GPU actions.
 */
export class Surface {
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
  /**
   * This is used to help resolve concurrent draws and resolving resource
   * request dequeue operations.
   */
  private isBufferingResources = false;
  /** These are the registered expanders of Shader IO configuration */
  private ioExpanders: BaseIOExpansion[] = [];
  /** These are the registered transforms for shaders */
  private shaderTransforms: BaseShaderTransform[] = [];
  /**
   * This is the sorting controller for sorting attributes/uniforms of a layer
   * after all the attributes have been generated that are needed
   */
  ioSorting = new BaseIOSorting();
  /** This manages the mouse events for the current canvas context */
  mouseManager: UserInputEventManager;
  /** This is a target used to perform rendering our picking pass */
  pickingTarget: RenderTarget;
  /** This is the density the rendering renders for the surface */
  pixelRatio: number = window.devicePixelRatio;
  /** This is the GL render system we use to render scenes with views */
  renderer: WebGLRenderer;
  /**
   * This is the resource manager that handles resource requests for instances
   */
  resourceManager: ResourceRouter;
  /**
   * When defined, the next render will make sure color picking is updated
   * for layer interactions
   */
  updateColorPick?: {
    position: Vec2;
    views: View<IViewProps>[];
  };
  /**
   * This map is a quick look up for a view to determine other views that
   * would need to be redrawn as a consequence of the key view needing a redraw.
   */
  private viewDrawDependencies = new Map<
    View<IViewProps>,
    View<IViewProps>[]
  >();
  /**
   * This is used to indicate the surface has loaded it's initial systems. This
   * is complete after init has executed successfully for this surface.
   */
  ready: Promise<Surface>;
  /** This is used to reolve this surface as ready */
  private readyResolver: PromiseResolver<Surface>;

  /**
   * Picking gets deferred to the beginning of next draw. Thus picking
   * operations get queued till next frame using this store here.
   */
  private queuedPicking?: [
    LayerScene,
    View<IViewProps>,
    Layer<any, any>[],
    Vec2
  ][];

  /** Diff manager to handle diffing resource objects for the pipeline */
  resourceDiffs: ReactiveDiff<
    IdentifiableById,
    BaseResourceOptions
  > = new ReactiveDiff({
    buildItem: async (initializer: BaseResourceOptions) => {
      await this.resourceManager.initResource(initializer);

      return {
        id: initializer.key
      };
    },

    destroyItem: async (
      initializer: BaseResourceOptions,
      _item: IdentifiableById
    ) => {
      await this.resourceManager.destroyResource(initializer);

      return true;
    },

    updateItem: async (
      initializer: BaseResourceOptions,
      _item: IdentifiableById
    ) => {
      await this.resourceManager.updateResource(initializer);
    }
  });

  /** Diff manager to handle diffing scene objects for the pipeline */
  sceneDiffs: ReactiveDiff<LayerScene, ISceneOptions> = new ReactiveDiff({
    buildItem: async (initializer: ISceneOptions) => {
      const scene = new LayerScene(this, {
        key: initializer.key,
        views: initializer.views,
        layers: initializer.layers
      });

      return scene;
    },

    destroyItem: async (_initializer: ISceneOptions, item: LayerScene) => {
      item.destroy();
      return true;
    },

    updateItem: async (initializer: ISceneOptions, item: LayerScene) => {
      await item.update(initializer);
    }
  });

  constructor(options?: ISurfaceOptions) {
    this.readyResolver = new PromiseResolver();
    this.ready = this.readyResolver.promise;

    if (options) {
      this.init(options);
    }
  }

  /** Read only getter for the gl context */
  get gl() {
    return this.context;
  }

  /** Get all of the scenes for this surface */
  get scenes() {
    return this.sceneDiffs.items;
  }

  /**
   * Retrieves all IO Expanders applied to this surface
   */
  getIOExpanders() {
    return this.ioExpanders;
  }

  /**
   * Retrieves the controller for sorting the IO for the layers.
   */
  getIOSorting() {
    return this.ioSorting;
  }

  /**
   * Retrieves all shader transforms applied to this surface.
   */
  getShaderTransforms() {
    return this.shaderTransforms;
  }

  /**
   * This processes what is rendered into the picking render target to see if the mouse interacted with
   * any elements.
   */
  private analyzePickRendering() {
    if (!this.queuedPicking) return;

    for (let i = 0, iMax = this.queuedPicking.length; i < iMax; ++i) {
      const [, view, pickingPass, mouse] = this.queuedPicking[i];

      // Optimized rendering of the view will make the view discard picking rendering
      if (view.optimizeRendering) {
        continue;
      }

      // Make our metrics for how much of the image we wish to analyze
      const pickWidth = 5;
      const pickHeight = 5;
      const numBytesPerColor = 4;
      const out = new Uint8Array(pickWidth * pickHeight * numBytesPerColor);

      // Read the pixels out
      this.renderer.readPixels(
        Math.floor(mouse[0] - pickWidth / 2),
        Math.floor(mouse[1] - pickHeight / 2),
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
    }

    delete this.queuedPicking;
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
      view: View<IViewProps>,
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
    const scenes = this.sceneDiffs.items;
    scenes.sort(sortByOrder);
    const erroredLayers: { [key: string]: [Layer<any, any>, Error] } = {};
    const pickingPassByView = new Map<View<IViewProps>, Layer<any, any>[]>();

    // Loop through scenes
    for (let i = 0, end = scenes.length; i < end; ++i) {
      const scene = scenes[i];
      const views = scene.views;
      const layers = scene.layers;
      const validLayers: { [key: string]: Layer<any, any> } = {};

      // Make sure the views and layers are ordered such that they render in the appropriate order
      views.sort(sortByOrder);
      layers.sort(sortByOrder);

      // Loop through the views
      for (let k = 0, endk = views.length; k < endk; ++k) {
        const view = views[k];
        // When this flags true, a picking pass will be rendered for the provided scene / view
        const pickingPass: Layer<any, any>[] = [];

        // Get the bounds of the screen to hand to the view
        const screenBounds = new Bounds<never>({
          height: this.context.canvas.height,
          width: this.context.canvas.width,
          x: 0,
          y: 0
        });

        // Calculate the bounds of the viewport relative to the screen
        const viewportBounds = getAbsolutePositionBounds<View<IViewProps>>(
          view.props.viewport,
          screenBounds,
          this.pixelRatio
        );

        // We must perform any operations necessary to make the view camera fit the viewport
        // Correctly
        view.fitViewtoViewport(screenBounds, viewportBounds);

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
            if (layer.needsViewDrawn || layer.isAnimationContinuous) {
              view.needsDraw = true;
            }
            // Flag the layer as valid
            validLayers[layer.id] = layer;
            // The view's animationEndTime is the largest end time found on one of the view's child layers.
            view.animationEndTime = Math.max(
              view.animationEndTime,
              layer.animationEndTime,
              view.props.camera.animationEndTime
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
          (time && time < view.animationEndTime) ||
          view.props.camera.needsViewDrawn
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

      // Re-render but only include non-errored layers
      const keepLayers = Object.values(validLayers);
      if (layers.length !== keepLayers.length) {
        scene.layerDiffs.diff(keepLayers.map(layer => layer.initializer));
      }
    }

    // If any draw need was detected, redraw the surface
    for (let i = 0, end = scenes.length; i < end; ++i) {
      const scene = scenes[i];
      // Our scene must have a valid container to operate
      if (!scene.container) continue;
      const views = scene.views;

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
      console.warn(
        "Some layers errored during their draw update. These layers will be removed. They can be re-added if render() is called again:",
        errors.map(err => err[0].id)
      );

      // Output each layer and why it errored
      errors.forEach(err => {
        console.warn(`Layer ${err[0].id} removed for the following error:`);

        if (err[1]) {
          const message = err[1].stack || err[1].message;
          console.error(message);

          // This is a specific error to instances updating an attribute but returning a value that is larger
          // than the attribute size. The only way to debug this is to run every instance in the layer and
          // retrieve it's update value and compare the return to the expected size.
          if (
            message.indexOf("RangeError") > -1 ||
            message.indexOf("Source is too large") > -1
          ) {
            const layer = err[0];
            const changes = layer.bufferManager.changeListContext;
            let singleMessage:
              | [string, Instance, IInstanceAttribute<Instance>]
              | undefined;
            let errorCount = 0;

            for (let i = 0, iMax = changes.length; i < iMax; ++i) {
              const [instance] = changes[i];
              layer.shaderIOInfo.instanceAttributes.forEach(attr => {
                const check = attr.update(instance);
                if (check.length !== attr.size) {
                  if (!singleMessage) {
                    singleMessage = [
                      "Example instance returned the wrong sized value for an attribute:",
                      instance,
                      attr
                    ];
                  }

                  errorCount++;
                }
              });
            }

            if (singleMessage) {
              console.error(
                "The following output shows discovered issues related to the specified error"
              );
              console.error(
                "Instances are returning too large IO for an attribute\n",
                singleMessage[0],
                singleMessage[1],
                singleMessage[2],
                "Total errors for too large IO values",
                errorCount
              );
            }
          }
        }
      });
    }
  }

  /**
   * Free all resources consumed by this surface that gets applied to the GPU.
   */
  destroy() {
    this.resourceManager.destroy();
    this.mouseManager.destroy();
    this.sceneDiffs.destroy();
    this.renderer.dispose();
    this.pickingTarget.dispose();
    delete this.context;
  }

  /**
   * This is the draw loop that must be called per frame for updates to take
   * effect and display.
   *
   * @param time This is an optional time flag so one can manually control the
   *             time flag for the frame. This will affect animations and other
   *             automated gpu processes.
   */
  async draw(time?: number) {
    if (!this.gl) return;

    // The theoretically least blocking moment for pixels to be read is the
    // beginning of the next frame right before next frame is rendered. This
    // will have given optimal time for the GPU to have finished flushing it's
    // commands. If the GPU has not completed it's tasks by this time, then
    // we're in a major GPU intensive operation.
    this.analyzePickRendering();
    // Gather all of our picking calls to call at the end to prevent readPixels
    // from becoming a major blocking operation
    const toPick: [LayerScene, View<IViewProps>, Layer<any, any>[]][] = [];

    // Before we draw the frame, we must have every camera resolve broadcasting
    // changes so everything can respond to the change before all of the drawing
    // operations take place.
    for (let i = 0, iMax = this.sceneDiffs.items.length; i < iMax; ++i) {
      const scene = this.sceneDiffs.items[i];

      for (let k = 0, kMax = scene.views.length; k < kMax; ++k) {
        const view = scene.views[k];
        view.props.camera.broadcast(view.id);
      }
    }

    // Make the layers commit their changes to the buffers then draw each scene
    // view on Completion.
    await this.commit(time, true, (needsDraw, scene, view, pickingPass) => {
      // Our scene must have a valid container to operate
      if (!scene.container) return;

      if (needsDraw) {
        // Now perform the rendering
        this.drawSceneView(scene.container, view);
      }

      // If a layer needs a picking pass, then perform a picking draw pass only
      // if a request for the color pick has been made, then we query the pixels
      // rendered to our picking target
      if (pickingPass.length > 0 && this.updateColorPick) {
        toPick.push([scene, view, pickingPass]);
      }
    });

    // After we have drawn our views of our scenes, we can now ensure all of the bounds
    // Are updated in the interactions and flag our interactions ready for mouse input
    if (this.mouseManager.waitingForRender) {
      this.mouseManager.waitingForRender = false;
    }

    // Now that all of our layers have performed updates to everything, we can
    // now dequeue All resource requests We create this gate in case multiple
    // draw calls flow through before a buffer operation is completed
    if (!this.isBufferingResources) {
      this.isBufferingResources = true;
      const didBuffer = await this.resourceManager.dequeueRequests();
      this.isBufferingResources = false;

      // If buffering did occur and completed, then we should be performing a
      // draw to ensure all of the Changes are committed and pushed out.
      if (didBuffer) {
        this.draw(await onFrame());
      }
    }

    // Each frame needs to analyze if draws are needed or not. Thus we reset all
    // draw needs so they will be considered resolved for the current set of
    // changes. Set draw needs of cameras and views back to false
    for (let i = 0, iMax = this.sceneDiffs.items.length; i < iMax; ++i) {
      const scene = this.sceneDiffs.items[i];

      // Resolve view renders
      for (let i = 0, iMax = scene.views.length; i < iMax; ++i) {
        const view = scene.views[i];
        view.needsDraw = false;
        view.props.camera.resolve();
      }

      // Resolve layer renders
      for (let i = 0, iMax = scene.layers.length; i < iMax; ++i) {
        const layer = scene.layers[i];
        layer.needsViewDrawn = false;
      }
    }

    // We render color picking to our color picking render target, but we save it's result for the beginning of next
    // frame. The longest delay picking can cause is from the readPixels operation being CPU blocking. Additionally, the
    // block will cause a full GPU sync to happen before the picels are read which means the CPU and GPU  are blocked
    // from adiditional operations UNTIL ALL of the current operations are completed first. Thus, readPixels at the
    // beginning of next frame makes the most sense as all operations should be assurred to be completed before then.
    for (let i = 0, iMax = toPick.length; i < iMax; ++i) {
      const picking = toPick[i];
      const didDraw = this.drawPicking(picking[0], picking[1], picking[2]);

      if (
        didDraw &&
        picking.length > 0 &&
        !picking[1].optimizeRendering &&
        this.updateColorPick
      ) {
        if (!this.queuedPicking) this.queuedPicking = [];
        this.queuedPicking.push([
          picking[0],
          picking[1],
          picking[2],
          this.updateColorPick.position
        ]);
      }
    }

    // Clear out the flag requesting a pick pass so we don't perform a pick render pass unless we have
    // another requested from mouse interactions
    delete this.updateColorPick;

    // Uncomment this to see a minimap of the picking render target in real time. Crashes performance, but makes it much
    // easier to fix underlying bugs when you can see the output pipeline properly.
    // debugRenderTarget(this.renderer, this.pickingTarget);

    // Dequeue rendering debugs
    // flushDebug();
  }

  /**
   * NOTE: This is a temp way to handle picking. Picking will be handled with MRT once that pipeline is set up.
   *
   * This renders a selected scene/view into our picking target. Settings get adjusted
   */
  private drawPicking(
    scene: LayerScene,
    view: View<IViewProps>,
    pickingPass: Layer<any, any>[]
  ) {
    if (!this.updateColorPick) return false;
    if (!scene.container) return false;
    // Optimized rendering of the view will make the view discard picking rendering
    if (view.optimizeRendering) return false;

    // Get the requested metrics for the pick
    const views = this.updateColorPick.views;

    // Ensure the view provided is a view that is registered with this surface
    if (views.indexOf(view) > -1) {
      // Picking uses a pixel ratio of 1
      view.pixelRatio = 1.0;
      // Get the current flags for the view
      const flags = view.clearFlags.slice(0);
      // Store the current background of the view
      const background = view.props.background && copy4(view.props.background);
      // Set color rendering flag
      view.props.clearFlags = [ClearFlags.COLOR, ClearFlags.DEPTH];
      // Set the view's background to a solid black so we don't interfere with color encoding
      view.props.background = [0, 0, 0, 0];

      // We change the bounds for the view to occupy relative to the render target
      let screenBounds = new Bounds<never>({
        height: this.pickingTarget.height,
        width: this.pickingTarget.width,
        x: 0,
        y: 0
      });

      // Calculate the bounds the viewport will occupy relative to the render target's space
      let viewportBounds = getAbsolutePositionBounds<View<IViewProps>>(
        view.props.viewport,
        screenBounds,
        1.0
      );

      // We must perform any operations necessary to make the view camera fit the viewport
      // Correctly with the possibly adjusted pixel ratio
      view.fitViewtoViewport(screenBounds, viewportBounds);

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

      // Return the pixel ratio back to the rendered ratio
      view.pixelRatio = this.pixelRatio;
      // Return the view's clear flags
      view.props.clearFlags = flags;
      // Return the view's background color
      view.props.background = background;

      // Revert the bounds back to being relative to the screen space
      screenBounds = new Bounds<never>({
        height: this.context.canvas.height,
        width: this.context.canvas.width,
        x: 0,
        y: 0
      });

      // Calculate the bounds the viewport will occupy relative to the screen space
      viewportBounds = getAbsolutePositionBounds<View<IViewProps>>(
        view.props.viewport,
        screenBounds,
        this.pixelRatio
      );

      // After reverting the pixel ratio, we must return to the state we came from so that mouse interactions
      // will work properly
      view.fitViewtoViewport(screenBounds, viewportBounds);

      return true;
    }

    return false;
  }

  /**
   * This finalizes everything and sets up viewports and clears colors and
   * performs the actual render step
   */
  private drawSceneView(
    scene: Scene,
    view: View<IViewProps>,
    renderer?: WebGLRenderer,
    target?: RenderTarget
  ) {
    renderer = renderer || this.renderer;
    const offset = { x: view.viewBounds.left, y: view.viewBounds.top };
    const size = view.viewBounds;
    const background = view.props.background || DEFAULT_BACKGROUND_COLOR;
    const willClearColorBuffer = view.clearFlags.indexOf(ClearFlags.COLOR) > -1;

    // If the view has an output target to render into, then we shift our target
    // focus to that target Make sure the correct render target is applied
    renderer.setRenderTarget(target || view.renderTarget || null);

    // Set the scissor rectangle.
    renderer.setScissor(
      {
        x: offset.x,
        y: offset.y,
        width: size.width,
        height: size.height
      },
      target
    );
    // If a background is established, we should clear the background color
    // Specified for this context
    if (willClearColorBuffer) {
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
      x: offset.x,
      y: offset.y,
      width: size.width,
      height: size.height
    });

    // Get the view's clearing preferences
    if (view.clearFlags && view.clearFlags.length > 0) {
      renderer.clear(
        willClearColorBuffer,
        view.clearFlags.indexOf(ClearFlags.DEPTH) > -1,
        view.clearFlags.indexOf(ClearFlags.STENCIL) > -1
      );
    } else {
      renderer.clear(false);
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
    if (!this.sceneDiffs) return;
    this.viewDrawDependencies.clear();
    const scenes = this.sceneDiffs.items;

    // Fit all views to viewport
    for (let i = 0, endi = scenes.length; i < endi; i++) {
      const scene = scenes[i];

      for (let k = 0, kMax = scene.views.length; k < kMax; ++k) {
        const view = scene.views[k];

        // To look for the overlaps of the view in screen space, we must
        // calculate the view's viewport bounds relative to the screenspace.
        const screenBounds = new Bounds<never>({
          height: this.context.canvas.height,
          width: this.context.canvas.width,
          x: 0,
          y: 0
        });

        // Calculate the bounds the viewport will occupy relative to the screen
        // space
        const viewportBounds = getAbsolutePositionBounds<View<IViewProps>>(
          view.props.viewport,
          screenBounds,
          this.pixelRatio
        );

        view.fitViewtoViewport(screenBounds, viewportBounds);
        view.props.camera.update(true);
      }
    }

    // Set viewDrawDependencies
    for (let i = 0, endi = scenes.length; i < endi; i++) {
      const scene = scenes[i];

      for (let k = 0, kMax = scene.views.length; k < kMax; ++k) {
        const sourceView = scene.views[k];
        const overlapViews: View<IViewProps>[] = [];

        for (let j = 0, endj = scenes.length; j < endj; j++) {
          if (j !== i) {
            const scene = scenes[j];

            for (let l = 0, lMax = scene.views.length; l < lMax; ++l) {
              const targetView = scene.views[l];

              if (sourceView.viewBounds.hitBounds(targetView.viewBounds)) {
                overlapViews.push(targetView);
              }
            }
          }
        }

        this.viewDrawDependencies.set(sourceView, overlapViews);
      }
    }
  }

  /**
   * This allws for querying a view's screen bounds. Null i;s returned if the
   * view id specified does not exist.
   */
  getViewSize(viewId: string): Bounds<View<IViewProps>> | null {
    for (let i = 0, iMax = this.sceneDiffs.items.length; i < iMax; ++i) {
      const scene = this.sceneDiffs.items[i];
      const view = scene.viewDiffs.getByKey(viewId);
      if (view) return view.screenBounds;
    }

    return null;
  }

  /**
   * This queries a view's window into a world's space.
   */
  getViewWorldBounds(viewId: string): Bounds<never> | null {
    for (let i = 0, iMax = this.sceneDiffs.items.length; i < iMax; ++i) {
      const scene = this.sceneDiffs.items[i];
      const view = scene.viewDiffs.getByKey(viewId);

      if (view) {
        if (view.screenBounds) {
          const topLeft = view.projection.viewToWorld([0, 0]);
          const bottomRight = view.projection.screenToWorld([
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
   * Retrieves the projection methods for a given view, null if the view id does
   * not exist in the surface
   */
  getProjections(viewId: string): BaseProjection<any> | null {
    for (let i = 0, iMax = this.sceneDiffs.items.length; i < iMax; ++i) {
      const scene = this.sceneDiffs.items[i];
      const view = scene.viewDiffs.getByKey(viewId);

      if (view) return view.projection;
    }

    return null;
  }

  /**
   * This is the beginning of the system. This should be called immediately
   * after the surface is constructed. We make this mandatory outside of the
   * constructor so we can make it follow an async pattern.
   */
  async init(options: ISurfaceOptions) {
    // If this already has initialized it's context, then there's nothing to be
    // done
    if (this.context) return this;
    // Make sure our desired pixel ratio is set up
    this.pixelRatio = options.pixelRatio || this.pixelRatio;

    if (this.pixelRatio < 1.0) {
      this.pixelRatio = 1.0;
    }

    // Initialize our GL needs that set the basis for rendering
    const context = this.initGL(options);

    if (!context) {
      this.readyResolver.reject({
        error: SurfaceErrorType.NO_WEBGL_CONTEXT,
        message:
          "Could not establish a webgl context. Surface is being destroyed to free resources."
      });
      this.destroy();
      return this;
    }

    this.context = context;

    if (this.gl) {
      // Initialize our event manager that handles mouse interactions/gestures
      // with the canvas
      this.initMouseManager(options);
      // Initialize any resources requested or needed, such as textures or
      // rendering surfaces
      await this.initResources(options);
      // Initialize any io expanders requested or needed. This must happen after
      // resource initialization as resource managers can produce their own
      // expanders.
      await this.initIOExpanders(options);
      // Initialize the shader transformations requested or needed.
      await this.initShaderTransforms(options);
    } else {
      console.warn(
        "Could not establish a GL context. Layer Surface will be unable to render"
      );
    }

    this.readyResolver.resolve(this);

    return this;
  }

  /**
   * This initializes the Canvas GL contexts needed for rendering.
   */
  private initGL(options: ISurfaceOptions) {
    // Get the canvas of our context to set up our GL settings
    const canvas = options.context;
    if (!canvas) return null;

    // Apply the deltav version to the attributes of the canvas so we have more
    // debugging information available
    try {
      canvas.setAttribute("data-deltav", require("../release").version);
    } catch (err) {
      // NOOP - We want the application of the version to happen, but it is not
      // application critical
    }

    // Get the starting width and height so adjustments don't affect it
    const width = canvas.width;
    const height = canvas.height;
    let hasContext = true;

    const rendererOptions: ISurfaceOptions["rendererOptions"] = Object.assign(
      {
        alpha: false,
        antialias: false,
        preserveDrawingBuffer: false,
        premultiplyAlpha: false
      },
      options.rendererOptions
    );

    // Generate the renderer along with it's properties
    this.renderer = new WebGLRenderer({
      // Context supports rendering to an alpha canvas only if the background
      // color has a transparent Alpha value.
      alpha: rendererOptions.alpha,
      // Yes to antialias! Make it preeeeetty!
      antialias: rendererOptions.antialias,
      // Make the GL use an existing canvas rather than generate another
      canvas,
      // If it's true it allows us to snapshot the rendering in the canvas
      // But we dont' always want it as it makes performance drop a bit.
      preserveDrawingBuffer: rendererOptions.preserveDrawingBuffer,
      // This indicates if the information written to the canvas is going to be
      // written as premultiplied values or if they will be standard rgba
      // values. Helps with compositing with the DOM.
      premultipliedAlpha: rendererOptions.premultipliedAlpha,

      // Let's us know if there is no valid webgl context to work with or not
      onNoContext: () => {
        hasContext = false;
      }
    });

    if (!hasContext || !this.renderer.gl) return null;
    this.context = this.renderer.gl;

    if (this.resourceManager) {
      this.resourceManager.setWebGLRenderer(this.renderer);
    }

    // Generate a target for the picking pass
    this.pickingTarget = new RenderTarget({
      buffers: {
        color: {
          buffer: new Texture({
            generateMipMaps: false,
            data: {
              width,
              height,
              buffer: null
            }
          }),
          outputType: 0
        },
        depth: GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16
      },
      // We want a target with a pixel ratio of just 1, which will be more than
      // enough accuracy for mouse picking
      width,
      height
    });

    // This sets the pixel ratio to handle differing pixel densities in screens
    this.setRendererSize(width, height);
    // Set the pixel ratio to match the pixel density of the monitor in use
    this.renderer.setPixelRatio(this.pixelRatio);

    return this.renderer.gl;
  }

  /**
   * Initializes the expanders that should be applied to the surface for layer
   * processing.
   */
  private initIOExpanders(options: ISurfaceOptions) {
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
   * Initializes the shader transforms that will be applied to every shader
   * rendered with this surface.
   */
  private initShaderTransforms(options: ISurfaceOptions) {
    // Handle transforms passed in as an array or blank
    if (
      Array.isArray(options.shaderTransforms) ||
      options.shaderTransforms === undefined
    ) {
      // Initialize the Shader IO expansion objects
      this.shaderTransforms =
        (options.shaderTransforms && options.shaderTransforms.slice(0)) ||
        (DEFAULT_SHADER_TRANSFORM && DEFAULT_SHADER_TRANSFORM.slice(0)) ||
        [];
    }

    // Handle expanders passed in as a method
    else if (options.shaderTransforms instanceof Function) {
      this.shaderTransforms = options.shaderTransforms(
        DEFAULT_SHADER_TRANSFORM
      );
    }
  }

  /**
   * Initializes elements for handling mouse interactions with the canvas.
   */
  private initMouseManager(options: ISurfaceOptions) {
    // We must inject an event manager to broadcast events through the layers
    // themselves
    const eventManagers: EventManager[] = ([
      new LayerMouseEvents()
    ] as EventManager[]).concat(options.eventManagers || []);

    // Generate the mouse manager for the layer
    this.mouseManager = new UserInputEventManager(
      this.context.canvas,
      this,
      eventManagers,
      options.handlesWheelEvents
    );
  }

  /**
   * This initializes resources needed or requested such as textures or render
   * surfaces.
   */
  private async initResources(options: ISurfaceOptions) {
    // Create the controller for handling all resource managers
    this.resourceManager = new ResourceRouter();
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
  }

  /**
   * Use this to establish the rendering pipeline the application should be
   * using at the current time.
   *
   * NOTE: If you update the pipeline on a loop of any sort, you will want to
   * await the pipeline to complete it's diff before you issue a draw command.
   * Failure to do so invites undefined behavior which often causes elements
   * tobe comepltely not rendered at all in many cases.
   */
  async pipeline(pipeline: IPipeline) {
    if (pipeline.resources) {
      await this.resourceDiffs.diff(pipeline.resources);
    }

    if (pipeline.scenes) {
      await this.sceneDiffs.diff(pipeline.scenes);
    }

    // This gathers the draw dependencies of the views (which views overlap
    // other views.) This will let the system know when a view is needing
    // re-rendering how it can preserve other views and prevent them from
    // needing a redraw
    this.gatherViewDrawDependencies();
  }

  /**
   * This must be executed when the canvas changes size so that we can
   * re-calculate the scenes and views dimensions for handling all of our
   * rendered elements.
   */
  fitContainer(_pixelRatio?: number) {
    if (isOffscreenCanvas(this.context.canvas)) return;
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
   * This resizes the canvas and retains pixel ratios amongst all of the
   * resources involved.
   */
  resize(width: number, height: number, pixelRatio?: number) {
    this.pixelRatio = pixelRatio || this.pixelRatio;

    if (this.pixelRatio < 1.0) {
      this.pixelRatio = 1.0;
    }

    this.setRendererSize(width, height);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.mouseManager.resize();

    if (this.sceneDiffs) {
      const scenes = this.sceneDiffs.items;
      for (let i = 0, iMax = scenes.length; i < iMax; ++i) {
        const scene = scenes[i];

        for (let k = 0, kMax = scene.views.length; k < kMax; ++k) {
          const view = scene.views[k];
          view.pixelRatio = this.pixelRatio;
          view.props.camera.update(true);
        }
      }
    }

    // After the resize happens, the view draw dependencies may change as the
    // views will cover different region sizes
    this.gatherViewDrawDependencies();
  }

  /**
   * This flags all views to fully re-render
   */
  redraw() {
    for (let i = 0, iMax = this.sceneDiffs.items.length; i < iMax; ++i) {
      const viewLayers = this.sceneDiffs.items[i];

      for (let k = 0, kMax = viewLayers.views.length; k < kMax; ++k) {
        const view = viewLayers.views[k];
        view.needsDraw = true;
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
  updateColorPickPosition(position: Vec2, views: View<IViewProps>[]) {
    // We will flag the color range as needing an update
    this.updateColorPick = {
      position,
      views
    };
  }
}
