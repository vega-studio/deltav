import { afterEach } from "bun:test";

import {
  type FixturePage,
  type FixturePageHandle,
  useFixturePage,
} from "../harness/browser.js";
import type { PixelRect, RGBA255 } from "../harness/host-api.js";
import {
  expectColor,
  probe,
  rgba01To255,
} from "../harness/probe.js";
import { CANVAS, CLEAR, type RGBA01 } from "./palette.js";

/** 0–255 bytes of a palette colour. */
export const px = rgba01To255;

/** The clear colour as bytes. */
export const CLEAR_PX = px(CLEAR);

/**
 * A per-file page whose failed cases never leave their fixture or page errors
 * to the next case.
 */
export function use2DPage(): FixturePageHandle {
  const handle = useFixturePage();
  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });
  return handle;
}

/** Props of a 2D layer fixture with one layer named "a" on a 200×200 canvas. */
export function sceneProps(
  instances: unknown[],
  extra: { config?: Record<string, unknown>; views?: unknown[] } = {}
) {
  return {
    ...CANVAS,
    clear: CLEAR,
    views: extra.views,
    layers: [{ name: "a", instances, config: extra.config }],
  };
}

/** Re-renders the mounted fixture with new props (waits two frames). */
export async function update(page: FixturePage, props: unknown) {
  await page.evaluate(
    (p) => window.__deltav!.update(p as Record<string, unknown>),
    props
  );
}

/** Waits `n` frames in the page. */
export async function frames(page: FixturePage, n: number) {
  await page.evaluate((n) => window.__deltav!.waitFrames(n), n);
}

/** Asserts the pixel at (x, y), rounded to the pixel grid, has `expected`. */
export async function expectPixel(
  page: FixturePage,
  [x, y]: [number, number],
  expected: RGBA255,
  tol?: number
) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  expectColor(await probe(page, ix, iy), expected, tol, { x: ix, y: iy });
}

/**
 * Retries an assertion for up to `n` frames, for content that arrives
 * asynchronously after `ready` (atlas images and font glyphs are loaded by
 * resource managers a few frames later). Rethrows the last failure.
 */
export async function eventually(
  page: FixturePage,
  assertion: () => Promise<void>,
  n = 60
) {
  let error: unknown;
  for (let i = 0; i < n; ++i) {
    try {
      await assertion();
      return;
    } catch (e) {
      error = e;
      await frames(page, 1);
    }
  }
  throw error;
}

/**
 * The analytic result of drawing `src` over an opaque `dst` with deltav's
 * shape blending (`SRC_ALPHA, ONE_MINUS_SRC_ALPHA` on all four channels):
 * rgb = src·a + dst·(1−a), alpha = a·a + 1·(1−a). readPixels returns straight
 * alpha, so the colour bytes are the un-premultiplied rgb.
 */
export function blendOver(src: RGBA01, dst: RGBA01): RGBA255 {
  const a = src[3];
  return px([
    src[0] * a + dst[0] * (1 - a),
    src[1] * a + dst[1] * (1 - a),
    src[2] * a + dst[2] * (1 - a),
    a * a + dst[3] * (1 - a),
  ]);
}

/** A point at `distance` from `center` along `angle` (radians, +y down). */
export function polar(
  center: [number, number],
  distance: number,
  angle: number
): [number, number] {
  return [
    center[0] + Math.cos(angle) * distance,
    center[1] + Math.sin(angle) * distance,
  ];
}

/** The square of half-side `h` centred on `c`, as a pixel rect. */
export function squareAround(c: [number, number], h: number): PixelRect {
  return { x: c[0] - h, y: c[1] - h, width: 2 * h, height: 2 * h };
}

/** Counts pixels of a block that differ from `clear` by more than `tol`. */
export function countNonClear(
  data: number[],
  clear: RGBA255,
  tol = 3
): number {
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 4; ++c) {
      if (Math.abs(data[i + c] - clear[c]) > tol) {
        n++;
        break;
      }
    }
  }
  return n;
}
