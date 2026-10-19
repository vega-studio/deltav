import React from "react";

import {
  Camera2D,
  ClearFlags,
  GLSettings,
  type TextureOptions,
} from "../../../ui/src/index.js";

/** 0–1 RGBA colour. */
export type RGBA01 = [number, number, number, number];

/** An axis-aligned rect in canvas pixels, origin top-left, +y down. */
export interface IPixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A rect filled with one colour. */
export interface IColorRect extends IPixelRect {
  color: RGBA01;
}

/** The config of an identity-camera View2D clearing to `clear`. */
export function useViewConfig(clear: RGBA01) {
  const camera = React.useRef(new Camera2D());
  return {
    camera: camera.current,
    background: clear,
    clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
  };
}

/**
 * Settings of a plain RGBA8 render texture: no mipmaps (an unfilled mip chain
 * samples as black), the given filter on both min and mag, clamped edges.
 */
export function rgbaTextureSettings(
  filter: "nearest" | "linear" = "nearest"
): TextureOptions {
  return {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA,
    minFilter:
      filter === "nearest"
        ? GLSettings.Texture.TextureMinFilter.Nearest
        : GLSettings.Texture.TextureMinFilter.Linear,
    magFilter:
      filter === "nearest"
        ? GLSettings.Texture.TextureMagFilter.Nearest
        : GLSettings.Texture.TextureMagFilter.Linear,
    wrapHorizontal: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
    wrapVertical: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
  };
}

function glslFloat(n: number) {
  return Number.isInteger(n) ? `${n}.0` : `${n}`;
}

function glslVec4(c: RGBA01) {
  return `vec4(${c.map(glslFloat).join(", ")})`;
}

/**
 * GLSL of a post-process fragment shader that fills `rects` (later ones on
 * top) over `background`, in top-left pixel coordinates of the pass's target.
 * A pixel is inside a rect when its centre is. `out` names the fragment
 * output; `prefix` keeps the locals of several MRT output sources (whose mains
 * deltav merges into one) apart; `imports: false` leaves out the
 * `${import: camera}` line that gives `viewSize`, for every source but the
 * first.
 */
export function rectsShader(
  rects: IColorRect[],
  background: RGBA01,
  opts: { out?: string; prefix?: string; imports?: boolean } = {}
) {
  const { out = "color", prefix = "", imports = true } = opts;
  const p = `${prefix}p`;
  const c = `${prefix}c`;
  const tests = rects
    .map(
      (r) => `
      if (${p}.x >= ${glslFloat(r.x)} && ${p}.x < ${glslFloat(r.x + r.width)} &&
          ${p}.y >= ${glslFloat(r.y)} && ${p}.y < ${glslFloat(
            r.y + r.height
          )}) {
        ${c} = ${glslVec4(r.color)};
      }`
    )
    .join("\n");

  return `
    ${imports ? "$" + "{import: camera}" : ""}

    void main() {
      // Top-left pixel coordinates of this fragment's centre.
      vec2 ${p} = vec2(gl_FragCoord.x, viewSize.y - gl_FragCoord.y);
      vec4 ${c} = ${glslVec4(background)};
      ${tests}
      $\{out: ${out}} = ${c};
    }
  `;
}

/**
 * A canvas of `width`×`height` split into four quadrants: top-left, top-right,
 * bottom-left, bottom-right colours in that order.
 */
export function quadrantCanvas(
  colors: [RGBA01, RGBA01, RGBA01, RGBA01],
  width: number,
  height: number
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const hw = width / 2;
  const hh = height / 2;
  const boxes = [
    [0, 0],
    [hw, 0],
    [0, hh],
    [hw, hh],
  ];
  boxes.forEach(([x, y], i) => {
    const [r, g, b, a] = colors[i].map((c) => Math.round(c * 255));
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    ctx.fillRect(x, y, hw, hh);
  });
  return canvas;
}

/** A canvas filled with one colour. */
export function solidCanvas(color: RGBA01, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const [r, g, b, a] = color.map((c) => Math.round(c * 255));
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  ctx.fillRect(0, 0, width, height);
  return canvas;
}
