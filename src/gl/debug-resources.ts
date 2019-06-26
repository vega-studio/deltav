import { Attribute } from "./attribute";
import { Geometry } from "./geometry";
import { GLSettings } from "./gl-settings";
import { Material } from "./material";
import { Model } from "./model";
import { RenderTarget } from "./render-target";
import { Scene } from "./scene";
import { Texture } from "./texture";
import { MaterialUniformType } from "./types";
import { WebGLRenderer } from "./webgl-renderer";

const drawQuadVS = `
  precision highp float;

  uniform vec2 screenSize;
  uniform vec4 bounds;

  attribute vec2 position;
  attribute vec2 texCoord;

  varying vec2 _texCoord;

  void main() {
    vec2 mid = vec2(bounds.x + bounds.z / 2.0, screenSize.y - (bounds.y + bounds.w / 2.0));
    vec2 _half = bounds.zw / 2.0;
    vec2 pos = mid + _half * position;

    pos.x = pos.x / screenSize.x * 2.0 - 1.0;
    pos.y = pos.y / screenSize.y * 2.0 - 1.0;

    _texCoord  = texCoord;
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = 10.0;
  }
`;

const drawQuadFS = `
  precision highp float;

  uniform sampler2D tex;
  varying vec2 _texCoord;

  void main() {
    gl_FragColor = texture2D(tex, _texCoord);
  }
`;

let quadProgram: Material | null = null;
const emptyTexture = new Texture({
  data: {
    width: 2,
    height: 2,
    buffer: null
  }
});

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

/** Model for drawing quads */
let quadModel: Model;
/** The used scene for rendering */
const debugScene = new Scene();
/** Height of each view that is rendered */
const debugViewHeight = 200;
/** This stores deferred debug statements which will be emptied when flushDebug is called */
const debugQueue: [WebGLRenderer, RenderTarget | null, Function, any[]][] = [];

/**
 * Compiles all small elements needed to make debugging resources work.
 */
function compileDebugFragments() {
  if (!quadProgram) {
    quadProgram = new Material({
      fragmentShader: drawQuadFS,
      vertexShader: drawQuadVS,
      culling: GLSettings.Material.CullSide.NONE,
      uniforms: {
        tex: { type: MaterialUniformType.TEXTURE, value: emptyTexture },
        screenSize: { type: MaterialUniformType.VEC2, value: [0, 0] },
        bounds: { type: MaterialUniformType.VEC4, value: [0, 0, 0, 0] }
      }
    });

    quadModel = new Model(quadGeometry, quadProgram);
    quadModel.drawMode = GLSettings.Model.DrawMode.TRIANGLES;
    quadModel.vertexCount = 6;
  }

  debugScene.add(quadModel);

  return true;
}

function makePlaceholder(
  renderer: WebGLRenderer,
  width: number,
  height: number,
  id: string
) {
  const container = getContainer(renderer.options.canvas);
  if (!container.parentElement) return [0, 0, 0, 0];

  let empty = document.getElementById(id);

  if (!empty) {
    const aspect = height / width;
    empty = document.createElement("div");
    empty.style.height = `${debugViewHeight}px`;
    empty.style.width = `${debugViewHeight / aspect}px`;
    empty.style.marginLeft = "4px";
    empty.id = id;
    container.appendChild(empty);
  }

  const parentBox = container.parentElement.getBoundingClientRect();
  const emptyBox = empty.getBoundingClientRect();

  return [
    (emptyBox.left - parentBox.left) * renderer.state.pixelRatio,
    (emptyBox.top - parentBox.top) * renderer.state.pixelRatio,
    emptyBox.width * renderer.state.pixelRatio,
    emptyBox.height * renderer.state.pixelRatio
  ];
}

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
        debugTexture(renderer, colorBuffer, debugId);
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
    debugTexture(renderer, colorBuffer, debugId);
  } else {
    const dataWidth = Math.floor(target.width);
    const dataHeight = Math.floor(target.height);
    const data = new Uint8Array(dataWidth * dataHeight * 4);
    console.log(dataWidth, dataHeight);
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
  id: string,
  defer?: boolean
) {
  if (defer) {
    debugQueue.push([
      renderer,
      renderer.state.currentRenderTarget,
      debugTexture,
      Array.from(arguments).slice(0, -1)
    ]);

    return;
  }

  // Make sure our debugging fragments are compiled so we can draw simple quads for our textures
  if (!texture.data) return false;
  if (!compileDebugFragments()) return false;
  if (!quadProgram) return false;

  // Make a container in the DOM
  const bounds = makePlaceholder(
    renderer,
    texture.data.width,
    texture.data.height,
    id
  );

  // Apply the texture as the texture to be rendered then draw it
  quadProgram.uniforms.tex.value = texture;
  quadProgram.uniforms.screenSize.value = renderer.getRenderSize();
  quadProgram.uniforms.bounds.value = bounds;

  renderer.setRenderTarget(null);
  renderer.setViewport(renderer.getFullViewport());
  renderer.setScissor(renderer.getFullViewport());
  renderer.clear(false, true, false);
  renderer.render(debugScene);

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
