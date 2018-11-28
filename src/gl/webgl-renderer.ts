import * as twgl from 'twgl.js';

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
}

/**
 * This is the primary file where the rendering and compositing resources and managing
 * gl state happens. A context is provided for the renderer to work with, then it is the
 * renderer's job to ensure state changes as expected and provide as much convenience as necessary
 * to make working with the webgl pipeline as easy as possible.
 */
export class WebGLRenderer {
  options: IWebGLRendererOptions;
  gl: WebGLRenderingContext;

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

  getContext() {
    const gl = twgl.ge;
  }
}
