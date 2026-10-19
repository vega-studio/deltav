import type { Page } from "playwright-core";

import type { PixelBlock, PixelRect, RGBA255 } from "./host-api.js";

/**
 * Node-side pixel probes. Every expected colour handed to these functions must
 * be computed from the scene's geometry, never copied from a run; see
 * docs/overview/testing.md.
 */

/** Default per-channel tolerance, in 0–255 units. */
export const DEFAULT_TOLERANCE = 3;
/** Default inset (region probes) and margin (negative probes), in pixels. */
export const DEFAULT_INSET = 2;

/** Reads a block of canvas pixels (origin top-left). */
export async function readPixels(
  page: Page,
  rect: PixelRect
): Promise<PixelBlock> {
  return page.evaluate(
    ({ x, y, width, height }) =>
      window.__deltav!.readPixels(x, y, width, height),
    rect
  );
}

/** Reads one canvas pixel as [r, g, b, a], each 0–255. */
export async function probe(page: Page, x: number, y: number): Promise<RGBA255> {
  const block = await readPixels(page, { x, y, width: 1, height: 1 });
  return block.data.slice(0, 4) as RGBA255;
}

/** The pixel at (x, y) of a block read with readPixels. */
export function pixelAt(block: PixelBlock, x: number, y: number): RGBA255 {
  const i = (y * block.width + x) * 4;
  return block.data.slice(i, i + 4) as RGBA255;
}

/**
 * Throws when any channel of `actual` differs from `expected` by more than
 * `tol`. The message names the coordinates (when given) and the deltas.
 */
export function expectColor(
  actual: RGBA255,
  expected: RGBA255,
  tol = DEFAULT_TOLERANCE,
  where?: { x: number; y: number }
) {
  const delta = actual.map((v, i) => v - expected[i]);
  if (delta.every((d) => Math.abs(d) <= tol)) return;
  const at = where ? ` at (${where.x}, ${where.y})` : "";
  throw new Error(
    `Pixel${at} is [${actual.join(", ")}], expected [${expected.join(
      ", "
    )}] ±${tol}; delta [${delta.join(", ")}]`
  );
}

/** Sample coordinates on a grid of at most `steps`×`steps` inside a rect. */
function gridSamples(rect: PixelRect, steps: number): [number, number][] {
  const xs = axisSamples(rect.x, rect.width, steps);
  const ys = axisSamples(rect.y, rect.height, steps);
  const out: [number, number][] = [];
  for (const y of ys) for (const x of xs) out.push([x, y]);
  return out;
}

function axisSamples(start: number, size: number, steps: number): number[] {
  const last = start + size - 1;
  if (size <= 0) return [];
  if (size === 1 || steps <= 1) return [Math.floor(start + size / 2)];
  const out = new Set<number>();
  for (let i = 0; i < steps; ++i) {
    out.add(Math.round(start + ((last - start) * i) / (steps - 1)));
  }
  return [...out];
}

/** Integer pixel bounds of a rect: the pixels whose centres lie inside it. */
function pixelBounds(rect: PixelRect) {
  return {
    x0: Math.ceil(rect.x - 0.5),
    y0: Math.ceil(rect.y - 0.5),
    x1: Math.floor(rect.x + rect.width - 0.5),
    y1: Math.floor(rect.y + rect.height - 0.5),
  };
}

/**
 * Asserts that a grid of pixels inside `rect`, shrunk by `inset` on every
 * side, all have the `expected` colour.
 */
export async function expectRegion(
  page: Page,
  rect: PixelRect,
  expected: RGBA255,
  opts: { inset?: number; tol?: number; steps?: number } = {}
) {
  const inset = opts.inset ?? DEFAULT_INSET;
  const { x0, y0, x1, y1 } = pixelBounds(rect);
  const inner: PixelRect = {
    x: x0 + inset,
    y: y0 + inset,
    width: x1 - x0 + 1 - 2 * inset,
    height: y1 - y0 + 1 - 2 * inset,
  };
  if (inner.width <= 0 || inner.height <= 0) {
    throw new Error(
      `expectRegion: rect ${JSON.stringify(rect)} is too small for inset ${inset}`
    );
  }

  const block = await readPixels(page, inner);
  for (const [x, y] of gridSamples(inner, opts.steps ?? 5)) {
    expectColor(
      pixelAt(block, x - inner.x, y - inner.y),
      expected,
      opts.tol,
      { x, y }
    );
  }
}

/**
 * Negative probe: asserts that pixels just outside `rect` (`margin` pixels
 * past each edge, at the start, middle and end of the edge) have the `clear`
 * colour. Points that fall outside the canvas are skipped.
 */
export async function expectOutside(
  page: Page,
  rect: PixelRect,
  clear: RGBA255,
  opts: { margin?: number; tol?: number } = {}
) {
  const margin = opts.margin ?? DEFAULT_INSET;
  const { x0, y0, x1, y1 } = pixelBounds(rect);
  const size = await page.evaluate(() => window.__deltav!.canvasSize());
  const xs = [x0, Math.round((x0 + x1) / 2), x1];
  const ys = [y0, Math.round((y0 + y1) / 2), y1];
  const points: [number, number][] = [];

  for (const x of xs) {
    points.push([x, y0 - 1 - margin], [x, y1 + 1 + margin]);
  }
  for (const y of ys) {
    points.push([x0 - 1 - margin, y], [x1 + 1 + margin, y]);
  }

  let checked = 0;
  for (const [x, y] of points) {
    if (x < 0 || y < 0 || x >= size.width || y >= size.height) continue;
    expectColor(await probe(page, x, y), clear, opts.tol, { x, y });
    checked++;
  }

  if (checked === 0) {
    throw new Error(
      `expectOutside: no probe point of ${JSON.stringify(rect)} lies on the canvas`
    );
  }
}

/** Converts a 0–1 RGBA colour (deltav's colour format) to 0–255 bytes. */
export function rgba01To255(color: ArrayLike<number>): RGBA255 {
  return [0, 1, 2, 3].map((i) =>
    Math.round(Math.min(1, Math.max(0, color[i] ?? 1)) * 255)
  ) as RGBA255;
}

/**
 * Premultiplies a 0–1 RGBA colour by its alpha. deltav creates its context
 * with premultipliedAlpha false by default (webgl-renderer.ts), and readPixels
 * returns straight (un-premultiplied) bytes, so use this only for a fixture
 * that opts into `premultipliedAlpha: true` or blends premultiplied colours.
 */
export function premultiply(color: ArrayLike<number>): [number, number, number, number] {
  const a = color[3] ?? 1;
  return [color[0] * a, color[1] * a, color[2] * a, a];
}

/** Camera state of a 2D view (see docs/2d/view-and-camera.md). */
export interface Camera2DState {
  /** Control2D offset, world units. Default [0, 0]. */
  offset?: [number, number];
  /** Control2D scale. Default [1, 1]. */
  scale?: [number, number];
  /** Top-left of the view's viewport on the canvas, pixels. Default [0, 0]. */
  viewOrigin?: [number, number];
  /** Surface pixel ratio. Default 1 (what TestSurface sets). */
  pixelRatio?: number;
}

/**
 * Maps a world point of a View2D to canvas pixels. View2D puts the origin at
 * the top-left with +y down and 1 world unit = 1 CSS pixel at scale 1, and the
 * camera maps world to view space as (world + offset) * scale.
 */
export function worldToPixel2D(
  world: [number, number],
  camera: Camera2DState = {}
): [number, number] {
  const [ox, oy] = camera.offset ?? [0, 0];
  const [sx, sy] = camera.scale ?? [1, 1];
  const [vx, vy] = camera.viewOrigin ?? [0, 0];
  const pr = camera.pixelRatio ?? 1;
  return [
    (vx + (world[0] + ox) * sx) * pr,
    (vy + (world[1] + oy) * sy) * pr,
  ];
}

/** Maps a world-space rect of a View2D to a canvas pixel rect. */
export function worldRectToPixel2D(
  rect: PixelRect,
  camera: Camera2DState = {}
): PixelRect {
  const [x0, y0] = worldToPixel2D([rect.x, rect.y], camera);
  const [x1, y1] = worldToPixel2D(
    [rect.x + rect.width, rect.y + rect.height],
    camera
  );
  return {
    x: Math.min(x0, x1),
    y: Math.min(y0, y1),
    width: Math.abs(x1 - x0),
    height: Math.abs(y1 - y0),
  };
}
