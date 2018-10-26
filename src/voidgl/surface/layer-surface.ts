import * as Three from "three";
import { WebGLRenderTarget } from "three";
import { ImageInstance } from "../base-layers/images";
import { LabelInstance } from "../base-layers/labels";
import { Instance } from "../instance-provider/instance";
import { Bounds } from "../primitives/bounds";
import { Box } from "../primitives/box";
import { injectFragments } from "../shaders/util/attribute-generation";
import { PickType } from "../types";
import { FrameMetrics } from "../types";
import { analyzeColorPickingRendering } from "../util/color-picking-analysis";
import { DataBounds } from "../util/data-bounds";
import { Vec2 } from "../util/vector";
import { EventManager } from "./event-manager";
import { LayerMouseEvents } from "./event-managers/layer-mouse-events";
import { ILayerProps, Layer } from "./layer";
import {
  generateDefaultScene,
  IDefaultSceneElements
} from "./layer-processing/generate-default-scene";
import { generateLayerGeometry } from "./layer-processing/generate-layer-geometry";
import { generateLayerMaterial } from "./layer-processing/generate-layer-material";
import { generateLayerModel } from "./layer-processing/generate-layer-model";
import { injectShaderIO } from "./layer-processing/inject-shader-io";
import {
  getLayerBufferType,
  makeLayerBufferManager
} from "./layer-processing/layer-buffer-type";
import { MouseEventManager, SceneView } from "./mouse-event-manager";
import { ISceneOptions, Scene } from "./scene";
import { AtlasManager } from "./texture";
import { IAtlasOptions } from "./texture/atlas";
import { AtlasResourceManager } from "./texture/atlas-resource-manager";
import { ClearFlags, View } from "./view";

export interface ILayerSurfaceOptions {
  /**
   * These are the atlas resources we want available that our layers can be provided to utilize
   * for their internal processes.
   */
  atlasResources?: IAtlasOptions[];
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
   * This specifies the density of rendering in the surface. The default value is window.devicePixelRatio to match the
   * monitor for optimal clarity. Using a value of 1 will be acceptable, will not get high density renders, but will
   * have better performance if needed.
   */
  pixelRatio?: number;
  /**
   * This sets up the available scenes the surface will have to work with. Layers then can
   * reference the scene by it's scene property. The order of the scenes here is the drawing
   * order of the scenes.
   */
  scenes?: ISceneOptions[];
}

const DEFAULT_BACKGROUND_COLOR = new Three.Color(1.0, 1.0, 1.0);

function isCanvas(val: any): val is HTMLCanvasElement {
  return Boolean(val.getContext);
}

function isString(val: any): val is string {
  return Boolean(val.substr);
}

function isWebGLContext(val: any): val is WebGLRenderingContext {
  return Boolean(val.canvas);
}

export interface ILayerConstructable<T extends Instance> {
  new (props: ILayerProps<T>): Layer<any, any>;
}

/**
 * This is a pair of a Class Type and the props to be applied to that class type.
 */
export type LayerInitializer = [
  ILayerConstructable<Instance> & { defaultProps: ILayerProps<Instance> },
  ILayerProps<Instance>
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
  /** This is the atlas manager that will help with modifying and tracking atlas' generated for the layers */
  private atlasManager: AtlasManager = new AtlasManager();
  /** This is the gl context this surface is rendering to */
  private context: WebGLRenderingContext;
  /** This is the current viewport the renderer state is in */
  currentViewport = new Map<Three.WebGLRenderer, Box>();
  /**
   * This is the default scene that layers get added to if they do not specify a valid Scene.
   * This scene by default only has a single default view.
   */
  defaultSceneElements: IDefaultSceneElements;
  /**
   * This is the metrics of the current running frame
   */
  frameMetrics: FrameMetrics = {
    currentFrame: 0,
    currentTime: Date.now() | 0,
    previousTime: Date.now() | 0
  };
  /**
   * This is used to help resolve concurrent draws. There are some very async operations that should
   * not overlap in draw calls.
   */
  private isBufferingAtlas = false;
  /** This is all of the layers in this manager by their id */
  layers = new Map<string, Layer<Instance, ILayerProps<Instance>>>();
  /** This manages the mouse events for the current canvas context */
  private mouseManager: MouseEventManager;
  /**
   * This is the renderer that is meant for rendering the picking pass. We have a separate renderer so we can disable
   * over complicated features like antialiasing which would ruin the picking pass.
   */
  pickingRenderer: Three.WebGLRenderer;
  /** This is a target used to perform rendering our picking pass */
  pickingTarget: Three.WebGLRenderTarget;
  /** This is the density the rendering renders for the surface */
  pixelRatio: number = window.devicePixelRatio;
  /** This is the THREE render system we use to render scenes with views */
  renderer: Three.WebGLRenderer;
  /** This is the resource manager that handles resource requests for instances */
  resourceManager: AtlasResourceManager;
  /**
   * This is all of the available scenes and their views for this surface. Layers reference the IDs
   * of the scenes and the views to be a part of their rendering state.
   */
  scenes = new Map<string, Scene>();
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
  ): Layer<T, U> {
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
    this.initLayer(layer);

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
      scene: Scene,
      view: View,
      pickingPass: Layer<any, any>[]
    ) => void
  ) {
    if (!this.gl) return;

    // We are rendering a new frame so increment our frame count
    if (frameIncrement) this.frameMetrics.currentFrame++;
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

    // Get the scenes in their added order
    const scenes = Array.from(this.scenes.values());
    const validLayers: { [key: string]: Layer<any, any> } = {};
    const erroredLayers: { [key: string]: [Layer<any, any>, Error] } = {};

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
            layer.draw();
            validLayers[layer.id] = layer;
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

        if (onViewReady) {
          onViewReady(scene, view, pickingPass);
        }
      }
    }

    // get the layers with errors flagged for them
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
    this.pickingRenderer.dispose();
    this.currentViewport.clear();

    // TODO: Instances should be implementing destroy for these clean ups.
    LabelInstance.destroy();
    ImageInstance.destroy();
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
    this.commit(time, true, (scene, view, pickingPass) => {
      // Our scene must have a valid container to operate
      if (!scene.container) return;
      // Now perform the rendering
      this.drawSceneView(scene.container, view);

      // If a layer needs a picking pass, then perform a picking draw pass only
      // if a request for the color pick has been made, then we query the pixels rendered to our picking target
      if (pickingPass.length > 0 && this.updateColorPick) {
        // Get the requested metrics
        const mouse = this.updateColorPick.mouse;
        const views = this.updateColorPick.views;

        // Only if the view is interacted with should we both with rendering
        if (
          view.id !== this.defaultSceneElements.view.id &&
          views.indexOf(view) > -1
        ) {
          // Picking uses a pixel ratio of 1
          view.pixelRatio = 1.0;
          // Get the current flags for the view
          const flags = view.clearFlags.slice(0);
          // Set color rendering flasg
          view.clearFlags = [ClearFlags.COLOR, ClearFlags.DEPTH];

          // We must perform any operations necessary to make the view camera fit the viewport
          // Correctly with the possibly adjusted pixel ratio
          view.fitViewtoViewport(
            new Bounds({
              height: this.context.canvas.height / this.pixelRatio,
              width: this.context.canvas.width / this.pixelRatio,
              x: 0,
              y: 0
            })
          );

          // We must redraw the layers so they will update their uniforms to adapt to a picking pass
          for (let j = 0, endj = pickingPass.length; j < endj; ++j) {
            const layer = pickingPass[j];
            layer.picking.currentPickMode = PickType.SINGLE;
            try {
              layer.draw();
            } catch (err) {
              /** No-op, the first draw should have output an error for bad draw calls */
            }
            layer.picking.currentPickMode = PickType.NONE;
          }

          // Draw the picking container for the scene with our view long with our specialized picking renderer
          // NOTE: Neat trick, just remove 'this.pickingTarget' from the argument and add
          // canvas.parentNode.appendChild(this.pickingRenderer.getContext().canvas);
          // below where the picking Target is created and you will see what is being rendered to the color picking buffer
          this.drawSceneView(
            scene.pickingContainer,
            view,
            this.pickingRenderer,
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
          this.pickingRenderer.readRenderTargetPixels(
            this.pickingTarget,
            mouse[0] - view.screenBounds.x - pickWidth / 2,
            view.screenBounds.height -
              (mouse[1] - view.screenBounds.y) -
              pickHeight / 2,
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
    if (!this.isBufferingAtlas) {
      this.isBufferingAtlas = true;
      const didBuffer = await this.resourceManager.dequeueRequests();
      this.isBufferingAtlas = false;

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
  }

  /**
   * This finalizes everything and sets up viewports and clears colors and performs the actual render step
   */
  private drawSceneView(
    scene: Three.Scene,
    view: View,
    renderer?: Three.WebGLRenderer,
    target?: Three.WebGLRenderTarget
  ) {
    renderer = renderer || this.renderer;

    const offset = { x: view.viewBounds.left, y: view.viewBounds.top };
    const size = view.viewBounds;
    const rendererSize = renderer.getSize();
    const pixelRatio = renderer.getPixelRatio();
    rendererSize.width *= pixelRatio;
    rendererSize.height *= pixelRatio;
    const background = view.background;
    const context = renderer.getContext();

    // Something is up with threejs that does not allow us to set viewport x and y values. So for targets
    // We simply size the target to the view size and render. Thus scissoring is not required
    if (!target) {
      // Set the scissor rectangle.
      context.enable(context.SCISSOR_TEST);
      context.scissor(
        offset.x,
        rendererSize.height - offset.y - size.height,
        size.width,
        size.height
      );
      // If a background is established, we should clear the background color
      // Specified for this context
      if (view.background) {
        // Clear the rect of color and depth so the region is totally it's own
        context.clearColor(
          background[0],
          background[1],
          background[2],
          background[3]
        );
      }
    }

    // Get the view's clearing preferences
    if (view.clearFlags) {
      // For targets, we must also perform clear operations
      if (target) {
        // TODO: This is frustrating. Right now we can't specify and set the viewport for a render target
        // Possibly with Threejs going away we can actually be more explcit for the render area to a render target
        // and not cause this overhead of resizing the render target for every picking pass
        target.setSize(size.width, size.height);
        renderer.setRenderTarget(target);
        renderer.clear(
          view.clearFlags.indexOf(ClearFlags.COLOR) > -1,
          view.clearFlags.indexOf(ClearFlags.DEPTH) > -1,
          view.clearFlags.indexOf(ClearFlags.STENCIL) > -1
        );
      } else {
        renderer
          .getContext()
          .clear(
            (view.clearFlags.indexOf(ClearFlags.COLOR) > -1
              ? context.COLOR_BUFFER_BIT
              : 0x0) |
              (view.clearFlags.indexOf(ClearFlags.DEPTH) > -1
                ? context.DEPTH_BUFFER_BIT
                : 0x0) |
              (view.clearFlags.indexOf(ClearFlags.STENCIL) > -1
                ? context.STENCIL_BUFFER_BIT
                : 0x0)
          );
      }
    } else {
      // Default clearing is depth and color
      // For targets, we must also perform clear operations
      if (target) {
        // TODO: This is frustrating. Right now we can't specify and set the viewport for a render target
        // Possibly with Threejs going away we can actually be more explcit for the render area to a render target
        // and not cause this overhead of resizing the render target for every picking pass
        target.setSize(size.width, size.height);
        renderer.setRenderTarget(target);
        renderer.clear(true, true);
      } else {
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
      }
    }

    // Make sure the viewport is set properly for the next render
    renderer.setViewport(
      offset.x / pixelRatio,
      offset.y / pixelRatio,
      size.width,
      size.height
    );
    // Render the scene with the provided view metrics
    renderer.render(scene, view.viewCamera.baseCamera, target);
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
          const topLeft = view.viewToWorld({ x: 0, y: 0 });
          const bottomRight = view.screenToWorld({
            x: view.screenBounds.right,
            y: view.screenBounds.bottom
          });

          return new Bounds({
            bottom: bottomRight.y,
            left: topLeft.x,
            right: bottomRight.x,
            top: topLeft.y
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
    // Make sure we have a gl context to work with
    this.setContext(options.context);

    if (this.gl) {
      // Initialize our GL needs that set the basis for rendering
      this.initGL(options);
      // Initialize our event manager that handles mouse interactions/gestures with the canvas
      this.initMouseManager(options);
      // Initialize any resources requested or needed, such as textures or rendering surfaces
      await this.initResources(options);
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
    this.renderer = new Three.WebGLRenderer({
      // Context supports rendering to an alpha canvas only if the background color has a transparent
      // Alpha value.
      alpha: options.background && options.background[3] < 1.0,
      // Yes to antialias! Make it preeeeetty!
      antialias: true,
      // Make three use an existing canvas rather than generate another
      canvas,
      // TODO: This should be toggleable. If it's true it allows us to snapshot the rendering in the canvas
      //       But we dont' always want it as it makes performance drop a bit.
      preserveDrawingBuffer: true
    });

    // Generate a renderer for the picking pass
    this.pickingRenderer = new Three.WebGLRenderer({
      // Context supports rendering to an alpha canvas only if the background color has a transparent
      // Alpha value.
      alpha: false,
      // Picking shall not
      antialias: false,
      // Do not need this for picking
      preserveDrawingBuffer: true
    });

    // NOTE: Uncomment this plus remove this.pickingTarget from the drawSceneView of the color picking pass
    // to view the colors rendered to the color picking buffer. This disables the interactions but helps
    // debug what's going on with shaders etc
    // canvas.parentNode.appendChild(this.pickingRenderer.getContext().canvas);

    // We want clearing to be controlled via the layer
    this.renderer.autoClear = false;
    // This sets the pixel ratio to handle differing pixel densities in screens
    this.setRendererSize(width, height);
    // Set the pixel ratio to match the pixel density of the monitor in use
    this.renderer.setPixelRatio(this.pixelRatio);

    // Applies the background color and establishes whether or not the context supports
    // Alpha or not
    if (options.background) {
      this.renderer.setClearColor(
        new Three.Color(
          options.background[0],
          options.background[1],
          options.background[2]
        ),
        options.background[3]
      );
    } else {
      // If a background color was not established, then we set a default background color
      this.renderer.setClearColor(DEFAULT_BACKGROUND_COLOR);
    }

    // We want clearing to be controlled via the layer
    this.pickingRenderer.autoClear = false;
    // Picking does not need retina style precision
    this.pickingRenderer.setPixelRatio(1.0);
    // Applies the background color and establishes whether or not the context supports
    // Alpha or not
    this.pickingRenderer.setClearColor(new Three.Color(0, 0, 0), 1);

    // Once we have made our renderer we now make us a default scene to which we can add objects
    this.defaultSceneElements = generateDefaultScene(this.context);
    this.defaultSceneElements.view.background = options.background;
    // Set the default scene
    this.scenes.set(
      this.defaultSceneElements.scene.id,
      this.defaultSceneElements.scene
    );
    // Make a scene view depth tracker so we can track the order each scene view combo is drawn
    let sceneViewDepth = 0;

    // Make a SceneView for the default scene and view for mouse interactions
    this.sceneViews.push({
      depth: ++sceneViewDepth,
      scene: this.defaultSceneElements.scene,
      view: this.defaultSceneElements.view
    });

    // Turn on the scissor test to keep the rendering clipped within the
    // Render region of the context
    this.context.enable(this.context.SCISSOR_TEST);

    // Add the requested scenes to the surface and apply the necessary defaults
    if (options.scenes) {
      options.scenes.forEach(sceneOptions => {
        // Make us a new scene based on the requested options
        const newScene = new Scene(sceneOptions);

        // Make sure the default view is available for each scene
        // IFF no view is provided for the scene
        if (sceneOptions.views.length === 0) {
          newScene.addView(this.defaultSceneElements.view);

          this.sceneViews.push({
            depth: ++sceneViewDepth,
            scene: newScene,
            view: this.defaultSceneElements.view
          });
        }

        // Generate the views requested for the scene
        sceneOptions.views.forEach(viewOptions => {
          const newView = new View(viewOptions);
          newView.camera = newView.camera || this.defaultSceneElements.camera;
          newView.viewCamera =
            newView.viewCamera || this.defaultSceneElements.viewCamera;
          newView.viewport =
            newView.viewport || this.defaultSceneElements.viewport;
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
    }
  }

  /**
   * This does special initialization by gathering the layers shader IO, generates a material
   * and injects special automated uniforms and attributes to make instancing work for the
   * shader.
   */
  private initLayer<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>
  ): Layer<T, U> {
    // Set the layer's parent surface here
    layer.surface = this;
    // Set the resource manager this surface utilizes to the layer
    layer.resource = this.resourceManager;
    // For the sake of initializing uniforms to the correct values, we must first add the layer to it's appropriate
    // Scene so that the necessary values will be in place for the sahder IO
    const scene = this.addLayerToScene(layer);
    // Get the shader metrics the layer desires
    const shaderIO = layer.initShader();
    // Clean out nulls provided as a convenience to the layer
    shaderIO.instanceAttributes = (shaderIO.instanceAttributes || []).filter(
      Boolean
    );
    shaderIO.vertexAttributes = (shaderIO.vertexAttributes || []).filter(
      Boolean
    );
    shaderIO.uniforms = (shaderIO.uniforms || []).filter(Boolean);
    // Get the injected shader IO attributes and uniforms
    const { vertexAttributes, instanceAttributes, uniforms } = injectShaderIO(
      this.gl,
      layer,
      shaderIO
    );
    // After all of the shader IO is established, let's calculate the appropriate buffering strategy
    // For the layer.
    getLayerBufferType(this.gl, layer, vertexAttributes, instanceAttributes);
    // Generate the actual shaders to be used by injecting all of the necessary fragments and injecting
    // Instancing fragments
    const shaderMetrics = injectFragments(
      layer,
      shaderIO,
      vertexAttributes,
      instanceAttributes,
      uniforms
    );
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
    const model = generateLayerModel(layer, geometry, material);

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
    // Tell our manager to generate all of the atlas' requested for surface
    if (options.atlasResources) {
      for (const resource of options.atlasResources) {
        await this.atlasManager.createAtlas(resource);
      }
    }

    // Initialize our resource manager with the atlas manager
    this.resourceManager = new AtlasResourceManager({
      atlasManager: this.atlasManager
    });
  }

  /**
   * This finds the scene and view the layer belongs to based on the layer's props. For invalid or not provided
   * props, the layer gets added to default scenes and views.
   */
  private addLayerToScene<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>
  ): Scene {
    // Get the scene the layer will add itself to
    let scene = this.scenes.get(layer.props.scene || "");

    if (!scene) {
      // If no scene is specified by the layer, or the scene identifier is invalid, then we add the layer
      // To the default scene.
      scene = this.defaultSceneElements.scene;

      if (layer.props.scene) {
        console.warn(
          "Layer specified a scene that is not within the layer surface manager. Layer will be added to the default scene."
        );
      }
    }

    // Add the layer to the scene for rendering
    scene.addLayer(layer);

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
   * Used for reactive rendering and diffs out the layers for changed layers.
   */
  render(layerInitializers: LayerInitializer[]) {
    if (!this.gl) return;

    // Loop through all of the initializers and properly add and remove layers as needed
    if (layerInitializers && layerInitializers.length > 0) {
      layerInitializers.forEach(init => {
        const layerClass = init[0];
        const props = init[1];
        const existingLayer = this.layers.get(props.key);

        if (existingLayer) {
          existingLayer.willUpdateProps(props);

          // If we have a provider that is about to be newly set to the layer, then the provider
          // needs to do a full sync in order to have existing
          if (props.data !== existingLayer.props.data) {
            props.data.sync();
          }

          Object.assign(existingLayer.props, props);
          existingLayer.initializer[1] = existingLayer.props;
          existingLayer.didUpdateProps();
        } else {
          // Generate the new layer and provide it it's initial props
          const layer = new layerClass(
            Object.assign({}, layerClass.defaultProps, props)
          );
          // Keep the initializer object that generated the layer for reference and debugging
          layer.initializer = init;
          // Sync the data provider applied to the layer in case the provider has existing data
          // before being applied tot he layer
          layer.props.data.sync();
          // Add the layer to this surface
          this.addLayer(layer);
        }

        this.willDisposeLayer.set(props.key, false);
      });
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
    this.sceneViews.forEach(
      sceneView => (sceneView.view.pixelRatio = this.pixelRatio)
    );
    this.setRendererSize(width, height);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.pickingRenderer.setPixelRatio(1.0);
    this.mouseManager.resize();
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

    this.renderer.setSize(width, height);
    this.pickingRenderer.setSize(width, height);

    if (!this.pickingTarget) {
      this.pickingTarget = new WebGLRenderTarget(width, height, {
        magFilter: Three.LinearFilter,
        minFilter: Three.LinearFilter,
        stencilBuffer: false
      });
    }

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
