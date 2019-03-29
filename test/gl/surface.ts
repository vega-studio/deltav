import {
  BasicCameraController,
  ChartCamera,
  EventManager,
  ILayerSurfaceOptions,
  ISceneOptions,
  LayerInitializer,
  LayerSurface,
  Vec4
} from "src";
import { DEFAULT_RESOURCES, DEFAULT_SCENES } from "../types";

/**
 * The options for the surface.
 */
export interface ISurfaceOptions {
  /** Sets the background color of the surface */
  background?: Vec4;
  /** The container to place our rendering context within */
  container: HTMLElement;
  /** The event managers to provide for the surface. If not provided the default manager for the default camera will be used */
  eventManagers?: EventManager[] | null;
  /** The layers to render for this set up */
  layers?(): LayerInitializer[];
  /** Defines the exact resources to be present for the surface */
  resources?: ILayerSurfaceOptions["resources"];
  /** The optional scenes to establish */
  scenes?: ISceneOptions[] | null;

  /** Callback used to generate the extra elements */
  makeElements?(
    defaultController?: BasicCameraController,
    defaultCamera?: ChartCamera
  ): {
    /** The event managers to provide for the surface. If not provided the default manager for the default camera will be used */
    eventManagers?: EventManager[] | null;
    /** The layers to render for this set up */
    layers?(): LayerInitializer[];
    /** The optional scenes to establish */
    scenes?: ISceneOptions[] | null;
  };
}

/**
 * This is the management of the GL portion of the application. It sets up scenes, cameras, layers, and providers
 * necessary and establishes the draw loop.
 *
 * The providers and queries into the world space are really the only items external objects should use from this
 * Object.
 */
export class Surface {
  /** Governs panning, zooming, and bounding, as well as pan/zoom api */
  cameraControl: BasicCameraController;
  /** The containing element of this component */
  container: HTMLElement;
  /** The rendering context we will draw into */
  context: HTMLCanvasElement;
  /** The options this Surface is constructed/updated with */
  options: ISurfaceOptions;
  /** The layer manager that draws our GL elements */
  surface?: LayerSurface;

  // Resolver that resolves the surfaceReady promise that indicates the  surface has been created
  private surfaceReadyResolver: (surface: LayerSurface) => void;
  // This is the Promise one can await to see if the surface has been created yet
  surfaceReady: Promise<LayerSurface> = new Promise(resolve => {
    this.surfaceReadyResolver = resolve;
  });

  /** The last recorded time for a draw operation */
  private currentTime: number = 0;
  /** This is a context id that allows us to throw out overlapping actions that are waiting for a valid size */
  private waitForSizeContext: number = 0;
  /** This is the animation frame id we are waiting for. This is used to dispose the animation before it fires */
  private animationFrameId: number;

  constructor(options: ISurfaceOptions) {
    this.container = options.container;
  }

  /**
   * Generates the camera used to manage the scene
   */
  private cameraSetup() {
    return new BasicCameraController({
      camera: new ChartCamera(),
      ignoreCoverViews: true,
      startView: ["default-view"]
    });
  }

  /**
   * Tells the surface to resize to the container
   */
  resize() {
    if (this.surface) {
      this.surface.resize(
        this.container.offsetWidth || 0,
        this.container.offsetHeight || 0
      );
      this.surface.draw(this.currentTime);
    }
  }

  /**
   * Generates the proper context for our surface to work with.
   */
  makeContext() {
    // If the currently created context is not within the current container,
    // then we must remove the old one and construct anew.
    if (this.context && this.context.parentElement !== this.container) {
      if (this.context.parentElement) {
        this.context.parentElement.removeChild(this.context);
        delete this.context;
      }
    }

    // If our context is not defined, then one must be made
    if (!this.context) {
      this.context = document.createElement("canvas");
      this.context.title = "";
      this.context.width =
        this.container.offsetWidth || 0 * window.devicePixelRatio;
      this.context.height =
        this.container.offsetHeight || 0 * window.devicePixelRatio;
      this.context.style.width = `${this.container.offsetWidth || 0}px`;
      this.context.style.height = `${this.container.offsetHeight || 0}px`;
      this.container.appendChild(this.context);
    }
  }

  /**
   * Generates all of the layers necessary for the surface
   */
  updateLayers() {
    if (!this.surface) return;
    const makeLayers = this.options.layers;

    if (makeLayers) {
      this.surface.render(makeLayers() || []);
    }
  }

  /**
   * creates the fiesta GL scenes and layers if they don't yet exist.
   * Must be called after the initial sections are in the data.
   */
  async init(options: Partial<ISurfaceOptions>) {
    // Stop previous draw loop
    cancelAnimationFrame(this.animationFrameId);

    // Make sure the surface is pointing to the right container
    if (options.container && this.surface) {
      if (this.container !== options.container) {
        this.destroySurface();
        this.container = options.container;
      }
    }

    // Wait for valid dimensions
    const shouldContinue = await this.waitForValidDimensions(this.container);

    // If context has changed thus causing overlapping calls to this update: halt execution in favor
    // of the more recent call. This makes the method re-entrant.
    if (!shouldContinue) {
      return;
    }

    // Generate our camera controller
    const defaultController = this.cameraSetup();
    // Get feedback from the callback and the option settings
    let feedback = {};
    // Get the make elements method from our settings
    const makeElements = options.makeElements || this.options.makeElements;

    // If one exists make the elements now
    if (makeElements) {
      feedback = makeElements(defaultController, defaultController.camera);
    }

    // Feedback holds precedence
    this.options = Object.assign({}, this.options, feedback);
    // Determine what scenes are being requested for this surface
    const scenes: ISceneOptions[] = this.options.scenes || DEFAULT_SCENES;

    // Destroy the previous surface before creating a new one
    if (this.surface) {
      this.destroySurface();
    }

    // Make our canvas context
    this.makeContext();

    // Adjust the camera of the default scene
    scenes.forEach(scene => {
      if (DEFAULT_SCENES.indexOf(scene) > -1) {
        scene.views[0].camera = defaultController.camera;
      }
    });

    // Make the surface with all of the needed scenes
    this.surface = new LayerSurface();

    // Initialize the surface with the specified properties
    await this.surface
      .init({
        resources: this.options.resources || [
          DEFAULT_RESOURCES.atlas,
          DEFAULT_RESOURCES.font
        ],
        background: [0.0, 0.0, 0.0, 0.0],
        context: this.context,
        eventManagers: this.options.eventManagers || [defaultController],
        handlesWheelEvents: true,
        scenes
      })
      .then(() => {
        if (!this.surface) return;
        this.updateLayers();
        this.surfaceReadyResolver(this.surface);
      });

    // Start up the draw loop
    this.animationFrameId = requestAnimationFrame((time: number) =>
      this.draw(time)
    );
  }

  /**
   * Destroys the surface to free GPU resources and clean out memory leaks.
   */
  destroySurface() {
    // Make sure the animation does not execute
    cancelAnimationFrame(this.animationFrameId);

    if (this.context && this.context.parentElement) {
      this.context.parentElement.removeChild(this.context);
    }

    if (this.surface) {
      this.surface.destroy();
      delete this.surface;
    }

    // Reload the surface ready promise resolver
    this.surfaceReady = new Promise(
      resolve => (this.surfaceReadyResolver = resolve)
    );

    delete this.context;
  }

  /**
   * Trigger the draw of the surface
   */
  draw(time: number) {
    if (this.surface) {
      try {
        this.currentTime = time;
        this.updateLayers();
        this.surface.draw(time);
      } catch (err) {
        /* Absorb any errors the draw loop may emit */
      }
    }
    this.animationFrameId = requestAnimationFrame(time => this.draw(time));
  }

  /**
   * Sets up some polling to watch the container. Returns true if execution AFTER this method is still
   * valid. Returns false if execution after the method should be halted.
   */
  private waitForValidDimensions(container: HTMLElement): Promise<boolean> {
    const waitForSizeId = ++this.waitForSizeContext;

    return new Promise(async resolve => {
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
                resolve(waitForSizeId === this.waitForSizeContext);
              }
            }
          }
        });

        observer.observe(container, toWatch);

        // Give the system an additional way to check for a valid sizing if the observer fails
        setTimeout(() => {
          box = container.getBoundingClientRect();

          if (observing && box.width !== 0 && box.height !== 0) {
            observer.disconnect();
            observing = false;
            resolve(waitForSizeId === this.waitForSizeContext);
          }
        }, 1);
      } else {
        // Both calls awaiting a size must be async in order for this method to work
        setTimeout(() => {
          resolve(waitForSizeId === this.waitForSizeContext);
        }, 1);
      }
    });
  }
}
