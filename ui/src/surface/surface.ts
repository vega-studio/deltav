import { EventManager } from "../event-management/event-manager.js";
import { UserInputEventManager } from "../event-management/user-input-event-manager.js";
import { isOffscreenCanvas, RenderTarget, Scene } from "../gl/index.js";
import { WebGLRenderer } from "../gl/webgl-renderer.js";
import { Instance } from "../instance-provider/instance.js";
import { BaseProjection } from "../math/index.js";
import { getAbsolutePositionBounds } from "../math/primitives/absolute-position.js";
import { Bounds } from "../math/primitives/bounds.js";
import { Vec4 } from "../math/vector.js";
import { ColorBufferResourceManager } from "../resources/color-buffer/index.js";
import {
  BaseResourceManager,
  BaseResourceOptions,
  BaseResourceRequest,
  FontResourceManager,
  ResourceRouter,
} from "../resources/index.js";
import { AtlasResourceManager } from "../resources/texture/atlas-resource-manager.js";
import { RenderTextureResourceManager } from "../resources/texture/render-texture-resource-manager.js";
import { BaseIOSorting } from "../shaders/processing/base-io-sorting.js";
import { BaseShaderTransform } from "../shaders/processing/base-shader-transform.js";
import { ActiveIOExpansion } from "../surface/layer-processing/base-io-expanders/active-io-expansion.js";
import { FrameMetrics, ResourceType, SurfaceErrorType } from "../types.js";
import {
  IdentifiableById,
  IInstanceAttribute,
  IPipeline,
  IResourceType,
} from "../types.js";
import { onFrame, PromiseResolver } from "../util/index.js";
import { ReactiveDiff } from "../util/reactive-diff.js";
import { LayerMouseEvents } from "./event-managers/layer-mouse-events.js";
import { Layer } from "./layer.js";
import { BasicIOExpansion } from "./layer-processing/base-io-expanders/basic-io-expansion.js";
import { EasingIOExpansion } from "./layer-processing/base-io-expanders/easing-io-expansion.js";
import { BaseIOExpansion } from "./layer-processing/base-io-expansion.js";
import { Shaders30CompatibilityTransform } from "./layer-processing/base-shader-transforms/shaders-30-compatibility-transform.js";
import { ISceneOptions, LayerScene } from "./layer-scene.js";
import { SurfaceCommands } from "./surface-commands.js";
import { ClearFlags, IViewProps, View } from "./view.js";

/**
 * Default IO expansion controllers applied to the system when explicit settings
 * are not provided.
 */
export const DEFAULT_IO_EXPANSION = (): BaseIOExpansion[] => [
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
  new EasingIOExpansion(),
];

/**
 * Default resource managers the system will utilize to handle default / basic resources.
 */
export const DEFAULT_RESOURCE_MANAGEMENT =
  (): ISurfaceOptions["resourceManagers"] => [
    {
      type: ResourceType.COLOR_BUFFER,
      manager: new ColorBufferResourceManager(),
    },
    {
      type: ResourceType.TEXTURE,
      manager: new RenderTextureResourceManager(),
    },
    {
      type: ResourceType.ATLAS,
      manager: new AtlasResourceManager({}),
    },
    {
      type: ResourceType.FONT,
      manager: new FontResourceManager(),
    },
  ];

export const DEFAULT_SHADER_TRANSFORM = (): BaseShaderTransform[] => [
  // Transform that handles odds and ends of 3.0 and 2.0 inconsistencies and
  // attempts tp unify them as best as possible depending on the current
  // system's operating mode.
  new Shaders30CompatibilityTransform(),
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
   * If this is defined, this causes the specified targets to NOT render UNLESS
   * expressly told to render utilizing enableOutput
   */
  optimizedOutputTargets?: number[];
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
 * Helper enum to select which method to broadcast.
 */
enum EventManagerBroadcastCycle {
  WILL_RENDER,
  DID_RENDER,
}

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
  private context?: WebGLRenderingContext;
  /**
   * Available commands from the surface that triggers events or triggers
   * direct GPU operations.
   */
  commands = new SurfaceCommands({ surface: this });
  /**
   * This is the metrics of the current running frame
   */
  frameMetrics: FrameMetrics = {
    currentFrame: 0,
    currentTime: Date.now() | 0,
    frameDuration: 1000 / 60,
    previousTime: Date.now() | 0,
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
   * These are the registered output targets that get disabled by default. They
   * must be explicitly enabled with the method enableOptimizedOutput.
   */
  private optimizedOutputs = new Set<number>();
  /**
   * This is the sorting controller for sorting attributes/uniforms of a layer
   * after all the attributes have been generated that are needed
   */
  ioSorting = new BaseIOSorting();
  /** This manages the mouse events for the current canvas context */
  userInputManager!: UserInputEventManager;
  /** This is the density the rendering renders for the surface */
  pixelRatio: number = window.devicePixelRatio;
  /** This is the GL render system we use to render scenes with views */
  renderer!: WebGLRenderer;
  /**
   * This is the resource manager that handles resource requests for instances
   */
  resourceManager!: ResourceRouter;
  /**
   * When defined, the next render will make sure color picking is updated
   * for layer interactions
   */
  private enabledOptimizedOutputs = new Set<number>();
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
   * This is used to prevent multiple pipeline updates from being requested
   * simultaneously. We take in all pipeline update requests for the frame, and
   * execute a single pipeline update at the next frame.
   */
  private pipelineLoadContext = 0;

  /** Diff manager to handle diffing resource objects for the pipeline */
  resourceDiffs: ReactiveDiff<IdentifiableById, BaseResourceOptions> =
    new ReactiveDiff({
      buildItem: async (initializer: BaseResourceOptions) => {
        await this.resourceManager.initResource(initializer);

        return {
          id: initializer.key,
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
      },
    });

  /** Diff manager to handle diffing scene objects for the pipeline */
  sceneDiffs: ReactiveDiff<LayerScene, ISceneOptions> = new ReactiveDiff({
    buildItem: async (initializer: ISceneOptions) => {
      const scene = new LayerScene(this, {
        key: initializer.key,
        views: initializer.views,
        layers: initializer.layers,
      });

      return scene;
    },

    destroyItem: async (_initializer: ISceneOptions, item: LayerScene) => {
      item.destroy();
      return true;
    },

    updateItem: async (initializer: ISceneOptions, item: LayerScene) => {
      await item.update(initializer);
    },
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
   * Broadcasts a cycle event to all event managers.
   */
  private broadcastEventManagerCycle(event: EventManagerBroadcastCycle) {
    // Resolve event managers reaction cycles
    for (
      let i = 0, iMax = this.userInputManager.eventManagers.length;
      i < iMax;
      ++i
    ) {
      const eventManager = this.userInputManager.eventManagers[i];

      switch (event) {
        case EventManagerBroadcastCycle.DID_RENDER:
          eventManager.didRender();
          break;

        case EventManagerBroadcastCycle.WILL_RENDER:
          eventManager.willRender();
          break;
      }
    }
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
    onViewReady?: (
      needsDraw: boolean,
      scene: LayerScene,
      view: View<IViewProps>
    ) => void
  ) {
    if (!this.gl) return;

    // Now that we have established what the time should be, let's swap our input parameter to reflect
    // the time we will be using for this frame
    const time = this.frameMetrics.currentTime;

    // Get the scenes in their added order
    const scenes = this.sceneDiffs.items;
    scenes.sort(sortByOrder);
    const erroredLayers: { [key: string]: [Layer<any, any>, Error] } = {};

    // Loop through scenes
    for (let i = 0, end = scenes.length; i < end; ++i) {
      const scene = scenes[i];
      const views = scene.renderViews;
      const layers = scene.layers;

      // Make sure the views and layers are ordered such that they render in the
      // appropriate order
      views.sort(sortByOrder);
      layers.sort(sortByOrder);

      // Loop through the views
      for (let k = 0, endk = views.length; k < endk; ++k) {
        const view = views[k];
        const validLayers: { [key: string]: Layer<any, any> } = {};

        // Let the view calculate if it should be drawn.
        // TODO: This should become more robust over time where layers and view
        // composition can be more self deterministic of what requires a redraw.
        if (!view.shouldDrawView(this.frameMetrics)) {
          continue;
        }

        // If this view has information to use, then we should perform steps to
        // prepare the view for use.
        if (layers.length > 0) {
          // Prepare to use the view
          view.willUseView();
        }

        // Get the bounds of the current rendering target to aid in calculating
        // the correct viewport.
        const rendererSize = this.renderer.getRenderSize();

        let renderTargetBounds = new Bounds<never>({
          width: rendererSize[0],
          height: rendererSize[1],
          x: 0,
          y: 0,
        });

        // If the view is outputting to target output buffers, then our render
        // target bounds is that of the buffer and NOT the renderer's size.
        if (view.renderTarget) {
          const target = Array.isArray(view.renderTarget)
            ? view.renderTarget[0]
            : view.renderTarget;
          const size = target.getSize();

          renderTargetBounds = new Bounds<never>({
            width: size[0],
            height: size[1],
            x: 0,
            y: 0,
          });
        }

        // Calculate the bounds of the viewport relative to the screen
        const viewportBounds = getAbsolutePositionBounds<View<IViewProps>>(
          view.props.viewport,
          renderTargetBounds,
          this.pixelRatio
        );

        // We must perform any operations necessary to make the view camera fit
        // the viewport Correctly
        view.fitViewtoViewport(renderTargetBounds, viewportBounds);

        // Let the layers update their uniforms before the draw
        for (let j = 0, endj = layers.length; j < endj; ++j) {
          // Get the layer to be rendered in the scene
          const layer = layers[j];
          // Update the layer with the view it is about to be rendered with
          layer.view = view;

          // Make sure the layer is given the opportunity to update all of it's
          // uniforms To match the view state and update any unresolved diffs
          // internally
          try {
            // Update uniforms, resolve diff changes
            layer.draw();
            // Flag the layer as valid
            validLayers[layer.id] = layer;
            // The view's animationEndTime is the largest end time found on one
            // of the view's child layers.
            view.animationEndTime = Math.max(
              view.animationEndTime,
              layer.animationEndTime,
              view.props.camera.animationEndTime
            );
            // Indicate this layer is being rendered at the current time frame
            layer.lastFrameTime = time;
          } catch (err) {
            if (err instanceof Error) {
              if (!erroredLayers[layer.id]) {
                erroredLayers[layer.id] = [layer, err];
              }
            }
          }
        }

        // Only include non-errored layers for the scene. We filter the scenes
        // layer PER view because context can change with a given view thus
        // making it possible for a layer to error within each view's context.
        // We render each view after completion of updates, thus the scene needs
        // to be cleared of errored layers immediately after the view context
        // has updated.
        const keepLayers = Object.values(validLayers);
        if (layers.length !== keepLayers.length) {
          scene.layerDiffs.diff(keepLayers.map((layer) => layer.initializer!));
        }

        // Our scene must have a valid container to operate
        if (!scene.container) continue;

        // Now perform the rendering for the view.
        // WHY WE RENDER NOW:
        // Each layer has a single material representing it. This means uniforms
        // based on view only get updated when the layer performs it's draw in
        // the context of each view. So, we have to render the view immediately
        // after the layer draws in context of it's view and has it's uniforms
        // updated in that context.
        if (onViewReady) {
          onViewReady(true, scene, view);
        }

        // This view has been resolved at this point.
        view.previousProps = view.props;
      }
    }

    // Get the layers with errors flagged for them and output the issues to the
    // console.
    const errors = Object.values(erroredLayers);
    this.printLayerErrors(errors);
  }

  /**
   * Free all resources consumed by this surface that gets applied to the GPU.
   */
  destroy() {
    this.resourceManager.destroy();
    this.userInputManager.destroy();
    this.sceneDiffs.destroy();
    this.renderer.dispose();
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

    // If no manual time was provided, we shall use Date.now in 32 bit format
    if (time === undefined) {
      this.frameMetrics.currentTime = Date.now() | 0;
    } else {
      // If this is our first frame and we have a manual time entry, then we
      // first need to sync up The manual time as our previous timing.
      if (this.frameMetrics.previousTime === this.frameMetrics.currentTime) {
        this.frameMetrics.previousTime = time;
      }

      this.frameMetrics.currentTime = time;
    }

    // We are rendering a new frame so increment our frame count
    this.frameMetrics.currentFrame++;
    this.frameMetrics.frameDuration =
      this.frameMetrics.currentTime - this.frameMetrics.previousTime;
    this.frameMetrics.previousTime = this.frameMetrics.currentTime;

    // Update all event managers with the current cycle event.
    this.broadcastEventManagerCycle(EventManagerBroadcastCycle.WILL_RENDER);

    // Before we draw the frame, we must have every camera resolve broadcasting
    // changes so everything can respond to the change before all of the drawing
    // operations take place.
    for (let i = 0, iMax = this.sceneDiffs.items.length; i < iMax; ++i) {
      const scene = this.sceneDiffs.items[i];
      // Make sure the scene will fully update for the render cycle.
      scene.clearCaches();

      for (let k = 0, kMax = scene.renderViews.length; k < kMax; ++k) {
        const view = scene.renderViews[k];
        view.props.camera.broadcast(view.id);
      }
    }

    // Make the layers commit their changes to the buffers then draw each scene
    // view on Completion.
    await this.commit((needsDraw, scene, view) => {
      // Our scene must have a valid container to operate
      if (!scene.container) return;

      if (needsDraw) {
        // Now perform the rendering
        this.drawSceneView(scene.container, view);
      }
    });

    // After we have drawn our views of our scenes, we can now ensure all of the
    // bounds Are updated in the interactions and flag our interactions ready
    // for mouse input
    if (this.userInputManager.waitingForRender) {
      this.userInputManager.waitingForRender = false;
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
      for (let i = 0, iMax = scene.renderViews.length; i < iMax; ++i) {
        const view = scene.renderViews[i];
        view.needsDraw = false;
        view.props.camera.resolve();
      }

      // Resolve layer renders
      for (let i = 0, iMax = scene.layers.length; i < iMax; ++i) {
        const layer = scene.layers[i];
        layer.needsViewDrawn = false;
      }
    }

    // Update all event managers with the current cycle event.
    this.broadcastEventManagerCycle(EventManagerBroadcastCycle.DID_RENDER);

    // Clear out the flag requesting a pick pass so we don't perform a pick
    // render pass unless we have another requested from mouse interactions
    this.enabledOptimizedOutputs.clear();
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
    const renderTarget = target || view.renderTarget || null;

    // If the update color pick is flagged, we make sure the view's picking
    // output type is enabled.
    if (view.renderTarget) {
      // Disable all optimized output targets
      const targets = view.getRenderTargets();
      targets.forEach((target) =>
        this.optimizedOutputs.forEach((outputTarget) =>
          target.disabledTargets.add(outputTarget)
        )
      );

      // Enable any targets that were specified
      if (this.enabledOptimizedOutputs.size > 0) {
        const targets = view.getRenderTargets();
        targets.forEach((target) =>
          this.enabledOptimizedOutputs.forEach((outputTarget) =>
            target.disabledTargets.delete(outputTarget)
          )
        );
      }
    }

    // If the view has an output target to render into, then we shift our target
    // focus to that target Make sure the correct render target is applied
    renderer.setRenderTarget(renderTarget);

    // Set the scissor rectangle.
    renderer.setScissor(
      {
        x: offset.x,
        y: offset.y,
        width: size.width,
        height: size.height,
      },
      renderTarget
    );
    // If a background is established, we should clear the background color
    // Specified for this context
    if (willClearColorBuffer) {
      // Clear the rect of color and depth so the region is totally it's own
      renderer.clearColor([
        background[0],
        background[1],
        background[2],
        background[3],
      ]);
    }

    // Make sure the viewport is set properly for the next render
    renderer.setViewport({
      x: offset.x,
      y: offset.y,
      width: size.width,
      height: size.height,
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
    renderer.render(scene, renderTarget, view, view.props.glState);
    // Indicate this view has been rendered for the given time allottment
    view.lastFrameTime = this.frameMetrics.currentTime;
  }

  /**
   * This must be executed when the canvas changes size so that we can
   * re-calculate the scenes and views dimensions for handling all of our
   * rendered elements.
   */
  fitContainer(_pixelRatio?: number) {
    if (!this.context) return;
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
   * This gathers all the overlap views of every view
   */
  private updateViewDimensions() {
    if (!this.sceneDiffs) return;
    this.viewDrawDependencies.clear();
    const scenes = this.sceneDiffs.items;
    const rendererSize = this.renderer.getRenderSize();

    // Fit all views to viewport
    for (let i = 0, endi = scenes.length; i < endi; i++) {
      const scene = scenes[i];

      for (let k = 0, kMax = scene.renderViews.length; k < kMax; ++k) {
        const view = scene.renderViews[k];
        view.willUseView();

        // To look for the overlaps of the view in screen space, we must
        // calculate the view's viewport bounds relative to the screenspace.
        let renderTargetBounds = new Bounds<never>({
          width: rendererSize[0],
          height: rendererSize[1],
          x: 0,
          y: 0,
        });

        // If the view is outputting to target output buffers, then our render
        // target bounds is that of the buffer and NOT the renderer's size.
        if (view.renderTarget) {
          const target = Array.isArray(view.renderTarget)
            ? view.renderTarget[0]
            : view.renderTarget;
          const size = target.getSize();

          renderTargetBounds = new Bounds<never>({
            width: size[0],
            height: size[1],
            x: 0,
            y: 0,
          });
        }

        // Calculate the bounds the viewport will occupy relative to the screen
        // space
        const viewportBounds = getAbsolutePositionBounds<View<IViewProps>>(
          view.props.viewport,
          renderTargetBounds,
          this.pixelRatio
        );

        view.fitViewtoViewport(renderTargetBounds, viewportBounds);
        view.props.camera.update(true);
      }
    }
  }

  /**
   * As users interact with the surface, this provides a quick way to view the
   * latest interaction that occurred from User events.
   */
  getCurrentInteraction() {
    return this.userInputManager.currentInteraction;
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
   * Retrieves all outputs the surface
   */
  getOptimizedOutputs() {
    return this.enabledOptimizedOutputs;
  }

  /**
   * This allws for querying a view's screen bounds. Null i;s returned if the
   * view id specified does not exist.
   */
  getViewSize(viewId: string): Bounds<View<IViewProps>> | null {
    for (let i = 0, iMax = this.sceneDiffs.items.length; i < iMax; ++i) {
      const scene = this.sceneDiffs.items[i];
      const view = scene.viewDiffs.getByKey(viewId);

      if (view) {
        if (view.renderTarget) return view.viewBounds;
        return view.screenBounds;
      }
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
            view.screenBounds.bottom,
          ]);

          return new Bounds({
            bottom: bottomRight[1],
            left: topLeft[0],
            right: bottomRight[0],
            top: topLeft[1],
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
          "Could not establish a webgl context. Surface is being destroyed to free resources.",
      });
      this.destroy();
      return this;
    }

    this.context = context;

    if (this.gl) {
      // Add in the specified optimized output targets
      options.optimizedOutputTargets?.forEach((target) =>
        this.optimizedOutputs.add(target)
      );
      // Initialize our event manager that handles mouse interactions/gestures
      // with the canvas
      this.initUserInputManager(options);
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

    // Get the starting width and height so adjustments don't affect it
    const width = canvas.width;
    const height = canvas.height;
    let hasContext = true;

    const rendererOptions: ISurfaceOptions["rendererOptions"] = Object.assign(
      {
        alpha: false,
        antialias: false,
        preserveDrawingBuffer: false,
        premultiplyAlpha: false,
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
      },
    });

    if (!hasContext || !this.renderer.gl) return null;
    this.context = this.renderer.gl;

    if (this.resourceManager) {
      this.resourceManager.setWebGLRenderer(this.renderer);
    }

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
    const defaultIOExpansion = DEFAULT_IO_EXPANSION();

    // Handle expanders passed in as an array or blank
    if (
      Array.isArray(options.ioExpansion) ||
      options.ioExpansion === undefined
    ) {
      // Initialize the Shader IO expansion objects
      this.ioExpanders =
        (options.ioExpansion && options.ioExpansion.slice(0)) ||
        defaultIOExpansion.slice(0) ||
        [];
    }

    // Handle expanders passed in as a method
    else if (options.ioExpansion instanceof Function) {
      this.ioExpanders = options.ioExpansion(defaultIOExpansion);
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
    const defaultShaderTransforms = DEFAULT_SHADER_TRANSFORM();

    // Handle transforms passed in as an array or blank
    if (
      Array.isArray(options.shaderTransforms) ||
      options.shaderTransforms === undefined
    ) {
      // Initialize the Shader IO expansion objects
      this.shaderTransforms =
        (options.shaderTransforms && options.shaderTransforms.slice(0)) ||
        defaultShaderTransforms.slice(0) ||
        [];
    }

    // Handle expanders passed in as a method
    else if (options.shaderTransforms instanceof Function) {
      this.shaderTransforms = options.shaderTransforms(defaultShaderTransforms);
    }
  }

  /**
   * Initializes elements for handling mouse interactions with the canvas.
   */
  private initUserInputManager(options: ISurfaceOptions) {
    if (!this.context) return;
    // We must inject an event manager to broadcast events through the layers
    // themselves
    const eventManagers: EventManager[] = (
      [new LayerMouseEvents()] as EventManager[]
    ).concat(options.eventManagers || []);

    // Generate the mouse manager for the layer
    this.userInputManager = new UserInputEventManager(
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
    const defaultResourceManagers = DEFAULT_RESOURCE_MANAGEMENT();
    // Create the controller for handling all resource managers
    this.resourceManager = new ResourceRouter();
    // Set the GL renderer to the
    this.resourceManager.setWebGLRenderer(this.renderer);

    // Get the managers requested by the configuration
    const managers =
      (options.resourceManagers && options.resourceManagers.slice(0)) ||
      defaultResourceManagers!.slice(0) ||
      [];

    // Register all of the managers for use by their type.
    managers.forEach((manager) => {
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
    const ctx = ++this.pipelineLoadContext;
    await onFrame();
    if (this.pipelineLoadContext !== ctx) return;

    if (pipeline.resources) {
      await this.resourceDiffs.diff(pipeline.resources);
    }

    if (pipeline.scenes) {
      await this.sceneDiffs.diff(pipeline.scenes);
    }

    // Ensures our view's dimensions are up to date
    this.updateViewDimensions();
  }

  /**
   * Handles printing discovered issues with layers to the console to help with
   * transparency for developing and debugging.
   */
  private printLayerErrors(errors: [Layer<any, any>, Error][]) {
    if (errors.length > 0) {
      console.warn(
        "Some layers errored during their draw update. These layers will be removed. They can be re-added if render() is called again:",
        errors.map((err) => err[0].id)
      );

      // Output each layer and why it errored
      errors.forEach((err) => {
        console.warn(`Layer ${err[0].id} removed for the following error:`);

        if (err[1]) {
          const message = err[1].stack || err[1].message;
          console.error(message);

          // This is a specific error to instances updating an attribute but
          // returning a value that is larger than the attribute size. The only
          // way to debug this is to run every instance in the layer and
          // retrieve it's update value and compare the return to the expected
          // size.
          if (
            message.indexOf("RangeError") > -1 ||
            message.indexOf("Source is too large") > -1
          ) {
            const layer = err[0];
            const changes = layer.bufferManager.changeListContext || [];
            let singleMessage:
              | [string, Instance, IInstanceAttribute<Instance>]
              | undefined;
            let errorCount = 0;

            for (let i = 0, iMax = changes.length; i < iMax; ++i) {
              const [instance] = changes[i];
              layer.shaderIOInfo.instanceAttributes.forEach((attr) => {
                const check = attr.update(instance);
                if (check.length !== attr.size) {
                  if (!singleMessage) {
                    singleMessage = [
                      "Example instance returned the wrong sized value for an attribute:",
                      instance,
                      attr,
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
    this.userInputManager.resize();
    this.resourceManager.resize();

    if (this.sceneDiffs) {
      const scenes = this.sceneDiffs.items;
      for (let i = 0, iMax = scenes.length; i < iMax; ++i) {
        const scene = scenes[i];

        for (let k = 0, kMax = scene.renderViews.length; k < kMax; ++k) {
          const view = scene.renderViews[k];
          view.pixelRatio = this.pixelRatio;
          view.props.camera.update(true);
        }
      }
    }

    // After the resize happens, the view draw dependencies may change as the
    // views will cover different region sizes
    this.updateViewDimensions();
  }

  /**
   * This flags all views to fully re-render
   */
  redraw() {
    for (let i = 0, iMax = this.sceneDiffs.items.length; i < iMax; ++i) {
      const viewLayers = this.sceneDiffs.items[i];

      for (let k = 0, kMax = viewLayers.renderViews.length; k < kMax; ++k) {
        const view = viewLayers.renderViews[k];
        view.needsDraw = true;
      }
    }
  }

  /**
   * This applies a new size to the renderer and resizes any additional
   * resources that requires being sized along with the renderer.
   */
  private setRendererSize(width: number, height: number) {
    width = width || 100;
    height = height || 100;

    // Set the canvas size for the renderer
    this.renderer.setSize(width, height);
  }

  /**
   * This allows a specified optimized output target to render next draw.
   */
  enableOptimizedOutput(output: number) {
    // We will flag the color range as needing an update
    this.enabledOptimizedOutputs.add(output);
  }
}
