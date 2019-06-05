import { Size } from "../types";
import { Vec4 } from "../util";
import { Attribute } from "./attribute";
import { Geometry } from "./geometry";
import { GLProxy } from "./gl-proxy";
import { GLState } from "./gl-state";
import { Model } from "./model";
import { RenderTarget } from "./render-target";
import { Scene } from "./scene";
import { WebGLStat } from "./webgl-stat";

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
  /** Sets up a clear mask to ensure the clear operation only happens once per draw */
  clearMask: [boolean, boolean, boolean];
  /** Stores which render target is in focus for the current operations on the renderer */
  currentRenderTarget: RenderTarget | null;
  /** The current display size of the canvas */
  displaySize: Size;
  /** The current pixel ratio in use */
  pixelRatio: number;
  /** The current rendering size of the canvas */
  renderSize: Size;
}

/**
 * This is the primary file where the rendering and compositing resources and managing
 * gl state happens. A context is provided for the renderer to work with, then it is the
 * renderer's job to ensure state changes as expected and provide as much convenience as necessary
 * to make working with the webgl pipeline as easy as possible.
 */
export class WebGLRenderer {
  /** When this is set this creates */
  set debugContext(val: string) {
    if (this.glProxy) this.glProxy.debugContext = val;
    if (this.glState) this.glState.debugContext = val;
  }

  /** The context the renderer is managing */
  private _gl?: WebGLRenderingContext;
  /** The readonly gl context the renderer determined for use */
  get gl() {
    return this._gl;
  }
  /** This is the compiler that performs all actions related to creating and updating buffers and objects on the GPU */
  glProxy: GLProxy;
  /** This handles anything related to state changes in the GL state */
  glState: GLState;
  /** The options that constructed or are currently applied to the renderer */
  options: IWebGLRendererOptions;

  /** Any current internal state the renderer has applied to it's target */
  state: IWebGLRendererState = {
    clearMask: [false, false, false],
    currentRenderTarget: null,
    displaySize: [1, 1],
    pixelRatio: 1,
    renderSize: [1, 1]
  };

  constructor(options: IWebGLRendererOptions) {
    // Assign defaults to our options
    this.options = Object.assign(
      {
        alpha: false,
        antialias: false,
        preserveDrawingBuffer: false
      },
      options
    );

    // Make sure we are provided a canvas to work with
    if (!this.options.canvas) {
      console.warn("WebGLRenderer ERROR: A canvas is REQUIRED as a parameter.");
    }

    // Initialize context for the renderer
    this.getContext();
  }

  /**
   * Clears the specified buffers.
   */
  clear(color?: boolean, depth?: boolean, stencil?: boolean) {
    const clear = this.state.clearMask;

    this.state.clearMask = [
      clear[0] || color || false,
      clear[1] || depth || false,
      clear[2] || stencil || false
    ];
  }

  /**
   * Clears the color either set with setClearColor, or clears the color specified.
   */
  clearColor(color?: Vec4) {
    if (color) {
      this.glState.setClearColor(color);
    }
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
      this.glState = new GLState(gl.context, gl.extensions);
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
   * Retrieves the size of the canvas ignoring pixel ratio.
   */
  getDisplaySize(): Size {
    return this.state.displaySize;
  }

  /**
   * Retrieves the current pixel ratio in use for the context.
   */
  getPixelRatio() {
    return this.state.pixelRatio;
  }

  /**
   * Retrieves the size of the rendering context. This is the pixel dimensions
   * of what is being rendered into.
   */
  getRenderSize(): Size {
    return this.state.renderSize;
  }

  /**
   * Returns the full viewport for the current target.
   *
   * If a RenderTarget is not set, then this returns the viewport of the canvas ignoring
   * the current pixel ratio.
   */
  getFullViewport() {
    const target = this.state.currentRenderTarget;

    if (target) {
      return {
        x: 0,
        y: 0,
        width: target.width,
        height: target.height
      };
    } else {
      const size = this.getDisplaySize();

      return {
        x: 0,
        y: 0,
        width: size[0],
        height: size[1]
      };
    }
  }

  /**
   * Prepares the specified attribute
   */
  prepareAttribute(geometry: Geometry, attribute: Attribute, name: string) {
    // If we successfully update/compile the attribute, then we enable it's vertex array
    if (this.glProxy.updateAttribute(attribute)) {
      this.glProxy.useAttribute(name, attribute, geometry);
    }

    // Otherwise, we flag this as invalid geometry so we don't cause errors or undefined
    // behavior while rendering
    else {
      console.warn("Could not update attribute", attribute);
      return false;
    }

    return true;
  }

  /**
   * Renders the Scene specified
   */
  render(scene: Scene, target: RenderTarget | null = null) {
    // Context must be established to render
    if (!this.gl) return;

    // Establish the rendering state we're in right now
    this.setRenderTarget(target);

    // Apply the last clear mask provided for the render
    const clear = this.state.clearMask;
    if (clear[0] || clear[1] || clear[2]) {
      this.glProxy.clear(clear[0], clear[1], clear[2]);
      this.state.clearMask = [false, false, false];
    }

    // If the fbo is not ready, we're not drawing
    if (target && !target.gl) {
      console.warn(
        "FBO is not ready for drawing. Skipping the rendering of the scene and target:",
        { scene, target }
      );
      return;
    }

    // We'll remove any models that have errored from the scene
    const toRemove: Model[] = [];
    // Loop through all of the models of the scene and process them for rendering
    scene.models.forEach((model: Model) => {
      this.renderModel(model, toRemove);
    });

    // Clear out any failed models from the scene
    toRemove.forEach(model => {
      scene.remove(model);
    });
  }

  /**
   * Renders the specified model
   */
  private renderModel(model: Model, toRemove: Model[]) {
    const geometry = model.geometry;
    const material = model.material;

    // Let's put the material's program in use first so we can have the attribute information
    // available to us.
    if (this.glState.useMaterial(material)) {
      let geometryIsValid = true;

      // Faster to use defined functions rather than closures for loops
      const attributeLoop = function(attribute: Attribute, name: string) {
        geometryIsValid =
          this.prepareAttribute(geometry, attribute, name) && geometryIsValid;
      };

      // First update/compile all aspects of the geometry
      geometry.attributes.forEach(attributeLoop, this);
      // Now all of our attributes are established, we must make sure our vertex arrays are cleaned up
      this.glState.applyVertexAttributeArrays();

      // If all of the attribute updates passed correctly, then we can use the established state
      // to make our draw call
      if (geometryIsValid) {
        this.glProxy.draw(model);
      } else {
        console.warn(
          "Geometry was unable to update correctly, thus we are skipping the drawing of",
          model
        );

        toRemove.push(model);
      }
    } else {
      console.warn(
        "Could not utilize material. Skipping draw call for:",
        material,
        geometry
      );

      toRemove.push(model);
    }
  }

  /**
   * Reads the pixels from the current Render Target (or more specifically from the current framebuffer)
   *
   * By default the viewport is set based on the canvas being rendered into. Include a render target
   * to make the viewport be applied with the target considered rather than needing pixel density considerations.
   */
  readPixels(
    x: number,
    y: number,
    width: number,
    height: number,
    out: ArrayBufferView
  ) {
    if (!this.gl) return;
    const target = this.state.currentRenderTarget;
    let canRead = true;
    if (target) canRead = target.validFramebuffer;

    if (!canRead) {
      console.warn(
        "Framebuffer is incomplete. Can not read pixels at this time."
      );
      return;
    }

    x = Math.max(0, x);
    y = Math.max(0, y);

    if (target) {
      if (x + width > target.width) width = target.width - x;
      if (y + height > target.height) height = target.height - y;
      const _height = target.height;

      this.gl.readPixels(
        x,
        _height - y - height,
        width,
        height,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        out
      );
    } else {
      const { pixelRatio } = this.state;
      const size = this.getDisplaySize();
      const _height = size[1];

      if (x + width > size[0]) width = size[0] - x;
      if (y + height > size[1]) height = size[1] - y;

      this.gl.readPixels(
        x * pixelRatio,
        (_height - y - height) * pixelRatio,
        width * pixelRatio,
        height * pixelRatio,
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
    const size = this.getDisplaySize();

    canvas.width = size[0] * ratio;
    canvas.height = size[1] * ratio;

    this.state.pixelRatio = ratio;
  }

  /**
   * Sets the region the scissor test will accept as visible. Anything outside the region
   * will be clipped.
   *
   * By default the scissor region is set based on the canvas being rendered into. Include a render target
   * to make the scissor region be applied with the target considered rather than needing pixel density considerations.
   */
  setScissor(
    bounds?: { x: number; y: number; width: number; height: number },
    target?: RenderTarget
  ) {
    if (target) {
      const _height = target.height;

      if (bounds) {
        const { x, y, width, height } = bounds;
        // Apply the viewport in a fashion that is more web dev friendly where top left is 0, 0
        this.glState.setScissor({ x, y: _height - y - height, width, height });
      } else {
        this.glState.setScissor(null);
      }
    } else {
      const { pixelRatio } = this.state;
      const size = this.getDisplaySize();
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
  }

  /**
   * Resizes the render area to the specified amount.
   */
  setSize(width: number, height: number) {
    const { canvas } = this.options;
    const { pixelRatio } = this.state;

    // Set the rendering width and height of the canvas to the screen's resolution for maximum sharpness
    // but it must be limited by the max texture size the hardware supports
    canvas.width = Math.min(width * pixelRatio, WebGLStat.MAX_TEXTURE_SIZE);
    canvas.height = Math.min(height * pixelRatio, WebGLStat.MAX_TEXTURE_SIZE);

    // Scale the canvas to fit the desired width and height
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.state.renderSize = [canvas.width, canvas.height];
    this.state.displaySize = [width, height];
  }

  /**
   * This sets the context to render into the indicated target
   */
  setRenderTarget(target: RenderTarget | null) {
    // Don't need to do anything forsame render targets
    if (this.state.currentRenderTarget === target) return;

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

      // Compile the render target then use if successful
      if (this.glProxy.compileRenderTarget(target)) {
        this.glState.useRenderTarget(target);
      }
    }

    // Set this as the current render target for the renderer
    this.state.currentRenderTarget = target;
  }

  /**
   * Sets the viewport we render into.
   *
   * By default the viewport is set based on the canvas being rendered into. Include a render target
   * to make the viewport be applied with the target considered rather than needing pixel density considerations.
   */
  setViewport(bounds: { x: number; y: number; width: number; height: number }) {
    const target = this.state.currentRenderTarget;
    const { x, y, width, height } = bounds;

    if (target) {
      const _height = target.height;

      // Apply the viewport in a fashion that is more web dev friendly where top left is 0, 0
      this.glState.setViewport(x, _height - y - height, width, height);
    } else {
      const { pixelRatio } = this.state;
      const size = this.getDisplaySize();
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
}
