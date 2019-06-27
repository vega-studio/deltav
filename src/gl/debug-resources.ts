import { Attribute } from "./attribute";
import { Geometry } from "./geometry";
import { RenderTarget } from "./render-target";
import { Texture } from "./texture";
import { WebGLRenderer } from "./webgl-renderer";

const positionData = new Float32Array([
  // Top tri
  -1,
  -1,
  1,
  -1,
  -1,
  1,

  // Bottom tri
  1,
  -1,
  1,
  1,
  -1,
  1
]);

const texCoordData = new Float32Array([0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1]);

/**
 * Generate the geometry needed for rendering a quad
 */
const quadGeometry = new Geometry();
const position = new Attribute(positionData, 2, false, false);
const texCoord = new Attribute(texCoordData, 2, false, false);
quadGeometry.addAttribute("position", position);
quadGeometry.addAttribute("texCoord", texCoord);

/** Height of each view that is rendered */
const debugViewHeight = 200;
/** This stores deferred debug statements which will be emptied when flushDebug is called */
const debugQueue: [WebGLRenderer, RenderTarget | null, Function, any[]][] = [];

function getContainer(context: HTMLCanvasElement) {
  let container = document.getElementById(`__debug_read_pixels__`);

  if (!container) {
    container = document.createElement("div");
    if (!context.parentElement) return container;

    const parent = context.parentElement;
    parent.appendChild(container);
    parent.style.position = "relative";
    parent.style.width = context.style.width;
    parent.style.height = context.style.height;
    context.style.position = "absolute";
    context.style.left = "0px";
    context.style.right = "0px";
    container.id = `__debug_read_pixels__`;
    container.style.background = "rgba(64, 64, 64, 0.0)";
    container.style.border = "1px solid #FFFFFF";
    container.style.padding = "4px";
    container.style.position = "absolute";
    container.style.right = `10px`;
    container.style.bottom = "10px";
    container.style.zIndex = "10";
  }

  return container;
}

/**
 * This makes the contents of the render target appear in the bottom right of the screen.
 * This will only show the color buffer. If there are texture render targets, then you will
 * have to debug those separately.
 */
export function debugRenderTarget(
  renderer: WebGLRenderer,
  target: RenderTarget,
  defer?: boolean
) {
  if (defer) {
    debugQueue.push([
      renderer,
      renderer.state.currentRenderTarget,
      debugRenderTarget,
      Array.from(arguments).slice(0, -1)
    ]);

    return;
  }

  if (!renderer.glState.useRenderTarget(target)) return;

  const debugId = `__debug_read_pixels__${target.uid}`;
  let colorBuffer;

  if (Array.isArray(target.buffers.color)) {
    let foundTexture = false;

    target.buffers.color.forEach(colorBuffer => {
      if (colorBuffer instanceof Texture) {
        debugTexture(renderer, colorBuffer, 400);
        foundTexture = true;
      }
    });

    if (foundTexture) {
      return;
    }
  } else {
    colorBuffer = target.buffers.color;
  }

  if (colorBuffer instanceof Texture) {
    debugTexture(renderer, colorBuffer, 400);
  } else {
    const dataWidth = Math.floor(target.width);
    const dataHeight = Math.floor(target.height);
    const data = new Uint8Array(dataWidth * dataHeight * 4);
    renderer.readPixels(0, 0, dataWidth, dataHeight, data);
    renderer.setRenderTarget(null);
    renderer.clear(false, true);
    debugReadPixels(renderer, data, target.width, target.height, debugId);
  }
}

/**
 * Makes a texture viewable in the bottom right of the screen.
 */
export function debugTexture(
  renderer: WebGLRenderer,
  texture: Texture,
  maxSize: number
) {
  if (!texture.data) return;

  const debugFBO = new RenderTarget({
    buffers: {
      color: texture
    }
  });

  const scale = Math.min(
    1,
    maxSize / Math.max(texture.data.width, texture.data.height)
  );

  const view = new Uint8Array(texture.data.width * texture.data.height * 4);
  renderer.setRenderTarget(debugFBO);
  renderer.readPixels(0, 0, texture.data.width, texture.data.height, view);
  const canvas = document.createElement("canvas");
  canvas.width = texture.data.width;
  canvas.height = texture.data.height;
  canvas.style.position = "fixed";
  canvas.style.right = "10px";
  canvas.style.bottom = "10px";
  canvas.style.zIndex = `${Number.MAX_SAFE_INTEGER}`;
  canvas.style.width = `${texture.data.width * scale}px`;
  canvas.style.height = `${texture.data.height * scale}px`;
  canvas.style.background = "magenta";
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const clamped = new Uint8ClampedArray(view);
    ctx.putImageData(
      new ImageData(clamped, texture.data.width, texture.data.height),
      0,
      0
    );
  }

  document.getElementsByTagName("body")[0].appendChild(canvas);

  return true;
}

/**
 * Makes a chunk of readPixel data viewable in the bottom right of the screen.
 */
export function debugReadPixels(
  renderer: WebGLRenderer,
  data: Uint8Array,
  width: number,
  height: number,
  debugId: string,
  defer?: boolean
) {
  if (defer) {
    debugQueue.push([
      renderer,
      renderer.state.currentRenderTarget,
      debugReadPixels,
      Array.from(arguments).slice(0, -1)
    ]);

    return;
  }

  const container = getContainer(renderer.options.canvas);
  const element: HTMLElement | null = document.getElementById(debugId);
  let canvas: HTMLCanvasElement | undefined;

  if (element && element instanceof HTMLCanvasElement) {
    canvas = element;
  }

  if (!canvas) {
    const aspect = height / width;
    canvas = document.createElement("canvas") as HTMLCanvasElement;
    container.appendChild(canvas);
    canvas.style.height = `${debugViewHeight}px`;
    canvas.height = height;
    canvas.width = width;
    canvas.style.width = `${debugViewHeight / aspect}px`;
    canvas.style.marginLeft = "4px";
    canvas.id = debugId;
  }

  const imageData = new ImageData(Uint8ClampedArray.from(data), width, height);

  // Make a temp canvas to fully render the data retrieved, then we'll render
  // it down to the display debug canvas for the screen.
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.putImageData(imageData, 0, 0);
  }
}

/**
 * This dequeues all debug operations
 */
export function flushDebug() {
  debugQueue.forEach(debug => {
    debug[0].setRenderTarget(debug[1]);
    debug[2].apply(null, debug[3]);
  });

  debugQueue.splice(0);
}
