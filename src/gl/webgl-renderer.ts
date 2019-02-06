import { Vec2, Vec4 } from '../util';
import { GPUProxy } from './gpu-proxy';
import { RenderTarget } from './render-target';
import { SceneContainer } from './scene-container';

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
  /** The color that will be applied when the renderer clears a space */
  clearColor: Vec4;
  /** The current pixel ratio in use */
  pixelRatio: number;
  /** Indicates if the scissor test is enabled for next draw cycle */
  scissorTestEnabled: boolean;
}

/**
 * This is the primary file where the rendering and compositing resources and managing
 * gl state happens. A context is provided for the renderer to work with, then it is the
 * renderer's job to ensure state changes as expected and provide as much convenience as necessary
 * to make working with the webgl pipeline as easy as possible.
 */
export class WebGLRenderer {
  /** The context the renderer is managing */
  private _gl: WebGLRenderingContext;
  /** The readonly gl context the renderer determined for use */
  get gl() { return this._gl; }
  /** This is the compiler that performs all actions related to creating and updating buffers and objects on the GPU */
  private glProxy: GPUProxy;
  /** The options that constructed or are currently applied to the renderer */
  options: IWebGLRendererOptions;
  /** Any current internal state the renderer has applied to it's target */
  state: IWebGLRendererState;

  constructor(options: IWebGLRendererOptions) {
    this.options = Object.assign({
      alpha: false,
      antialias: true,
      preserveDrawingBuffer: true,
    }, options);

    if (!this.options.canvas) {
      console.warn('WebGLRenderer ERROR: A canvas is REQUIRED as a parameter.');
    }
  }

  /**
   * Clears the specified buffers.
   */
  clear(color?: boolean, depth?: boolean, stencil?: boolean) {
    let mask = 0;

    if (color) mask = mask | this.gl.COLOR_BUFFER_BIT;
    if (depth) mask = mask | this.gl.DEPTH_BUFFER_BIT;
    if (stencil) mask = mask | this.gl.STENCIL_BUFFER_BIT;

    this.gl.clear(mask);
  }

  /**
   * Clears the color either set with setClearColor, or clears the color specified.
   */
  clearColor(color?: Vec4) {
    const colorToClear = color || this.state.clearColor;

    this.gl.clearColor(
      colorToClear[0],
      colorToClear[1],
      colorToClear[2],
      colorToClear[3],
    );

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
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

    const gl = this.glProxy.getContext(this.options.canvas, {
      alpha: this.options.alpha || false,
      antialias: this.options.antialias || false,
      premultipliedAlpha: this.options.premultipliedAlpha || false,
      preserveDrawingBuffer: this.options.preserveDrawingBuffer || false,
    });

    if (gl) {
      this._gl = gl;
    }

    else if (this.options.onNoContext) {
      this.options.onNoContext();
    }

    else {
      console.warn('No context was able to be produced, and the handler onNoContext was not implemented for such cases.');
    }

    return this._gl;
  }

  /**
   * Renders the Scene specified
   */
  render(scene: SceneContainer) {
    // Loop through all of the models of the scene and process them for rendering
    scene.models.forEach(model => {
      model.geometry;
    });
  }

  /**
   * Sets the clear color to be used when the clear operation executes.
   */
  setClearColor(color: Vec4) {
    this.state.clearColor = color;
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
   * Sets the target to be rendered into which sets up the buffers to be rendered into.
   */
  setRenderTarget(target: RenderTarget) {
    // TODO
  }

  /**
   * Sets the region the scissor test will accept as visible. Anything outside the region
   * will be clipped.
   */
  setScissor(x: number, y: number, width: number, height: number) {
    const { pixelRatio } = this.state;
    const size = this.getCanvasDimensions();
    const _height = size[1];

    this.gl.scissor(x * pixelRatio, (_height - y - height) * pixelRatio, width * pixelRatio, height * pixelRatio);
  }

  /**
   * Sets the state of the scissor test.
   */
  setScissorTest(active: boolean) {
    this.state.scissorTestEnabled = active;

    if (active) {
      this.gl.enable(this.gl.SCISSOR_TEST);
    }

    else {
      this.gl.disable(this.gl.SCISSOR_TEST);
    }
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
   * Sets the viewport we render into.
   */
  setViewport(x: number, y: number, width: number, height: number) {
    const { pixelRatio } = this.state;
    const size = this.getCanvasDimensions();
    const _height = size[1];

    this.gl.viewport(x * pixelRatio, (_height - y - height) * pixelRatio, width * pixelRatio, height * pixelRatio);
  }
}
