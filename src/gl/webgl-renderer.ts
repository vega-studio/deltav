import { GLState } from "src/gl/gl-state";
import { Vec2, Vec4 } from "../util";
import { GLProxy } from "./gl-proxy";
import { RenderTarget } from "./render-target";
import { SceneContainer } from "./scene-container";

/**
 * Options used to create or update the renderer.
 */
export interface IWebGLRendererOptions {
  /**
   * Determines if the rendering context renders to a buffer with an alpha channel.
   * Performs better if no alpha channel is used, but may be needed if any DOM elements or
   * backgrounds needs to bleed through the canvas.
   */
  alpha?: boolean;
  /**
   * Set to true to use the system antialiasing set up. Performs much better when false, but definitely
   * looks better when true.
   */
  antialias?: boolean;
  /**
   * This is the canvas that is required to retrieve the webgl context to make all webgl calls with.
   */
  canvas: HTMLCanvasElement;
  /**
   * This needs to be true in order to query the canvas current rendered output. Performs better when false,
   * but some cases may need it to do such operations like snapshots etc.
   */
  preserveDrawingBuffer?: boolean;
  /**
   * Set to true to make the default context expect premultipled alpha for blending.
   */
  premultipliedAlpha?: boolean;

  /**
   * Callback indicating a context could not be generated.
   */
  onNoContext?(): void;
}

/**
 * Internal state of the renderer.
 */
export interface IWebGLRendererState {
  /** The current pixel ratio in use */
  pixelRatio: number;
}

/**
 * This is the primary file where the rendering and compositing resources and managing
 * gl state happens. A context is provided for the renderer to work with, then it is the
 * renderer's job to ensure state changes as expected and provide as much convenience as necessary
 * to make working with the webgl pipeline as easy as possible.
 */
export class WebGLRenderer {
  /** The context the renderer is managing */
  private _gl?: WebGLRenderingContext;
  /** The readonly gl context the renderer determined for use */
  get gl() {
    return this._gl;
  }
  /** This is the compiler that performs all actions related to creating and updating buffers and objects on the GPU */
  private glProxy: GLProxy;
  /** This handles anything related to state changes in the GL state */
  private glState: GLState;
  /** The options that constructed or are currently applied to the renderer */
  options: IWebGLRendererOptions;
  /** Any current internal state the renderer has applied to it's target */
  state: IWebGLRendererState;

  constructor(options: IWebGLRendererOptions) {
    this.options = Object.assign(
      {
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
      },
      options
    );

    if (!this.options.canvas) {
      console.warn("WebGLRenderer ERROR: A canvas is REQUIRED as a parameter.");
    }
  }

  /**
   * Clears the specified buffers.
   */
  clear(color?: boolean, depth?: boolean, stencil?: boolean) {
    this.glProxy.clear(color, depth, stencil);
  }

  /**
   * Clears the color either set with setClearColor, or clears the color specified.
   */
  clearColor(color?: Vec4) {
    if (color) this.glState.setClearColor(color);
    this.glProxy.clearColor();
  }

  /**
   * Free all resources this renderer utilized. Make sure textures and frame/render/geometry
   * buffers are all deleted. We may even use aggressive buffer removal that force resizes the buffers
   * so their resources are immediately reduced instead of waiting for the JS engine to free up resources.
   */
  dispose() {
    // TODO
  }

  /**
   * Retrieves the screendimensions of the canvas
   */
  getCanvasDimensions(): Vec2 {
    const { canvas } = this.options;
    const box = canvas.getBoundingClientRect();
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    if (box.width) width = box.width;
    if (box.height) height = box.height;

    return [width, height];
  }

  /**
   * Retrieve and establish the context from the canvas.
   */
  getContext() {
    if (this._gl) return this._gl;

    const gl = GLProxy.getContext(this.options.canvas, {
      alpha: this.options.alpha || false,
      antialias: this.options.antialias || false,
      premultipliedAlpha: this.options.premultipliedAlpha || false,
      preserveDrawingBuffer: this.options.preserveDrawingBuffer || false
    });

    if (gl.context) {
      this._gl = gl.context;
      this.glState = new GLState(gl.context);
      this.glProxy = new GLProxy(gl.context, this.glState, gl.extensions);
      this.glState.setProxy(this.glProxy);

      // Make sure our GPU is synced with our default state
      this.glState.syncState();
    } else if (this.options.onNoContext) {
      this.options.onNoContext();
    } else {
      console.warn(
        "No context was able to be produced, and the handler onNoContext was not implemented for such cases."
      );
    }

    return this._gl;
  }

  /**
   * Renders the Scene specified
   */
  render(scene: SceneContainer, target: RenderTarget | null = null) {
    // Context must be established to render
    if (!this.gl) return;

    // Establish the rendering state we're in right now
    this.setRenderTarget(target);

    // If the fbo is not ready, we're not drawing
    if (target && !target.gl) {
      console.warn(
        "FBO is not ready for drawing. Skipping the rendering of the scene and target:",
        { scene, target }
      );
      return;
    }

    // Loop through all of the models of the scene and process them for rendering
    scene.models.forEach(model => {
      const geometry = model.geometry;
      const material = model.material;

      // Let's put the material's program in use first so we can have the attribute information
      // available to us.
      if (this.glState.useMaterial(material)) {
        let geometryIsValid = true;

        // First update/compile all aspects of the geometry
        geometry.attributes.forEach((attribute, name) => {
          // If we successfully update/compile the attribute, then we enable it's vertex array
          if (this.glProxy.updateAttribute(attribute)) {
            this.glProxy.useAttribute(name, attribute);
          }

          // Otherwise, we flag this as invalid geometry so we don't cause errors or undefined
          // behavior while rendering
          else {
            console.warn("Could not update attribute", attribute);
            geometryIsValid = false;
          }
        });

        // If all of the attribute updates passed correctly, then we can use the established state
        // to make our draw call
        if (geometryIsValid) {
          this.glProxy.draw(model);
        } else {
          console.warn(
            "Geometry was unable to update correctly, thus we are skipping the drawing of",
            model
          );
        }
      } else {
        console.warn(
          "Could not utilize material. Skipping draw call for:",
          material,
          geometry
        );
      }
    });
  }

  /**
   * Reads the pixels from the current Render Target (or more specifically from the current framebuffer)
   */
  readPixels(
    x: number,
    y: number,
    width: number,
    height: number,
    out: ArrayBufferView
  ) {
    if (this.gl) {
      this.gl.readPixels(
        x,
        y,
        width,
        height,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        out
      );
    }
  }

  /**
   * Sets the clear color to be used when the clear operation executes.
   */
  setClearColor(color: Vec4) {
    this.glState.setClearColor(color);
  }

  /**
   * Applies a given ratio for the provided canvas context.
   */
  setPixelRatio(ratio: number) {
    const { canvas } = this.options;
    const size = this.getCanvasDimensions();

    canvas.width = size[0] * ratio;
    canvas.height = size[1] * ratio;
  }

  /**
   * Sets the region the scissor test will accept as visible. Anything outside the region
   * will be clipped.
   */
  setScissor(bounds?: { x: number; y: number; width: number; height: number }) {
    const { pixelRatio } = this.state;
    const size = this.getCanvasDimensions();
    const _height = size[1];

    if (bounds) {
      const { x, y, width, height } = bounds;
      this.glState.setScissor({
        x: x * pixelRatio,
        y: (_height - y - height) * pixelRatio,
        width: width * pixelRatio,
        height: height * pixelRatio
      });
    } else {
      this.glState.setScissor(null);
    }
  }

  /**
   * Retrieves the current pixel ratio in use for the context.
   */
  getPixelRatio() {
    return this.state.pixelRatio;
  }

  /**
   * Retrieves the size of the canvas ignoring pixel ratio.
   */
  getSize() {
    const { canvas } = this.options;
    const { pixelRatio } = this.state;

    return {
      width: canvas.width / pixelRatio,
      height: canvas.height / pixelRatio
    };
  }

  /**
   * Resizes the render area to the specified amount.
   */
  setSize(width: number, height: number) {
    const { canvas } = this.options;
    const { pixelRatio } = this.state;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  /**
   * This sets the context to render into the indicated target
   */
  setRenderTarget(target: RenderTarget | null) {
    if (!this.glState.useRenderTarget(target) && target) {
      // If unable to use yet, this indicates the FBO needs to be compiled
      // Probably due to uncompiled texture objects that the FBO needs.
      // First flag all textures as needing a texture unit
      target.getTextures().forEach(texture => {
        this.glState.willUseTextureUnit(texture, target);
      });

      // Now apply those textures (compile them while utilizing the texture units requested)
      // This will also trigger the compilation of the target since the textures used
      // This will also ensure the FBO is in use for the next draw call
      this.glState.applyUsedTextures();
    }
  }

  /**
   * Sets the viewport we render into.
   */
  setViewport(x: number, y: number, width: number, height: number) {
    const { pixelRatio } = this.state;
    const size = this.getCanvasDimensions();
    const _height = size[1];

    // Apply the viewport in a fashion that is more web dev friendly where top left is 0, 0
    this.glState.setViewport(
      x * pixelRatio,
      (_height - y - height) * pixelRatio,
      width * pixelRatio,
      height * pixelRatio
    );
  }
}
