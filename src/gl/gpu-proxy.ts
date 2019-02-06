import { Geometry } from "./geometry";

const debug = require('debug')('performance');

/**
 * This is where all objects go to be processed and updated with webgl calls. Such as textures, geometries, etc
 */
export class GPUProxy {
  gl: WebGLRenderingContext;

  /**
   * This enables the desired and supported extensions this framework utilizes.
   */
  private addExtensions(gl: WebGLRenderingContext) {
    const hasInstancing = gl.getExtension("ANGLE_instanced_arrays");
    if (!hasInstancing) {
      debug('This device does not have hardware instancing. All buffering strategies will be utilizing compatibility modes.');
    }
  }

  /**
   * Retrieves the gl context from the canvas
   */
  getContext(canvas: HTMLCanvasElement, options: {}) {
    const names = ["webgl", "experimental-webgl"];
    let context: WebGLRenderingContext | null = null;

    names.some(name => {
      const ctx = canvas.getContext(name, options);

      if (ctx && ctx instanceof WebGLRenderingContext) {
        context = ctx;
        this.gl = context;
        this.addExtensions(context);

        return true;
      }

      return false;
    });

    return context;
  }

  /**
   * Takes a geometry object and ensures all of it's buffers are generated
   */
  compileGeometry(_geometry: Geometry) {
    // TODO
  }
}
