import * as Three from 'three';
import { Bounds } from '../primitives/bounds';
import { Box } from '../primitives/box';
import { injectFragments } from '../shaders/util/attribute-generation';
import { EventManager } from '../surface/event-manager';
import { generateDefaultScene, IDefaultSceneElements } from '../surface/generate-default-scene';
import { generateLayerGeometry } from '../surface/generate-layer-geometry';
import { generateLayerMaterial } from '../surface/generate-layer-material';
import { generateLayerModel } from '../surface/generate-layer-model';
import { injectShaderIO } from '../surface/inject-shader-io';
import { MouseEventManager, SceneView } from '../surface/mouse-event-manager';
import { ISceneOptions, Scene } from '../surface/scene';
import { ClearFlags, View } from '../surface/view';
import { DataBounds } from '../util/data-bounds';
import { Instance } from '../util/instance';
import { InstanceUniformManager } from '../util/instance-uniform-manager';
import { ILayerProps, Layer } from './layer';
import { AtlasManager } from './texture';
import { IAtlasOptions } from './texture/atlas';
import { AtlasResourceManager } from './texture/atlas-resource-manager';

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

function isString(val: any): val is String {
  return Boolean(val.substr);
}

function isWebGLContext(val: any): val is WebGLRenderingContext {
  return Boolean(val.canvas);
}

export interface ILayerConstructable<T extends Instance> {
  new (props: ILayerProps<T>): Layer<any, any, any>;
}

/**
 * This is a pair of a Class Type and the props to be applied to that class type.
 */
export type LayerInitializer = [ILayerConstructable<Instance> & {defaultProps: ILayerProps<Instance>}, ILayerProps<Instance>];

/**
 * Used for reactive layer generation and updates.
 */
export function createLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {defaultProps: U}, props: U): LayerInitializer {
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
  currentViewport: Box;
  /**
   * This is the default scene that layers get added to if they do not specify a valid Scene.
   * This scene by default only has a single default view.
   */
  defaultSceneElements: IDefaultSceneElements;
  /** This manages the mouse events for the current canvas context */
  private mouseManager: MouseEventManager;
  /** This is all of the layers in this manager by their id */
  layers = new Map<string, Layer<any, any, any>>();
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
  /**
   * This flags all layers by id for disposal at the end of every render. A Layer must be recreated
   * after each render in order to clear it's disposal flag. This is the trick to making this a
   * reactive system.
   */
  willDisposeLayer = new Map<string, boolean>();

  /** Read only getter for the gl context */
  get gl() {
    return this.context;
  }

  /**
   * This adds a layer to the manager which will manage all of the resource lifecycles of the layer
   * as well as additional helper injections to aid in instancing and shader i/o.
   */
  addLayer<T extends Instance, U extends ILayerProps<T>, V>(layer: Layer<T, U, V>): Layer<T, U, V> {
    if (!layer.id) {
      console.warn('All layers must have an id');
      return layer;
    }

    if (this.layers.get(layer.id)) {
      console.warn('All layer\'s ids must be unique per layer manager');
      return layer;
    }

    // We add the layer to our management
    this.layers.set(layer.id, layer);
    // Now we initialize the layer's gl components
    this.initLayer(layer);

    return layer;
  }

  destroy() {
    this.mouseManager.destroy();
  }

  /**
   * This is the draw loop that must be called per frame for updates to take effect and display.
   */
  draw() {
    // Get the scenes in their added order
    const scenes = Array.from(this.scenes.values());

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

        // We must perform any operations necessary to make the view camera fit the viewport
        // Correctly
        view.fitViewtoViewport(
          new Bounds({
            height: this.context.canvas.height,
            width: this.context.canvas.width,
            x: 0,
            y: 0,
          }),
        );

        // Let the layers update their uniforms before the draw
        for (let j = 0, endj = layers.length; j < endj; ++j) {
          // Get the layer to be rendered in the scene
          const layer = layers[j];
          // Update the layer with the view it is about to be rendered with
          layer.view = view;
          // Make sure the layer is given the opportunity to update all of it's uniforms
          // To match the view state and update any unresolved diffs internally
          layer.draw();
        }

        // Now perform the rendering
        this.drawSceneView(scene.container, view);
      }
    }

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
    // All resource requests and being their processing
    this.resourceManager.dequeueRequests();
  }

  /**
   * This finalizes everything and sets up viewports and clears colors and
   */
  drawSceneView(scene: Three.Scene, view: View) {
    const offset = {x: view.viewBounds.left, y: view.viewBounds.top};
    const size = view.viewBounds;
    const rendererSize = this.renderer.getSize();
    rendererSize.width *= this.renderer.getPixelRatio();
    rendererSize.height *= this.renderer.getPixelRatio();
    const background = view.background;

    // Set the scissor rectangle.
    this.context.enable(this.context.SCISSOR_TEST);
    this.context.scissor(offset.x, rendererSize.height - offset.y - size.height, size.width, size.height);

    // If a background is established, we should clear the background color
    // Specified for this context
    if (view.background) {
      // Clear the rect of color and depth so the region is totally it's own
      this.context.clearColor(background[0], background[1], background[2], background[3]);
    }

    // Get the view's clearing preferences
    if (view.clearFlags) {
      this.context.clear(
        (view.clearFlags.indexOf(ClearFlags.COLOR) > -1 ? this.context.COLOR_BUFFER_BIT : 0x0) |
        (view.clearFlags.indexOf(ClearFlags.DEPTH) > -1 ? this.context.DEPTH_BUFFER_BIT : 0x0) |
        (view.clearFlags.indexOf(ClearFlags.STENCIL) > -1 ? this.context.STENCIL_BUFFER_BIT : 0x0),
      );
    }

    // Default clearing is depth and color
    else {
      this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
    }

    // Only if the viewport is different from last viewport should we attempt a viewport state
    // Change.
    const box = this.currentViewport;

    if (!box || box.x !== offset.x || box.y !== offset.y || box.width !== size.width || box.height !== size.height) {
      this.renderer.setViewport(offset.x / this.pixelRatio, offset.y / this.pixelRatio, size.width, size.height);
      this.currentViewport = {
        height: size.height,
        width: size.width,
        x: offset.x,
        y: offset.y,
      };
    }

    // Render the scene with the provided view metrics
    this.renderer.render(scene, view.viewCamera.baseCamera);
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
    // Initialize our GL needs that set the basis for rendering
    this.initGL(options);
    // Initialize our event manager that handles mouse interactions/gestures with the canvas
    this.initMouseManager(options);
    // Initialize any resources requested or needed, such as textures or rendering surfaces
    await this.initResources(options);

    return this;
  }

  /**
   * This initializes the Canvas GL contexts needed for rendering.
   */
  private initGL(options: ILayerSurfaceOptions) {
    if (!this.context) {
      console.error('Can not initialize Layer Surface as a valid GL context was not established.');
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
      alpha: options.background && (options.background[3] < 1.0),
      // Yes to antialias! Make it preeeeetty!
      antialias: true,
      // Make three use an existing canvas rather than generate another
      canvas,
      // TODO: This should be toggleable. If it's true it allows us to snapshot the rendering in the canvas
      //       But we dont' always want it as it makes performance drop a bit.
      preserveDrawingBuffer: true,
    });

    // We want clearing to be controlled via the layer
    this.renderer.autoClear = false;
    // Charts don't really have face culling. Just 2D shapes
    this.renderer.setFaceCulling(Three.CullFaceNone);

    // This sets the pixel ratio to handle differing pixel densities in screens
    this.renderer.setSize(width, height);
    // Set the pixel ratio to match the pixel density of the monitor in use
    this.renderer.setPixelRatio(this.pixelRatio);

    // Applies the background color and establishes whether or not the context supports
    // Alpha or not
    if (options.background) {
      this.renderer.setClearColor(
        new Three.Color(
          options.background[0],
          options.background[1],
          options.background[2],
        ),
        options.background[3],
      );
    }

    // If a background color was not established, then we set a default background color
    else {
      this.renderer.setClearColor(DEFAULT_BACKGROUND_COLOR);
    }

    // Once we have made our renderer we now make us a default scene to which we can add objects
    this.defaultSceneElements = generateDefaultScene(this.context);
    this.defaultSceneElements.view.background = options.background;
    // Set the default scene
    this.scenes.set(this.defaultSceneElements.scene.id, this.defaultSceneElements.scene);
    // Make a scene view depth tracker so we can track the order each scene view combo is drawn
    let sceneViewDepth = 0;

    // Make a SceneView for the default scene and view for mouse interactions
    this.sceneViews.push({
      depth: ++sceneViewDepth,
      scene: this.defaultSceneElements.scene,
      view: this.defaultSceneElements.view,
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
            view: this.defaultSceneElements.view,
          });
        }

        // Generate the views requested for the scene
        sceneOptions.views.forEach(viewOptions => {
          const newView = new View(viewOptions);
          newView.camera = newView.camera || this.defaultSceneElements.camera;
          newView.viewCamera = newView.viewCamera || this.defaultSceneElements.viewCamera;
          newView.viewport = newView.viewport || this.defaultSceneElements.viewport;
          newView.pixelRatio = this.pixelRatio;
          newScene.addView(newView);

          this.sceneViews.push({
            depth: ++sceneViewDepth,
            scene: newScene,
            view: newView,
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
  private initLayer<T extends Instance, U extends ILayerProps<T>, V>(layer: Layer<T, U, V>): Layer<T, U, V> {
    // Set the resource manager this surface utilizes to the layer
    layer.resource = this.resourceManager;
    // For the sake of initializing uniforms to the correct values, we must first add the layer to it's appropriate
    // Scene so that the necessary values will be in place for the sahder IO
    const scene = this.addLayerToScene(layer);
    // Get the shader metrics the layer desires
    const shaderIO = layer.initShader();
    // Get the injected shader IO attributes and uniforms
    const { vertexAttributes, instanceAttributes, uniforms } = injectShaderIO(layer, shaderIO);
    // Generate the actual shaders to be used by injecting all of the necessary fragments and injecting
    // Instancing fragments
    const shaderMetrics = injectFragments(shaderIO, vertexAttributes, instanceAttributes, uniforms);
    // Generate the geometry this layer will be utilizing
    const geometry = generateLayerGeometry(shaderMetrics.maxInstancesPerBuffer, vertexAttributes, shaderIO.vertexCount);
    // This is the material that is generated for the layer that utilizes all of the generated and
    // Injected shader IO and shader fragments
    const material = generateLayerMaterial(layer, shaderMetrics.vs, shaderMetrics.fs, uniforms, shaderMetrics.materialUniforms);
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

    // The layer now needs a specialized uniform manager to provide instances with an appropriate set of uniforms
    // To be able to render.
    layer.uniformManager = new InstanceUniformManager(layer, scene);

    return layer;
  }

  /**
   * Initializes elements for handling mouse interactions with the canvas.
   */
  private initMouseManager(options: ILayerSurfaceOptions) {
    this.mouseManager = new MouseEventManager(this.context.canvas, this.sceneViews, options.eventManagers || [], options.handlesWheelEvents);
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
      atlasManager: this.atlasManager,
    });
  }

  /**
   * This finds the scene and view the layer belongs to based on the layer's props. For invalid or not provided
   * props, the layer gets added to default scenes and views.
   */
  private addLayerToScene<T extends Instance, U extends ILayerProps<T>, V>(layer: Layer<T, U, V>): Scene {
    // Get the scene the layer will add itself to
    let scene = this.scenes.get(layer.props.scene);

    if (!scene) {
      // If no scene is specified by the layer, or the scene identifier is invalid, then we add the layer
      // To the default scene.
      scene = this.defaultSceneElements.scene;

      if (layer.props.scene) {
        console.warn('Layer specified a scene that is not within the layer surface manager. Layer will be added to the default scene.');
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
  removeLayer<T extends Instance, U extends ILayerProps<T>, V>(layer: Layer<T, U, V>): Layer<T, U, V> {
    // Make sure we are removing a layer that exists in the system
    if (!this.layers.get(layer && layer.id)) {
      console.warn('Tried to remove a layer that is not in the manager.', layer);
      return layer;
    }

    layer.uniformManager.removeFromScene();
    layer.destroy();
    this.layers.delete(layer.id);

    return layer;
  }

  /**
   * Used for reactive rendering and diffs out the layers for changed layers.
   */
  render(layerInitializers: LayerInitializer[]) {
    // Loop through all of the initializers and properly add and remove layers as needed
    if (layerInitializers && layerInitializers.length > 0) {
      layerInitializers.forEach(init => {
        const layerClass = init[0];
        const props = init[1];
        const existingLayer = this.layers.get(props.key);

        if (existingLayer) {
          existingLayer.willUpdateProps(props);
          Object.assign(existingLayer.props, props);
          existingLayer.didUpdateProps();
        } else {
          this.addLayer(new layerClass(Object.assign(props, layerClass.defaultProps)));
        }
        this.willDisposeLayer.set(props.key, false);
      });
    }

    // Take any layer that retained it's disposal flag and trash it
    this.willDisposeLayer.forEach((dispose, layerId) => {
      if (dispose) {
        this.removeLayer(this.layers.get(layerId));
      }
    });

    // Resolve that all disposals occurred
    this.willDisposeLayer.clear();

    // Reflag every layer for removal again so creation of layers will determine
    // Which layers remain for a reactive pattern
    this.layers.forEach((layer, id) => {
      this.willDisposeLayer.set(id, true);
    });
  }

  /**
   * This must be executed when the canvas changes size so that we can re-calculate the scenes and views
   * dimensions for handling all of our rendered elements.
   */
  fitContainer(pixelRatio?: number) {
    const container = this.context.canvas.parentElement;

    if (container) {
      const canvas = this.context.canvas;
      canvas.className = '';
      canvas.setAttribute('style', '');
      container.style.position = 'relative';
      canvas.style.position = 'absolute';
      canvas.style.left = '0xp';
      canvas.style.top = '0xp';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.setAttribute('width', '');
      canvas.setAttribute('height', '');
      const containerBox = container.getBoundingClientRect();
      const box = canvas.getBoundingClientRect();

      this.resize(box.width || 100, containerBox.height || 100);
    }
  }

  resize(width: number, height: number, pixelRatio?: number) {
    this.pixelRatio = pixelRatio || this.pixelRatio;
    this.sceneViews.forEach(sceneView => sceneView.view.pixelRatio = this.pixelRatio);
    this.renderer.setSize(width || 100, height || 100);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.mouseManager.resize();
  }

  /**
   * This establishes the rendering canvas context for the surface.
   */
  setContext(context: WebGLRenderingContext | HTMLCanvasElement | string) {
    if (!context) {
      return;
    }

    if (isWebGLContext(context)) {
      this.context = context;
    }

    else if (isCanvas(context)) {
      this.context = context.getContext('webgl') || context.getContext('experimental-webgl');
    }

    else if (isString(context)) {
      const element = document.getElementById(context);

      if (isCanvas(element)) {
        this.setContext(element);
      }
    }
  }
}
