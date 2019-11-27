import { EventManager } from "../event-management/event-manager";
import { Instance, InstanceProvider } from "../instance-provider";
import { Bounds } from "../math/primitives/bounds";
import { BaseResourceOptions } from "../resources";
import {
  ISceneOptions,
  ISurfaceOptions,
  IViewProps,
  LayerInitializer,
  Surface,
  View,
  ViewInitializer
} from "../surface";
import { IPipeline, Lookup, Omit, Size, SurfaceErrorType } from "../types";
import {
  nextFrame,
  onAnimationLoop,
  PromiseResolver,
  stopAnimationLoop
} from "../util";
import { Camera } from "../util/camera";

/**
 * This gets all of the values of a Lookup
 */
function lookupValues<T>(check: Function, lookup: Lookup<T>): T[] {
  const out: T[] = [];
  const toProcess = Object.values(lookup);

  for (let index = 0; index < toProcess.length; ++index) {
    const next = toProcess[index];

    if (next instanceof check) {
      out.push(next as T);
    } else {
      toProcess.push(...Object.values(next));
    }
  }

  return out;
}

/**
 * This gets all of the values of a Lookup
 */
function mapLookupValues<T, U>(
  label: string,
  check: (value: T | Lookup<T>) => boolean,
  lookup: Lookup<T>,
  callback: (key: string, value: T) => U
): U[] {
  const added = new Set();
  const out: U[] = [];
  const toProcess = Object.keys(lookup).map<[string, T | Lookup<T>]>(key => [
    key,
    (lookup as any)[key]
  ]);

  for (let index = 0; index < toProcess.length; ++index) {
    const next = toProcess[index];

    if (check(next[1])) {
      out.push(callback(next[0], next[1] as T));
    } else {
      let error = false;

      Object.keys(next[1]).forEach(key => {
        const value = (next[1] as any)[key];

        if (!added.has(value)) {
          toProcess.push([`${next[0]}.${key}`, value]);
          added.add(value);
        } else {
          error = true;
          console.warn("Invalid lookup for BasicSurface detected:", label);
        }
      });

      if (error) break;
    }
  }

  return out;
}

/** Non-keyed View options with ordering property to specify rendering order */
export type BasicSurfaceView<TViewProps extends IViewProps> = Omit<
  ViewInitializer<TViewProps>,
  "key"
> &
  Partial<Pick<IViewProps, "key">>;
/** Non-keyed layer initializer with ordering property to specify rendering order */
export type BasicSurfaceLayer = Omit<LayerInitializer, "key"> &
  Partial<Pick<IViewProps, "key">>;

/**
 * Defines a scene that elements are injected to. Each scene can be viewed with multiple views
 * and have several layers of injection into it.
 *
 * These are scene options without elements needing to specify keys. Instead, the keys will be
 * generated via Lookup definition keys.
 */
export type BasicSurfaceSceneOptions = Omit<
  ISceneOptions,
  "key" | "views" | "layers"
> & {
  /** Layers to inject elements into the scene */
  layers: Lookup<BasicSurfaceLayer>;
  /** Views for rendering a perspective of the scene to a surface */
  views: Lookup<BasicSurfaceView<IViewProps>>;
};

export type BasicSurfaceResourceOptions = Omit<BaseResourceOptions, "key"> & {
  key?: string;
};

export interface IBasicSurfacePipeline {
  /** Easy define the scenes to be used for the render pipeline */
  scenes: Lookup<BasicSurfaceSceneOptions>;
}

/**
 * Customization for the basic surface
 */
export interface IBasicSurfaceOptions<
  T extends Lookup<InstanceProvider<Instance>>,
  U extends Lookup<Camera>,
  V extends Lookup<EventManager>,
  W extends Lookup<BaseResourceOptions>
> {
  /** The container this surface will fill with a canvas to render within */
  container: HTMLElement;
  /**
   * A lookup of all cameras the surface will utilize. They are injected with identifiers to make it easy to
   * reference them later. It's highly recommended to use an enum to identify the camera.
   */
  cameras: U;
  /**
   * Tell the surface to absorb wheel events to prevent the wheel from scolling the page.
   * This defaults to true as it's more common to need wheel controls than not. Explicitly set to false to disable.
   */
  handlesWheelEvents?: boolean;
  /**
   * A list of providers you will utilize within your application. They are injected with identifiers to make it easy to
   * reference them later. It's highly recommended to use an enum to identify the provider.
   *
   * NOTE: This is optional as it is usually VERY handy to have strong typed providers
   */
  providers: T;
  /** Options used to specify settings for the surface itself and how it will be composited in the DOM */
  rendererOptions?: ISurfaceOptions["rendererOptions"];
  /** The resources to be used for the pipeline */
  resources?: W;

  // CALLBACKS

  /**
   * All of the event managers used to control the surface. They are injected with identifiers to make it easy to
   * reference them later. It's highly recommended to use an enum to identify the event manager.
   */
  eventManagers(cameras: U): V;
  /** A callback that provides the pipeline to use in the surface */
  scenes(
    resources: W,
    providers: T,
    cameras: U,
    managers: V
  ): Lookup<BasicSurfaceSceneOptions>;
  /** This will be called if no webgl context is detected */
  onNoWebGL?(): void;
}

/**
 * This is a surface that has some concepts already set up within it, such as monitoring
 * resizing, waiting for a valid size to be present, a render loop tied into requestAnimationFrame.
 * Nothing here is difficult to set up in your own custom Surface implementation, this may provide
 * enough basics to quickly get started or be enough for most small projects.
 *
 * This auto generates a canvas object that tracks the size of the provided container HTMLElement. Essentially
 * this surface attempts to fill in the provided container.
 */
export class BasicSurface<
  T extends Lookup<InstanceProvider<Instance>>,
  U extends Lookup<Camera>,
  V extends Lookup<EventManager>,
  W extends Lookup<BaseResourceOptions>
> {
  /** The context generated by this surface to render into. */
  private context: HTMLCanvasElement;
  /** This is the last known time this surface executed it's draw loop */
  private currentTime: number = 0;
  /** This is the identifier of the requestAnimationFrame, used for canceling */
  private drawRequestId: number = 0;
  /** The target canvas to render on */
  private options: IBasicSurfaceOptions<T, U, V, W>;
  /** This is the timer id for resize events. This is used to debounce resize events */
  private resizeTimer: number = 0;
  /** This is the context  */
  private waitForSizeContext: number = 0;

  /** The cameras specified for this surface */
  cameras: U;
  /** The surface we are implementing */
  base?: Surface;
  /** The event managers specified for this surface */
  eventManagers: V;
  /** The providers specified for this surface */
  providers: T;
  /** A promise to await for the surface to be ready for rendering */
  ready: Promise<BasicSurface<T, U, V, W>>;
  /** The resources specified for the surface pipeline */
  resources: W;

  constructor(options: IBasicSurfaceOptions<T, U, V, W>) {
    this.rebuild(options);
  }

  /**
   * Generates the proper context for our surface to work with.
   */
  private createContext() {
    // If our context is not defined, then one must be made
    if (!this.context) {
      this.context = document.createElement("canvas");
      this.context.title = "";
      this.context.width =
        (this.options.container.offsetWidth || 0) * window.devicePixelRatio;
      this.context.height =
        (this.options.container.offsetHeight || 0) * window.devicePixelRatio;
      this.context.style.width = `${this.options.container.offsetWidth || 0}px`;
      this.context.style.height = `${this.options.container.offsetHeight ||
        0}px`;
      this.options.container.appendChild(this.context);
    }
  }

  /**
   * Frees all GPU memory and resources used by this Surface.
   */
  destroy = () => {
    if (this.base) {
      this.base.destroy();
      delete this.base;
    }

    if (this.context) {
      this.context.remove();
      delete this.context;
    }

    stopAnimationLoop(this.drawRequestId);
    window.removeEventListener("resize", this.handleResize);
  };

  /**
   * The draw loop of the surface
   */
  private draw = async (time: number) => {
    if (!this.base) return;
    this.currentTime = time;
    this.base.draw(time);
  };

  /**
   * This is a handler that responds to varying resize events
   */
  private handleResize = () => {
    clearTimeout(this.resizeTimer);
    if (!this.base) return;

    this.resizeTimer = window.setTimeout(() => {
      this.fitContainer();
    }, 100);
  };

  /**
   * Initializes all elements for the surface
   */
  async init() {
    // If the base is established, then this is initialized
    if (this.base) return;
    // We wait for the DOM container to establish a size we can work with
    const valid = await this.waitForValidDimensions(this.options.container);
    // If the waiting process returns false it means we canceled the operation from overlapping calls into init()
    if (!valid) return;
    // Make the canvas context we wish to render into
    this.createContext();

    // In our initial calls to the surface we can have numerous errors emitted. Some errors are valid feedback into
    // the state of the client's browser. Some errors are system failures that should be handled gracefully and logged
    // appropriately for debugging.
    try {
      // Establish the providers this surface will track
      this.providers = this.options.providers;
      // Establish the cameras desired to be used in the surface
      this.cameras = this.options.cameras;
      // Establish the resources desired to be used in the surface
      this.resources = this.options.resources || ({} as W);
      // Establish the event managers to be used in the surface
      this.eventManagers = this.options.eventManagers(this.cameras);

      // Create the surface to work with
      this.base = await new Surface({
        context: this.context,
        handlesWheelEvents:
          this.options.handlesWheelEvents !== undefined
            ? this.options.handlesWheelEvents
            : true,
        pixelRatio: window.devicePixelRatio,
        eventManagers: lookupValues<EventManager>(
          EventManager,
          this.eventManagers
        ),
        rendererOptions: Object.assign(
          {
            alpha: true,
            antialias: false
          },
          this.options.rendererOptions
        )
      }).ready;

      // Make sure the context fits the container
      this.fitContainer(true);
      // Use the established cameras and managers to establish the initial pipeline for the surface
      // await this.updatePipeline();
      // Begin the draw loop
      this.drawRequestId = onAnimationLoop(this.draw);
      // Use the established cameras and managers to establish the initial pipeline for the surface
      await this.updatePipeline();
      // Establish event listeners
      window.addEventListener("resize", this.handleResize);
    } catch (err) {
      // We catch any initialization errors from the surface
      if (err.error === SurfaceErrorType.NO_WEBGL_CONTEXT) {
        if (this.options.onNoWebGL) this.options.onNoWebGL();
      } else {
        console.error("The Basic Surface could not be initialized");
        console.error(err.stack || err.message);
      }
    }
  }

  /**
   * Tells the surface to resize to the container if it's not fitted currently.
   */
  fitContainer(preventRedraw?: boolean) {
    if (this.base) {
      this.context.remove();

      this.base.resize(
        this.options.container.offsetWidth || 0,
        this.options.container.offsetHeight || 0
      );

      this.options.container.appendChild(this.context);
      if (!preventRedraw) this.base.draw(this.currentTime);
    }
  }

  /**
   * Retrieves the projection methods for a given view. If the projections do not exist, this returns null.
   */
  getViewProjections(viewId: string) {
    if (!this.base) return null;
    return this.base.getProjections(viewId);
  }

  /**
   * Retrieves the size of the view as it appears on the screen if the ID exists in the current pipeline.
   * If it does not exist yet, this will return [0, 0]
   */
  getViewScreenSize(viewId: string): Size {
    if (!this.base) return [0, 0];
    const bounds = this.base.getViewSize(viewId);
    if (!bounds) return [0, 0];

    return [bounds.width, bounds.height];
  }

  /**
   * Retrieves the bounds of the view as it appears on the screen (relative to the canvas).
   * If it does not exist yet, this will return a dimensionless Bounds object.
   */
  getViewScreenBounds(viewId: string): Bounds<View<IViewProps>> {
    if (!this.base) return new Bounds({ x: 0, y: 0, width: 0, height: 0 });
    const bounds = this.base.getViewWorldBounds(viewId);
    if (!bounds) return new Bounds({ x: 0, y: 0, width: 0, height: 0 });

    return bounds;
  }

  /**
   * Gets the bounds of the view within world space.
   * If it does not exist yet, this will return a dimensionless Bounds object.
   */
  getViewWorldBounds(viewId: string): Bounds<View<IViewProps>> {
    if (!this.base) return new Bounds({ x: 0, y: 0, width: 0, height: 0 });
    const bounds = this.base.getViewWorldBounds(viewId);
    if (!bounds) return new Bounds({ x: 0, y: 0, width: 0, height: 0 });

    return bounds;
  }

  /**
   * Redeclare the pipeline
   */
  async pipeline(callback: IBasicSurfaceOptions<T, U, V, W>["scenes"]) {
    this.options.scenes = callback;
    if (!this.base) return;
    await this.updatePipeline();
  }

  /**
   * Destroys all current existing GPU resources and reconstructs them anew.
   *
   * NOTE: options parameter f
   */
  async rebuild(): Promise<void>;
  async rebuild(clearProviders?: boolean): Promise<void>;
  async rebuild(options?: IBasicSurfaceOptions<T, U, V, W>): Promise<void>;
  async rebuild(param?: IBasicSurfaceOptions<T, U, V, W> | boolean) {
    let options;

    // See if the rebuild wanted to clear the providers or not.
    if (typeof param === "boolean") {
      if (param && this.providers) {
        const providers = lookupValues<InstanceProvider<Instance>>(
          InstanceProvider,
          this.providers
        );

        for (let i = 0, iMax = providers.length; i < iMax; ++i) {
          const provider = providers[i];
          provider.clear();
        }
      }
    }

    // Otherwise, the parameter is options injected for the surface initial build
    else {
      options = param;
    }

    if (this.options && options) {
      console.warn(
        "Ignoring options provided to rebuild method. The constructor is the only way to apply an options configuration object"
      );
    }

    // Destroy any existing base
    if (this.base) {
      this.base.destroy();
    }

    if (this.context) {
      this.context.remove();
      delete this.context;
    }

    // Only if the options have not been established will this work
    if (!this.options && options) this.options = options;
    // Make a resolver to handle making a promise and a way to resolve it easily
    const resolver = new PromiseResolver<BasicSurface<T, U, V, W>>();
    // Set our ready marker so contructors of the surface have an easy async pattern
    this.ready = resolver.promise;
    // Initialize this surface
    await this.init();
    // Resolve anything awaiting the ready marker for the basic surface. This is
    // primarily for the contructor to have an easy async pattern.
    resolver.resolve(this);
  }

  /**
   * Point to a new container to fill.
   */
  setContainer(container: HTMLElement) {
    this.options.container = container;
    container.appendChild(this.context);
    this.fitContainer();
  }

  /**
   * Calls the pipeline callback to retrieve an updated pipeline for the surface
   */
  async updatePipeline() {
    if (!this.base) return;

    // NOTE: This chunk establishes the potentially undeclared keys of the resource declaration objects. Thus it needs
    //       to execute before blocks that require the key to be established.
    //
    // Take the resource lookup and flatten it's values to a list. Each value will be given a key based on whether the
    // value expressed an explicit key or will be a key made from the properties leading up to the value in the lookup.
    const resources =
      mapLookupValues(
        "resources",
        (val: any) => val && val.type !== undefined,
        this.resources || [],
        (key: string, val: BaseResourceOptions) => {
          const resource: BaseResourceOptions = {
            ...val,
            key: val.key || key
          };

          val.key = resource.key;
          return resource;
        }
      ) || [];

    // We must convert all look ups of scenes and layers etc into a list of items that contain keys
    const pipelineWithLookups = this.options.scenes(
      this.resources || ({} as W),
      this.providers,
      this.cameras,
      this.eventManagers
    );

    const scenes = mapLookupValues(
      "scenes",
      (val: any) => val && val.views !== undefined && val.layers !== undefined,
      pipelineWithLookups,
      (sceneKey: string, val: BasicSurfaceSceneOptions) => {
        const views = mapLookupValues(
          "views",
          (val: any) => val && val.init !== undefined && val.init.length === 2,
          val.views,
          (key: string, val: BasicSurfaceView<IViewProps>) => {
            const view: ViewInitializer<IViewProps> = {
              ...val,
              key: `${sceneKey}.${val.key || key}`
            };

            // Make the props it's own object so we don't mutate the originating object when we apply the
            // calculated key
            view.init[1] = {
              ...view.init[1],
              key: view.key
            };

            return view;
          }
        );

        const layers = mapLookupValues(
          "layers",
          (val: any) => val && val.init !== undefined,
          val.layers,
          (key: string, val: BasicSurfaceLayer) => {
            const layer: LayerInitializer = {
              init: val.init,
              key: val.key || key
            };

            val.init[1].key = layer.key;
            return layer;
          }
        );

        const scene: ISceneOptions = {
          key: sceneKey,
          order: val.order,
          views,
          layers
        };

        if (val.order === undefined) {
          delete scene.order;
        }

        return scene;
      }
    );

    const pipeline: IPipeline = {
      resources,
      scenes
    };

    return await this.base.pipeline(pipeline);
  }

  /**
   * Sets up some polling to watch the container. Returns true if execution AFTER this method is still
   * valid. Returns false if execution after the method should be halted.
   */
  private async waitForValidDimensions(container: HTMLElement) {
    const waitForSizeId = ++this.waitForSizeContext;
    const resolver = new PromiseResolver<boolean>();
    let box = container.getBoundingClientRect();

    // Check to ensure the box width and height is valid
    if (box.width === 0 || box.height === 0) {
      let observing = true;
      const toWatch = {
        attributes: true
      };

      const observer = new MutationObserver(mutationsList => {
        if (!observing) return;

        for (const mutation of mutationsList) {
          if (mutation.type === "attributes") {
            box = container.getBoundingClientRect();

            if (box.width !== 0 && box.height !== 0) {
              observer.disconnect();
              observing = false;
              resolver.resolve(waitForSizeId === this.waitForSizeContext);
            }
          }
        }
      });

      observer.observe(container, toWatch);

      // Give the system an additional way to check for a valid sizing if the observer fails
      await nextFrame();
      box = container.getBoundingClientRect();

      if (observing && box.width !== 0 && box.height !== 0) {
        observer.disconnect();
        observing = false;
        resolver.resolve(waitForSizeId === this.waitForSizeContext);
      }
    } else {
      // Both calls awaiting a size must be async in order for this method to work
      await nextFrame();
      resolver.resolve(waitForSizeId === this.waitForSizeContext);
    }

    return await resolver.promise;
  }
}
